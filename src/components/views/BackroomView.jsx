import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Send, 
  AlertTriangle, 
  MessageSquare, 
  LogOut, 
  Radio, 
  FileText, 
  Users, 
  Clock,
  Sparkles,
  Zap,
  Building2,
  Bell,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { useP2P } from '../../context/P2PContext';
import OpenMunLogo from '../common/OpenMunLogo';
import peerService from '../../services/peerService';

const BackroomView = ({ isLight, onExit }) => {
  const {
    roomId,
    notes,
    sendNote,
    remoteSessionState,
    leaveRoom
  } = useP2P();

  const [activeTab, setActiveTab] = useState('CRISIS'); // 'CRISIS' | 'DELEGADOS' | 'CHAIR'
  const [destinatario, setDestinatario] = useState('TODOS');
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [tituloCrisis, setTituloCrisis] = useState('');
  const [descripcionCrisis, setDescripcionCrisis] = useState('');
  const [historialCrisis, setHistorialCrisis] = useState([]);
  const [alertaEnviada, setAlertaEnviada] = useState(false);

  const state = remoteSessionState || {};
  const nombreComite = state.comision || state.nombreComite || 'Comité de Crisis / Gabinete';
  const paises = state.paises || [];

  // Filtrar notas relevantes para el Backroom
  const notasBackroom = notes.filter(n => 
    n.to === 'BACKROOM' || 
    n.fromRole === 'backroom' ||
    n.from?.toUpperCase() === 'BACKROOM' ||
    n.type === 'crisis'
  );

  const handleEnviarNota = (e) => {
    e.preventDefault();
    if (!mensajeTexto.trim()) return;

    const destino = activeTab === 'CHAIR' ? 'CHAIR' : destinatario;
    sendNote(destino, mensajeTexto.trim(), 'backroom');
    setMensajeTexto('');
  };

  const handleLanzarAlertaCrisis = (e) => {
    e.preventDefault();
    if (!tituloCrisis.trim()) return;

    const nuevaAlerta = {
      id: `crisis-${Date.now()}`,
      title: tituloCrisis.trim(),
      description: descripcionCrisis.trim(),
      timestamp: Date.now()
    };

    // Enviar alerta de crisis a través del peerService
    peerService.sendToServer('CRISIS_ALERT', {
      title: nuevaAlerta.title,
      description: nuevaAlerta.description,
      timestamp: nuevaAlerta.timestamp
    });

    // Enviar también como nota a TODOS
    sendNote('TODOS', `🚨 DIRECTIVA DE CRISIS: ${nuevaAlerta.title} - ${nuevaAlerta.description}`, 'crisis');

    setHistorialCrisis(prev => [nuevaAlerta, ...prev]);
    setTituloCrisis('');
    setDescripcionCrisis('');
    setAlertaEnviada(true);
    setTimeout(() => setAlertaEnviada(false), 4000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-color)',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ── Header de Backroom ── */}
      <header style={{
        padding: '0.85rem 1.5rem',
        backgroundColor: 'var(--header-bg)',
        borderBottom: '1px solid var(--subborder-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <OpenMunLogo height={32} isLight={isLight} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ fontWeight: '800', fontSize: '1.05rem', letterSpacing: '-0.01em', color: '#f97316' }}>
                Consola de Backroom y Crisis
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                backgroundColor: 'rgba(249, 115, 22, 0.15)',
                color: '#f97316',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f97316' }} />
                Sala: {roomId}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)' }}>
              Comando de incidentes, directivas de emergencia e inteligencia
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('¿Deseas desconectarte del Backroom?')) {
              leaveRoom();
              if (onExit) onExit();
            }
          }}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            padding: '0.45rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <LogOut size={14} /> Salir
        </button>
      </header>

      {/* ── Sub-navegación ── */}
      <div style={{
        backgroundColor: 'var(--subnav-bg)',
        borderBottom: '1px solid var(--subborder-color)',
        padding: '0.4rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('CRISIS')}
          style={{
            padding: '0.5rem 0.95rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'CRISIS' ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
            color: activeTab === 'CRISIS' ? '#f97316' : 'var(--muted-text)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <ShieldAlert size={15} /> Lanzador de Crisis
        </button>

        <button
          onClick={() => setActiveTab('DELEGADOS')}
          style={{
            padding: '0.5rem 0.95rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'DELEGADOS' ? 'var(--btn-bg)' : 'transparent',
            color: activeTab === 'DELEGADOS' ? 'var(--btn-text)' : 'var(--muted-text)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <MessageSquare size={15} /> Mensajería y Filtraciones ({notasBackroom.length})
        </button>

        <button
          onClick={() => setActiveTab('CHAIR')}
          style={{
            padding: '0.5rem 0.95rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'CHAIR' ? 'var(--btn-bg)' : 'transparent',
            color: activeTab === 'CHAIR' ? 'var(--btn-text)' : 'var(--muted-text)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <Building2 size={15} /> Canal Directo con la Mesa
        </button>
      </div>

      {/* ── Contenido Principal ── */}
      <main style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
        {activeTab === 'CRISIS' && (
          <div style={{ maxWidth: '850px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem' }}>
            {/* Redactar y Emitir Alerta de Crisis */}
            <div style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.1rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '1.1rem', color: '#f97316' }}>
                  <ShieldAlert size={20} /> Transmitir Directiva de Crisis
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '3px' }}>
                  Emite una alerta de emergencia visual e instantánea a todos los delegados conectados.
                </div>
              </div>

              {alertaEnviada && (
                <div style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  color: '#22c55e',
                  borderRadius: '8px',
                  padding: '0.7rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle2 size={18} /> ¡Alerta de crisis transmitida con éxito a toda la sala!
                </div>
              )}

              <form onSubmit={handleLanzarAlertaCrisis} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                    Titular del Evento / Directiva
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Ataque cibernético a la red eléctrica nacional"
                    value={tituloCrisis}
                    onChange={e => setTituloCrisis(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '0.35rem',
                      backgroundColor: 'var(--card-header-bg)',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '10px',
                      padding: '0.7rem 1rem',
                      color: 'var(--text-color)',
                      fontWeight: '800',
                      fontSize: '0.92rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                    Detalles y Consecuencias del Comunicado
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Describe los hechos, actores involucrados, ultimátums y directivas para los comités..."
                    value={descripcionCrisis}
                    onChange={e => setDescripcionCrisis(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '0.35rem',
                      backgroundColor: 'var(--card-header-bg)',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      color: 'var(--text-color)',
                      fontSize: '0.88rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!tituloCrisis.trim()}
                  style={{
                    backgroundColor: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.8rem',
                    fontWeight: '800',
                    fontSize: '0.92rem',
                    cursor: tituloCrisis.trim() ? 'pointer' : 'not-allowed',
                    opacity: tituloCrisis.trim() ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 18px rgba(234, 88, 12, 0.4)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Zap size={18} /> Lanzar Alerta de Crisis a la Sala
                </button>
              </form>
            </div>

            {/* Historial de Directivas */}
            <div style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Clock size={16} color="#f97316" /> Registro de Crisis Emitidas ({historialCrisis.length})
              </div>

              {historialCrisis.length === 0 ? (
                <div style={{
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: 'var(--muted-text)',
                  fontSize: '0.82rem'
                }}>
                  No se han emitido alertas de crisis en esta sesión.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {historialCrisis.map(c => (
                    <div
                      key={c.id}
                      style={{
                        backgroundColor: 'var(--card-header-bg)',
                        border: '1px solid var(--subborder-color)',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#f97316' }}>
                          🚨 {c.title}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>
                          {new Date(c.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {c.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                          {c.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'DELEGADOS' || activeTab === 'CHAIR') && (
          <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Formulario de envío */}
            <form onSubmit={handleEnviarNota} style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Send size={16} color="#f97316" />
                {activeTab === 'CHAIR' ? 'Mensaje Confidencial a la Mesa (Chair)' : 'Filtración / Nota a Delegación'}
              </div>

              {activeTab === 'DELEGADOS' && (
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                    Destinatario
                  </label>
                  <select
                    value={destinatario}
                    onChange={e => setDestinatario(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '0.35rem',
                      backgroundColor: 'var(--card-header-bg)',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '8px',
                      padding: '0.6rem',
                      color: 'var(--text-color)',
                      fontWeight: '700'
                    }}
                  >
                    <option value="TODOS">📢 TODA LA SALA (Público)</option>
                    <optgroup label="Delegaciones">
                      {paises.map(p => (
                        <option key={p.nombre} value={p.nombre}>{p.bandera || '🇺🇳'} {p.nombre}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                  Contenido
                </label>
                <textarea
                  rows={3}
                  placeholder={activeTab === 'CHAIR' ? 'Escribe instrucciones secretas para la Mesa...' : 'Escribe información clasificada o filtración...'}
                  value={mensajeTexto}
                  onChange={e => setMensajeTexto(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '0.35rem',
                    backgroundColor: 'var(--card-header-bg)',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '8px',
                    padding: '0.65rem',
                    color: 'var(--text-color)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!mensajeTexto.trim()}
                style={{
                  backgroundColor: 'var(--btn-bg)',
                  color: 'var(--btn-text)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: mensajeTexto.trim() ? 'pointer' : 'not-allowed',
                  opacity: mensajeTexto.trim() ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <Send size={14} /> Despachar
              </button>
            </form>

            {/* Feed de notas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>
                Historial de Mensajes ({notasBackroom.length})
              </div>

              {notasBackroom.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-text)', fontSize: '0.82rem' }}>
                  No hay mensajes registrados.
                </div>
              ) : (
                notasBackroom.map(n => (
                  <div
                    key={n.id}
                    style={{
                      backgroundColor: 'var(--panel-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: '800', color: '#f97316' }}>
                        {n.from} ➔ {n.to}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>
                        {new Date(n.timestamp || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                      {n.text}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BackroomView;
