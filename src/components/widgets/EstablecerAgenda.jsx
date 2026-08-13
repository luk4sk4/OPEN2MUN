import React, { useState } from 'react';
import { 
  FileCheck2, 
  Plus, 
  Check, 
  Sparkles, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Bookmark, 
  Flag,
  CheckCircle2,
  ListOrdered
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const PLANTILLAS_AGENDA = [
  {
    comision: 'Asamblea General (GA1)',
    temas: [
      'Estrategias de Financiamiento Verde y Sostenibilidad Global',
      'Desarme Nuclear y Prevención de la Proliferación en Zonas de Conflicto'
    ]
  },
  {
    comision: 'Consejo de Seguridad (UNSC)',
    temas: [
      'Seguridad Cibernética e Inteligencia Artificial en Sistemas de Defensa',
      'Protección de Infraestructuras Críticas Civiles en Zonas Hostiles'
    ]
  },
  {
    comision: 'ECOSOC',
    temas: [
      'Mitigación del Impacto Económico Post-Pandémico en Países en Desarrollo',
      'Acceso Universal a la Educación Digital y Tecnologías Emergentes'
    ]
  }
];

const EstablecerAgenda = () => {
  const { agendaSesion, establecerAgenda, cambiarTemaActual } = useSession();

  const [nuevoTemaInput, setNuevoTemaInput] = useState('');
  const [listaTemas, setListaTemas] = useState(agendaSesion.temasPropuestos || [
    { id: 't1', titulo: agendaSesion.temaActual || 'Estrategias de Financiamiento Verde y Sostenibilidad Global', estado: 'En Discusión' }
  ]);

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

  const handleCargarPlantilla = (plantilla) => {
    const nuevosTemas = plantilla.temas.map((titulo, idx) => ({
      id: `t_${idx}_${Date.now()}`,
      titulo,
      estado: idx === 0 ? 'En Discusión' : 'Pendiente'
    }));
    setListaTemas(nuevosTemas);
    establecerAgenda(nuevosTemas[0].titulo, nuevosTemas);
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
        backgroundColor: '#16081a',
        border: '1px solid #d946ef',
        borderRadius: '8px',
        padding: '0.85rem 1rem',
        boxShadow: '0 0 18px rgba(217, 70, 239, 0.2)',
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
            backgroundColor: 'rgba(217, 70, 239, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FileCheck2 size={22} color="#d946ef" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ 
                fontSize: '0.68rem', 
                fontWeight: '800', 
                color: '#d946ef', 
                backgroundColor: 'rgba(217, 70, 239, 0.15)', 
                padding: '0.1rem 0.45rem', 
                borderRadius: '4px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                📜 AGENDA OFICIAL REGISTRADA
              </span>
            </div>
            <div style={{ fontWeight: '800', fontSize: '1rem', marginTop: '0.2rem', color: '#ffffff' }}>
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
            backgroundColor: '#0a0a0d',
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
            backgroundColor: '#d946ef',
            color: '#ffffff',
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

      {/* Plantillas Rápidas MUN */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.72rem', opacity: 0.65, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <Sparkles size={12} color="#d946ef" /> Plantillas:
        </span>
        {PLANTILLAS_AGENDA.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleCargarPlantilla(p)}
            style={{
              padding: '0.2rem 0.5rem',
              fontSize: '0.7rem',
              fontWeight: '600',
              backgroundColor: '#18181b',
              border: '1px solid var(--border-color)',
              color: '#d946ef',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {p.comision}
          </button>
        ))}
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
                backgroundColor: esActual ? '#1c0822' : '#0a0a0d',
                border: `1px solid ${esActual ? '#d946ef' : 'var(--border-color)'}`,
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
                  backgroundColor: esActual ? '#d946ef' : '#27272a',
                  color: esActual ? '#ffffff' : '#a1a1aa',
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
                    color: esActual ? '#f5d0fe' : 'var(--text-color)',
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
                      border: '1px solid #d946ef',
                      backgroundColor: 'rgba(217, 70, 239, 0.15)',
                      color: '#d946ef',
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
          backgroundColor: '#d946ef',
          color: '#ffffff',
          fontWeight: '800',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.88rem',
          boxShadow: '0 4px 15px rgba(217, 70, 239, 0.3)',
          transition: 'all 0.2s ease'
        }}
      >
        <FileCheck2 size={18} /> ESTABLECER Y REGISTRAR AGENDA OFICIAL DE LA SESIÓN
      </button>
    </div>
  );
};

export default EstablecerAgenda;
