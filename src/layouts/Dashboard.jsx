import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
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
  Sun,
  Moon,
  Home,
  ChevronRight,
  ChevronDown,
  Radio,
  Mic,
  Timer,
  Vote,
  BarChart2,
  LayoutGrid,
  Landmark,
  Scroll,
  RefreshCw,
  LogOut,
  FolderOpen,
  FolderArchive,
  Cloud,
  FileSignature,
  Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import configMaster from '../config/config_master.json';
import WidgetRegistry from '../components/widgets/WidgetRegistry';
import AccessibilityModal from '../components/modals/AccessibilityModal';
import LiveSessionModal from '../components/modals/LiveSessionModal';
import DriveSessionsModal from '../components/modals/DriveSessionsModal';
import ExportSessionModal from '../components/modals/ExportSessionModal';
import WidgetSidebar, { WIDGET_METADATA } from '../components/panels/WidgetSidebar';
import OpenMunLogo from '../components/common/OpenMunLogo';
import LanguageSelector from '../components/common/LanguageSelector';
import PermanentCrisisBanner from '../components/common/PermanentCrisisBanner';
import ToastNotification from '../components/common/ToastNotification';
import HomePage from '../components/pages/HomePage';
import { useSession } from '../context/SessionContext';
import { useP2P } from '../context/P2PContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { validateSessionJSON } from '../utils/sessionValidator';
import { getFlagEmoji } from '../utils/flags';

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
  HOME: { labelKey: 'tabs.home', label: 'Inicio', Icon: Home },
  COMIENZO: { labelKey: 'tabs.setup', label: 'Comienzo', Icon: Settings },
  GSL: { labelKey: 'tabs.gsl', label: 'GSL', Icon: Mic },
  DEBATE: { labelKey: 'tabs.debate', label: 'Debate', Icon: Timer },
  VOTING: { labelKey: 'tabs.voting', label: 'Votación', Icon: Vote },
  ENMIENDAS: { labelKey: 'tabs.amendments', label: 'Enmiendas', Icon: FileSignature },
  INFO: { labelKey: 'tabs.info', label: 'Info', Icon: BarChart2 },
  LIBRE: { labelKey: 'tabs.custom', label: 'Libre', Icon: LayoutGrid },
};

