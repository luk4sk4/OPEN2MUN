import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Clock, Users, Search, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const CronometroDual = () => {
  const {
    paises,
    caucusActivo,
    oradoresCaucus,
    agregarOradorCaucus,
    removerOradorCaucus,
    avanzarOradorCaucus
  } = useSession();

  const [tiempoTotalSeg, setTiempoTotalSeg] = useState(caucusActivo?.tiempoTotal || 600);
  const [tiempoOradorSeg, setTiempoOradorSeg] = useState(caucusActivo?.tiempoOrador || 45);
  const [limiteOradorSeg, setLimiteOradorSeg] = useState(caucusActivo?.tiempoOrador || 45);
  const [corriendo, setCorriendo] = useState(false);

  const [busquedaPais, setBusquedaPais] = useState('');

  const timerRef = useRef(null);

  const tipoMocion = caucusActivo?.tipo || 'Caucus Moderado';
  const esTiempoSoloGeneral = tipoMocion === 'Caucus No Moderado' || tipoMocion.includes('Consulta General');

  // Sincronizar al activar moción
  useEffect(() => {
    if (caucusActivo?.activo) {
      setTiempoTotalSeg(caucusActivo.tiempoTotal);
      setTiempoOradorSeg(caucusActivo.tiempoOrador);
      setLimiteOradorSeg(caucusActivo.tiempoOrador);
      setCorriendo(false);
    }
  }, [caucusActivo]);

  // Conteo reactivo e ininterrumpido
  useEffect(() => {
    if (corriendo) {
      timerRef.current = setInterval(() => {
        // Conteo del Tiempo Total Caucus
        if (tipoMocion !== 'Tour de Table') {
          setTiempoTotalSeg(prev => prev - 1);
        }

        // Conteo del Tiempo Orador
        if (!esTiempoSoloGeneral) {
          setTiempoOradorSeg(prev => prev - 1);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [corriendo, tipoMocion, esTiempoSoloGeneral]);

  const handleStartPause = () => setCorriendo(!corriendo);

  const handleSiguienteOrador = () => {
    setCorriendo(false);
    setTiempoOradorSeg(limiteOradorSeg);
    avanzarOradorCaucus();
  };

  const handleReset = () => {
    setCorriendo(false);
    setTiempoTotalSeg(caucusActivo?.tiempoTotal || 600);
    setTiempoOradorSeg(limiteOradorSeg);
  };

  const handleAumentar5MinCaucus = () => {
    setTiempoTotalSeg(prev => prev + 300);
  };

  const handleAumentar5SegOrador = () => {
    setTiempoOradorSeg(prev => prev + 5);
  };

  // Formato con soporte de números negativos (-00:01, -00:02...)
  const formatTimeWithNegative = (seg) => {
    const isNegative = seg < 0;
    const absSeg = Math.abs(seg);
    const mins = Math.floor(absSeg / 60);
    const secs = absSeg % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return isNegative ? `-${formatted}` : formatted;
  };

  // Clase dinámica para alertas visuales (naranja a 10s, parpadeo rojo a 5s, negativo en < 0)
  const getTimerStyle = (seg) => {
    if (seg < 0) {
      return { className: 'timer-negative', style: { color: '#ef4444', backgroundColor: '#3f0c0c', borderColor: '#ef4444' } };
    }
    if (seg <= 5 && seg >= 0) {
      return { className: 'timer-blink-red', style: {} };
    }
    if (seg <= 10 && seg > 5) {
      return { className: 'timer-orange', style: { color: '#f97316', backgroundColor: '#431407', borderColor: '#f97316' } };
    }
    return { className: '', style: { backgroundColor: '#050505', border: '2px solid var(--border-color)' } };
  };

  const oradorActual = oradoresCaucus.length > 0
    ? oradoresCaucus[0]
    : { nombre: 'Sin orador en cola', bandera: '🇺🇳' };

  const paisesDisponiblesCaucus = paises.filter(p =>
    p.nombre.toLowerCase().includes(busquedaPais.toLowerCase()) &&
    !oradoresCaucus.some(o => o.nombre === p.nombre)
  );

  const handleAñadirOradorCaucus = (p) => {
    agregarOradorCaucus(p);
    setBusquedaPais('');
  };

  const displayOradorState = getTimerStyle(tiempoOradorSeg);
  const displayTotalState = getTimerStyle(tiempoTotalSeg);

  return (
    <div style={{
      padding: '1.2rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      backgroundColor: 'var(--panel-color)',
      color: 'var(--text-color)',
      gap: '0.6rem'
    }}>
      {/* Header Tipo de Moción */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Clock size={16} color="#eab308" />
          <div>
            <div style={{ fontSize: '0.68rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Moción Activa: <strong style={{ color: '#eab308' }}>{tipoMocion}</strong>
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
              {caucusActivo?.tema || 'Sin Tema Asignado'}
            </div>
          </div>
        </div>

        {tipoMocion !== 'Tour de Table' && (
          <button
            onClick={handleAumentar5MinCaucus}
            style={{
              padding: '0.25rem 0.6rem',
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
              border: '1px solid #eab308',
              color: '#eab308',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
            title="Añadir 5 minutos al tiempo total del caucus"
          >
            <Plus size={12} /> 5 min Caucus
          </button>
        )}
      </div>

      {/* VISTA 1: CAUCUS NO MODERADO O CONSULTA GENERAL */}
      {esTiempoSoloGeneral && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
          <div
            className={displayTotalState.className}
            style={{
              padding: '1.5rem',
              borderRadius: '8px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              ...displayTotalState.style
            }}
          >
            <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {tipoMocion.includes('Consulta General') ? 'Tiempo Total de Consulta General' : 'Tiempo Total del Caucus No Moderado'}
            </div>
            <div style={{
              fontWeight: '900',
              fontSize: '3.6rem',
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
            }}>
              {formatTimeWithNegative(tiempoTotalSeg)}
            </div>
          </div>

          {/* BOTONES DE CONTROL ENCIMA */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={handleStartPause}
              style={{
                flex: 2,
                padding: '0.6rem',
                backgroundColor: corriendo ? '#eab308' : '#22c55e',
                color: '#000000',
                fontWeight: '700',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                fontSize: '0.85rem'
              }}
            >
              {corriendo ? <Pause size={15} /> : <Play size={15} />}
              {corriendo ? 'Pausar' : 'Play (Iniciar)'}
            </button>

            <button
              onClick={handleReset}
              style={{
                flex: 1,
                padding: '0.6rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem'
              }}
              title="Reiniciar"
            >
              <RotateCcw size={15} /> Reiniciar
            </button>
          </div>
        </div>
      )}

      {/* VISTA 2: TOUR DE TABLE */}
      {tipoMocion === 'Tour de Table' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {/* Display Grande Orador */}
          <div
            className={displayOradorState.className}
            style={{
              padding: '0.8rem',
              borderRadius: '8px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              ...displayOradorState.style
            }}
          >
            <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{oradorActual.bandera} <strong style={{ fontSize: '1.1rem' }}>{oradorActual.nombre}</strong></div>
            <div style={{
              fontWeight: '900',
              fontSize: '2.8rem',
              fontFamily: 'monospace',
            }}>
              {formatTimeWithNegative(tiempoOradorSeg)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Tiempo ({limiteOradorSeg}s)</span>
              <button
                onClick={handleAumentar5SegOrador}
                style={{
                  padding: '0.15rem 0.4rem',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid #22c55e',
                  color: '#22c55e',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  fontWeight: '700'
                }}
              >
                +5 seg
              </button>
            </div>
          </div>

          {/* BOTONES DE CONTROL (ENCIMA) */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={handleStartPause}
              style={{
                flex: 2,
                padding: '0.55rem',
                backgroundColor: corriendo ? '#eab308' : '#22c55e',
                color: '#000000',
                fontWeight: '700',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                fontSize: '0.85rem'
              }}
            >
              {corriendo ? <Pause size={15} /> : <Play size={15} />}
              {corriendo ? 'Pausar' : 'Play (Iniciar)'}
            </button>

            <button
              onClick={handleSiguienteOrador}
              style={{
                flex: 2,
                padding: '0.55rem',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontWeight: '700',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                fontSize: '0.85rem'
              }}
            >
              <SkipForward size={15} /> Sig. Orador
            </button>

            <button
              onClick={handleReset}
              style={{
                flex: 1,
                padding: '0.55rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem'
              }}
              title="Reiniciar"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* LISTA ALFABÉTICA DEBAJO */}
          <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', backgroundColor: '#090909' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.4rem', fontWeight: '600' }}>🔤 Orden Alfabético Restante ({oradoresCaucus.length}):</div>
            {oradoresCaucus.map((o, idx) => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0.5rem', fontSize: '0.78rem', backgroundColor: idx === 0 ? 'rgba(34,197,94,0.1)' : 'transparent', borderRadius: '4px' }}>
                <span>{idx + 1}. {o.bandera} {o.nombre}</span>
                {idx === 0 && <span style={{ color: '#22c55e', fontWeight: '700', fontSize: '0.7rem' }}>HABLANDO</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 3: CAUCUS MODERADO */}
      {tipoMocion === 'Caucus Moderado' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Reloj Superior (Total Caucus) */}
          <div style={{
            backgroundColor: '#070707',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.4rem 0.7rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Tiempo Total Caucus</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '1.2rem', color: tiempoTotalSeg < 0 ? '#ef4444' : '#eab308' }}>
                {formatTimeWithNegative(tiempoTotalSeg)}
              </span>
              <button
                onClick={handleAumentar5MinCaucus}
                style={{
                  padding: '0.15rem 0.4rem',
                  backgroundColor: '#eab308',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '3px',
                  fontWeight: '700',
                  fontSize: '0.68rem',
                  cursor: 'pointer'
                }}
              >
                +5 min
              </button>
            </div>
          </div>

          {/* Display Principal Orador */}
          <div
            className={displayOradorState.className}
            style={{
              padding: '0.6rem',
              borderRadius: '8px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              ...displayOradorState.style
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <span>{oradorActual.bandera}</span>
              <span>{oradorActual.nombre}</span>
              {oradorActual.esProponenteUltimo && (
                <span style={{ fontSize: '0.65rem', backgroundColor: '#eab308', color: '#000000', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: '700' }}>
                  PROPONENTE (ÚLTIMO)
                </span>
              )}
            </div>
            <div style={{
              fontWeight: '900',
              fontSize: '2.5rem',
              fontFamily: 'monospace',
            }}>
              {formatTimeWithNegative(tiempoOradorSeg)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Tiempo ({limiteOradorSeg}s)</span>
              <button
                onClick={handleAumentar5SegOrador}
                style={{
                  padding: '0.15rem 0.45rem',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid #22c55e',
                  color: '#22c55e',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  fontWeight: '700'
                }}
              >
                +5 seg
              </button>
            </div>
          </div>

          {/* BOTONES DE CONTROL (ENCIMA DE LA LISTA) */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={handleStartPause}
              style={{
                flex: 2,
                padding: '0.55rem',
                backgroundColor: corriendo ? '#eab308' : '#22c55e',
                color: '#000000',
                fontWeight: '700',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                fontSize: '0.85rem'
              }}
            >
              {corriendo ? <Pause size={15} /> : <Play size={15} />}
              {corriendo ? 'Pausar' : 'Play (Iniciar)'}
            </button>

            <button
              onClick={handleSiguienteOrador}
              style={{
                flex: 2,
                padding: '0.55rem',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontWeight: '700',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                fontSize: '0.85rem'
              }}
            >
              <SkipForward size={15} /> Sig. Orador
            </button>

            <button
              onClick={handleReset}
              style={{
                flex: 1,
                padding: '0.55rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem'
              }}
              title="Reiniciar"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* LISTA DE ORADORES EXCLUSIVA DEL CAUCUS */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', backgroundColor: '#0a0a0a', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>🎤 Lista Oradores del Caucus ({oradoresCaucus.length})</span>
            </div>

            {/* Mini Buscador */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Añadir delegado al caucus..."
                value={busquedaPais}
                onChange={e => setBusquedaPais(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  backgroundColor: '#141414',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
              {busquedaPais.trim().length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#181818',
                  border: '1px solid var(--border-color)',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  zIndex: 20,
                  borderRadius: '4px'
                }}>
                  {paisesDisponiblesCaucus.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleAñadirOradorCaucus(p)}
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--subborder-color)' }}
                    >
                      {p.bandera} {p.nombre}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Render de la Cola del Caucus */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {oradoresCaucus.length === 0 ? (
                <div style={{ fontSize: '0.72rem', opacity: 0.4, textAlign: 'center', margin: 'auto' }}>
                  Sin oradores en la cola del caucus.
                </div>
              ) : (
                oradoresCaucus.map((o, idx) => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.2rem 0.4rem', backgroundColor: idx === 0 ? 'rgba(34,197,94,0.1)' : '#121212', borderRadius: '4px', fontSize: '0.78rem' }}>
                    <span>
                      #{idx + 1} {o.bandera} {o.nombre} {o.esProponenteUltimo ? <strong style={{ color: '#eab308', fontSize: '0.68rem' }}>(Último)</strong> : ''}
                    </span>
                    <button onClick={() => removerOradorCaucus(o.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', opacity: 0.6, cursor: 'pointer' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CronometroDual;
