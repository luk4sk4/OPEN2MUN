import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

const PAISES_INICIALES = [];

export const SessionProvider = ({ children }) => {
  const [paises, setPaises] = useState(() => {
    const saved = localStorage.getItem('openmun_paises');
    return saved ? JSON.parse(saved) : PAISES_INICIALES;
  });

  const [oradoresCola, setOradoresCola] = useState(() => {
    const saved = localStorage.getItem('openmun_oradores');
    return saved ? JSON.parse(saved) : [];
  });

  const [oradoresCaucus, setOradoresCaucus] = useState(() => {
    const saved = localStorage.getItem('openmun_oradores_caucus');
    return saved ? JSON.parse(saved) : [];
  });

  const [registroIntervenciones, setRegistroIntervenciones] = useState(() => {
    const saved = localStorage.getItem('openmun_intervenciones');
    return saved ? JSON.parse(saved) : [];
  });

  const [mociones, setMociones] = useState(() => {
    const saved = localStorage.getItem('openmun_mociones');
    return saved ? JSON.parse(saved) : [];
  });

  const [historicoMociones, setHistoricoMociones] = useState(() => {
    const saved = localStorage.getItem('openmun_historico_mociones');
    return saved ? JSON.parse(saved) : [];
  });

  const [caucusActivo, setCaucusActivo] = useState(() => {
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

  const [votacionSesion, setVotacionSesion] = useState(() => {
    const saved = localStorage.getItem('openmun_votacion');
    return saved ? JSON.parse(saved) : {
      asunto: 'Proyecto de Resolución / Moción',
      tipoVotacion: 'procedural',
      tipoMayoria: 'simple',
      aplicarVeto: true,
      votos: {}
    };
  });

  const [agendaSesion, setAgendaSesion] = useState(() => {
    const saved = localStorage.getItem('openmun_agenda');
    return saved ? JSON.parse(saved) : {
      establecida: false,
      temaActual: '',
      temasPropuestos: []
    };
  });

  const [nombreComite, setNombreComite] = useState(() => {
    return localStorage.getItem('openmun_comite') || '';
  });

  // SINCRONIZACIÓN MAJESTUOSA Y COMPLETA EN sesion_activa.json Y LOCALSTORAGE
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
      comision: 'Asamblea General - openMUN',
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

  const establecerAgenda = (temaActual, temasPropuestos = []) => {
    setAgendaSesion({
      establecida: true,
      temaActual,
      temasPropuestos: temasPropuestos.length > 0 ? temasPropuestos : [
        { id: 't1', titulo: temaActual, estado: 'En Discusión' }
      ]
    });
  };

  const cambiarTemaActual = (nuevoTema) => {
    setAgendaSesion(prev => ({
      ...prev,
      temaActual: nuevoTema,
      temasPropuestos: prev.temasPropuestos.map(t => 
        t.titulo === nuevoTema ? { ...t, estado: 'En Discusión' } : { ...t, estado: 'Pendiente' }
      )
    }));
  };

  const registrarVotoPais = (countryId, voto) => {
    setVotacionSesion(prev => {
      const copyVotos = { ...prev.votos };
      if (voto === null || voto === undefined) {
        delete copyVotos[countryId];
      } else {
        copyVotos[countryId] = voto;
      }
      return { ...prev, votos: copyVotos };
    });
  };

  const configurarVotacion = (ajustes) => {
    setVotacionSesion(prev => ({
      ...prev,
      ...ajustes
    }));
  };

  const resetearVotacion = () => {
    setVotacionSesion(prev => ({
      ...prev,
      votos: {}
    }));
  };

  // Funciones de Paises
  const cambiarEstatusPais = (id, nuevoEstatus) => {
    setPaises(prev => prev.map(p => p.id === id ? { ...p, estatus: nuevoEstatus } : p));
  };

  const resetearAsistencia = () => {
    setPaises(prev => prev.map(p => ({ ...p, estatus: 'Ausente' })));
  };

  const toggleVetoPais = (id) => {
    setPaises(prev => prev.map(p => p.id === id ? { ...p, veto: !p.veto } : p));
  };

  // Funciones de Oradores GSL
  const agregarOrador = (paisObj) => {
    if (!oradoresCola.some(o => o.nombre === paisObj.nombre)) {
      setOradoresCola(prev => [...prev, { id: Date.now().toString(), nombre: paisObj.nombre, bandera: paisObj.bandera || '🇺🇳' }]);
    }
  };

  const removerOrador = (id) => {
    setOradoresCola(prev => prev.filter(o => o.id !== id));
  };

  const moverOrador = (index, direccion) => {
    const newIndex = index + direccion;
    if (newIndex < 0 || newIndex >= oradoresCola.length) return;
    const clone = [...oradoresCola];
    const [moved] = clone.splice(index, 1);
    clone.splice(newIndex, 0, moved);
    setOradoresCola(clone);
  };

  const vaciarOradoresGSL = () => {
    setOradoresCola([]);
  };

  const ordenarOradoresGSLAlfabetico = () => {
    setOradoresCola(prev => [...prev].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })));
  };

  const reordenarOradoresGSL = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setOradoresCola(prev => {
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const clone = [...prev];
      const [moved] = clone.splice(fromIndex, 1);
      clone.splice(toIndex, 0, moved);
      return clone;
    });
  };

  const [relojGSLState, setRelojGSLState] = useState({ segundosRestantes: 60, tiempoInicial: 60, corriendo: false });
  const [yieldEvento, setYieldEvento] = useState(null);

  const actualizarRelojGSL = (segundosRestantes, tiempoInicial, corriendo) => {
    setRelojGSLState({ segundosRestantes, tiempoInicial, corriendo });
  };

  const cederTiempo = (tipo, destinoPaisName = '') => {
    if (oradoresCola.length === 0) return;

    const oradorActual = oradoresCola[0];
    const { segundosRestantes, tiempoInicial } = relojGSLState;

    if (tipo === 'mesa') {
      // 1. Ceder a la mesa: termina el turno de ese orador y pasa al siguiente (volviendo al tiempo original el cronómetro)
      const tiempoHablado = Math.max(1, tiempoInicial - segundosRestantes);
      const overtime = segundosRestantes < 0 ? Math.abs(segundosRestantes) : 0;
      registrarIntervencion(oradorActual.nombre, tiempoInicial, tiempoHablado, overtime);

      setOradoresCola(prev => prev.slice(1));
      setYieldEvento({ tipo: 'mesa', timestamp: Date.now() });
    }
    else if (tipo === 'preguntas') {
      // 2. Ceder a preguntas: nada, continua el tiempo normalmente
      setYieldEvento({ tipo: 'preguntas', timestamp: Date.now() });
    }
    else if (tipo === 'delegado' && destinoPaisName) {
      // 3. Ceder a otra delegación: dispondrá del tiempo restante, comenzando inmediatamente
      const tiempoHablado = Math.max(1, tiempoInicial - segundosRestantes);
      registrarIntervencion(oradorActual.nombre, tiempoInicial, tiempoHablado, 0);

      const paisObj = paises.find(p => p.nombre === destinoPaisName) || { nombre: destinoPaisName, bandera: '🇺🇳' };
      const nuevoOradorCedido = {
        id: Date.now().toString(),
        nombre: paisObj.nombre,
        bandera: paisObj.bandera || '🇺🇳'
      };

      setOradoresCola(prev => [
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
  };

  // Funciones de Oradores Caucus / Debate
  const agregarOradorCaucus = (paisObj) => {
    if (oradoresCaucus.some(o => o.nombre === paisObj.nombre)) return;

    const nuevoOrador = {
      id: Date.now().toString(),
      nombre: paisObj.nombre,
      bandera: paisObj.bandera || '🇺🇳',
      esProponenteUltimo: false
    };

    setOradoresCaucus(prev => {
      if (prev.length > 0 && prev[prev.length - 1].esProponenteUltimo) {
        const clone = [...prev];
        clone.splice(clone.length - 1, 0, nuevoOrador);
        return clone;
      }
      return [...prev, nuevoOrador];
    });
  };

  const removerOradorCaucus = (id) => {
    setOradoresCaucus(prev => prev.filter(o => o.id !== id));
  };

  const avanzarOradorCaucus = () => {
    if (oradoresCaucus.length > 0) {
      setOradoresCaucus(prev => prev.slice(1));
    }
  };

  const vaciarOradoresDebate = () => {
    setOradoresCaucus([]);
  };

  const ordenarOradoresDebateAlfabetico = () => {
    setOradoresCaucus(prev => [...prev].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })));
  };

  const reordenarOradoresDebate = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setOradoresCaucus(prev => {
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const clone = [...prev];
      const [moved] = clone.splice(fromIndex, 1);
      clone.splice(toIndex, 0, moved);
      return clone;
    });
  };

  const moverOradorCaucus = (index, direccion) => {
    const newIndex = index + direccion;
    if (newIndex < 0 || newIndex >= oradoresCaucus.length) return;
    const clone = [...oradoresCaucus];
    const [moved] = clone.splice(index, 1);
    clone.splice(newIndex, 0, moved);
    setOradoresCaucus(clone);
  };

  // Reordenar y Ordenar lista maestra de países
  const ordenarPaisesAlfabetico = () => {
    setPaises(prev => [...prev].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })));
  };

  const reordenarPaises = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setPaises(prev => {
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const clone = [...prev];
      const [moved] = clone.splice(fromIndex, 1);
      clone.splice(toIndex, 0, moved);
      return clone;
    });
  };

  // Registro de intervenciones
  const registrarIntervencion = (oradorNombre, tiempoAsignado, tiempoHablado, overtime) => {
    const nuevaEntrada = {
      id: Date.now(),
      pais: oradorNombre || 'Delegado',
      tiempoAsignado,
      tiempoHablado,
      overtime,
      fecha: new Date().toISOString()
    };
    
    setRegistroIntervenciones(prev => [nuevaEntrada, ...prev]);
  };

  // 1. EXPORTAR sesion_activa.json
  const descargarSesionJSON = () => {
    const sesionData = {
      version: '1.0',
      fechaExportacion: new Date().toISOString(),
      comision: 'Asamblea General - openMUN',
      paises,
      oradoresCola,
      oradoresCaucus,
      registroIntervenciones,
      mociones,
      caucusActivo
    };
    const blob = new Blob([JSON.stringify(sesionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sesion_activa.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 2. CARGAR / IMPORTAR sesion_activa.json
  const cargarSesionJSON = (sesionData) => {
    try {
      if (!sesionData || typeof sesionData !== 'object') {
        throw new Error('Formato de JSON inválido');
      }

      if (Array.isArray(sesionData.paises)) {
        setPaises(sesionData.paises);
      }
      if (Array.isArray(sesionData.oradoresCola || sesionData.oradoresGSL)) {
        setOradoresCola(sesionData.oradoresCola || sesionData.oradoresGSL);
      }
      if (Array.isArray(sesionData.oradoresCaucus)) {
        setOradoresCaucus(sesionData.oradoresCaucus);
      }
      if (Array.isArray(sesionData.registroIntervenciones || sesionData.intervenciones)) {
        setRegistroIntervenciones(sesionData.registroIntervenciones || sesionData.intervenciones);
      }
      if (Array.isArray(sesionData.mociones)) {
        setMociones(sesionData.mociones);
      }
      if (Array.isArray(sesionData.historicoMociones)) {
        setHistoricoMociones(sesionData.historicoMociones);
      }
      if (sesionData.caucusActivo) {
        setCaucusActivo(sesionData.caucusActivo);
      }

      return true;
    } catch (err) {
      console.error('Error al cargar la sesión JSON:', err);
      alert('Error al cargar el archivo sesion_activa.json: ' + err.message);
      return false;
    }
  };

  // Reordenar y Ordenar Mociones
  const compararMocionesDisruptividad = (a, b) => {
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
  };

  const ordenarMocionesDisruptividad = () => {
    setMociones(prev => [...prev].sort(compararMocionesDisruptividad));
  };

  const reordenarMociones = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setMociones(prev => {
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const clone = [...prev];
      const [moved] = clone.splice(fromIndex, 1);
      clone.splice(toIndex, 0, moved);
      return clone;
    });
  };

  const agregarMocion = (mocionData) => {
    const nueva = {
      id: Date.now().toString(),
      posicionProponente: mocionData.posicionProponente || 'Primero',
      varianteConsulta: mocionData.varianteConsulta || '',
      ...mocionData,
      estado: 'Pendiente',
      votosFavor: 0,
      votosContra: 0
    };
    setMociones(prev => [...prev, nueva].sort(compararMocionesDisruptividad));
    setHistoricoMociones(prev => [nueva, ...prev]);
  };

  const activarMocion = (mocion) => {
    const tipoMocion = mocion.tipo;
    const posProponente = mocion.posicionProponente || 'Primero';

    if (tipoMocion === 'Tour de Table') {
      const presentes = paises
        .filter(p => p.estatus !== 'Ausente')
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
        .map((p, idx) => ({ id: `tt-${idx}-${Date.now()}`, nombre: p.nombre, bandera: p.bandera }));

      setOradoresCaucus(presentes);
    } 
    else if (tipoMocion === 'Caucus Moderado') {
      const proponenteObj = paises.find(p => p.nombre === mocion.proponente);
      if (proponenteObj) {
        const itemProponente = {
          id: `cauc-prop-${Date.now()}`,
          nombre: proponenteObj.nombre,
          bandera: proponenteObj.bandera,
          esProponenteUltimo: posProponente === 'Ultimo'
        };
        setOradoresCaucus([itemProponente]);
      } else {
        setOradoresCaucus([]);
      }
    } 
    else {
      setOradoresCaucus([]);
    }

    // Al activar / aprobar una moción, se marca como Aprobada en el histórico
    setHistoricoMociones(prev => prev.map(m => (m.id === mocion.id || m.tema === mocion.tema) ? { ...m, estado: 'Aprobada' } : m));
    
    // Y se remueve de la pizarra activa de mociones pendientes
    setMociones(prev => prev.filter(m => m.id !== mocion.id));

    setCaucusActivo({
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
  };

  const votarMocion = (id, nuevoEstado) => {
    if (nuevoEstado === 'Fallida') {
      setMociones(prev => prev.filter(m => m.id !== id));
      setHistoricoMociones(prev => prev.map(m => m.id === id ? { ...m, estado: 'Fallida' } : m));
    } else if (nuevoEstado === 'Aprobada') {
      const mocionTarget = mociones.find(m => m.id === id);
      setHistoricoMociones(prev => prev.map(m => m.id === id ? { ...m, estado: 'Aprobada' } : m));
      // Remover de la pizarra activa
      setMociones(prev => prev.filter(m => m.id !== id));
      if (mocionTarget) {
        activarMocion(mocionTarget);
      }
    }
  };

  const eliminarMocion = (id) => {
    // Se borra únicamente de la pizarra de pendientes activa; se mantiene en historicoMociones
    setMociones(prev => prev.filter(m => m.id !== id));
  };

  return (
    <SessionContext.Provider value={{
      paises,
      setPaises,
      cambiarEstatusPais,
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
      setNombreComite
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
