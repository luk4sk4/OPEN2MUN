import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Square, Download, Clock, CheckCircle2, ArrowRightLeft, Shield, HelpCircle, SkipForward } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const CronometroPrincipal = () => {
  const { paises, oradoresCola, removerOrador, registrarIntervencion, descargarSesionJSON, actualizarRelojGSL, yieldEvento, cederTiempo } = useSession();

  const [tiempoInicial, setTiempoInicial] = useState(60);
  const [inputSegundos, setInputSegundos] = useState(60);
  const [segundosRestantes, setSegundosRestantes] = useState(60);
  const [corriendo, setCorriendo] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState(false);
  const [modalYieldOpen, setModalYieldOpen] = useState(false);

  const oradorActual = oradoresCola.length > 0 ? oradoresCola[0] : { nombre: 'Delegación en uso', bandera: '🇺🇳' };

  const timerRef = useRef(null);

  // Sincronizar estado del reloj con SessionContext
  useEffect(() => {
    actualizarRelojGSL(segundosRestantes, tiempoInicial, corriendo);
  }, [segundosRestantes, tiempoInicial, corriendo]);

  // Reaccionar a eventos de Yield
  useEffect(() => {
    if (!yieldEvento) return;
    if (yieldEvento.tipo === 'mesa') {
      setCorriendo(false);
      setSegundosRestantes(tiempoInicial);
    } else if (yieldEvento.tipo === 'delegado') {
      if (typeof yieldEvento.segundosRestantes === 'number') {
        setSegundosRestantes(yieldEvento.segundosRestantes);
      }
      setCorriendo(true); // Comienza inmediatamente
    }
  }, [yieldEvento, tiempoInicial]);

  useEffect(() => {
    if (corriendo) {
      timerRef.current = setInterval(() => {
        setSegundosRestantes(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [corriendo]);

  const handleStartPause = () => setCorriendo(!corriendo);

  const handleReset = () => {
    setCorriendo(false);
    setSegundosRestantes(tiempoInicial);
  };

  const handleAdd5Sec = () => {
    setSegundosRestantes(prev => prev + 5);
  };

  const handleAdd15Sec = () => {
    setSegundosRestantes(prev => prev + 15);
  };

  const handleCambiarPreset = (nuevosSegundos) => {
    setCorriendo(false);
    setTiempoInicial(nuevosSegundos);
    setSegundosRestantes(nuevosSegundos);
  };

  const handleSiguienteOrador = () => {
    setCorriendo(false);

    let tiempoHabladoExacto = 0;
    let overtime = 0;
    if (segundosRestantes < 0) {
      overtime = Math.abs(segundosRestantes);
      tiempoHabladoExacto = tiempoInicial + overtime;
    } else {
      tiempoHabladoExacto = tiempoInicial - segundosRestantes;
    }

    if (oradoresCola.length > 0) {
      registrarIntervencion(oradoresCola[0].nombre, tiempoInicial, tiempoHabladoExacto, overtime);
      removerOrador(oradoresCola[0].id);
    }

    setMensajeGuardado(true);
    setTimeout(() => setMensajeGuardado(false), 2500);

    setSegundosRestantes(tiempoInicial);
  };

  const handleEjecutarYield = (tipo, destino = '') => {
    cederTiempo(tipo, destino);
    setModalYieldOpen(false);
  };

  const formatTimeWithNegative = (seg) => {
    const isNegative = seg < 0;
    const absSeg = Math.abs(seg);
    const mins = Math.floor(absSeg / 60);
    const secs = absSeg % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return isNegative ? `-${formatted}` : formatted;
  };

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

  const displayState = getTimerStyle(segundosRestantes);

  const progresoPorcentaje = tiempoInicial > 0
    ? Math.min(100, Math.max(0, ((tiempoInicial - segundosRestantes) / tiempoInicial) * 100))
    : 0;

  return (
    <div style={{
      position: 'relative',
      padding: '1.2rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      backgroundColor: 'var(--panel-color)',
      color: 'var(--text-color)',
    }}>
      {/* Header Orador */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.4rem' }}>{oradorActual.bandera}</span>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orador Activo</div>
            <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{oradorActual.nombre}</div>
          </div>
        </div>

        {/* Presets & Tiempo Exacto Personalizado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {[45, 60, 90, 120].map(s => (
            <button
              key={s}
              onClick={() => {
                setInputSegundos(s);
                handleCambiarPreset(s);
              }}
              style={{
                padding: '0.2rem 0.45rem',
                fontSize: '0.72rem',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: tiempoInicial === s ? 'var(--btn-bg)' : 'transparent',
                color: tiempoInicial === s ? 'var(--btn-text)' : 'var(--text-color)',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {s}s
            </button>
          ))}

          {/* Selector de Tiempo Exacto */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#111111', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.68rem', opacity: 0.75, fontWeight: '600' }}>Exacto:</span>
            <input
              type="number"
              min="1"
              max="3600"
              value={inputSegundos}
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 0);
                setInputSegundos(val);
                handleCambiarPreset(val);
              }}
              style={{
                width: '46px',
                padding: '0.15rem 0.25rem',
                backgroundColor: '#000000',
                border: '1px solid var(--border-color)',
                color: '#22c55e',
                borderRadius: '3px',
                fontSize: '0.75rem',
                fontWeight: '700',
                textAlign: 'center',
                outline: 'none'
              }}
              title="Ingresar cantidad exacta de segundos para el cronómetro"
            />
            <span style={{ fontSize: '0.68rem', opacity: 0.75 }}>s</span>
          </div>
        </div>
      </div>

      {/* Reloj Display con Alertas Visuales */}
      <div
        className={displayState.className}
        style={{
          margin: '0.75rem 0',
          padding: '1.4rem 1rem 1.6rem 1rem',
          borderRadius: '10px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          ...displayState.style
        }}
      >
        <div>
          <div style={{
            fontWeight: '900',
            fontSize: '5.2rem',
            fontFamily: 'monospace',
            letterSpacing: '0.04em',
            lineHeight: 1
          }}>
            {formatTimeWithNegative(segundosRestantes)}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: '0.5rem', fontWeight: '600' }}>
            {segundosRestantes < 0 ? '⚠️ TIEMPO EXCEDIDO (OVERTIME)' : `Asignado: ${tiempoInicial} seg`}
          </div>
        </div>

        {/* Barra de progreso inferior con degradado y glow suave */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '5px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{
            height: '100%',
            width: `${progresoPorcentaje}%`,
            background: segundosRestantes <= 5
              ? 'linear-gradient(90deg, #ef4444, #dc2626)'
              : segundosRestantes <= 10
                ? 'linear-gradient(90deg, #f97316, #ea580c)'
                : 'linear-gradient(90deg, #3b82f6, #6366f1, #ec4899)',
            boxShadow: segundosRestantes <= 10
              ? '0 0 12px rgba(239, 68, 68, 0.8)'
              : '0 0 10px rgba(99, 102, 241, 0.6)',
            transition: 'width 0.4s linear, background 0.3s ease',
            borderRadius: '0 3px 3px 0'
          }} />
        </div>

        {mensajeGuardado && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: '#15803d',
            color: '#ffffff',
            fontSize: '0.75rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <CheckCircle2 size={13} /> Guardado en sesion_activa.json
          </div>
        )}
      </div>

      {/* Botones de Control */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
        <button
          onClick={handleStartPause}
          style={{
            flex: '1 1 120px',
            padding: '0.6rem 0.8rem',
            backgroundColor: corriendo ? '#eab308' : '#22c55e',
            color: '#000000',
            fontWeight: '700',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem'
          }}
        >
          {corriendo ? <Pause size={17} /> : <Play size={17} />}
          {corriendo ? 'Pausar' : 'Iniciar'}
        </button>

        <button
          onClick={handleReset}
          style={{
            flex: '0 1 45px',
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
          <RotateCcw size={15} />
        </button>

        <button
          onClick={handleAdd5Sec}
          style={{
            flex: '0 1 42px',
            padding: '0.6rem 0.3rem',
            backgroundColor: 'rgba(34,197,94,0.15)',
            border: '1px solid #22c55e',
            color: '#22c55e',
            fontWeight: '700',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          +5s
        </button>

        <button
          onClick={handleAdd15Sec}
          style={{
            flex: '0 1 42px',
            padding: '0.6rem 0.3rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)',
            fontWeight: '600',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          +15s
        </button>

        <button
          onClick={() => setModalYieldOpen(true)}
          disabled={oradoresCola.length === 0}
          style={{
            flex: '1 1 110px',
            padding: '0.6rem 0.7rem',
            backgroundColor: oradoresCola.length > 0 ? '#2563eb' : '#222222',
            color: '#ffffff',
            fontWeight: '700',
            border: 'none',
            borderRadius: '6px',
            cursor: oradoresCola.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            fontSize: '0.82rem',
            opacity: oradoresCola.length > 0 ? 1 : 0.5
          }}
          title="Ceder el tiempo restante (Yield)"
        >
          <ArrowRightLeft size={15} /> Ceder (Yield)
        </button>

        <button
          onClick={handleSiguienteOrador}
          style={{
            flex: '1 1 135px',
            padding: '0.6rem 0.8rem',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontWeight: '700',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem'
          }}
          title="Terminar intervención y pasar al siguiente orador"
        >
          <SkipForward size={16} /> Siguiente Orador
        </button>
      </div>

      {/* Menú/Modal de Yield dentro del Cronómetro */}
      {modalYieldOpen && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(5, 5, 8, 0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.8rem',
          boxSizing: 'border-box',
          borderRadius: 'var(--border-radius)'
        }}>
          <div style={{
            backgroundColor: 'rgba(14, 14, 20, 0.98)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius)',
            padding: '1rem',
            width: '100%',
            maxWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            color: 'var(--text-color)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.9)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowRightLeft size={18} color="#3b82f6" />
              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700' }}>
                Ceder el tiempo (Yield)
              </h4>
            </div>

            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.75, lineHeight: 1.35 }}>
              El orador actual (<strong>{oradorActual.nombre}</strong>) cede su tiempo ({segundosRestantes}s) a:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <button
                onClick={() => handleEjecutarYield('mesa')}
                style={{
                  padding: '0.55rem 0.75rem',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.83rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textAlign: 'left'
                }}
              >
                <Shield size={16} color="#eab308" /> A la Mesa (Chair)
              </button>

              <button
                onClick={() => handleEjecutarYield('preguntas')}
                style={{
                  padding: '0.55rem 0.75rem',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.83rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textAlign: 'left'
                }}
              >
                <HelpCircle size={16} color="#3b82f6" /> A Preguntas del Pleno
              </button>

              <div style={{ borderTop: '1px solid var(--subborder-color)', paddingTop: '0.45rem' }}>
                <div style={{ fontSize: '0.73rem', opacity: 0.7, marginBottom: '0.35rem', fontWeight: '600' }}>A otra Delegación:</div>
                <select
                  onChange={e => e.target.value && handleEjecutarYield('delegado', e.target.value)}
                  defaultValue=""
                  style={{
                    width: '100%',
                    padding: '0.45rem',
                    backgroundColor: '#121212',
                    border: '1px solid var(--border-color)',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" disabled>Seleccionar delegación...</option>
                  {paises.filter(p => p.nombre !== oradorActual.nombre).map(p => (
                    <option key={p.id} value={p.nombre}>{p.bandera} {p.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setModalYieldOpen(false)}
              style={{
                marginTop: '0.2rem',
                padding: '0.4rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: '600'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CronometroPrincipal;
