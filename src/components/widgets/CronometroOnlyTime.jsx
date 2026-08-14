import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Clock, ShieldAlert } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const CronometroOnlyTime = () => {
  const { caucusActivo } = useSession();

  const [tiempoTotalSeg, setTiempoTotalSeg] = useState(caucusActivo?.tiempoTotal || 600); // 10 min
  const [tiempoTotalInicial, setTiempoTotalInicial] = useState(caucusActivo?.tiempoTotal || 600);
  const [corriendo, setCorriendo] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (caucusActivo?.tiempoTotal) {
      setTiempoTotalSeg(caucusActivo.tiempoTotal);
      setTiempoTotalInicial(caucusActivo.tiempoTotal);
      setCorriendo(true);
    }
  }, [caucusActivo]);

  useEffect(() => {
    if (corriendo) {
      timerRef.current = setInterval(() => {
        setTiempoTotalSeg(prev => {
          if (prev <= 1) {
            setCorriendo(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [corriendo]);

  const handleStartPause = () => setCorriendo(!corriendo);
  const handleReset = () => {
    setCorriendo(false);
    const init = caucusActivo?.tiempoTotal || 600;
    setTiempoTotalSeg(init);
    setTiempoTotalInicial(init);
  };

  const handleAddMinutes = (mins) => {
    const extra = mins * 60;
    setTiempoTotalSeg(prev => prev + extra);
    setTiempoTotalInicial(prev => prev + extra);
  };

  const formatTime = (seg) => {
    const mins = Math.floor(seg / 60);
    const secs = seg % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progresoPorcentaje = tiempoTotalInicial > 0
    ? Math.min(100, Math.max(0, ((tiempoTotalInicial - tiempoTotalSeg) / tiempoTotalInicial) * 100))
    : 0;

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

      {/* Reloj Display Gigante */}
      <div style={{
        position: 'relative',
        margin: '0.8rem 0',
        padding: '1.4rem 1rem 1.6rem 1rem',
        borderRadius: '12px',
        textAlign: 'center',
        overflow: 'hidden',
        backgroundColor: tiempoTotalSeg === 0 ? '#3f0c0c' : '#050505',
        border: `2px solid ${tiempoTotalSeg === 0 ? '#ef4444' : 'var(--border-color)'}`,
        boxShadow: '0 6px 25px rgba(0,0,0,0.6)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          fontWeight: '900',
          fontSize: '5.5rem',
          fontFamily: 'monospace',
          letterSpacing: '0.04em',
          lineHeight: 1,
          color: tiempoTotalSeg === 0 ? '#ef4444' : 'var(--text-color)'
        }}>
          {formatTime(tiempoTotalSeg)}
        </div>

        {/* Barra de progreso inferior */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{
            height: '100%',
            width: `${progresoPorcentaje}%`,
            background: tiempoTotalSeg <= 30
              ? 'linear-gradient(90deg, #ef4444, #dc2626)'
              : tiempoTotalSeg <= 60
                ? 'linear-gradient(90deg, #f97316, #ea580c)'
                : 'linear-gradient(90deg, #3b82f6, #6366f1)',
            boxShadow: tiempoTotalSeg <= 60
              ? '0 0 12px rgba(239, 68, 68, 0.8)'
              : 'none',
            transition: 'width 0.4s linear, background 0.3s ease',
            borderRadius: '0 2px 2px 0'
          }} />
        </div>
      </div>

      {/* Botones de Control */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          onClick={handleStartPause}
          style={{
            flex: 2,
            padding: '0.6rem 1rem',
            backgroundColor: corriendo ? '#334155' : '#22c55e',
            color: corriendo ? '#ffffff' : '#000000',
            fontWeight: '700',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            fontSize: '0.9rem',
            transition: 'all 0.15s ease'
          }}
        >
          {corriendo ? <Pause size={17} /> : <Play size={17} />}
          {corriendo ? 'Pausar Conteo' : 'Iniciar Conteo'}
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
            gap: '0.3rem',
            fontSize: '0.85rem'
          }}
        >
          <RotateCcw size={15} /> Reiniciar
        </button>

        <button
          onClick={() => handleAddMinutes(1)}
          style={{
            flex: 1,
            padding: '0.6rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)',
            fontWeight: '600',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          +1 min
        </button>

        <button
          onClick={() => handleAddMinutes(5)}
          style={{
            flex: 1,
            padding: '0.6rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)',
            fontWeight: '600',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          +5 min
        </button>
      </div>
    </div>
  );
};

export default CronometroOnlyTime;
