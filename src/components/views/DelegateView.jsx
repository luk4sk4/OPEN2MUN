import React, { useState } from 'react';
import { 
  Radio, 
  Send, 
  Mic, 
  Clock, 
  MessageSquare, 
  FileText, 
  LogOut, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Inbox,
  PenTool,
  HelpCircle,
  Vote
} from 'lucide-react';
import { useP2P } from '../../context/P2PContext';
import OpenMunLogo from '../common/OpenMunLogo';

const DelegateView = ({ isLight, onExit }) => {
  const {
    clientCountry,
    roomId,
    connectionStatus,
    notes,
    sendNote,
    requestSpeaking,
    remoteSessionState,
    leaveRoom
  } = useP2P();

  const [activeTab, setActiveTab] = useState('DEBATE'); // 'DEBATE' | 'NOTAS'
  const [destinatario, setDestinatario] = useState('CHAIR');
  const [textoNota, setTextoNota] = useState('');
  const [tipoNota, setTipoNota] = useState('general'); // 'general' | 'urgente' | 'pregunta'
  const [pedirMocionOpen, setPedirMocionOpen] = useState(false);
  const [tipoMocion, setTipoMocion] = useState('Caucus Moderado');
  const [temaMocion, setTemaMocion] = useState('');
  const [tiempoTotalMocion, setTiempoTotalMocion] = useState(600);
  const [tiempoOradorMocion, setTiempoOradorMocion] = useState(45);
  const [solicitudGSLHecha, setSolicitudGSLHecha] = useState(false);
  const [solicitudCaucusHecha, setSolicitudCaucusHecha] = useState(false);
  const [subTabNotas, setSubTabNotas] = useState('BUZON'); // 'BUZON' | 'REDACTAR'

  // Estado sincronizado desde el Chair
  const state = remoteSessionState || {};
  const oradorActualGSL = state.oradoresCola?.[0]?.nombre || 'Ninguno';
  const oradorActualCaucus = state.oradoresCaucus?.[0]?.nombre || 'Ninguno';
  const temaActual = state.agendaSesion?.temaActual || state.caucusActivo?.tema || 'Sesión en curso';
  const paisesDisponibles = state.paises || [];

  const handlePedirGSL = () => {
    requestSpeaking('GSL', { country: clientCountry });
    setSolicitudGSLHecha(true);
    setTimeout(() => setSolicitudGSLHecha(false), 4000);
  };

  const handlePedirCaucus = () => {
    requestSpeaking('CAUCUS', { country: clientCountry });
    setSolicitudCaucusHecha(true);
    setTimeout(() => setSolicitudCaucusHecha(false), 4000);
  };

  const handleEnviarMocion = (e) => {
    e.preventDefault();
    requestSpeaking('POINT_MOTION', {
      country: clientCountry,
      tipo: tipoMocion,
      tema: temaMocion || tipoMocion,
      tiempoTotal: tiempoTotalMocion,
      tiempoOrador: tiempoOradorMocion
    });
    setPedirMocionOpen(false);
    setTemaMocion('');
    alert('Moción enviada a la Mesa (Chair)');
  };

  const handleEnviarNota = (e) => {
    e.preventDefault();
    if (!textoNota.trim()) return;

    sendNote(destinatario, textoNota.trim(), tipoNota);
    setTextoNota('');
    setSubTabNotas('BUZON');
  };

  // Filtrar notas que pertenecen a este país
  const misNotas = notes.filter(n => 
    n.from?.toLowerCase() === clientCountry?.toLowerCase() ||
    n.to?.toLowerCase() === clientCountry?.toLowerCase() ||
    n.to === 'TODOS'
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-color)',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ── Topbar del Delegado ── */}
      <header style={{
        padding: '0.75rem 1.25rem',
        backgroundColor: 'var(--header-bg)',
        borderBottom: '1px solid var(--subborder-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <OpenMunLogo height={30} isLight={isLight} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontWeight: '800', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                {clientCountry || 'Delegación'}
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                En Vivo ({roomId})
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>
              Sesión de Delegado
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('¿Deseas salir de la sesión?')) {
              leaveRoom();
              if (onExit) onExit();
            }
          }}
          style={{
            background: 'transparent',
            border: '1px solid var(--subborder-color)',
            borderRadius: '6px',
            color: 'var(--muted-text)',
            padding: '0.4rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <LogOut size={14} /> Salir
        </button>
      </header>

      {/* ── Tabs de Navegación del Delegado ── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--subborder-color)',
        backgroundColor: 'var(--subnav-bg)',
        padding: '0.35rem 1rem',
        gap: '0.5rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setActiveTab('DEBATE')}
          style={{
            flex: 1,
            maxWidth: '240px',
            padding: '0.55rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'DEBATE' ? 'var(--btn-bg)' : 'transparent',
            color: activeTab === 'DEBATE' ? 'var(--btn-text)' : 'var(--muted-text)',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Mic size={16} /> Debate y Palabra
        </button>

        <button
          onClick={() => setActiveTab('NOTAS')}
          style={{
            flex: 1,
            maxWidth: '240px',
            padding: '0.55rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'NOTAS' ? 'var(--btn-bg)' : 'transparent',
            color: activeTab === 'NOTAS' ? 'var(--btn-text)' : 'var(--muted-text)',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
        >
          <MessageSquare size={16} /> Notas y Pajes
          {misNotas.length > 0 && (
            <span style={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: '800',
              padding: '0.1rem 0.35rem',
              borderRadius: '999px',
              marginLeft: '2px'
            }}>
              {misNotas.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Contenido Principal ── */}
      <main style={{
        flex: 1,
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
        padding: '1.25rem 1rem 3rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {activeTab === 'DEBATE' && (
          <>
            {/* Tarjeta de Estado Actual del Comité */}
            <div style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Tema en Discusión
                  </span>
                  <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.15rem', fontWeight: '800' }}>
                    {temaActual}
                  </h3>
                </div>

                {state.caucusActivo?.activo && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    backgroundColor: 'rgba(249, 115, 22, 0.15)',
                    color: '#f97316',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(249, 115, 22, 0.3)'
                  }}>
                    {state.caucusActivo.tipo}
                  </span>
                )}
              </div>

              {/* Oradores Actuales */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{
                  backgroundColor: 'var(--card-header-bg)',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '8px',
                  padding: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                    🎙️ Orador Actual GSL
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', marginTop: '0.25rem' }}>
                    {oradorActualGSL}
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'var(--card-header-bg)',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '8px',
                  padding: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                    ⏱️ Orador Caucus / Debate
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', marginTop: '0.25rem' }}>
                    {oradorActualCaucus}
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción de Palabra */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <button
                onClick={handlePedirGSL}
                style={{
                  backgroundColor: solicitudGSLHecha ? '#22c55e' : 'var(--btn-bg)',
                  color: solicitudGSLHecha ? '#ffffff' : 'var(--btn-text)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontWeight: '800',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease'
                }}
              >
                {solicitudGSLHecha ? <CheckCircle size={20} /> : <Mic size={20} />}
                {solicitudGSLHecha ? '¡Turno GSL Solicitado a la Mesa!' : 'Levantar Mano / Pedir Palabra GSL'}
              </button>

              <button
                onClick={handlePedirCaucus}
                style={{
                  backgroundColor: solicitudCaucusHecha ? '#22c55e' : 'var(--card-header-bg)',
                  color: solicitudCaucusHecha ? '#ffffff' : 'var(--text-color)',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {solicitudCaucusHecha ? <CheckCircle size={18} /> : <Clock size={18} />}
                {solicitudCaucusHecha ? '¡Turno de Caucus Solicitado!' : 'Pedir Palabra en Debate / Caucus'}
              </button>

              <button
                onClick={() => setPedirMocionOpen(true)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px dashed var(--border-color)',
                  color: 'var(--muted-text)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Vote size={16} /> Enviar Moción o Punto de Procedimiento
              </button>
            </div>

            {/* Modal de Enviar Moción */}
            {pedirMocionOpen && (
              <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}>
                <div style={{
                  backgroundColor: 'var(--panel-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  maxWidth: '440px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>Proponer Moción / Punto</h4>
                    <button onClick={() => setPedirMocionOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--muted-text)', cursor: 'pointer' }}>✕</button>
                  </div>

                  <form onSubmit={handleEnviarMocion} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)' }}>Tipo de Moción</label>
                      <select
                        value={tipoMocion}
                        onChange={e => setTipoMocion(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--card-header-bg)',
                          border: '1px solid var(--subborder-color)',
                          borderRadius: '6px',
                          padding: '0.55rem',
                          color: 'var(--text-color)',
                          fontSize: '0.85rem',
                          marginTop: '0.25rem'
                        }}
                      >
                        <option value="Caucus Moderado">Caucus Moderado</option>
                        <option value="Caucus No Moderado">Caucus No Moderado</option>
                        <option value="Consulta General">Consulta General</option>
                        <option value="Tour de Table">Tour de Table</option>
                        <option value="Punto de Orden">Punto de Orden</option>
                        <option value="Duda Parlamentaria">Duda Parlamentaria</option>
                        <option value="Privilegio Personal">Privilegio Personal</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)' }}>Tema / Explicación</label>
                      <input
                        type="text"
                        placeholder="Ej: Estrategia de reducción de emisiones..."
                        value={temaMocion}
                        onChange={e => setTemaMocion(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--card-header-bg)',
                          border: '1px solid var(--subborder-color)',
                          borderRadius: '6px',
                          padding: '0.55rem',
                          color: 'var(--text-color)',
                          fontSize: '0.85rem',
                          marginTop: '0.25rem'
                        }}
                      />
                    </div>

                    {tipoMocion.includes('Caucus') && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--muted-text)' }}>Tiempo Total (s)</label>
                          <input
                            type="number"
                            value={tiempoTotalMocion}
                            onChange={e => setTiempoTotalMocion(Number(e.target.value))}
                            style={{
                              width: '100%',
                              backgroundColor: 'var(--card-header-bg)',
                              border: '1px solid var(--subborder-color)',
                              borderRadius: '6px',
                              padding: '0.45rem',
                              color: 'var(--text-color)',
                              fontSize: '0.85rem',
                              marginTop: '0.25rem'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--muted-text)' }}>Tiempo/Orador (s)</label>
                          <input
                            type="number"
                            value={tiempoOradorMocion}
                            onChange={e => setTiempoOradorMocion(Number(e.target.value))}
                            style={{
                              width: '100%',
                              backgroundColor: 'var(--card-header-bg)',
                              border: '1px solid var(--subborder-color)',
                              borderRadius: '6px',
                              padding: '0.45rem',
                              color: 'var(--text-color)',
                              fontSize: '0.85rem',
                              marginTop: '0.25rem'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setPedirMocionOpen(false)}
                        style={{
                          flex: 1,
                          padding: '0.55rem',
                          borderRadius: '6px',
                          border: '1px solid var(--subborder-color)',
                          backgroundColor: 'transparent',
                          color: 'var(--muted-text)',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        style={{
                          flex: 1,
                          padding: '0.55rem',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: 'var(--btn-bg)',
                          color: 'var(--btn-text)',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        Enviar Moción
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'NOTAS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Subtabs de Notas */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--subborder-color)', paddingBottom: '0.5rem' }}>
              <button
                onClick={() => setSubTabNotas('BUZON')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: subTabNotas === 'BUZON' ? 'var(--btn-bg)' : 'transparent',
                  color: subTabNotas === 'BUZON' ? 'var(--btn-text)' : 'var(--muted-text)',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Inbox size={14} /> Buzón ({misNotas.length})
              </button>

              <button
                onClick={() => setSubTabNotas('REDACTAR')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: subTabNotas === 'REDACTAR' ? 'var(--btn-bg)' : 'transparent',
                  color: subTabNotas === 'REDACTAR' ? 'var(--btn-text)' : 'var(--muted-text)',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <PenTool size={14} /> Redactar Nota
              </button>
            </div>

            {subTabNotas === 'REDACTAR' ? (
              <form onSubmit={handleEnviarNota} style={{
                backgroundColor: 'var(--panel-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
              }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                    Destinatario
                  </label>
                  <select
                    value={destinatario}
                    onChange={e => setDestinatario(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--card-header-bg)',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '6px',
                      padding: '0.6rem 0.75rem',
                      color: 'var(--text-color)',
                      fontSize: '0.88rem',
                      fontWeight: '600',
                      marginTop: '0.35rem'
                    }}
                  >
                    <optgroup label="Mesa y Staff">
                      <option value="CHAIR">🏛️ Mesa de Presidencia (Chair)</option>
                      <option value="BACKROOM">🚨 Backroom / Crisis</option>
                    </optgroup>
                    <optgroup label="Otras Delegaciones">
                      {paisesDisponibles.length > 0 ? (
                        paisesDisponibles
                          .filter(p => p.nombre.toLowerCase() !== clientCountry?.toLowerCase())
                          .map(p => (
                            <option key={p.id || p.nombre} value={p.nombre}>{p.bandera || '🇺🇳'} {p.nombre}</option>
                          ))
                      ) : (
                        <option value="Francia">Francia</option>
                      )}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                    Mensaje / Nota
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Escribe el contenido de la nota para los pajes o destinatario..."
                    value={textoNota}
                    onChange={e => setTextoNota(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--card-header-bg)',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '6px',
                      padding: '0.65rem 0.75rem',
                      color: 'var(--text-color)',
                      fontSize: '0.88rem',
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
                    padding: '0.75rem 1.25rem',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  <Send size={15} /> Enviar Nota
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {misNotas.length === 0 ? (
                  <div style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    color: 'var(--muted-text)',
                    backgroundColor: 'var(--card-header-bg)',
                    borderRadius: '10px',
                    border: '1px dashed var(--subborder-color)',
                    fontSize: '0.85rem'
                  }}>
                    Aún no has enviado ni recibido ninguna nota en esta sesión.
                  </div>
                ) : (
                  misNotas.map(nota => {
                    const esEnviadaPorMi = nota.from?.toLowerCase() === clientCountry?.toLowerCase();
                    return (
                      <div
                        key={nota.id}
                        style={{
                          backgroundColor: esEnviadaPorMi ? 'var(--card-header-bg)' : 'var(--panel-color)',
                          border: `1px solid ${esEnviadaPorMi ? 'var(--subborder-color)' : '#3b82f644'}`,
                          borderRadius: '10px',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: '700', color: esEnviadaPorMi ? 'var(--muted-text)' : '#60a5fa' }}>
                            {esEnviadaPorMi ? `Para: ${nota.to}` : `De: ${nota.from}`}
                          </span>
                          <span style={{ color: 'var(--muted-text)', fontSize: '0.7rem' }}>
                            {new Date(nota.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.88rem', lineHeight: '1.4' }}>
                          {nota.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DelegateView;
