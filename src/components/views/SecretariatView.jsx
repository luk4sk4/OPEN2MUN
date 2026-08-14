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
  Building2
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
    sendNote
  } = useP2P();

  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS'); // 'TODOS' | 'CHAIR' | 'BACKROOM' | 'DELEGADOS'
  const [notaMesaTexto, setNotaMesaTexto] = useState('');
  const [notaMesaDestino, setNotaMesaDestino] = useState('TODOS');

  const state = remoteSessionState || {};
  const nombreComite = state.comision || state.nombreComite || 'Comité en Vivo';
  const temaActual = state.agendaSesion?.temaActual || state.caucusActivo?.tema || 'En Discusión';
  const oradoresGSL = state.oradoresCola || [];
  const oradoresCaucus = state.oradoresCaucus || [];

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
    sendNote(notaMesaDestino, notaMesaTexto.trim(), 'secretariat');
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
              <span style={{ fontWeight: '800', fontSize: '1rem', letterSpacing: '-0.01em' }}>
                Panel Secreto / Secretaría
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#60a5fa' }} />
                Sala: {roomId || 'Local'}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>
              Monitor Central de Notas, Mensajes y Pajes
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={handleExportarNotasJSON}
            style={{
              background: 'transparent',
              border: '1px solid var(--subborder-color)',
              borderRadius: '6px',
              color: 'var(--text-color)',
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            title="Exportar archivo de notas en JSON"
          >
            <Download size={13} /> Exportar
          </button>

          <button
            onClick={() => {
              if (confirm('¿Deseas salir del panel secreto?')) {
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
        </div>
      </header>

      {/* ── Contenido en Dos Columnas ── */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'minmax(350px, 1fr) 340px',
        gap: '1.25rem',
        padding: '1.25rem 1.5rem',
        maxWidth: '1500px',
        width: '100%',
        margin: '0 auto'
      }}>
        {/* Columna Izquierda: Feed de Notas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
          {/* Barra de Filtros y Búsqueda */}
          <div style={{
            backgroundColor: 'var(--card-header-bg)',
            border: '1px solid var(--subborder-color)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-text)' }} />
                <input
                  type="text"
                  placeholder="Filtrar por país o palabra clave..."
                  value={filtroTexto}
                  onChange={e => setFiltroTexto(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--panel-color)',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '6px',
                    padding: '0.45rem 0.75rem 0.45rem 2rem',
                    color: 'var(--text-color)',
                    fontSize: '0.82rem'
                  }}
                />
              </div>

              {notes.length > 0 && (
                <button
                  onClick={() => { if (confirm('¿Vaciar historial de notas en este monitor?')) setNotes([]); }}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--subborder-color)',
                    color: 'var(--muted-text)',
                    borderRadius: '6px',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  title="Vaciar feed"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {/* Selector de Categorías */}
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
              {['TODOS', 'CHAIR', 'BACKROOM', 'DELEGADOS'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFiltroTipo(cat)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '999px',
                    border: filtroTipo === cat ? '1px solid var(--btn-bg)' : '1px solid var(--subborder-color)',
                    backgroundColor: filtroTipo === cat ? 'var(--btn-bg)' : 'transparent',
                    color: filtroTipo === cat ? 'var(--btn-text)' : 'var(--muted-text)',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Notas en Tiempo Real */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            maxHeight: 'calc(100vh - 280px)'
          }}>
            {notasFiltradas.length === 0 ? (
              <div style={{
                padding: '4rem 1rem',
                textAlign: 'center',
                color: 'var(--muted-text)',
                backgroundColor: 'var(--card-header-bg)',
                borderRadius: '12px',
                border: '1px dashed var(--subborder-color)',
                fontSize: '0.88rem'
              }}>
                No hay notas registradas con los filtros actuales.
              </div>
            ) : (
              notasFiltradas.map(nota => (
                <div
                  key={nota.id}
                  style={{
                    backgroundColor: 'var(--panel-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '0.9rem 1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        color: 'var(--text-color)',
                        backgroundColor: 'var(--card-header-bg)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--subborder-color)'
                      }}>
                        {nota.from}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>➔</span>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        color: nota.to === 'CHAIR' ? '#3b82f6' : (nota.to === 'BACKROOM' ? '#f97316' : 'var(--text-color)'),
                        backgroundColor: 'var(--card-header-bg)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--subborder-color)'
                      }}>
                        {nota.to}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)', fontWeight: '600' }}>
                      {new Date(nota.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', lineHeight: '1.45', marginTop: '0.2rem', color: 'var(--text-color)' }}>
                    {nota.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna Derecha: Monitor de Sala & Estado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Tarjeta de Resumen del Comité */}
          <div style={{
            backgroundColor: 'var(--panel-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                Comité
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', marginTop: '2px' }}>
                {nombreComite}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                Tema Actual
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-color)', marginTop: '2px' }}>
                {temaActual}
              </div>
            </div>
          </div>

          {/* Colas de Oradores en Directo */}
          <div style={{
            backgroundColor: 'var(--panel-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={13} /> Oradores GSL ({oradoresGSL.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '140px', overflowY: 'auto' }}>
              {oradoresGSL.length === 0 ? (
                <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>Cola GSL vacía</div>
              ) : (
                oradoresGSL.map((o, idx) => (
                  <div key={o.id || idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: '800', color: idx === 0 ? '#22c55e' : 'var(--muted-text)', width: '16px' }}>
                      {idx + 1}.
                    </span>
                    <span>{o.bandera || '🇺🇳'} {o.nombre}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dispositivos Conectados */}
          <div style={{
            backgroundColor: 'var(--panel-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={13} /> Dispositivos en Sala ({connectedPeers.length})
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>
              {connectedPeers.length} clientes conectados activamente.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretariatView;
