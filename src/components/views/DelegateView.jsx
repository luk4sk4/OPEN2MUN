import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  Send, 
  Mic, 
  Clock, 
  MessageSquare, 
  FileText, 
  LogOut, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Inbox,
  PenTool,
  HelpCircle,
  Vote,
  Zap,
  CheckCircle2,
  Lock,
  X,
  Check,
  AlertCircle,
  Eye,
  Sun,
  Moon,
  Search,
  Globe,
  RefreshCw,
  UserCheck,
  UserX,
  ChevronRight
} from 'lucide-react';
import CountryFlag from '../common/CountryFlag';
import { useTranslation } from 'react-i18next';
import { getFlagEmoji } from '../../utils/flags';
import { useP2P } from '../../context/P2PContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import AccessibilityModal from '../modals/AccessibilityModal';
import OpenMunLogo from '../common/OpenMunLogo';
import LanguageSelector from '../common/LanguageSelector';

const DelegateView = ({ isLight: propIsLight, onExit }) => {
  const { t } = useTranslation();
  const { isLight: contextIsLight, toggleThemeMode } = useAccessibility();
  const isLight = propIsLight !== undefined ? propIsLight : contextIsLight;
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  const {
    clientCountry,
    roomId,
    connectionStatus,
    notes,
    sendNote,
    requestSpeaking,
    remoteSessionState,
    roomSettings,
    castVote,
    submitAmendment,
    leaveRoom,
    selectCountry,
    resetCountrySelection,
    connectedPeers
  } = useP2P();

  // Estados para Selección de País / Delegación inicial
  const [busquedaPais, setBusquedaPais] = useState('');
  const [paisSeleccionadoTemp, setPaisSeleccionadoTemp] = useState('');
  const [paisPersonalizadoInput, setPaisPersonalizadoInput] = useState('');
  const [isSubmittingCountry, setIsSubmittingCountry] = useState(false);
  const [countrySelectError, setCountrySelectError] = useState(null);

  const [activeTab, setActiveTab] = useState('DEBATE'); // 'DEBATE' | 'NOTAS' | 'ENMIENDAS'
  const [destinatario, setDestinatario] = useState('CHAIR');
  const [textoNota, setTextoNota] = useState('');
  const [tipoNota, setTipoNota] = useState('general'); // 'general' | 'urgente' | 'pregunta'
  const [pedirMocionOpen, setPedirMocionOpen] = useState(false);
  const [tipoMocion, setTipoMocion] = useState('Caucus Moderado');
  const [temaMocion, setTemaMocion] = useState('');
  const [tiempoTotalMocion, setTiempoTotalMocion] = useState(600);
  const [tiempoOradorMocion, setTiempoOradorMocion] = useState(45);
  const [solicitudGSLHecha, setSolicitudGSLHecha] = useState(false);
  const [solicitudCaucusHecha, setSolicitudCaucusHecha] = useState(false);
  const [subTabNotas, setSubTabNotas] = useState('BUZON'); // 'BUZON' | 'REDACTAR'
  const [miVotoEmitido, setMiVotoEmitido] = useState(null);

  // Estados de Enmiendas de Delegados
  const [tipoEnmiendaDel, setTipoEnmiendaDel] = useState('modificacion');
  const [artIdDel, setArtIdDel] = useState('');
  const [textoOriginalDel, setTextoOriginalDel] = useState('');
  const [textoPropuestoDel, setTextoPropuestoDel] = useState('');
  const [justificacionDel, setJustificacionDel] = useState('');
  const [enmiendaEnviadaFeedback, setEnmiendaEnviadaFeedback] = useState(false);
  const [misEnmiendasEnviadas, setMisEnmiendasEnviadas] = useState([]);

  // Estado sincronizado desde el Chair
  const state = remoteSessionState || {};
  const settings = roomSettings || {};
  const oradoresCola = state.oradoresCola || [];
  const oradoresCaucus = state.oradoresCaucus || [];
  const votacionSesion = state.votacionSesion || {};

  const estaEnGSL = oradoresCola.some(o => (typeof o === 'string' ? o : o.nombre)?.toLowerCase() === clientCountry?.toLowerCase());
  const estaEnCaucus = oradoresCaucus.some(o => (typeof o === 'string' ? o : o.nombre)?.toLowerCase() === clientCountry?.toLowerCase());
  const paisesDisponibles = state.paises || [];

  // Países ocupados por otros peers conectados
  const paisesOcupadosSet = useMemo(() => {
    const set = new Set();
    (connectedPeers || []).forEach(peer => {
      if (peer.country && peer.role === 'delegate') {
        set.add(peer.country.toLowerCase().trim());
      }
    });
    return set;
  }, [connectedPeers]);

  // Lista normalizada de países
  const listaPaisesNormalizada = useMemo(() => {
    if (!Array.isArray(paisesDisponibles) || paisesDisponibles.length === 0) {
      return [
        { id: '1', nombre: 'Alemania', bandera: '🇩🇪' },
        { id: '2', nombre: 'Argentina', bandera: '🇦🇷' },
        { id: '3', nombre: 'Brasil', bandera: '🇧🇷' },
        { id: '4', nombre: 'Canadá', bandera: '🇨🇦' },
        { id: '5', nombre: 'China', bandera: '🇨🇳' },
        { id: '6', nombre: 'Colombia', bandera: '🇨🇴' },
        { id: '7', nombre: 'Corea del Sur', bandera: '🇰🇷' },
        { id: '8', nombre: 'Egipto', bandera: '🇪🇬' },
        { id: '9', nombre: 'España', bandera: '🇪🇸' },
        { id: '10', nombre: 'Estados Unidos', bandera: '🇺🇸' },
        { id: '11', nombre: 'Federación Rusa', bandera: '🇷🇺' },
        { id: '12', nombre: 'Francia', bandera: '🇫🇷' },
        { id: '13', nombre: 'India', bandera: '🇮🇳' },
        { id: '14', nombre: 'Italia', bandera: '🇮🇹' },
        { id: '15', nombre: 'Japón', bandera: '🇯🇵' },
        { id: '16', nombre: 'México', bandera: '🇲🇽' },
        { id: '17', nombre: 'Noruega', bandera: '🇳🇴' },
        { id: '18', nombre: 'Reino Unido', bandera: '🇬🇧' },
        { id: '19', nombre: 'Sudáfrica', bandera: '🇿🇦' },
        { id: '20', nombre: 'Turquía', bandera: '🇹🇷' },
        { id: '21', nombre: 'Ucrania', bandera: '🇺🇦' }
      ];
    }

    return paisesDisponibles.map((p, idx) => {
      if (typeof p === 'string') {
        return { id: `p-${idx}`, nombre: p, bandera: getFlagEmoji(null, p) };
      }
      return {
        id: p.id || `p-${idx}`,
        nombre: p.nombre || p.name || 'Delegación',
        bandera: p.bandera || getFlagEmoji(p.bandera, p.nombre)
      };
    });
  }, [paisesDisponibles]);

  const paisesFiltrados = useMemo(() => {
    if (!busquedaPais.trim()) return listaPaisesNormalizada;
    const query = busquedaPais.toLowerCase().trim();
    return listaPaisesNormalizada.filter(p => p.nombre.toLowerCase().includes(query));
  }, [listaPaisesNormalizada, busquedaPais]);

  const handleConfirmCountrySelection = async (countryName) => {
    const finalName = (countryName || paisPersonalizadoInput || paisSeleccionadoTemp || '').trim();
    if (!finalName) {
      setCountrySelectError('Por favor selecciona o introduce el nombre de tu país');
      return;
    }

    setIsSubmittingCountry(true);
    setCountrySelectError(null);
    try {
      const res = await selectCountry(finalName);
      if (!res.success) {
        setCountrySelectError(res.message || 'No se pudo seleccionar este país');
      }
    } catch (err) {
      setCountrySelectError(err.message || 'Error de conexión');
    } finally {
      setIsSubmittingCountry(false);
    }
  };

  // Manejador de Solicitud de Turno GSL
  const handlePedirGSL = () => {
    if (settings.speakerRequestMode === 'disabled') return;
    requestSpeaking('GSL', { country: clientCountry });
    setSolicitudGSLHecha(true);
    setTimeout(() => setSolicitudGSLHecha(false), 4000);
  };

  // Manejador de Solicitud de Turno Caucus
  const handlePedirCaucus = () => {
    if (settings.caucusRequestMode === 'disabled') return;
    requestSpeaking('CAUCUS', { country: clientCountry });
    setSolicitudCaucusHecha(true);
    setTimeout(() => setSolicitudCaucusHecha(false), 4000);
  };

  const handleEnviarMocion = (e) => {
    e.preventDefault();
    if (!settings.allowMotions) return;

    requestSpeaking('POINT_MOTION', {
      country: clientCountry,
      tipo: tipoMocion,
      tema: temaMocion || tipoMocion,
      tiempoTotal: tiempoTotalMocion,
      tiempoOrador: tiempoOradorMocion
    });
    setPedirMocionOpen(false);
    setTemaMocion('');
  };

  const handleEnviarNota = (e) => {
    e.preventDefault();
    if (!textoNota.trim()) return;

    sendNote(destinatario, textoNota.trim(), tipoNota);
    setTextoNota('');
    setSubTabNotas('BUZON');
  };

  const handleEmitirVoto = (opcion) => {
    castVote(opcion);
    setMiVotoEmitido(opcion);
  };

  const handleEnviarEnmiendaDelegado = (e) => {
    e.preventDefault();
    if (!textoPropuestoDel.trim() && tipoEnmiendaDel !== 'supresion') return;

    const articulosList = state.enmiendasSesion?.articulos || [];
    const artObj = articulosList.find(a => a.id === artIdDel);
    const artNum = artObj ? (artObj.prefijo || `Artículo ${artObj.numero}`) : 'Nuevo Artículo';

    const nuevaPropuesta = {
      id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      tipo: tipoEnmiendaDel,
      articuloId: artIdDel || null,
      articuloNumero: artNum,
      paisProponente: clientCountry || 'Delegación',
      textoOriginal: textoOriginalDel.trim(),
      textoPropuesto: textoPropuestoDel.trim(),
      justificacion: justificacionDel.trim(),
      timestamp: Date.now()
    };

    if (submitAmendment) {
      submitAmendment(nuevaPropuesta);
    }

    setMisEnmiendasEnviadas(prev => [nuevaPropuesta, ...prev]);
    setEnmiendaEnviadaFeedback(true);
    setTextoPropuestoDel('');
    setTextoOriginalDel('');
    setJustificacionDel('');
    setTimeout(() => setEnmiendaEnviadaFeedback(false), 5000);
  };

  // Filtrar notas que pertenecen a este país
  const misNotas = notes.filter(n => 
    n.from?.toLowerCase() === clientCountry?.toLowerCase() ||
    n.to?.toLowerCase() === clientCountry?.toLowerCase() ||
    n.to?.toUpperCase() === 'TODOS'
  );

  // Si aún no ha seleccionado su país / delegación oficial de la sesión
  if (!clientCountry) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        fontFamily: 'var(--font-family, Inter, system-ui, sans-serif)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <AccessibilityModal isOpen={isAccessModalOpen} onClose={() => setIsAccessModalOpen(false)} />

        {/* Header Superior */}
        <header style={{
          padding: '0.85rem 1.5rem',
          backgroundColor: 'var(--header-bg)',
          borderBottom: '1px solid var(--subborder-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <OpenMunLogo height={32} isLight={isLight} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: '800', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                  {state.comision || state.nombreComite || 'Sesión en Vivo'}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#22c55e',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                  Sala {roomId}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                Conectado como participante • Selección de Delegación Oficial
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setIsAccessModalOpen(true)}
              style={{
                background: 'transparent',
                border: '1px solid var(--subborder-color)',
                borderRadius: '8px',
                color: 'var(--text-color)',
                padding: '0.45rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
              title={t('accessibility.title', "Accesibilidad y Tema")}
            >
              <Eye size={14} /> {t('accessibility.title', 'Accesibilidad')}
            </button>

            <button
              onClick={toggleThemeMode}
              style={{
                background: 'transparent',
                border: '1px solid var(--subborder-color)',
                borderRadius: '8px',
                color: 'var(--text-color)',
                padding: '0.45rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
              title={isLight ? t('header.darkMode', "Cambiar a Modo Oscuro") : t('header.lightMode', "Cambiar a Modo Claro")}
            >
              {isLight ? <Moon size={14} /> : <Sun size={14} />}
            </button>

            <LanguageSelector showIcon={false} />

            <button
              onClick={() => {
                if (confirm('¿Deseas desconectarte de la sala?')) {
                  leaveRoom();
                  if (onExit) onExit();
                }
              }}
              style={{
                background: 'transparent',
                border: '1px solid var(--subborder-color)',
                borderRadius: '8px',
                color: 'var(--muted-text)',
                padding: '0.45rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <LogOut size={14} /> {t('common.exit', 'Salir')}
            </button>
          </div>
        </header>

        {/* Cuerpo Principal de Selección */}
        <main style={{
          padding: '2rem 1.25rem 3rem 1.25rem',
          maxWidth: '960px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          flex: 1
        }}>
          {/* Banner de Bienvenida y Comité */}
          <div style={{
            backgroundColor: 'var(--panel-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                <Globe size={14} /> Lista Oficial de la Sesión
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                {paisesFiltrados.length} delegaciones disponibles
              </span>
            </div>

            <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Selecciona tu Delegación
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--muted-text)', lineHeight: '1.5' }}>
              El Chair ha transmitido el listado oficial de países de esta sesión. Haz clic sobre tu delegación para identificarte en los debates, lista de oradores, votaciones telemáticas y mensajería oficial.
            </p>
          </div>

          {/* Mensaje de Error */}
          {countrySelectError && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '12px',
              padding: '0.85rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              color: '#f87171',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{countrySelectError}</span>
            </div>
          )}

          {/* Barra de Búsqueda */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Buscar tu país o delegación..."
              value={busquedaPais}
              onChange={e => setBusquedaPais(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--card-header-bg)',
                border: '1px solid var(--subborder-color)',
                borderRadius: '10px',
                padding: '0.75rem 1rem 0.75rem 2.4rem',
                color: 'var(--text-color)',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-text)' }} />
            {busquedaPais && (
              <button
                onClick={() => setBusquedaPais('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--muted-text)',
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Grid de Países */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.75rem'
          }}>
            {paisesFiltrados.map((p) => {
              const estaOcupado = paisesOcupadosSet.has(p.nombre.toLowerCase().trim());
              const isSelected = paisSeleccionadoTemp === p.nombre;

              return (
                <div
                  key={p.id || p.nombre}
                  onClick={() => {
                    if (estaOcupado || isSubmittingCountry) return;
                    setPaisSeleccionadoTemp(p.nombre);
                    setPaisPersonalizadoInput('');
                  }}
                  onDoubleClick={() => {
                    if (estaOcupado || isSubmittingCountry) return;
                    handleConfirmCountrySelection(p.nombre);
                  }}
                  style={{
                    backgroundColor: isSelected
                      ? 'rgba(34, 197, 94, 0.12)'
                      : (estaOcupado ? 'rgba(255,255,255,0.015)' : 'var(--panel-color)'),
                    border: `1.5px solid ${
                      isSelected
                        ? '#22c55e'
                        : (estaOcupado ? 'var(--subborder-color)' : 'var(--border-color)')
                    }`,
                    borderRadius: '12px',
                    padding: '0.9rem 1rem',
                    cursor: estaOcupado ? 'not-allowed' : 'pointer',
                    opacity: estaOcupado ? 0.45 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 16px rgba(34, 197, 94, 0.2)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                    <CountryFlag bandera={p.bandera} nombre={p.nombre} size="md" />
                    <span style={{
                      fontWeight: isSelected ? '800' : '700',
                      fontSize: '0.88rem',
                      color: isSelected ? '#22c55e' : 'var(--text-color)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {p.nombre}
                    </span>
                  </div>

                  {estaOcupado ? (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      color: '#ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      Ocupado
                    </span>
                  ) : isSelected ? (
                    <CheckCircle2 size={18} color="#22c55e" style={{ flexShrink: 0 }} />
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Opción de país personalizado */}
          <div style={{
            backgroundColor: 'var(--panel-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ¿Tu delegación no aparece en la lista anterior?
            </div>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <input
                type="text"
                placeholder="Escribe el nombre de tu delegación (ej: Santa Sede, Observador ONU...)"
                value={paisPersonalizadoInput}
                onChange={e => {
                  setPaisPersonalizadoInput(e.target.value);
                  if (e.target.value) setPaisSeleccionadoTemp('');
                }}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--card-header-bg)',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '10px',
                  padding: '0.7rem 1rem',
                  color: 'var(--text-color)',
                  fontWeight: '600',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          {/* Botón de Confirmación Flotante */}
          <div style={{
            position: 'sticky',
            bottom: '16px',
            backgroundColor: 'var(--panel-color)',
            border: '1.5px solid var(--subborder-color)',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 15px 35px rgba(0,0,0,0.45)',
            zIndex: 90
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                Delegación seleccionada:
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: (paisSeleccionadoTemp || paisPersonalizadoInput) ? '#22c55e' : 'var(--muted-text)', marginTop: '2px' }}>
                {paisSeleccionadoTemp || paisPersonalizadoInput || 'Ningún país seleccionado'}
              </div>
            </div>

            <button
              disabled={(!paisSeleccionadoTemp && !paisPersonalizadoInput.trim()) || isSubmittingCountry}
              onClick={() => handleConfirmCountrySelection(paisSeleccionadoTemp || paisPersonalizadoInput)}
              style={{
                backgroundColor: (!paisSeleccionadoTemp && !paisPersonalizadoInput.trim()) ? 'rgba(255,255,255,0.05)' : 'var(--btn-bg)',
                color: (!paisSeleccionadoTemp && !paisPersonalizadoInput.trim()) ? 'var(--muted-text)' : 'var(--btn-text)',
                border: 'none',
                borderRadius: '10px',
                padding: '0.75rem 1.5rem',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: (!paisSeleccionadoTemp && !paisPersonalizadoInput.trim()) || isSubmittingCountry ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: (!paisSeleccionadoTemp && !paisPersonalizadoInput.trim()) ? 'none' : '0 4px 16px rgba(0,0,0,0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              {isSubmittingCountry ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Conectando...
                </>
              ) : (
                <>
                  <Check size={16} /> Entrar a la Sesión
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-color)',
      fontFamily: 'var(--font-family, Inter, system-ui, sans-serif)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <AccessibilityModal isOpen={isAccessModalOpen} onClose={() => setIsAccessModalOpen(false)} />

      {/* ── Topbar del Delegado ── */}
      <header style={{
        padding: '0.75rem 1.25rem',
        backgroundColor: 'var(--header-bg)',
        borderBottom: '1px solid var(--subborder-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <OpenMunLogo height={30} isLight={isLight} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CountryFlag nombre={clientCountry} size="sm" />
              <span style={{ fontWeight: '800', fontSize: '1rem', letterSpacing: '-0.01em' }}>
                {clientCountry || 'Delegación'}
              </span>
              <button
                onClick={() => {
                  if (confirm('¿Deseas cambiar tu delegación asignada?')) {
                    resetCountrySelection();
                  }
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '6px',
                  color: 'var(--muted-text)',
                  padding: '0.15rem 0.45rem',
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
                title="Cambiar de país asignado"
              >
                <RefreshCw size={11} /> Cambiar
              </button>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                padding: '0.1rem 0.45rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                En Vivo ({roomId})
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)' }}>
              {state.comision || 'Comité Conectado'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Botón Accesibilidad y Tema */}
          <button
            onClick={() => setIsAccessModalOpen(true)}
            style={{
              background: 'transparent',
              border: '1px solid var(--subborder-color)',
              borderRadius: '6px',
              color: 'var(--text-color)',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
            title={t('accessibility.title', "Accesibilidad y Tema")}
          >
            <Eye size={13} /> {t('accessibility.title', 'Accesibilidad')}
          </button>

          {/* Botón Rápido Modo Claro / Oscuro */}
          <button
            onClick={toggleThemeMode}
            style={{
              background: 'transparent',
              border: '1px solid var(--subborder-color)',
              borderRadius: '6px',
              color: 'var(--text-color)',
              padding: '0.35rem 0.55rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
            title={isLight ? t('header.darkMode', "Cambiar a Modo Oscuro") : t('header.lightMode', "Cambiar a Modo Claro")}
          >
            {isLight ? <Moon size={13} /> : <Sun size={13} />}
          </button>

          <LanguageSelector showIcon={false} />

          {/* Botón Salir */}
          <button
            onClick={() => {
              if (confirm('¿Deseas desconectarte de la sala?')) {
                leaveRoom();
                if (onExit) onExit();
              }
            }}
            style={{
              background: 'transparent',
              border: '1px solid var(--subborder-color)',
              borderRadius: '6px',
              color: 'var(--muted-text)',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <LogOut size={13} /> {t('common.exit', 'Salir')}
          </button>
        </div>
      </header>

      {/* ── Subheader / Navegación Móvil ── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--subborder-color)',
        backgroundColor: 'var(--subnav-bg)',
        padding: '0.35rem 1rem',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('DEBATE')}
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'DEBATE' ? 'var(--btn-bg)' : 'transparent',
            color: activeTab === 'DEBATE' ? 'var(--btn-text)' : 'var(--muted-text)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease'
          }}
        >
          <Mic size={14} /> {t('views.delegate.debateTab', 'Sala de Debate')}
        </button>

        <button
          onClick={() => setActiveTab('NOTAS')}
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'NOTAS' ? 'var(--btn-bg)' : 'transparent',
            color: activeTab === 'NOTAS' ? 'var(--btn-text)' : 'var(--muted-text)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            position: 'relative',
            transition: 'all 0.15s ease'
          }}
        >
          <MessageSquare size={14} /> {t('views.delegate.notesTab', 'Notas')} ({misNotas.length})
        </button>

        <button
          onClick={() => setActiveTab('ENMIENDAS')}
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'ENMIENDAS' ? 'var(--btn-bg)' : 'transparent',
            color: activeTab === 'ENMIENDAS' ? 'var(--btn-text)' : 'var(--muted-text)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease'
          }}
        >
          <FileText size={14} /> Enmiendas
        </button>
      </div>

      {/* ── Cuerpo Principal del Delegado ── */}
      <main style={{ padding: '1rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {activeTab === 'DEBATE' && (
          <>
            {/* 1. Votación en Vivo si está activa y permitida */}
            {settings.allowLiveVoting && votacionSesion?.asunto && (
              <div style={{
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                border: '1.5px solid rgba(59, 130, 246, 0.35)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '800', fontSize: '0.9rem', color: '#60a5fa' }}>
                    <Vote size={18} /> Votación Telemática en Vivo
                  </div>
                  {miVotoEmitido && (
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Check size={13} /> Voto Registrado: {miVotoEmitido}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                  {votacionSesion.asunto}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEmitirVoto('A Favor')}
                    style={{
                      backgroundColor: miVotoEmitido === 'A Favor' ? '#22c55e' : 'rgba(34, 197, 94, 0.15)',
                      color: miVotoEmitido === 'A Favor' ? '#ffffff' : '#4ade80',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    A Favor
                  </button>

                  <button
                    onClick={() => handleEmitirVoto('En Contra')}
                    style={{
                      backgroundColor: miVotoEmitido === 'En Contra' ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
                      color: miVotoEmitido === 'En Contra' ? '#ffffff' : '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    En Contra
                  </button>

                  <button
                    onClick={() => handleEmitirVoto('Abstención')}
                    style={{
                      backgroundColor: miVotoEmitido === 'Abstención' ? '#eab308' : 'rgba(234, 179, 8, 0.15)',
                      color: miVotoEmitido === 'Abstención' ? '#ffffff' : '#fde047',
                      border: '1px solid rgba(234, 179, 8, 0.4)',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Abstención
                  </button>

                  <button
                    onClick={() => handleEmitirVoto('Pase')}
                    style={{
                      backgroundColor: miVotoEmitido === 'Pase' ? '#6b7280' : 'rgba(107, 114, 128, 0.15)',
                      color: miVotoEmitido === 'Pase' ? '#ffffff' : '#d1d5db',
                      border: '1px solid rgba(107, 114, 128, 0.4)',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Pase
                  </button>
                </div>
              </div>
            )}

            {/* 2. Panel de Acciones de Orador (GSL y Caucus) adaptativo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {/* Botón / Estado GSL */}
              <div style={{
                backgroundColor: 'var(--panel-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Zap size={16} color="#3b82f6" /> Lista General (GSL)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)', marginTop: '3px' }}>
                    {settings.speakerRequestMode === 'direct'
                      ? 'Modo Directo: Ingreso inmediato'
                      : (settings.speakerRequestMode === 'approval'
                          ? 'Requiere validación de la Mesa'
                          : 'Solicitudes cerradas por la Mesa')}
                  </div>
                </div>

                {estaEnGSL ? (
                  <div style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.12)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#22c55e',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    textAlign: 'center',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}>
                    <CheckCircle size={14} /> ¡Ya estás en la lista GSL!
                  </div>
                ) : (
                  <button
                    disabled={settings.speakerRequestMode === 'disabled' || solicitudGSLHecha}
                    onClick={handlePedirGSL}
                    style={{
                      backgroundColor: settings.speakerRequestMode === 'disabled'
                        ? 'rgba(255,255,255,0.05)'
                        : (solicitudGSLHecha ? '#22c55e' : 'var(--btn-bg)'),
                      color: settings.speakerRequestMode === 'disabled' ? 'var(--muted-text)' : 'var(--btn-text)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.6rem',
                      fontWeight: '800',
                      fontSize: '0.82rem',
                      cursor: settings.speakerRequestMode === 'disabled' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      boxShadow: settings.speakerRequestMode === 'disabled' ? 'none' : '0 4px 12px rgba(0,0,0,0.2)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {settings.speakerRequestMode === 'disabled' ? (
                      <><Lock size={14} /> Cerrado</>
                    ) : (
                      solicitudGSLHecha ? <><Check size={14} /> Solicitud Enviada</> : <><Mic size={14} /> Pedir Turno GSL</>
                    )}
                  </button>
                )}
              </div>

              {/* Botón / Estado Caucus Moderado */}
              <div style={{
                backgroundColor: 'var(--panel-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={16} color="#a855f7" /> Caucus Moderado
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)', marginTop: '3px' }}>
                    {settings.caucusRequestMode === 'direct'
                      ? 'Modo Directo: Ingreso inmediato'
                      : (settings.caucusRequestMode === 'approval'
                          ? 'Requiere validación de la Mesa'
                          : 'Solicitudes cerradas')}
                  </div>
                </div>

                {estaEnCaucus ? (
                  <div style={{
                    backgroundColor: 'rgba(168, 85, 247, 0.12)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    color: '#c084fc',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    textAlign: 'center',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}>
                    <CheckCircle size={14} /> ¡En lista de Caucus!
                  </div>
                ) : (
                  <button
                    disabled={settings.caucusRequestMode === 'disabled' || solicitudCaucusHecha}
                    onClick={handlePedirCaucus}
                    style={{
                      backgroundColor: settings.caucusRequestMode === 'disabled'
                        ? 'rgba(255,255,255,0.05)'
                        : (solicitudCaucusHecha ? '#a855f7' : 'var(--btn-bg)'),
                      color: settings.caucusRequestMode === 'disabled' ? 'var(--muted-text)' : 'var(--btn-text)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.6rem',
                      fontWeight: '800',
                      fontSize: '0.82rem',
                      cursor: settings.caucusRequestMode === 'disabled' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      boxShadow: settings.caucusRequestMode === 'disabled' ? 'none' : '0 4px 12px rgba(0,0,0,0.2)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {settings.caucusRequestMode === 'disabled' ? (
                      <><Lock size={14} /> Cerrado</>
                    ) : (
                      solicitudCaucusHecha ? <><Check size={14} /> Solicitud Enviada</> : <><Mic size={14} /> Pedir Turno Caucus</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* 3. Proponer Moción / Puntos de Orden */}
            <div style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FileText size={16} color="#eab308" /> Proponer Moción o Punto
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                  {settings.allowMotions
                    ? 'Formula una moción de Caucus, Punto de Orden o Privilegio hacia la Mesa.'
                    : 'La presentación de mociones está deshabilitada por la Mesa.'}
                </div>
              </div>

              <button
                disabled={!settings.allowMotions}
                onClick={() => setPedirMocionOpen(true)}
                style={{
                  backgroundColor: settings.allowMotions ? 'var(--card-header-bg)' : 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--subborder-color)',
                  color: settings.allowMotions ? 'var(--text-color)' : 'var(--muted-text)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.95rem',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: settings.allowMotions ? 'pointer' : 'not-allowed',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {settings.allowMotions ? <PenTool size={14} /> : <Lock size={14} />} Proponer
              </button>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* PESTAÑA: PAJES / NOTAS                                  */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'NOTAS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Subtabs de Notas */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setSubTabNotas('BUZON')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: subTabNotas === 'BUZON' ? 'var(--btn-bg)' : 'var(--card-header-bg)',
                  color: subTabNotas === 'BUZON' ? 'var(--btn-text)' : 'var(--muted-text)',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Buzón de Mensajes ({misNotas.length})
              </button>

              <button
                onClick={() => setSubTabNotas('REDACTAR')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: subTabNotas === 'REDACTAR' ? 'var(--btn-bg)' : 'var(--card-header-bg)',
                  color: subTabNotas === 'REDACTAR' ? 'var(--btn-text)' : 'var(--muted-text)',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                + Redactar Nota
              </button>
            </div>

            {subTabNotas === 'BUZON' ? (
              misNotas.length === 0 ? (
                <div style={{
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--panel-color)',
                  borderRadius: '12px',
                  border: '1px dashed var(--subborder-color)',
                  color: 'var(--muted-text)'
                }}>
                  <Inbox size={32} style={{ opacity: 0.35, marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Buzón Vacío</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '3px' }}>
                    No has recibido ni enviado notas todavía.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {misNotas.map(n => {
                    const isOutgoing = n.from?.toLowerCase() === clientCountry?.toLowerCase();
                    return (
                      <div
                        key={n.id}
                        style={{
                          backgroundColor: isOutgoing ? 'rgba(59, 130, 246, 0.08)' : 'var(--panel-color)',
                          border: `1px solid ${isOutgoing ? 'rgba(59, 130, 246, 0.25)' : 'var(--border-color)'}`,
                          borderRadius: '10px',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: isOutgoing ? '#60a5fa' : '#22c55e' }}>
                            {isOutgoing ? `Para: ${n.to}` : `De: ${n.from}`}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>
                            {new Date(n.timestamp || Date.now()).toLocaleTimeString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                          {n.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* Formulario Redactar Nota */
              <form onSubmit={handleEnviarNota} style={{
                backgroundColor: 'var(--panel-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                    Destinatario
                  </label>
                  <select
                    value={destinatario}
                    onChange={e => setDestinatario(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '0.35rem',
                      backgroundColor: 'var(--card-header-bg)',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.8rem',
                      color: 'var(--text-color)',
                      fontWeight: '700',
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {settings.allowChairNotes !== false && (
                      <option value="CHAIR" style={{ backgroundColor: 'var(--panel-color)', color: 'var(--text-color)' }}>
                        🏛️ Mesa Directiva (Chair)
                      </option>
                    )}
                    {settings.allowDelegateNotes !== false && (
                      <optgroup label="── Delegaciones ──" style={{ backgroundColor: 'var(--panel-color)', color: 'var(--text-color)', fontWeight: 'bold' }}>
                        {paisesDisponibles.filter(p => p.nombre?.toLowerCase() !== clientCountry?.toLowerCase()).map(p => (
                          <option 
                            key={p.id || p.nombre} 
                            value={p.nombre}
                            style={{ backgroundColor: 'var(--panel-color)', color: 'var(--text-color)' }}
                          >
                            {getFlagEmoji(p.bandera, p.nombre)} {p.nombre}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                    Tipo de Nota
                  </label>
                  <select
                    value={tipoNota}
                    onChange={e => setTipoNota(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '0.35rem',
                      backgroundColor: 'var(--card-header-bg)',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '8px',
                      padding: '0.55rem',
                      color: 'var(--text-color)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <option value="general">General / Mensaje</option>
                    <option value="urgente">Urgente</option>
                    <option value="pregunta">Pregunta de Procedimiento</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                    Mensaje
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Escribe el mensaje para el paje..."
                    value={textoNota}
                    onChange={e => setTextoNota(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '0.35rem',
                      backgroundColor: 'var(--card-header-bg)',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '8px',
                      padding: '0.65rem',
                      color: 'var(--text-color)',
                      fontSize: '0.85rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!textoNota.trim()}
                  style={{
                    backgroundColor: 'var(--btn-bg)',
                    color: 'var(--btn-text)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.65rem',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: textoNota.trim() ? 'pointer' : 'not-allowed',
                    opacity: textoNota.trim() ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Send size={15} /> Enviar Nota
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── PESTAÑA DE ENMIENDAS Y RESOLUCIONES ── */}
        {activeTab === 'ENMIENDAS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Notificación de envío exitoso */}
            {enmiendaEnviadaFeedback && (
              <div style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#22c55e',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.82rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                animation: 'scaleUp 0.2s ease'
              }}>
                <CheckCircle2 size={16} /> ¡Propuesta de enmienda enviada a la Mesa Directiva para su revisión!
              </div>
            )}

            {/* Formulario de Propuesta de Enmienda Telemática */}
            <form onSubmit={handleEnviarEnmiendaDelegado} style={{
              backgroundColor: 'var(--panel-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={18} color="#3b82f6" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>
                  Proponer Enmienda a la Mesa Directiva
                </h3>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>
                Envía tu propuesta de modificación, adición o supresión de cláusula directamente a la mesa para ser evaluada y sometida a debate.
              </div>

              {/* Selector de Naturaleza */}
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                  Tipo de Enmienda
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', marginTop: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => setTipoEnmiendaDel('adicion')}
                    style={{
                      padding: '0.45rem',
                      borderRadius: '6px',
                      border: `1px solid ${tipoEnmiendaDel === 'adicion' ? '#22c55e' : 'var(--subborder-color)'}`,
                      backgroundColor: tipoEnmiendaDel === 'adicion' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                      color: tipoEnmiendaDel === 'adicion' ? '#22c55e' : 'var(--text-color)',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    + Adición
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoEnmiendaDel('supresion')}
                    style={{
                      padding: '0.45rem',
                      borderRadius: '6px',
                      border: `1px solid ${tipoEnmiendaDel === 'supresion' ? '#ef4444' : 'var(--subborder-color)'}`,
                      backgroundColor: tipoEnmiendaDel === 'supresion' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                      color: tipoEnmiendaDel === 'supresion' ? '#ef4444' : 'var(--text-color)',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    - Supresión
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoEnmiendaDel('modificacion')}
                    style={{
                      padding: '0.45rem',
                      borderRadius: '6px',
                      border: `1px solid ${tipoEnmiendaDel === 'modificacion' ? '#3b82f6' : 'var(--subborder-color)'}`,
                      backgroundColor: tipoEnmiendaDel === 'modificacion' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      color: tipoEnmiendaDel === 'modificacion' ? '#3b82f6' : 'var(--text-color)',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    ➔ Modificación
                  </button>
                </div>
              </div>

              {/* Selector de Artículo */}
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                  Artículo / Cláusula
                </label>
                <select
                  value={artIdDel}
                  onChange={e => setArtIdDel(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '0.35rem',
                    backgroundColor: 'var(--card-header-bg)',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '8px',
                    padding: '0.6rem',
                    color: 'var(--text-color)',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}
                >
                  <option value="">-- Añadir como Nuevo Artículo al Final / General --</option>
                  {(state.enmiendasSesion?.articulos || []).map(art => (
                    <option key={art.id} value={art.id}>
                      {art.prefijo || `Artículo ${art.numero}`} - {art.texto?.substring(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Texto original */}
              {(tipoEnmiendaDel === 'supresion' || tipoEnmiendaDel === 'modificacion') && (
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase' }}>
                    {tipoEnmiendaDel === 'supresion' ? 'Texto a Suprimir' : 'Texto Original a Modificar'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Fragmento del texto a suprimir o reemplazar..."
                    value={textoOriginalDel}
                    onChange={e => setTextoOriginalDel(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '0.35rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '0.55rem',
                      color: 'var(--text-color)',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>
              )}

              {/* Texto propuesto */}
              {(tipoEnmiendaDel === 'adicion' || tipoEnmiendaDel === 'modificacion') && (
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: '700', color: '#22c55e', textTransform: 'uppercase' }}>
                    Texto Propuesto
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escribe la redacción propuesta..."
                    required
                    value={textoPropuestoDel}
                    onChange={e => setTextoPropuestoDel(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '0.35rem',
                      backgroundColor: 'rgba(34, 197, 94, 0.05)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '8px',
                      padding: '0.55rem',
                      color: 'var(--text-color)',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>
              )}

              {/* Justificación */}
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                  Motivación / Justificación (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Fomenta la inclusión tecnológica en países en desarrollo"
                  value={justificacionDel}
                  onChange={e => setJustificacionDel(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '0.35rem',
                    backgroundColor: 'var(--card-header-bg)',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '8px',
                    padding: '0.55rem',
                    color: 'var(--text-color)',
                    fontSize: '0.8rem'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--btn-bg)',
                  color: 'var(--btn-text)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  marginTop: '0.25rem'
                }}
              >
                <Send size={15} /> Enviar Propuesta a la Mesa Directiva
              </button>
            </form>

            {/* Historial de Propuestas Enviadas por este Delegado */}
            {misEnmiendasEnviadas.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                  Tus Propuestas Enviadas ({misEnmiendasEnviadas.length})
                </div>
                {misEnmiendasEnviadas.map(prop => (
                  <div
                    key={prop.id}
                    style={{
                      backgroundColor: 'var(--card-header-bg)',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#60a5fa' }}>
                        {prop.tipo?.toUpperCase()} · {prop.articuloNumero}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--muted-text)' }}>
                        Enviada
                      </span>
                    </div>
                    {prop.textoPropuesto && (
                      <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: '600' }}>
                        + {prop.textoPropuesto}
                      </div>
                    )}
                    {prop.justificacion && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--muted-text)', fontStyle: 'italic' }}>
                        {prop.justificacion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Modal para Proponer Moción ── */}
      {pedirMocionOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--panel-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '1.5rem',
            width: '460px',
            maxWidth: '95vw',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                Proponer Moción / Punto
              </h3>
              <button
                onClick={() => setPedirMocionOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--muted-text)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEnviarMocion} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)' }}>Tipo de Moción</label>
                <select
                  value={tipoMocion}
                  onChange={e => setTipoMocion(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '0.35rem',
                    backgroundColor: 'var(--card-header-bg)',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '8px',
                    padding: '0.6rem',
                    color: 'var(--text-color)',
                    fontWeight: '700'
                  }}
                >
                  <option value="Caucus Moderado">Caucus Moderado</option>
                  <option value="Caucus No Moderado">Caucus No Moderado</option>
                  <option value="Punto de Orden">Punto de Orden</option>
                  <option value="Punto de Privilegio Personal">Punto de Privilegio Personal</option>
                  <option value="Punto de Duda Parlamentaria">Punto de Duda Parlamentaria</option>
                  <option value="Cierre de Debate">Cierre de Debate</option>
                </select>
              </div>

              {tipoMocion.includes('Caucus') && (
                <>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)' }}>Tema Específico</label>
                    <input
                      type="text"
                      placeholder="Ej: Financiamiento para energías renovables..."
                      value={temaMocion}
                      onChange={e => setTemaMocion(e.target.value)}
                      style={{
                        width: '100%',
                        marginTop: '0.35rem',
                        backgroundColor: 'var(--card-header-bg)',
                        border: '1px solid var(--subborder-color)',
                        borderRadius: '8px',
                        padding: '0.6rem',
                        color: 'var(--text-color)'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)' }}>Tiempo Total (segundos)</label>
                      <input
                        type="number"
                        value={tiempoTotalMocion}
                        onChange={e => setTiempoTotalMocion(Number(e.target.value))}
                        style={{
                          width: '100%',
                          marginTop: '0.35rem',
                          backgroundColor: 'var(--card-header-bg)',
                          border: '1px solid var(--subborder-color)',
                          borderRadius: '8px',
                          padding: '0.55rem',
                          color: 'var(--text-color)'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-text)' }}>Por Orador (segundos)</label>
                      <input
                        type="number"
                        value={tiempoOradorMocion}
                        onChange={e => setTiempoOradorMocion(Number(e.target.value))}
                        style={{
                          width: '100%',
                          marginTop: '0.35rem',
                          backgroundColor: 'var(--card-header-bg)',
                          border: '1px solid var(--subborder-color)',
                          borderRadius: '8px',
                          padding: '0.55rem',
                          color: 'var(--text-color)'
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--btn-bg)',
                  color: 'var(--btn-text)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Enviar Moción a la Mesa
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DelegateView;
