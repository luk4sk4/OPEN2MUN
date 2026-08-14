import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Clock, Trash2, ArrowUpDown, GripVertical } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const CronometroDual = ({ modoInicial = null }) => {
  const {
    paises,
    caucusActivo,
    oradoresCaucus,
    agregarOradorCaucus,
    removerOradorCaucus,
    avanzarOradorCaucus,
    vaciarOradoresDebate,
    ordenarOradoresDebateAlfabetico,
    reordenarOradoresDebate,
    registrarIntervencion
  } = useSession();

  const [modoSeleccionado, setModoSeleccionado] = useState(modoInicial);

  const tipoMocion = modoSeleccionado || caucusActivo?.tipo || (modoInicial || 'Caucus Moderado');
  const esTiempoSoloGeneral = tipoMocion === 'Caucus No Moderado' || tipoMocion.includes('Consulta General');

  const [tiempoTotalSeg, setTiempoTotalSeg] = useState(caucusActivo?.tiempoTotal || 600);
  const [tiempoTotalInicial, setTiempoTotalInicial] = useState(caucusActivo?.tiempoTotal || 600);
  const [tiempoOradorSeg, setTiempoOradorSeg] = useState(caucusActivo?.tiempoOrador || 45);
  const [limiteOradorSeg, setLimiteOradorSeg] = useState(caucusActivo?.tiempoOrador || 45);
  const [corriendo, setCorriendo] = useState(false);

  const [busquedaPais, setBusquedaPais] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const timerRef = useRef(null);

  // Sincronizar al activar moción desde la Pizarra de Mociones
  useEffect(() => {
    if (caucusActivo?.activo) {
      setModoSeleccionado(caucusActivo.tipo);
      setTiempoTotalSeg(caucusActivo.tiempoTotal);
      setTiempoTotalInicial(caucusActivo.tiempoTotal);
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
    
    // Registrar el tiempo hablado en el histórico
    if (oradorActual && oradorActual.nombre && oradorActual.nombre !== 'Sin orador en cola') {
      const tiempoHabladoExacto = Math.max(1, limiteOradorSeg - tiempoOradorSeg);
      const overtime = tiempoOradorSeg < 0 ? Math.abs(tiempoOradorSeg) : 0;
      registrarIntervencion(oradorActual.nombre, limiteOradorSeg, tiempoHabladoExacto, overtime);
    }

    setTiempoOradorSeg(limiteOradorSeg);
    avanzarOradorCaucus();
  };

  const handleReset = () => {
    setCorriendo(false);
    const initTotal = caucusActivo?.tiempoTotal || 600;
    setTiempoTotalSeg(initTotal);
    setTiempoTotalInicial(initTotal);
    setTiempoOradorSeg(limiteOradorSeg);
  };

  const handleAumentarSegundos = (seg) => {
    setTiempoTotalSeg(prev => prev + seg);
    setTiempoTotalInicial(prev => prev + seg);
  };

  const handleAumentar5MinCaucus = () => {
    setTiempoTotalSeg(prev => prev + 300);
    setTiempoTotalInicial(prev => prev + 300);
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

  const progresoTotalPorcentaje = tiempoTotalInicial > 0
    ? Math.min(100, Math.max(0, ((tiempoTotalInicial - tiempoTotalSeg) / tiempoTotalInicial) * 100))
    : 0;

  const progresoOradorPorcentaje = limiteOradorSeg > 0
    ? Math.min(100, Math.max(0, ((limiteOradorSeg - tiempoOradorSeg) / limiteOradorSeg) * 100))
    : 0;

  return (
    <div style={{
      padding: '1rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      backgroundColor: 'var(--panel-color)',
      color: 'var(--text-color)',
      gap: '0.6rem'
    }}>
      {/* Header Tipo de Moción & Selector Dinámico de Modo */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Clock size={16} style={{ opacity: 0.7 }} />
            <div>
              <div style={{ fontSize: '0.65rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '700' }}>
                Moción: <span style={{ color: 'var(--text-color)', opacity: 0.9 }}>{tipoMocion}</span>
              </div>
              <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-color)' }}>
                {caucusActivo?.tema || 'Sin Tema Asignado'}
              </div>
            </div>
          </div>

          {/* Selector de Modo Manual */}
          <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: 'var(--card-header-bg)', padding: '2px', borderRadius: '5px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setModoSeleccionado('Caucus Moderado')}
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.68rem',
                fontWeight: '700',
                backgroundColor: tipoMocion === 'Caucus Moderado' ? 'var(--btn-bg)' : 'transparent',
                color: tipoMocion === 'Caucus Moderado' ? 'var(--btn-text)' : 'var(--muted-text)',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Moderado
            </button>
            <button
              onClick={() => setModoSeleccionado('Caucus No Moderado')}
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.68rem',
                fontWeight: '700',
                backgroundColor: tipoMocion === 'Caucus No Moderado' ? 'var(--btn-bg)' : 'transparent',
                color: tipoMocion === 'Caucus No Moderado' ? 'var(--btn-text)' : 'var(--muted-text)',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              No Moderado
            </button>
            <button
              onClick={() => setModoSeleccionado('Tour de Table')}
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.68rem',
                fontWeight: '700',
                backgroundColor: tipoMocion === 'Tour de Table' ? 'var(--btn-bg)' : 'transparent',
                color: tipoMocion === 'Tour de Table' ? 'var(--btn-text)' : 'var(--muted-text)',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Tour de Table
            </button>
          </div>
        </div>
      </div>

      {/* VISTA 1: CAUCUS NO MODERADO O CONSULTA GENERAL */}
      {esTiempoSoloGeneral && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
          <div
            className={displayTotalState.className}
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '1.5rem 1.5rem 1.8rem 1.5rem',
              borderRadius: '8px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              ...displayTotalState.style
            }}
          >
            <div style={{ fontSize: '0.85rem', opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
              {tipoMocion.includes('Consulta General') ? 'Tiempo Total de Consulta General' : 'Tiempo Total del Caucus No Moderado'}
            </div>
            <div style={{
              fontWeight: '900',
              fontSize: 'clamp(5.8rem, 11vw, 7.8rem)',
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
              lineHeight: 0.95,
              marginTop: '8px',
              marginBottom: '8px',
              textShadow: '0 4px 20px rgba(0,0,0,0.7)'
            }}>
              {formatTimeWithNegative(tiempoTotalSeg)}
            </div>

            {/* Barra de progreso inferior con degradado y glow suave */}
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
                width: `${progresoTotalPorcentaje}%`,
                background: tiempoTotalSeg <= 30
                  ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                  : tiempoTotalSeg <= 60
                    ? 'linear-gradient(90deg, #f97316, #ea580c)'
                    : 'linear-gradient(90deg, #3b82f6, #6366f1, #ec4899)',
                boxShadow: tiempoTotalSeg <= 60
                  ? '0 0 12px rgba(239, 68, 68, 0.8)'
                  : '0 0 10px rgba(99, 102, 241, 0.6)',
                transition: 'width 0.4s linear, background 0.3s ease',
                borderRadius: '0 2px 2px 0'
              }} />
            </div>
          </div>

          {/* BOTONES DE CONTROL Y TIEMPO RÁPIDO */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleStartPause}
              style={{
                flex: 2,
                padding: '0.6rem',
                backgroundColor: corriendo ? '#334155' : '#22c55e',
                color: corriendo ? '#ffffff' : '#000000',
                fontWeight: '700',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                fontSize: '0.85rem',
                transition: 'all 0.15s ease'
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

            <button
              onClick={() => handleAumentarSegundos(60)}
              style={{
                flex: 1,
                padding: '0.6rem',
                backgroundColor: 'var(--card-header-bg)',
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
              onClick={() => handleAumentarSegundos(300)}
              style={{
                flex: 1,
                padding: '0.6rem',
                backgroundColor: 'var(--card-header-bg)',
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
      )}

      {/* VISTA 2: TOUR DE TABLE */}
      {tipoMocion === 'Tour de Table' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {/* Display Grande Orador */}
          <div
            className={displayOradorState.className}
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '0.8rem 0.8rem 1.1rem 0.8rem',
              borderRadius: '8px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              ...displayOradorState.style
            }}
          >
            <div style={{ fontSize: '1.35rem', marginBottom: '0.3rem', fontWeight: '800' }}>
              <span style={{ fontSize: '1.65rem', marginRight: '0.4rem' }}>{oradorActual.bandera}</span>
              <span>{oradorActual.nombre}</span>
            </div>
            <div style={{
              fontWeight: '900',
              fontSize: 'clamp(4.8rem, 8.5vw, 6.2rem)',
              fontFamily: 'monospace',
              lineHeight: 0.95,
              marginTop: '6px',
              marginBottom: '6px',
              letterSpacing: '0.04em',
              textShadow: '0 4px 16px rgba(0,0,0,0.7)'
            }}>
              {formatTimeWithNegative(tiempoOradorSeg)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Asignado ({limiteOradorSeg}s)</span>
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
                +5s
              </button>
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
                width: `${progresoOradorPorcentaje}%`,
                background: tiempoOradorSeg <= 5
                  ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                  : tiempoOradorSeg <= 10
                    ? 'linear-gradient(90deg, #f97316, #ea580c)'
                    : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                transition: 'width 0.4s linear, background 0.3s ease',
                borderRadius: '0 2px 2px 0'
              }} />
            </div>
          </div>

          {/* BOTONES DE CONTROL */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={handleStartPause}
              style={{
                flex: 2,
                padding: '0.55rem',
                backgroundColor: corriendo ? '#334155' : '#22c55e',
                color: corriendo ? '#ffffff' : '#000000',
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
              {corriendo ? 'Pausar' : 'Iniciar'}
            </button>

            <button
              onClick={handleSiguienteOrador}
              style={{
                flex: 2,
                padding: '0.55rem',
                backgroundColor: '#2563eb',
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

          {/* LISTA DE SIGUIENTES ORADORES (TOUR DE TABLE) */}
          <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem', backgroundColor: 'var(--card-header-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.3rem' }}>
              <div style={{ fontSize: '0.72rem', opacity: 0.75, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tour de Table ({oradoresCaucus.length}):
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={ordenarOradoresDebateAlfabetico}
                  disabled={oradoresCaucus.length <= 1}
                  title="Ordenar Tour de Table alfabéticamente (A-Z)"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    padding: '0.15rem 0.45rem',
                    fontSize: '0.68rem',
                    fontWeight: '600',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-color)',
                    cursor: oradoresCaucus.length <= 1 ? 'not-allowed' : 'pointer',
                    opacity: oradoresCaucus.length <= 1 ? 0.4 : 1
                  }}
                >
                  <ArrowUpDown size={11} />
                  <span>A-Z</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (oradoresCaucus.length > 0) {
                      vaciarOradoresDebate();
                    }
                  }}
                  disabled={oradoresCaucus.length === 0}
                  title="Eliminar todos los oradores de Tour de Table"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    padding: '0.15rem 0.45rem',
                    fontSize: '0.68rem',
                    fontWeight: '600',
                    borderRadius: '4px',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    cursor: oradoresCaucus.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: oradoresCaucus.length === 0 ? 0.4 : 1
                  }}
                >
                  <Trash2 size={11} />
                  <span>Eliminar todos</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {oradoresCaucus.map((o, idx) => {
                const isDragging = draggedIndex === idx;
                const isDragOver = dragOverIndex === idx;

                return (
                  <div
                    key={o.id}
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
                        reordenarOradoresDebate(fromIndex, idx);
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
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.92rem',
                      backgroundColor: isDragging
                        ? 'rgba(245, 158, 11, 0.15)'
                        : (idx === 0 ? 'rgba(34,197,94,0.12)' : (idx === 1 ? 'rgba(59,130,246,0.08)' : 'var(--panel-color)')),
                      border: isDragOver
                        ? '2px dashed #f59e0b'
                        : `1px solid ${isDragging ? '#f59e0b' : (idx === 0 ? '#166534' : (idx === 1 ? 'rgba(59,130,246,0.3)' : 'var(--subborder-color)'))}`,
                      borderRadius: '5px',
                      opacity: isDragging ? 0.5 : 1,
                      cursor: 'grab',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      <GripVertical size={13} style={{ color: '#71717a', cursor: 'grab', flexShrink: 0 }} title="Arrastrar para reordenar" />
                      <span style={{ fontSize: '0.78rem', fontWeight: '800', color: idx === 0 ? '#4ade80' : (idx === 1 ? '#60a5fa' : 'var(--muted-text)'), width: '22px' }}>
                        #{idx + 1}
                      </span>
                      <span style={{ fontSize: '1.3rem' }}>{o.bandera}</span>
                      <span style={{ fontWeight: idx === 0 ? '800' : '600', color: 'var(--text-color)', fontSize: '0.92rem' }}>
                        {o.nombre}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {idx === 0 && (
                        <span style={{ backgroundColor: '#15803d', color: '#ffffff', fontWeight: '800', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>
                          HABLANDO
                        </span>
                      )}
                      {idx === 1 && (
                        <span style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#93c5fd', fontWeight: '700', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>
                          SIGUIENTE
                        </span>
                      )}
                      <button
                        onClick={() => removerOradorCaucus(o.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          opacity: 0.7,
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '3px'
                        }}
                        title="Quitar de Tour de Table"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VISTA 3: CAUCUS MODERADO */}
      {tipoMocion === 'Caucus Moderado' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Reloj Superior (Total Caucus) */}
          <div style={{
            backgroundColor: 'var(--card-header-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '7px',
            padding: '0.45rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.75, fontWeight: '700', letterSpacing: '0.02em' }}>Tiempo Total Caucus:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: '900', fontSize: '1.65rem', letterSpacing: '0.04em', color: tiempoTotalSeg < 0 ? '#ef4444' : 'var(--text-color)', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                {formatTimeWithNegative(tiempoTotalSeg)}
              </span>
              <button
                onClick={handleAumentar5MinCaucus}
                style={{
                  padding: '0.25rem 0.55rem',
                  backgroundColor: 'var(--btn-bg)',
                  color: 'var(--btn-text)',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '800',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                +5 min
              </button>
            </div>
          </div>

          {/* Display Principal Orador con Máxima Prominencia y Visibilidad para Proyección */}
          <div
            className={displayOradorState.className}
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '0.75rem 0.8rem 1rem 0.8rem',
              borderRadius: '10px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              ...displayOradorState.style
            }}
          >
            <div style={{ fontSize: '1.35rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-color)' }}>
              <span style={{ fontSize: '1.65rem' }}>{oradorActual.bandera}</span>
              <span>{oradorActual.nombre}</span>
              {oradorActual.esProponenteUltimo && (
                <span style={{ fontSize: '0.68rem', backgroundColor: 'rgba(255,255,255,0.12)', color: 'var(--text-color)', padding: '0.12rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                  PROPONENTE
                </span>
              )}
            </div>
            <div style={{
              fontWeight: '900',
              fontSize: 'clamp(4.8rem, 8.5vw, 6.2rem)',
              fontFamily: 'monospace',
              lineHeight: 0.95,
              marginTop: '6px',
              marginBottom: '6px',
              letterSpacing: '0.04em',
              textShadow: '0 4px 16px rgba(0,0,0,0.7)'
            }}>
              {formatTimeWithNegative(tiempoOradorSeg)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', alignItems: 'center', marginTop: '0.3rem' }}>
              <span style={{ fontSize: '0.78rem', opacity: 0.75, fontWeight: '600' }}>Límite ({limiteOradorSeg}s)</span>
              <button
                onClick={handleAumentar5SegOrador}
                style={{
                  padding: '0.15rem 0.5rem',
                  backgroundColor: 'rgba(34, 197, 94, 0.18)',
                  border: '1px solid #22c55e',
                  color: '#22c55e',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: '800'
                }}
              >
                +5s
              </button>
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
                width: `${progresoOradorPorcentaje}%`,
                background: tiempoOradorSeg <= 5
                  ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                  : tiempoOradorSeg <= 10
                    ? 'linear-gradient(90deg, #f97316, #ea580c)'
                    : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                transition: 'width 0.4s linear, background 0.3s ease',
                borderRadius: '0 2px 2px 0'
              }} />
            </div>
          </div>

          {/* BOTONES DE CONTROL */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={handleStartPause}
              style={{
                flex: 2,
                padding: '0.55rem',
                backgroundColor: corriendo ? '#334155' : '#22c55e',
                color: corriendo ? '#ffffff' : '#000000',
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
              {corriendo ? 'Pausar' : 'Iniciar'}
            </button>

            <button
              onClick={handleSiguienteOrador}
              style={{
                flex: 2,
                padding: '0.55rem',
                backgroundColor: '#2563eb',
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

          {/* LISTA DE SIGUIENTES ORADORES DEL CAUCUS */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem', backgroundColor: 'var(--card-header-bg)', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', opacity: 0.8 }}>
                🎤 Oradores Debate ({oradoresCaucus.length})
              </span>
              
              {/* Botones de orden alfabético y eliminar todos de debate */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={ordenarOradoresDebateAlfabetico}
                  disabled={oradoresCaucus.length <= 1}
                  title="Ordenar debate alfabéticamente (A-Z)"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    padding: '0.15rem 0.45rem',
                    fontSize: '0.68rem',
                    fontWeight: '600',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-color)',
                    cursor: oradoresCaucus.length <= 1 ? 'not-allowed' : 'pointer',
                    opacity: oradoresCaucus.length <= 1 ? 0.4 : 1
                  }}
                >
                  <ArrowUpDown size={11} />
                  <span>A-Z</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (oradoresCaucus.length > 0) {
                      vaciarOradoresDebate();
                    }
                  }}
                  disabled={oradoresCaucus.length === 0}
                  title="Eliminar todos los oradores de Debate"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    padding: '0.15rem 0.45rem',
                    fontSize: '0.68rem',
                    fontWeight: '600',
                    borderRadius: '4px',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    cursor: oradoresCaucus.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: oradoresCaucus.length === 0 ? 0.4 : 1
                  }}
                >
                  <Trash2 size={11} />
                  <span>Eliminar todos</span>
                </button>
              </div>
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
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.8rem',
                  backgroundColor: 'var(--panel-color)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)',
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }}
              />
              {busquedaPais.trim().length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'var(--card-header-bg)',
                  border: '1px solid var(--border-color)',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  zIndex: 20,
                  borderRadius: '5px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                }}>
                  {paisesDisponiblesCaucus.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleAñadirOradorCaucus(p)}
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--subborder-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{p.bandera}</span>
                      <span style={{ fontWeight: '600' }}>{p.nombre}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Render de la Cola del Caucus */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: '2px' }}>
              {oradoresCaucus.length === 0 ? (
                <div style={{ fontSize: '0.78rem', opacity: 0.4, textAlign: 'center', margin: 'auto' }}>
                  Sin oradores en la cola del caucus.
                </div>
              ) : (
                oradoresCaucus.map((o, idx) => {
                  const isDragging = draggedIndex === idx;
                  const isDragOver = dragOverIndex === idx;

                  return (
                    <div
                      key={o.id}
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
                        if (draggedIndex !== idx) {
                          setDragOverIndex(idx);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverIndex === idx) {
                          setDragOverIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIndexStr = e.dataTransfer.getData('text/plain');
                        const fromIndex = parseInt(fromIndexStr, 10);
                        if (!isNaN(fromIndex) && fromIndex !== idx) {
                          reordenarOradoresDebate(fromIndex, idx);
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
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.45rem 0.65rem',
                        backgroundColor: isDragging 
                          ? 'rgba(249, 115, 22, 0.15)' 
                          : (idx === 0 ? 'rgba(34,197,94,0.12)' : (idx === 1 ? 'rgba(59,130,246,0.08)' : 'var(--panel-color)')),
                        border: isDragOver
                          ? '2px dashed #f97316'
                          : `1px solid ${isDragging ? '#f97316' : (idx === 0 ? '#166534' : (idx === 1 ? 'rgba(59,130,246,0.3)' : 'var(--subborder-color)'))}`,
                        borderRadius: '5px',
                        opacity: isDragging ? 0.5 : 1,
                        cursor: 'grab',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                        <GripVertical size={13} style={{ color: '#71717a', cursor: 'grab', flexShrink: 0 }} title="Arrastrar para reordenar" />
                        <span style={{ fontSize: '0.78rem', fontWeight: '800', color: idx === 0 ? '#4ade80' : (idx === 1 ? '#60a5fa' : 'var(--muted-text)'), width: '22px' }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontSize: '1.3rem' }}>{o.bandera}</span>
                        <span style={{ fontWeight: idx === 0 ? '800' : '600', fontSize: '0.92rem', color: 'var(--text-color)' }}>
                          {o.nombre}
                        </span>
                        {o.esProponenteUltimo && (
                          <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '3px', opacity: 0.7 }}>
                            (Último)
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        {idx === 0 && (
                          <span style={{ backgroundColor: '#15803d', color: '#ffffff', fontWeight: '800', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '3px', marginRight: '4px' }}>
                            HABLANDO
                          </span>
                        )}
                        {idx === 1 && (
                          <span style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#93c5fd', fontWeight: '700', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '3px', marginRight: '4px' }}>
                            SIGUIENTE
                          </span>
                        )}

                        <button
                          onClick={() => removerOradorCaucus(o.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            opacity: 0.7,
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '3px'
                          }}
                          title="Quitar de la lista"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CronometroDual;
