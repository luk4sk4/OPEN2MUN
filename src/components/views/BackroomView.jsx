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
  Building2
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

  const [activeTab, setActiveTab] = useState('DELEGADOS'); // 'DELEGADOS' | 'CHAIR' | 'CRISIS'
  const [destinatario, setDestinatario] = useState('TODOS');
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [tituloCrisis, setTituloCrisis] = useState('');
  const [descripcionCrisis, setDescripcionCrisis] = useState('');

  const state = remoteSessionState || {};
  const nombreComite = state.comision || state.nombreComite || 'Comité de Crisis';
  const paises = state.paises || [];

  // Filtrar notas relevantes para el Backroom
  const notasBackroom = notes.filter(n => 
    n.to === 'BACKROOM' || 
    n.fromRole === 'backroom' ||
    n.from?.toUpperCase() === 'BACKROOM'
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

    // Enviar alerta de crisis a través del peerService
    peerService.sendToServer('CRISIS_ALERT', {
      title: tituloCrisis.trim(),
      description: descripcionCrisis.trim(),
      timestamp: Date.now()
    });

    // Enviar también como nota a TODOS
    sendNote('TODOS', `🚨 DIRECTIVA DE CRISIS: ${tituloCrisis} - ${descripcionCrisis}`, 'crisis');

    setTituloCrisis('');
    setDescripcionCrisis('');
    alert('¡Alerta de crisis transmitida a todas las delegaciones!');
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
        padding: '0.75rem 1.5rem',
        backgroundColor: 'var(--header-bg)',
        borderBottom: '1px solid var(--subborder-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <OpenMunLogo height={32} isLight={isLight} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: '800', fontSize: '1rem', letterSpacing: '-0.01em', color: '#f97316' }}>
                Consola de Backroom / Crisis
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                backgroundColor: 'rgba(249, 115, 22, 0.15)',
                color: '#f97316',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f97316' }} />
                Sala: {roomId}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>
              Comunicaciones secretas y directivas de crisis
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
            background: 'transparent',
            border: '1px solid var(--subborder-color)',
            borderRadius: '6px',
            color: '#ef4444',
            padding: '0.4rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <LogOut size={13} /> Salir
        </button>
      </header>

      {/* ── Tabs de Navegación de Crisis ── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--subborder-color)',
        backgroundColor: 'var(--subnav-bg)',
        padding: '0.35rem 1rem',
        gap: '0.5rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setActiveTab('DELEGADOS')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'DELEGADOS' ? 'var(--btn-bg)' : 'transparent',
            color: activeTab === 'DELEGADOS' ? 'var(--btn-text)' : 'var(--muted-text)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Users size={14} /> Notas con Delegaciones
        </button>

        <button
          onClick={() => setActiveTab('CHAIR')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'CHAIR' ? 'var(--btn-bg)' : 'transparent',
            color: activeTab === 'CHAIR' ? 'var(--btn-text)' : 'var(--muted-text)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Building2 size={14} /> Canal con la Mesa (Chair)
        </button>

        <button
          onClick={() => setActiveTab('CRISIS')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'CRISIS' ? 'var(--btn-bg)' : 'transparent',
            color: activeTab === 'CRISIS' ? 'var(--btn-text)' : 'var(--muted-text)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Zap size={14} color="#f97316" /> Lanzar Directiva de Crisis
        </button>
      </div>

      {/* ── Contenido ── */}
      <main style={{
        flex: 1,
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto',
        padding: '1.5rem 1rem 3rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {activeTab !== 'CRISIS' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Formulario de Envío de Nota */}
            <form onSubmit={handleEnviarNota} style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
              height: 'fit-content'
            }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800' }}>
                {activeTab === 'CHAIR' ? 'Enviar Nota a la Mesa' : 'Enviar Nota / Directiva Secreta'}
              </h4>

              {activeTab === 'DELEGADOS' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                    Delegación Destino
                  </label>
                  <select
                    value={destinatario}
                    onChange={e => setDestinatario(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--card-header-bg)',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '6px',
                      padding: '0.55rem 0.75rem',
                      color: 'var(--text-color)',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      marginTop: '0.35rem'
                    }}
                  >
                    <option value="TODOS">📢 TODAS LAS DELEGACIONES (Comunicado)</option>
                    {paises.map(p => (
                      <option key={p.id || p.nombre} value={p.nombre}>{p.bandera || '🇺🇳'} {p.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                  Contenido del Mensaje
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Redacta la respuesta de crisis o información clasificada..."
                  value={mensajeTexto}
                  onChange={e => setMensajeTexto(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--card-header-bg)',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '6px',
                    padding: '0.65rem 0.75rem',
                    color: 'var(--text-color)',
                    fontSize: '0.85rem',
                    marginTop: '0.35rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--btn-bg)',
                  color: 'var(--btn-text)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.7rem 1.25rem',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                <Send size={15} /> Enviar Mensaje
              </button>
            </form>

            {/* Historial de Notas del Backroom */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-color)' }}>
                Registro de Mensajes ({notasBackroom.length})
              </span>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxHeight: '480px',
                overflowY: 'auto'
              }}>
                {notasBackroom.length === 0 ? (
                  <div style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    color: 'var(--muted-text)',
                    backgroundColor: 'var(--card-header-bg)',
                    borderRadius: '10px',
                    border: '1px dashed var(--subborder-color)',
                    fontSize: '0.82rem'
                  }}>
                    No hay mensajes intercambiados todavía.
                  </div>
                ) : (
                  notasBackroom.map(nota => {
                    const esMio = nota.fromRole === 'backroom' || nota.from?.toUpperCase() === 'BACKROOM';
                    return (
                      <div
                        key={nota.id}
                        style={{
                          backgroundColor: esMio ? 'var(--card-header-bg)' : 'var(--panel-color)',
                          border: `1px solid ${esMio ? 'var(--subborder-color)' : '#f9731644'}`,
                          borderRadius: '8px',
                          padding: '0.75rem 0.9rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.3rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                          <span style={{ fontWeight: '700', color: esMio ? '#f97316' : '#60a5fa' }}>
                            {esMio ? `Para: ${nota.to}` : `De: ${nota.from}`}
                          </span>
                          <span style={{ color: 'var(--muted-text)' }}>
                            {new Date(nota.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                          {nota.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Formulario de Directiva de Crisis Urgente */
          <form onSubmit={handleLanzarAlertaCrisis} style={{
            backgroundColor: 'var(--panel-color)',
            border: '1px solid #f9731666',
            borderRadius: '14px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 10px 30px rgba(249, 115, 22, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldAlert size={24} color="#f97316" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-color)' }}>
                  Emitir Directiva / Noticia de Crisis
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                  Esta directiva se transmitirá como alerta inmediata a todos los delegados conectados y a la mesa.
                </p>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                Titular de la Crisis
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Incidente en el Estrecho de Ormuz..."
                value={tituloCrisis}
                onChange={e => setTituloCrisis(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--card-header-bg)',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '6px',
                  padding: '0.65rem 0.85rem',
                  color: 'var(--text-color)',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  marginTop: '0.35rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                Detalles y Comunicado Oficial
              </label>
              <textarea
                rows={5}
                placeholder="Describe la actualización del escenario, condiciones y órdenes para las delegaciones..."
                value={descripcionCrisis}
                onChange={e => setDescripcionCrisis(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--card-header-bg)',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '6px',
                  padding: '0.65rem 0.85rem',
                  color: 'var(--text-color)',
                  fontSize: '0.85rem',
                  marginTop: '0.35rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: '#f97316',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.8rem 1.5rem',
                fontWeight: '800',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(249, 115, 22, 0.35)'
              }}
            >
              <Zap size={18} /> Transmitir Alerta a la Sala
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default BackroomView;
