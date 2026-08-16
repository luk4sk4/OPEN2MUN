import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Settings,
  Eye,
  Menu,
  X,
  GripVertical,
  Download,
  Upload,
  Maximize2,
  Minimize2,
  Move,
  Maximize,
  Sun,
  Moon,
  Home,
  ChevronRight,
  Radio,
  MessageSquare,
  Mic,
  Timer,
  Vote,
  BarChart2,
  LayoutGrid,
  Landmark,
  Scroll
} from 'lucide-react';
import configMaster from '../config/config_master.json';
import WidgetRegistry from '../components/widgets/WidgetRegistry';
import AccessibilityModal from '../components/modals/AccessibilityModal';
import LiveSessionModal from '../components/modals/LiveSessionModal';
import WidgetSidebar, { WIDGET_METADATA } from '../components/panels/WidgetSidebar';
import OpenMunLogo from '../components/common/OpenMunLogo';
import PermanentCrisisBanner from '../components/common/PermanentCrisisBanner';
import HomePage from '../components/pages/HomePage';
import { useSession } from '../context/SessionContext';
import { useP2P } from '../context/P2PContext';
import { useAccessibility } from '../context/AccessibilityContext';

// ─── Grid constants ────────────────────────────────────────────────────────────
const COLS = 12;
const MIN_ROWS = 8;
const ROW_HEIGHT = 105; // px height per row cell
const GAP = 12;         // px gap between grid cells

function getCellSize(containerWidth) {
  const totalGap = GAP * (COLS + 1);
  const cellW = Math.max(20, (containerWidth - totalGap) / COLS);
  const cellH = ROW_HEIGHT;
  return { cellW, cellH };
}

// ─── Configuración de pestañas con iconos SVG ────────────────────────────────
const TAB_CONFIG = {
  HOME: { label: 'Inicio', Icon: Home },
  COMIENZO: { label: 'Comienzo', Icon: Settings },
  GSL: { label: 'GSL', Icon: Mic },
  DEBATE: { label: 'Debate', Icon: Timer },
  VOTING: { label: 'Voting', Icon: Vote },
  INFO: { label: 'Info', Icon: BarChart2 },
  LIBRE: { label: 'Libre', Icon: LayoutGrid },
};

