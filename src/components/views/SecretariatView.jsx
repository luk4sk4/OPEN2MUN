import React, { useState } from 'react';
import { 
  Radio, 
  Layers, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  LogOut, 
  Users, 
  Clock, 
  MessageSquare, 
  Eye, 
  RefreshCw,
  Send,
  Building2,
  Sliders,
  CheckCircle2,
  Check,
  X,
  UserX,
  Shield,
  Zap,
  Vote,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useP2P } from '../../context/P2PContext';
import OpenMunLogo from '../common/OpenMunLogo';

const SecretariatView = ({ isLight, onExit }) => {
  const {
    roomId,
    notes,
    setNotes,
    connectedPeers,
    remoteSessionState,
    leaveRoom,
    sendNote,
    roomSettings,
    updateRoomSettings,
    speakingRequests,
    approveSpeakingRequest,
    rejectSpeakingRequest,
    kickPeer
  } = useP2P();

  const [activeTab, setActiveTab] = useState('NOTAS'); // 'NOTAS' | 'SOLICITUDES' | 'AJUSTES' | 'CONEXIONES' | 'DEBATE'
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS'); // 'TODOS' | 'CHAIR' | 'BACKROOM' | 'DELEGADOS'
  const [notaMesaTexto, setNotaMesaTexto] = useState('');
  const [notaMesaDestino, setNotaMesaDestino] = useState('TODOS');
  const [tipoNota, setTipoNota] = useState('general');

  const state = remoteSessionState || {};
  const nombreComite = state.comision || state.nombreComite || 'Comité en Vivo';
  const temaActual = state.agendaSesion?.temaActual || state.caucusActivo?.tema || 'En Discusión';
  const oradoresGSL = state.oradoresCola || [];
  const oradoresCaucus = state.oradoresCaucus || [];
  const caucusActivo = state.caucusActivo || {};
  const oradorActual = caucusActivo.activo ? (oradoresCaucus[0]?.nombre || 'Sin orador') : (oradoresGSL[0]?.nombre || 'Sin orador');
  const paises = state.paises || [];

  // Filtrado de Notas
  const notasFiltradas = notes.filter(n => {
    const coincideTexto = !filtroTexto || 
      n.from?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      n.to?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      n.text?.toLowerCase().includes(filtroTexto.toLowerCase());

    if (!coincideTexto) return false;

    if (filtroTipo === 'CHAIR') return n.to === 'CHAIR';
    if (filtroTipo === 'BACKROOM') return n.to === 'BACKROOM' || n.fromRole === 'backroom';
    if (filtroTipo === 'DELEGADOS') return n.to !== 'CHAIR' && n.to !== 'BACKROOM';
    return true;
  });

  const handleEnviarNotaSecretaria = (e) => {
    e.preventDefault();
    if (!notaMesaTexto.trim()) return;
    sendNote(notaMesaDestino, notaMesaTexto.trim(), tipoNota);
    setNotaMesaTexto('');
  };

  const handleExportarNotasJSON = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registro_notas_${roomId || 'openmun'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportarNotasCSV = () => {
    let csv = 'ID,Fecha,De,Rol,Para,Tipo,Mensaje\n';
    notes.forEach(n => {
      const fecha = new Date(n.timestamp || Date.now()).toLocaleTimeString();
      const msg = `"${(n.text || '').replace(/"/g, '""')}"`;
      csv += `${n.id || ''},${fecha},${n.from || ''},${n.fromRole || ''},${n.to || ''},${n.type || ''},${msg}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registro_notas_${roomId || 'openmun'}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
      {/* ── Header de Secretaría ── */}
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
              <span style={{ fontWeight: '800', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                Consola de Secretaría y Pajes
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#60a5fa' }} />
                Sala: {roomId || 'Local'}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{nombreComite}</span>
              <span>•</span>
              <span style={{ color: 'var(--text-color)', fontWeight: '600' }}>Tema: {temaActual}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Card de Orador en Curso */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--subborder-color)',
            borderRadius: '8px',
            padding: '0.35rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem'
          }}>
            <span style={{ color: 'var(--muted-text)' }}>Orador Actual:</span>
            <span style={{ fontWeight: '800', color: '#22c55e' }}>{oradorActual}</span>
          </div>

          <button
            onClick={handleExportarNotasCSV}
            style={{
              background: 'transparent',
              border: '1px solid var(--subborder-color)',
              borderRadius: '8px',
              color: 'var(--text-color)',
              padding: '0.45rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            title="Exportar archivo de notas en CSV para Excel"
          >
            <Download size={14} /> Exportar CSV
          </button>

          <button
            onClick={() => {
              if (confirm('¿Deseas salir del panel secreto de Secretaría?')) {
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
        </div>
      </header>

      {/* ── Sub-navegación por Pestañas ── */}
      <div style={{
        backgroundColor: 'var(--subnav-bg)',
        borderBottom: '1px solid var(--subborder-color)',
        padding: '0.4rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('NOTAS')}
          style={{
            padding: '0.5rem 0.95rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'NOTAS' ? 'var(--btn-bg)' : 'transparent',
            color: activeTab === 'NOTAS' ? 'var(--btn-text)' : 'var(--muted-text)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease'
          }}
        >
          <MessageSquare size={15} /> Bandeja de Notas ({notes.length})
        </button>

        <button
          onClick={() => setActiveTab('SOLICITUDES')}
          style={{
            padding: '0.5rem 0.95rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'SOLICITUDES' ? 'var(--btn-bg)' : 'transparent',
            color: activeTab === 'SOLICITUDES' ? 'var(--btn-text)' : 'var(--muted-text)',
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
          <Zap size={15} /> Solicitudes de Oradores ({speakingRequests.length})
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

        <button
          onClick={() => setActiveTab('AJUSTES')}
          style={{
            padding: '0.5rem 0.95rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'AJUSTES' ? 'var(--btn-bg)' : 'transparent',
            color: activeTab === 'AJUSTES' ? 'var(--btn-text)' : 'var(--muted-text)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Sliders size={15} /> Ajustes y Permisos de Sala
        </button>

        <button
          onClick={() => setActiveTab('CONEXIONES')}
          style={{
            padding: '0.5rem 0.95rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'CONEXIONES' ? 'var(--btn-bg)' : 'transparent',
            color: activeTab === 'CONEXIONES' ? 'var(--btn-text)' : 'var(--muted-text)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Users size={15} /> Conexiones ({connectedPeers.length})
        </button>

        <button
          onClick={() => setActiveTab('DEBATE')}
          style={{
            padding: '0.5rem 0.95rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'DEBATE' ? 'var(--btn-bg)' : 'transparent',
            color: activeTab === 'DEBATE' ? 'var(--btn-text)' : 'var(--muted-text)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Clock size={15} /> Monitor de Debate
        </button>
      </div>

      {/* ── Contenido Principal de Secretaría ── */}
      <main style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
        {/* ═══════════════════════════════════════════════════════ */}
        {/* PESTAÑA: BANDEJA DE NOTAS / PAJES                       */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'NOTAS' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
            {/* Columna Izquierda: Feed de Notas y Filtros */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Barra de Filtros y Búsqueda */}
              <div style={{
                backgroundColor: 'var(--panel-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
                  <Search size={16} style={{ color: 'var(--muted-text)' }} />
                  <input
                    type="text"
                    placeholder="Buscar por remitente, destinatario o mensaje..."
                    value={filtroTexto}
                    onChange={e => setFiltroTexto(e.target.value)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--text-color)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {['TODOS', 'CHAIR', 'BACKROOM', 'DELEGADOS'].map(tipo => (
                    <button
                      key={tipo}
                      onClick={() => setFiltroTipo(tipo)}
                      style={{
                        backgroundColor: filtroTipo === tipo ? 'var(--btn-bg)' : 'rgba(255,255,255,0.03)',
                        color: filtroTipo === tipo ? 'var(--btn-text)' : 'var(--muted-text)',
                        border: '1px solid var(--subborder-color)',
                        borderRadius: '6px',
                        padding: '0.3rem 0.65rem',
                        fontSize: '0.74rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Notas */}
              {notasFiltradas.length === 0 ? (
                <div style={{
                  padding: '4rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--panel-color)',
                  borderRadius: '14px',
                  border: '1px dashed var(--subborder-color)',
                  color: 'var(--muted-text)'
                }}>
                  <MessageSquare size={36} style={{ opacity: 0.35, marginBottom: '0.6rem' }} />
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>No hay notas registradas</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                    Las notas que envíen las delegaciones entre sí o a la Mesa aparecerán aquí en vivo.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {notasFiltradas.map(nota => (
                    <div
                      key={nota.id}
                      style={{
                        backgroundColor: 'var(--panel-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: '800', fontSize: '0.92rem', color: '#60a5fa' }}>
                            {nota.from}
                          </span>
                          <span style={{ color: 'var(--muted-text)', fontSize: '0.8rem' }}>➔</span>
                          <span style={{ fontWeight: '800', fontSize: '0.92rem', color: '#22c55e' }}>
                            {nota.to}
                          </span>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: '700',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: nota.type === 'urgente' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.06)',
                            color: nota.type === 'urgente' ? '#ef4444' : 'var(--muted-text)'
                          }}>
                            {nota.type?.toUpperCase() || 'GENERAL'}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>
                          {new Date(nota.timestamp || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>

                      <div style={{
                        fontSize: '0.88rem',
                        lineHeight: '1.45',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.04)'
                      }}>
                        {nota.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Columna Derecha: Redactar Nota Oficial */}
            <div style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              position: 'sticky',
              top: '80px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '0.95rem' }}>
                <Send size={16} color="#60a5fa" /> Enviar Nota Oficial
              </div>

              <form onSubmit={handleEnviarNotaSecretaria} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                    Destinatario
                  </label>
                  <select
                    value={notaMesaDestino}
                    onChange={e => setNotaMesaDestino(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '0.35rem',
                      backgroundColor: 'var(--card-header-bg)',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '8px',
                      padding: '0.6rem',
                      color: 'var(--text-color)',
                      fontWeight: '700',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="TODOS">📢 TODA LA SALA (General)</option>
                    <option value="CHAIR">🏛️ Mesa Directiva (Chair)</option>
                    <option value="BACKROOM">🚨 Consola de Crisis (Backroom)</option>
                    <optgroup label="Delegaciones">
                      {paises.map(p => (
                        <option key={p.nombre} value={p.nombre}>{p.bandera || '🇺🇳'} {p.nombre}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                    Tipo de Nota
                  </label>
                  <select
                    value={tipoNota}
                    onChange={e => setTipoNota(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '0.35rem',
                      backgroundColor: 'var(--card-header-bg)',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '8px',
                      padding: '0.55rem',
                      color: 'var(--text-color)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <option value="general">Mensaje Oficial</option>
                    <option value="urgente">Urgente / Procedimental</option>
                    <option value="paje">Instrucción de Paje</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                    Mensaje
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Escribe el comunicado o mensaje..."
                    value={notaMesaTexto}
                    onChange={e => setNotaMesaTexto(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '0.35rem',
                      backgroundColor: 'var(--card-header-bg)',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '8px',
                      padding: '0.65rem',
                      color: 'var(--text-color)',
                      fontSize: '0.85rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!notaMesaTexto.trim()}
                  style={{
                    backgroundColor: 'var(--btn-bg)',
                    color: 'var(--btn-text)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.65rem',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: notaMesaTexto.trim() ? 'pointer' : 'not-allowed',
                    opacity: notaMesaTexto.trim() ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  <Send size={15} /> Despachar Nota
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* PESTAÑA: SOLICITUDES DE ORADORES                        */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'SOLICITUDES' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                  Cola de Solicitudes de Oradores y Mociones
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                  Como Secretaría, puedes aprobar o denegar turnos solicitados por las delegaciones en tiempo real.
                </p>
              </div>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: '800',
                padding: '0.25rem 0.65rem',
                borderRadius: '8px',
                backgroundColor: speakingRequests.length > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                color: speakingRequests.length > 0 ? '#ef4444' : '#22c55e'
              }}>
                {speakingRequests.length} Pendientes
              </span>
            </div>

            {speakingRequests.length === 0 ? (
              <div style={{
                padding: '4rem 1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--panel-color)',
                borderRadius: '14px',
                border: '1px dashed var(--subborder-color)',
                color: 'var(--muted-text)'
              }}>
                <Zap size={36} style={{ opacity: 0.35, marginBottom: '0.6rem' }} />
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>No hay solicitudes de orador pendientes</div>
                <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                  Las solicitudes de turno en modo con aprobación aparecerán aquí para ser validadas.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {speakingRequests.map(req => (
                  <div
                    key={req.id}
                    style={{
                      backgroundColor: 'var(--panel-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '1.1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '6px',
                          backgroundColor: req.speechType === 'GSL' ? 'rgba(59, 130, 246, 0.2)' : (req.speechType === 'CAUCUS' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(234, 179, 8, 0.2)'),
                          color: req.speechType === 'GSL' ? '#60a5fa' : (req.speechType === 'CAUCUS' ? '#c084fc' : '#facc15')
                        }}>
                          {req.speechType === 'GSL' ? 'Lista GSL' : (req.speechType === 'CAUCUS' ? 'Caucus Moderado' : 'Moción')}
                        </span>
                        <span style={{ fontWeight: '800', fontSize: '1rem' }}>
                          {req.country}
                        </span>
                      </div>

                      {req.details?.tipo && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '4px' }}>
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
                          padding: '0.5rem 1.1rem',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                        }}
                      >
                        <Check size={15} /> Aprobar
                      </button>

                      <button
                        onClick={() => rejectSpeakingRequest(req.id)}
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          borderRadius: '8px',
                          padding: '0.5rem 0.95rem',
                          fontSize: '0.82rem',
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

        {/* ═══════════════════════════════════════════════════════ */}
        {/* PESTAÑA: AJUSTES Y PERMISOS DE SALA                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'AJUSTES' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            <div style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                  Ajustes de Sala y Permisos de Delegados
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                  Los cambios que realices aquí se aplicarán y sincronizarán inmediatamente en el Chair y todas las delegaciones.
                </p>
              </div>
            </div>

            {/* Sección 1: Modo de Solicitud de Oradores (GSL y Caucus) */}
            <div style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
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
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: roomSettings.speakerRequestMode === 'direct' ? '#22c55e' : 'var(--text-color)' }}>
                      ⚡ Directas
                    </span>
                    {roomSettings.speakerRequestMode === 'direct' && <CheckCircle2 size={16} color="#22c55e" />}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', lineHeight: '1.3' }}>
                    El delegado entra a la lista automáticamente sin confirmación de la Mesa.
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
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: roomSettings.speakerRequestMode === 'approval' ? '#eab308' : 'var(--text-color)' }}>
                      ✋ Con Aprobación
                    </span>
                    {roomSettings.speakerRequestMode === 'approval' && <CheckCircle2 size={16} color="#eab308" />}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', lineHeight: '1.3' }}>
                    Requiere validación de la Mesa o de Secretaría.
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
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: roomSettings.speakerRequestMode === 'disabled' ? '#ef4444' : 'var(--text-color)' }}>
                      🔒 Deshabilitadas
                    </span>
                    {roomSettings.speakerRequestMode === 'disabled' && <CheckCircle2 size={16} color="#ef4444" />}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', lineHeight: '1.3' }}>
                    Bloquea solicitudes de turno desde la vista de delegado.
                  </span>
                </div>
              </div>
            </div>

            {/* Sección 2: Solicitudes de Caucus Moderado */}
            <div style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
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
                  Control de incorporación de delegados a la lista durante un debate moderado.
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
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: roomSettings.caucusRequestMode === 'direct' ? '#22c55e' : 'var(--text-color)' }}>
                      ⚡ Directas
                    </span>
                    {roomSettings.caucusRequestMode === 'direct' && <CheckCircle2 size={16} color="#22c55e" />}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', lineHeight: '1.3' }}>
                    Ingreso automático a la lista de Caucus.
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
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: roomSettings.caucusRequestMode === 'approval' ? '#eab308' : 'var(--text-color)' }}>
                      ✋ Con Aprobación
                    </span>
                    {roomSettings.caucusRequestMode === 'approval' && <CheckCircle2 size={16} color="#eab308" />}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', lineHeight: '1.3' }}>
                    La Mesa o Secretaría autoriza cada turno.
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
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: roomSettings.caucusRequestMode === 'disabled' ? '#ef4444' : 'var(--text-color)' }}>
                      🔒 Deshabilitadas
                    </span>
                    {roomSettings.caucusRequestMode === 'disabled' && <CheckCircle2 size={16} color="#ef4444" />}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', lineHeight: '1.3' }}>
                    Peticiones bloqueadas durante el Caucus.
                  </span>
                </div>
              </div>
            </div>

            {/* Sección 3: Permisos y Capacidades de Delegados */}
            <div style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
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
                    <div style={{ fontSize: '0.82rem', fontWeight: '700' }}>✉️ Notas entre Delegaciones</div>
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
                    <div style={{ fontSize: '0.82rem', fontWeight: '700' }}>🏛️ Notas a la Mesa (Chair)</div>
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
                    <div style={{ fontSize: '0.82rem', fontWeight: '700' }}>📑 Proponer Mociones y Puntos</div>
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
                    <div style={{ fontSize: '0.82rem', fontWeight: '700' }}>🗳️ Votación Telemática en Vivo</div>
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
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* PESTAÑA: GESTIÓN DE CONEXIONES                          */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'CONEXIONES' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                  Dispositivos y Delegaciones Conectadas ({connectedPeers.length})
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                  Monitor de red P2P en tiempo real con capacidad de expulsión.
                </p>
              </div>
            </div>

            {connectedPeers.length === 0 ? (
              <div style={{
                padding: '4rem 1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--panel-color)',
                borderRadius: '14px',
                border: '1px dashed var(--subborder-color)',
                color: 'var(--muted-text)'
              }}>
                <Users size={36} style={{ opacity: 0.35, marginBottom: '0.6rem' }} />
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>No hay dispositivos conectados</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {connectedPeers.map(peer => (
                  <div
                    key={peer.peerId}
                    style={{
                      backgroundColor: 'var(--panel-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '0.9rem 1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                        boxShadow: '0 0 8px #22c55e'
                      }} />
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>
                          {peer.country || 'Sin Identificador'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)' }}>
                          ID: {peer.peerId.substring(0, 10)}... • Rol: {peer.role}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        backgroundColor: peer.role === 'secretariat' ? 'rgba(59, 130, 246, 0.15)' : (peer.role === 'backroom' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(34, 197, 94, 0.15)'),
                        color: peer.role === 'secretariat' ? '#60a5fa' : (peer.role === 'backroom' ? '#fb923c' : '#4ade80')
                      }}>
                        {peer.role?.toUpperCase()}
                      </span>

                      <button
                        onClick={() => {
                          if (confirm(`¿Deseas expulsar de la sesión a ${peer.country || peer.peerId}?`)) {
                            kickPeer(peer.peerId);
                          }
                        }}
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          borderRadius: '6px',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <UserX size={14} /> Expulsar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* PESTAÑA: MONITOR DE DEBATE                              */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'DEBATE' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Tarjeta Lista General GSL */}
            <div style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>
                  📋 Lista General de Oradores ({oradoresGSL.length})
                </div>
              </div>

              {oradoresGSL.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--muted-text)', fontSize: '0.8rem' }}>
                  Lista GSL vacía
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {oradoresGSL.map((o, idx) => (
                    <div
                      key={o.id || idx}
                      style={{
                        backgroundColor: idx === 0 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${idx === 0 ? 'rgba(34, 197, 94, 0.3)' : 'var(--subborder-color)'}`,
                        borderRadius: '8px',
                        padding: '0.6rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: idx === 0 ? '#22c55e' : 'rgba(255,255,255,0.1)',
                          color: idx === 0 ? '#ffffff' : 'var(--muted-text)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: '800'
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>
                          {o.bandera || '🇺🇳'} {o.nombre}
                        </span>
                      </div>
                      {idx === 0 && (
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#22c55e' }}>
                          EN TURNO
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tarjeta Caucus Moderado */}
            <div style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>
                  ⏱️ Caucus Moderado ({oradoresCaucus.length})
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  backgroundColor: caucusActivo.activo ? 'rgba(34, 197, 94, 0.15)' : 'rgba(113, 113, 122, 0.15)',
                  color: caucusActivo.activo ? '#22c55e' : '#a1a1aa'
                }}>
                  {caucusActivo.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {caucusActivo.activo && caucusActivo.tema && (
                <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                  Tema: <strong>{caucusActivo.tema}</strong>
                </div>
              )}

              {oradoresCaucus.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--muted-text)', fontSize: '0.8rem' }}>
                  No hay oradores en Caucus
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {oradoresCaucus.map((o, idx) => (
                    <div
                      key={o.id || idx}
                      style={{
                        backgroundColor: idx === 0 ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${idx === 0 ? 'rgba(168, 85, 247, 0.3)' : 'var(--subborder-color)'}`,
                        borderRadius: '8px',
                        padding: '0.6rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: idx === 0 ? '#a855f7' : 'rgba(255,255,255,0.1)',
                          color: idx === 0 ? '#ffffff' : 'var(--muted-text)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: '800'
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>
                          {o.bandera || '🇺🇳'} {o.nombre}
                        </span>
                      </div>
                      {idx === 0 && (
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#c084fc' }}>
                          EN TURNO
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SecretariatView;
