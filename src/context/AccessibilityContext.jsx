import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import configMaster from '../config/config_master.json';

const AccessibilityContext = createContext(null);

export const defaultDark = {
  backgroundColor: "#0c0e14",
  panelColor: "#161922",
  headerColor: "#10121a",
  subnavColor: "#141720",
  cardHeaderColor: "#1e222f",
  textColor: "#f1f5f9",
  primaryColor: "#3b82f6",
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  borderRadius: "6px"
};

export const defaultLight = {
  backgroundColor: "#f1f5f9",
  panelColor: "#ffffff",
  headerColor: "#ffffff",
  subnavColor: "#e2e8f0",
  cardHeaderColor: "#f8fafc",
  textColor: "#0f172a",
  primaryColor: "#3b82f6",
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  borderRadius: "6px"
};

export const getThemeCssVars = (theme, accessibility) => {
  const isLight = accessibility?.themeMode === 'light';
  const t = theme || (isLight ? defaultLight : defaultDark);

  return {
    '--bg-color': t.backgroundColor || (isLight ? '#f1f5f9' : '#0c0e14'),
    '--panel-color': t.panelColor || (isLight ? '#ffffff' : '#161922'),
    '--card-header-bg': t.cardHeaderColor || (isLight ? '#f8fafc' : '#1e222f'),
    '--header-bg': t.headerColor || (isLight ? '#ffffff' : '#10121a'),
    '--subnav-bg': t.subnavColor || (isLight ? '#e2e8f0' : '#141720'),
    '--text-color': t.textColor || (isLight ? '#0f172a' : '#f1f5f9'),
    '--muted-text': isLight ? '#64748b' : '#94a3b8',
    '--border-color': isLight ? '#e2e8f0' : '#2b3042',
    '--subborder-color': isLight ? '#cbd5e1' : '#222636',
    '--btn-bg': t.primaryColor || '#3b82f6',
    '--btn-text': '#ffffff',
    '--grid-line': isLight ? '#cbd5e1' : '#1c202d',
    '--timer-display-bg': isLight ? '#f8fafc' : '#08090d',
    '--timer-display-border': isLight ? '#cbd5e1' : '#2b3042',
    '--timer-display-shadow': isLight ? '0 4px 16px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.5)',
    '--timer-digits-shadow': isLight ? 'none' : '0 4px 20px rgba(0,0,0,0.7)',
    '--timer-orange-bg': isLight ? '#fff7ed' : '#431407',
    '--timer-orange-color': isLight ? '#ea580c' : '#f97316',
    '--timer-orange-border': '#f97316',
    '--timer-negative-bg': isLight ? '#fef2f2' : '#3f0c0c',
    '--timer-negative-color': isLight ? '#dc2626' : '#ef4444',
    '--timer-negative-border': '#ef4444',
    '--border-radius': t.borderRadius || '6px',
    '--scrollbar-thumb': isLight ? 'rgba(100, 116, 139, 0.35)' : 'rgba(148, 163, 184, 0.25)',
    '--scrollbar-thumb-hover': isLight ? 'rgba(100, 116, 139, 0.6)' : 'rgba(148, 163, 184, 0.55)',
    '--slider-track-bg': isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    '--slider-track-hover': isLight ? 'rgba(0, 0, 0, 0.14)' : 'rgba(255, 255, 255, 0.15)',
    '--font-family': accessibility?.dyslexiaMode 
      ? "'OpenDyslexic', 'Atkinson Hyperlegible', 'Lexend', 'Comic Sans MS', sans-serif"
      : (t.fontFamily || 'Inter, system-ui, -apple-system, sans-serif')
  };
};

