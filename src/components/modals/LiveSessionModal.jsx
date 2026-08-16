import React, { useState } from 'react';
import { 
  X, 
  Radio, 
  Copy, 
  Check, 
  QrCode, 
  Users, 
  Key, 
  ShieldAlert, 
  ExternalLink, 
  UserX, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Sparkles,
  Layers,
  MessageSquare,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Lock,
  Vote,
  FileText,
  Clock,
  Shield,
  Zap,
  HelpCircle,
  Hand,
  Mail,
  Landmark
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { useP2P } from '../../context/P2PContext';
import { useSession } from '../../context/SessionContext';

const LiveSessionModal = ({ isOpen, onClose, isLight }) => {
  const { t } = useTranslation();
  const {
    connectionStatus,
    roomId,
    setRoomId,
    secretPassword,
    setSecretPassword,
    backroomPassword,
    setBackroomPassword,
    roomSettings,
    updateRoomSettings,
    connectedPeers,
    startHosting,
    stopHosting,
    kickPeer,
    speakingRequests,
    approveSpeakingRequest,
    rejectSpeakingRequest
  } = useP2P();

  const [copiado, setCopiado] = useState(false);
  const [mostrarPassSecreto, setMostrarPassSecreto] = useState(false);
  const [mostrarPassBackroom, setMostrarPassBackroom] = useState(false);
  const [tabActiva, setTabActiva] = useState('SALA'); // 'SALA' | 'AJUSTES' | 'CONEXIONES' | 'SOLICITUDES'
  const [filtroConexiones, setFiltroConexiones] = useState('');

  if (!isOpen) return null;

  const isHostActive = connectionStatus === 'host_active';
  const isConnecting = connectionStatus === 'connecting';

  // Generar URL completa para que los delegados entren con un solo clic o escaneando QR
  const shareableJoinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomId)}`
    : `https://openmun.org/?room=${roomId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableJoinUrl);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleOpenLocalSecretariat = () => {
    if (typeof window !== 'undefined') {
      window.open(`${window.location.origin}${window.location.pathname}?mode=secretariat&local=true`, '_blank');
    }
  };

  const generarPasswordRandom = (tipo) => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (tipo === 'secret') setSecretPassword(res);
    if (tipo === 'backroom') setBackroomPassword(res);
  };

  const conexionesFiltradas = connectedPeers.filter(p => {
    if (!filtroConexiones) return true;
    return (p.country || '').toLowerCase().includes(filtroConexiones.toLowerCase()) ||
           (p.role || '').toLowerCase().includes(filtroConexiones.toLowerCase());
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: 'var(--panel-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '18px',
        width: '740px',
        maxWidth: '95vw',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 30px 70px rgba(0,0,0,0.65)',
        color: 'var(--text-color)',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--subborder-color)',
          backgroundColor: 'var(--card-header-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: isHostActive ? 'rgba(34, 197, 94, 0.16)' : 'rgba(59, 130, 246, 0.16)',
              border: `1px solid ${isHostActive ? '#22c55e44' : '#3b82f644'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isHostActive ? '#22c55e' : '#3b82f6'
            }}>
              <Radio size={22} className={isHostActive ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
                  {t('liveSession.title', 'Sesión en Vivo P2P')} (Mesa / Chair)
                </h3>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '100px',
                  backgroundColor: isHostActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(113, 113, 122, 0.2)',
                  color: isHostActive ? '#22c55e' : '#a1a1aa',
                  border: `1px solid ${isHostActive ? '#22c55e44' : '#71717a44'}`
                }}>
                  {isHostActive ? t('liveSession.onAir', 'En Directo') : t('liveSession.offline', 'Apagado')}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                {isHostActive
                  ? `${t('liveSession.broadcastingRoom', 'Transmitiendo sala')} • ${connectedPeers.length} ${t('liveSession.connectedDevices', 'delegaciones y mesas conectadas')}`
                  : t('liveSession.configureToStart', 'Configura las opciones de la sala e inicia la transmisión P2P')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted-text)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--subborder-color)',
          backgroundColor: 'var(--subnav-bg)',
          padding: '0.4rem 1.25rem',
          gap: '0.5rem',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setTabActiva('SALA')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: tabActiva === 'SALA' ? 'var(--btn-bg)' : 'transparent',
              color: tabActiva === 'SALA' ? 'var(--btn-text)' : 'var(--muted-text)',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Radio size={15} /> {t('liveSession.broadcastControl', 'Control de Emisión')}
          </button>

          <button
            onClick={() => setTabActiva('AJUSTES')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: tabActiva === 'AJUSTES' ? 'var(--btn-bg)' : 'transparent',
              color: tabActiva === 'AJUSTES' ? 'var(--btn-text)' : 'var(--muted-text)',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Sliders size={15} /> {t('liveSession.settingsAndPermissions', 'Ajustes y Permisos')}
          </button>

          <button
            onClick={() => setTabActiva('CONEXIONES')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: tabActiva === 'CONEXIONES' ? 'var(--btn-bg)' : 'transparent',
              color: tabActiva === 'CONEXIONES' ? 'var(--btn-text)' : 'var(--muted-text)',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={15} /> {t('liveSession.connections', 'Conexiones')} ({connectedPeers.length})
          </button>

          <button
            onClick={() => setTabActiva('SOLICITUDES')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: tabActiva === 'SOLICITUDES' ? 'var(--btn-bg)' : 'transparent',
              color: tabActiva === 'SOLICITUDES' ? 'var(--btn-text)' : 'var(--muted-text)',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              position: 'relative',
              transition: 'all 0.15s ease'
            }}
          >
            <MessageSquare size={15} /> {t('liveSession.requests', 'Solicitudes')} ({speakingRequests.length})
            {speakingRequests.length > 0 && (
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                boxShadow: '0 0 8px #ef4444'
              }} />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* ═══════════════════════════════════════════════════════ */}
          {/* PESTAÑA 1: CONTROL DE SALA                              */}
          {/* ═══════════════════════════════════════════════════════ */}
          {tabActiva === 'SALA' && (
            <>
              {/* Card de Estado y Botón de Inicio */}
              <div style={{
                backgroundColor: isHostActive ? 'rgba(34, 197, 94, 0.08)' : 'var(--card-header-bg)',
                border: `1px solid ${isHostActive ? '#22c55e44' : 'var(--subborder-color)'}`,
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: isHostActive ? '#22c55e' : '#71717a',
                      boxShadow: isHostActive ? '0 0 12px #22c55e' : 'none'
                    }} />
                    <span style={{ fontWeight: '800', fontSize: '1.05rem' }}>
                      {isHostActive ? t('liveSession.p2pServerActive', 'Servidor P2P Activo y Emitiendo') : t('liveSession.p2pServerOff', 'Servidor P2P Desconectado')}
                    </span>
                  </div>
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: 'var(--muted-text)', maxWidth: '440px' }}>
                    {isHostActive
                      ? t('liveSession.joinByQR', 'Los delegados pueden unirse escaneando el código QR o introduciendo el código de sala.')
                      : t('liveSession.startServer', 'Inicia el servidor para permitir conexiones en tiempo real de delegados, secretaría y backroom.')}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  {isHostActive ? (
                    <button
                      onClick={stopHosting}
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.65rem 1.4rem',
                        fontWeight: '700',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Radio size={16} /> {t('liveSession.stopRoom', 'Detener Sala')}
                    </button>
                  ) : (
                    <button
                      disabled={isConnecting}
                      onClick={() => startHosting(roomId, secretPassword, backroomPassword, roomSettings)}
                      style={{
                        backgroundColor: 'var(--btn-bg)',
                        color: 'var(--btn-text)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.65rem 1.4rem',
                        fontWeight: '800',
                        fontSize: '0.88rem',
                        cursor: isConnecting ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Radio size={16} /> {isConnecting ? t('liveSession.starting', 'Iniciando...') : t('liveSession.startRoom', 'Iniciar Sala P2P')}
                    </button>
                  )}
                </div>
              </div>

              {/* Panel de Código de Sala y QR */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isHostActive ? '1fr 200px' : '1fr',
                gap: '1.25rem',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Input Código de Sala */}
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('liveSession.roomCode', 'Código de Sala')} (Peer ID)
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                      <input
                        type="text"
                        disabled={isHostActive}
                        value={roomId}
                        onChange={e => setRoomId(e.target.value.toUpperCase())}
                        style={{
                          flex: 1,
                          backgroundColor: 'var(--card-header-bg)',
                          border: '1px solid var(--subborder-color)',
                          borderRadius: '10px',
                          padding: '0.7rem 1rem',
                          color: 'var(--text-color)',
                          fontWeight: '800',
                          fontFamily: 'monospace',
                          fontSize: '1.15rem',
                          letterSpacing: '0.06em'
                        }}
                      />
                      {isHostActive && (
                        <button
                          onClick={handleCopyLink}
                          style={{
                            backgroundColor: copiado ? '#22c55e' : 'var(--card-header-bg)',
                            border: '1px solid var(--subborder-color)',
                            color: copiado ? '#ffffff' : 'var(--text-color)',
                            borderRadius: '10px',
                            padding: '0 1.2rem',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.15s ease'
                          }}
                          title="Copiar enlace de invitación para delegados"
                        >
                          {copiado ? <Check size={16} /> : <Copy size={16} />}
                          {copiado ? t('common.copied', '¡Copiado!') : t('liveSession.copyLink', 'Copiar Link')}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Botón de Acceso Rápido a Secretaría Local (Doble Monitor) */}
                  <div style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    border: '1px dashed rgba(59, 130, 246, 0.35)',
                    borderRadius: '12px',
                    padding: '0.9rem 1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.85rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Layers size={16} color="#3b82f6" /> Pantalla Secreta Local (Doble Monitor)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-text)', marginTop: '3px' }}>
                        Abre una pestaña secundaria instantánea en este navegador (cero latencia, sin contraseña).
                      </div>
                    </div>
                    <button
                      onClick={handleOpenLocalSecretariat}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem 0.95rem',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      <ExternalLink size={14} /> Abrir Pestaña
                    </button>
                  </div>
                </div>

                {/* Código QR si el Host está activo */}
                {isHostActive && (
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '12px',
                    borderRadius: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                    alignSelf: 'center'
                  }}>
                    <QRCodeSVG
                      value={shareableJoinUrl}
                      size={160}
                      level="M"
                      includeMargin={false}
                    />
                    <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#18181b', marginTop: '6px' }}>
                      Escanear para Unirse
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════ */}
          {/* PESTAÑA 2: AJUSTES Y PERMISOS DE DELEGADOS               */}
          {/* ═══════════════════════════════════════════════════════ */}
          {tabActiva === 'AJUSTES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              {/* Sección 1: Modo de Solicitud de Oradores (GSL y Caucus) */}
              <div style={{
                backgroundColor: 'var(--card-header-bg)',
                border: '1px solid var(--subborder-color)',
                borderRadius: '14px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: '800', fontSize: '0.95rem' }}>
                    <Zap size={18} color="#3b82f6" /> Modo de Solicitudes a la Lista de Oradores (GSL)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                    Define cómo se procesan las peticiones de los delegados para incorporarse a la Lista General de Oradores.
                  </div>
                </div>

                {/* 3 opciones selector en tarjetas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {/* Opción 1: Directas */}
                  <div
                    onClick={() => updateRoomSettings({ speakerRequestMode: 'direct' })}
                    style={{
                      border: `1.5px solid ${roomSettings.speakerRequestMode === 'direct' ? '#22c55e' : 'var(--subborder-color)'}`,
                      backgroundColor: roomSettings.speakerRequestMode === 'direct' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255,255,255,0.02)',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: roomSettings.speakerRequestMode === 'direct' ? '#22c55e' : 'var(--text-color)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Zap size={14} /> Directas
                      </span>
                      {roomSettings.speakerRequestMode === 'direct' && <CheckCircle2 size={16} color="#22c55e" />}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', lineHeight: '1.3' }}>
                      El delegado entra a la lista automáticamente sin que la Mesa deba aceptar.
                    </span>
                  </div>

                  {/* Opción 2: Requiere Aprobación */}
                  <div
                    onClick={() => updateRoomSettings({ speakerRequestMode: 'approval' })}
                    style={{
                      border: `1.5px solid ${roomSettings.speakerRequestMode === 'approval' ? '#eab308' : 'var(--subborder-color)'}`,
                      backgroundColor: roomSettings.speakerRequestMode === 'approval' ? 'rgba(234, 179, 8, 0.12)' : 'rgba(255,255,255,0.02)',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: roomSettings.speakerRequestMode === 'approval' ? '#eab308' : 'var(--text-color)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Hand size={14} /> Con Aprobación
                      </span>
                      {roomSettings.speakerRequestMode === 'approval' && <CheckCircle2 size={16} color="#eab308" />}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', lineHeight: '1.3' }}>
                      La solicitud va a la cola de pendientes y el Chair o Secretaría debe aprobarla.
                    </span>
                  </div>

                  {/* Opción 3: Deshabilitadas */}
                  <div
                    onClick={() => updateRoomSettings({ speakerRequestMode: 'disabled' })}
                    style={{
                      border: `1.5px solid ${roomSettings.speakerRequestMode === 'disabled' ? '#ef4444' : 'var(--subborder-color)'}`,
                      backgroundColor: roomSettings.speakerRequestMode === 'disabled' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255,255,255,0.02)',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: roomSettings.speakerRequestMode === 'disabled' ? '#ef4444' : 'var(--text-color)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Lock size={14} /> Deshabilitadas
                      </span>
                      {roomSettings.speakerRequestMode === 'disabled' && <CheckCircle2 size={16} color="#ef4444" />}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', lineHeight: '1.3' }}>
                      Los delegados no pueden solicitar añadirse a la lista desde su interfaz.
                    </span>
                  </div>
                </div>
              </div>

              {/* Sección 2: Solicitudes de Caucus Moderado */}
              <div style={{
                backgroundColor: 'var(--card-header-bg)',
                border: '1px solid var(--subborder-color)',
                borderRadius: '14px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: '800', fontSize: '0.95rem' }}>
                    <Clock size={18} color="#a855f7" /> Modo de Solicitudes a Caucus Moderado
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                    Control de incorporación de delegados a la lista de oradores durante un debate moderado.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {/* Opción 1: Directas */}
                  <div
                    onClick={() => updateRoomSettings({ caucusRequestMode: 'direct' })}
                    style={{
                      border: `1.5px solid ${roomSettings.caucusRequestMode === 'direct' ? '#22c55e' : 'var(--subborder-color)'}`,
                      backgroundColor: roomSettings.caucusRequestMode === 'direct' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255,255,255,0.02)',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: roomSettings.caucusRequestMode === 'direct' ? '#22c55e' : 'var(--text-color)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Zap size={14} /> Directas
                      </span>
                      {roomSettings.caucusRequestMode === 'direct' && <CheckCircle2 size={16} color="#22c55e" />}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', lineHeight: '1.3' }}>
                      Ingreso instantáneo a la cola del Caucus.
                    </span>
                  </div>

                  {/* Opción 2: Requiere Aprobación */}
                  <div
                    onClick={() => updateRoomSettings({ caucusRequestMode: 'approval' })}
                    style={{
                      border: `1.5px solid ${roomSettings.caucusRequestMode === 'approval' ? '#eab308' : 'var(--subborder-color)'}`,
                      backgroundColor: roomSettings.caucusRequestMode === 'approval' ? 'rgba(234, 179, 8, 0.12)' : 'rgba(255,255,255,0.02)',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: roomSettings.caucusRequestMode === 'approval' ? '#eab308' : 'var(--text-color)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Hand size={14} /> Con Aprobación
                      </span>
                      {roomSettings.caucusRequestMode === 'approval' && <CheckCircle2 size={16} color="#eab308" />}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', lineHeight: '1.3' }}>
                      La Mesa o Secretaría autoriza cada turno de Caucus.
                    </span>
                  </div>

                  {/* Opción 3: Deshabilitadas */}
                  <div
                    onClick={() => updateRoomSettings({ caucusRequestMode: 'disabled' })}
                    style={{
                      border: `1.5px solid ${roomSettings.caucusRequestMode === 'disabled' ? '#ef4444' : 'var(--subborder-color)'}`,
                      backgroundColor: roomSettings.caucusRequestMode === 'disabled' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255,255,255,0.02)',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: roomSettings.caucusRequestMode === 'disabled' ? '#ef4444' : 'var(--text-color)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Lock size={14} /> Deshabilitadas
                      </span>
                      {roomSettings.caucusRequestMode === 'disabled' && <CheckCircle2 size={16} color="#ef4444" />}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', lineHeight: '1.3' }}>
                      Peticiones de orador bloqueadas durante el Caucus.
                    </span>
                  </div>
                </div>
              </div>

              {/* Sección 3: Permisos de Acciones y Notas */}
              <div style={{
                backgroundColor: 'var(--card-header-bg)',
                border: '1px solid var(--subborder-color)',
                borderRadius: '14px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: '800', fontSize: '0.95rem' }}>
                  <Shield size={18} color="#10b981" /> Permisos y Capacidades de Delegados
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  {/* Toggle Notas entre Delegados */}
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={15} /> Notas entre Delegaciones
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>Permite pajes privados entre delegados</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={roomSettings.allowDelegateNotes}
                      onChange={e => updateRoomSettings({ allowDelegateNotes: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#22c55e' }}
                    />
                  </div>

                  {/* Toggle Notas a la Mesa */}
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Landmark size={15} /> Notas a la Mesa (Chair)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>Permite mensajes directos a la Mesa</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={roomSettings.allowChairNotes}
                      onChange={e => updateRoomSettings({ allowChairNotes: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#22c55e' }}
                    />
                  </div>

                  {/* Toggle Proponer Mociones */}
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FileText size={15} /> Proponer Mociones y Puntos
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>Permite formular mociones desde su panel</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={roomSettings.allowMotions}
                      onChange={e => updateRoomSettings({ allowMotions: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#22c55e' }}
                    />
                  </div>

                  {/* Toggle Votación en Vivo */}
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Vote size={15} /> Votación Telemática en Vivo
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>Permite emitir voto en votaciones activas</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={roomSettings.allowLiveVoting}
                      onChange={e => updateRoomSettings({ allowLiveVoting: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#22c55e' }}
                    />
                  </div>
                </div>
              </div>

              {/* Sección 4: Contraseñas de Acceso Especial */}
              <div style={{
                backgroundColor: 'var(--card-header-bg)',
                border: '1px solid var(--subborder-color)',
                borderRadius: '14px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: '800', fontSize: '0.95rem' }}>
                  <Key size={18} color="#f59e0b" /> Contraseñas de Secretaría y Backroom
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Pass Secretaría */}
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                      Contraseña Secretaría
                    </label>
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type={mostrarPassSecreto ? 'text' : 'password'}
                          value={secretPassword}
                          onChange={e => setSecretPassword(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--subborder-color)',
                            borderRadius: '8px',
                            padding: '0.55rem 2rem 0.55rem 0.75rem',
                            color: 'var(--text-color)',
                            fontSize: '0.85rem'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarPassSecreto(!mostrarPassSecreto)}
                          style={{
                            position: 'absolute',
                            right: '6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--muted-text)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {mostrarPassSecreto ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => generarPasswordRandom('secret')}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--subborder-color)',
                          borderRadius: '8px',
                          padding: '0 0.6rem',
                          color: 'var(--text-color)',
                          cursor: 'pointer'
                        }}
                        title="Generar contraseña aleatoria"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Pass Backroom */}
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                      Contraseña Backroom / Crisis
                    </label>
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type={mostrarPassBackroom ? 'text' : 'password'}
                          value={backroomPassword}
                          onChange={e => setBackroomPassword(e.target.value)}
                          style={{
                            width: '100%',
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--subborder-color)',
                            borderRadius: '8px',
                            padding: '0.55rem 2rem 0.55rem 0.75rem',
                            color: 'var(--text-color)',
                            fontSize: '0.85rem'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarPassBackroom(!mostrarPassBackroom)}
                          style={{
                            position: 'absolute',
                            right: '6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--muted-text)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {mostrarPassBackroom ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => generarPasswordRandom('backroom')}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--subborder-color)',
                          borderRadius: '8px',
                          padding: '0 0.6rem',
                          color: 'var(--text-color)',
                          cursor: 'pointer'
                        }}
                        title="Generar contraseña aleatoria"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════ */}
          {/* PESTAÑA 3: CONEXIONES EN VIVO                           */}
          {/* ═══════════════════════════════════════════════════════ */}
          {tabActiva === 'CONEXIONES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                  Dispositivos Conectados ({connectedPeers.length})
                </div>
                <input
                  type="text"
                  placeholder="Buscar país o rol..."
                  value={filtroConexiones}
                  onChange={e => setFiltroConexiones(e.target.value)}
                  style={{
                    backgroundColor: 'var(--card-header-bg)',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '8px',
                    padding: '0.45rem 0.8rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-color)',
                    width: '200px'
                  }}
                />
              </div>

              {conexionesFiltradas.length === 0 ? (
                <div style={{
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--card-header-bg)',
                  borderRadius: '12px',
                  border: '1px dashed var(--subborder-color)',
                  color: 'var(--muted-text)',
                  fontSize: '0.85rem'
                }}>
                  <Users size={32} style={{ opacity: 0.35, marginBottom: '0.5rem' }} />
                  <div>No hay dispositivos conectados en este momento.</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    Comparte el enlace o código para que los delegados se unan.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {conexionesFiltradas.map(peer => (
                    <div
                      key={peer.peerId}
                      style={{
                        backgroundColor: 'var(--card-header-bg)',
                        border: '1px solid var(--subborder-color)',
                        borderRadius: '10px',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#22c55e',
                          boxShadow: '0 0 6px #22c55e'
                        }} />
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>
                            {peer.country || 'Sin Nombre'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>
                            Peer ID: {peer.peerId.substring(0, 10)}... • Rol: {peer.role}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          backgroundColor: peer.role === 'secretariat' ? 'rgba(59, 130, 246, 0.15)' : (peer.role === 'backroom' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(34, 197, 94, 0.15)'),
                          color: peer.role === 'secretariat' ? '#60a5fa' : (peer.role === 'backroom' ? '#fb923c' : '#4ade80')
                        }}>
                          {peer.role?.toUpperCase()}
                        </span>

                        <button
                          onClick={() => {
                            if (confirm(`¿Deseas desconectar a ${peer.country || peer.peerId}?`)) {
                              kickPeer(peer.peerId);
                            }
                          }}
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            borderRadius: '6px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                          title="Expulsar de la sesión"
                        >
                          <UserX size={13} /> Expulsar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════ */}
          {/* PESTAÑA 4: COLA DE SOLICITUDES DE ORADORES               */}
          {/* ═══════════════════════════════════════════════════════ */}
          {tabActiva === 'SOLICITUDES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                Solicitudes de Turno y Mociones Pendientes ({speakingRequests.length})
              </div>

              {speakingRequests.length === 0 ? (
                <div style={{
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--card-header-bg)',
                  borderRadius: '12px',
                  border: '1px dashed var(--subborder-color)',
                  color: 'var(--muted-text)',
                  fontSize: '0.85rem'
                }}>
                  <MessageSquare size={32} style={{ opacity: 0.35, marginBottom: '0.5rem' }} />
                  <div>No hay solicitudes pendientes en este momento.</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    Cuando un delegado solicite turno o proponga una moción en modo aprobación, aparecerá aquí.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {speakingRequests.map(req => (
                    <div
                      key={req.id}
                      style={{
                        backgroundColor: 'var(--card-header-bg)',
                        border: '1px solid var(--subborder-color)',
                        borderRadius: '12px',
                        padding: '1rem 1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: req.speechType === 'GSL' ? 'rgba(59, 130, 246, 0.2)' : (req.speechType === 'CAUCUS' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(234, 179, 8, 0.2)'),
                            color: req.speechType === 'GSL' ? '#60a5fa' : (req.speechType === 'CAUCUS' ? '#c084fc' : '#facc15')
                          }}>
                            {req.speechType === 'GSL' ? 'Lista GSL' : (req.speechType === 'CAUCUS' ? 'Caucus' : 'Moción')}
                          </span>
                          <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>
                            {req.country}
                          </span>
                        </div>

                        {req.details?.tipo && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)', marginTop: '4px' }}>
                            Tipo: <strong>{req.details.tipo}</strong> {req.details.tema ? `• Tema: ${req.details.tema}` : ''}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => approveSpeakingRequest(req)}
                          style={{
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.45rem 0.95rem',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                          }}
                        >
                          <Check size={14} /> Aceptar
                        </button>

                        <button
                          onClick={() => rejectSpeakingRequest(req.id)}
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            borderRadius: '8px',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveSessionModal;
