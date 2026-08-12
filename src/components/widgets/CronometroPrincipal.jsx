import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Square, Download, Clock, CheckCircle2 } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const CronometroPrincipal = () => {
  const { oradoresCola, registrarIntervencion, descargarSesionJSON } = useSession();
  
  const [tiempoInicial, setTiempoInicial] = useState(60);
  const [segundosRestantes, setSegundosRestantes] = useState(60);
  const [corriendo, setCorriendo] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState(false);

  const oradorActual = oradoresCola.length > 0 ? oradoresCola[0] : { nombre: 'Delegación en uso', bandera: '🇺🇳' };

  const timerRef = useRef(null);

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

  const handleTerminar = () => {
    setCorriendo(false);

    let tiempoHabladoExacto = 0;
    let overtime = 0;
    if (segundosRestantes < 0) {
      overtime = Math.abs(segundosRestantes);
      tiempoHabladoExacto = tiempoInicial + overtime;
    } else {
      tiempoHabladoExacto = tiempoInicial - segundosRestantes;
    }

    registrarIntervencion(oradorActual.nombre, tiempoInicial, tiempoHabladoExacto, overtime);

    setMensajeGuardado(true);
    setTimeout(() => setMensajeGuardado(false), 2500);

    setSegundosRestantes(tiempoInicial);
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

        {/* Presets */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {[45, 60, 90, 120].map(s => (
            <button
              key={s}
              onClick={() => handleCambiarPreset(s)}
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.75rem',
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
        </div>
      </div>

      {/* Reloj Display con Alertas Visuales */}
      <div
        className={displayState.className}
        style={{
          margin: '1rem 0',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          position: 'relative',
          ...displayState.style
        }}
      >
        <div>
          <div style={{
            fontWeight: '800',
            fontSize: '3.2rem',
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
          }}>
            {formatTimeWithNegative(segundosRestantes)}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.2rem' }}>
            {segundosRestantes < 0 ? '⚠️ TIEMPO EXCEDIDO (OVERTIME)' : `Asignado: ${tiempoInicial} seg`}
          </div>
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
            flex: 2,
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
          <RotateCcw size={15} />
        </button>

        <button
          onClick={handleAdd5Sec}
          style={{
            flex: 1,
            padding: '0.6rem 0.4rem',
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
            flex: 1,
            padding: '0.6rem 0.4rem',
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
          onClick={handleTerminar}
          style={{
            flex: 2,
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
        >
          <Square size={16} /> Terminar
        </button>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.75rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={13} /> Sincronizado con sesion_activa.json
        </div>
        <button
          onClick={descargarSesionJSON}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-color)',
            opacity: 0.8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}
          title="Descargar sesion_activa.json"
        >
          <Download size={14} /> Exportar JSON
        </button>
      </div>
    </div>
  );
};

export default CronometroPrincipal;
