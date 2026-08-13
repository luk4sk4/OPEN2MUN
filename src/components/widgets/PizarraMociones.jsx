import React, { useState, useMemo } from 'react';
import { Plus, Check, X, Clock, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const PizarraMociones = () => {
  const { paises, mociones, agregarMocion, votarMocion } = useSession();

  const [mostrarForm, setMostrarForm] = useState(false);
  const [proponente, setProponente] = useState('');
  const [posicionProponente, setPosicionProponente] = useState('Primero');
  const [tipo, setTipo] = useState('Caucus No Moderado');
  const [varianteConsulta, setVarianteConsulta] = useState('Estándar');
  const [tema, setTema] = useState('');
  const [tiempoTotalMin, setTiempoTotalMin] = useState(10);
  const [tiempoOradorSeg, setTiempoOradorSeg] = useState(45);

  const handleSubmitMocion = (e) => {
    e.preventDefault();
    if (!proponente || !tema) return;

    let totalSeg = Number(tiempoTotalMin) * 60;
    let oradorSeg = Number(tiempoOradorSeg);

    if (tipo === 'Caucus No Moderado' || tipo === 'Consulta General') {
      oradorSeg = 0;
    } else if (tipo === 'Tour de Table') {
      totalSeg = 0;
    }

    agregarMocion({
      proponente,
      posicionProponente,
      tipo: tipo === 'Consulta General' ? `Consulta General (${varianteConsulta})` : tipo,
      varianteConsulta: tipo === 'Consulta General' ? varianteConsulta : '',
      tema,
      tiempoTotal: totalSeg,
      tiempoOrador: oradorSeg
    });

    setTema('');
    setMostrarForm(false);
  };

  const formatMinutos = (segundos) => {
    if (!segundos || segundos === 0) return 'N/A';
    const mins = Math.floor(segundos / 60);
    return `${mins} min`;
  };

  const esModerado = tipo === 'Caucus Moderado';
  const esConsulta = tipo === 'Consulta General';

  // ── Ordenamiento Estricto de Mociones según Reglas Solicitadas ──
  // 1. Caucus No Moderados
  // 2. Consulta General
  // 3. Tour de Table
  // 4. Caucus Moderados
  // Misma categoría -> Más largo más arriba -> Mismo tiempo -> Más antiguo primero
  const mocionesOrdenadas = useMemo(() => {
    const getPrioridadTipo = (tipoStr = '') => {
      if (tipoStr.includes('Caucus No Moderado')) return 1;
      if (tipoStr.includes('Consulta General')) return 2;
      if (tipoStr.includes('Tour de Table')) return 3;
      if (tipoStr.includes('Caucus Moderado')) return 4;
      return 5;
    };

    return [...mociones].sort((a, b) => {
      const prioA = getPrioridadTipo(a.tipo);
      const prioB = getPrioridadTipo(b.tipo);

      if (prioA !== prioB) return prioA - prioB;

      // Misma categoría: el más largo más arriba (tiempoTotal descendente)
      const durA = a.tiempoTotal || 0;
      const durB = b.tiempoTotal || 0;
      if (durA !== durB) return durB - durA;

      // Misma duración: el más antiguo primero (id / timestamp ascendente)
      const tA = Number(a.id) || 0;
      const tB = Number(b.id) || 0;
      return tA - tB;
    });
  }, [mociones]);

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', letterSpacing: '0.03em' }}>
          📌 Pizarra de Mociones del Suelo ({mociones.length})
        </h3>

        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          style={{
            padding: '0.35rem 0.7rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--btn-text)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <Plus size={14} /> {mostrarForm ? 'Cancelar' : 'Nueva Moción'}
        </button>
      </div>

      {/* Formulario Inline */}
      {mostrarForm && (
        <form
          onSubmit={handleSubmitMocion}
          style={{
            backgroundColor: 'var(--card-header-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginBottom: '2px' }}>País Proponente</label>
              <select
                value={proponente}
                onChange={e => setProponente(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.35rem',
                  backgroundColor: 'var(--panel-color)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}
              >
                <option value="" disabled>Seleccionar país...</option>
                {paises.map(p => (
                  <option key={p.id} value={p.nombre}>{p.bandera} {p.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginBottom: '2px' }}>Tipo de Moción</label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.35rem',
                  backgroundColor: 'var(--panel-color)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}
              >
                <option value="Caucus No Moderado">Caucus No Moderado</option>
                <option value="Consulta General">Consulta General</option>
                <option value="Tour de Table">Tour de Table</option>
                <option value="Caucus Moderado">Caucus Moderado</option>
              </select>
            </div>
          </div>

          {/* Opciones Específicas para Consulta General */}
          {esConsulta && (
            <div style={{ backgroundColor: 'var(--panel-color)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--subborder-color)' }}>
              <label style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Formato de Consulta General:
              </label>
              <select
                value={varianteConsulta}
                onChange={e => setVarianteConsulta(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.35rem',
                  backgroundColor: 'var(--card-header-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}
              >
                <option value="Estándar">Estándar (Libre sin oradores cronometrados)</option>
                <option value="Cadena / Ping-Pong">Cadena / Ping-Pong (Respuestas cruzadas)</option>
                <option value="Moderada por el Proponente">Moderada por el Proponente ({proponente || 'Delegación'})</option>
              </select>
            </div>
          )}

          {/* Posición del Proponente en Caucus Moderado */}
          {esModerado && (
            <div>
              <label style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Turno del Proponente ({proponente || 'Delegación'}):
              </label>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="posicionProp"
                    value="Primero"
                    checked={posicionProponente === 'Primero'}
                    onChange={() => setPosicionProponente('Primero')}
                  />
                  Hablar de <strong>Primero</strong>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="posicionProp"
                    value="Ultimo"
                    checked={posicionProponente === 'Ultimo'}
                    onChange={() => setPosicionProponente('Ultimo')}
                  />
                  Hablar de <strong>Último</strong>
                </label>
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginBottom: '2px' }}>Tema / Propósito</label>
            <input
              type="text"
              placeholder="Ej. Estrategias de cooperación económica..."
              value={tema}
              onChange={e => setTema(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.35rem',
                backgroundColor: 'var(--panel-color)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                borderRadius: '4px',
                fontSize: '0.8rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {tipo !== 'Tour de Table' && (
              <div>
                <label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginBottom: '2px' }}>Tiempo Total (minutos)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={tiempoTotalMin}
                  onChange={e => setTiempoTotalMin(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.35rem',
                    backgroundColor: 'var(--panel-color)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {tipo !== 'Caucus No Moderado' && !esConsulta && (
              <div>
                <label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginBottom: '2px' }}>Tiempo / Orador (segundos)</label>
                <input
                  type="number"
                  min="10"
                  max="180"
                  value={tiempoOradorSeg}
                  onChange={e => setTiempoOradorSeg(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.35rem',
                    backgroundColor: 'var(--panel-color)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-color)',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            style={{
              padding: '0.45rem',
              backgroundColor: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              fontWeight: '700',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              marginTop: '0.2rem'
            }}
          >
            Guardar Moción
          </button>
        </form>
      )}

      {/* Tabla de Mociones Ordenadas por Prioridad Estricta */}
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--card-header-bg)', borderBottom: '1px solid var(--border-color)', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em', opacity: 0.7 }}>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Proponente</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Tipo / Formato</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Tema</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>T. Total</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>T. Orador</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>Estatus</th>
              <th style={{ padding: '0.5rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mocionesOrdenadas.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '1.5rem', textAlign: 'center', opacity: 0.4 }}>
                  No hay mociones registradas en la pizarra.
                </td>
              </tr>
            ) : (
              mocionesOrdenadas.map(m => (
                <tr
                  key={m.id}
                  style={{
                    borderBottom: '1px solid var(--subborder-color)',
                  }}
                >
                  <td style={{ padding: '0.5rem', fontWeight: '600' }}>
                    {m.proponente}
                    {m.posicionProponente === 'Ultimo' && <span style={{ opacity: 0.5, fontSize: '0.65rem', display: 'block' }}>(Habla al final)</span>}
                  </td>
                  <td style={{ padding: '0.5rem', opacity: 0.8, fontSize: '0.75rem' }}>{m.tipo}</td>
                  <td style={{ padding: '0.5rem', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.tema}>
                    {m.tema}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', fontFamily: 'monospace' }}>{formatMinutos(m.tiempoTotal)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', fontFamily: 'monospace' }}>{m.tiempoOrador ? `${m.tiempoOrador}s` : 'N/A'}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '3px',
                      backgroundColor:
                        m.estado === 'Aprobada' ? '#15803d' :
                        m.estado === 'Fallida' ? '#b91c1c' : 'var(--card-header-bg)',
                      color: m.estado === 'Pendiente' ? 'var(--text-color)' : '#ffffff'
                    }}>
                      {m.estado}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                      {/* Únicamente Opción de Aprobar (Verde) o Reprobar/Fallida (Rojo) - SIN 'Activar' */}
                      <button
                        onClick={() => votarMocion(m.id, 'Aprobada')}
                        style={{
                          background: m.estado === 'Aprobada' ? '#22c55e' : 'transparent',
                          border: '1px solid #22c55e',
                          color: m.estado === 'Aprobada' ? '#000000' : '#22c55e',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title="Aprobar Moción"
                      >
                        <Check size={12} /> Aprobar
                      </button>

                      <button
                        onClick={() => votarMocion(m.id, 'Fallida')}
                        style={{
                          background: m.estado === 'Fallida' ? '#ef4444' : 'transparent',
                          border: '1px solid #ef4444',
                          color: m.estado === 'Fallida' ? '#ffffff' : '#ef4444',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title="Reprobar / Fallida"
                      >
                        <X size={12} /> Reprobar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PizarraMociones;
