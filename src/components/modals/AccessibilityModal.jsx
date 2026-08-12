import React from 'react';
import { X, Type, Eye, Palette, Sun, Moon } from 'lucide-react';

const AccessibilityModal = ({ isOpen, onClose, config, setConfig }) => {
  if (!isOpen) return null;

  const handleToggleDyslexia = () => {
    setConfig(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        dyslexiaMode: !prev.accessibility.dyslexiaMode
      }
    }));
  };

  const handleFontSizeChange = (e) => {
    setConfig(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        fontSizeScale: parseFloat(e.target.value)
      }
    }));
  };

  const handleColorblindChange = (e) => {
    setConfig(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        colorblindMode: e.target.value
      }
    }));
  };

  const handleThemeModeChange = (mode) => {
    const isLight = mode === 'light';
    const newTheme = isLight ? {
      backgroundColor: "#ffffff",
      panelColor: "#f4f4f5",
      textColor: "#09090b",
      primaryColor: "#000000",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      borderRadius: "6px"
    } : {
      backgroundColor: "#000000",
      panelColor: "#0d0d0d",
      textColor: "#ffffff",
      primaryColor: "#ffffff",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      borderRadius: "6px"
    };

    setConfig(prev => ({
      ...prev,
      theme: newTheme,
      accessibility: {
        ...prev.accessibility,
        themeMode: mode
      }
    }));
  };

  const accConfig = config.accessibility || { dyslexiaMode: false, fontSizeScale: 1, colorblindMode: "none", themeMode: "dark" };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--panel-color)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-color)',
        padding: '2rem',
        borderRadius: 'var(--border-radius)',
        width: '450px',
        maxWidth: '90%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
            <Eye size={22} />
            Accesibilidad
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Theme Mode (Light / Dark) */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--card-header-bg)', border: '1px solid var(--subborder-color)', borderRadius: '6px' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>
                {accConfig.themeMode === 'light' ? <Sun size={18} /> : <Moon size={18} />}
                Tema Visual (Claro / Oscuro)
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.25rem' }}>
                Cambia el esquema de color del panel
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleThemeModeChange('dark')}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  backgroundColor: accConfig.themeMode !== 'light' ? 'var(--btn-bg)' : 'transparent',
                  color: accConfig.themeMode !== 'light' ? 'var(--btn-text)' : 'var(--text-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Moon size={15} /> Oscuro
              </button>
              <button
                onClick={() => handleThemeModeChange('light')}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  backgroundColor: accConfig.themeMode === 'light' ? 'var(--btn-bg)' : 'transparent',
                  color: accConfig.themeMode === 'light' ? 'var(--btn-text)' : 'var(--text-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Sun size={15} /> Claro
              </button>
            </div>
          </div>

          {/* Dyslexia Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--card-header-bg)', border: '1px solid var(--subborder-color)', borderRadius: '6px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>
                <Type size={18} />
                Modo Dislexia
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.25rem' }}>
                Cambia la fuente a una más legible
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={accConfig.dyslexiaMode} 
                onChange={handleToggleDyslexia} 
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--text-color)' }} 
              />
            </label>
          </div>

          {/* Font Size */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--card-header-bg)', border: '1px solid var(--subborder-color)', borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              <Type size={18} />
              Tamaño de Letra ({accConfig.fontSizeScale}x)
            </div>
            <input 
              type="range" 
              min="0.8" 
              max="1.5" 
              step="0.1"
              value={accConfig.fontSizeScale} 
              onChange={handleFontSizeChange} 
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--text-color)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.6, marginTop: '0.35rem' }}>
              <span>Pequeña</span>
              <span>Normal</span>
              <span>Grande</span>
            </div>
          </div>

          {/* Colorblindness */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--card-header-bg)', border: '1px solid var(--subborder-color)', borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              <Palette size={18} />
              Filtro de Daltonismo
            </div>
            <select 
              value={accConfig.colorblindMode} 
              onChange={handleColorblindChange}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              <option value="none">Ninguno (Normal)</option>
              <option value="protanopia">Protanopía (Rojo-Verde)</option>
              <option value="deuteranopia">Deuteranopía (Verde-Rojo)</option>
              <option value="tritanopia">Tritanopía (Azul-Amarillo)</option>
              <option value="achromatopsia">Acromatopsia (Escala de grises)</option>
            </select>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AccessibilityModal;
