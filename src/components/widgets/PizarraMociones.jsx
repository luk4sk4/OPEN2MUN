import React, { useState, useMemo } from 'react';
import { Plus, Check, X, Clock, MessageSquare, ThumbsUp, ThumbsDown, Users } from 'lucide-react';
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

  // Quórum y Cálculo de Mayorías en tiempo real
  const totalPaises = paises.length;
  const presentes = useMemo(() => paises.filter(p => p.estatus === 'Presente').length, [paises]);
  const presentesYVotando = useMemo(() => paises.filter(p => p.estatus === 'Presente y Votando').length, [paises]);
  const totalAsistentes = presentes + presentesYVotando;

  const mayoriaSimple = totalAsistentes > 0 ? Math.floor(totalAsistentes / 2) + 1 : 0;
  const mayoriaCalificada = totalAsistentes > 0 ? Math.ceil((totalAsistentes * 2) / 3) : 0;

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

      {/* ── Barra Informativa de Quórum y Mayorías (Compacta y Neutra) ── */}
      <div style={{
        backgroundColor: 'var(--card-header-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        padding: '0.4rem 0.65rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.4rem',
        fontSize: '0.73rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Users size={13} style={{ opacity: 0.7 }} />
          <span style={{ fontWeight: '600', opacity: 0.9 }}>
            Quórum: <strong>{totalAsistentes}</strong> en sala
          </span>
          <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>
            ({presentes} P + {presentesYVotando} PyV de {totalPaises})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ opacity: 0.75 }}>Simple (50%+1): <strong style={{ color: '#38bdf8' }}>{mayoriaSimple} votos</strong></span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ opacity: 0.75 }}>Calificada (2/3): <strong style={{ color: '#c084fc' }}>{mayoriaCalificada} votos</strong></span>
        </div>
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

      {/* Lista / Tarjetas de Mociones con Máxima Visibilidad en País y Moción */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '2px' }}>
        {mocionesOrdenadas.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', opacity: 0.4, border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
            No hay mociones registradas en la pizarra.
          </div>
        ) : (
          mocionesOrdenadas.map((m, idx) => {
            const esAprobada = m.estado === 'Aprobada';
            const esFallida = m.estado === 'Fallida';

            const getTipoBadgeStyle = (tipoMocion) => {
              if (tipoMocion === 'Caucus Moderado') {
                return { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: '#60a5fa' };
              }
              if (tipoMocion === 'Caucus No Moderado') {
                return { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', text: '#c084fc' };
              }
              if (tipoMocion === 'Consulta General') {
                return { bg: 'rgba(20, 184, 166, 0.15)', border: '#14b8a6', text: '#2dd4bf' };
              }
              if (tipoMocion === 'Tour de Table') {
                return { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#fbbf24' };
              }
              return { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366f1', text: '#a5b4fc' };
            };

            const tipoBadge = getTipoBadgeStyle(m.tipo);

            return (
              <div
                key={m.id}
                style={{
                  backgroundColor: esAprobada ? 'rgba(34, 197, 94, 0.08)' : (esFallida ? 'rgba(239, 68, 68, 0.08)' : 'var(--card-header-bg)'),
                  border: `1px solid ${esAprobada ? '#166534' : (esFallida ? '#991b1b' : 'var(--border-color)')}`,
                  borderRadius: '8px',
                  padding: '0.75rem 0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Bloque Izquierdo: PROMINENCIA TOTAL EN TIPO DE MOCIÓN Y PAÍS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: 0 }}>
                  {/* Fila 1: TIPO DE MOCIÓN DESTACADO + País Proponente */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', opacity: 0.5 }}>#{idx + 1}</span>
                    
                    {/* Badge de TIPO DE MOCIÓN Destacado */}
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      padding: '3px 9px',
                      borderRadius: '5px',
                      backgroundColor: tipoBadge.bg,
                      border: `1.5px solid ${tipoBadge.border}`,
                      color: tipoBadge.text,
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase'
                    }}>
                      {m.tipo}
                    </span>

                    <span style={{
                      fontWeight: '800',
                      fontSize: '1.05rem',
                      color: 'var(--text-color)',
                      letterSpacing: '0.01em'
                    }}>
                      {m.proponente}
                    </span>

                    {m.posicionProponente === 'Ultimo' && (
                      <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '3px', opacity: 0.8, fontWeight: '700' }}>
                        Habla al final
                      </span>
                    )}
                  </div>

                  {/* Fila 2: TEMA / PROPÓSITO GRANDE Y CLARO */}
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    color: 'var(--text-color)',
                    opacity: 0.95,
                    lineHeight: 1.3
                  }}>
                    «{m.tema}»
                  </div>

                  {/* Fila 3: Tiempos (Sutiles y limpios) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.73rem', opacity: 0.65, marginTop: '2px' }}>
                    <span>⏱ Total: <strong style={{ fontFamily: 'monospace', opacity: 1, color: 'var(--text-color)' }}>{formatMinutos(m.tiempoTotal)}</strong></span>
                    {m.tiempoOrador > 0 && (
                      <span>🎙 Por orador: <strong style={{ fontFamily: 'monospace', opacity: 1, color: 'var(--text-color)' }}>{m.tiempoOrador}s</strong></span>
                    )}
                  </div>
                </div>

                {/* Bloque Derecho: Estado y Acciones */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  <button
                    onClick={() => votarMocion(m.id, 'Aprobada')}
                    style={{
                      background: esAprobada ? '#22c55e' : 'transparent',
                      border: '1px solid #22c55e',
                      color: esAprobada ? '#000000' : '#22c55e',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.15s ease'
                    }}
                    title="Aprobar Moción"
                  >
                    <Check size={13} /> Aprobar
                  </button>

                  <button
                    onClick={() => votarMocion(m.id, 'Fallida')}
                    style={{
                      background: esFallida ? '#ef4444' : 'transparent',
                      border: '1px solid #ef4444',
                      color: esFallida ? '#ffffff' : '#ef4444',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.15s ease'
                    }}
                    title="Reprobar / Fallida"
                  >
                    <X size={13} /> Reprobar
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

export default PizarraMociones;
