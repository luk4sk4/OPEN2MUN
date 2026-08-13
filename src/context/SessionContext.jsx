import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

const PAISES_INICIALES = [
  { id: 'USA', nombre: 'Estados Unidos', veto: true, estatus: 'Presente y Votando', bandera: '🇺🇸' },
  { id: 'GBR', nombre: 'Reino Unido', veto: true, estatus: 'Presente y Votando', bandera: '🇬🇧' },
  { id: 'FRA', nombre: 'Francia', veto: true, estatus: 'Presente y Votando', bandera: '🇫🇷' },
  { id: 'RUS', nombre: 'Rusia', veto: true, estatus: 'Presente y Votando', bandera: '🇷🇺' },
  { id: 'CHN', nombre: 'China', veto: true, estatus: 'Presente y Votando', bandera: '🇨🇳' },
  { id: 'DEU', nombre: 'Alemania', veto: false, estatus: 'Presente', bandera: '🇩🇪' },
  { id: 'JPN', nombre: 'Japón', veto: false, estatus: 'Presente', bandera: '🇯🇵' },
  { id: 'BRA', nombre: 'Brasil', veto: false, estatus: 'Presente', bandera: '🇧🇷' },
  { id: 'IND', nombre: 'India', veto: false, estatus: 'Presente', bandera: '🇮🇳' },
  { id: 'MEX', nombre: 'México', veto: false, estatus: 'Presente', bandera: '🇲🇽' },
  { id: 'ESP', nombre: 'España', veto: false, estatus: 'Presente', bandera: '🇪🇸' },
  { id: 'ARG', nombre: 'Argentina', veto: false, estatus: 'Presente', bandera: '🇦🇷' },
  { id: 'COL', nombre: 'Colombia', veto: false, estatus: 'Presente', bandera: '🇨🇴' },
  { id: 'ZAF', nombre: 'Sudáfrica', veto: false, estatus: 'Presente', bandera: '🇿🇦' },
  { id: 'EGY', nombre: 'Egipto', veto: false, estatus: 'Presente', bandera: '🇪🇬' },
  { id: 'CAN', nombre: 'Canadá', veto: false, estatus: 'Presente', bandera: '🇨🇦' },
  { id: 'ITA', nombre: 'Italia', veto: false, estatus: 'Presente', bandera: '🇮🇹' },
  { id: 'KOR', nombre: 'Corea del Sur', veto: false, estatus: 'Presente', bandera: '🇰🇷' },
  { id: 'AUS', nombre: 'Australia', veto: false, estatus: 'Presente', bandera: '🇦🇺' },
  { id: 'TUR', nombre: 'Turquía', veto: false, estatus: 'Ausente', bandera: '🇹🇷' }
];

export const SessionProvider = ({ children }) => {
  const [paises, setPaises] = useState(() => {
    const saved = localStorage.getItem('openmun_paises');
    return saved ? JSON.parse(saved) : PAISES_INICIALES;
  });

  const [oradoresCola, setOradoresCola] = useState(() => {
    const saved = localStorage.getItem('openmun_oradores');
    return saved ? JSON.parse(saved) : [
      { id: '1', nombre: 'México', bandera: '🇲🇽' },
      { id: '2', nombre: 'Alemania', bandera: '🇩🇪' },
      { id: '3', nombre: 'Japón', bandera: '🇯🇵' }
    ];
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
    return saved ? JSON.parse(saved) : [
      {
        id: 'm1',
        proponente: 'México',
        posicionProponente: 'Primero',
        tipo: 'Caucus Moderado',
        varianteConsulta: '',
        tema: 'Estrategias de Financiamiento Verde',
        tiempoTotal: 600,
        tiempoOrador: 45,
        estado: 'Pendiente',
        votosFavor: 0,
        votosContra: 0
      }
    ];
  });

  const [historicoMociones, setHistoricoMociones] = useState(() => {
    const saved = localStorage.getItem('openmun_historico_mociones');
    return saved ? JSON.parse(saved) : [
      {
        id: 'm1',
        proponente: 'México',
        posicionProponente: 'Primero',
        tipo: 'Caucus Moderado',
        varianteConsulta: '',
        tema: 'Estrategias de Financiamiento Verde',
        tiempoTotal: 600,
        tiempoOrador: 45,
        estado: 'Pendiente'
      }
    ];
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
      establecida: true,
      temaActual: 'Estrategias de Financiamiento Verde y Sostenibilidad Global',
      temasPropuestos: [
        { id: 't1', titulo: 'Estrategias de Financiamiento Verde y Sostenibilidad Global', estado: 'En Discusión' },
        { id: 't2', titulo: 'Seguridad Cibernética e Inteligencia Artificial en Defensas', estado: 'Pendiente' }
      ]
    };
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
  }, [paises, oradoresCola, oradoresCaucus, registroIntervenciones, mociones, historicoMociones, caucusActivo, votacionSesion, agendaSesion]);

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

  // Funciones de Oradores Caucus
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
    setMociones(prev => [nueva, ...prev]);
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
      cambiarEstatusPais,
      toggleVetoPais,
      oradoresCola,
      agregarOrador,
      removerOrador,
      moverOrador,
      cederTiempo,
      oradoresCaucus,
      agregarOradorCaucus,
      removerOradorCaucus,
      avanzarOradorCaucus,
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
      cambiarTemaActual
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
