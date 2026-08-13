import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Clock, ShieldAlert } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const CronometroOnlyTime = () => {
  const { caucusActivo } = useSession();

  const [tiempoTotalSeg, setTiempoTotalSeg] = useState(caucusActivo?.tiempoTotal || 600); // 10 min
  const [corriendo, setCorriendo] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (caucusActivo?.tiempoTotal) {
      setTiempoTotalSeg(caucusActivo.tiempoTotal);
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
    setTiempoTotalSeg(caucusActivo?.tiempoTotal || 600);
  };

  const handleAddMinutes = (mins) => {
    setTiempoTotalSeg(prev => prev + mins * 60);
  };

  const formatTime = (seg) => {
    const mins = Math.floor(seg / 60);
    const secs = seg % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldAlert size={18} color="#eab308" />
          <div>
            <div style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Caucus No Moderado</div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
              {caucusActivo?.tema ? caucusActivo.tema : 'Tiempo General de Libre Debate'}
            </div>
          </div>
        </div>
      </div>

      {/* Reloj Display Gigante */}
      <div style={{
        margin: '0.8rem 0',
        padding: '1.4rem 1rem',
        borderRadius: '12px',
        textAlign: 'center',
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
          color: tiempoTotalSeg === 0 ? '#ef4444' : (corriendo ? '#eab308' : 'var(--text-color)')
        }}>
          {formatTime(tiempoTotalSeg)}
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
          ⏱️ Tiempo Total de Libres Negociaciones
        </div>
      </div>

      {/* Botones de Control */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          onClick={handleStartPause}
          style={{
            flex: 2,
            padding: '0.6rem 1rem',
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
            fontSize: '0.9rem'
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
