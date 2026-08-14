import React, { useState } from 'react';
import { Crown, Search, Users, CheckCircle, AlertCircle, XCircle, Play, Sparkles, RotateCcw, ArrowUpDown, GripVertical } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const MatrizPaises = () => {
  const { paises, cambiarEstatusPais, resetearAsistencia, toggleVetoPais, ordenarPaisesAlfabetico, reordenarPaises } = useSession();

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstatus, setFiltroEstatus] = useState('TODOS');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Estado para Roll Call Nominal de Asistencia
  const [modoRollCall, setModoRollCall] = useState(false);
  const [rondaRollCall, setRondaRollCall] = useState(1); // 1 = Primera Ronda, 2 = Segunda Ronda (Pasados)
  const [indiceRollCall, setIndiceRollCall] = useState(0);
  const [paisesPasados, setPaisesPasados] = useState([]); // IDs de países que seleccionaron 'Pasar' en Ronda 1

  // Cálculo de Quórum
  const totalPaises = paises.length;
  const presentes = paises.filter(p => p.estatus === 'Presente').length;
  const presentesYVotando = paises.filter(p => p.estatus === 'Presente y Votando').length;
  const ausentes = paises.filter(p => p.estatus === 'Ausente').length;

  const totalAsistentes = presentes + presentesYVotando;
  const porcentajeAsistencia = totalPaises > 0 ? Math.round((totalAsistentes / totalPaises) * 100) : 0;

  const mayoriaSimple = Math.floor(totalAsistentes / 2) + 1;
  const mayoriaCalificada = Math.ceil((totalAsistentes * 2) / 3);

  // Lista de Países para la Ronda de Roll Call Actual
  const listaPaisesRondaRollCall = React.useMemo(() => {
    const todosOrdenados = [...paises].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    if (rondaRollCall === 1) {
      return todosOrdenados;
    } else {
      // Ronda 2: Únicamente países que pasaron en Ronda 1 (lista estable)
      return todosOrdenados.filter(p => paisesPasados.includes(p.id));
    }
  }, [paises, rondaRollCall, paisesPasados]);

  const paisActualRollCall = listaPaisesRondaRollCall[indiceRollCall] || null;

  // Iniciar / Resetear Modo Roll Call
  const toggleModoRollCall = () => {
    if (!modoRollCall) {
      setModoRollCall(true);
      setRondaRollCall(1);
      setIndiceRollCall(0);
      setPaisesPasados([]);
    } else {
      setModoRollCall(false);
    }
  };

  // Estatus en Roll Call Nominal con avance de ronda
  const registrarYAvanzarRollCall = (estatus) => {
    if (!paisActualRollCall) return;

    let nuevosPasados = paisesPasados;
    if (estatus === 'pasar') {
      if (!paisesPasados.includes(paisActualRollCall.id)) {
        nuevosPasados = [...paisesPasados, paisActualRollCall.id];
        setPaisesPasados(nuevosPasados);
      }
    } else {
      cambiarEstatusPais(paisActualRollCall.id, estatus);
    }

    // Avanzar dentro de la lista actual
    if (indiceRollCall < listaPaisesRondaRollCall.length - 1) {
      setIndiceRollCall(prev => prev + 1);
    } else {
      // Final de la ronda actual
      if (rondaRollCall === 1) {
        if (nuevosPasados.length > 0) {
          setRondaRollCall(2);
          setIndiceRollCall(0);
        } else {
          setModoRollCall(false);
        }
      } else {
        // Final de la Ronda 2
        setModoRollCall(false);
      }
    }
  };

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
        backgroundColor: 'var(--card-header-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '7px',
        padding: '0.6rem 0.75rem',
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
          <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#38bdf8' }}>{presentesYVotando}</div>
          <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>Sin abstención</div>
        </div>

        <div style={{ borderRight: '1px solid var(--subborder-color)', paddingRight: '0.3rem' }}>
          <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase' }}>May. Simple</div>
          <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#60a5fa' }}>{mayoriaSimple}</div>
          <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>50% + 1</div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase' }}>May. 2/3</div>
          <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#c084fc' }}>{mayoriaCalificada}</div>
          <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>Calificada</div>
        </div>
      </div>

      {/* Barra de Filtros, Ordenamiento y Búsqueda */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          flex: 1,
          minWidth: '120px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--card-header-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '5px',
          padding: '0.25rem 0.5rem',
          gap: '0.35rem'
        }}>
          <Search size={13} style={{ opacity: 0.5 }} />
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
              fontSize: '0.78rem',
              width: '100%'
            }}
          />
        </div>

        <select
          value={filtroEstatus}
          onChange={e => setFiltroEstatus(e.target.value)}
          style={{
            padding: '0.3rem 0.45rem',
            backgroundColor: 'var(--card-header-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)',
            borderRadius: '5px',
            fontSize: '0.75rem'
          }}
        >
          <option value="TODOS">Todos ({totalPaises})</option>
          <option value="Presente">Presente</option>
          <option value="Presente y Votando">Presente y Votando</option>
          <option value="Ausente">Ausente</option>
          <option value="VETO">👑 Miembros Veto</option>
        </select>

        {/* Botón Orden A-Z de Países en la Matriz */}
        <button
          type="button"
          onClick={ordenarPaisesAlfabetico}
          style={{
            padding: '0.3rem 0.55rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)',
            borderRadius: '5px',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            whiteSpace: 'nowrap'
          }}
          title="Ordenar países de A a Z en la matriz"
        >
          <ArrowUpDown size={12} />
          <span>A-Z</span>
        </button>

        {/* Botón para activar el Roll Call */}
        <button
          onClick={toggleModoRollCall}
          style={{
            padding: '0.3rem 0.65rem',
            backgroundColor: modoRollCall ? '#2563eb' : 'transparent',
            border: '1px solid #3b82f6',
            color: modoRollCall ? '#ffffff' : '#3b82f6',
            borderRadius: '5px',
            fontWeight: '700',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            whiteSpace: 'nowrap'
          }}
          title={modoRollCall ? 'Salir del Modo Roll Call' : 'Iniciar Paso de Lista Nominal (Roll Call)'}
        >
          <Play size={12} fill={modoRollCall ? '#ffffff' : 'none'} />
          <span>{modoRollCall ? 'Salir' : 'Roll Call'}</span>
        </button>

        {/* Botón para reiniciar todos a Ausente */}
        <button
          onClick={resetearAsistencia}
          style={{
            padding: '0.3rem 0.55rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)',
            borderRadius: '5px',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            whiteSpace: 'nowrap'
          }}
          title="Reiniciar todos los países a Ausente"
        >
          <RotateCcw size={12} />
          <span>Reiniciar</span>
        </button>
      </div>

      {/* Asistente Roll Call Nominal Interactivo */}
      {modoRollCall && (
        <div style={{
          backgroundColor: 'var(--card-header-bg)',
          border: `1px solid ${rondaRollCall === 2 ? '#d97706' : '#3b82f6'}`,
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          {/* Banner de Ronda */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--subborder-color)', paddingBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={15} color={rondaRollCall === 2 ? '#f59e0b' : '#3b82f6'} />
              <span style={{ fontWeight: '800', fontSize: '0.82rem', color: rondaRollCall === 2 ? '#f59e0b' : '#60a5fa' }}>
                {rondaRollCall === 1 ? 'PRIMERA RONDA - PASO DE LISTA NOMINAL' : 'SEGUNDA RONDA - PASADOS / AUSENTES'}
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
              {paisActualRollCall ? `Turno ${indiceRollCall + 1} de ${listaPaisesRondaRollCall.length}` : 'Paso de Lista Finalizado'}
            </span>
          </div>

          {paisActualRollCall ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>{paisActualRollCall.bandera}</span>
                <div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Estatus actual: {paisActualRollCall.estatus}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-color)' }}>
                    {paisActualRollCall.nombre} {paisActualRollCall.veto && '👑'}
                  </div>
                </div>
              </div>

              {/* Botones de Asistencia Roll Call */}
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  onClick={() => registrarYAvanzarRollCall('Presente')}
                  style={{
                    padding: '0.5rem 0.85rem',
                    backgroundColor: '#22c55e',
                    color: '#000000',
                    fontWeight: '800',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  Presente
                </button>

                <button
                  onClick={() => registrarYAvanzarRollCall('Presente y Votando')}
                  style={{
                    padding: '0.5rem 0.85rem',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    fontWeight: '800',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  P. y Votando
                </button>

                <button
                  onClick={() => registrarYAvanzarRollCall('Ausente')}
                  style={{
                    padding: '0.5rem 0.85rem',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontWeight: '800',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  Ausente
                </button>

                {/* Botón Pasar / Omitir (Solo disponible en Ronda 1) */}
                {rondaRollCall === 1 && (
                  <button
                    onClick={() => registrarYAvanzarRollCall('pasar')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#3f3f46',
                      color: '#ffffff',
                      fontWeight: '700',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '0.78rem'
                    }}
                    title="Pasar / Omitir para responder en Segunda Ronda"
                  >
                    Pasar
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', opacity: 0.7, padding: '0.4rem', fontSize: '0.8rem' }}>
              ¡Paso de Lista finalizado!
            </div>
          )}
        </div>
      )}

      {/* Lista / Matriz de Países */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem', paddingRight: '2px' }}>
        {paisesFiltrados.map((p, idx) => {
          const isDragging = draggedIndex === idx;
          const isDragOver = dragOverIndex === idx;

          return (
            <div
              key={p.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', idx.toString());
                e.dataTransfer.effectAllowed = 'move';
                setDraggedIndex(idx);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                if (draggedIndex !== idx) setDragOverIndex(idx);
              }}
              onDragLeave={() => {
                if (dragOverIndex === idx) setDragOverIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromFilteredIndexStr = e.dataTransfer.getData('text/plain');
                const fromFilteredIndex = parseInt(fromFilteredIndexStr, 10);
                if (!isNaN(fromFilteredIndex) && fromFilteredIndex !== idx) {
                  const sourcePais = paisesFiltrados[fromFilteredIndex];
                  const targetPais = paisesFiltrados[idx];
                  if (sourcePais && targetPais) {
                    const fromMasterIndex = paises.findIndex(item => item.id === sourcePais.id);
                    const toMasterIndex = paises.findIndex(item => item.id === targetPais.id);
                    if (fromMasterIndex !== -1 && toMasterIndex !== -1) {
                      reordenarPaises(fromMasterIndex, toMasterIndex);
                    }
                  }
                }
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.75rem',
                backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.15)' : 'var(--card-header-bg)',
                border: isDragOver ? '2px dashed #3b82f6' : '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.82rem',
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GripVertical size={13} style={{ color: '#71717a', cursor: 'grab', flexShrink: 0 }} title="Arrastrar para reordenar país" />
                <span style={{ fontSize: '1.2rem' }}>{p.bandera}</span>
                <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>{p.nombre}</span>

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
                  <Crown size={14} color={p.veto ? '#facc15' : '#888888'} fill={p.veto ? '#facc15' : 'none'} />
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
          );
        })}
      </div>
    </div>
  );
};

export default MatrizPaises;
