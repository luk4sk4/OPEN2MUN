import React, { useState, useMemo } from 'react';
import { 
  Vote, 
  Crown, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowUpDown, 
  Search, 
  Play, 
  ShieldAlert, 
  Check, 
  X, 
  Info, 
  Sparkles, 
  HelpCircle, 
  Users, 
  Scale, 
  Target 
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const VotacionOficial = () => {
  const { 
    paises, 
    votacionSesion, 
    registrarVotoPais, 
    configurarVotacion, 
    resetearVotacion 
  } = useSession();

  const [busqueda, setBusqueda] = useState('');
  const [criterioOrden, setCriterioOrden] = useState('alphabetical_asc'); // 'alphabetical_asc' | 'alphabetical_desc' | 'vote_status' | 'p5_veto' | 'roll_call'
  
  // Estado para Roll Call Nominal de 2 Rondas
  const [modoRollCall, setModoRollCall] = useState(false);
  const [rondaRollCall, setRondaRollCall] = useState(1); // 1 = Primera Ronda, 2 = Segunda Ronda (Pasados)
  const [indiceRollCall, setIndiceRollCall] = useState(0);
  const [paisesPasados, setPaisesPasados] = useState([]); // IDs de países que seleccionaron 'Pasar' en Ronda 1

  const { asunto, tipoVotacion, tipoMayoria, aplicarVeto, votos = {} } = votacionSesion;

  // Conteo de Quórum y Asistencia
  const totalPaises = paises.length;
  const presentes = useMemo(() => paises.filter(p => p.estatus === 'Presente').length, [paises]);
  const presentesYVotando = useMemo(() => paises.filter(p => p.estatus === 'Presente y Votando').length, [paises]);
  const ausentes = useMemo(() => paises.filter(p => p.estatus === 'Ausente').length, [paises]);

  // Filtrado de países asistentes (excluyendo ausentes)
  const paisesAsistentes = useMemo(() => {
    return paises.filter(p => p.estatus === 'Presente' || p.estatus === 'Presente y Votando');
  }, [paises]);

  const totalAsistentes = paisesAsistentes.length;

  // Umbrales de Mayorías calculados con el número de gente presente/votando en ese momento
  const reqSimpleQuorum = totalAsistentes > 0 ? Math.floor(totalAsistentes / 2) + 1 : 0;
  const reqDosTerciosQuorum = totalAsistentes > 0 ? Math.ceil((totalAsistentes * 2) / 3) : 0;
  const reqAbsolutaTotal = totalPaises > 0 ? Math.floor(totalPaises / 2) + 1 : 0;

  // Conteo de Votos
  const { favor, contra, abstencion, vetoEjercido, paisesConVetoEfectuado } = useMemo(() => {
    let f = 0, c = 0, a = 0;
    const vetoPaises = [];

    paisesAsistentes.forEach(p => {
      const v = votos[p.id];
      if (v === 'favor') f++;
      else if (v === 'contra') {
        c++;
        if (aplicarVeto && p.veto) {
          vetoPaises.push(p);
        }
      }
      else if (v === 'abstencion') a++;
    });

    return {
      favor: f,
      contra: c,
      abstencion: a,
      vetoEjercido: vetoPaises.length > 0,
      paisesConVetoEfectuado: vetoPaises
    };
  }, [paisesAsistentes, votos, aplicarVeto]);

  const votosEmitidos = favor + contra + abstencion;
  const votosPendientes = totalAsistentes - votosEmitidos;

  // Cálculo de Umbral según Tipo de Mayoría y MUN Rules
  const votosValidosSinAbstencion = favor + contra;

  let requeridos = 0;
  let pasaSuperaMayoria = false;
  let textoRequerido = '';

  if (tipoMayoria === 'simple') {
    if (tipoVotacion === 'substantive' && votosEmitidos > 0 && votosValidosSinAbstencion > 0) {
      requeridos = Math.floor(votosValidosSinAbstencion / 2) + 1;
      pasaSuperaMayoria = favor > contra && favor >= requeridos;
      textoRequerido = `${requeridos} voto(s) A Favor (50%+1 de ${votosValidosSinAbstencion} votos válidos emitidos | Base quórum: ${reqSimpleQuorum})`;
    } else {
      requeridos = reqSimpleQuorum;
      pasaSuperaMayoria = favor > contra && favor >= requeridos;
      textoRequerido = `${requeridos} voto(s) A Favor (50% + 1 de ${totalAsistentes} delegaciones en sala)`;
    }
  } else if (tipoMayoria === '2/3') {
    if (tipoVotacion === 'substantive' && votosEmitidos > 0 && votosValidosSinAbstencion > 0) {
      requeridos = Math.ceil((votosValidosSinAbstencion * 2) / 3);
      pasaSuperaMayoria = favor >= requeridos && favor > 0;
      textoRequerido = `${requeridos} voto(s) A Favor (2/3 de ${votosValidosSinAbstencion} votos válidos emitidos | Base quórum: ${reqDosTerciosQuorum})`;
    } else {
      requeridos = reqDosTerciosQuorum;
      pasaSuperaMayoria = favor >= requeridos && favor > 0;
      textoRequerido = `${requeridos} voto(s) A Favor (2/3 de ${totalAsistentes} delegaciones en sala)`;
    }
  } else if (tipoMayoria === 'consensus') {
    requeridos = 0; // 0 votos en contra
    pasaSuperaMayoria = contra === 0 && favor > 0 && votosPendientes === 0;
    textoRequerido = `0 votos En Contra (100% Consenso de ${totalAsistentes} delegaciones en sala)`;
  }

  // Dictamen de la Votación
  let estadoVotacion = 'SIN_VOTOS'; // 'SIN_VOTOS' | 'APROBADA' | 'REPROBADA' | 'VETADA' | 'EN_PROCESO'
  let mensajeDictamen = 'Sin votaciones registradas aún.';

  if (votosEmitidos === 0 && totalAsistentes === 0) {
    estadoVotacion = 'SIN_VOTOS';
    mensajeDictamen = 'Sin delegaciones registradas ni votaciones aún.';
  } else if (votosEmitidos === 0) {
    estadoVotacion = 'SIN_VOTOS';
    mensajeDictamen = `No se han registrado votos todavía. Requiere ${requeridos} voto(s) para aprobar. Inicia el Roll Call o vota manualmente.`;
  } else if (vetoEjercido) {
    estadoVotacion = 'VETADA';
    const nombresVeto = paisesConVetoEfectuado.map(p => p.nombre).join(', ');
    mensajeDictamen = `REPROBADA POR VETO 👑 (Veto ejercido por: ${nombresVeto})`;
  } else if (votosPendientes === 0 || (favor >= requeridos && tipoMayoria !== 'consensus')) {
    if (pasaSuperaMayoria) {
      estadoVotacion = 'APROBADA';
      mensajeDictamen = `¡APROBADA! (${favor} A Favor vs ${contra} En Contra${tipoVotacion === 'substantive' ? `, ${abstencion} Abstenciones` : ''})`;
    } else {
      estadoVotacion = 'REPROBADA';
      mensajeDictamen = `REPROBADA (${favor} A Favor vs ${contra} En Contra — Requiere: ${textoRequerido})`;
    }
  } else {
    estadoVotacion = 'EN_PROCESO';
    const votosFaltantes = Math.max(0, requeridos - favor);
    mensajeDictamen = `Votación en proceso... (${favor}/${requeridos} necesarios, faltan ${votosFaltantes} a favor)`;
  }

  // Lista de Países para la Ronda de Roll Call Actual
  const listaPaisesRondaRollCall = useMemo(() => {
    const todosOrdenados = [...paisesAsistentes].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    if (rondaRollCall === 1) {
      return todosOrdenados;
    } else {
      // Ronda 2: Únicamente países que pasaron en Ronda 1 y aún no han votado
      return todosOrdenados.filter(p => paisesPasados.includes(p.id) && !votos[p.id]);
    }
  }, [paisesAsistentes, rondaRollCall, paisesPasados, votos]);

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

  // Voto en Roll Call Nominal con avance de ronda
  const registrarYAvanzarRollCall = (voto) => {
    if (!paisActualRollCall) return;

    if (voto === 'pasar') {
      if (!paisesPasados.includes(paisActualRollCall.id)) {
        setPaisesPasados(prev => [...prev, paisActualRollCall.id]);
      }
    } else {
      registrarVotoPais(paisActualRollCall.id, voto);
    }

    // Avanzar dentro de la lista actual
    if (indiceRollCall < listaPaisesRondaRollCall.length - 1) {
      setIndiceRollCall(prev => prev + 1);
    } else {
      // Final de la ronda actual
      if (rondaRollCall === 1) {
        // Verificar si hay países que pasaron en Ronda 1
        const pasadosSinVoto = paisesAsistentes.filter(p => 
          (paisesPasados.includes(p.id) || (voto === 'pasar' && p.id === paisActualRollCall.id)) && !votos[p.id]
        );
        if (pasadosSinVoto.length > 0) {
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

  // Lista de Países procesada para vista principal
  const listaPaisesProcesada = useMemo(() => {
    let result = [...paises];

    if (busqueda.trim()) {
      result = result.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    }

    result.sort((a, b) => {
      if (criterioOrden === 'alphabetical_asc') return a.nombre.localeCompare(b.nombre, 'es');
      if (criterioOrden === 'alphabetical_desc') return b.nombre.localeCompare(a.nombre, 'es');
      if (criterioOrden === 'vote_status') {
        const orderMap = { favor: 1, contra: 2, abstencion: 3, undefined: 4 };
        return (orderMap[votos[a.id]] || 4) - (orderMap[votos[b.id]] || 4);
      }
      if (criterioOrden === 'p5_veto') {
        if (a.veto === b.veto) return a.nombre.localeCompare(b.nombre, 'es');
        return a.veto ? -1 : 1;
      }
      if (criterioOrden === 'roll_call') {
        const statusMap = { 'Presente y Votando': 1, 'Presente': 2, 'Ausente': 3 };
        return (statusMap[a.estatus] || 4) - (statusMap[b.estatus] || 4);
      }
      return 0;
    });

    return result;
  }, [paises, busqueda, criterioOrden, votos]);

  return (
    <div style={{
      padding: '1rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      backgroundColor: 'var(--panel-color)',
      color: 'var(--text-color)',
      gap: '0.75rem',
      fontSize: '0.85rem'
    }}>
      {/* ── Header: Asunto y Selectores de Configuración ── */}
      <div style={{
        backgroundColor: '#0a0a0d',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Vote size={18} color="#3b82f6" />
          <input
            type="text"
            value={asunto}
            onChange={e => configurarVotacion({ asunto: e.target.value })}
            placeholder="Asunto o Título del Proyecto de Resolución / Moción..."
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '1px dashed var(--border-color)',
              color: 'var(--text-color)',
              fontWeight: '700',
              fontSize: '0.95rem',
              outline: 'none',
              padding: '0.2rem 0'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Votación Procedimental vs Sustantiva */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: '#141417', padding: '3px', borderRadius: '6px', border: '1px solid var(--subborder-color)' }}>
            <button
              onClick={() => configurarVotacion({ tipoVotacion: 'procedural' })}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: tipoVotacion === 'procedural' ? '#3b82f6' : 'transparent',
                color: tipoVotacion === 'procedural' ? '#ffffff' : 'var(--muted-text)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Votación Procedimental: PROHIBIDA LA ABSTENCIÓN"
            >
              Procedimental (Sin Abstención)
            </button>
            <button
              onClick={() => configurarVotacion({ tipoVotacion: 'substantive' })}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: tipoVotacion === 'substantive' ? '#a855f7' : 'transparent',
                color: tipoVotacion === 'substantive' ? '#ffffff' : 'var(--muted-text)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Votación Sustantiva: PERMITIDA LA ABSTENCIÓN"
            >
              Sustantiva (Con Abstención)
            </button>
          </div>

          {/* Selector de Mayoría */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.73rem', opacity: 0.7, fontWeight: '600' }}>Mayoría:</span>
            <select
              value={tipoMayoria}
              onChange={e => configurarVotacion({ tipoMayoria: e.target.value })}
              style={{
                padding: '0.35rem 0.6rem',
                backgroundColor: '#141417',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '700',
                outline: 'none'
              }}
            >
              <option value="simple">
                Mayoría Simple (50% + 1) — Requiere {reqSimpleQuorum} {reqSimpleQuorum === 1 ? 'voto' : 'votos'}
              </option>
              <option value="2/3">
                Mayoría Calificada (2/3) — Requiere {reqDosTerciosQuorum} {reqDosTerciosQuorum === 1 ? 'voto' : 'votos'}
              </option>
              <option value="consensus">
                Consenso (100%) — Requiere 0 Votos En Contra
              </option>
            </select>
          </div>

          {/* Toggle Veto P5 */}
          <button
            onClick={() => configurarVotacion({ aplicarVeto: !aplicarVeto })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              border: `1px solid ${aplicarVeto ? '#eab308' : 'var(--border-color)'}`,
              backgroundColor: aplicarVeto ? 'rgba(234, 179, 8, 0.15)' : 'transparent',
              color: aplicarVeto ? '#eab308' : 'var(--muted-text)',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Activar/desactivar evaluación de Veto P5"
          >
            <Crown size={14} color={aplicarVeto ? '#eab308' : '#888888'} />
            <span>Veto P5: {aplicarVeto ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* ── PANEL DE QUÓRUM Y REQUISITOS DE CADA MAYORÍA EN TIEMPO REAL ── */}
      <div style={{
        backgroundColor: '#0c0d12',
        border: '1px solid #27273a',
        borderRadius: '8px',
        padding: '0.65rem 0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {/* Cabecera de Quórum en Sala */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Users size={15} color="#3b82f6" />
            <span style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#93c5fd' }}>
              Quórum y Mayorías Requeridas en Sala
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.73rem' }}>
            <span style={{ color: '#22c55e', fontWeight: '700' }}>
              ● {totalAsistentes} en sala ({presentes} Presentes + {presentesYVotando} Presentes y Votando)
            </span>
            <span style={{ color: '#71717a' }}>|</span>
            <span style={{ color: '#ef4444', fontWeight: '600' }}>
              {ausentes} Ausentes
            </span>
            <span style={{ color: '#71717a' }}>|</span>
            <span style={{ color: '#a1a1aa' }}>
              Total: {totalPaises} delegaciones
            </span>
          </div>
        </div>

        {/* Tarjetas Dinámicas de Mayoría */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.5rem'
        }}>
          {/* Card: Mayoría Simple */}
          <div 
            onClick={() => configurarVotacion({ tipoMayoria: 'simple' })}
            style={{
              backgroundColor: tipoMayoria === 'simple' ? 'rgba(59, 130, 246, 0.12)' : '#121218',
              border: `1.5px solid ${tipoMayoria === 'simple' ? '#3b82f6' : '#232330'}`,
              borderRadius: '7px',
              padding: '0.55rem 0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: tipoMayoria === 'simple' ? '#60a5fa' : '#9ca3af' }}>
                MAYORÍA SIMPLE (50% + 1)
              </span>
              {tipoMayoria === 'simple' && (
                <span style={{ fontSize: '0.6rem', backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '1px 5px', borderRadius: '3px', fontWeight: '800' }}>
                  ACTIVA
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#60a5fa' }}>
                {reqSimpleQuorum}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: '600' }}>
                {reqSimpleQuorum === 1 ? 'voto A Favor requerido' : 'votos A Favor requeridos'}
              </span>
            </div>

            <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '2px' }}>
              {favor >= reqSimpleQuorum && reqSimpleQuorum > 0 ? (
                <span style={{ color: '#4ade80', fontWeight: '700' }}>✓ Alcanzada actualmente ({favor} votos)</span>
              ) : (
                <span>Faltan {Math.max(0, reqSimpleQuorum - favor)} votos (Progreso: {favor}/{reqSimpleQuorum})</span>
              )}
            </div>
          </div>

          {/* Card: Mayoría Calificada 2/3 */}
          <div 
            onClick={() => configurarVotacion({ tipoMayoria: '2/3' })}
            style={{
              backgroundColor: tipoMayoria === '2/3' ? 'rgba(168, 85, 247, 0.12)' : '#121218',
              border: `1.5px solid ${tipoMayoria === '2/3' ? '#a855f7' : '#232330'}`,
              borderRadius: '7px',
              padding: '0.55rem 0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: tipoMayoria === '2/3' ? '#c084fc' : '#9ca3af' }}>
                CALIFICADA (2/3)
              </span>
              {tipoMayoria === '2/3' && (
                <span style={{ fontSize: '0.6rem', backgroundColor: '#581c87', color: '#e9d5ff', padding: '1px 5px', borderRadius: '3px', fontWeight: '800' }}>
                  ACTIVA
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#c084fc' }}>
                {reqDosTerciosQuorum}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: '600' }}>
                {reqDosTerciosQuorum === 1 ? 'voto A Favor requerido' : 'votos A Favor requeridos'}
              </span>
            </div>

            <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '2px' }}>
              {favor >= reqDosTerciosQuorum && reqDosTerciosQuorum > 0 ? (
                <span style={{ color: '#4ade80', fontWeight: '700' }}>✓ Alcanzada actualmente ({favor} votos)</span>
              ) : (
                <span>Faltan {Math.max(0, reqDosTerciosQuorum - favor)} votos (Progreso: {favor}/{reqDosTerciosQuorum})</span>
              )}
            </div>
          </div>

          {/* Card: Consenso */}
          <div 
            onClick={() => configurarVotacion({ tipoMayoria: 'consensus' })}
            style={{
              backgroundColor: tipoMayoria === 'consensus' ? 'rgba(234, 179, 8, 0.12)' : '#121218',
              border: `1.5px solid ${tipoMayoria === 'consensus' ? '#eab308' : '#232330'}`,
              borderRadius: '7px',
              padding: '0.55rem 0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: tipoMayoria === 'consensus' ? '#facc15' : '#9ca3af' }}>
                CONSENSO / UNANIMIDAD
              </span>
              {tipoMayoria === 'consensus' && (
                <span style={{ fontSize: '0.6rem', backgroundColor: '#713f12', color: '#fef08a', padding: '1px 5px', borderRadius: '3px', fontWeight: '800' }}>
                  ACTIVA
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#facc15' }}>
                0
              </span>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: '600' }}>
                votos En Contra (100% apoyo)
              </span>
            </div>

            <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '2px' }}>
              {contra > 0 ? (
                <span style={{ color: '#f87171', fontWeight: '700' }}>✕ Consenso roto ({contra} en contra)</span>
              ) : (
                <span style={{ color: favor > 0 ? '#4ade80' : '#a1a1aa' }}>
                  {favor > 0 ? `✓ Sin votos en contra (${favor} a favor)` : 'Sin votos emitidos'}
                </span>
              )}
            </div>
          </div>

          {/* Card: Mayoría Absoluta (Total Padrón) */}
          <div 
            style={{
              backgroundColor: '#121218',
              border: '1.5px solid #232330',
              borderRadius: '7px',
              padding: '0.55rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#9ca3af' }}>
                MAY. ABSOLUTA (PADRÓN)
              </span>
              <span style={{ fontSize: '0.6rem', color: '#71717a', fontWeight: '700' }}>
                {totalPaises} TOTAL
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#e2e8f0' }}>
                {reqAbsolutaTotal}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: '600' }}>
                votos (50% + 1 del total)
              </span>
            </div>

            <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '2px' }}>
              Progreso: {favor}/{reqAbsolutaTotal} sobre las {totalPaises} delegaciones
            </div>
          </div>
        </div>
      </div>

      {/* ── Banner de Estado del Dictamen ── */}
      <div style={{
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: estadoVotacion === 'APROBADA' ? 'rgba(34, 197, 94, 0.15)' :
                         estadoVotacion === 'VETADA' ? 'rgba(239, 68, 68, 0.25)' :
                         estadoVotacion === 'REPROBADA' ? 'rgba(239, 68, 68, 0.15)' :
                         estadoVotacion === 'SIN_VOTOS' ? 'rgba(113, 113, 122, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        border: `1px solid ${
          estadoVotacion === 'APROBADA' ? '#22c55e' :
          estadoVotacion === 'VETADA' ? '#ef4444' :
          estadoVotacion === 'REPROBADA' ? '#ef4444' :
          estadoVotacion === 'SIN_VOTOS' ? '#52525b' : '#3b82f6'
        }`,
        boxShadow: estadoVotacion === 'APROBADA' ? '0 0 15px rgba(34, 197, 94, 0.2)' :
                   estadoVotacion === 'VETADA' ? '0 0 20px rgba(239, 68, 68, 0.35)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {estadoVotacion === 'APROBADA' && <CheckCircle2 size={22} color="#22c55e" />}
          {estadoVotacion === 'VETADA' && <ShieldAlert size={22} color="#ef4444" />}
          {estadoVotacion === 'REPROBADA' && <XCircle size={22} color="#ef4444" />}
          {estadoVotacion === 'EN_PROCESO' && <Info size={22} color="#3b82f6" />}
          {estadoVotacion === 'SIN_VOTOS' && <HelpCircle size={22} color="#71717a" />}

          <div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>
              {mensajeDictamen}
            </div>
            <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '2px' }}>
              Modalidad: {tipoVotacion === 'procedural' ? 'Procedimental (Obligatorio Votar)' : 'Sustantiva'} | 
              Meta: <strong style={{ color: '#ffffff' }}>{textoRequerido}</strong> | 
              Votos Emitidos: {votosEmitidos}/{totalAsistentes}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={toggleModoRollCall}
            style={{
              padding: '0.35rem 0.65rem',
              backgroundColor: modoRollCall ? '#3b82f6' : 'transparent',
              border: '1px solid #3b82f6',
              color: modoRollCall ? '#ffffff' : '#3b82f6',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Play size={13} /> {modoRollCall ? 'Salir Roll Call' : 'Modo Roll Call'}
          </button>
          <button
            onClick={() => {
              resetearVotacion();
              setModoRollCall(false);
            }}
            style={{
              padding: '0.35rem 0.6rem',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
            title="Reiniciar todos los votos"
          >
            <RotateCcw size={13} /> Reiniciar
          </button>
        </div>
      </div>

      {/* ── Asistente Roll Call Nominal Interactivo (2 Rondas Oficiales) ── */}
      {modoRollCall && (
        <div style={{
          backgroundColor: '#0d0d14',
          border: `1px solid ${rondaRollCall === 2 ? '#eab308' : '#3b82f6'}`,
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          animation: 'fadeIn 0.2s ease',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          {/* Banner de Ronda */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f1f2e', paddingBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} color={rondaRollCall === 2 ? '#eab308' : '#3b82f6'} />
              <span style={{ fontWeight: '700', fontSize: '0.85rem', color: rondaRollCall === 2 ? '#facc15' : '#60a5fa' }}>
                {rondaRollCall === 1 ? 'PRIMERA RONDA - VOTACIÓN NOMINAL' : 'SEGUNDA RONDA - DELEGACIONES QUE PASARON'}
              </span>
            </div>
            <span style={{ fontSize: '0.73rem', opacity: 0.6 }}>
              {paisActualRollCall ? `Turno ${indiceRollCall + 1} de ${listaPaisesRondaRollCall.length}` : 'Ronda Completada'}
            </span>
          </div>

          {paisActualRollCall ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2.2rem' }}>{paisActualRollCall.bandera}</span>
                <div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {paisActualRollCall.estatus}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                    {paisActualRollCall.nombre} {paisActualRollCall.veto && '👑'}
                  </div>
                </div>
              </div>

              {/* Botones de Voto Roll Call */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={() => registrarYAvanzarRollCall('favor')}
                  style={{
                    padding: '0.55rem 0.9rem',
                    backgroundColor: '#22c55e',
                    color: '#000000',
                    fontWeight: '800',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  A Favor
                </button>

                {/* Abstención solo en Sustantiva y si NO es Presente y Votando y NO en Ronda 2 */}
                {tipoVotacion === 'substantive' && (
                  <button
                    onClick={() => registrarYAvanzarRollCall('abstencion')}
                    disabled={paisActualRollCall.estatus === 'Presente y Votando' || rondaRollCall === 2}
                    style={{
                      padding: '0.55rem 0.9rem',
                      backgroundColor: (paisActualRollCall.estatus === 'Presente y Votando' || rondaRollCall === 2) ? '#27272a' : '#eab308',
                      color: (paisActualRollCall.estatus === 'Presente y Votando' || rondaRollCall === 2) ? '#71717a' : '#000000',
                      fontWeight: '800',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: (paisActualRollCall.estatus === 'Presente y Votando' || rondaRollCall === 2) ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem'
                    }}
                    title={
                      rondaRollCall === 2 
                        ? 'En segunda ronda no se puede abstener' 
                        : (paisActualRollCall.estatus === 'Presente y Votando' ? 'P. y Votando no puede abstenerse' : 'Abstención')
                    }
                  >
                    Abstención
                  </button>
                )}

                <button
                  onClick={() => registrarYAvanzarRollCall('contra')}
                  style={{
                    padding: '0.55rem 0.9rem',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontWeight: '800',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  En Contra
                </button>

                {/* Botón Pasar / Omitir (Solo disponible en Ronda 1) */}
                {rondaRollCall === 1 && (
                  <button
                    onClick={() => registrarYAvanzarRollCall('pasar')}
                    style={{
                      padding: '0.55rem 0.8rem',
                      backgroundColor: '#3f3f46',
                      color: '#ffffff',
                      fontWeight: '700',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                    title="Pasar / Omitir para votar en Segunda Ronda"
                  >
                    Pasar
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', opacity: 0.7, padding: '0.5rem' }}>
              ¡Votación Nominal Roll Call finalizada! Todos los votos han sido registrados.
            </div>
          )}
        </div>
      )}

      {/* ── Contadores y Barra de Distribución ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        textAlign: 'center'
      }}>
        <div style={{ backgroundColor: '#061a0c', border: '1px solid #166534', borderRadius: '8px', padding: '0.6rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: '700' }}>A FAVOR</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#22c55e' }}>{favor}</div>
          <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>
            {totalAsistentes > 0 ? Math.round((favor / totalAsistentes) * 100) : 0}% del quórum
          </div>
        </div>

        <div style={{ backgroundColor: '#1c0808', border: '1px solid #991b1b', borderRadius: '8px', padding: '0.6rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: '700' }}>EN CONTRA</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ef4444' }}>{contra}</div>
          <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>
            {totalAsistentes > 0 ? Math.round((contra / totalAsistentes) * 100) : 0}% del quórum
          </div>
        </div>

        <div style={{ 
          backgroundColor: tipoVotacion === 'procedural' ? '#18181b' : '#1a1403', 
          border: `1px solid ${tipoVotacion === 'procedural' ? '#27272a' : '#854d0e'}`, 
          borderRadius: '8px', 
          padding: '0.6rem',
          opacity: tipoVotacion === 'procedural' ? 0.4 : 1
        }}>
          <div style={{ fontSize: '0.7rem', color: tipoVotacion === 'procedural' ? '#71717a' : '#facc15', fontWeight: '700' }}>
            ABSTENCIÓN {tipoVotacion === 'procedural' && '(N/A)'}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: tipoVotacion === 'procedural' ? '#71717a' : '#eab308' }}>
            {tipoVotacion === 'procedural' ? 0 : abstencion}
          </div>
          <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>
            {tipoVotacion === 'procedural' ? 'No permitida en procedimiento' : `${totalAsistentes > 0 ? Math.round((abstencion / totalAsistentes) * 100) : 0}% del quórum`}
          </div>
        </div>

        <div style={{ backgroundColor: '#0d0d12', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#a1a1aa', fontWeight: '700' }}>PENDIENTES</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#a1a1aa' }}>{votosPendientes}</div>
          <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>Sin emitir</div>
        </div>
      </div>

      <div style={{
        height: '10px',
        width: '100%',
        backgroundColor: '#18181b',
        borderRadius: '9999px',
        overflow: 'hidden',
        display: 'flex',
        border: '1px solid var(--subborder-color)'
      }}>
        {totalAsistentes > 0 && (
          <>
            <div style={{ width: `${(favor / totalAsistentes) * 100}%`, backgroundColor: '#22c55e', transition: 'width 0.3s ease' }} title={`A Favor: ${favor}`} />
            <div style={{ width: `${(contra / totalAsistentes) * 100}%`, backgroundColor: '#ef4444', transition: 'width 0.3s ease' }} title={`En Contra: ${contra}`} />
            {tipoVotacion === 'substantive' && (
              <div style={{ width: `${(abstencion / totalAsistentes) * 100}%`, backgroundColor: '#eab308', transition: 'width 0.3s ease' }} title={`Abstención: ${abstencion}`} />
            )}
          </>
        )}
      </div>

      {/* ── Buscador y Ordenamiento ── */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#0a0a0d',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '0.3rem 0.6rem',
          gap: '0.4rem'
        }}>
          <Search size={14} style={{ opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Buscar delegación por nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-color)',
              outline: 'none',
              fontSize: '0.8rem',
              width: '100%'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <ArrowUpDown size={14} style={{ opacity: 0.6 }} />
          <select
            value={criterioOrden}
            onChange={e => setCriterioOrden(e.target.value)}
            style={{
              padding: '0.35rem 0.5rem',
              backgroundColor: '#0a0a0d',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              outline: 'none'
            }}
          >
            <option value="alphabetical_asc">Orden Alfabético (A - Z)</option>
            <option value="alphabetical_desc">Orden Alfabético (Z - A)</option>
            <option value="vote_status">Por Estado de Voto Emitido</option>
            <option value="p5_veto">👑 Miembros Veto P5 Primero</option>
            <option value="roll_call">Por Estatus de Asistencia</option>
          </select>
        </div>
      </div>

      {/* ── Lista de Países con Botones de Voto Individual ── */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.35rem',
        paddingRight: '2px' 
      }}>
        {listaPaisesProcesada.map(p => {
          const votoActual = votos[p.id];
          const esAusente = p.estatus === 'Ausente';
          const esPresenteYVotando = p.estatus === 'Presente y Votando';

          // Reglas Oficiales MUN:
          // 1) En procedimental PROHIBIDA abstención para todos.
          // 2) En sustantiva, "Presente y Votando" NO puede abstenerse.
          const deshabilitarAbstencion = tipoVotacion === 'procedural' || esPresenteYVotando;

          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                backgroundColor: esAusente ? '#08080a' : (votoActual ? '#111116' : '#0d0d0f'),
                border: `1px solid ${
                  votoActual === 'favor' ? '#22c55e55' :
                  votoActual === 'contra' ? '#ef444455' :
                  votoActual === 'abstencion' ? '#eab30855' : 'var(--border-color)'
                }`,
                borderRadius: '6px',
                opacity: esAusente ? 0.4 : 1,
                transition: 'all 0.15s ease'
              }}
            >
              {/* Información de la Delegación */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: '1.2rem' }}>{p.bandera}</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{p.nombre}</span>
                    {p.veto && (
                      <span title="Miembro Permanente con Derecho a Veto (P5)">👑</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.3rem', marginTop: '1px' }}>
                    <span style={{
                      fontSize: '0.63rem',
                      fontWeight: '600',
                      color: esAusente ? '#ef4444' : (esPresenteYVotando ? '#60a5fa' : '#4ade80'),
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      padding: '0.05rem 0.35rem',
                      borderRadius: '3px'
                    }}>
                      {p.estatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Voto Individual */}
              {esAusente ? (
                <span style={{ fontSize: '0.72rem', color: '#ef4444', fontStyle: 'italic' }}>Ausente</span>
              ) : (
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  {/* Botón A FAVOR */}
                  <button
                    onClick={() => registrarVotoPais(p.id, votoActual === 'favor' ? null : 'favor')}
                    style={{
                      padding: '0.28rem 0.6rem',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      borderRadius: '4px',
                      border: '1px solid #166534',
                      backgroundColor: votoActual === 'favor' ? '#22c55e' : 'transparent',
                      color: votoActual === 'favor' ? '#000000' : '#4ade80',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    A Favor
                  </button>

                  {/* Botón ABSTENCIÓN (Solo en Sustantiva para Presentes) */}
                  {tipoVotacion === 'substantive' && (
                    <button
                      onClick={() => !deshabilitarAbstencion && registrarVotoPais(p.id, votoActual === 'abstencion' ? null : 'abstencion')}
                      disabled={deshabilitarAbstencion}
                      style={{
                        padding: '0.28rem 0.6rem',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        borderRadius: '4px',
                        border: `1px solid ${deshabilitarAbstencion ? '#27272a' : '#854d0e'}`,
                        backgroundColor: votoActual === 'abstencion' ? '#eab308' : 'transparent',
                        color: deshabilitarAbstencion ? '#52525b' : (votoActual === 'abstencion' ? '#000000' : '#facc15'),
                        cursor: deshabilitarAbstencion ? 'not-allowed' : 'pointer',
                        opacity: deshabilitarAbstencion ? 0.4 : 1,
                        transition: 'all 0.15s ease'
                      }}
                      title={esPresenteYVotando ? 'Delegación Presente y Votando no puede abstenerse' : 'Abstención'}
                    >
                      Abstención
                    </button>
                  )}

                  {/* Botón EN CONTRA */}
                  <button
                    onClick={() => registrarVotoPais(p.id, votoActual === 'contra' ? null : 'contra')}
                    style={{
                      padding: '0.28rem 0.6rem',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      borderRadius: '4px',
                      border: '1px solid #991b1b',
                      backgroundColor: votoActual === 'contra' ? '#ef4444' : 'transparent',
                      color: votoActual === 'contra' ? '#ffffff' : '#f87171',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    En Contra
                  </button>

                  {/* Limpiar voto */}
                  {votoActual && (
                    <button
                      onClick={() => registrarVotoPais(p.id, null)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--muted-text)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex'
                      }}
                      title="Limpiar voto"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VotacionOficial;
