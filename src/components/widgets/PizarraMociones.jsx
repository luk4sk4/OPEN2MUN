import React, { useState, useMemo } from 'react';
import { Plus, Check, X, Clock, MessageSquare, Users, Mic, Sparkles, RotateCcw, AlertCircle, ArrowUpDown, GripVertical } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const PizarraMociones = () => {
  const { paises, mociones, agregarMocion, votarMocion, reordenarMociones, ordenarMocionesDisruptividad } = useSession();

  const [mostrarForm, setMostrarForm] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [proponente, setProponente] = useState('');
  const [posicionProponente, setPosicionProponente] = useState('Primero');
  const [tipo, setTipo] = useState('Caucus Moderado');
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
    if (!proponente || !tema.trim()) return;

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
      tema: tema.trim(),
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
  const esNoModerado = tipo === 'Caucus No Moderado';
  const esTour = tipo === 'Tour de Table';

  // Estimación de intervenciones posibles
  const intervencionesEstimadas = useMemo(() => {
    if (!esModerado || !tiempoOradorSeg || tiempoOradorSeg <= 0) return 0;
    return Math.floor((Number(tiempoTotalMin) * 60) / Number(tiempoOradorSeg));
  }, [esModerado, tiempoTotalMin, tiempoOradorSeg]);

  // ── Tipos de mociones con metadata visual ──
  const tiposMocionConfig = [
    {
      id: 'Caucus Moderado',
      nombre: 'Caucus Moderado',
      subtitulo: 'Oradores cronometrados por turnos',
      icon: Mic,
      color: '#3b82f6',
      activeBg: 'rgba(59, 130, 246, 0.15)',
      activeBorder: '#3b82f6',
      textColor: '#93c5fd'
    },
    {
      id: 'Caucus No Moderado',
      nombre: 'Caucus No Moderado',
      subtitulo: 'Negociación y redacción libre',
      icon: Users,
      color: '#a855f7',
      activeBg: 'rgba(168, 85, 247, 0.15)',
      activeBorder: '#a855f7',
      textColor: '#d8b4fe'
    },
    {
      id: 'Consulta General',
      nombre: 'Consulta General',
      subtitulo: 'Diálogo abierto o ping-pong temático',
      icon: MessageSquare,
      color: '#10b981',
      activeBg: 'rgba(16, 185, 129, 0.15)',
      activeBorder: '#10b981',
      textColor: '#6ee7b7'
    },
    {
      id: 'Tour de Table',
      nombre: 'Tour de Table',
      subtitulo: 'Intervención de todas las delegaciones',
      icon: RotateCcw,
      color: '#f59e0b',
      activeBg: 'rgba(245, 158, 11, 0.15)',
      activeBorder: '#f59e0b',
      textColor: '#fcd34d'
    }
  ];

  // Presets de tiempo rápido
  const presetsTotalMin = [5, 10, 12, 15, 20];
  const presetsOradorSeg = [30, 45, 60, 90, 120];

  return (
    <div style={{
      padding: '0.85rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      backgroundColor: 'var(--panel-color)',
      color: 'var(--text-color)',
      gap: '0.65rem',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '1.15rem' }}>📌</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
              Pizarra de Mociones
            </h3>
            <span style={{ fontSize: '0.7rem', opacity: 0.55, fontWeight: '500' }}>
              {mociones.length} {mociones.length === 1 ? 'moción registrada' : 'mociones registradas'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={ordenarMocionesDisruptividad}
            disabled={mociones.length <= 1}
            style={{
              padding: '0.45rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '7px',
              cursor: mociones.length <= 1 ? 'not-allowed' : 'pointer',
              opacity: mociones.length <= 1 ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              transition: 'all 0.15s ease'
            }}
            title="Ordenar mociones por prioridad de disruptividad (No Moderado > Consulta > Tour > Moderado)"
          >
            <ArrowUpDown size={12} />
            <span>Disruptividad</span>
          </button>

          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            style={{
              padding: '0.45rem 0.8rem',
              fontSize: '0.78rem',
              fontWeight: '700',
              backgroundColor: mostrarForm ? 'rgba(239, 68, 68, 0.15)' : 'var(--btn-bg, #3b82f6)',
              color: mostrarForm ? '#f87171' : 'var(--btn-text, #ffffff)',
              border: mostrarForm ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '7px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: mostrarForm ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.25)'
            }}
          >
            {mostrarForm ? (
              <>
                <X size={14} /> Cerrar
              </>
            ) : (
              <>
                <Plus size={14} /> Añadir Moción
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Barra Informativa de Quórum y Mayorías ── */}
      <div style={{
        backgroundColor: 'var(--card-header-bg, rgba(255, 255, 255, 0.03))',
        border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
        borderRadius: '7px',
        padding: '0.45rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.45rem',
        fontSize: '0.74rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Users size={14} style={{ color: '#38bdf8' }} />
          <span style={{ fontWeight: '600', opacity: 0.9 }}>
            Quórum: <strong>{totalAsistentes}</strong>
          </span>
          <span style={{ fontSize: '0.68rem', opacity: 0.5 }}>
            ({presentes} P + {presentesYVotando} PyV)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ opacity: 0.8 }}>
            Simple: <strong style={{ color: '#38bdf8', fontWeight: '800' }}>{mayoriaSimple}</strong>
          </span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span style={{ opacity: 0.8 }}>
            Calificada: <strong style={{ color: '#c084fc', fontWeight: '800' }}>{mayoriaCalificada}</strong>
          </span>
        </div>
      </div>

      {/* ── Formulario Rehaul y Estilizado de Añadir Moción (Compacto y Optimizado) ── */}
      {mostrarForm && (
        <form
          onSubmit={handleSubmitMocion}
          style={{
            background: 'linear-gradient(170deg, var(--card-header-bg, #18181b) 0%, rgba(20, 20, 24, 0.98) 100%)',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.14))',
            borderRadius: '10px',
            padding: '0.85rem 0.95rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            position: 'relative'
          }}
        >
          {/* Cabecera del Formulario */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={15} style={{ color: '#38bdf8' }} />
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', letterSpacing: '0.01em' }}>
                Nueva Moción
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                color: 'var(--text-color)',
                borderRadius: '5px',
                padding: '0.25rem',
                cursor: 'pointer',
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.15s ease'
              }}
              title="Cerrar formulario"
            >
              <X size={15} />
            </button>
          </div>

          {/* 1. Selector Visual de Tipo de Moción (Grid 2x2 compacto) */}
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, display: 'block', marginBottom: '0.35rem' }}>
              1. Modalidad de Debate
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.4rem'
            }}>
              {tiposMocionConfig.map(t => {
                const IconComponent = t.icon;
                const isSelected = tipo === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipo(t.id)}
                    style={{
                      backgroundColor: isSelected ? t.activeBg : 'rgba(255, 255, 255, 0.03)',
                      border: `1.5px solid ${isSelected ? t.activeBorder : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '7px',
                      padding: '0.45rem 0.55rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? `0 0 10px ${t.color}25` : 'none',
                      color: 'var(--text-color)'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '5px',
                      backgroundColor: isSelected ? t.color : 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? '#000000' : 'inherit',
                      flexShrink: 0
                    }}>
                      <IconComponent size={13} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? '800' : '600',
                        color: isSelected ? t.textColor : 'inherit',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {t.nombre}
                      </div>
                    </div>
                    {isSelected && (
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: t.color, flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. País Proponente y Tema / Propósito */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {/* País Proponente */}
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                <span>2. País Proponente *</span>
              </label>
              {paises.length === 0 ? (
                <div style={{ padding: '0.45rem 0.6rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', fontSize: '0.73rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={13} /> Sin delegaciones en la sesión.
                </div>
              ) : (
                <select
                  value={proponente}
                  onChange={e => setProponente(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
                    color: 'var(--text-color)',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" disabled style={{ backgroundColor: '#18181b', color: '#888' }}>
                    Selecciona el país proponente...
                  </option>
                  {paises.map(p => (
                    <option key={p.id} value={p.nombre} style={{ backgroundColor: '#18181b', color: '#fff' }}>
                      {p.bandera} {p.nombre} {p.estatus !== 'Presente' && p.estatus !== 'Presente y Votando' ? `(${p.estatus})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tema / Propósito */}
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, display: 'block', marginBottom: '0.25rem' }}>
                3. Tema / Propósito del Debate *
              </label>
              <input
                type="text"
                placeholder="Ej. Estrategias de cooperación económica..."
                value={tema}
                onChange={e => setTema(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
                  color: 'var(--text-color)',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Opciones Específicas: Turno del Proponente en Caucus Moderado */}
          {esModerado && (
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.06)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '7px',
              padding: '0.5rem 0.65rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Mic size={12} /> Turno de la delegación ({proponente || 'Proponente'}):
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setPosicionProponente('Primero')}
                  style={{
                    flex: 1,
                    padding: '0.35rem 0.5rem',
                    backgroundColor: posicionProponente === 'Primero' ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)',
                    color: posicionProponente === 'Primero' ? '#ffffff' : 'var(--text-color)',
                    border: posicionProponente === 'Primero' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '5px',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  🎙️ Hablar <strong>Primero</strong>
                </button>
                <button
                  type="button"
                  onClick={() => setPosicionProponente('Ultimo')}
                  style={{
                    flex: 1,
                    padding: '0.35rem 0.5rem',
                    backgroundColor: posicionProponente === 'Ultimo' ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)',
                    color: posicionProponente === 'Ultimo' ? '#ffffff' : 'var(--text-color)',
                    border: posicionProponente === 'Ultimo' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '5px',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ⏳ Hablar <strong>Al Final</strong>
                </button>
              </div>
            </div>
          )}

          {/* Opciones Específicas: Modalidad de Consulta General */}
          {esConsulta && (
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '7px',
              padding: '0.5rem 0.65rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MessageSquare size={12} /> Modalidad de Consulta:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                {[
                  { id: 'Estándar', label: 'Estándar' },
                  { id: 'Cadena / Ping-Pong', label: 'Ping-Pong' },
                  { id: 'Moderada por el Proponente', label: 'Mod. País' }
                ].map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVarianteConsulta(v.id)}
                    style={{
                      padding: '0.35rem 0.4rem',
                      backgroundColor: varianteConsulta === v.id ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                      color: varianteConsulta === v.id ? '#000000' : 'var(--text-color)',
                      border: varianteConsulta === v.id ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '5px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Configuración de Tiempos y Presets (Compacto y Elegante) */}
          <div style={{ display: 'grid', gridTemplateColumns: (!esTour && esModerado) ? '1fr 1fr' : '1fr', gap: '0.5rem' }}>
            {/* Tiempo Total (excepto Tour de Table) */}
            {tipo !== 'Tour de Table' && (
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '7px',
                padding: '0.5rem 0.65rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} style={{ color: '#38bdf8' }} /> Total
                  </label>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#38bdf8', fontFamily: 'monospace' }}>
                    {tiempoTotalMin}m
                  </span>
                </div>

                {/* Controles de Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <button
                    type="button"
                    onClick={() => setTiempoTotalMin(prev => Math.max(1, Number(prev) - 1))}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '5px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-color)',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={tiempoTotalMin}
                    onChange={e => setTiempoTotalMin(Math.max(1, Number(e.target.value)))}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      textAlign: 'center',
                      padding: '0.25rem 0.2rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: 'var(--text-color)',
                      borderRadius: '5px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      fontFamily: 'monospace'
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setTiempoTotalMin(prev => Math.min(90, Number(prev) + 1))}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '5px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-color)',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Presets Rápidos */}
                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'space-between' }}>
                  {presetsTotalMin.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTiempoTotalMin(p)}
                      style={{
                        flex: 1,
                        padding: '0.15rem 0',
                        fontSize: '0.67rem',
                        borderRadius: '4px',
                        border: Number(tiempoTotalMin) === p ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: Number(tiempoTotalMin) === p ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: Number(tiempoTotalMin) === p ? '#38bdf8' : 'inherit',
                        cursor: 'pointer',
                        fontWeight: '600',
                        textAlign: 'center'
                      }}
                    >
                      {p}m
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tiempo por Orador (para Caucus Moderado o Tour de Table) */}
            {(esModerado || esTour) && (
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '7px',
                padding: '0.5rem 0.65rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Mic size={12} style={{ color: '#a855f7' }} /> Orador
                  </label>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#c084fc', fontFamily: 'monospace' }}>
                    {tiempoOradorSeg}s
                  </span>
                </div>

                {/* Controles de Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <button
                    type="button"
                    onClick={() => setTiempoOradorSeg(prev => Math.max(10, Number(prev) - 5))}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '5px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-color)',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min="10"
                    max="300"
                    step="5"
                    value={tiempoOradorSeg}
                    onChange={e => setTiempoOradorSeg(Math.max(10, Number(e.target.value)))}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      textAlign: 'center',
                      padding: '0.25rem 0.2rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: 'var(--text-color)',
                      borderRadius: '5px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      fontFamily: 'monospace'
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setTiempoOradorSeg(prev => Math.min(300, Number(prev) + 5))}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '5px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-color)',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Presets Rápidos */}
                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'space-between' }}>
                  {presetsOradorSeg.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTiempoOradorSeg(p)}
                      style={{
                        flex: 1,
                        padding: '0.15rem 0',
                        fontSize: '0.67rem',
                        borderRadius: '4px',
                        border: Number(tiempoOradorSeg) === p ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: Number(tiempoOradorSeg) === p ? 'rgba(192, 132, 252, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: Number(tiempoOradorSeg) === p ? '#c084fc' : 'inherit',
                        cursor: 'pointer',
                        fontWeight: '600',
                        textAlign: 'center'
                      }}
                    >
                      {p}s
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Banner de cálculo inteligente para Caucus Moderado */}
          {esModerado && intervencionesEstimadas > 0 && (
            <div style={{
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              border: '1px dashed rgba(56, 189, 248, 0.3)',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: '#bae6fd'
            }}>
              <span>📊 Capacidad estimada:</span>
              <strong style={{ fontSize: '0.76rem', color: '#38bdf8' }}>
                ~{intervencionesEstimadas} intervenciones
              </strong>
            </div>
          )}

          {/* Botones de Envío / Cancelar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'var(--text-color)',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!proponente || !tema.trim()}
              style={{
                flex: 2,
                padding: '0.5rem 0.85rem',
                background: (!proponente || !tema.trim())
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: '800',
                letterSpacing: '0.02em',
                cursor: (!proponente || !tema.trim()) ? 'not-allowed' : 'pointer',
                opacity: (!proponente || !tema.trim()) ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                boxShadow: (!proponente || !tema.trim()) ? 'none' : '0 3px 10px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={14} /> Guardar Moción
            </button>
          </div>
        </form>
      )}

      {/* Lista / Tarjetas de Mociones con Drag & Drop y Máxima Visibilidad */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '2px' }}>
        {mociones.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', opacity: 0.4, border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
            No hay mociones registradas en la pizarra.
          </div>
        ) : (
          mociones.map((m, idx) => {
            const esAprobada = m.estado === 'Aprobada';
            const esFallida = m.estado === 'Fallida';
            const isDragging = draggedIndex === idx;
            const isDragOver = dragOverIndex === idx;

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
                  const fromIndexStr = e.dataTransfer.getData('text/plain');
                  const fromIndex = parseInt(fromIndexStr, 10);
                  if (!isNaN(fromIndex) && fromIndex !== idx) {
                    reordenarMociones(fromIndex, idx);
                  }
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                style={{
                  backgroundColor: isDragging
                    ? 'rgba(59, 130, 246, 0.15)'
                    : (esAprobada ? 'rgba(34, 197, 94, 0.08)' : (esFallida ? 'rgba(239, 68, 68, 0.08)' : 'var(--card-header-bg)')),
                  border: isDragOver
                    ? `2px dashed ${tipoBadge.border || '#3b82f6'}`
                    : `1px solid ${isDragging ? '#3b82f6' : (esAprobada ? '#166534' : (esFallida ? '#991b1b' : 'var(--border-color)'))}`,
                  borderRadius: '8px',
                  padding: '0.75rem 0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  opacity: isDragging ? 0.45 : 1,
                  cursor: 'grab',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Bloque Izquierdo: PROMINENCIA TOTAL EN TIPO DE MOCIÓN Y PAÍS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: 0 }}>
                  {/* Fila 1: TIPO DE MOCIÓN DESTACADO + País Proponente */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <GripVertical size={15} style={{ color: '#71717a', cursor: 'grab', flexShrink: 0 }} title="Arrastrar para reordenar moción" />
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
                    lineHeight: 1.3,
                    paddingLeft: '1.55rem'
                  }}>
                    «{m.tema}»
                  </div>

                  {/* Fila 3: Tiempos (Sutiles y limpios) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.73rem', opacity: 0.65, marginTop: '2px', paddingLeft: '1.55rem' }}>
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