const FullscreenMenu = ({ activeTab, setActiveTab, tabs, toggleMaximize, isLight, nombreComite }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const startClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  const cancelClose = () => {
    clearTimeout(closeTimer.current);
  };

  const ActiveIcon = TAB_CONFIG[activeTab]?.Icon || Home;
  const currentTabLabel = t(TAB_CONFIG[activeTab]?.labelKey, TAB_CONFIG[activeTab]?.label || activeTab);

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
          {currentTabLabel}
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
            const tabLabel = t(TAB_CONFIG[tab]?.labelKey, TAB_CONFIG[tab]?.label || tab);
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
                  color: isActive ? 'var(--btn-text)' : 'var(--text-color)',
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
                {isActive && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', opacity: 0.7 }}>◀</span>}
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
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = isLight ? '#fee2e2' : '#271212'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Minimize2 size={14} />
            {t('header.exitFullscreen', 'Salir de Pantalla Completa')}
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const {
    descargarSesionJSON,
    cargarSesionJSON,
    borrarDatosLocales,
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
    enmiendasSesion,
    agregarOrador,
    agregarOradorCaucus,
    agregarMocion,
    registrarVotoPais,
    ejecutarAccion,
    aplicarEstadoExterno,
    isDriveLinked,
    driveSyncStatus,
    driveUser,
    driveLastSync,
    conectarGoogleDrive,
    desconectarGoogleDrive,
    sincronizarDriveManual,
    tipoSesion,
    cambiarTipoSesion
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
    roomId,
    setViewMode
  } = useP2P();

  // Registrar handlers de sesión para solicitudes P2P automáticas, acciones remotas y sincronización
  useEffect(() => {
    registerSessionHandlers({
      onAddSpeakerGSL: (pais) => {
        const countryName = typeof pais === 'string' ? pais : pais?.nombre;
        const match = paises.find(p => p.nombre?.toLowerCase() === countryName?.toLowerCase());
        agregarOrador(match || pais);
      },
      onAddSpeakerCaucus: (pais) => {
        const countryName = typeof pais === 'string' ? pais : pais?.nombre;
        const match = paises.find(p => p.nombre?.toLowerCase() === countryName?.toLowerCase());
        agregarOradorCaucus(match || pais);
      },
      onAddMotion: (mocion) => {
        const match = paises.find(p => p.nombre?.toLowerCase() === mocion.proponente?.toLowerCase());
        agregarMocion({
          ...mocion,
          bandera: match?.bandera || mocion.bandera || getFlagEmoji(null, mocion.proponente)
        });
      },
      onCastVote: (country, vote) => registrarVotoPais(country, vote),
      onSessionAction: (accion, payload) => ejecutarAccion(accion, payload),
      onSyncState: (state) => aplicarEstadoExterno(state)
    });
  }, [registerSessionHandlers, agregarOrador, agregarOradorCaucus, agregarMocion, registrarVotoPais, ejecutarAccion, aplicarEstadoExterno, paises]);

  // Sincronizar estado automáticamente a todos los peers conectados si el Chair está emitiendo (optimizado sin spam de reloj)
  useEffect(() => {
    broadcastCurrentState({
      comision: nombreComite || 'Asamblea General - openMUN',
      paises,
      oradoresCola,
      oradoresCaucus,
      mociones,
      caucusActivo,
      agendaSesion,
      nombreComite,
      votacionSesion,
      enmiendasSesion,
      roomSettings,
      speakingRequests
    });
  }, [broadcastCurrentState, paises, oradoresCola, oradoresCaucus, mociones, caucusActivo, agendaSesion, nombreComite, votacionSesion, enmiendasSesion, roomSettings, speakingRequests]);

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
    switch (activeTab) {
      case 'HOME':
        document.title = 'OpenMUN - Plataforma Libre de Gestión para Modelos de Naciones Unidas (MUN)';
        break;
      case 'COMIENZO':
        document.title = 'OpenMUN - Configuración y Agenda de Comité';
        break;
      case 'GSL':
        document.title = 'OpenMUN - Lista General de Oradores (GSL)';
        break;
      case 'DEBATE':
        document.title = 'OpenMUN - Cronómetros y Moderación de Debate';
        break;
      case 'VOTING':
        document.title = 'OpenMUN - Sistema de Votación Oficial y Mapa de Votos';
        break;
      case 'ENMIENDAS':
        document.title = 'OpenMUN - Controlador de Enmiendas y Proyecto de Resolución';
        break;
      case 'INFO':
        document.title = 'OpenMUN - Matriz de Quórum e Información de Delegaciones';
        break;
      case 'LIBRE':
        document.title = 'OpenMUN - Panel de Widgets Personalizable';
        break;
      default:
        document.title = 'OpenMUN - Plataforma Libre de Gestión para Modelos de Naciones Unidas (MUN)';
        break;
    }
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

  // Menú unificado de Sesión (JSON + Drive) y Modales
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const sessionMenuRef = useRef(null);

  // Sistema de Notificaciones Toasts Estilizadas
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toastData) => {
    if (!toastData) return null;
    const {
      type = 'info',
      title,
      message,
      duration = 4000,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      isLarge
    } = toastData;
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts(prev => [...prev, {
      id,
      type,
      title,
      message,
      duration,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      isLarge
    }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Escuchar eventos globales de toast para que cualquier componente pueda dispararlos y verificar toasts/navegación pendientes
  useEffect(() => {
    const handleCustomToast = (e) => {
      if (e && e.detail) {
        addToast(e.detail);
      }
    };
    window.addEventListener('openmun_toast', handleCustomToast);

    // Verificar si hay navegación pendiente (ej. entrar como Mesa)
    try {
      const pendingNav = localStorage.getItem('openmun_pending_nav_tab');
      if (pendingNav) {
        localStorage.removeItem('openmun_pending_nav_tab');
        if (TAB_CONFIG[pendingNav]) {
          setActiveTab(pendingNav);
        }
      }

      const pendingToast = localStorage.getItem('openmun_pending_toast');
      if (pendingToast) {
        localStorage.removeItem('openmun_pending_toast');
        const parsed = JSON.parse(pendingToast);
        addToast(parsed);
      }
    } catch (e) {
      console.error('Error procesando navegación pendiente:', e);
    }

    return () => {
      window.removeEventListener('openmun_toast', handleCustomToast);
    };
  }, [addToast]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sessionMenuRef.current && !sessionMenuRef.current.contains(e.target)) {
        setSessionMenuOpen(false);
      }
    };
    if (sessionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sessionMenuOpen]);

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
        const rawContent = event.target.result;
        
        // Validar sintaxis y estructura estricta del JSON
        const validation = validateSessionJSON(rawContent);

        if (!validation.valid) {
          if (validation.errorType === 'SYNTAX_ERROR') {
            addToast({
              type: 'error',
              title: t('toast.invalidJsonSyntaxTitle', 'Error de Sintaxis JSON'),
              message: `${t('toast.invalidJsonSyntaxDesc', 'El archivo no contiene un JSON válido o está corrupto.')} (${validation.message})`,
              duration: 5000
            });
          } else {
            addToast({
              type: 'error',
              title: t('toast.invalidSessionFormatTitle', 'Estructura de Sesión Inválida'),
              message: validation.message || t('toast.invalidSessionFormatDesc', 'El archivo no contiene una estructura reconocida de sesión de OpenMUN.'),
              duration: 5000
            });
          }
          return;
        }

        const ok = cargarSesionJSON(validation.data, (newConfig) => {
          if (newConfig) {
            setConfig(newConfig);
          }
        });

        if (ok) {
          const cfg = validation.data.config || validation.data.openmun_config || (validation.data.localStorageSnapshot && validation.data.localStorageSnapshot.openmun_config);
          if (cfg) {
            try {
              const parsedCfg = typeof cfg === 'string' ? JSON.parse(cfg) : cfg;
              setConfig(parsedCfg);
            } catch (err) {
              console.error('Error parseando config importada:', err);
            }
          }
          addToast({
            type: 'success',
            title: t('toast.sessionLoadedTitle', '¡Sesión Cargada con Éxito!'),
            message: t('toast.sessionLoadedDesc', 'Todos los datos de la sesión han sido procesados y restaurados correctamente.'),
            duration: 4000
          });
        } else {
          addToast({
            type: 'error',
            title: t('toast.importErrorTitle', 'Error al Importar Sesión'),
            message: 'No se pudo aplicar la sesión.',
            duration: 5000
          });
        }
      } catch (err) {
        addToast({
          type: 'error',
          title: t('toast.importErrorTitle', 'Error al Leer Archivo'),
          message: err.message,
          duration: 5000
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const tabs = ['HOME', 'COMIENZO', 'GSL', 'DEBATE', 'VOTING', 'ENMIENDAS', 'INFO', 'LIBRE'];
  const widgets = (config?.layouts && config.layouts[activeTab]) || configMaster.layouts[activeTab] || [];

  // Actualizador seguro para la pestaña activa sin stale closures
  const updateActiveLayout = useCallback((updater) => {
    const currentTab = activeTabRef.current;
    setConfig(prev => {
      const prevLayouts = prev?.layouts || configMaster.layouts;
      const currentWidgets = prevLayouts[currentTab] || configMaster.layouts[currentTab] || [];
      const newWidgets = typeof updater === 'function' ? updater(currentWidgets) : updater;
      return {
        ...prev,
        layouts: {
          ...prevLayouts,
          [currentTab]: newWidgets
        }
      };
    });
  }, [setConfig]);

  // ─── LÓGICA DE DRAG & RESIZE Y ELEVACIÓN DE Z-INDEX ───

  const handleStartDrag = (e, widgetId) => {
    e.preventDefault();
    e.stopPropagation();
    setFocusedWidgetId(widgetId);
    const currentLayout = (config?.layouts && config.layouts[activeTabRef.current]) || configMaster.layouts[activeTabRef.current] || [];
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
    const currentLayout = (config?.layouts && config.layouts[activeTabRef.current]) || configMaster.layouts[activeTabRef.current] || [];
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
      const prevLayouts = prev?.layouts || configMaster.layouts;
      const currentWidgets = prevLayouts[currentTab] || configMaster.layouts[currentTab] || [];
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
          ...prevLayouts,
          [currentTab]: nextWidgets
        }
      };
    });
  }, [setConfig]);

  const handleActivateAll = useCallback(() => {
    const currentTab = activeTabRef.current;
    const allIds = Object.keys(WidgetRegistry);
    setConfig(prev => {
      const prevLayouts = prev?.layouts || configMaster.layouts;
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
          ...prevLayouts,
          [currentTab]: newWidgets
        }
      };
    });
  }, [setConfig]);

  const handleDeactivateAll = useCallback(() => {
    const currentTab = activeTabRef.current;
    setConfig(prev => {
      const prevLayouts = prev?.layouts || configMaster.layouts;
      return {
        ...prev,
        layouts: {
          ...prevLayouts,
          [currentTab]: []
        }
      };
    });
  }, [setConfig]);

  const handleResetDefault = useCallback((targetTab) => {
    const tabToReset = targetTab || activeTabRef.current;
    const defaultWidgets = configMaster.layouts[tabToReset] || [];
    setConfig(prev => {
      const prevLayouts = prev?.layouts || configMaster.layouts;
      return {
        ...prev,
        layouts: {
          ...prevLayouts,
          [tabToReset]: JSON.parse(JSON.stringify(defaultWidgets))
        }
      };
    });
  }, [setConfig]);

  const handleApplyTemplate = useCallback((templateWidgets, targetTab) => {
    const tabToApply = targetTab || activeTabRef.current;
    setConfig(prev => {
      const prevLayouts = prev?.layouts || configMaster.layouts;
      return {
        ...prev,
        layouts: {
          ...prevLayouts,
          [tabToApply]: JSON.parse(JSON.stringify(templateWidgets))
        }
      };
    });
  }, [setConfig]);

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
      <DriveSessionsModal isOpen={isDriveModalOpen} onClose={() => setIsDriveModalOpen(false)} />
      <ExportSessionModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
      <ToastNotification toasts={toasts} onDismiss={removeToast} />

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
            zIndex: 1000,
            display: 'flex',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--header-bg)',
            borderBottom: '1px solid var(--subborder-color)',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setIsSidebarOpen(prev => !prev)}
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
                title={t('header.widgetsTooltip', 'Abrir Gestor de Widgets')}
              >
                <Menu size={18} />
                <span>{t('header.widgets', 'Widgets')}</span>
              </button>

              {/* Clic en Logo conmuta a Pestaña Principal (HOME) */}
              <div
                onClick={() => setActiveTab('HOME')}
                style={{ cursor: 'pointer' }}
                title="OpenMUN"
              >
                <OpenMunLogo height={38} isLight={isLight} />
              </div>

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
                title={t('liveSession.title', 'Sesión en Vivo')}
              >
                <Radio size={14} className={connectionStatus === 'host_active' ? 'animate-pulse' : ''} />
                <span>
                  {connectionStatus === 'host_active'
                    ? (roomSettings?.privacyMode === 'hidden'
                        ? `${t('liveSession.live', 'En Vivo')} (${connectedPeers.length})`
                        : `${roomId || t('liveSession.live', 'En Vivo')} (${connectedPeers.length})`)
                    : t('liveSession.live', 'En Vivo')}
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
                const label = t(TAB_CONFIG[tab]?.labelKey, TAB_CONFIG[tab]?.label || tab);
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'flex-end' }}>
              {/* Botón Unificado de Sesión (Importar / Exportar / Google Drive) */}
              <div style={{ position: 'relative' }} ref={sessionMenuRef}>
                <button
                  onClick={() => setSessionMenuOpen(prev => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    backgroundColor: sessionMenuOpen
                      ? (isLight ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.2)')
                      : (isDriveLinked ? 'rgba(66, 133, 244, 0.08)' : 'transparent'),
                    border: `1px solid ${sessionMenuOpen ? 'var(--btn-bg)' : isDriveLinked ? 'rgba(66, 133, 244, 0.4)' : 'var(--subborder-color)'}`,
                    borderRadius: '6px',
                    color: 'var(--text-color)',
                    padding: '0.4rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title={t('header.sessionMenuTooltip', 'Gestión de Sesión: Importar, Exportar y Google Drive')}
                >
                  <FolderArchive size={15} style={{ color: isDriveLinked ? '#2684fc' : 'currentColor' }} />
                  <span>{t('header.sessionMenu', 'Sesión')}</span>

                  {/* Indicador de estado de Google Drive si está vinculado */}
                  {driveSyncStatus === 'syncing' || driveSyncStatus === 'connecting' ? (
                    <RefreshCw size={11} className="spin-animation" style={{ color: '#2684fc' }} />
                  ) : isDriveLinked && driveSyncStatus === 'synced' ? (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#00ac47',
                      boxShadow: '0 0 5px #00ac47'
                    }} />
                  ) : isDriveLinked && driveSyncStatus === 'error' ? (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#ea4335',
                      boxShadow: '0 0 5px #ea4335'
                    }} />
                  ) : null}

                  <ChevronDown
                    size={13}
                    style={{
                      transform: sessionMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      opacity: 0.7
                    }}
                  />
                </button>

                {/* Menú Desplegable Unificado de Sesión */}
                {sessionMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      width: '275px',
                      backgroundColor: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(22, 27, 39, 0.96)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '10px',
                      boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.12)' : '0 16px 36px rgba(0,0,0,0.5)',
                      padding: '0.65rem',
                      zIndex: 9999,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem',
                      animation: 'fadeIn 0.15s ease'
                    }}
                  >
                    {/* SECCIÓN 1: ARCHIVOS LOCALES (JSON) */}
                    <div style={{
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--muted-text)',
                      padding: '0.2rem 0.4rem 0.1rem'
                    }}>
                      {t('header.sessionSectionLocal', 'Archivos Locales (JSON)')}
                    </div>

                    {/* Botón Cargar Sesión */}
                    <button
                      onClick={() => {
                        setSessionMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.5rem 0.6rem',
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--text-color)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.07)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        color: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Upload size={15} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                          {t('header.importSession', 'Cargar Sesión (JSON)')}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--muted-text)' }}>
                          {t('header.importSessionDesc', 'Restaurar datos desde archivo .json')}
                        </span>
                      </div>
                    </button>

                    {/* Botón Exportar Sesión */}
                    <button
                      onClick={() => {
                        setSessionMenuOpen(false);
                        setIsExportModalOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.5rem 0.6rem',
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--text-color)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.07)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Download size={15} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                          {t('header.exportSession', 'Exportar sesión')}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--muted-text)' }}>
                          {t('header.exportSessionDesc', 'Guardar copia de seguridad en JSON')}
                        </span>
                      </div>
                    </button>

                    {/* Botón Borrar Datos Locales */}
                    <button
                      onClick={() => {
                        setSessionMenuOpen(false);
                        addToast({
                          type: 'confirm',
                          isLarge: true,
                          title: t('toast.confirmClearSessionTitle', '¿Borrar todos los datos locales?'),
                          message: t('toast.confirmClearSessionDesc', 'Esta acción restablecerá el comité actual, lista de oradores, votaciones y datos guardados en el navegador. No se puede deshacer si no tienes una copia de seguridad.'),
                          confirmText: t('toast.confirmClearSessionBtn', 'Borrar datos locales'),
                          cancelText: t('toast.cancelBtn', 'Cancelar'),
                          onConfirm: () => {
                            borrarDatosLocales();
                            addToast({
                              type: 'success',
                              title: t('toast.sessionClearedTitle', '¡Datos locales borrados!'),
                              message: t('toast.sessionClearedDesc', 'Se ha restablecido la sesión local por completo.'),
                              duration: 3500
                            });
                          }
                        });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.5rem 0.6rem',
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--text-color)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = isLight ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.12)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Trash2 size={15} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#ef4444' }}>
                          {t('header.clearLocalData', 'Borrar datos locales')}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--muted-text)' }}>
                          {t('header.clearLocalDataDesc', 'Restablecer comités, oradores y estado')}
                        </span>
                      </div>
                    </button>

                    {/* Separador */}
                    <div style={{ height: '1px', backgroundColor: 'var(--subborder-color)', margin: '0.2rem 0' }} />

                    {/* SECCIÓN 2: GOOGLE DRIVE */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.1rem 0.4rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <svg width="13" height="13" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                          <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
                          <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
                          <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
                          <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
                          <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
                          <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
                        </svg>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: 'var(--muted-text)'
                        }}>
                          Google Drive
                        </span>
                      </div>

                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: !isDriveLinked
                          ? (isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)')
                          : driveSyncStatus === 'synced'
                          ? 'rgba(0, 172, 71, 0.15)'
                          : driveSyncStatus === 'syncing'
                          ? 'rgba(38, 132, 252, 0.15)'
                          : 'rgba(234, 67, 53, 0.15)',
                        color: !isDriveLinked
                          ? 'var(--muted-text)'
                          : driveSyncStatus === 'synced'
                          ? '#00ac47'
                          : driveSyncStatus === 'syncing'
                          ? '#2684fc'
                          : '#ea4335'
                      }}>
                        {!isDriveLinked
                          ? 'Offline'
                          : driveSyncStatus === 'synced'
                          ? 'Sincronizado'
                          : driveSyncStatus === 'syncing'
                          ? 'Guardando...'
                          : 'Error'}
                      </span>
                    </div>

                    {!isDriveLinked ? (
                      <button
                        onClick={() => {
                          setSessionMenuOpen(false);
                          conectarGoogleDrive().then(ok => {
                            if (ok) setIsDriveModalOpen(true);
                          });
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.5rem 0.6rem',
                          borderRadius: '7px',
                          border: '1px solid rgba(66, 133, 244, 0.3)',
                          backgroundColor: 'rgba(66, 133, 244, 0.08)',
                          color: '#2684fc',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(66, 133, 244, 0.16)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(66, 133, 244, 0.08)'; }}
                      >
                        <Cloud size={16} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>
                            {t('header.driveConnect', 'Conectar con Google Drive')}
                          </span>
                          <span style={{ fontSize: '0.66rem', opacity: 0.8 }}>
                            Copia y sincronización en la nube
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {driveUser && (
                          <div style={{
                            backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
                            padding: '0.35rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid var(--subborder-color)'
                          }}>
                            <div style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-color)' }}>
                              {driveUser.name || 'Google Drive'}
                            </div>
                            {driveUser.email && (
                              <div style={{ fontSize: '0.66rem', color: 'var(--muted-text)', wordBreak: 'break-all' }}>
                                {driveUser.email}
                              </div>
                            )}
                            <div style={{ fontSize: '0.66rem', color: 'var(--muted-text)', marginTop: '0.15rem' }}>
                              Archivo: <strong>{driveFileName || 'sesion_activa.json'}</strong>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setSessionMenuOpen(false);
                            setIsDriveModalOpen(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'rgba(38, 132, 252, 0.1)',
                            border: '1px solid rgba(38, 132, 252, 0.3)',
                            borderRadius: '5px',
                            color: '#2684fc',
                            padding: '5px 8px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <FolderOpen size={13} />
                          <span>{t('header.driveExplore', 'Explorar / Gestionar Sesiones')}</span>
                        </button>

                        <button
                          onClick={async () => {
                            await sincronizarDriveManual();
                            setSessionMenuOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'var(--card-hover, rgba(255,255,255,0.05))',
                            border: '1px solid var(--subborder-color)',
                            borderRadius: '5px',
                            color: 'var(--text-color)',
                            padding: '5px 8px',
                            fontSize: '0.74rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <RefreshCw size={12} className={driveSyncStatus === 'syncing' ? 'spin-animation' : ''} />
                          <span>{t('header.driveSyncNow', 'Sincronizar ahora')}</span>
                        </button>

                        <button
                          onClick={() => {
                            desconectarGoogleDrive();
                            setSessionMenuOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'transparent',
                            border: '1px solid rgba(234, 67, 53, 0.3)',
                            borderRadius: '5px',
                            color: '#ea4335',
                            padding: '5px 8px',
                            fontSize: '0.74rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <LogOut size={12} />
                          <span>{t('header.driveDisconnect', 'Desconectar Google Drive')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

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
                title={isLight ? t('header.darkMode', "Cambiar a Modo Oscuro") : t('header.lightMode', "Cambiar a Modo Claro")}
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
                title={t('header.fullscreen', "Maximizar / Pantalla Completa (F11)")}
              >
                <Maximize2 size={16} />
              </button>

              <button onClick={() => setIsAccessOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '4px' }} title={t('accessibility.title', "Accesibilidad y Tema")}>
                <Eye size={20} />
              </button>

              <LanguageSelector showIcon={false} />
            </div>
          </nav>

          {/* Banner Permanente de Alerta de Crisis Activa */}
          <PermanentCrisisBanner isLight={isLight} />

          {/* Subheader Persistente de Comité + Agenda + Estado de Sesión (Solo fuera de HOME) */}
          {activeTab !== 'HOME' && (
            <div style={{
              position: 'relative',
              zIndex: 900,
              backgroundColor: 'var(--card-header-bg)',
              borderBottom: '1px solid var(--subborder-color)',
              padding: '0.4rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-color)',
              gap: '0.75rem',
              flexWrap: 'wrap'
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
                    <Landmark size={12} /> {t('header.noCommittee', 'Sin comité')}
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
                    {t('header.noAgenda', 'Agenda no establecida')}
                  </span>
                )}
              </div>

              {/* Selector Rápido de Estado de Sesión (Mesa Directiva) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '2px',
                gap: '2px'
              }}>
                {[
                  { id: 'formal', label: 'Formal', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.18)' },
                  { id: 'informal', label: 'Informal', color: '#eab308', bg: 'rgba(234, 179, 8, 0.18)' },
                  { id: 'receso', label: 'Receso', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.18)' },
                  { id: 'votacion', label: 'Votando', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.18)' }
                ].map(s => {
                  const isActivo = (tipoSesion || 'formal') === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => cambiarTipoSesion(s.id)}
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        border: isActivo ? `1px solid ${s.color}` : '1px solid transparent',
                        backgroundColor: isActivo ? (isLight ? '#ffffff' : s.bg) : 'transparent',
                        color: isActivo ? s.color : 'var(--muted-text)',
                        fontWeight: isActivo ? '800' : '600',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        boxShadow: isActivo ? `0 0 8px ${s.color}33` : 'none',
                        transition: 'all 0.15s ease'
                      }}
                      title={`Cambiar estado de sesión a ${s.label}`}
                    >
                      <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: s.color,
                        boxShadow: isActivo ? `0 0 6px ${s.color}` : 'none'
                      }} />
                      {s.label}
                    </button>
                  );
                })}
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
                    {WidgetComponent ? (
                      <Suspense fallback={
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          opacity: 0.6,
                          fontFamily: 'monospace'
                        }}>
                          Cargando {meta.title}...
                        </div>
                      }>
                        <WidgetComponent isLight={isLight} />
                      </Suspense>
                    ) : (
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
