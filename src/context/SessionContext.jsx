import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const SessionContext = createContext();

const PAISES_INICIALES = [];
const SESSION_SYNC_CHANNEL_NAME = 'openmun_session_sync';

export const SessionProvider = ({ children }) => {
  const tabInstanceId = useRef(`tab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`).current;
  const broadcastChannelRef = useRef(null);

  const [paises, setPaisesState] = useState(() => {
    const saved = localStorage.getItem('openmun_paises');
    return saved ? JSON.parse(saved) : PAISES_INICIALES;
  });

  const [oradoresCola, setOradoresColaState] = useState(() => {
    const saved = localStorage.getItem('openmun_oradores');
    return saved ? JSON.parse(saved) : [];
  });

  const [oradoresCaucus, setOradoresCaucusState] = useState(() => {
    const saved = localStorage.getItem('openmun_oradores_caucus');
    return saved ? JSON.parse(saved) : [];
  });

  const [registroIntervenciones, setRegistroIntervencionesState] = useState(() => {
    const saved = localStorage.getItem('openmun_intervenciones');
    return saved ? JSON.parse(saved) : [];
  });

  const [mociones, setMocionesState] = useState(() => {
    const saved = localStorage.getItem('openmun_mociones');
    return saved ? JSON.parse(saved) : [];
  });

  const [historicoMociones, setHistoricoMocionesState] = useState(() => {
    const saved = localStorage.getItem('openmun_historico_mociones');
    return saved ? JSON.parse(saved) : [];
  });

  const [caucusActivo, setCaucusActivoState] = useState(() => {
    const saved = localStorage.getItem('openmun_caucus');
    return saved ? JSON.parse(saved) : {
      activo: false,
      proponente: '',
      posicionProponente: 'Primero',
      tipo: 'Caucus Moderado',
      varianteConsulta: '',
      tema: '',
      tiempoTotal: 600,
      tiempoOrador: 45
    };
  });

  const [votacionSesion, setVotacionSesionState] = useState(() => {
    const saved = localStorage.getItem('openmun_votacion');
    return saved ? JSON.parse(saved) : {
      asunto: 'Proyecto de Resolución / Moción',
      tipoVotacion: 'procedural',
      tipoMayoria: 'simple',
      aplicarVeto: true,
      votos: {}
    };
  });

  const [agendaSesion, setAgendaSesionState] = useState(() => {
    const saved = localStorage.getItem('openmun_agenda');
    return saved ? JSON.parse(saved) : {
      establecida: false,
      temaActual: '',
      temasPropuestos: []
    };
  });

  const [nombreComite, setNombreComiteState] = useState(() => {
    return localStorage.getItem('openmun_comite') || '';
  });

  const [relojGSLState, setRelojGSLState] = useState({ segundosRestantes: 60, tiempoInicial: 60, corriendo: false });
  const [yieldEvento, setYieldEvento] = useState(null);

  // Mantener referencias actualizadas para lectura en callbacks
  const stateRef = useRef({
    paises,
    oradoresCola,
    oradoresCaucus,
    registroIntervenciones,
    mociones,
    historicoMociones,
    caucusActivo,
    votacionSesion,
    agendaSesion,
    nombreComite,
    relojGSLState
  });

  useEffect(() => {
    stateRef.current = {
      paises,
      oradoresCola,
      oradoresCaucus,
      registroIntervenciones,
      mociones,
      historicoMociones,
      caucusActivo,
      votacionSesion,
      agendaSesion,
      nombreComite,
      relojGSLState
    };
  }, [paises, oradoresCola, oradoresCaucus, registroIntervenciones, mociones, historicoMociones, caucusActivo, votacionSesion, agendaSesion, nombreComite, relojGSLState]);

  // PERSISTENCIA EN LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem('openmun_paises', JSON.stringify(paises));
    localStorage.setItem('openmun_oradores', JSON.stringify(oradoresCola));
    localStorage.setItem('openmun_oradores_caucus', JSON.stringify(oradoresCaucus));
    localStorage.setItem('openmun_intervenciones', JSON.stringify(registroIntervenciones));
    localStorage.setItem('openmun_mociones', JSON.stringify(mociones));
    localStorage.setItem('openmun_historico_mociones', JSON.stringify(historicoMociones));
    localStorage.setItem('openmun_caucus', JSON.stringify(caucusActivo));
    localStorage.setItem('openmun_votacion', JSON.stringify(votacionSesion));
    localStorage.setItem('openmun_agenda', JSON.stringify(agendaSesion));
    localStorage.setItem('openmun_comite', nombreComite);

    const sesionDataCompleta = {
      version: '1.0',
      ultimaActualizacion: new Date().toISOString(),
      comision: nombreComite || 'Asamblea General - openMUN',
      paises,
      oradoresCola,
      oradoresCaucus,
      registroIntervenciones,
      mociones,
      historicoMociones,
      caucusActivo,
      votacionSesion,
      agendaSesion
    };

    localStorage.setItem('sesion_activa.json', JSON.stringify(sesionDataCompleta, null, 2));
  }, [paises, oradoresCola, oradoresCaucus, registroIntervenciones, mociones, historicoMociones, caucusActivo, votacionSesion, agendaSesion, nombreComite]);

  // EMITIR ACCIONES A CANALES LOCALES Y EVENTOS DOM PARA P2P
  const emitirAccion = useCallback((accion, payload) => {
    // 1. Canal local BroadcastChannel (sincroniza entre pestañas del mismo navegador)
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'SESSION_ACTION',
          accion,
          payload,
          senderTab: tabInstanceId,
          timestamp: Date.now()
        });
      } catch (err) {
        console.warn('Error publicando en BroadcastChannel:', err);
      }
    }

    // 2. Disparar evento DOM para que P2PContext lo transmita al Host remoto si somos cliente
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openmun_session_action', {
        detail: { action: accion, payload, timestamp: Date.now() }
      }));
    }
  }, [tabInstanceId]);

  // APLICAR ESTADO REMOTO COMPLETO
  const aplicarEstadoExterno = useCallback((nuevoEstado) => {
    if (!nuevoEstado || typeof nuevoEstado !== 'object') return;

    if (Array.isArray(nuevoEstado.paises)) {
      setPaisesState(nuevoEstado.paises);
    }
    if (Array.isArray(nuevoEstado.oradoresCola)) {
      setOradoresColaState(nuevoEstado.oradoresCola);
    }
    if (Array.isArray(nuevoEstado.oradoresCaucus)) {
      setOradoresCaucusState(nuevoEstado.oradoresCaucus);
    }
    if (Array.isArray(nuevoEstado.registroIntervenciones)) {
      setRegistroIntervencionesState(nuevoEstado.registroIntervenciones);
    }
    if (Array.isArray(nuevoEstado.mociones)) {
      setMocionesState(nuevoEstado.mociones);
    }
    if (Array.isArray(nuevoEstado.historicoMociones)) {
      setHistoricoMocionesState(nuevoEstado.historicoMociones);
    }
    if (nuevoEstado.caucusActivo && typeof nuevoEstado.caucusActivo === 'object') {
      setCaucusActivoState(nuevoEstado.caucusActivo);
    }
    if (nuevoEstado.votacionSesion && typeof nuevoEstado.votacionSesion === 'object') {
      setVotacionSesionState(nuevoEstado.votacionSesion);
    }
    if (nuevoEstado.agendaSesion && typeof nuevoEstado.agendaSesion === 'object') {
      setAgendaSesionState(nuevoEstado.agendaSesion);
    }
    if (typeof nuevoEstado.nombreComite === 'string' && nuevoEstado.nombreComite) {
      setNombreComiteState(nuevoEstado.nombreComite);
    } else if (typeof nuevoEstado.comision === 'string' && nuevoEstado.comision) {
      setNombreComiteState(nuevoEstado.comision);
    }
    if (nuevoEstado.relojGSLState && typeof nuevoEstado.relojGSLState === 'object') {
      setRelojGSLState(nuevoEstado.relojGSLState);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // FUNCIONES DE MUTACIÓN DE ESTADO
  // ─────────────────────────────────────────────────────────────

  // Votación
  const registrarVotoPais = useCallback((countryIdentifier, voto, emitir = true) => {
    setVotacionSesionState(prev => {
      const currentPaises = stateRef.current.paises || [];
      const paisObj = currentPaises.find(
        p => p.id === countryIdentifier ||
             p.nombre?.toLowerCase() === String(countryIdentifier).toLowerCase()
      );
      const targetId = paisObj ? paisObj.id : countryIdentifier;

      const copyVotos = { ...prev.votos };
      if (voto === null || voto === undefined) {
        delete copyVotos[targetId];
      } else {
        copyVotos[targetId] = voto;
      }
      return { ...prev, votos: copyVotos };
    });

    if (emitir) {
      emitirAccion('registrarVotoPais', { countryIdentifier, voto });
    }
  }, [emitirAccion]);

  const configurarVotacion = useCallback((ajustes, emitir = true) => {
    setVotacionSesionState(prev => ({
      ...prev,
      ...ajustes
    }));
    if (emitir) {
      emitirAccion('configurarVotacion', { ajustes });
    }
  }, [emitirAccion]);

  const resetearVotacion = useCallback((emitir = true) => {
    setVotacionSesionState(prev => ({
      ...prev,
      votos: {}
    }));
    if (emitir) {
      emitirAccion('resetearVotacion', {});
    }
  }, [emitirAccion]);

  // Países / Matriz
  const setPaises = useCallback((nuevosPaises, emitir = true) => {
    setPaisesState(nuevosPaises);
    if (emitir) {
      emitirAccion('setPaises', { paises: nuevosPaises });
    }
  }, [emitirAccion]);

  const cambiarEstatusPais = useCallback((id, nuevoEstatus, emitir = true) => {
    setPaisesState(prev => prev.map(p => p.id === id ? { ...p, estatus: nuevoEstatus } : p));
    if (emitir) {
      emitirAccion('cambiarEstatusPais', { id, nuevoEstatus });
    }
  }, [emitirAccion]);

  const actualizarPais = useCallback((id, nuevosCampos, emitir = true) => {
    setPaisesState(prev => prev.map(p => p.id === id ? { ...p, ...nuevosCampos } : p));
    if (emitir) {
      emitirAccion('actualizarPais', { id, nuevosCampos });
    }
  }, [emitirAccion]);

  const eliminarPais = useCallback((id, emitir = true) => {
    setPaisesState(prev => prev.filter(p => p.id !== id));
    if (emitir) {
      emitirAccion('eliminarPais', { id });
    }
  }, [emitirAccion]);

  const resetearAsistencia = useCallback((emitir = true) => {
    setPaisesState(prev => prev.map(p => ({ ...p, estatus: 'Ausente' })));
    if (emitir) {
      emitirAccion('resetearAsistencia', {});
    }
  }, [emitirAccion]);

  const toggleVetoPais = useCallback((id, emitir = true) => {
    setPaisesState(prev => prev.map(p => p.id === id ? { ...p, veto: !p.veto } : p));
    if (emitir) {
      emitirAccion('toggleVetoPais', { id });
    }
  }, [emitirAccion]);

  const ordenarPaisesAlfabetico = useCallback((emitir = true) => {
    setPaisesState(prev => [...prev].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })));
    if (emitir) {
      emitirAccion('ordenarPaisesAlfabetico', {});
    }
  }, [emitirAccion]);

  const reordenarPaises = useCallback((fromIndex, toIndex, emitir = true) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setPaisesState(prev => {
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const clone = [...prev];
      const [moved] = clone.splice(fromIndex, 1);
      clone.splice(toIndex, 0, moved);
      return clone;
    });
    if (emitir) {
      emitirAccion('reordenarPaises', { fromIndex, toIndex });
    }
  }, [emitirAccion]);

  // Oradores GSL
  const agregarOrador = useCallback((paisObj, emitir = true) => {
    if (!paisObj || !paisObj.nombre) return;
    setOradoresColaState(prev => {
      if (prev.some(o => o.nombre.toLowerCase() === paisObj.nombre.toLowerCase())) return prev;
      return [...prev, { id: Date.now().toString(), nombre: paisObj.nombre, bandera: paisObj.bandera || '🇺🇳' }];
    });
    if (emitir) {
      emitirAccion('agregarOrador', { paisObj });
    }
  }, [emitirAccion]);

  const removerOrador = useCallback((id, emitir = true) => {
    setOradoresColaState(prev => prev.filter(o => o.id !== id && o.nombre !== id));
    if (emitir) {
      emitirAccion('removerOrador', { id });
    }
  }, [emitirAccion]);

  const moverOrador = useCallback((index, direccion, emitir = true) => {
    const newIndex = index + direccion;
    setOradoresColaState(prev => {
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const clone = [...prev];
      const [moved] = clone.splice(index, 1);
      clone.splice(newIndex, 0, moved);
      return clone;
    });
    if (emitir) {
      emitirAccion('moverOrador', { index, direccion });
    }
  }, [emitirAccion]);

  const vaciarOradoresGSL = useCallback((emitir = true) => {
    setOradoresColaState([]);
    if (emitir) {
      emitirAccion('vaciarOradoresGSL', {});
    }
  }, [emitirAccion]);

  const ordenarOradoresGSLAlfabetico = useCallback((emitir = true) => {
    setOradoresColaState(prev => [...prev].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })));
    if (emitir) {
      emitirAccion('ordenarOradoresGSLAlfabetico', {});
    }
  }, [emitirAccion]);

  const reordenarOradoresGSL = useCallback((fromIndex, toIndex, emitir = true) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setOradoresColaState(prev => {
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const clone = [...prev];
      const [moved] = clone.splice(fromIndex, 1);
      clone.splice(toIndex, 0, moved);
      return clone;
    });
    if (emitir) {
      emitirAccion('reordenarOradoresGSL', { fromIndex, toIndex });
    }
  }, [emitirAccion]);

  // Registro de Intervención
  const registrarIntervencion = useCallback((oradorNombre, tiempoAsignado, tiempoHablado, overtime, emitir = true) => {
    const nuevaEntrada = {
      id: Date.now(),
      pais: oradorNombre || 'Delegado',
      tiempoAsignado,
      tiempoHablado,
      overtime,
      fecha: new Date().toISOString()
    };
    setRegistroIntervencionesState(prev => [nuevaEntrada, ...prev]);
    if (emitir) {
      emitirAccion('registrarIntervencion', { oradorNombre, tiempoAsignado, tiempoHablado, overtime });
    }
  }, [emitirAccion]);

  // Reloj y Yield
  const actualizarRelojGSL = useCallback((segundosRestantes, tiempoInicial, corriendo, emitir = false) => {
    setRelojGSLState({ segundosRestantes, tiempoInicial, corriendo });
    if (emitir) {
      emitirAccion('actualizarRelojGSL', { segundosRestantes, tiempoInicial, corriendo });
    }
  }, [emitirAccion]);

  const cederTiempo = useCallback((tipo, destinoPaisName = '', emitir = true) => {
    const cola = stateRef.current.oradoresCola || [];
    if (cola.length === 0) return;

    const oradorActual = cola[0];
    const { segundosRestantes, tiempoInicial } = stateRef.current.relojGSLState;

    if (tipo === 'mesa') {
      const tiempoHablado = Math.max(1, tiempoInicial - segundosRestantes);
      const overtime = segundosRestantes < 0 ? Math.abs(segundosRestantes) : 0;
      registrarIntervencion(oradorActual.nombre, tiempoInicial, tiempoHablado, overtime, false);

      setOradoresColaState(prev => prev.slice(1));
      setYieldEvento({ tipo: 'mesa', timestamp: Date.now() });
    } else if (tipo === 'preguntas') {
      setYieldEvento({ tipo: 'preguntas', timestamp: Date.now() });
    } else if (tipo === 'delegado' && destinoPaisName) {
      const tiempoHablado = Math.max(1, tiempoInicial - segundosRestantes);
      registrarIntervencion(oradorActual.nombre, tiempoInicial, tiempoHablado, 0, false);

      const allPaises = stateRef.current.paises || [];
      const paisObj = allPaises.find(p => p.nombre === destinoPaisName) || { nombre: destinoPaisName, bandera: '🇺🇳' };
      const nuevoOradorCedido = {
        id: Date.now().toString(),
        nombre: paisObj.nombre,
        bandera: paisObj.bandera || '🇺🇳'
      };

      setOradoresColaState(prev => [
        nuevoOradorCedido,
        ...prev.slice(1).filter(o => o.nombre !== paisObj.nombre)
      ]);

      setYieldEvento({
        tipo: 'delegado',
        destino: destinoPaisName,
        segundosRestantes,
        timestamp: Date.now()
      });
    }

    if (emitir) {
      emitirAccion('cederTiempo', { tipo, destinoPaisName });
    }
  }, [emitirAccion, registrarIntervencion]);

  // Oradores Caucus / Debate
  const agregarOradorCaucus = useCallback((paisObj, emitir = true) => {
    if (!paisObj || !paisObj.nombre) return;
    setOradoresCaucusState(prev => {
      if (prev.some(o => o.nombre.toLowerCase() === paisObj.nombre.toLowerCase())) return prev;

      const nuevoOrador = {
        id: Date.now().toString(),
        nombre: paisObj.nombre,
        bandera: paisObj.bandera || '🇺🇳',
        esProponenteUltimo: false
      };

      if (prev.length > 0 && prev[prev.length - 1].esProponenteUltimo) {
        const clone = [...prev];
        clone.splice(clone.length - 1, 0, nuevoOrador);
        return clone;
      }
      return [...prev, nuevoOrador];
    });

    if (emitir) {
      emitirAccion('agregarOradorCaucus', { paisObj });
    }
  }, [emitirAccion]);

  const removerOradorCaucus = useCallback((id, emitir = true) => {
    setOradoresCaucusState(prev => prev.filter(o => o.id !== id && o.nombre !== id));
    if (emitir) {
      emitirAccion('removerOradorCaucus', { id });
    }
  }, [emitirAccion]);

  const avanzarOradorCaucus = useCallback((emitir = true) => {
    setOradoresCaucusState(prev => prev.slice(1));
    if (emitir) {
      emitirAccion('avanzarOradorCaucus', {});
    }
  }, [emitirAccion]);

  const vaciarOradoresDebate = useCallback((emitir = true) => {
    setOradoresCaucusState([]);
    if (emitir) {
      emitirAccion('vaciarOradoresDebate', {});
    }
  }, [emitirAccion]);

  const ordenarOradoresDebateAlfabetico = useCallback((emitir = true) => {
    setOradoresCaucusState(prev => [...prev].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })));
    if (emitir) {
      emitirAccion('ordenarOradoresDebateAlfabetico', {});
    }
  }, [emitirAccion]);

  const reordenarOradoresDebate = useCallback((fromIndex, toIndex, emitir = true) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setOradoresCaucusState(prev => {
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const clone = [...prev];
      const [moved] = clone.splice(fromIndex, 1);
      clone.splice(toIndex, 0, moved);
      return clone;
    });
    if (emitir) {
      emitirAccion('reordenarOradoresDebate', { fromIndex, toIndex });
    }
  }, [emitirAccion]);

  const moverOradorCaucus = useCallback((index, direccion, emitir = true) => {
    const newIndex = index + direccion;
    setOradoresCaucusState(prev => {
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const clone = [...prev];
      const [moved] = clone.splice(index, 1);
      clone.splice(newIndex, 0, moved);
      return clone;
    });
    if (emitir) {
      emitirAccion('moverOradorCaucus', { index, direccion });
    }
  }, [emitirAccion]);

  const setCaucusActivo = useCallback((nuevoCaucus, emitir = true) => {
    setCaucusActivoState(nuevoCaucus);
    if (emitir) {
      emitirAccion('setCaucusActivo', { caucus: nuevoCaucus });
    }
  }, [emitirAccion]);

  // Agenda & Comité
  const establecerAgenda = useCallback((temaActual, temasPropuestos = [], emitir = true) => {
    setAgendaSesionState({
      establecida: true,
      temaActual,
      temasPropuestos: temasPropuestos.length > 0 ? temasPropuestos : [
        { id: 't1', titulo: temaActual, estado: 'En Discusión' }
      ]
    });
    if (emitir) {
      emitirAccion('establecerAgenda', { temaActual, temasPropuestos });
    }
  }, [emitirAccion]);

  const cambiarTemaActual = useCallback((nuevoTema, emitir = true) => {
    setAgendaSesionState(prev => ({
      ...prev,
      temaActual: nuevoTema,
      temasPropuestos: (prev.temasPropuestos || []).map(t =>
        t.titulo === nuevoTema ? { ...t, estado: 'En Discusión' } : { ...t, estado: 'Pendiente' }
      )
    }));
    if (emitir) {
      emitirAccion('cambiarTemaActual', { nuevoTema });
    }
  }, [emitirAccion]);

  const setNombreComite = useCallback((nuevoNombre, emitir = true) => {
    setNombreComiteState(nuevoNombre);
    if (emitir) {
      emitirAccion('setNombreComite', { nombreComite: nuevoNombre });
    }
  }, [emitirAccion]);

  // Mociones
  const compararMocionesDisruptividad = useCallback((a, b) => {
    const getPrioridadTipo = (tipoStr = '') => {
      if (tipoStr.includes('Caucus No Moderado')) return 1;
      if (tipoStr.includes('Consulta General')) return 2;
      if (tipoStr.includes('Tour de Table')) return 3;
      if (tipoStr.includes('Caucus Moderado')) return 4;
      return 5;
    };

    const prioA = getPrioridadTipo(a.tipo);
    const prioB = getPrioridadTipo(b.tipo);

    if (prioA !== prioB) return prioA - prioB;

    const durA = a.tiempoTotal || 0;
    const durB = b.tiempoTotal || 0;
    if (durA !== durB) return durB - durA;

    const tA = Number(a.id) || 0;
    const tB = Number(b.id) || 0;
    return tA - tB;
  }, []);

  const ordenarMocionesDisruptividad = useCallback((emitir = true) => {
    setMocionesState(prev => [...prev].sort(compararMocionesDisruptividad));
    if (emitir) {
      emitirAccion('ordenarMocionesDisruptividad', {});
    }
  }, [compararMocionesDisruptividad, emitirAccion]);

  const reordenarMociones = useCallback((fromIndex, toIndex, emitir = true) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setMocionesState(prev => {
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const clone = [...prev];
      const [moved] = clone.splice(fromIndex, 1);
      clone.splice(toIndex, 0, moved);
      return clone;
    });
    if (emitir) {
      emitirAccion('reordenarMociones', { fromIndex, toIndex });
    }
  }, [emitirAccion]);

  const agregarMocion = useCallback((mocionData, emitir = true) => {
    const nueva = {
      id: Date.now().toString(),
      posicionProponente: mocionData.posicionProponente || 'Primero',
      varianteConsulta: mocionData.varianteConsulta || '',
      ...mocionData,
      estado: 'Pendiente',
      votosFavor: 0,
      votosContra: 0,
      fecha: mocionData.fecha || new Date().toISOString()
    };
    setMocionesState(prev => [...prev, nueva].sort(compararMocionesDisruptividad));
    setHistoricoMocionesState(prev => [nueva, ...prev]);
    if (emitir) {
      emitirAccion('agregarMocion', { mocionData });
    }
  }, [compararMocionesDisruptividad, emitirAccion]);

  const activarMocion = useCallback((mocion, emitir = true) => {
    const tipoMocion = mocion.tipo;
    const posProponente = mocion.posicionProponente || 'Primero';
    const allPaises = stateRef.current.paises || [];

    if (tipoMocion === 'Tour de Table') {
      const presentes = allPaises
        .filter(p => p.estatus !== 'Ausente')
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
        .map((p, idx) => ({ id: `tt-${idx}-${Date.now()}`, nombre: p.nombre, bandera: p.bandera }));

      setOradoresCaucusState(presentes);
    } else if (tipoMocion === 'Caucus Moderado') {
      const proponenteObj = allPaises.find(p => p.nombre === mocion.proponente);
      if (proponenteObj) {
        const itemProponente = {
          id: `cauc-prop-${Date.now()}`,
          nombre: proponenteObj.nombre,
          bandera: proponenteObj.bandera,
          esProponenteUltimo: posProponente === 'Ultimo'
        };
        setOradoresCaucusState([itemProponente]);
      } else {
        setOradoresCaucusState([]);
      }
    } else {
      setOradoresCaucusState([]);
    }

    setHistoricoMocionesState(prev => prev.map(m => (m.id === mocion.id || m.tema === mocion.tema) ? { ...m, estado: 'Aprobada' } : m));
    setMocionesState(prev => prev.filter(m => m.id !== mocion.id));

    setCaucusActivoState({
      activo: true,
      proponente: mocion.proponente,
      posicionProponente: posProponente,
      tipo: tipoMocion,
      varianteConsulta: mocion.varianteConsulta || '',
      tema: mocion.tema,
      tiempoTotal: Number(mocion.tiempoTotal) || 0,
      tiempoOrador: Number(mocion.tiempoOrador) || 0,
      timestampActivacion: Date.now()
    });

    if (emitir) {
      emitirAccion('activarMocion', { mocion });
    }
  }, [emitirAccion]);

  const votarMocion = useCallback((id, nuevoEstado, emitir = true) => {
    if (nuevoEstado === 'Fallida') {
      setMocionesState(prev => prev.filter(m => m.id !== id));
      setHistoricoMocionesState(prev => prev.map(m => m.id === id ? { ...m, estado: 'Fallida' } : m));
    } else if (nuevoEstado === 'Aprobada') {
      const mocionTarget = (stateRef.current.mociones || []).find(m => m.id === id);
      setHistoricoMocionesState(prev => prev.map(m => m.id === id ? { ...m, estado: 'Aprobada' } : m));
      setMocionesState(prev => prev.filter(m => m.id !== id));
      if (mocionTarget) {
        activarMocion(mocionTarget, false);
      }
    }
    if (emitir) {
      emitirAccion('votarMocion', { id, nuevoEstado });
    }
  }, [activarMocion, emitirAccion]);

  const eliminarMocion = useCallback((id, emitir = true) => {
    setMocionesState(prev => prev.filter(m => m.id !== id));
    if (emitir) {
      emitirAccion('eliminarMocion', { id });
    }
  }, [emitirAccion]);

  // ─────────────────────────────────────────────────────────────
  // DESPACHADOR CENTRAL DE ACCIONES RECIBIDAS (DESDE OTRO NODO / CANAL)
  // ─────────────────────────────────────────────────────────────
  const ejecutarAccion = useCallback((accion, payload) => {
    if (!accion) return;

    switch (accion) {
      case 'registrarVotoPais':
        registrarVotoPais(payload.countryIdentifier, payload.voto, false);
        break;
      case 'configurarVotacion':
        configurarVotacion(payload.ajustes, false);
        break;
      case 'resetearVotacion':
        resetearVotacion(false);
        break;
      case 'setPaises':
        setPaises(payload.paises, false);
        break;
      case 'cambiarEstatusPais':
        cambiarEstatusPais(payload.id, payload.nuevoEstatus, false);
        break;
      case 'actualizarPais':
        actualizarPais(payload.id, payload.nuevosCampos, false);
        break;
      case 'eliminarPais':
        eliminarPais(payload.id, false);
        break;
      case 'resetearAsistencia':
        resetearAsistencia(false);
        break;
      case 'toggleVetoPais':
        toggleVetoPais(payload.id, false);
        break;
      case 'ordenarPaisesAlfabetico':
        ordenarPaisesAlfabetico(false);
        break;
      case 'reordenarPaises':
        reordenarPaises(payload.fromIndex, payload.toIndex, false);
        break;
      case 'agregarOrador':
        agregarOrador(payload.paisObj, false);
        break;
      case 'removerOrador':
        removerOrador(payload.id, false);
        break;
      case 'moverOrador':
        moverOrador(payload.index, payload.direccion, false);
        break;
      case 'vaciarOradoresGSL':
        vaciarOradoresGSL(false);
        break;
      case 'ordenarOradoresGSLAlfabetico':
        ordenarOradoresGSLAlfabetico(false);
        break;
      case 'reordenarOradoresGSL':
        reordenarOradoresGSL(payload.fromIndex, payload.toIndex, false);
        break;
      case 'cederTiempo':
        cederTiempo(payload.tipo, payload.destinoPaisName, false);
        break;
      case 'agregarOradorCaucus':
        agregarOradorCaucus(payload.paisObj, false);
        break;
      case 'removerOradorCaucus':
        removerOradorCaucus(payload.id, false);
        break;
      case 'avanzarOradorCaucus':
        avanzarOradorCaucus(false);
        break;
      case 'vaciarOradoresDebate':
        vaciarOradoresDebate(false);
        break;
      case 'ordenarOradoresDebateAlfabetico':
        ordenarOradoresDebateAlfabetico(false);
        break;
      case 'reordenarOradoresDebate':
        reordenarOradoresDebate(payload.fromIndex, payload.toIndex, false);
        break;
      case 'moverOradorCaucus':
        moverOradorCaucus(payload.index, payload.direccion, false);
        break;
      case 'setCaucusActivo':
        setCaucusActivo(payload.caucus, false);
        break;
      case 'establecerAgenda':
        establecerAgenda(payload.temaActual, payload.temasPropuestos, false);
        break;
      case 'cambiarTemaActual':
        cambiarTemaActual(payload.nuevoTema, false);
        break;
      case 'setNombreComite':
        setNombreComite(payload.nombreComite, false);
        break;
      case 'agregarMocion':
        agregarMocion(payload.mocionData, false);
        break;
      case 'activarMocion':
        activarMocion(payload.mocion, false);
        break;
      case 'votarMocion':
        votarMocion(payload.id, payload.nuevoEstado, false);
        break;
      case 'eliminarMocion':
        eliminarMocion(payload.id, false);
        break;
      case 'reordenarMociones':
        reordenarMociones(payload.fromIndex, payload.toIndex, false);
        break;
      case 'ordenarMocionesDisruptividad':
        ordenarMocionesDisruptividad(false);
        break;
      case 'registrarIntervencion':
        registrarIntervencion(payload.oradorNombre, payload.tiempoAsignado, payload.tiempoHablado, payload.overtime, false);
        break;
      case 'actualizarRelojGSL':
        actualizarRelojGSL(payload.segundosRestantes, payload.tiempoInicial, payload.corriendo, false);
        break;
      default:
        console.warn(`Acción desconocida en SessionContext: ${accion}`);
    }
  }, [
    registrarVotoPais, configurarVotacion, resetearVotacion, setPaises, cambiarEstatusPais, actualizarPais,
    eliminarPais, resetearAsistencia, toggleVetoPais, ordenarPaisesAlfabetico, reordenarPaises,
    agregarOrador, removerOrador, moverOrador, vaciarOradoresGSL, ordenarOradoresGSLAlfabetico,
    reordenarOradoresGSL, cederTiempo, agregarOradorCaucus, removerOradorCaucus, avanzarOradorCaucus,
    vaciarOradoresDebate, ordenarOradoresDebateAlfabetico, reordenarOradoresDebate, moverOradorCaucus,
    setCaucusActivo, establecerAgenda, cambiarTemaActual, setNombreComite, agregarMocion, activarMocion,
    votarMocion, eliminarMocion, reordenarMociones, ordenarMocionesDisruptividad, registrarIntervencion,
    actualizarRelojGSL
  ]);

  // ─────────────────────────────────────────────────────────────
  // INICIALIZACIÓN DE BROADCASTCHANNEL Y LISTENERS MULTIVENTANA
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(SESSION_SYNC_CHANNEL_NAME);
        broadcastChannelRef.current = bc;

        bc.onmessage = (event) => {
          const data = event.data;
          if (!data || data.senderTab === tabInstanceId) return;

          if (data.type === 'SESSION_ACTION') {
            ejecutarAccion(data.accion, data.payload);
          } else if (data.type === 'SESSION_SYNC') {
            aplicarEstadoExterno(data.state);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel local no disponible:', err);
      }
    }

    // Escuchar eventos storage de otras pestañas
    const handleStorage = (e) => {
      if (!e.key || !e.newValue) return;
      try {
        if (e.key === 'openmun_paises') setPaisesState(JSON.parse(e.newValue));
        if (e.key === 'openmun_oradores') setOradoresColaState(JSON.parse(e.newValue));
        if (e.key === 'openmun_oradores_caucus') setOradoresCaucusState(JSON.parse(e.newValue));
        if (e.key === 'openmun_intervenciones') setRegistroIntervencionesState(JSON.parse(e.newValue));
        if (e.key === 'openmun_mociones') setMocionesState(JSON.parse(e.newValue));
        if (e.key === 'openmun_historico_mociones') setHistoricoMocionesState(JSON.parse(e.newValue));
        if (e.key === 'openmun_caucus') setCaucusActivoState(JSON.parse(e.newValue));
        if (e.key === 'openmun_votacion') setVotacionSesionState(JSON.parse(e.newValue));
        if (e.key === 'openmun_agenda') setAgendaSesionState(JSON.parse(e.newValue));
        if (e.key === 'openmun_comite') setNombreComiteState(e.newValue);
      } catch (err) {
        console.error('Error rehidratando desde storage event:', err);
      }
    };

    // Escuchar eventos DOM de sincronización externa
    const handleExternalSync = (e) => {
      if (e.detail) {
        aplicarEstadoExterno(e.detail);
      }
    };

    const handleExternalAction = (e) => {
      if (e.detail?.action) {
        ejecutarAccion(e.detail.action, e.detail.payload);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('openmun_session_sync_external', handleExternalSync);
    window.addEventListener('openmun_execute_action_external', handleExternalAction);

    return () => {
      if (broadcastChannelRef.current) {
        try { broadcastChannelRef.current.close(); } catch (e) { }
        broadcastChannelRef.current = null;
      }
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('openmun_session_sync_external', handleExternalSync);
      window.removeEventListener('openmun_execute_action_external', handleExternalAction);
    };
  }, [ejecutarAccion, aplicarEstadoExterno, tabInstanceId]);

  // 1. EXPORTAR sesion_activa.json
  const descargarSesionJSON = () => {
    try {
      const localStorageSnapshot = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const rawVal = localStorage.getItem(key);
          try {
            localStorageSnapshot[key] = JSON.parse(rawVal);
          } catch {
            localStorageSnapshot[key] = rawVal;
          }
        }
      }

      localStorageSnapshot['openmun_paises'] = paises;
      localStorageSnapshot['openmun_oradores'] = oradoresCola;
      localStorageSnapshot['openmun_oradores_caucus'] = oradoresCaucus;
      localStorageSnapshot['openmun_intervenciones'] = registroIntervenciones;
      localStorageSnapshot['openmun_mociones'] = mociones;
      localStorageSnapshot['openmun_historico_mociones'] = historicoMociones;
      localStorageSnapshot['openmun_caucus'] = caucusActivo;
      localStorageSnapshot['openmun_votacion'] = votacionSesion;
      localStorageSnapshot['openmun_agenda'] = agendaSesion;
      localStorageSnapshot['openmun_comite'] = nombreComite;

      // Recuperar alertas y eventos de crisis
      let crisisEventosExport = [];
      let crisisRelojExport = null;
      try {
        const savedEventos = localStorage.getItem('openmun_crisis_eventos');
        if (savedEventos) crisisEventosExport = JSON.parse(savedEventos);
      } catch (e) {}
      try {
        const savedReloj = localStorage.getItem('openmun_crisis_reloj');
        if (savedReloj) crisisRelojExport = JSON.parse(savedReloj);
      } catch (e) {}

      localStorageSnapshot['openmun_crisis_eventos'] = crisisEventosExport;
      if (crisisRelojExport) localStorageSnapshot['openmun_crisis_reloj'] = crisisRelojExport;

      const sesionData = {
        version: '2.0',
        tipo: 'openmun_full_backup',
        fechaExportacion: new Date().toISOString(),
        comision: nombreComite || 'Asamblea General - openMUN',
        paises,
        oradoresCola,
        oradoresCaucus,
        registroIntervenciones,
        mociones,
        historicoMociones,
        caucusActivo,
        votacionSesion,
        agendaSesion,
        nombreComite,
        alertasCrisis: crisisEventosExport,
        eventosCrisis: crisisEventosExport,
        relojCrisis: crisisRelojExport,
        config: localStorageSnapshot['openmun_config'] || undefined,
        localStorageSnapshot
      };

      const blob = new Blob([JSON.stringify(sesionData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sesion_activa.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al exportar sesión completa:', err);
      alert('Error al exportar sesión: ' + err.message);
    }
  };

  // 2. CARGAR sesion_activa.json
  const cargarSesionJSON = (sesionData, onConfigLoaded) => {
    try {
      if (!sesionData || typeof sesionData !== 'object') {
        throw new Error('Formato de JSON inválido');
      }

      if (sesionData.localStorageSnapshot && typeof sesionData.localStorageSnapshot === 'object') {
        Object.entries(sesionData.localStorageSnapshot).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
            const stringVal = typeof val === 'string' ? val : JSON.stringify(val);
            localStorage.setItem(key, stringVal);
          }
        });
      }

      const snapshot = sesionData.localStorageSnapshot || {};

      const paisesData = sesionData.paises || snapshot.openmun_paises;
      if (Array.isArray(paisesData)) {
        setPaisesState(paisesData);
        localStorage.setItem('openmun_paises', JSON.stringify(paisesData));
      }

      const oradoresColaData = sesionData.oradoresCola || sesionData.oradoresGSL || snapshot.openmun_oradores;
      if (Array.isArray(oradoresColaData)) {
        setOradoresColaState(oradoresColaData);
        localStorage.setItem('openmun_oradores', JSON.stringify(oradoresColaData));
      }

      const oradoresCaucusData = sesionData.oradoresCaucus || snapshot.openmun_oradores_caucus;
      if (Array.isArray(oradoresCaucusData)) {
        setOradoresCaucusState(oradoresCaucusData);
        localStorage.setItem('openmun_oradores_caucus', JSON.stringify(oradoresCaucusData));
      }

      const intervencionesData = sesionData.registroIntervenciones || sesionData.intervenciones || snapshot.openmun_intervenciones;
      if (Array.isArray(intervencionesData)) {
        setRegistroIntervencionesState(intervencionesData);
        localStorage.setItem('openmun_intervenciones', JSON.stringify(intervencionesData));
      }

      const mocionesData = sesionData.mociones || snapshot.openmun_mociones;
      if (Array.isArray(mocionesData)) {
        setMocionesState(mocionesData);
        localStorage.setItem('openmun_mociones', JSON.stringify(mocionesData));
      }

      const historicoMocionesData = sesionData.historicoMociones || snapshot.openmun_historico_mociones;
      if (Array.isArray(historicoMocionesData)) {
        setHistoricoMocionesState(historicoMocionesData);
        localStorage.setItem('openmun_historico_mociones', JSON.stringify(historicoMocionesData));
      }

      const caucusData = sesionData.caucusActivo || snapshot.openmun_caucus;
      if (caucusData && typeof caucusData === 'object') {
        setCaucusActivoState(caucusData);
        localStorage.setItem('openmun_caucus', JSON.stringify(caucusData));
      }

      const votacionData = sesionData.votacionSesion || snapshot.openmun_votacion;
      if (votacionData && typeof votacionData === 'object') {
        setVotacionSesionState(votacionData);
        localStorage.setItem('openmun_votacion', JSON.stringify(votacionData));
      }

      const agendaData = sesionData.agendaSesion || snapshot.openmun_agenda;
      if (agendaData && typeof agendaData === 'object') {
        setAgendaSesionState(agendaData);
        localStorage.setItem('openmun_agenda', JSON.stringify(agendaData));
      }

      const comiteData = sesionData.nombreComite || sesionData.comision || snapshot.openmun_comite;
      if (typeof comiteData === 'string' && comiteData) {
        setNombreComiteState(comiteData);
        localStorage.setItem('openmun_comite', comiteData);
      }

      // Alertas y Eventos de Crisis
      const crisisData = sesionData.alertasCrisis || sesionData.eventosCrisis || sesionData.crisisEventos || sesionData.crisis || snapshot.openmun_crisis_eventos;
      if (Array.isArray(crisisData)) {
        localStorage.setItem('openmun_crisis_eventos', JSON.stringify(crisisData));
      }

      // Reloj de Simulación de Crisis
      const relojData = sesionData.relojCrisis || sesionData.relojSimulacion || sesionData.reloj || snapshot.openmun_crisis_reloj;
      if (relojData && typeof relojData === 'object') {
        localStorage.setItem('openmun_crisis_reloj', JSON.stringify(relojData));
      }

      const configData = sesionData.config || sesionData.openmun_config || snapshot.openmun_config;
      if (configData) {
        const parsedConfig = typeof configData === 'string' ? JSON.parse(configData) : configData;
        localStorage.setItem('openmun_config', JSON.stringify(parsedConfig));
        if (typeof onConfigLoaded === 'function') {
          onConfigLoaded(parsedConfig);
        }
      }

      Object.keys(sesionData).forEach(key => {
        if (key.startsWith('openmun_')) {
          const val = sesionData[key];
          localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
        }
      });

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('openmun_crisis_update', { 
        detail: { eventos: crisisData, reloj: relojData } 
      }));
      window.dispatchEvent(new CustomEvent('openmun_session_imported', { detail: sesionData }));

      return true;
    } catch (err) {
      console.error('Error al cargar la sesión JSON:', err);
      alert('Error al cargar el archivo sesion_activa.json: ' + err.message);
      return false;
    }
  };

  return (
    <SessionContext.Provider value={{
      paises,
      setPaises,
      cambiarEstatusPais,
      actualizarPais,
      eliminarPais,
      resetearAsistencia,
      toggleVetoPais,
      ordenarPaisesAlfabetico,
      reordenarPaises,
      oradoresCola,
      agregarOrador,
      removerOrador,
      moverOrador,
      vaciarOradoresGSL,
      ordenarOradoresGSLAlfabetico,
      reordenarOradoresGSL,
      cederTiempo,
      oradoresCaucus,
      agregarOradorCaucus,
      removerOradorCaucus,
      avanzarOradorCaucus,
      vaciarOradoresDebate,
      ordenarOradoresDebateAlfabetico,
      reordenarOradoresDebate,
      moverOradorCaucus,
      registroIntervenciones,
      registrarIntervencion,
      descargarSesionJSON,
      cargarSesionJSON,
      mociones,
      historicoMociones,
      agregarMocion,
      votarMocion,
      eliminarMocion,
      activarMocion,
      reordenarMociones,
      ordenarMocionesDisruptividad,
      caucusActivo,
      setCaucusActivo,
      relojGSLState,
      actualizarRelojGSL,
      yieldEvento,
      votacionSesion,
      registrarVotoPais,
      configurarVotacion,
      resetearVotacion,
      agendaSesion,
      establecerAgenda,
      cambiarTemaActual,
      nombreComite,
      setNombreComite,
      ejecutarAccion,
      aplicarEstadoExterno
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession debe ser usado dentro de un SessionProvider');
  }
  return context;
};