export const AccessibilityProvider = ({ children }) => {
  // Cargar configuración desde localStorage si existe, o usar configMaster por defecto
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('open2mun_config') || localStorage.getItem('openmun_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.layouts) {
          if (parsed.layouts.LAB !== undefined && parsed.layouts.LIBRE === undefined) {
            delete parsed.layouts.LAB;
            parsed.layouts.LIBRE = [];
          }
        }
        return parsed;
      }
    } catch (err) {
      console.error('Error al leer config de localStorage:', err);
    }
    return configMaster;
  });

  const [isAccessOpen, setIsAccessOpen] = useState(false);

  const acc = config.accessibility || { dyslexiaMode: false, fontSizeScale: 1, colorblindMode: 'none', themeMode: 'dark' };
  const isLight = acc.themeMode === 'light';

  // Alternar entre modo claro y oscuro
  const toggleThemeMode = useCallback(() => {
    const nextMode = isLight ? 'dark' : 'light';
    const newTheme = nextMode === 'light' ? { ...defaultLight } : { ...defaultDark };

    setConfig(prev => ({
      ...prev,
      theme: newTheme,
      accessibility: {
        ...prev.accessibility,
        themeMode: nextMode
      }
    }));
  }, [isLight]);

  // Aplicar variables CSS, filtro de daltonismo, modo dislexia y tamaño de fuente al elemento raíz
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;
    const currentAcc = config?.accessibility || { dyslexiaMode: false, fontSizeScale: 1, colorblindMode: 'none', themeMode: 'dark' };
    const currentTheme = config?.theme;
    const isNowLight = currentAcc.themeMode === 'light';

    // 1. Establecer variables CSS del tema en :root
    const vars = getThemeCssVars(currentTheme, currentAcc);
    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    // 2. Escalado proporcional de tamaño de letra en :root (html)
    // Al escalar font-size en el root element, TODOS los 'rem' de la aplicación escalan proporcionalmente
    const scale = currentAcc.fontSizeScale || 1;
    root.style.fontSize = `${scale * 100}%`;

    // 3. Modo Dislexia
    const isDyslexia = !!currentAcc.dyslexiaMode;
    body.classList.toggle('dyslexia-mode', isDyslexia);
    root.classList.toggle('dyslexia-mode', isDyslexia);

    // 4. Filtro de Daltonismo
    let filterString = 'none';
    if (currentAcc.colorblindMode === 'protanopia') filterString = 'contrast(90%) hue-rotate(15deg)';
    if (currentAcc.colorblindMode === 'deuteranopia') filterString = 'contrast(90%) hue-rotate(-15deg)';
    if (currentAcc.colorblindMode === 'tritanopia') filterString = 'sepia(50%) hue-rotate(180deg)';
    if (currentAcc.colorblindMode === 'achromatopsia') filterString = 'grayscale(100%)';
    root.style.filter = filterString;

    // 5. Guardar en localStorage y emitir evento para sincronización entre ventanas
    try {
      localStorage.setItem('open2mun_config', JSON.stringify(config));
    } catch (err) {
      console.error('Error guardando config en localStorage:', err);
    }

    window.dispatchEvent(new CustomEvent('open2mun_config_updated', { detail: config }));
    window.dispatchEvent(new CustomEvent('openmun_config_updated', { detail: config }));
  }, [config]);

  // Escuchar cambios de almacenamiento y eventos custom para sincronizar entre pestañas/ventanas abiertas
  useEffect(() => {
    const handleStorage = (e) => {
      if ((e.key === 'open2mun_config' || e.key === 'openmun_config') && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed) {
            setConfig(prev => ({
              ...prev,
              ...parsed
            }));
          }
        } catch (err) {
          console.error('Error parseando config de storage:', err);
        }
      }
    };

    const handleConfigUpdated = (e) => {
      if (e.detail) {
        setConfig(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(e.detail)) {
            return e.detail;
          }
          return prev;
        });
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('openmun_config_updated', handleConfigUpdated);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('openmun_config_updated', handleConfigUpdated);
    };
  }, []);

  const openAccessibilityModal = useCallback(() => setIsAccessOpen(true), []);
  const closeAccessibilityModal = useCallback(() => setIsAccessOpen(false), []);

  return (
    <AccessibilityContext.Provider
      value={{
        config,
        setConfig,
        accessibility: acc,
        theme: config.theme || (isLight ? defaultLight : defaultDark),
        isLight,
        toggleThemeMode,
        isAccessOpen,
        setIsAccessOpen,
        openAccessibilityModal,
        closeAccessibilityModal
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility debe ser usado dentro de un AccessibilityProvider');
  }
  return context;
};