const FullscreenMenu = ({ activeTab, setActiveTab, tabs, toggleMaximize, isLight, nombreComite }) => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const startClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  const cancelClose = () => {
    clearTimeout(closeTimer.current);
  };

  const ActiveIcon = TAB_CONFIG[activeTab]?.Icon || Home;

  return (
    <div
      style={{
        position: 'fixed',
        top: '12px',
        right: '16px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.4rem',
        pointerEvents: 'none'  // el contenedor nunca intercepta eventos
      }}
    >
      {/* Botón principal — único activador del hover */}
      <div
        onMouseEnter={() => { cancelClose(); setOpen(true); }}
        onMouseLeave={startClose}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(15,15,18,0.95)',
          border: `1px solid ${open ? 'var(--btn-bg)' : (isLight ? '#e2e8f0' : '#27272a')}`,
          borderRadius: '8px',
          padding: '0.4rem 0.65rem',
          boxShadow: '0 8px 25px rgba(0,0,0,0.45)',
          cursor: 'default',
          transition: 'border-color 0.2s ease',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'auto'  // solo la pastilla captura eventos
        }}>
        <Minimize2 size={15} color={isLight ? '#0f172a' : '#ffffff'} />
        <ActiveIcon size={14} color={isLight ? '#0f172a' : '#ffffff'} />
        <span style={{
          fontSize: '0.72rem',
          fontWeight: '700',
          color: isLight ? '#0f172a' : '#ffffff',
          transition: 'color 0.2s ease'
        }}>
          {TAB_CONFIG[activeTab]?.label || activeTab}
        </span>
        <ChevronRight
          size={13}
          color={isLight ? '#64748b' : '#71717a'}
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
        />
      </div>

      {/* Panel desplegable */}
      <div
        onMouseEnter={cancelClose}
        onMouseLeave={startClose}
        style={{
          backgroundColor: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(15,15,18,0.97)',
          border: `1px solid ${isLight ? '#cbd5e1' : '#3f3f46'}`,
          borderRadius: '10px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(12px)',
          overflow: 'hidden',
          minWidth: '180px',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
          pointerEvents: open ? 'auto' : 'none'
        }}>
        {/* Nombre del comité */}
        {nombreComite && (
          <div style={{
            padding: '0.55rem 0.85rem',
            borderBottom: `1px solid ${isLight ? '#e2e8f0' : '#27272a'}`,
            fontSize: '0.7rem',
            fontWeight: '800',
            color: 'var(--text-color)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <Landmark size={13} />
            <span>{nombreComite}</span>
          </div>
        )}

        {/* Tabs */}
        <div style={{ padding: '0.35rem' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab;
            const TabIcon = TAB_CONFIG[tab]?.Icon || Home;
            const tabLabel = TAB_CONFIG[tab]?.label || tab;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--btn-bg)' : 'transparent',
                  color: isActive ? 'var(--btn-text)' : (isLight ? '#0f172a' : '#ffffff'),
                  fontWeight: isActive ? '800' : '500',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.12s ease'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = isLight ? '#f1f5f9' : '#18181b'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <TabIcon size={14} />
                <span>{tabLabel}</span>
                {isActive && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', opacity: 0.7 }}>◀ actual</span>}
              </button>
            );
          })}
        </div>

        {/* Divider + Salir de pantalla completa */}
        <div style={{ borderTop: `1px solid ${isLight ? '#e2e8f0' : '#27272a'}`, padding: '0.35rem' }}>
          <button
            onClick={() => { toggleMaximize(); setOpen(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.45rem 0.65rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#ef4444',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.12s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Minimize2 size={14} />
            Salir de pantalla completa
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const {
    descargarSesionJSON,
    cargarSesionJSON,
    agendaSesion,
    nombreComite,
    paises,
    oradoresCola,
    oradoresCaucus,
    caucusActivo,
    votacionSesion,
    relojGSLState,
    mociones,
    historicoMociones,
    registroIntervenciones,
    agregarOrador,
    agregarOradorCaucus,
    agregarMocion,
    registrarVotoPais,
    ejecutarAccion,
    aplicarEstadoExterno
  } = useSession();

  const {
    openLiveModal,
    isLiveModalOpen,
    closeLiveModal,
    connectionStatus,
    connectedPeers,
    speakingRequests,
    broadcastCurrentState,
    registerSessionHandlers,
    roomSettings,
    setViewMode
  } = useP2P();

  // Registrar handlers de sesión para solicitudes P2P automáticas, acciones remotas y sincronización
  useEffect(() => {
    registerSessionHandlers({
      onAddSpeakerGSL: (pais) => agregarOrador(pais),
      onAddSpeakerCaucus: (pais) => agregarOradorCaucus(pais),
      onAddMotion: (mocion) => agregarMocion(mocion),
      onCastVote: (country, vote) => registrarVotoPais(country, vote),
      onSessionAction: (accion, payload) => ejecutarAccion(accion, payload),
      onSyncState: (state) => aplicarEstadoExterno(state)
    });
  }, [registerSessionHandlers, agregarOrador, agregarOradorCaucus, agregarMocion, registrarVotoPais, ejecutarAccion, aplicarEstadoExterno]);

  // Sincronizar estado automáticamente a todos los peers conectados si el Chair está emitiendo
  useEffect(() => {
    broadcastCurrentState({
      comision: nombreComite || 'Asamblea General - openMUN',
      paises,
      oradoresCola,
      oradoresCaucus,
      registroIntervenciones,
      mociones,
      historicoMociones,
      caucusActivo,
      agendaSesion,
      nombreComite,
      votacionSesion,
      relojGSLState,
      roomSettings,
      speakingRequests
    });
  }, [broadcastCurrentState, paises, oradoresCola, oradoresCaucus, registroIntervenciones, mociones, historicoMociones, caucusActivo, agendaSesion, nombreComite, votacionSesion, relojGSLState, roomSettings, speakingRequests]);

  // Configuración global y accesibilidad desde el contexto
  const {
    config,
    setConfig,
    isLight,
    toggleThemeMode,
    isAccessOpen,
    setIsAccessOpen
  } = useAccessibility();

  const [activeTab, setActiveTab] = useState('HOME');
  const [focusedWidgetId, setFocusedWidgetId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Referencia mutable siempre actualizada para el activeTab actual
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const boardResizeObserverRef = useRef(null);
  const boardNodeRef = useRef(null); // referencia al nodo DOM del tablero
  const fileInputRef = useRef(null);
  const [boardW, setBoardW] = useState(0);

  // Callback ref: se ejecuta cada vez que el div del tablero se monta o desmonta
  const boardRef = useCallback((node) => {
    // Desconectar el observer anterior si existe
    if (boardResizeObserverRef.current) {
      boardResizeObserverRef.current.disconnect();
      boardResizeObserverRef.current = null;
    }
    boardNodeRef.current = node;
    if (node) {
      // Medir inmediatamente
      setBoardW(node.offsetWidth);
      // Observar cambios de tamaño
      const observer = new ResizeObserver(() => {
        setBoardW(node.offsetWidth);
      });
      observer.observe(node);
      boardResizeObserverRef.current = observer;
    } else {
      setBoardW(0);
    }
  }, []);

  // Referencias para interacciones activas de Drag y Resize
  const activeInteractionRef = useRef(null);
  const [activeInteraction, setActiveInteraction] = useState(null);

  // Pantalla Completa / Maximizar
  const toggleMaximize = useCallback(() => {
    setIsMaximized(prev => {
      const next = !prev;
      if (next) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => { });
        }
      } else {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => { });
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleMaximize();
      }
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsMaximized(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [toggleMaximize]);

  // El ancho del tablero se gestiona a través del callback ref (boardRef)

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const ok = cargarSesionJSON(parsed, (newConfig) => {
          if (newConfig) {
            setConfig(newConfig);
          }
        });
        if (ok) {
          const cfg = parsed.config || parsed.openmun_config || (parsed.localStorageSnapshot && parsed.localStorageSnapshot.openmun_config);
          if (cfg) {
            try {
              const parsedCfg = typeof cfg === 'string' ? JSON.parse(cfg) : cfg;
              setConfig(parsedCfg);
            } catch (err) {
              console.error('Error parseando config importada:', err);
            }
          }
          alert('¡Sesión activa y todos los datos importados exitosamente!');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const tabs = ['HOME', 'COMIENZO', 'GSL', 'DEBATE', 'VOTING', 'INFO', 'LIBRE'];
  const widgets = config.layouts[activeTab] || [];

  // Actualizador seguro para la pestaña activa sin stale closures
  const updateActiveLayout = useCallback((updater) => {
    const currentTab = activeTabRef.current;
    setConfig(prev => {
      const currentWidgets = prev.layouts[currentTab] || [];
      const newWidgets = typeof updater === 'function' ? updater(currentWidgets) : updater;
      return {
        ...prev,
        layouts: {
          ...prev.layouts,
          [currentTab]: newWidgets
        }
      };
    });
  }, []);

  // ─── LÓGICA DE DRAG & RESIZE Y ELEVACIÓN DE Z-INDEX ───

  const handleStartDrag = (e, widgetId) => {
    e.preventDefault();
    e.stopPropagation();
    setFocusedWidgetId(widgetId);
    const currentLayout = config.layouts[activeTabRef.current] || [];
    const targetWidget = currentLayout.find(w => w.i === widgetId);
    if (!targetWidget) return;

    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

    const dragData = {
      type: 'drag',
      widgetId,
      startX: clientX,
      startY: clientY,
      startCol: targetWidget.col,
      startRow: targetWidget.row,
      colSpan: targetWidget.colSpan,
      rowSpan: targetWidget.rowSpan
    };

    activeInteractionRef.current = dragData;
    setActiveInteraction(dragData);
  };

  const handleStartResize = (e, widgetId) => {
    e.preventDefault();
    e.stopPropagation();
    setFocusedWidgetId(widgetId);
    const currentLayout = config.layouts[activeTabRef.current] || [];
    const targetWidget = currentLayout.find(w => w.i === widgetId);
    if (!targetWidget) return;

    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

    const resizeData = {
      type: 'resize',
      widgetId,
      startX: clientX,
      startY: clientY,
      startCol: targetWidget.col,
      startRow: targetWidget.row,
      startColSpan: targetWidget.colSpan,
      startRowSpan: targetWidget.rowSpan
    };

    activeInteractionRef.current = resizeData;
    setActiveInteraction(resizeData);
  };

  const handlePointerMove = useCallback((e) => {
    const active = activeInteractionRef.current;
    if (!active || !boardNodeRef.current || boardW === 0) return;

    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

    const dx = clientX - active.startX;
    const dy = clientY - active.startY;

    const { cellW, cellH } = getCellSize(boardW);
    const colDelta = Math.round(dx / (cellW + GAP));
    const rowDelta = Math.round(dy / (cellH + GAP));

    if (active.type === 'drag') {
      const newCol = Math.max(0, Math.min(COLS - active.colSpan, active.startCol + colDelta));
      const newRow = Math.max(0, active.startRow + rowDelta);

      updateActiveLayout(prev => prev.map(w => {
        if (w.i !== active.widgetId) return w;
        return { ...w, col: newCol, row: newRow };
      }));
    } else if (active.type === 'resize') {
      const newColSpan = Math.max(1, Math.min(COLS - active.startCol, active.startColSpan + colDelta));
      const newRowSpan = Math.max(1, active.startRowSpan + rowDelta);

      updateActiveLayout(prev => prev.map(w => {
        if (w.i !== active.widgetId) return w;
        return { ...w, colSpan: newColSpan, rowSpan: newRowSpan };
      }));
    }
  }, [boardW, updateActiveLayout]);

  const handlePointerUp = useCallback(() => {
    if (activeInteractionRef.current) {
      activeInteractionRef.current = null;
      setActiveInteraction(null);
    }
  }, []);

  useEffect(() => {
    const onMove = (e) => handlePointerMove(e);
    const onUp = () => handlePointerUp();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // ─── GESTIÓN DE TOGGLES DE WIDGETS ───

  const handleToggleWidget = useCallback((widgetId, shouldBeActive) => {
    const currentTab = activeTabRef.current;
    setConfig(prev => {
      const currentWidgets = prev.layouts[currentTab] || [];
      const exists = currentWidgets.some(w => w.i === widgetId);

      let nextWidgets = [...currentWidgets];

      if (shouldBeActive && !exists) {
        const meta = WIDGET_METADATA[widgetId] || { defaultColSpan: 6, defaultRowSpan: 4 };
        const maxRow = currentWidgets.reduce((max, w) => Math.max(max, w.row + w.rowSpan), 0);

        nextWidgets.push({
          i: widgetId,
          col: 0,
          row: maxRow,
          colSpan: meta.defaultColSpan || 6,
          rowSpan: meta.defaultRowSpan || 4
        });
      } else if (!shouldBeActive && exists) {
        nextWidgets = nextWidgets.filter(w => w.i !== widgetId);
      }

      return {
        ...prev,
        layouts: {
          ...prev.layouts,
          [currentTab]: nextWidgets
        }
      };
    });
  }, []);

  const handleActivateAll = useCallback(() => {
    const currentTab = activeTabRef.current;
    const allIds = Object.keys(WidgetRegistry);
    setConfig(prev => {
      let currentRow = 0;
      let currentCol = 0;

      const newWidgets = allIds.map(id => {
        const meta = WIDGET_METADATA[id] || { defaultColSpan: 6, defaultRowSpan: 4 };
        const colSpan = meta.defaultColSpan || 6;
        const rowSpan = meta.defaultRowSpan || 4;

        if (currentCol + colSpan > COLS) {
          currentCol = 0;
          currentRow += 4;
        }

        const widget = { i: id, col: currentCol, row: currentRow, colSpan, rowSpan };
        currentCol += colSpan;
        return widget;
      });

      return {
        ...prev,
        layouts: {
          ...prev.layouts,
          [currentTab]: newWidgets
        }
      };
    });
  }, []);

  const handleDeactivateAll = useCallback(() => {
    const currentTab = activeTabRef.current;
    setConfig(prev => ({
      ...prev,
      layouts: {
        ...prev.layouts,
        [currentTab]: []
      }
    }));
  }, []);

  const handleResetDefault = useCallback((targetTab) => {
    const tabToReset = targetTab || activeTabRef.current;
    const defaultWidgets = configMaster.layouts[tabToReset] || [];
    setConfig(prev => ({
      ...prev,
      layouts: {
        ...prev.layouts,
        [tabToReset]: JSON.parse(JSON.stringify(defaultWidgets))
      }
    }));
  }, []);

  const handleApplyTemplate = useCallback((templateWidgets, targetTab) => {
    const tabToApply = targetTab || activeTabRef.current;
    setConfig(prev => ({
      ...prev,
      layouts: {
        ...prev.layouts,
        [tabToApply]: JSON.parse(JSON.stringify(templateWidgets))
      }
    }));
  }, []);

  const removeWidget = (id) => {
    handleToggleWidget(id, false);
  };

  // Accesibilidad y Estilos del Tema (Monocromo / Slate Neutral)
  const themeStyles = {
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-color)',
    fontFamily: 'var(--font-family)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    transition: 'background-color 0.25s ease, color 0.25s ease',
  };

  const { cellW, cellH } = boardW ? getCellSize(boardW) : { cellW: 0, cellH: 0 };

  const maxRowUsed = widgets.reduce((max, w) => Math.max(max, w.row + w.rowSpan), MIN_ROWS);
  const boardHeight = GAP + maxRowUsed * (ROW_HEIGHT + GAP);

  return (
    <div style={themeStyles}>
      {/* File Input Oculto para Cargar Sesión */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <AccessibilityModal isOpen={isAccessOpen} onClose={() => setIsAccessOpen(false)} config={config} setConfig={setConfig} />
      <LiveSessionModal isOpen={isLiveModalOpen} onClose={closeLiveModal} isLight={isLight} />

      {/* Sidebar de Widgets */}
      <WidgetSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentLayout={widgets}
        activeTab={activeTab}
        onToggleWidget={handleToggleWidget}
        onActivateAll={handleActivateAll}
        onDeactivateAll={handleDeactivateAll}
        onResetDefault={handleResetDefault}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* Menú flotante en pantalla completa */}
      {isMaximized && (
        <FullscreenMenu
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
          toggleMaximize={toggleMaximize}
          isLight={isLight}
          nombreComite={nombreComite}
        />
      )}

      {/* ── Navbar Principal ── */}
      {!isMaximized && (
        <>
          <nav style={{
            position: 'relative',
            zIndex: 50,
            display: 'flex',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--header-bg)',
            borderBottom: '1px solid var(--subborder-color)',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '280px' }}>
              <button
                onClick={() => setIsSidebarOpen(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}
                title="Abrir Gestor de Widgets"
              >
                <Menu size={18} />
                <span>Widgets</span>
              </button>

              {/* Clic en Logo conmuta a Pestaña Principal (HOME) */}
              <div
                onClick={() => setActiveTab('HOME')}
                style={{ cursor: 'pointer' }}
                title="Ir a la Página Principal OPENMUN"
              >
                <OpenMunLogo height={38} isLight={isLight} />
              </div>
            </div>

            {/* Pestañas de Navegación Neutras */}
            <div style={{
              display: 'flex',
              gap: '0.35rem',
              backgroundColor: 'var(--subnav-bg)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid var(--subborder-color)',
              transition: 'background-color 0.3s ease'
            }}>
              {tabs.map(tab => {
                const TabIcon = TAB_CONFIG[tab]?.Icon;
                const label = TAB_CONFIG[tab]?.label || tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '0.4rem 0.95rem',
                      backgroundColor: activeTab === tab ? 'var(--btn-bg)' : 'transparent',
                      color: activeTab === tab ? 'var(--btn-text)' : 'var(--muted-text)',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: activeTab === tab ? '800' : '500',
                      fontSize: '0.85rem',
                      letterSpacing: '0.03em',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    {TabIcon && <TabIcon size={15} />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Acciones de Sesión JSON, Modo Claro/Oscuro y Opciones */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '480px', justifyContent: 'flex-end' }}>
              {/* Botón Sesión en Vivo P2P */}
              <button
                onClick={openLiveModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: connectionStatus === 'host_active' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                  border: `1px solid ${connectionStatus === 'host_active' ? '#22c55e' : 'var(--subborder-color)'}`,
                  borderRadius: '6px',
                  color: connectionStatus === 'host_active' ? '#22c55e' : 'var(--text-color)',
                  padding: '0.4rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                title="Gestionar sala en vivo P2P (Delegados, Secretaría y Backroom)"
              >
                <Radio size={14} className={connectionStatus === 'host_active' ? 'animate-pulse' : ''} />
                <span>
                  {connectionStatus === 'host_active' ? `En Vivo (${connectedPeers.length})` : 'P2P Live'}
                </span>
                {speakingRequests.length > 0 && (
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    position: 'absolute',
                    top: '3px',
                    right: '3px'
                  }} />
                )}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '6px',
                  color: 'var(--text-color)',
                  padding: '0.4rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                title="Cargar archivo sesion_activa.json"
              >
                <Upload size={14} /> Cargar Sesión
              </button>

              <button
                onClick={descargarSesionJSON}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '6px',
                  color: 'var(--text-color)',
                  padding: '0.4rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                title="Exportar archivo sesion_activa.json"
              >
                <Download size={14} /> Exportar sesión
              </button>


              {/* Botón Placeholder Google Drive */}
              <button
                disabled
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'transparent',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '6px',
                  color: 'var(--muted-text)',
                  padding: '5px 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'not-allowed',
                  opacity: 0.6,
                  position: 'relative'
                }}
                title="Conectar con Google Drive (próximamente)"
              >
                {/* Icono Google Drive simplificado */}
                <svg width="15" height="15" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
                  <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
                  <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
                  <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
                  <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
                  <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
                </svg>
                <span>Drive</span>
              </button>

              {/* Botón Directo para Conmutar Modo Claro / Oscuro */}
              <button
                onClick={toggleThemeMode}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '6px',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: '6px'
                }}
                title={isLight ? "Cambiar a Modo Oscuro" : "Cambiar a Modo Claro"}
              >
                {isLight ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              <button
                onClick={toggleMaximize}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '6px',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: '6px'
                }}
                title="Maximizar / Pantalla Completa (F11)"
              >
                <Maximize2 size={16} />
              </button>

              <button onClick={() => setIsAccessOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '4px' }} title="Accesibilidad y Tema">
                <Eye size={20} />
              </button>
            </div>
          </nav>

          {/* Banner Permanente de Alerta de Crisis Activa */}
          <PermanentCrisisBanner isLight={isLight} />

          {/* Subheader Persistente de Comité + Agenda (Solo fuera de HOME) */}
          {activeTab !== 'HOME' && (
            <div style={{
              position: 'relative',
              zIndex: 40,
              backgroundColor: 'var(--card-header-bg)',
              borderBottom: '1px solid var(--subborder-color)',
              padding: '0.4rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-color)',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                {/* Badge Comité */}
                {nombreComite ? (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    color: 'var(--btn-text)',
                    backgroundColor: 'var(--btn-bg)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <Landmark size={12} /> {nombreComite}
                  </span>
                ) : (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    color: 'var(--muted-text)',
                    backgroundColor: 'var(--subnav-bg)',
                    border: '1px dashed var(--border-color)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <Landmark size={12} /> Sin comité
                  </span>
                )}

                {/* Separador */}
                <span style={{ opacity: 0.25, flexShrink: 0 }}>·</span>

                {/* Tema de Agenda */}
                {agendaSesion?.temaActual ? (
                  <>
                    <Scroll size={13} style={{ opacity: 0.7, flexShrink: 0 }} />
                    <span style={{ fontWeight: '600', opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {agendaSesion.temaActual}
                    </span>
                  </>
                ) : (
                  <span style={{ fontWeight: '500', opacity: 0.4, fontStyle: 'italic', fontSize: '0.78rem' }}>
                    Agenda no establecida
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── VISTA PRINCIPAL O TABLERO DE WIDGETS ── */}
      {activeTab === 'HOME' ? (
        <main style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
          <HomePage
            onNavigateToComienzo={() => setActiveTab('COMIENZO')}
            onNavigateToJoin={() => setViewMode('join')}
            isLight={isLight}
          />
        </main>
      ) : (
        <main style={{
          flex: 1,
          padding: '1rem',
          userSelect: activeInteraction ? 'none' : 'auto',
          overflowX: 'hidden'
        }}>
          <div
            ref={boardRef}
            style={{
              position: 'relative',
              width: '100%',
              height: `${boardHeight}px`,
              minHeight: '600px',
              transition: 'height 0.2s ease'
            }}
          >
            {/* Rejilla Guía */}
            {boardW > 0 && Array.from({ length: maxRowUsed }, (_, row) =>
              Array.from({ length: COLS }, (_, col) => {
                const x = GAP + col * (cellW + GAP);
                const y = GAP + row * (cellH + GAP);
                return (
                  <div
                    key={`cell-${col}-${row}`}
                    style={{
                      position: 'absolute',
                      left: x, top: y,
                      width: cellW, height: cellH,
                      border: '1px dashed var(--grid-line)',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(128,128,128,0.01)',
                      pointerEvents: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                );
              })
            )}

            {/* Renderizado de Widgets con Elevación de Z-Index al Hacer Clic */}
            {boardW > 0 && widgets.map(w => {
              const x = GAP + w.col * (cellW + GAP);
              const y = GAP + w.row * (cellH + GAP);
              const width = w.colSpan * cellW + (w.colSpan - 1) * GAP;
              const height = w.rowSpan * cellH + (w.rowSpan - 1) * GAP;

              const WidgetComponent = WidgetRegistry[w.i];
              const meta = WIDGET_METADATA[w.i] || { title: w.i, category: 'Widget' };

              const isInteracting = activeInteraction?.widgetId === w.i;
              const isFocused = focusedWidgetId === w.i;
              const isDraggingThis = isInteracting && activeInteraction.type === 'drag';
              const isResizingThis = isInteracting && activeInteraction.type === 'resize';

              const computedZIndex = isInteracting ? 100 : (isFocused ? 50 : 1);

              return (
                <div
                  key={w.i}
                  className={`widget-card ${isInteracting ? 'is-interacting' : ''}`}
                  onMouseDown={() => setFocusedWidgetId(w.i)}
                  onTouchStart={() => setFocusedWidgetId(w.i)}
                  style={{
                    position: 'absolute',
                    left: x, top: y,
                    width, height,
                    backgroundColor: 'var(--panel-color)',
                    border: isInteracting ? '2px solid var(--text-color)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius)',
                    boxShadow: isFocused || isInteracting
                      ? (isLight ? '0 10px 30px rgba(0,0,0,0.15)' : '0 12px 35px rgba(0,0,0,0.85)')
                      : (isLight ? '0 4px 15px rgba(0,0,0,0.06)' : '0 6px 20px rgba(0,0,0,0.6)'),
                    display: 'flex',
                    flexDirection: 'column',
                    transition: isInteracting ? 'none' : 'left 0.15s cubic-bezier(0.2, 0, 0, 1), top 0.15s cubic-bezier(0.2, 0, 0, 1), width 0.15s cubic-bezier(0.2, 0, 0, 1), height 0.15s cubic-bezier(0.2, 0, 0, 1), background-color 0.3s ease, border-color 0.3s ease',
                    zIndex: computedZIndex,
                    transform: isDraggingThis ? 'scale(1.01)' : 'scale(1)',
                  }}
                >
                  {/* Borde Superior Draggable Fino (Reserva de arrastre) */}
                  <div
                    onMouseDown={(e) => handleStartDrag(e, w.i)}
                    onTouchStart={(e) => handleStartDrag(e, w.i)}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0,
                      height: '8px',
                      zIndex: 15,
                      cursor: isDraggingThis ? 'grabbing' : 'grab',
                      borderTopLeftRadius: 'var(--border-radius)',
                      borderTopRightRadius: 'var(--border-radius)'
                    }}
                    title={`Arrastrar widget: ${meta.title}`}
                  />

                  {/* Botones Flotantes Compactos de Control (Visibles al pasar el ratón) */}
                  <div
                    className="widget-floating-controls"
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      zIndex: 25,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: isLight ? 'rgba(240, 242, 245, 0.92)' : 'rgba(16, 18, 26, 0.92)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '2px 4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      userSelect: 'none'
                    }}
                  >
                    {/* Icono / Handle para Arrastrar */}
                    <div
                      onMouseDown={(e) => handleStartDrag(e, w.i)}
                      onTouchStart={(e) => handleStartDrag(e, w.i)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isDraggingThis ? 'grabbing' : 'grab',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        color: 'var(--text-color)',
                        opacity: 0.8
                      }}
                      title={`Arrastrar widget: ${meta.title}`}
                    >
                      <GripVertical size={14} />
                    </div>

                    {isInteracting && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        backgroundColor: 'var(--btn-bg)',
                        color: 'var(--btn-text)',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        lineHeight: 1
                      }}>
                        {w.colSpan}x{w.rowSpan}
                      </span>
                    )}

                    {/* Botón para Cerrar / Desactivar Widget */}
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onTouchStart={e => e.stopPropagation()}
                      onClick={() => removeWidget(w.i)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.6,
                        padding: '2px',
                        borderRadius: '4px',
                        transition: 'opacity 0.15s ease'
                      }}
                      title={`Quitar widget (${meta.title})`}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Contenido del Widget (Aprovechamiento 100% de espacio) */}
                  <div style={{
                    flex: 1,
                    overflow: 'auto',
                    borderRadius: 'var(--border-radius)',
                    pointerEvents: isInteracting ? 'none' : 'auto'
                  }}>
                    {WidgetComponent ? <WidgetComponent isLight={isLight} /> : (
                      <div style={{ padding: '1rem', opacity: 0.5, textAlign: 'center' }}>
                        Widget: {w.i}
                      </div>
                    )}
                  </div>

                  {/* Handle de Resize Esquina */}
                  <div
                    onMouseDown={(e) => handleStartResize(e, w.i)}
                    onTouchStart={(e) => handleStartResize(e, w.i)}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '18px',
                      height: '18px',
                      cursor: 'nwse-resize',
                      opacity: isResizingThis ? 1 : 0.6,
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-end',
                      padding: '3px',
                      borderBottomRightRadius: 'var(--border-radius)',
                      zIndex: 10
                    }}
                    title="Arrastrar para cambiar tamaño"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 2L2 10M10 6L6 10M10 10L10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}
    </div>
  );
};

export default Dashboard;
