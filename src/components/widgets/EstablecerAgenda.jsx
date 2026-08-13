import React, { useState } from 'react';
import { 
  FileCheck2, 
  Plus,
  ArrowUp, 
  ArrowDown, 
  Trash2
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';


const EstablecerAgenda = () => {
  const { agendaSesion, establecerAgenda, cambiarTemaActual } = useSession();

  const [nuevoTemaInput, setNuevoTemaInput] = useState('');
  const [listaTemas, setListaTemas] = useState(agendaSesion.temasPropuestos || []);

  const handleAgregarTema = () => {
    if (!nuevoTemaInput.trim()) return;
    const nuevoObj = {
      id: Date.now().toString(),
      titulo: nuevoTemaInput.trim(),
      estado: 'Pendiente'
    };
    const nuevaLista = [...listaTemas, nuevoObj];
    setListaTemas(nuevaLista);
    setNuevoTemaInput('');
  };

  const handleEliminarTema = (id) => {
    setListaTemas(prev => prev.filter(t => t.id !== id));
  };

  const handleMoverTema = (index, direccion) => {
    const targetIndex = index + direccion;
    if (targetIndex < 0 || targetIndex >= listaTemas.length) return;
    const clone = [...listaTemas];
    const [moved] = clone.splice(index, 1);
    clone.splice(targetIndex, 0, moved);
    setListaTemas(clone);
  };

  const handleFijarAgendaOficial = () => {
    if (listaTemas.length === 0) return;
    const primerTema = listaTemas[0].titulo;
    const temasFormateados = listaTemas.map((t, idx) => ({
      ...t,
      estado: idx === 0 ? 'En Discusión' : 'Pendiente'
    }));
    establecerAgenda(primerTema, temasFormateados);
    setListaTemas(temasFormateados);
  };


  return (
    <div style={{
      padding: '1.1rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      backgroundColor: 'var(--panel-color)',
      color: 'var(--text-color)',
      gap: '0.85rem',
      fontSize: '0.85rem'
    }}>
      {/* ── Banner de Agenda Oficial Establecida ── */}
      <div style={{
        backgroundColor: '#0d0b00',
        border: '1px solid #eab308',
        borderRadius: '8px',
        padding: '0.85rem 1rem',
        boxShadow: '0 0 18px rgba(234, 179, 8, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: 'rgba(234, 179, 8, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FileCheck2 size={22} color="#eab308" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ 
                fontSize: '0.68rem', 
                fontWeight: '800', 
                color: '#eab308', 
                backgroundColor: 'rgba(234, 179, 8, 0.12)', 
                padding: '0.1rem 0.45rem', 
                borderRadius: '4px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                📜 AGENDA OFICIAL REGISTRADA
              </span>
            </div>
            <div style={{ fontWeight: '800', fontSize: '1rem', marginTop: '0.2rem', color: 'var(--text-color)' }}>
              {agendaSesion.temaActual || 'Tema de Discusión Sin Establecer'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Añadir Nuevo Tema a la Agenda ── */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Escribir título de tema o punto de agenda..."
          value={nuevoTemaInput}
          onChange={e => setNuevoTemaInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAgregarTema()}
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            backgroundColor: '#0a0a0a',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            color: 'var(--text-color)',
            fontSize: '0.82rem',
            outline: 'none'
          }}
        />
        <button
          onClick={handleAgregarTema}
          style={{
            padding: '0.5rem 0.85rem',
            backgroundColor: '#eab308',
            color: '#000000',
            fontWeight: '700',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.82rem'
          }}
        >
          <Plus size={16} /> Añadir Tema
        </button>
      </div>



      {/* ── Lista Ordenada de Temas para la Agenda ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Orden de Prioridad de la Agenda:
        </div>

        {listaTemas.map((item, index) => {
          const esActual = item.titulo === agendaSesion.temaActual;

          return (
            <div
              key={item.id || index}
              style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: esActual ? 'rgba(234, 179, 8, 0.07)' : 'var(--card-header-bg)',
                border: `1px solid ${esActual ? '#eab308' : 'var(--border-color)'}`,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                <span style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: esActual ? '#eab308' : 'var(--border-color)',
                  color: esActual ? '#000000' : 'var(--muted-text)',
                  fontWeight: '800',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {index + 1}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '0.85rem', 
                    color: esActual ? '#eab308' : 'var(--text-color)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.titulo}
                  </div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: '1px' }}>
                    {esActual ? '🟢 TEMA EN DISCUSIÓN ACTIVA' : '⚪ Tema en Agenda Pendiente'}
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {!esActual && (
                  <button
                    onClick={() => cambiarTemaActual(item.titulo)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      borderRadius: '4px',
                      border: '1px solid #eab308',
                      backgroundColor: 'rgba(234, 179, 8, 0.12)',
                      color: '#eab308',
                      cursor: 'pointer'
                    }}
                    title="Pasar a discutir este tema"
                  >
                    Discutir Este Tema
                  </button>
                )}

                <button
                  onClick={() => handleMoverTema(index, -1)}
                  disabled={index === 0}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-color)',
                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                    opacity: index === 0 ? 0.2 : 0.7,
                    padding: '2px'
                  }}
                >
                  <ArrowUp size={15} />
                </button>

                <button
                  onClick={() => handleMoverTema(index, 1)}
                  disabled={index === listaTemas.length - 1}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-color)',
                    cursor: index === listaTemas.length - 1 ? 'not-allowed' : 'pointer',
                    opacity: index === listaTemas.length - 1 ? 0.2 : 0.7,
                    padding: '2px'
                  }}
                >
                  <ArrowDown size={15} />
                </button>

                <button
                  onClick={() => handleEliminarTema(item.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    opacity: 0.7,
                    padding: '2px'
                  }}
                  title="Eliminar punto de agenda"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón Principal para Establecer Agenda Oficial */}
      <button
        onClick={handleFijarAgendaOficial}
        style={{
          width: '100%',
          padding: '0.65rem',
          backgroundColor: '#eab308',
          color: '#000000',
          fontWeight: '800',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.88rem',
          boxShadow: '0 4px 15px rgba(234, 179, 8, 0.25)',
          transition: 'all 0.2s ease'
        }}
      >
        <FileCheck2 size={18} /> ESTABLECER Y REGISTRAR AGENDA OFICIAL DE LA SESIÓN
      </button>
    </div>
  );
};

export default EstablecerAgenda;
