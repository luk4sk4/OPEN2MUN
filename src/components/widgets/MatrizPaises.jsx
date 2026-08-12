import React, { useState } from 'react';
import { Crown, Search, Users, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const MatrizPaises = () => {
  const { paises, cambiarEstatusPais, toggleVetoPais } = useSession();

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('TODOS');

  // Cálculo de Quórum
  const totalPaises = paises.length;
  const presentes = paises.filter(p => p.estatus === 'Presente').length;
  const presentesYVotando = paises.filter(p => p.estatus === 'Presente y Votando').length;
  const ausentes = paises.filter(p => p.estatus === 'Ausente').length;

  const totalAsistentes = presentes + presentesYVotando;
  const porcentajeAsistencia = totalPaises > 0 ? Math.round((totalAsistentes / totalPaises) * 100) : 0;

  const mayoriaSimple = Math.floor(totalAsistentes / 2) + 1;
  const mayoriaCalificada = Math.ceil((totalAsistentes * 2) / 3);

  // Filtrado
  const paisesFiltrados = paises.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    if (filtroEstatus === 'TODOS') return coincideNombre;
    if (filtroEstatus === 'VETO') return coincideNombre && p.veto;
    return coincideNombre && p.estatus === filtroEstatus;
  });

  return (
    <div style={{
      padding: '1rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      backgroundColor: 'var(--panel-color)',
      color: 'var(--text-color)',
      gap: '0.8rem'
    }}>
      {/* Header y Resumen de Quórum */}
      <div style={{
        backgroundColor: '#070707',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.75rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        textAlign: 'center'
      }}>
        <div style={{ borderRight: '1px solid var(--subborder-color)', paddingRight: '0.3rem' }}>
          <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase' }}>Presentes</div>
          <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#22c55e' }}>{totalAsistentes}/{totalPaises}</div>
          <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>{porcentajeAsistencia}% Quórum</div>
        </div>

        <div style={{ borderRight: '1px solid var(--subborder-color)', paddingRight: '0.3rem' }}>
          <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase' }}>P. y Votando</div>
          <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#3b82f6' }}>{presentesYVotando}</div>
          <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>Sin abstención</div>
        </div>

        <div style={{ borderRight: '1px solid var(--subborder-color)', paddingRight: '0.3rem' }}>
          <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase' }}>May. Simple</div>
          <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#eab308' }}>{mayoriaSimple}</div>
          <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>50% + 1</div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase' }}>May. 2/3</div>
          <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#a855f7' }}>{mayoriaCalificada}</div>
          <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>Calificada</div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#050505',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '0.3rem 0.5rem',
          gap: '0.4rem'
        }}>
          <Search size={14} style={{ opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Buscar país..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-color)',
              outline: 'none',
              fontSize: '0.8rem',
              width: '100%'
            }}
          />
        </div>

        <select
          value={filtroEstatus}
          onChange={e => setFiltroEstatus(e.target.value)}
          style={{
            padding: '0.35rem',
            backgroundColor: '#050505',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)',
            borderRadius: '6px',
            fontSize: '0.78rem'
          }}
        >
          <option value="TODOS">Todos ({totalPaises})</option>
          <option value="Presente">Presente</option>
          <option value="Presente y Votando">Presente y Votando</option>
          <option value="Ausente">Ausente</option>
          <option value="VETO">👑 Miembros Veto</option>
        </select>
      </div>

      {/* Lista / Matriz de Países */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {paisesFiltrados.map(p => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.45rem 0.75rem',
              backgroundColor: '#0a0a0a',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.82rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>{p.bandera}</span>
              <span style={{ fontWeight: '600' }}>{p.nombre}</span>

              {/* Botón / Indicador de Veto 👑 */}
              <button
                onClick={() => toggleVetoPais(p.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: p.veto ? 1 : 0.2
                }}
                title={p.veto ? 'Tiene derecho a Veto (👑 P5)' : 'Sin derecho a Veto'}
              >
                <Crown size={15} color={p.veto ? '#eab308' : '#888888'} fill={p.veto ? '#eab308' : 'none'} />
              </button>
            </div>

            {/* Selector de Estatus Roll Call */}
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={() => cambiarEstatusPais(p.id, 'Presente')}
                style={{
                  padding: '0.2rem 0.45rem',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  borderRadius: '4px',
                  border: '1px solid #15803d',
                  backgroundColor: p.estatus === 'Presente' ? '#15803d' : 'transparent',
                  color: p.estatus === 'Presente' ? '#ffffff' : '#22c55e',
                  cursor: 'pointer'
                }}
              >
                Presente
              </button>

              <button
                onClick={() => cambiarEstatusPais(p.id, 'Presente y Votando')}
                style={{
                  padding: '0.2rem 0.45rem',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  borderRadius: '4px',
                  border: '1px solid #1d4ed8',
                  backgroundColor: p.estatus === 'Presente y Votando' ? '#1d4ed8' : 'transparent',
                  color: p.estatus === 'Presente y Votando' ? '#ffffff' : '#3b82f6',
                  cursor: 'pointer'
                }}
              >
                P. y Votando
              </button>

              <button
                onClick={() => cambiarEstatusPais(p.id, 'Ausente')}
                style={{
                  padding: '0.2rem 0.45rem',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  borderRadius: '4px',
                  border: '1px solid #b91c1c',
                  backgroundColor: p.estatus === 'Ausente' ? '#b91c1c' : 'transparent',
                  color: p.estatus === 'Ausente' ? '#ffffff' : '#ef4444',
                  cursor: 'pointer'
                }}
              >
                Ausente
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatrizPaises;
