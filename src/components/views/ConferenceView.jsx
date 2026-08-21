import React, { useState, useEffect, useCallback, useRef, useMemo, Suspense, lazy } from 'react';
import {
  Building2,
  Users,
  Shield,
  Radio,
  ArrowLeft,
  Search,
  Plus,
  Play,
  Eye,
  Megaphone,
  Download,
  Upload,
  Trash2,
  Lock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  RefreshCw,
  Sliders,
  Settings,
  Globe,
  FileSpreadsheet,
  Check,
  X,
  UserCheck,
  Send,
  EyeOff,
  CheckSquare,
  Square,
  ClipboardList,
  Database,
  Mail,
  Key
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import OpenMunLogo from '../common/OpenMunLogo';
import conferenceService from '../../services/conferenceService';
import { useP2P } from '../../context/P2PContext';
import { useSession } from '../../context/SessionContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { formatearMensajeAviso, correspondeAviso } from '../../utils/announcementHelpers';

// Lazy loading de widgets para configuración directa desde Secretaría
const EstablecerAgenda = lazy(() => import('../widgets/EstablecerAgenda'));
const ImportarPaises = lazy(() => import('../widgets/ImportarPaises'));
const MatrizPaises = lazy(() => import('../widgets/MatrizPaises'));

const ConferenceView = ({ initialConfId = '', initialMode = 'explore', onExit, isLight: propIsLight }) => {
  const { t } = useTranslation();
  const { isLight: contextIsLight } = useAccessibility();
  const isLight = propIsLight !== undefined ? propIsLight : contextIsLight;

  const { setViewMode } = useP2P();
  const {
    setNombreComite,
    aplicarEstadoExterno,
    establecerEstadoComiteCompleto,
    cambiarTipoSesion,
    paises,
    agendaSesion,
    nombreComite,
    oradoresCola,
    oradoresCaucus,
    mociones,
    tipoSesion
  } = useSession();

  // Estados de la conferencia
  const [confIdInput, setConfIdInput] = useState(initialConfId);
  const [pinAccesoInput, setPinAccesoInput] = useState('');
  const [conferencia, setConferencia] = useState(null);
  const [comites, setComites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filtroComite, setFiltroComite] = useState('');

  // Pestaña Principal Superior: 'VER_COMITES' | 'STAFF' | 'SECRETARIA'
  const [activeMainTab, setActiveMainTab] = useState(() => {
    if (initialMode === 'admin') return 'SECRETARIA';
    if (initialMode === 'staff') return 'STAFF';
    return 'VER_COMITES';
  });

  // Estados de Admin / Secretaría (Requiere siempre PIN de Organización para entrar)
  const [adminPinInput, setAdminPinInput] = useState('');
  const [mostrarAdminPin, setMostrarAdminPin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [resumenData, setResumenData] = useState([]);

  // Estados de Configuración General de Conferencia (PATCH /api/conferencias/:id)
  const confSettingsInicializadoRef = useRef(false);
  const [confNombreInput, setConfNombreInput] = useState('');
  const [confEmailAdminInput, setConfEmailAdminInput] = useState('');
  const [cambiarPinAcceso, setCambiarPinAcceso] = useState(false);
  const [confPinAccesoInput, setConfPinAccesoInput] = useState('');
  const [mostrarConfPinAcceso, setMostrarConfPinAcceso] = useState(false);
  const [confNuevoPinAdmin, setConfNuevoPinAdmin] = useState('');
  const [mostrarConfNuevoPin, setMostrarConfNuevoPin] = useState(false);
  const [confPinAdminActual, setConfPinAdminActual] = useState('');
  const [mostrarConfPinActual, setMostrarConfPinActual] = useState(false);
  const [guardandoConfSettings, setGuardandoConfSettings] = useState(false);
  const [confSettingsFeedback, setConfSettingsFeedback] = useState(null);

  const [importandoJSON, setImportandoJSON] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef(null);
  const singleComiteFileInputRef = useRef(null);

  // Sincronizar inputs cuando se carga la conferencia por primera vez o se actualiza
  useEffect(() => {
    if (conferencia) {
      if (conferencia.nombre && !confNombreInput) setConfNombreInput(conferencia.nombre);
      if (conferencia.email_admin !== undefined && conferencia.email_admin !== null) {
        setConfEmailAdminInput(conferencia.email_admin || '');
      }
      setCambiarPinAcceso(Boolean(conferencia.requierePin));
      confSettingsInicializadoRef.current = true;
    }
  }, [conferencia]);

  // Estados para nuevo comité desde Secretaría
  const [nuevoNombreComite, setNuevoNombreComite] = useState('');
  const [nuevoPinMesa, setNuevoPinMesa] = useState('');
  const [creandoComite, setCreandoComite] = useState(false);

  // Estados para nuevo aviso desde Secretaría (Base de Datos)
  const [avisoDestino, setAvisoDestino] = useState(''); // '' = Global
  const [avisoEmisor, setAvisoEmisor] = useState('organizacion');
  const [avisoTipo, setAvisoTipo] = useState('info');
  const [avisoMensaje, setAvisoMensaje] = useState('');
  const [avisosActivos, setAvisosActivos] = useState([]);
  const [enviandoAviso, setEnviandoAviso] = useState(false);
  const [avisoFeedback, setAvisoFeedback] = useState(null);

  // Estados para Panel Staff (Base de Datos y Checklist)
  const [staffDestino, setStaffDestino] = useState('SECRETARIA'); // 'SECRETARIA' | 'GLOBAL' | 'STAFF_ALL' | comiteId
  const [staffPrioridad, setStaffPrioridad] = useState('info');
  const [staffMensaje, setStaffMensaje] = useState('');
  const [enviandoMensajeStaff, setEnviandoMensajeStaff] = useState(false);
  const [staffFeedback, setStaffFeedback] = useState(null);
  const [nuevaTareaStaff, setNuevaTareaStaff] = useState('');
  const [checklistStaff, setChecklistStaff] = useState(() => {
    try {
      const saved = localStorage.getItem('openmun_staff_panel_checklist');
      if (saved) return JSON.parse(saved);
      return [
        { id: 'c1', text: 'Verificar carteles de delegaciones en salas', done: false },
        { id: 'c2', text: 'Comprobar suministro de agua y material para mesas directivas', done: false },
        { id: 'c3', text: 'Probar conexión a internet y proyectores en comités', done: false }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('openmun_staff_panel_checklist', JSON.stringify(checklistStaff));
  }, [checklistStaff]);

  // Modal para PIN de mesa directiva
  const [comiteSeleccionado, setComiteSeleccionado] = useState(null);
  const [pinMesaInput, setPinMesaInput] = useState('');
  const [pinMesaError, setPinMesaError] = useState(null);

  // Modal de Configuración Integral de Comité desde Secretaría (Agenda, Importar, Matriz)
  const [comiteEnEdicion, setComiteEnEdicion] = useState(null);
  const [secretariaWidgetTab, setSecretariaWidgetTab] = useState('AGENDA'); // 'AGENDA' | 'IMPORTAR' | 'MATRIZ'
  const [guardandoComite, setGuardandoComite] = useState(false);
  const [guardadoFeedback, setGuardadoFeedback] = useState(null);

  // Cargar conferencia inicial
  const cargarConferencia = useCallback(async (id, pin = '') => {
    if (!id || !id.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const active = conferenceService.obtenerSesionActiva();
      const res = await conferenceService.accederConferencia(id.trim().toLowerCase(), pin);
      if (res && res.id) {
        const emailAdmin = res.email_admin || res.email || (active?.id === res.id ? active?.email_admin : null) || null;
        setConferencia({
          id: res.id,
          nombre: res.nombre,
          requierePin: res.requierePin,
          email_admin: emailAdmin
        });
        if (emailAdmin) {
          setConfEmailAdminInput(emailAdmin);
        }
        let initialComites = res.comites || [];
        try {
          const localConfComites = localStorage.getItem(`openmun_conf_comites_${res.id}`);
          if (localConfComites) {
            const parsedLocal = JSON.parse(localConfComites);
            if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
              const map = new Map(initialComites.map(c => [c.id, c]));
              parsedLocal.forEach(lc => {
                if (lc && lc.id) {
                  map.set(lc.id, { ...(map.get(lc.id) || {}), ...lc });
                }
              });
              initialComites = Array.from(map.values());
            }
          }
        } catch (e) {}

        setComites(initialComites);
        setIsAdminAuthenticated(false);
        setAdminPinInput('');
        conferenceService.guardarSesionActiva({
          id: res.id,
          nombre: res.nombre,
          email_admin: emailAdmin
        });
      }
    } catch (err) {
      if (err.status === 401) {
        setErrorMsg('Esta conferencia requiere un PIN de acceso o el PIN introducido es incorrecto.');
      } else {
        setErrorMsg(err.message || 'No se pudo encontrar la conferencia.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialConfId) {
      cargarConferencia(initialConfId);
    } else {
      const active = conferenceService.obtenerSesionActiva();
      if (active?.id) {
        setConfIdInput(active.id);
        cargarConferencia(active.id);
      }
    }
  }, [initialConfId, cargarConferencia]);

  // Polling optimizado de Resumen y Avisos desde Base de Datos (en paralelo, con deduplicación y detección de pestaña activa)
  const isFetchingRef = useRef(false);
  const fetchResumen = useCallback(async () => {
    if (!conferencia?.id || isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const [resResult, avisosResult] = await Promise.allSettled([
        conferenceService.obtenerResumen(conferencia.id),
        conferenceService.obtenerAvisos(conferencia.id)
      ]);

      if (resResult.status === 'fulfilled' && resResult.value) {
        const res = resResult.value;
        if (Array.isArray(res.comites)) {
          setResumenData(prevResumen => {
            const map = new Map((prevResumen || []).map(r => [r.id, r]));
            res.comites.forEach(rc => {
              if (rc && rc.id) map.set(rc.id, { ...(map.get(rc.id) || {}), ...rc });
            });
            return Array.from(map.values());
          });

          setComites(prevComites => {
            const map = new Map((prevComites || []).map(c => [c.id, c]));
            try {
              const localSaved = localStorage.getItem(`openmun_conf_comites_${conferencia.id}`);
              if (localSaved) {
                const parsed = JSON.parse(localSaved);
                if (Array.isArray(parsed)) {
                  parsed.forEach(lc => {
                    if (lc && lc.id) map.set(lc.id, { ...(map.get(lc.id) || {}), ...lc });
                  });
                }
              }
            } catch (e) {}

            res.comites.forEach(rc => {
              if (rc && rc.id) {
                const prev = map.get(rc.id) || {};
                map.set(rc.id, {
                  ...prev,
                  ...rc,
                  id: rc.id,
                  nombre: rc.nombre || prev.nombre || rc.id,
                  pin_mesa: rc.pin_mesa !== undefined ? rc.pin_mesa : prev.pin_mesa,
                  requierePinMesa: rc.requierePinMesa !== undefined ? rc.requierePinMesa : (rc.pin_mesa ? true : prev.requierePinMesa),
                  datos_json: rc.datos_json || prev.datos_json || {}
                });
              }
            });
            const list = Array.from(map.values());
            try {
              localStorage.setItem(`openmun_conf_comites_${conferencia.id}`, JSON.stringify(list));
            } catch (e) {}
            return list;
          });
        }
        if (res.email_admin !== undefined && res.email_admin !== null) {
          setConferencia(prev => prev ? { ...prev, email_admin: res.email_admin } : prev);
          setConfEmailAdminInput(prev => prev || res.email_admin || '');
        }
      }

      if (avisosResult.status === 'fulfilled' && avisosResult.value && Array.isArray(avisosResult.value.avisos)) {
        setAvisosActivos(avisosResult.value.avisos);
      }
    } catch (err) {
      console.warn('Error al actualizar datos de conferencia:', err);
    } finally {
      isFetchingRef.current = false;
    }
  }, [conferencia?.id]);

  const fetchAvisos = fetchResumen;

  useEffect(() => {
    if (!conferencia?.id) return;
    
    // Fetch inicial
    fetchResumen();

    // Solo consultar activamente cuando la ventana / pestaña esté visible
    let interval = null;
    const startPolling = () => {
      if (!interval) {
        interval = setInterval(() => {
          if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
            fetchResumen();
          }
        }, 20000);
      }
    };

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchResumen();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    startPolling();

    return () => {
      if (interval) clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [conferencia?.id, fetchResumen]);

  // Exportar Archivo JSON Completo con las 3 tablas de la base de datos
  const handleExportarConferenciaJSON = () => {
    if (!conferencia?.id) return;
    try {
      const confData = {
        id: conferencia.id,
        nombre: conferencia.nombre,
        requierePin: Boolean(conferencia.requierePin),
        email_admin: conferencia.email_admin || null
      };

      const comitesData = (comites || []).map(c => {
        let comiteState = c.datos_json;
        if (!comiteState || Object.keys(comiteState).length === 0) {
          try {
            const local = localStorage.getItem(`openmun_comite_data_${c.id}`);
            if (local) comiteState = JSON.parse(local);
          } catch (e) {}
        }
        return {
          id: c.id,
          nombre: c.nombre,
          pin_mesa: c.pin_mesa || null,
          tipo_sesion: c.tipo_sesion || 'formal',
          topico_actual: c.topico_actual || '',
          datos_json: comiteState || {}
        };
      });

      const avisosData = avisosActivos || [];

      const fullBackup = {
        version: '2.0',
        tipo: 'openmun_conferencia_completa',
        generado_en: new Date().toISOString(),
        tablas: {
          conferencias: confData,
          comites: comitesData,
          avisos: avisosData
        }
      };

      const jsonStr = JSON.stringify(fullBackup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `openmun_${conferencia.id}_completo_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error al exportar JSON completo de la conferencia: ' + err.message);
    }
  };

  // Procesar archivo JSON de conferencia o comité individual (vía selector de archivo o Drag & Drop)
  const procesarArchivoConferenciaJSON = async (file, forceSingleComiteMode = false) => {
    if (!file) return;
    if (file.name && !file.name.toLowerCase().endsWith('.json') && file.type && !file.type.includes('json')) {
      setConfSettingsFeedback({
        type: 'error',
        text: 'Por favor, selecciona o arrastra un archivo en formato .JSON válido.'
      });
      return;
    }

    setImportandoJSON(true);
    setConfSettingsFeedback(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const raw = event.target?.result;
        if (!raw) throw new Error('El archivo está vacío.');
        const parsed = JSON.parse(raw);

        // Identificar si es un backup de un solo comité / sesión activa (tipo 'openmun_full_backup' o contiene paises/agendaSesion)
        const isSingleComiteSession = forceSingleComiteMode || (!parsed.tablas && !parsed.conferencias && !parsed.conferencia && (
          parsed.tipo === 'openmun_full_backup' ||
          Boolean(parsed.paises && Array.isArray(parsed.paises)) ||
          Boolean(parsed.agendaSesion) ||
          Boolean(parsed.oradoresCola) ||
          Boolean(parsed.comision && !parsed.comites) ||
          Boolean(parsed.nombreComite && !parsed.comites)
        ));

        if (isSingleComiteSession) {
          // ── MODO IMPORTAR UN COMITÉ INDIVIDUAL (DESDE sesion_activa.json O CONTROL DE COMITÉ) ──
          const cleanNom = (parsed.comision || parsed.nombreComite || parsed.nombre || file.name?.replace(/\.json$/i, '').replace(/^sesion_/i, '').replace(/_/g, ' ') || 'Comité Importado').trim();
          const shortTs = String(Date.now()).substring(0, 4);
          const customId = parsed.id ? String(parsed.id).toLowerCase().trim() : `${conferencia.id.toLowerCase()}_${shortTs}_${Math.random().toString(36).substring(2, 6)}`;

          const comiteState = {
            comision: cleanNom,
            nombreComite: cleanNom,
            paises: Array.isArray(parsed.paises) ? parsed.paises : [],
            agendaSesion: parsed.agendaSesion || {},
            oradoresCola: Array.isArray(parsed.oradoresCola) ? parsed.oradoresCola : [],
            oradoresCaucus: Array.isArray(parsed.oradoresCaucus) ? parsed.oradoresCaucus : [],
            registroIntervenciones: parsed.registroIntervenciones || {},
            mociones: Array.isArray(parsed.mociones) ? parsed.mociones : [],
            historicoMociones: Array.isArray(parsed.historicoMociones) ? parsed.historicoMociones : [],
            caucusActivo: parsed.caucusActivo || null,
            votacionSesion: parsed.votacionSesion || null,
            proyectoResolucion: parsed.proyectoResolucion || null,
            enmiendasSesion: parsed.enmiendasSesion || null,
            eventosCrisis: parsed.eventosCrisis || [],
            relojCrisis: parsed.relojCrisis || null,
            notes: parsed.notes || [],
            roomSettings: parsed.roomSettings || null,
            config: parsed.config || null,
            tipoSesion: parsed.tipoSesion || parsed.tipo_sesion || 'formal'
          };

          let idFinal = customId;
          try {
            const res = await conferenceService.crearOActualizarComite(conferencia.id, {
              id: customId,
              nombre: cleanNom,
              pin_mesa: parsed.pin_mesa || null,
              datos_json: comiteState
            });
            if (res?.comiteId) idFinal = res.comiteId;
          } catch (e) {
            console.warn('Sincronización en servidor omitida o fallida:', e);
          }

          try {
            localStorage.setItem(`openmun_comite_data_${idFinal}`, JSON.stringify(comiteState));
            if (parsed.id && parsed.id !== idFinal) {
              localStorage.setItem(`openmun_comite_data_${parsed.id}`, JSON.stringify(comiteState));
            }
          } catch (e) {}

          const nuevoComiteObj = {
            id: idFinal,
            nombre: cleanNom,
            pin_mesa: parsed.pin_mesa || null,
            requierePinMesa: Boolean(parsed.pin_mesa),
            datos_json: comiteState,
            tipo_sesion: comiteState.tipoSesion || 'formal',
            topico_actual: comiteState.agendaSesion?.temaActual || ''
          };

          setComites(prev => {
            const map = new Map((prev || []).map(item => [item.id, item]));
            map.set(idFinal, nuevoComiteObj);
            const list = Array.from(map.values());
            try {
              localStorage.setItem(`openmun_conf_comites_${conferencia.id}`, JSON.stringify(list));
            } catch (e) {}
            return list;
          });

          setResumenData(prev => {
            const map = new Map((prev || []).map(item => [item.id, item]));
            map.set(idFinal, nuevoComiteObj);
            return Array.from(map.values());
          });

          conferenceService.invalidarCache?.(conferencia.id);
          fetchResumen();

          setConfSettingsFeedback({
            type: 'success',
            text: `¡Comité "${cleanNom}" añadido con éxito! (${comiteState.paises.length} delegaciones cargadas)`
          });
          return;
        }

        // ── MODO IMPORTAR CONFERENCIA COMPLETA (3 TABLAS BD) ──
        const tablas = parsed.tablas || parsed;
        const confData = tablas.conferencias || tablas.conferencia || parsed.conferencia || (parsed.id && parsed.nombre ? parsed : null);

        let rawComites = tablas.comites || parsed.comites || tablas.comite || parsed.comite;
        if (!rawComites && Array.isArray(parsed)) {
          rawComites = parsed;
        } else if (rawComites && typeof rawComites === 'object' && !Array.isArray(rawComites)) {
          rawComites = Object.values(rawComites);
        }

        const avisosData = tablas.avisos || parsed.avisos;

        if (!confData && !rawComites && !avisosData) {
          throw new Error('El archivo no contiene un formato de conferencia o comité válido de OpenMUN.');
        }

        // 1. Restaurar Comités (Se importan únicamente los comités en la conferencia actual, preservando los datos de la conferencia actual)
        let countComites = 0;
        const comitesRestaurados = [];
        if (Array.isArray(rawComites)) {
          for (const c of rawComites) {
            const nombreComite = (c.nombre || c.comision || c.nombreComite || c.name || '').trim();
            if (!nombreComite && !c.id) continue;

            const cleanNom = nombreComite || c.id;
            const comiteId = c.id ? String(c.id).toLowerCase().trim() : `${conferencia.id.toLowerCase()}_${String(Date.now()).substring(0, 4)}_${Math.random().toString(36).substring(2, 6)}`;

            let datosComite = c.datos_json || c.datos || c.state;
            if (!datosComite || Object.keys(datosComite).length === 0) {
              if (c.paises || c.agendaSesion || c.oradoresCola || c.oradoresCaucus || c.mociones) {
                datosComite = {
                  comision: cleanNom,
                  nombreComite: cleanNom,
                  paises: c.paises || [],
                  agendaSesion: c.agendaSesion || {},
                  oradoresCola: c.oradoresCola || [],
                  oradoresCaucus: c.oradoresCaucus || [],
                  mociones: c.mociones || [],
                  tipoSesion: c.tipo_sesion || c.tipoSesion || 'formal'
                };
              } else {
                datosComite = {
                  comision: cleanNom,
                  nombreComite: cleanNom,
                  paises: [],
                  agendaSesion: {},
                  tipoSesion: c.tipo_sesion || c.tipoSesion || 'formal'
                };
              }
            }

            let idFinal = comiteId;
            try {
              const resComite = await conferenceService.crearOActualizarComite(conferencia.id, {
                id: comiteId,
                nombre: cleanNom,
                pin_mesa: c.pin_mesa || null,
                datos_json: datosComite
              });
              if (resComite?.comiteId) idFinal = resComite.comiteId;
            } catch (errC) {
              console.warn('Error al guardar comité en backend:', cleanNom, errC);
            }

            try {
              localStorage.setItem(`openmun_comite_data_${idFinal}`, JSON.stringify(datosComite));
              if (c.id && c.id !== idFinal) {
                localStorage.setItem(`openmun_comite_data_${c.id}`, JSON.stringify(datosComite));
              }
            } catch (e) {}

            comitesRestaurados.push({
              id: idFinal,
              nombre: cleanNom,
              pin_mesa: c.pin_mesa || null,
              requierePinMesa: Boolean(c.pin_mesa),
              tipo_sesion: c.tipo_sesion || c.tipoSesion || datosComite?.tipoSesion || 'formal',
              topico_actual: c.topico_actual || datosComite?.agendaSesion?.temaActual || '',
              datos_json: datosComite
            });
            countComites++;
          }
        }

        // 3. Restaurar Avisos
        let countAvisos = 0;
        if (Array.isArray(avisosData)) {
          for (const av of avisosData) {
            if (!av.mensaje) continue;
            try {
              await conferenceService.crearAviso(conferencia.id, {
                comite_id: av.comite_id || null,
                emisor: av.emisor || 'organizacion',
                tipo: av.tipo || 'info',
                mensaje: av.mensaje
              });
              countAvisos++;
            } catch (errAv) {
              console.warn('Error al restaurar aviso:', errAv);
            }
          }
        }

        // 4. Actualizar Estado de Comités en React inmediatamente y persistir
        if (comitesRestaurados.length > 0) {
          setComites(prev => {
            const map = new Map((prev || []).map(item => [item.id, item]));
            comitesRestaurados.forEach(nc => map.set(nc.id, { ...(map.get(nc.id) || {}), ...nc }));
            const list = Array.from(map.values());
            try {
              localStorage.setItem(`openmun_conf_comites_${conferencia.id}`, JSON.stringify(list));
            } catch (e) {}
            return list;
          });
          setResumenData(prev => {
            const map = new Map((prev || []).map(item => [item.id, item]));
            comitesRestaurados.forEach(nc => map.set(nc.id, { ...(map.get(nc.id) || {}), ...nc }));
            return Array.from(map.values());
          });
        }

        // Invalidar caché y forzar refresco
        conferenceService.invalidarCache?.(conferencia.id);
        await fetchResumen();

        setConfSettingsFeedback({
          type: 'success',
          text: `¡Importación completada! Se restauraron ${countComites} comités y ${countAvisos} avisos en la base de datos.`
        });
      } catch (err) {
        setConfSettingsFeedback({
          type: 'error',
          text: 'Error al procesar el archivo JSON: ' + err.message
        });
      } finally {
        setImportandoJSON(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (singleComiteFileInputRef.current) singleComiteFileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setConfSettingsFeedback({
        type: 'error',
        text: 'Error al leer el archivo desde el dispositivo.'
      });
      setImportandoJSON(false);
    };

    reader.readAsText(file);
  };

  // Importar Archivo JSON vía selector de archivo
  const handleImportarConferenciaJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await procesarArchivoConferenciaJSON(file);
  };

  // Manejadores de Drag & Drop para importar JSON arrastrando a la conferencia
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingFile(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDraggingFile(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      await procesarArchivoConferenciaJSON(file);
    }
  };

  // Helper para resolver el nombre legible del destinatario del aviso
  const getNombreDestino = (comiteId) => {
    if (!comiteId || comiteId === 'GLOBAL') return '📢 Toda la Conferencia (Global)';
    if (comiteId === 'STAFF_ALL') return '👥 Todo el Staff de la Conferencia';
    if (comiteId === 'SECRETARIA') return '🛡️ Organización';
    const allComites = listaComitesConsolidada || comites || [];
    if (comiteId.startsWith('STAFF_COMITE_')) {
      const cleanId = comiteId.replace('STAFF_COMITE_', '');
      const c = allComites.find(item => item.id === cleanId);
      return `👥 Staff de ${c ? c.nombre : cleanId}`;
    }
    const c = allComites.find(item => item.id === comiteId);
    return `🏛️ Mesa de ${c ? c.nombre : comiteId}`;
  };

  // Manejar Login Admin de Organización
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminPinInput.trim() || !conferencia?.id) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await conferenceService.verificarAdmin(conferencia.id, adminPinInput.trim());
      setIsAdminAuthenticated(true);
      fetchResumen();
    } catch (err) {
      setErrorMsg(err.message || 'PIN de Organización incorrecto.');
    } finally {
      setLoading(false);
    }
  };

  // Guardar / Actualizar Configuración Integral de la Conferencia en Base de Datos (PATCH /api/conferencias/:id)
  const handleGuardarConfiguracionConferencia = async (e) => {
    e.preventDefault();
    if (!conferencia?.id) return;

    const pinActual = confPinAdminActual.trim() || adminPinInput.trim();
    if (!pinActual) {
      setConfSettingsFeedback({
        type: 'error',
        text: 'Debes introducir el PIN de Secretaría actual para autorizar los cambios.'
      });
      return;
    }

    setGuardandoConfSettings(true);
    setConfSettingsFeedback(null);

    try {
      const payload = {
        pin_admin_actual: pinActual
      };

      if (confNombreInput.trim() && confNombreInput.trim() !== conferencia.nombre) {
        payload.nombre = confNombreInput.trim();
      }

      const emailVal = confEmailAdminInput.trim();
      if (emailVal !== (conferencia.email_admin || '')) {
        payload.email_admin = emailVal || null;
      }

      if (cambiarPinAcceso) {
        if (confPinAccesoInput.trim()) {
          payload.pin_acceso = confPinAccesoInput.trim();
        }
      } else if (conferencia.requierePin) {
        payload.pin_acceso = null;
      }

      if (confNuevoPinAdmin.trim()) {
        payload.nuevo_pin_admin = confNuevoPinAdmin.trim();
      }

      const res = await conferenceService.actualizarConferencia(conferencia.id, payload);

      const nuevoNombre = payload.nombre || conferencia.nombre;
      const nuevoEmail = payload.email_admin !== undefined ? payload.email_admin : conferencia.email_admin;
      const nuevoRequierePin = payload.pin_acceso !== undefined ? Boolean(payload.pin_acceso) : conferencia.requierePin;

      setConferencia(prev => prev ? {
        ...prev,
        nombre: nuevoNombre,
        email_admin: nuevoEmail,
        requierePin: nuevoRequierePin
      } : prev);

      if (payload.nuevo_pin_admin) {
        setAdminPinInput(payload.nuevo_pin_admin);
        setConfPinAdminActual(payload.nuevo_pin_admin);
        setConfNuevoPinAdmin('');
      }

      setConfSettingsFeedback({
        type: 'success',
        text: res?.mensaje || '¡Conferencia actualizada correctamente en la base de datos!'
      });

      setTimeout(() => setConfSettingsFeedback(null), 5000);
      fetchResumen();
    } catch (err) {
      let mensajeError = err.message || 'Error al actualizar la conferencia.';
      if (err.status === 400) {
        mensajeError = 'Falta el PIN de Secretaría actual para autorizar la operación (Error 400).';
      } else if (err.status === 401) {
        mensajeError = 'El PIN de Secretaría actual no coincide con el registrado (Error 401).';
      } else if (err.status === 404) {
        mensajeError = 'Conferencia no encontrada en el servidor (Error 404).';
      }
      setConfSettingsFeedback({
        type: 'error',
        text: mensajeError
      });
    } finally {
      setGuardandoConfSettings(false);
    }
  };

  // Crear nuevo comité desde Secretaría (con estado independiente y aislado)
  const handleCrearComite = async (e) => {
    e.preventDefault();
    if (!nuevoNombreComite.trim() || !conferencia?.id) return;
    setCreandoComite(true);
    try {
      const cleanNom = nuevoNombreComite.trim();
      const shortTs = String(Date.now()).substring(0, 4);
      const customId = `${conferencia.id.toLowerCase()}_${shortTs}_${Math.random().toString(36).substring(2, 5)}`;

      const initialComiteState = {
        comision: cleanNom,
        nombreComite: cleanNom,
        paises: [],
        agendaSesion: {},
        oradoresCola: [],
        oradoresCaucus: [],
        mociones: [],
        tipoSesion: 'formal'
      };

      // Guardar localmente indexado por ID
      try {
        localStorage.setItem(`openmun_comite_data_${customId}`, JSON.stringify(initialComiteState));
      } catch (e) {}

      // Guardar en la Base de Datos
      const res = await conferenceService.crearOActualizarComite(conferencia.id, {
        id: customId,
        nombre: cleanNom,
        pin_mesa: nuevoPinMesa.trim() || null,
        datos_json: initialComiteState
      });

      const nuevoComiteObj = {
        id: res?.comiteId || customId,
        nombre: cleanNom,
        pin_mesa: nuevoPinMesa.trim() || null,
        requierePinMesa: Boolean(nuevoPinMesa.trim()),
        datos_json: initialComiteState,
        tipo_sesion: 'formal'
      };

      setComites(prev => [...prev, nuevoComiteObj]);
      setNuevoNombreComite('');
      setNuevoPinMesa('');
      fetchResumen();
    } catch (err) {
      alert('Error al crear comité: ' + err.message);
    } finally {
      setCreandoComite(false);
    }
  };

  // Emitir aviso desde Secretaría por Base de Datos
  const handleEmitirAviso = async (e) => {
    e.preventDefault();
    if (!avisoMensaje.trim() || !conferencia?.id) return;
    setEnviandoAviso(true);
    setAvisoFeedback(null);
    try {
      let targetComite = null;
      if (avisoDestino === 'STAFF' || avisoDestino === 'STAFF_ALL') {
        targetComite = 'STAFF_ALL';
      } else if (avisoDestino && avisoDestino !== '' && avisoDestino !== 'GLOBAL') {
        targetComite = avisoDestino;
      }

      const res = await conferenceService.crearAviso(conferencia.id, {
        comite_id: targetComite,
        emisor: avisoEmisor || 'Secretaría General',
        tipo: avisoTipo,
        mensaje: avisoMensaje.trim()
      });
      if (res) {
        setAvisoMensaje('');
        setAvisoFeedback('¡Aviso guardado en base de datos y emitido con éxito!');
        fetchResumen();
        setTimeout(() => setAvisoFeedback(null), 3000);
      }
    } catch (err) {
      alert('Error al emitir aviso: ' + err.message);
    } finally {
      setEnviandoAviso(false);
    }
  };

  // Emitir mensaje / aviso desde Staff por Base de Datos
  const handleEnviarMensajeStaff = async (e) => {
    e.preventDefault();
    if (!staffMensaje.trim() || !conferencia?.id) return;
    setEnviandoMensajeStaff(true);
    setStaffFeedback(null);
    try {
      let targetComite = null;

      if (staffDestino === 'SECRETARIA') {
        targetComite = 'SECRETARIA';
      } else if (staffDestino === 'STAFF_ALL') {
        targetComite = 'STAFF_ALL';
      } else if (staffDestino === 'GLOBAL') {
        targetComite = null;
      } else if (staffDestino.startsWith('STAFF_COMITE_')) {
        targetComite = staffDestino; // e.g. 'STAFF_COMITE_<id>'
      } else {
        targetComite = staffDestino; // e.g. '<id>' para Mesa
      }

      const res = await conferenceService.crearAviso(conferencia.id, {
        comite_id: targetComite,
        emisor: 'Staff General',
        tipo: staffPrioridad,
        mensaje: staffMensaje.trim()
      });

      if (res) {
        setStaffMensaje('');
        setStaffFeedback('¡Mensaje enviado a la base de datos central exitosamente!');
        fetchResumen();
        setTimeout(() => setStaffFeedback(null), 3000);
      }
    } catch (err) {
      alert('Error al enviar mensaje: ' + err.message);
    } finally {
      setEnviandoMensajeStaff(false);
    }
  };

  // Desactivar aviso en Base de Datos
  const handleDesactivarAviso = async (avisoId) => {
    try {
      await conferenceService.desactivarAviso(avisoId);
      setAvisosActivos(prev => prev.filter(a => a.id !== avisoId));
    } catch (err) {
      alert('Error al desactivar aviso: ' + err.message);
    }
  };

  // Eliminar comité
  const handleEliminarComite = async (comiteId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este comité de la conferencia?')) return;
    try {
      await conferenceService.eliminarComite(comiteId);
      setComites(prev => prev.filter(c => c.id !== comiteId));
      setResumenData(prev => prev.filter(c => c.id !== comiteId));
      conferenceService.invalidarCache?.(conferencia?.id);
      fetchResumen();
    } catch (err) {
      alert('Error al eliminar comité: ' + err.message);
    }
  };

  // Abrir editor integral de Secretaría para un comité (aislado e independiente)
  const handleAbrirEditorComite = (comite) => {
    setComiteEnEdicion(comite);
    setSecretariaWidgetTab('AGENDA');
    setGuardadoFeedback(null);

    // Cargar datos aislados estrictos de este comité
    let datos = comite.datos_json;
    if (typeof datos === 'string') {
      try { datos = JSON.parse(datos); } catch (e) { datos = null; }
    }
    if (!datos || Object.keys(datos).length === 0) {
      try {
        const localSaved = localStorage.getItem(`openmun_comite_data_${comite.id}`);
        if (localSaved) datos = JSON.parse(localSaved);
      } catch (e) {}
    }

    establecerEstadoComiteCompleto(datos || {
      comision: comite.nombre,
      nombreComite: comite.nombre,
      paises: [],
      agendaSesion: {},
      oradoresCola: [],
      mociones: [],
      tipoSesion: comite.tipo_sesion || 'formal'
    }, comite.nombre);
  };

  // Guardar cambios del comité en Base de Datos
  const handleGuardarCambiosComite = async () => {
    if (!comiteEnEdicion || !conferencia?.id) return;
    setGuardandoComite(true);
    setGuardadoFeedback(null);
    try {
      const estadoActual = {
        comision: comiteEnEdicion.nombre,
        nombreComite: comiteEnEdicion.nombre,
        paises: Array.isArray(paises) ? paises : [],
        agendaSesion: agendaSesion || {},
        oradoresCola: Array.isArray(oradoresCola) ? oradoresCola : [],
        oradoresCaucus: Array.isArray(oradoresCaucus) ? oradoresCaucus : [],
        mociones: Array.isArray(mociones) ? mociones : [],
        tipoSesion: tipoSesion || 'formal'
      };

      // Guardar también localmente para este comité
      try {
        localStorage.setItem(`openmun_comite_data_${comiteEnEdicion.id}`, JSON.stringify(estadoActual));
      } catch (e) {}

      await conferenceService.crearOActualizarComite(conferencia.id, {
        id: comiteEnEdicion.id,
        nombre: comiteEnEdicion.nombre,
        datos_json: estadoActual
      });

      // Actualizar en el estado local de comites
      setComites(prev => prev.map(c => c.id === comiteEnEdicion.id ? { ...c, datos_json: estadoActual } : c));

      setGuardadoFeedback('¡Datos del comité guardados exitosamente en el servidor central!');
      setTimeout(() => setGuardadoFeedback(null), 3000);
      fetchResumen();
    } catch (err) {
      alert('Error al guardar datos del comité: ' + err.message);
    } finally {
      setGuardandoComite(false);
    }
  };

  // Cerrar modal de comité guardando también los cambios / archivo
  const handleCerrarEditorComite = async () => {
    if (comiteEnEdicion && conferencia?.id) {
      try {
        await handleGuardarCambiosComite();
      } catch (err) {
        console.warn('Error al autoguardar al cerrar editor:', err);
      }
    }
    setComiteEnEdicion(null);
  };

  // Entrar a Comité como Mesa Directiva (Chair) - Carga JSON aislado y entra
  const handleEntrarComoMesa = async (comite) => {
    if (comite.requierePinMesa) {
      setComiteSeleccionado(comite);
      setPinMesaInput('');
      setPinMesaError(null);
      return;
    }
    await ejecutarEntradaMesa(comite);
  };

  const ejecutarEntradaMesa = async (comite, pin = '') => {
    setLoading(true);
    try {
      if (comite.requierePinMesa && pin) {
        await conferenceService.verificarPinMesa(comite.id, pin);
      }

      localStorage.setItem('openmun_current_comite_id', comite.id);
      localStorage.setItem('openmun_current_conf_id', conferencia.id);

      // Cargar JSON aislado del comité
      let datosComite = comite.datos_json;
      if (typeof datosComite === 'string') {
        try {
          datosComite = JSON.parse(datosComite);
        } catch (e) {
          datosComite = null;
        }
      }
      if (!datosComite || Object.keys(datosComite).length === 0) {
        try {
          const localSaved = localStorage.getItem(`openmun_comite_data_${comite.id}`);
          if (localSaved) datosComite = JSON.parse(localSaved);
        } catch (e) {}
      }

      establecerEstadoComiteCompleto(datosComite || {
        comision: comite.nombre,
        nombreComite: comite.nombre,
        paises: [],
        agendaSesion: {},
        tipoSesion: comite.tipo_sesion || 'formal'
      }, comite.nombre);

      if (comite.tipo_sesion) {
        cambiarTipoSesion(comite.tipo_sesion, false);
      }

      // Indicar que la navegación debe ir a COMIENZO con toast de confirmación
      localStorage.setItem('openmun_pending_nav_tab', 'COMIENZO');
      localStorage.setItem('openmun_pending_toast', JSON.stringify({
        type: 'success',
        title: '¡Sesión cargada correctamente!',
        message: `Has ingresado a la Mesa de Presidencia de "${comite.nombre}".`,
        duration: 4000
      }));

      // Entrar al Dashboard de moderación directamente
      if (typeof onExit === 'function') {
        onExit();
      } else {
        setViewMode('chair');
      }
    } catch (err) {
      setPinMesaError(err.message || 'PIN de Mesa Directiva incorrecto.');
    } finally {
      setLoading(false);
    }
  };

  // Helper con colores vivos y destacados para todos los estados
  const getStatusBadge = (tipo) => {
    switch (tipo) {
      case 'informal':
        return {
          label: 'Sesión Informal',
          color: '#eab308',
          bg: 'rgba(234, 179, 8, 0.18)',
          border: 'rgba(234, 179, 8, 0.45)',
          solidBg: '#eab308',
          solidText: '#000000'
        };
      case 'receso':
        return {
          label: 'En Receso',
          color: '#a855f7',
          bg: 'rgba(168, 85, 247, 0.18)',
          border: 'rgba(168, 85, 247, 0.45)',
          solidBg: '#a855f7',
          solidText: '#ffffff'
        };
      case 'votacion':
        return {
          label: 'En Votación',
          color: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.18)',
          border: 'rgba(59, 130, 246, 0.45)',
          solidBg: '#3b82f6',
          solidText: '#ffffff'
        };
      case 'formal':
      default:
        return {
          label: 'Sesión Formal',
          color: '#22c55e',
          bg: 'rgba(34, 197, 94, 0.18)',
          border: 'rgba(34, 197, 94, 0.45)',
          solidBg: '#22c55e',
          solidText: '#ffffff'
        };
    }
  };

  // Combinar y consolidar todos los comités (desde comites locales, resumenData de BD y almacenamiento persistente)
  const listaComitesConsolidada = useMemo(() => {
    const comitesMap = new Map();

    try {
      if (conferencia?.id) {
        const localSaved = localStorage.getItem(`openmun_conf_comites_${conferencia.id}`);
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (Array.isArray(parsed)) {
            parsed.forEach(lc => {
              if (lc && (lc.id || lc.nombre)) {
                const idKey = lc.id || lc.nombre;
                comitesMap.set(idKey, { ...lc });
              }
            });
          }
        }
      }
    } catch (e) {}

    (comites || []).forEach(c => {
      if (c && (c.id || c.nombre)) {
        const idKey = c.id || c.nombre;
        comitesMap.set(idKey, { ...(comitesMap.get(idKey) || {}), ...c });
      }
    });

    (resumenData || []).forEach(r => {
      if (r && (r.id || r.nombre)) {
        const idKey = r.id || r.nombre;
        const existing = comitesMap.get(idKey) || {};
        comitesMap.set(idKey, {
          ...existing,
          ...r,
          id: r.id || existing.id || idKey,
          nombre: r.nombre || existing.nombre || idKey,
          pin_mesa: r.pin_mesa !== undefined ? r.pin_mesa : existing.pin_mesa,
          requierePinMesa: r.requierePinMesa !== undefined ? r.requierePinMesa : (r.pin_mesa ? true : existing.requierePinMesa),
          tipo_sesion: r.tipo_sesion || existing.tipo_sesion || 'formal',
          topico_actual: r.topico_actual || existing.topico_actual || '',
          actualizado_en: r.actualizado_en || existing.actualizado_en || '',
          datos_json: r.datos_json || existing.datos_json || {}
        });
      }
    });
    return Array.from(comitesMap.values());
  }, [comites, resumenData, conferencia?.id]);

  const comitesFiltrados = listaComitesConsolidada.filter(c =>
    c.nombre?.toLowerCase().includes(filtroComite.toLowerCase()) ||
    c.id?.toLowerCase().includes(filtroComite.toLowerCase())
  );

  // Tokens de estilo
  const bgMain = isLight ? '#f8fafc' : 'var(--bg-color)';
  const bgCard = isLight ? '#ffffff' : 'var(--panel-color)';
  const borderCol = 'var(--border-color)';
  const textMuted = 'var(--muted-text)';
  const headerBg = isLight ? '#f1f5f9' : 'var(--card-header-bg)';

  // ─────────────────────────────────────────────────────────────
  // VISTA 1: BUSCADOR SI NO HAY CONFERENCIA CARGADA
  // ─────────────────────────────────────────────────────────────
  if (!conferencia) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        backgroundColor: bgMain,
        color: 'var(--text-color)'
      }}>
        {onExit && (
          <button
            onClick={onExit}
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              background: 'transparent',
              border: `1px solid ${borderCol}`,
              borderRadius: '10px',
              color: textMuted,
              padding: '0.55rem 0.95rem',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <ArrowLeft size={16} /> {t('common.back', 'Volver')}
          </button>
        )}

        <div style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: bgCard,
          border: `1px solid ${borderCol}`,
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <OpenMunLogo height={60} isLight={isLight} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>
            {t('conferences.joinTitle', 'Unirse a una Conferencia')}
          </h2>
          <p style={{ fontSize: '0.88rem', color: textMuted, margin: '0 0 1.5rem 0' }}>
            {t('conferences.joinSubtitle', 'Introduce el código o ID de la conferencia.')}
          </p>

          {errorMsg && (
            <div style={{
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: isLight ? '#fee2e2' : 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: isLight ? '#b91c1c' : '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              fontWeight: '600'
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); cargarConferencia(confIdInput, pinAccesoInput); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                {t('conferences.confId', 'Código / ID de la Conferencia')}
              </label>
              <input
                type="text"
                required
                value={confIdInput}
                onChange={(e) => setConfIdInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="ej. hmun2026"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${borderCol}`,
                  backgroundColor: headerBg,
                  color: 'var(--text-color)',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                {t('conferences.accessPin', 'PIN de Acceso (si aplica)')}
              </label>
              <input
                type="password"
                value={pinAccesoInput}
                onChange={(e) => setPinAccesoInput(e.target.value)}
                placeholder="Opcional"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${borderCol}`,
                  backgroundColor: headerBg,
                  color: 'var(--text-color)',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.85rem',
                borderRadius: '8px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Building2 size={18} />}
              {loading ? 'Accediendo...' : t('conferences.enterConf', 'Entrar a la Conferencia')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VISTA PRINCIPAL CON 3 PESTAÑAS
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: bgMain,
        color: 'var(--text-color)',
        position: 'relative'
      }}
    >
      {/* Overlay Drag & Drop cuando se arrastra un archivo JSON sobre la conferencia */}
      {isDraggingFile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          backgroundColor: isLight ? 'rgba(241, 245, 249, 0.88)' : 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          padding: '2rem'
        }}>
          <div style={{
            border: '3px dashed #8b5cf6',
            borderRadius: '24px',
            padding: '3.5rem 2.5rem',
            backgroundColor: isLight ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            maxWidth: '560px',
            width: '90%',
            boxShadow: '0 20px 50px rgba(139, 92, 246, 0.25)',
            animation: 'pulse 2s infinite'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'
            }}>
              <Upload size={40} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>
              Suelta tu archivo JSON aquí
            </h2>
            <p style={{ fontSize: '0.95rem', color: textMuted, margin: 0, maxWidth: '420px', lineHeight: 1.5 }}>
              Se importarán automáticamente los comités, avisos y configuración de la conferencia <strong>{conferencia?.nombre || ''}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Barra Superior Central */}
      <header style={{
        padding: '0.85rem 1.5rem',
        backgroundColor: bgCard,
        borderBottom: `1px solid ${borderCol}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => {
              if (onExit) onExit();
              else setViewMode('chair');
            }}
            style={{
              background: 'transparent',
              border: `1px solid ${borderCol}`,
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              color: 'var(--text-color)',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            title="Volver al Dashboard"
          >
            <ArrowLeft size={16} /> Volver
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>
                {conferencia.nombre}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: textMuted, flexWrap: 'wrap' }}>
                <span>ID: <code>{conferencia.id}</code></span>
                <span>•</span>
                <span>{listaComitesConsolidada.length} Comités</span>
                {conferencia.email_admin && (
                  <>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#8b5cf6', fontWeight: '600' }}>
                      <Mail size={12} /> {conferencia.email_admin}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SELECTOR DE 3 PESTAÑAS */}
        <div style={{
          display: 'flex',
          backgroundColor: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '3px',
          gap: '3px'
        }}>
          <button
            onClick={() => setActiveMainTab('VER_COMITES')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeMainTab === 'VER_COMITES' ? (isLight ? '#ffffff' : '#27272a') : 'transparent',
              color: activeMainTab === 'VER_COMITES' ? '#3b82f6' : 'var(--muted-text)',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: activeMainTab === 'VER_COMITES' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={16} /> Ver Comités (Mesas)
          </button>

          <button
            onClick={() => setActiveMainTab('STAFF')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeMainTab === 'STAFF' ? (isLight ? '#ffffff' : '#27272a') : 'transparent',
              color: activeMainTab === 'STAFF' ? '#f59e0b' : 'var(--muted-text)',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: activeMainTab === 'STAFF' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={16} /> Panel Staff
          </button>

          <button
            onClick={() => setActiveMainTab('SECRETARIA')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeMainTab === 'SECRETARIA' ? (isLight ? '#ffffff' : '#27272a') : 'transparent',
              color: activeMainTab === 'SECRETARIA' ? '#8b5cf6' : 'var(--muted-text)',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: activeMainTab === 'SECRETARIA' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Shield size={16} /> Panel Organización
          </button>
        </div>

        <button
          onClick={() => {
            conferenceService.limpiarSesionActiva();
            setConferencia(null);
          }}
          style={{
            background: 'transparent',
            border: `1px solid ${borderCol}`,
            borderRadius: '8px',
            padding: '0.45rem 0.75rem',
            color: textMuted,
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Cambiar Conferencia
        </button>
      </header>

      {/* CUERPO SEGÚN PESTAÑA */}
      <main style={{ padding: '1.5rem', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>

        {/* ════════════════════════════════════════════════════════════════════════
            PESTAÑA 1: VER COMITÉS (MESAS DIRECTIVAS)
        ════════════════════════════════════════════════════════════════════════ */}
        {activeMainTab === 'VER_COMITES' && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 0.25rem 0' }}>
                  Comités de la Conferencia
                </h2>
                <p style={{ fontSize: '0.85rem', color: textMuted, margin: 0 }}>
                  Selecciona tu comité para unirte como Mesa Directiva a moderar (carga el JSON y configuración).
                </p>
              </div>

              {/* Buscador de comités */}
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
                <input
                  type="text"
                  value={filtroComite}
                  onChange={(e) => setFiltroComite(e.target.value)}
                  placeholder="Buscar comité..."
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                    borderRadius: '8px',
                    border: `1px solid ${borderCol}`,
                    backgroundColor: bgCard,
                    color: 'var(--text-color)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            {comitesFiltrados.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                backgroundColor: bgCard,
                borderRadius: '16px',
                border: `1px solid ${borderCol}`
              }}>
                <Layers size={40} style={{ color: textMuted, marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.4rem 0' }}>No se encontraron comités</h3>
                <p style={{ fontSize: '0.85rem', color: textMuted, margin: 0 }}>
                  La secretaría puede añadir nuevos comités desde la pestaña "Panel Secretaría".
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.25rem'
              }}>
                {comitesFiltrados.map((comite) => {
                  const badge = getStatusBadge(comite.tipo_sesion);
                  return (
                    <div
                      key={comite.id}
                      style={{
                        backgroundColor: bgCard,
                        border: `1.5px solid ${badge.border || borderCol}`,
                        borderRadius: '14px',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                        transition: 'transform 0.15s ease, border-color 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                          {/* Badge de Estado con colores vibrantes */}
                          <span style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            backgroundColor: badge.bg,
                            border: `1px solid ${badge.border}`,
                            color: badge.color,
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: badge.color,
                              boxShadow: `0 0 6px ${badge.color}`
                            }} />
                            {badge.label}
                          </span>

                          {comite.requierePinMesa && (
                            <span style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              backgroundColor: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.08)',
                              color: textMuted,
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <Lock size={12} /> PIN Mesa
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 0.35rem 0', color: 'var(--text-color)' }}>
                          {comite.nombre}
                        </h3>

                        {comite.topico_actual && (
                          <p style={{ fontSize: '0.82rem', color: textMuted, margin: '0 0 0.5rem 0', lineHeight: '1.4' }}>
                            <strong>Tópico Actual:</strong> {comite.topico_actual}
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => handleEntrarComoMesa(comite)}
                          style={{
                            flex: 1,
                            padding: '0.7rem',
                            borderRadius: '8px',
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: '800',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.45rem',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)'
                          }}
                        >
                          <Play size={16} /> Entrar como Mesa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PESTAÑA 2: PANEL STAFF (OPERACIONES, COMUNICACIÓN Y CHECKLIST VÍA BASE DE DATOS)
        ════════════════════════════════════════════════════════════════════════ */}
        {activeMainTab === 'STAFF' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            
            {/* Header explicativo */}
            <div style={{
              backgroundColor: bgCard,
              border: `1px solid ${borderCol}`,
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#f59e0b', marginBottom: '0.25rem' }}>
                  <Users size={22} />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>
                    Panel Staff & Logística
                  </h2>
                </div>
                <p style={{ fontSize: '0.84rem', color: textMuted, margin: 0 }}>
                  Envía solicitudes y avisos directos a Secretaría o Mesas, gestiona el checklist operativo y supervisa el estado de salas y comunicados.
                </p>
              </div>
            </div>

            {/* Grid 2 Columnas: Formulario de Mensajería + Checklist Operativo */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
              
              {/* Bloque 1: Mensajería */}
              <div style={{
                backgroundColor: bgCard,
                border: `1px solid ${borderCol}`,
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <Send size={18} color="#f59e0b" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0 }}>
                    Enviar Mensaje / Solicitud a Secretaría o Mesas
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: textMuted, margin: 0 }}>
                  Envía una solicitud o reporte para proyectarlo en el centro de avisos y paneles de la conferencia.
                </p>

                {staffFeedback && (
                  <div style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: isLight ? '#dcfce7' : 'rgba(34, 197, 94, 0.2)',
                    color: isLight ? '#15803d' : '#4ade80',
                    fontSize: '0.82rem',
                    fontWeight: '700'
                  }}>
                    {staffFeedback}
                  </div>
                )}

                <form onSubmit={handleEnviarMensajeStaff} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                      Destinatario
                    </label>
                    <select
                      value={staffDestino}
                      onChange={(e) => setStaffDestino(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        border: `1px solid ${borderCol}`,
                        backgroundColor: headerBg,
                        color: 'var(--text-color)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="SECRETARIA">🛡️ Organización</option>
                      <option value="GLOBAL">📢 Toda la Conferencia (Global)</option>
                      <option value="STAFF_ALL">👥 Todo el Staff de la Conferencia</option>
                      <optgroup label="Mesa Directiva (Chairs)">
                        {listaComitesConsolidada.map(c => (
                          <option key={`CHAIR_${c.id}`} value={c.id}>🏛️ Mesa de {c.nombre}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Staff de Sala Específico">
                        {listaComitesConsolidada.map(c => (
                          <option key={`STAFF_${c.id}`} value={`STAFF_COMITE_${c.id}`}>👥 Staff de {c.nombre}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                      Prioridad / Tipo
                    </label>
                    <select
                      value={staffPrioridad}
                      onChange={(e) => setStaffPrioridad(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        border: `1px solid ${borderCol}`,
                        backgroundColor: headerBg,
                        color: 'var(--text-color)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="info">ℹ️ Información / Petición Estándar</option>
                      <option value="alerta">⚠️ Alerta / Logística de Sala</option>
                      <option value="urgente">🚨 Urgente / Incidencia Crítica</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                      Mensaje / Requerimiento
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={staffMensaje}
                      onChange={(e) => setStaffMensaje(e.target.value)}
                      placeholder="Ej: Faltan botellas de agua en CS / Impresiones de resolución listas..."
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: `1px solid ${borderCol}`,
                        backgroundColor: headerBg,
                        color: 'var(--text-color)',
                        fontSize: '0.85rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={enviandoMensajeStaff}
                    style={{
                      padding: '0.7rem',
                      borderRadius: '8px',
                      backgroundColor: '#f59e0b',
                      color: '#000000',
                      border: 'none',
                      fontWeight: '800',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)'
                    }}
                  >
                    <Send size={16} /> {enviandoMensajeStaff ? 'Enviando...' : 'Enviar Mensaje'}
                  </button>
                </form>
              </div>

              {/* Bloque 2: Checklist Operativo de Staff */}
              <div style={{
                backgroundColor: bgCard,
                border: `1px solid ${borderCol}`,
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <ClipboardList size={18} color="#3b82f6" />
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0 }}>
                        Checklist Operativo de Sala
                      </h3>
                      <span style={{
                        fontSize: '0.66rem',
                        fontWeight: '800',
                        backgroundColor: 'rgba(234, 179, 8, 0.18)',
                        color: '#eab308',
                        border: '1px solid rgba(234, 179, 8, 0.35)',
                        padding: '0.12rem 0.45rem',
                        borderRadius: '6px',
                        letterSpacing: '0.04em'
                      }}>
                        🚧 WORK IN PROGRESS
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: textMuted }}>
                      {checklistStaff.filter(i => i.done).length} de {checklistStaff.length} listos
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: textMuted, margin: '0 0 1rem 0' }}>
                    Lista de comprobaciones rápidas para el staff de logística en la sede (guardado en este navegador).
                  </p>

                  {/* Form añadir tarea */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!nuevaTareaStaff.trim()) return;
                      setChecklistStaff(prev => [
                        ...prev,
                        { id: `c_${Date.now()}`, text: nuevaTareaStaff.trim(), done: false }
                      ]);
                      setNuevaTareaStaff('');
                    }}
                    style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}
                  >
                    <input
                      type="text"
                      value={nuevaTareaStaff}
                      onChange={(e) => setNuevaTareaStaff(e.target.value)}
                      placeholder="Añadir tarea operativa..."
                      style={{
                        flex: 1,
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: `1px solid ${borderCol}`,
                        backgroundColor: headerBg,
                        color: 'var(--text-color)',
                        fontSize: '0.85rem'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '0.55rem 0.9rem',
                        borderRadius: '8px',
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: '700',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Plus size={15} /> Añadir
                    </button>
                  </form>

                  {/* Lista de tareas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                    {checklistStaff.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setChecklistStaff(prev =>
                            prev.map(i => i.id === task.id ? { ...i, done: !i.done } : i)
                          );
                        }}
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          backgroundColor: headerBg,
                          border: `1px solid ${task.done ? 'rgba(34, 197, 94, 0.4)' : borderCol}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.6rem',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, overflow: 'hidden' }}>
                          {task.done ? (
                            <CheckSquare size={17} color="#22c55e" style={{ flexShrink: 0 }} />
                          ) : (
                            <Square size={17} color="var(--muted-text)" style={{ flexShrink: 0 }} />
                          )}
                          <span style={{
                            fontSize: '0.85rem',
                            color: task.done ? 'var(--muted-text)' : 'var(--text-color)',
                            textDecoration: task.done ? 'line-through' : 'none'
                          }}>
                            {task.text}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setChecklistStaff(prev => prev.filter(i => i.id !== task.id));
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0.2rem',
                            opacity: 0.7
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: `1px solid ${borderCol}` }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('¿Deseas reiniciar todas las casillas del checklist?')) {
                        setChecklistStaff(prev => prev.map(i => ({ ...i, done: false })));
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: textMuted,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Restablecer casillas
                  </button>
                </div>
              </div>

            </div>

            {/* Bloque 3: Buzón de Avisos y Comunicados Recibidos para Staff */}
            <div style={{
              backgroundColor: bgCard,
              border: `1px solid ${borderCol}`,
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Megaphone size={18} color="#f59e0b" /> Buzón de Avisos y Comunicados Recibidos ({avisosActivos.filter(a => correspondeAviso(a, { role: 'staff' })).length})
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: textMuted, margin: 0 }}>
                    Visualiza todos los avisos y comunicados oficiales emitidos por la Organización, Mesas y Staff.
                  </p>
                </div>

                <button
                  onClick={fetchAvisos}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${borderCol}`,
                    color: 'var(--text-color)',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <RefreshCw size={13} /> Actualizar Avisos
                </button>
              </div>

              {avisosActivos.filter(a => correspondeAviso(a, { role: 'staff' })).length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2.5rem 1rem',
                  backgroundColor: headerBg,
                  borderRadius: '12px',
                  border: `1px dashed ${borderCol}`,
                  color: textMuted
                }}>
                  <Megaphone size={32} style={{ opacity: 0.35, marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>No hay avisos ni comunicados para Staff</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                    Los avisos oficiales dirigidos al staff o globales aparecerán aquí.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {avisosActivos.filter(a => correspondeAviso(a, { role: 'staff' })).map((av) => (
                    <div
                      key={av.id}
                      style={{
                        backgroundColor: headerBg,
                        border: `1px solid ${borderCol}`,
                        borderLeft: `4px solid ${av.tipo === 'urgente' ? '#ef4444' : av.tipo === 'alerta' ? '#f59e0b' : '#3b82f6'}`,
                        borderRadius: '10px',
                        padding: '0.9rem 1.15rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: '800',
                            backgroundColor: av.tipo === 'urgente' ? '#ef4444' : (av.tipo === 'alerta' ? '#f59e0b' : '#3b82f6'),
                            color: '#ffffff',
                            padding: '0.12rem 0.45rem',
                            borderRadius: '4px',
                            textTransform: 'uppercase'
                          }}>
                            {av.emisor}
                          </span>

                          <span style={{ fontSize: '0.78rem', color: textMuted, fontWeight: '600' }}>
                            Destino: <strong style={{ color: 'var(--text-color)' }}>
                              {getNombreDestino(av.comite_id)}
                            </strong>
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontSize: '0.72rem', color: textMuted }}>
                            {av.creado_en || ''}
                          </span>
                          <button
                            onClick={() => handleDesactivarAviso(av.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Descartar
                          </button>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.88rem', color: 'var(--text-color)', lineHeight: '1.4' }}>
                        {formatearMensajeAviso(av.mensaje)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bloque 3: Estado de Comités en Tiempo Real (Base de Datos) */}
            <div style={{
              backgroundColor: bgCard,
              border: `1px solid ${borderCol}`,
              borderRadius: '16px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={18} color="#3b82f6" /> Estado de Salas y Comités (Base de Datos Central)
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: textMuted, margin: 0 }}>
                    Monitoreo en vivo de los estados de debate y temas activos en toda la conferencia.
                  </p>
                </div>

                <button
                  onClick={fetchResumen}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${borderCol}`,
                    color: 'var(--text-color)',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <RefreshCw size={13} /> Refrescar Estados
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem'
              }}>
                {listaComitesConsolidada.map((comite) => {
                  const badge = getStatusBadge(comite.tipo_sesion);
                  return (
                    <div
                      key={comite.id}
                      style={{
                        backgroundColor: headerBg,
                        border: `1px solid ${badge.border || borderCol}`,
                        borderRadius: '12px',
                        padding: '1rem 1.15rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <strong style={{ fontSize: '0.98rem', color: 'var(--text-color)' }}>
                            {comite.nombre}
                          </strong>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: badge.bg,
                            border: `1px solid ${badge.border}`,
                            color: badge.color,
                            fontSize: '0.72rem',
                            fontWeight: '800'
                          }}>
                            {badge.label}
                          </span>
                        </div>

                        {comite.topico_actual && (
                          <p style={{ fontSize: '0.8rem', color: textMuted, margin: '0 0 0.35rem 0', lineHeight: '1.3' }}>
                            <strong>Tópico:</strong> {comite.topico_actual}
                          </p>
                        )}
                      </div>

                      {comite.actualizado_en && (
                        <span style={{ fontSize: '0.72rem', color: textMuted, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> Actividad: {comite.actualizado_en}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            PESTAÑA 3: PANEL SECRETARÍA (LOGÍSTICA, GESTIÓN DE COMITÉS, WIDGETS Y AVISOS)
        ════════════════════════════════════════════════════════════════════════ */}
        {activeMainTab === 'SECRETARIA' && (
          <div>
            {!isAdminAuthenticated ? (
              <div style={{
                maxWidth: '420px',
                margin: '3rem auto',
                backgroundColor: bgCard,
                border: `1px solid ${borderCol}`,
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  color: '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <Shield size={28} />
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 0.4rem 0' }}>
                  Acceso a Organización
                </h2>
                <p style={{ fontSize: '0.85rem', color: textMuted, margin: '0 0 1.25rem 0' }}>
                  Introduce el PIN de Organización configurado al crear la conferencia.
                </p>

                {errorMsg && (
                  <div style={{
                    padding: '0.65rem',
                    borderRadius: '8px',
                    backgroundColor: isLight ? '#fee2e2' : 'rgba(239, 68, 68, 0.15)',
                    color: isLight ? '#b91c1c' : '#fca5a5',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                    fontWeight: '600'
                  }}>
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ position: 'relative', textAlign: 'left' }}>
                    <input
                      type={mostrarAdminPin ? 'text' : 'password'}
                      required
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      placeholder="PIN de Organización"
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.5rem 0.75rem 0.85rem',
                        borderRadius: '8px',
                        border: `1px solid ${borderCol}`,
                        backgroundColor: headerBg,
                        color: 'var(--text-color)',
                        fontSize: '0.9rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarAdminPin(!mostrarAdminPin)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: textMuted,
                        cursor: 'pointer'
                      }}
                    >
                      {mostrarAdminPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#8b5cf6',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem'
                    }}
                  >
                    <Shield size={16} /> Entrar a Organización
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* BARRA SUPERIOR DE RESPALDOS JSON (EXPORTAR / IMPORTAR 3 TABLAS DE BD) */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  style={{
                    backgroundColor: isLight ? '#f8fafc' : 'var(--card-header-bg)',
                    border: `1.5px dashed ${isDraggingFile ? '#8b5cf6' : borderCol}`,
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    boxShadow: isDraggingFile ? '0 0 20px rgba(139, 92, 246, 0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: isLight ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.25)',
                      color: '#8b5cf6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Database size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>
                        Copia de Seguridad de la Conferencia (3 Tablas Base de Datos)
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: textMuted, margin: 0 }}>
                        Exporta o importa (arrastrando o seleccionando) el archivo JSON con Conferencias, Comités y Avisos.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleExportarConferenciaJSON}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 1.15rem',
                        borderRadius: '10px',
                        backgroundColor: isLight ? '#10b981' : '#059669',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.88rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <Download size={16} /> Exportar Archivo JSON (3 Tablas)
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json,application/json"
                      style={{ display: 'none' }}
                      onChange={handleImportarConferenciaJSON}
                    />

                    <button
                      type="button"
                      disabled={importandoJSON}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 1.15rem',
                        borderRadius: '10px',
                        backgroundColor: isLight ? '#ffffff' : bgCard,
                        border: `1px solid ${borderCol}`,
                        color: 'var(--text-color)',
                        fontSize: '0.88rem',
                        fontWeight: '800',
                        cursor: importandoJSON ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        opacity: importandoJSON ? 0.6 : 1
                      }}
                    >
                      <Upload size={16} color="#8b5cf6" />
                      {importandoJSON ? 'Importando JSON...' : 'Importar Archivo JSON'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAdminAuthenticated(false);
                        setAdminPinInput('');
                        setConfPinAdminActual('');
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.65rem 1rem',
                        borderRadius: '10px',
                        backgroundColor: isLight ? '#fee2e2' : 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: '#ef4444',
                        fontSize: '0.88rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title="Bloquear acceso al panel de organización y requerir PIN de nuevo"
                    >
                      <Lock size={15} /> Bloquear
                    </button>
                  </div>
                </div>

                {/* 1. SECCIÓN: CONFIGURACIÓN INTEGRAL DE CONFERENCIA Y SECRETARÍA (PATCH /api/conferencias/:id) */}
                <div style={{
                  backgroundColor: bgCard,
                  border: `1px solid ${borderCol}`,
                  borderRadius: '16px',
                  padding: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Settings size={20} color="#8b5cf6" /> Configuración General de la Conferencia (Base de Datos)
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: textMuted, margin: 0 }}>
                        Gestiona los datos centrales, correo de contacto, PIN de delegados y credenciales de Secretaría.
                      </p>
                    </div>

                    {/* Badges de estado actual */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {conferencia.email_admin ? (
                        <span style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          backgroundColor: isLight ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.2)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          color: '#8b5cf6',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}>
                          <Mail size={14} /> Correo: <strong>{conferencia.email_admin}</strong>
                        </span>
                      ) : (
                        <span style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          backgroundColor: isLight ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.2)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#f59e0b',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}>
                          <AlertTriangle size={14} /> Sin correo registrado
                        </span>
                      )}

                      {conferencia.requierePin ? (
                        <span style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          backgroundColor: isLight ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#3b82f6',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}>
                          <Lock size={14} /> Delegados con PIN
                        </span>
                      ) : (
                        <span style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          backgroundColor: isLight ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          color: isLight ? '#15803d' : '#4ade80',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}>
                          <Globe size={14} /> Acceso Público
                        </span>
                      )}
                    </div>
                  </div>

                  {confSettingsFeedback && (
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: confSettingsFeedback.type === 'success' 
                        ? (isLight ? '#dcfce7' : 'rgba(34, 197, 94, 0.2)')
                        : (isLight ? '#fee2e2' : 'rgba(239, 68, 68, 0.2)'),
                      border: `1px solid ${confSettingsFeedback.type === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                      color: confSettingsFeedback.type === 'success' ? (isLight ? '#15803d' : '#4ade80') : (isLight ? '#b91c1c' : '#fca5a5'),
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {confSettingsFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {confSettingsFeedback.text}
                    </div>
                  )}

                  <form onSubmit={handleGuardarConfiguracionConferencia} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '1.25rem'
                    }}>
                      {/* 1. Nombre de la Conferencia */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                          Nombre de la Conferencia
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            value={confNombreInput}
                            onChange={(e) => setConfNombreInput(e.target.value)}
                            placeholder="ej. Harvard National MUN 2026"
                            style={{
                              width: '100%',
                              padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                              borderRadius: '8px',
                              border: `1px solid ${borderCol}`,
                              backgroundColor: headerBg,
                              color: 'var(--text-color)',
                              fontSize: '0.9rem'
                            }}
                          />
                          <Building2
                            size={16}
                            style={{
                              position: 'absolute',
                              left: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: textMuted
                            }}
                          />
                        </div>
                      </div>

                      {/* 2. Correo de Secretaría */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                          Correo Electrónico de Secretaría (Admin)
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="email"
                            value={confEmailAdminInput}
                            onChange={(e) => setConfEmailAdminInput(e.target.value)}
                            placeholder="ej. secretaria.general@hmun.org"
                            style={{
                              width: '100%',
                              padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                              borderRadius: '8px',
                              border: `1px solid ${borderCol}`,
                              backgroundColor: headerBg,
                              color: 'var(--text-color)',
                              fontSize: '0.9rem'
                            }}
                          />
                          <Mail
                            size={16}
                            style={{
                              position: 'absolute',
                              left: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: textMuted
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.74rem', color: textMuted, marginTop: '0.25rem', display: 'block' }}>
                          {conferencia.email_admin
                            ? `Correo actual en BD: ${conferencia.email_admin}`
                            : 'Introduce un correo para registrarlo en la base de datos.'}
                        </span>
                      </div>

                      {/* 3. PIN de Acceso General / Delegados */}
                      <div style={{
                        padding: '0.85rem',
                        borderRadius: '10px',
                        backgroundColor: headerBg,
                        border: `1px solid ${borderCol}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}>
                          <input
                            type="checkbox"
                            checked={cambiarPinAcceso}
                            onChange={(e) => setCambiarPinAcceso(e.target.checked)}
                          />
                          Proteger acceso a delegados con PIN
                        </label>

                        {cambiarPinAcceso && (
                          <div style={{ position: 'relative' }}>
                            <input
                              type={mostrarConfPinAcceso ? 'text' : 'password'}
                              value={confPinAccesoInput}
                              onChange={(e) => setConfPinAccesoInput(e.target.value)}
                              placeholder="Nuevo PIN de acceso para delegados"
                              style={{
                                width: '100%',
                                padding: '0.55rem 2.5rem 0.55rem 0.75rem',
                                borderRadius: '6px',
                                border: `1px solid ${borderCol}`,
                                backgroundColor: bgCard,
                                color: 'var(--text-color)',
                                fontSize: '0.85rem'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setMostrarConfPinAcceso(!mostrarConfPinAcceso)}
                              style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                color: textMuted,
                                cursor: 'pointer'
                              }}
                            >
                              {mostrarConfPinAcceso ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 4. Cambiar Contraseña / PIN de Secretaría (Admin) */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                          Cambiar PIN / Contraseña de Secretaría
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={mostrarConfNuevoPin ? 'text' : 'password'}
                            value={confNuevoPinAdmin}
                            onChange={(e) => setConfNuevoPinAdmin(e.target.value)}
                            placeholder="Dejar vacío para no cambiar"
                            style={{
                              width: '100%',
                              padding: '0.65rem 2.5rem 0.65rem 2.4rem',
                              borderRadius: '8px',
                              border: `1px solid ${borderCol}`,
                              backgroundColor: headerBg,
                              color: 'var(--text-color)',
                              fontSize: '0.9rem'
                            }}
                          />
                          <Key
                            size={16}
                            style={{
                              position: 'absolute',
                              left: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: textMuted
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarConfNuevoPin(!mostrarConfNuevoPin)}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'transparent',
                              border: 'none',
                              color: textMuted,
                              cursor: 'pointer'
                            }}
                          >
                            {mostrarConfNuevoPin ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: textMuted, marginTop: '0.25rem', display: 'block' }}>
                          Solo introduce un valor si deseas asignar una nueva clave de acceso de secretaría.
                        </span>
                      </div>
                    </div>

                    {/* Bloque de Autorización con PIN Actual y Botón Guardar */}
                    <div style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      backgroundColor: isLight ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      marginTop: '0.5rem'
                    }}>
                      <div style={{ flex: 1, minWidth: '240px' }}>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', marginBottom: '0.35rem', color: '#8b5cf6' }}>
                          PIN de Secretaría Actual (Autorización Obligatoria) *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={mostrarConfPinActual ? 'text' : 'password'}
                            required
                            value={confPinAdminActual}
                            onChange={(e) => setConfPinAdminActual(e.target.value)}
                            placeholder="PIN de Secretaría Actual"
                            style={{
                              width: '100%',
                              padding: '0.6rem 2.5rem 0.6rem 2.2rem',
                              borderRadius: '8px',
                              border: `1px solid ${borderCol}`,
                              backgroundColor: bgCard,
                              color: 'var(--text-color)',
                              fontSize: '0.9rem'
                            }}
                          />
                          <Shield
                            size={15}
                            style={{
                              position: 'absolute',
                              left: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#8b5cf6'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarConfPinActual(!mostrarConfPinActual)}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'transparent',
                              border: 'none',
                              color: textMuted,
                              cursor: 'pointer'
                            }}
                          >
                            {mostrarConfPinActual ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={guardandoConfSettings}
                        style={{
                          padding: '0.75rem 1.5rem',
                          borderRadius: '10px',
                          backgroundColor: '#8b5cf6',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: '800',
                          fontSize: '0.92rem',
                          cursor: guardandoConfSettings ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
                          opacity: guardandoConfSettings ? 0.7 : 1,
                          alignSelf: 'flex-end'
                        }}
                      >
                        <Check size={18} />
                        {guardandoConfSettings ? 'Guardando en BD...' : 'Guardar Configuración en BD'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. SECCIÓN: GESTIÓN Y CONFIGURACIÓN DE COMITÉS (AGENDA, PAÍSES, MATRIZ) */}
                <div style={{
                  backgroundColor: bgCard,
                  border: `1px solid ${borderCol}`,
                  borderRadius: '16px',
                  padding: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={20} color="#8b5cf6" /> Gestión de Comités & Configuración de Widgets
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: textMuted, margin: 0 }}>
                        Añade o elimina comités y configura para cada uno su Matriz de Países, Importador y Agenda.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportarConferenciaJSON}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.5rem 0.95rem',
                        borderRadius: '8px',
                        backgroundColor: isLight ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        color: isLight ? '#15803d' : '#4ade80',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      <Download size={14} /> Exportar JSON Completo
                    </button>
                  </div>

                  {/* Formulario Añadir Comité / Importar Comité Individual */}
                  <input
                    type="file"
                    ref={singleComiteFileInputRef}
                    accept=".json,application/json"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) procesarArchivoConferenciaJSON(f, true);
                    }}
                  />

                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const files = e.dataTransfer?.files;
                      if (files && files.length > 0) {
                        procesarArchivoConferenciaJSON(files[0], true);
                      }
                    }}
                    style={{
                      marginBottom: '1.5rem',
                      padding: '1.1rem',
                      backgroundColor: headerBg,
                      borderRadius: '14px',
                      border: `1.5px dashed ${borderCol}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-color)' }}>
                        ➕ Añadir nuevo comité manual o importar desde archivo .JSON:
                      </span>
                      <span style={{ fontSize: '0.74rem', color: textMuted }}>
                        (Puedes importar el <code>sesion_activa.json</code> exportado desde un comité)
                      </span>
                    </div>

                    <form onSubmit={handleCrearComite} style={{
                      display: 'flex',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                      alignItems: 'center'
                    }}>
                      <input
                        type="text"
                        required
                        value={nuevoNombreComite}
                        onChange={(e) => setNuevoNombreComite(e.target.value)}
                        placeholder="Nombre del nuevo comité (ej. ACNUR)"
                        style={{
                          flex: 2,
                          minWidth: '200px',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: `1px solid ${borderCol}`,
                          backgroundColor: bgCard,
                          color: 'var(--text-color)',
                          fontSize: '0.88rem'
                        }}
                      />
                      <input
                        type="text"
                        value={nuevoPinMesa}
                        onChange={(e) => setNuevoPinMesa(e.target.value)}
                        placeholder="PIN Mesa Directiva (opcional)"
                        style={{
                          flex: 1,
                          minWidth: '160px',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: `1px solid ${borderCol}`,
                          backgroundColor: bgCard,
                          color: 'var(--text-color)',
                          fontSize: '0.88rem'
                        }}
                      />
                      <button
                        type="submit"
                        disabled={creandoComite}
                        style={{
                          padding: '0.65rem 1.15rem',
                          borderRadius: '8px',
                          backgroundColor: '#8b5cf6',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: '800',
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 2px 6px rgba(139, 92, 246, 0.25)'
                        }}
                      >
                        <Plus size={16} /> {creandoComite ? 'Creando...' : 'Crear Comité'}
                      </button>

                      <button
                        type="button"
                        disabled={importandoJSON}
                        onClick={() => singleComiteFileInputRef.current?.click()}
                        style={{
                          padding: '0.65rem 1.15rem',
                          borderRadius: '8px',
                          backgroundColor: isLight ? '#ffffff' : bgCard,
                          border: '1.5px dashed #8b5cf6',
                          color: '#8b5cf6',
                          fontWeight: '800',
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          boxShadow: '0 2px 6px rgba(139, 92, 246, 0.12)',
                          transition: 'all 0.15s ease'
                        }}
                        title="Importar un comité individual desde un archivo .JSON (sesion_activa.json o backup de comité)"
                      >
                        <Upload size={16} /> Importar Comité (.JSON)
                      </button>
                    </form>
                  </div>

                  {/* Lista de comités con botón para configurar widgets */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {listaComitesConsolidada.map((comite) => {
                      const badge = getStatusBadge(comite.tipo_sesion);
                      return (
                        <div
                          key={comite.id}
                          style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '12px',
                            border: `1px solid ${borderCol}`,
                            backgroundColor: headerBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '1rem'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                              <strong style={{ fontSize: '1rem', color: 'var(--text-color)' }}>{comite.nombre}</strong>
                              <span style={{
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                backgroundColor: badge.bg,
                                color: badge.color,
                                fontSize: '0.7rem',
                                fontWeight: '800'
                              }}>
                                {badge.label}
                              </span>
                              <code style={{ fontSize: '0.75rem', color: textMuted }}>ID: {comite.id}</code>
                            </div>
                            {comite.topico_actual && (
                              <span style={{ fontSize: '0.8rem', color: textMuted }}>
                                Tema: {comite.topico_actual}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <button
                              onClick={() => handleAbrirEditorComite(comite)}
                              style={{
                                padding: '0.5rem 0.95rem',
                                borderRadius: '8px',
                                backgroundColor: '#8b5cf6',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '0.82rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                boxShadow: '0 2px 6px rgba(139, 92, 246, 0.25)'
                              }}
                            >
                              <Settings size={14} /> Gestionar Comité (Agenda, Países, Matriz)
                            </button>

                            <button
                              onClick={() => handleEliminarComite(comite.id)}
                              style={{
                                padding: '0.5rem',
                                borderRadius: '8px',
                                backgroundColor: isLight ? '#fee2e2' : 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Eliminar comité"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. SECCIÓN: CENTRO DE EMISIÓN DE AVISOS (BASE DE DATOS) */}
                <div style={{
                  backgroundColor: bgCard,
                  border: `1px solid ${borderCol}`,
                  borderRadius: '16px',
                  padding: '1.5rem'
                }}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Megaphone size={20} color="#3b82f6" /> Centro de Avisos & Comunicados Oficiales
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: textMuted, margin: 0 }}>
                      Emite notificaciones a toda la conferencia, al staff o a salas específicas persistidas en base de datos.
                    </p>
                  </div>

                  {avisoFeedback && (
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: isLight ? '#dcfce7' : 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      color: isLight ? '#15803d' : '#4ade80',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      marginBottom: '1rem'
                    }}>
                      {avisoFeedback}
                    </div>
                  )}

                  <form onSubmit={handleEmitirAviso} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>Destinatario</label>
                        <select
                          value={avisoDestino}
                          onChange={(e) => setAvisoDestino(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.55rem',
                            borderRadius: '8px',
                            border: `1px solid ${borderCol}`,
                            backgroundColor: headerBg,
                            color: 'var(--text-color)',
                            fontSize: '0.85rem'
                          }}
                        >
                          <option value="">📢 Toda la Conferencia (Global)</option>
                          <option value="STAFF">👥 Todo el Staff de la Conferencia</option>
                          <optgroup label="Comités Específicos">
                            {listaComitesConsolidada.map(c => (
                              <option key={c.id} value={c.id}>🏛️ {c.nombre}</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>Emisor</label>
                        <select
                          value={avisoEmisor}
                          onChange={(e) => setAvisoEmisor(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.55rem',
                            borderRadius: '8px',
                            border: `1px solid ${borderCol}`,
                            backgroundColor: headerBg,
                            color: 'var(--text-color)',
                            fontSize: '0.85rem'
                          }}
                        >
                          <option value="organizacion">Secretaría / Organización</option>
                          <option value="staff">Staff de Sala</option>
                          <option value="logistica">Logística</option>
                          <option value="mesa">Mesa Directiva</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>Prioridad</label>
                        <select
                          value={avisoTipo}
                          onChange={(e) => setAvisoTipo(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.55rem',
                            borderRadius: '8px',
                            border: `1px solid ${borderCol}`,
                            backgroundColor: headerBg,
                            color: 'var(--text-color)',
                            fontSize: '0.85rem'
                          }}
                        >
                          <option value="info">ℹ️ Información</option>
                          <option value="urgente">🚨 Urgente</option>
                          <option value="alerta">⚠️ Alerta / Logística</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>Mensaje del Comunicado</label>
                      <textarea
                        required
                        rows={2}
                        value={avisoMensaje}
                        onChange={(e) => setAvisoMensaje(e.target.value)}
                        placeholder="Escribe el aviso que se mostrará en los proyectores y pantallas..."
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: `1px solid ${borderCol}`,
                          backgroundColor: headerBg,
                          color: 'var(--text-color)',
                          fontSize: '0.88rem',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={enviandoAviso}
                      style={{
                        alignSelf: 'flex-start',
                        padding: '0.65rem 1.25rem',
                        borderRadius: '8px',
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: '800',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Send size={15} /> {enviandoAviso ? 'Emitiendo...' : 'Emitir Comunicado'}
                    </button>
                  </form>

                  {/* Avisos Activos */}
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.65rem' }}>
                      Avisos Activos en el Sistema ({avisosActivos.length})
                    </h4>

                    {avisosActivos.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: textMuted, margin: 0 }}>No hay avisos activos en este momento.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {avisosActivos.map((av) => (
                          <div
                            key={av.id}
                            style={{
                              padding: '0.85rem 1.1rem',
                              borderRadius: '10px',
                              backgroundColor: headerBg,
                              border: `1px solid ${borderCol}`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.45rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '4px',
                                  backgroundColor: av.tipo === 'urgente' ? '#ef4444' : (av.tipo === 'alerta' ? '#f59e0b' : '#3b82f6'),
                                  color: '#ffffff',
                                  fontSize: '0.68rem',
                                  fontWeight: '800',
                                  textTransform: 'uppercase'
                                }}>
                                  {av.emisor}
                                </span>
                                <span style={{ fontSize: '0.76rem', color: textMuted, fontWeight: '600' }}>
                                  Destino: <strong style={{ color: 'var(--text-color)' }}>{getNombreDestino(av.comite_id)}</strong>
                                </span>
                                {av.creado_en && (
                                  <span style={{ fontSize: '0.7rem', color: textMuted }}>
                                    • {av.creado_en}
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => handleDesactivarAviso(av.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ef4444',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  padding: '0.2rem 0.4rem'
                                }}
                              >
                                Descartar
                              </button>
                            </div>

                            <div style={{ fontSize: '0.86rem', color: 'var(--text-color)', lineHeight: '1.4' }}>
                              {formatearMensajeAviso(av.mensaje)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL DE CONFIGURACIÓN INTEGRAL DE COMITÉ (AGENDA, IMPORTAR, MATRIZ)
      ════════════════════════════════════════════════════════════════════════ */}
      {comiteEnEdicion && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: bgCard,
            border: `1px solid ${borderCol}`,
            borderRadius: '16px',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          }}>
            {/* Header Modal Editor */}
            <div style={{
              padding: '1.15rem 1.5rem',
              borderBottom: `1px solid ${borderCol}`,
              backgroundColor: headerBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>
                  Configuración de Comité: {comiteEnEdicion.nombre}
                </h3>
                <span style={{ fontSize: '0.75rem', color: textMuted }}>
                  Modifica los países, agenda y asistencia para este comité desde Secretaría.
                </span>
              </div>

              {/* Botón Guardar Cambios en Servidor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  onClick={handleGuardarCambiosComite}
                  disabled={guardandoComite}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: '#22c55e',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                  }}
                >
                  <Check size={16} /> {guardandoComite ? 'Guardando...' : 'Guardar Cambios en Servidor'}
                </button>

                <button
                  onClick={handleCerrarEditorComite}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: textMuted,
                    cursor: 'pointer',
                    padding: '0.35rem'
                  }}
                  title="Guardar y cerrar"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {guardadoFeedback && (
              <div style={{
                padding: '0.65rem 1.25rem',
                backgroundColor: isLight ? '#dcfce7' : 'rgba(34, 197, 94, 0.2)',
                color: isLight ? '#15803d' : '#4ade80',
                fontSize: '0.82rem',
                fontWeight: '700'
              }}>
                {guardadoFeedback}
              </div>
            )}

            {/* Pestañas de Widgets: Agenda, Importar, Matriz */}
            <div style={{
              display: 'flex',
              padding: '0.6rem 1.5rem',
              backgroundColor: bgCard,
              borderBottom: `1px solid ${borderCol}`,
              gap: '0.5rem'
            }}>
              <button
                onClick={() => setSecretariaWidgetTab('AGENDA')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: secretariaWidgetTab === 'AGENDA' ? (isLight ? '#ede9fe' : 'rgba(139, 92, 246, 0.2)') : 'transparent',
                  color: secretariaWidgetTab === 'AGENDA' ? '#8b5cf6' : textMuted,
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Globe size={15} /> Comité y Agenda
              </button>

              <button
                onClick={() => setSecretariaWidgetTab('IMPORTAR')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: secretariaWidgetTab === 'IMPORTAR' ? (isLight ? '#ede9fe' : 'rgba(139, 92, 246, 0.2)') : 'transparent',
                  color: secretariaWidgetTab === 'IMPORTAR' ? '#8b5cf6' : textMuted,
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <FileSpreadsheet size={15} /> Importar Países
              </button>

              <button
                onClick={() => setSecretariaWidgetTab('MATRIZ')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: secretariaWidgetTab === 'MATRIZ' ? (isLight ? '#ede9fe' : 'rgba(139, 92, 246, 0.2)') : 'transparent',
                  color: secretariaWidgetTab === 'MATRIZ' ? '#8b5cf6' : textMuted,
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <UserCheck size={15} /> Matriz de Países
              </button>
            </div>

            {/* Contenedor del Widget Activo */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Cargando widget...</div>}>
                {secretariaWidgetTab === 'AGENDA' && <EstablecerAgenda />}
                {secretariaWidgetTab === 'IMPORTAR' && <ImportarPaises />}
                {secretariaWidgetTab === 'MATRIZ' && <MatrizPaises />}
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Modal PIN de Mesa Directiva al entrar */}
      {comiteSeleccionado && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: bgCard,
            border: `1px solid ${borderCol}`,
            borderRadius: '16px',
            padding: '1.75rem',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <Lock size={24} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 0.35rem 0' }}>
              PIN de Mesa Directiva
            </h3>
            <p style={{ fontSize: '0.85rem', color: textMuted, margin: '0 0 1.25rem 0' }}>
              Introduce el PIN para moderar {comiteSeleccionado.nombre}
            </p>

            {pinMesaError && (
              <div style={{
                padding: '0.55rem',
                borderRadius: '6px',
                backgroundColor: isLight ? '#fee2e2' : 'rgba(239, 68, 68, 0.15)',
                color: isLight ? '#b91c1c' : '#fca5a5',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                fontWeight: '600'
              }}>
                {pinMesaError}
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              ejecutarEntradaMesa(comiteSeleccionado, pinMesaInput);
            }}>
              <input
                type="password"
                required
                autoFocus
                value={pinMesaInput}
                onChange={(e) => setPinMesaInput(e.target.value)}
                placeholder="PIN de la Mesa"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '8px',
                  border: `1px solid ${borderCol}`,
                  backgroundColor: headerBg,
                  color: 'var(--text-color)',
                  fontSize: '0.9rem',
                  marginBottom: '1rem'
                }}
              />

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setComiteSeleccionado(null)}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    border: `1px solid ${borderCol}`,
                    color: 'var(--text-color)',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Verificando...' : 'Entrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConferenceView;
