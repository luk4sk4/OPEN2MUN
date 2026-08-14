import React, { useState, useEffect } from 'react';
import { Building2, Plus, ArrowUp, ArrowDown, X, Check } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const EstablecerAgenda = () => {
  const { 
    nombreComite, 
    setNombreComite, 
    agendaSesion, 
    establecerAgenda, 
    cambiarTemaActual 
  } = useSession();

  const [comite, setComite] = useState(nombreComite || '');
  const [nuevoTema, setNuevoTema] = useState('');

  useEffect(() => {
    setComite(nombreComite || '');
  }, [nombreComite]);

  const handleComiteBlur = () => {
    if (comite.trim() !== (nombreComite || '')) {
      setNombreComite(comite.trim());
    }
  };

  const handleComiteKeyDown = (e) => {
    if (e.key === 'Enter') {
      setNombreComite(comite.trim());
      e.target.blur();
    }
  };

  const temas = agendaSesion.temasPropuestos || [];
  const temaActual = agendaSesion.temaActual || (temas[0]?.titulo || '');

  const handleAgregarTema = (e) => {
    if (e) e.preventDefault();
    const txt = nuevoTema.trim();
    if (!txt) return;

    const item = { id: Date.now().toString(), titulo: txt, estado: 'Pendiente' };
    const nuevaLista = [...temas, item];

    if (!agendaSesion.establecida || !agendaSesion.temaActual) {
      establecerAgenda(txt, nuevaLista.map((t, idx) => ({ ...t, estado: idx === 0 ? 'En Discusión' : 'Pendiente' })));
    } else {
      establecerAgenda(agendaSesion.temaActual, nuevaLista);
    }
    setNuevoTema('');
  };

  const handleEliminarTema = (id, e) => {
    e.stopPropagation();
    const nuevaLista = temas.filter(t => t.id !== id);
    const target = temas.find(t => t.id === id);
    if (target && target.titulo === temaActual) {
      const proximo = nuevaLista[0]?.titulo || '';
      establecerAgenda(proximo, nuevaLista.map((t, idx) => ({ ...t, estado: idx === 0 ? 'En Discusión' : 'Pendiente' })));
    } else {
      establecerAgenda(temaActual, nuevaLista);
    }
  };

  const handleMoverTema = (index, dir, e) => {
    e.stopPropagation();
    const target = index + dir;
    if (target < 0 || target >= temas.length) return;
    const clone = [...temas];
    const [moved] = clone.splice(index, 1);
    clone.splice(target, 0, moved);
    establecerAgenda(temaActual, clone);
  };

  return (
    <div style={{
      padding: '0.65rem 0.75rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      backgroundColor: 'var(--panel-color)',
      color: 'var(--text-color)',
      gap: '0.45rem',
      fontSize: '0.8rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* ── Nombre del Comité ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        backgroundColor: 'var(--card-header-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '5px',
        padding: '0.3rem 0.55rem'
      }}>
        <Building2 size={14} style={{ color: '#71717a', flexShrink: 0 }} />
        <input
          type="text"
          value={comite}
          onChange={e => setComite(e.target.value)}
          onBlur={handleComiteBlur}
          onKeyDown={handleComiteKeyDown}
          placeholder="Nombre del comité (ej: Consejo de Seguridad)..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-color)',
            fontSize: '0.8rem',
            outline: 'none'
          }}
        />
        {comite.trim() === (nombreComite || '') && nombreComite && (
          <Check size={13} color="#22c55e" style={{ flexShrink: 0 }} />
        )}
      </div>

      {/* ── Añadir Punto a la Agenda ── */}
      <form onSubmit={handleAgregarTema} style={{ display: 'flex', gap: '0.35rem' }}>
        <input
          type="text"
          value={nuevoTema}
          onChange={e => setNuevoTema(e.target.value)}
          placeholder="Añadir punto de agenda..."
          style={{
            flex: 1,
            padding: '0.35rem 0.55rem',
            backgroundColor: 'var(--card-header-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '5px',
            color: 'var(--text-color)',
            fontSize: '0.78rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={!nuevoTema.trim()}
          style={{
            padding: '0.35rem 0.65rem',
            backgroundColor: nuevoTema.trim() ? '#3b82f6' : '#27272a',
            color: nuevoTema.trim() ? '#ffffff' : '#71717a',
            border: 'none',
            borderRadius: '5px',
            cursor: nuevoTema.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}
        >
          <Plus size={13} /> Añadir
        </button>
      </form>

      {/* ── Lista Compacta de Temas ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        paddingRight: '1px',
        minHeight: 0
      }}>
        {temas.length === 0 ? (
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            color: '#71717a',
            fontSize: '0.74rem'
          }}>
            Sin puntos de agenda asignados
          </div>
        ) : (
          temas.map((item, index) => {
            const esActual = item.titulo === temaActual;

            return (
              <div
                key={item.id || index}
                onClick={() => cambiarTemaActual(item.titulo)}
                style={{
                  padding: '0.32rem 0.5rem',
                  backgroundColor: esActual ? 'rgba(59, 130, 246, 0.12)' : 'var(--card-header-bg)',
                  border: `1px solid ${esActual ? '#3b82f6' : 'var(--border-color)'}`,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                title={esActual ? 'Tema en debate actual' : 'Clic para activar este tema'}
              >
                {/* Índice y Título */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, flex: 1 }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: esActual ? '#60a5fa' : '#71717a',
                    width: '14px',
                    textAlign: 'center',
                    flexShrink: 0
                  }}>
                    {index + 1}.
                  </span>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: esActual ? '600' : '400',
                    color: esActual ? '#ffffff' : 'var(--text-color)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.titulo}
                  </span>
                  {esActual && (
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: '700',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      padding: '0.05rem 0.35rem',
                      borderRadius: '3px',
                      flexShrink: 0
                    }}>
                      ACTIVO
                    </span>
                  )}
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={(e) => handleMoverTema(index, -1, e)}
                    disabled={index === 0}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-color)',
                      cursor: index === 0 ? 'default' : 'pointer',
                      opacity: index === 0 ? 0.15 : 0.6,
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Subir"
                  >
                    <ArrowUp size={12} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleMoverTema(index, 1, e)}
                    disabled={index === temas.length - 1}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-color)',
                      cursor: index === temas.length - 1 ? 'default' : 'pointer',
                      opacity: index === temas.length - 1 ? 0.15 : 0.6,
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Bajar"
                  >
                    <ArrowDown size={12} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleEliminarTema(item.id, e)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#71717a',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      marginLeft: '2px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#71717a'}
                    title="Eliminar"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EstablecerAgenda;
