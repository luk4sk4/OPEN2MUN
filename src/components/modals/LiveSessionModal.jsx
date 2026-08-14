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
  MessageSquare
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useP2P } from '../../context/P2PContext';
import { useSession } from '../../context/SessionContext';

const LiveSessionModal = ({ isOpen, onClose, isLight }) => {
  const {
    connectionStatus,
    roomId,
    setRoomId,
    secretPassword,
    setSecretPassword,
    backroomPassword,
    setBackroomPassword,
    connectedPeers,
    startHosting,
    stopHosting,
    kickPeer,
    speakingRequests,
    setSpeakingRequests
  } = useP2P();

  const { agregarOrador, agregarOradorCaucus, agregarMocion } = useSession();

  const [copiado, setCopiado] = useState(false);
  const [mostrarPassSecreto, setMostrarPassSecreto] = useState(false);
  const [mostrarPassBackroom, setMostrarPassBackroom] = useState(false);
  const [tabActiva, setTabActiva] = useState('SALA'); // 'SALA' | 'CONEXIONES' | 'SOLICITUDES'

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

  const handleAceptarSolicitud = (req) => {
    if (req.speechType === 'GSL') {
      agregarOrador({ nombre: req.country, bandera: '🇺🇳' });
    } else if (req.speechType === 'CAUCUS') {
      agregarOradorCaucus({ nombre: req.country, bandera: '🇺🇳' });
    } else if (req.speechType === 'POINT_MOTION') {
      agregarMocion({
        tipo: req.details?.tipo || 'Punto de Orden',
        proponente: req.country,
        tema: req.details?.tema || 'Solicitud de Delegación',
        tiempoTotal: req.details?.tiempoTotal || 0,
        tiempoOrador: req.details?.tiempoOrador || 0
      });
    }
    // Remover de la cola de solicitudes pendientes
    setSpeakingRequests(prev => prev.filter(r => r.id !== req.id));
  };

  const handleRechazarSolicitud = (id) => {
    setSpeakingRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
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
        borderRadius: '16px',
        width: '680px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        color: 'var(--text-color)',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--card-header-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: isHostActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isHostActive ? '#22c55e' : '#3b82f6'
            }}>
              <Radio size={20} className={isHostActive ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
                Sesión en Vivo P2P (Mesa / Chair)
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                {isHostActive
                  ? `🟢 Sala activa • ${connectedPeers.length} dispositivos conectados`
                  : '⚪ La sala P2P está actualmente apagada'}
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
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
          padding: '0.35rem 1rem',
          gap: '0.5rem'
        }}>
          <button
            onClick={() => setTabActiva('SALA')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: tabActiva === 'SALA' ? 'var(--btn-bg)' : 'transparent',
              color: tabActiva === 'SALA' ? 'var(--btn-text)' : 'var(--muted-text)',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Radio size={14} /> Control de Sala
          </button>

          <button
            onClick={() => setTabActiva('CONEXIONES')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: tabActiva === 'CONEXIONES' ? 'var(--btn-bg)' : 'transparent',
              color: tabActiva === 'CONEXIONES' ? 'var(--btn-text)' : 'var(--muted-text)',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Users size={14} /> Conexiones ({connectedPeers.length})
          </button>

          <button
            onClick={() => setTabActiva('SOLICITUDES')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: tabActiva === 'SOLICITUDES' ? 'var(--btn-bg)' : 'transparent',
              color: tabActiva === 'SOLICITUDES' ? 'var(--btn-text)' : 'var(--muted-text)',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              position: 'relative'
            }}
          >
            <MessageSquare size={14} /> Solicitudes ({speakingRequests.length})
            {speakingRequests.length > 0 && (
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                boxShadow: '0 0 6px #ef4444'
              }} />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {tabActiva === 'SALA' && (
            <>
              {/* Botón Principal: Encender / Apagar Servidor P2P */}
              <div style={{
                backgroundColor: isHostActive ? 'rgba(34, 197, 94, 0.08)' : 'var(--card-header-bg)',
                border: `1px solid ${isHostActive ? '#22c55e44' : 'var(--subborder-color)'}`,
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: isHostActive ? '#22c55e' : '#71717a',
                      boxShadow: isHostActive ? '0 0 10px #22c55e' : 'none'
                    }} />
                    <span style={{ fontWeight: '800', fontSize: '1rem' }}>
                      {isHostActive ? 'Servidor P2P Activo y Emitiendo' : 'Servidor P2P Desconectado'}
                    </span>
                  </div>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                    {isHostActive
                      ? 'Los delegados pueden unirse escaneando el código QR o introduciendo el código.'
                      : 'Inicia el servidor para permitir que los delegados, secretaría y backroom se conecten en directo.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {isHostActive ? (
                    <button
                      onClick={stopHosting}
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.6rem 1.25rem',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Radio size={16} /> Detener Sala
                    </button>
                  ) : (
                    <button
                      disabled={isConnecting}
                      onClick={() => startHosting(roomId, secretPassword, backroomPassword)}
                      style={{
                        backgroundColor: 'var(--btn-bg)',
                        color: 'var(--btn-text)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.6rem 1.25rem',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        cursor: isConnecting ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Radio size={16} /> {isConnecting ? 'Iniciando...' : 'Iniciar Sala P2P'}
                    </button>
                  )}
                </div>
              </div>

              {/* Panel de Código de Sala y QR */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isHostActive ? '1fr 190px' : '1fr',
                gap: '1.25rem',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Input Código de Sala */}
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Código de Sala (Peer ID)
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                      <input
                        type="text"
                        disabled={isHostActive}
                        value={roomId}
                        onChange={e => setRoomId(e.target.value.toUpperCase())}
                        style={{
                          flex: 1,
                          backgroundColor: 'var(--card-header-bg)',
                          border: '1px solid var(--subborder-color)',
                          borderRadius: '8px',
                          padding: '0.65rem 0.9rem',
                          color: 'var(--text-color)',
                          fontWeight: '800',
                          fontFamily: 'monospace',
                          fontSize: '1.1rem',
                          letterSpacing: '0.05em'
                        }}
                      />
                      {isHostActive && (
                        <button
                          onClick={handleCopyLink}
                          style={{
                            backgroundColor: copiado ? '#22c55e' : 'var(--card-header-bg)',
                            border: '1px solid var(--subborder-color)',
                            color: copiado ? '#ffffff' : 'var(--text-color)',
                            borderRadius: '8px',
                            padding: '0 1rem',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.15s ease'
                          }}
                          title="Copiar enlace de invitación"
                        >
                          {copiado ? <Check size={16} /> : <Copy size={16} />}
                          {copiado ? 'Copiado' : 'Copiar Link'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Botón de Acceso Rápido a Secretaría Local */}
                  <div style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    border: '1px dashed rgba(59, 130, 246, 0.3)',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Layers size={15} color="#3b82f6" /> Pantalla Secreta Local (Doble Monitor)
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                        Abre una pestaña secundaria instantánea usando BroadcastChannel (cero lag, sin contraseña).
                      </div>
                    </div>
                    <button
                      onClick={handleOpenLocalSecretariat}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.45rem 0.85rem',
                        fontWeight: '700',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <ExternalLink size={13} /> Abrir Pestaña
                    </button>
                  </div>
                </div>

                {/* Código QR si el Host está activo */}
                {isHostActive && (
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '10px',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.35)',
                    alignSelf: 'center'
                  }}>
                    <QRCodeSVG
                      value={shareableJoinUrl}
                      size={155}
                      level="M"
                      includeMargin={false}
                    />
                    <span style={{ color: '#000000', fontSize: '0.65rem', fontWeight: '800', marginTop: '6px', textTransform: 'uppercase' }}>
                      Escanear para Unirse
                    </span>
                  </div>
                )}
              </div>

              {/* Configuración de Contraseñas Privadas */}
              <div style={{
                borderTop: '1px solid var(--subborder-color)',
                paddingTop: '1rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                {/* Contraseña Secretaría */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Key size={13} /> PIN Secretaría (Remota)
                  </label>
                  <div style={{ display: 'flex', position: 'relative', marginTop: '0.35rem' }}>
                    <input
                      type={mostrarPassSecreto ? 'text' : 'password'}
                      value={secretPassword}
                      onChange={e => setSecretPassword(e.target.value)}
                      placeholder="Contraseña secretaría"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--card-header-bg)',
                        border: '1px solid var(--subborder-color)',
                        borderRadius: '6px',
                        padding: '0.5rem 2.2rem 0.5rem 0.75rem',
                        color: 'var(--text-color)',
                        fontSize: '0.85rem',
                        fontWeight: '600'
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
                        padding: '4px'
                      }}
                    >
                      {mostrarPassSecreto ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Contraseña Backroom */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <ShieldAlert size={13} /> PIN Backroom / Crisis
                  </label>
                  <div style={{ display: 'flex', position: 'relative', marginTop: '0.35rem' }}>
                    <input
                      type={mostrarPassBackroom ? 'text' : 'password'}
                      value={backroomPassword}
                      onChange={e => setBackroomPassword(e.target.value)}
                      placeholder="Contraseña backroom"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--card-header-bg)',
                        border: '1px solid var(--subborder-color)',
                        borderRadius: '6px',
                        padding: '0.5rem 2.2rem 0.5rem 0.75rem',
                        color: 'var(--text-color)',
                        fontSize: '0.85rem',
                        fontWeight: '600'
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
                        padding: '4px'
                      }}
                    >
                      {mostrarPassBackroom ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {tabActiva === 'CONEXIONES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-color)' }}>
                  Dispositivos en línea ({connectedPeers.length})
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>
                  La lista se actualiza automáticamente
                </span>
              </div>

              {connectedPeers.length === 0 ? (
                <div style={{
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: 'var(--muted-text)',
                  backgroundColor: 'var(--card-header-bg)',
                  borderRadius: '10px',
                  border: '1px dashed var(--subborder-color)',
                  fontSize: '0.88rem'
                }}>
                  No hay delegaciones ni dispositivos conectados todavía.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {connectedPeers.map(peer => (
                    <div
                      key={peer.peerId}
                      style={{
                        backgroundColor: 'var(--card-header-bg)',
                        border: '1px solid var(--subborder-color)',
                        borderRadius: '8px',
                        padding: '0.65rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#22c55e',
                          boxShadow: '0 0 6px #22c55e'
                        }} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                            {peer.country || peer.role}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                            Rol: {peer.role} • ID: {peer.peerId?.substring(0, 10)}...
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => kickPeer(peer.peerId)}
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#ef4444',
                          borderRadius: '6px',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                        title="Desconectar este dispositivo de la sala"
                      >
                        <UserX size={13} /> Expulsar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tabActiva === 'SOLICITUDES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-color)' }}>
                  Peticiones de Turno y Mociones ({speakingRequests.length})
                </span>
                {speakingRequests.length > 0 && (
                  <button
                    onClick={() => setSpeakingRequests([])}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--muted-text)',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Limpiar todas
                  </button>
                )}
              </div>

              {speakingRequests.length === 0 ? (
                <div style={{
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: 'var(--muted-text)',
                  backgroundColor: 'var(--card-header-bg)',
                  borderRadius: '10px',
                  border: '1px dashed var(--subborder-color)',
                  fontSize: '0.88rem'
                }}>
                  No hay solicitudes de palabra pendientes en este momento.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {speakingRequests.map(req => (
                    <div
                      key={req.id}
                      style={{
                        backgroundColor: 'var(--card-header-bg)',
                        border: '1px solid var(--subborder-color)',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>{req.country}</span>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: '700',
                            backgroundColor: req.speechType === 'GSL' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                            color: req.speechType === 'GSL' ? '#c084fc' : '#60a5fa',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px'
                          }}>
                            {req.speechType}
                          </span>
                        </div>
                        {req.details?.tema && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                            Moción: {req.details.tema} ({req.details.tipo})
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleAceptarSolicitud(req)}
                          style={{
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <Check size={14} /> Añadir
                        </button>
                        <button
                          onClick={() => handleRechazarSolicitud(req.id)}
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid var(--subborder-color)',
                            color: 'var(--muted-text)',
                            borderRadius: '6px',
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--card-header-bg)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid var(--subborder-color)',
              backgroundColor: 'transparent',
              color: 'var(--text-color)',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionModal;
