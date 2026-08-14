import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const ListaOradores = () => {
  const { paises, oradoresCola, agregarOrador, removerOrador, moverOrador } = useSession();

  const [busqueda, setBusqueda] = useState('');

  // Filtrar lista de países disponibles que no estén en la cola
  const paisesDisponibles = paises.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
    !oradoresCola.some(o => o.nombre === p.nombre)
  );

  const handleSeleccionarPaisAñadir = (paisObj) => {
    agregarOrador(paisObj);
    setBusqueda('');
  };

  return (
    <div style={{
      position: 'relative',
      padding: '1rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      backgroundColor: 'var(--panel-color)',
      color: 'var(--text-color)',
      gap: '0.8rem'
    }}>
      {/* Header y Acción Principal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', letterSpacing: '0.03em' }}>
          📋 Lista de Oradores ({oradoresCola.length})
        </h3>
      </div>

      {/* Buscador / Añadir País */}
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#050505',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '0.35rem 0.6rem',
          gap: '0.4rem'
        }}>
          <Search size={15} style={{ opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Añadir país a la cola..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-color)',
              outline: 'none',
              fontSize: '0.85rem',
              width: '100%'
            }}
          />
        </div>

        {/* Dropdown de sugerencias de búsqueda */}
        {busqueda.trim().length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#141414',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            marginTop: '4px',
            maxHeight: '160px',
            overflowY: 'auto',
            zIndex: 10,
            boxShadow: '0 8px 20px rgba(0,0,0,0.6)'
          }}>
            {paisesDisponibles.length === 0 ? (
              <div style={{ padding: '0.5rem', fontSize: '0.8rem', opacity: 0.5, textAlign: 'center' }}>
                Sin resultados coincidentes
              </div>
            ) : (
              paisesDisponibles.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleSeleccionarPaisAñadir(p)}
                  style={{
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--subborder-color)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#222222'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{p.bandera}</span> {p.nombre}
                  </span>
                  <Plus size={14} style={{ opacity: 0.7 }} />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Lista Vertical de Oradores */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: '2px' }}>
        {oradoresCola.length === 0 ? (
          <div style={{ opacity: 0.4, textAlign: 'center', margin: 'auto', fontSize: '0.85rem' }}>
            La lista de oradores está vacía. Usa el buscador para añadir delegados.
          </div>
        ) : (
          oradoresCola.map((orador, index) => {
            const esActual = index === 0;
            const esSiguiente = index === 1;

            return (
              <div
                key={orador.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: esActual ? 'rgba(34, 197, 94, 0.12)' : (esSiguiente ? 'rgba(59, 130, 246, 0.07)' : 'var(--card-header-bg)'),
                  border: `1px solid ${esActual ? '#166534' : (esSiguiente ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-color)')}`,
                  borderRadius: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    color: esActual ? '#4ade80' : (esSiguiente ? '#60a5fa' : 'var(--muted-text)'),
                    width: '20px'
                  }}>
                    #{index + 1}
                  </span>
                  <span style={{ fontSize: '1.25rem' }}>{orador.bandera}</span>
                  <span style={{
                    fontWeight: esActual ? '800' : '600',
                    fontSize: esActual ? '0.95rem' : '0.85rem',
                    color: 'var(--text-color)'
                  }}>
                    {orador.nombre}
                  </span>
                  {esActual && (
                    <span style={{
                      fontSize: '0.65rem',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '3px',
                      fontWeight: '800'
                    }}>
                      HABLANDO
                    </span>
                  )}
                  {esSiguiente && (
                    <span style={{
                      fontSize: '0.65rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      color: '#93c5fd',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '3px',
                      fontWeight: '700'
                    }}>
                      SIGUIENTE
                    </span>
                  )}
                </div>

                {/* Botones de acción / Reordenar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
                  <button
                    onClick={() => moverOrador(index, -1)}
                    disabled={index === 0}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-color)',
                      opacity: index === 0 ? 0.15 : 0.7,
                      cursor: index === 0 ? 'default' : 'pointer',
                      padding: '2px'
                    }}
                    title="Subir en la lista"
                  >
                    <ChevronUp size={16} />
                  </button>

                  <button
                    onClick={() => moverOrador(index, 1)}
                    disabled={index === oradoresCola.length - 1}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-color)',
                      opacity: index === oradoresCola.length - 1 ? 0.15 : 0.7,
                      cursor: index === oradoresCola.length - 1 ? 'default' : 'pointer',
                      padding: '2px'
                    }}
                    title="Bajar en la lista"
                  >
                    <ChevronDown size={16} />
                  </button>

                  <button
                    onClick={() => removerOrador(orador.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      opacity: 0.7,
                      cursor: 'pointer',
                      padding: '2px',
                      marginLeft: '4px'
                    }}
                    title="Quitar de la lista"
                  >
                    <Trash2 size={14} />
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

export default ListaOradores;

