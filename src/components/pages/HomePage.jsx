import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Coffee,
  Play,
  Sparkles,
  ExternalLink,
  Edit3,
  Mail,
  Send,
  Copy,
  Check,
  MessageSquareHeart,
  Radio,
  Users,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Globe,
  Laptop,
  Search,
  BookOpen,
  Zap,
  Trash2,
  Save,
  Sliders,
  Vote,
  Lock,
  Code2
} from 'lucide-react';
import OpenMunLogo from '../common/OpenMunLogo';

// Icono SVG oficial de YouTube
const YouTubeIcon = ({ size = 16, color = 'currentColor', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FAQ_ITEMS = [
  {
    id: 'que-es',
    categoria: 'General',
    pregunta: '¿Qué es OpenMUN y para qué sirve?',
    respuesta: 'OpenMUN es una plataforma web integral, libre y de código abierto diseñada para facilitar la moderación y gestión de simulaciones de Modelos de Naciones Unidas (MUN). Permite a las mesas de presidencia llevar el control de oradores, cronómetros, mociones, votaciones, cálculo de quorum y transmitir el estado de la sesión en vivo a delegados y pantallas de proyección.'
  },
  {
    id: 'gratuito',
    categoria: 'Licencia',
    pregunta: '¿Es realmente 100% gratuito y de código abierto?',
    respuesta: '¡Sí, absolutamente! OpenMUN es software libre (Free as in "libre" y Free as in "gratis"). No contiene muros de pago, ni suscripciones premium, ni publicidad. Todo el código fuente está disponible públicamente en GitHub bajo una licencia abierta para que cualquier persona o comité pueda usarlo, auditarlo o adaptarlo.'
  },
  {
    id: 'p2p-sync',
    categoria: 'Tecnología',
    pregunta: '¿Cómo funciona la sincronización en vivo P2P (Mesa, Delegados y Secretaría)?',
    respuesta: 'OpenMUN utiliza tecnología Peer-to-Peer (WebRTC) y canales de difusión local (BroadcastChannel). Esto significa que la Mesa de Presidencia actúa como nodo anfitrión y comparte un Código de Sala o código QR con los delegados. Las actualizaciones de cronómetro, oradores y mociones se transmiten en tiempo real directamente entre dispositivos sin necesidad de almacenar datos sensibles en servidores de terceros.'
  },
  {
    id: 'instalacion-cuenta',
    categoria: 'Uso',
    pregunta: '¿Necesito instalar programas o registrar una cuenta?',
    respuesta: 'No necesitas instalar nada ni registrar un usuario o contraseña. OpenMUN funciona directamente desde cualquier navegador web moderno (Chrome, Firefox, Safari, Edge, etc.) en computadoras portátiles, tablets o teléfonos móviles.'
  },
  {
    id: 'persistencia-datos',
    categoria: 'Datos',
    pregunta: '¿Se guardan mis configuraciones si cierro el navegador?',
    respuesta: 'Sí. Todo el progreso de la sesión (lista de oradores, estados de votación, configuración del comité y notas) se guarda automáticamente de forma local en tu navegador (LocalStorage). Si recargas la página o la cierras accidentalmente, podrás continuar exactamente donde te quedaste. Además, puedes exportar e importar tu configuración en un archivo JSON o Excel.'
  },
  {
    id: 'importar-paises',
    categoria: 'Comité',
    pregunta: '¿Cómo puedo importar mi lista de países o delegaciones?',
    respuesta: 'En la pestaña "Comienzo" o usando el widget de "Importar Países", puedes cargar archivos en formato Excel (.xlsx/.xls) o pegar una lista simple en texto. El sistema creará automáticamente la matriz de países, calculará el quorum de presentes y los dejará listos para el pase de lista.'
  },
  {
    id: 'modo-offline',
    categoria: 'Tecnología',
    pregunta: '¿Puedo usar OpenMUN sin conexión a internet (offline)?',
    respuesta: '¡Sí! Una vez cargada la aplicación en tu navegador, todas las herramientas de la Mesa (cronómetros, GSL, mociones, votaciones) funcionan 100% offline. Para proyectar en una segunda pantalla sin internet, puedes abrir la vista de Secretaría en una segunda ventana del mismo navegador mediante sincronización local.'
  },
  {
    id: 'colaborar',
    categoria: 'Comunidad',
    pregunta: '¿Cómo puedo colaborar, proponer mejoras o reportar fallos?',
    respuesta: 'La comunidad es el corazón de OpenMUN. Puedes abrir un issue o Pull Request en nuestro repositorio de GitHub, o escribirnos directamente a nuestro correo de sugerencias: sugerencias@openmun.org. ¡Toda idea, traducción o contribución es bienvenida!'
  }
];

const FEATURES = [
  {
    icon: Users,
    title: 'Lista General de Oradores (GSL)',
    desc: 'Gestión ágil de delegaciones con tiempos configurables por orador, ceder la palabra a preguntas o a la mesa, y visualización en cola en vivo.',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.3)'
  },
  {
    icon: Clock,
    title: 'Cronómetros Dinámicos',
    desc: 'Temporizadores duales de debate moderado y tiempo individual por orador con alertas visuales por semáforo y avisos de conclusión.',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.3)'
  },
  {
    icon: FileText,
    title: 'Pizarra Dinámica de Mociones',
    desc: 'Registro rápido de propuestas parlamentarias con orden de precedencia automática, tipo de debate y votación en un solo clic.',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.3)'
  },
  {
    icon: Vote,
    title: 'Sistema Oficial de Votaciones',
    desc: 'Cálculo instantáneo de mayorías (simple, 2/3, calificada), votación en rol, abstenciones automáticas y registro de quorum en vivo.',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)'
  },
  {
    icon: Radio,
    title: 'Transmisión P2P en Directo',
    desc: 'Conecta las pantallas de delegados, secretaría y backroom en tiempo real mediante WebRTC descentralizado sin servidores intermedios.',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.3)'
  },
  {
    icon: Sliders,
    title: 'Personalización & Accesibilidad',
    desc: 'Tablero modular drag-and-drop con modo oscuro/claro, soporte de tipografía para dislexia, escalado de texto y exportación de sesiones.',
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.3)'
  }
];

const VIDEO_CHAPTERS = [
  { time: '0:00', title: 'Introducción a OpenMUN', desc: 'Vista general del tablero y navegación rápida.' },
  { time: '1:15', title: 'Comité y Pase de Lista', desc: 'Importar delegaciones y cálculo de quorum.' },
  { time: '2:30', title: 'Gestión de GSL y Tiempos', desc: 'Cronómetros, cola de oradores y cesiones.' },
  { time: '3:45', title: 'Pizarra de Mociones', desc: 'Registro de caucuses y orden de precedencia.' },
  { time: '4:50', title: 'Votaciones Oficiales', desc: 'Mayorías, votación en rol y resoluciones.' },
  { time: '5:30', title: 'Pantallas en Vivo P2P', desc: 'Conectar delegados y proyector de secretaría.' }
];

const HomePage = ({ onNavigateToComienzo, onNavigateToJoin, isLight }) => {
  // Estado para notas personales de la mesa
  const [notasUsuario, setNotasUsuario] = useState(() => {
    return localStorage.getItem('openmun_home_notes') || 'Añade aquí tus notas personalizadas, recordatorios o agenda del evento...';
  });
  const [editandoNotas, setEditandoNotas] = useState(false);
  const [notasTemp, setNotasTemp] = useState(notasUsuario);
  const [notasGuardadasFlash, setNotasGuardadasFlash] = useState(false);
  const [notasExpandidas, setNotasExpandidas] = useState(false);

  // Sincronizar notas si se importa una sesión
  useEffect(() => {
    const handleStorageUpdate = () => {
      const savedNotes = localStorage.getItem('openmun_home_notes');
      if (savedNotes !== null) {
        setNotasUsuario(savedNotes);
        setNotasTemp(savedNotes);
      }
    };
    window.addEventListener('openmun_session_imported', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('openmun_session_imported', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Estado para copia de email
  const [copiado, setCopiado] = useState(false);
  const emailPlaceholder = 'sugerencias@openmun.org';

  // Estado para FAQ interactivo
  const [faqAbierto, setFaqAbierto] = useState('que-es');
  const [busquedaFaq, setBusquedaFaq] = useState('');
  const [categoriaFaq, setCategoriaFaq] = useState('Todas');

  // Estado para Video Tutorial
  const [videoUrlId, setVideoUrlId] = useState('dQw4w9WgXcQ'); // Placeholder ID oficial
  const [videoModoCustom, setVideoModoCustom] = useState(false);
  const [customInputUrl, setCustomInputUrl] = useState('');
  const [capituloSeleccionado, setCapituloSeleccionado] = useState(0);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailPlaceholder);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleGuardarNotas = () => {
    setNotasUsuario(notasTemp);
    localStorage.setItem('openmun_home_notes', notasTemp);
    setEditandoNotas(false);
    setNotasGuardadasFlash(true);
    setTimeout(() => setNotasGuardadasFlash(false), 2000);
  };

  const handleLimpiarNotas = () => {
    const textoVacio = '';
    setNotasTemp(textoVacio);
    setNotasUsuario(textoVacio);
    localStorage.setItem('openmun_home_notes', textoVacio);
  };

  const handleAplicarVideoUrl = (e) => {
    e.preventDefault();
    if (!customInputUrl.trim()) return;
    // Extraer ID de YouTube de url completa o ID simple
    let extractedId = customInputUrl.trim();
    const match = customInputUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      extractedId = match[1];
    }
    setVideoUrlId(extractedId);
    setVideoModoCustom(false);
  };

  // Filtrado de FAQs
  const faqsFiltrados = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const coincideTexto =
        item.pregunta.toLowerCase().includes(busquedaFaq.toLowerCase()) ||
        item.respuesta.toLowerCase().includes(busquedaFaq.toLowerCase());
      const coincideCat = categoriaFaq === 'Todas' || item.categoria === categoriaFaq;
      return coincideTexto && coincideCat;
    });
  }, [busquedaFaq, categoriaFaq]);

  const categorias = useMemo(() => {
    const cats = ['Todas', ...new Set(FAQ_ITEMS.map((item) => item.categoria))];
    return cats;
  }, []);

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1.5rem 1rem 4rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '3.5rem',
      color: 'var(--text-color)',
      fontFamily: 'var(--font-family, Inter, system-ui, sans-serif)'
    }}>

      {/* ── 1. HERO SECTION DE ALTO IMPACTO ── */}
      <section style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem 2.5rem 1.5rem',
        borderRadius: '24px',
        background: isLight
          ? 'linear-gradient(180deg, rgba(241, 245, 249, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)'
          : 'linear-gradient(180deg, rgba(30, 34, 47, 0.7) 0%, rgba(16, 18, 26, 0.95) 100%)',
        border: '1px solid var(--border-color)',
        boxShadow: isLight
          ? '0 20px 40px -15px rgba(0, 0, 0, 0.07)'
          : '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        overflow: 'hidden'
      }}>
        {/* Glow ambient de fondo */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '550px',
          height: '250px',
          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Badge Superior */}
        <div style={{
          zIndex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '999px',
          backgroundColor: isLight ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.18)',
          border: '1px solid rgba(59, 130, 246, 0.35)',
          color: '#3b82f6',
          fontSize: '0.82rem',
          fontWeight: '700',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '1.25rem'
        }}>
          <Sparkles size={14} /> OpenMUN 2.0 • 100% Libre & Open Source
        </div>

        {/* Logo SVG Gigante */}
        <div style={{
          zIndex: 1,
          marginBottom: '0.5rem',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <OpenMunLogo height={95} isLight={isLight} />
        </div>

        {/* Título Principal y Propuesta de Valor */}
        <h1 style={{
          zIndex: 1,
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: '900',
          lineHeight: '1.2',
          maxWidth: '850px',
          margin: '0.5rem 0 0 0',
          letterSpacing: '-0.02em',
          color: 'var(--text-color)'
        }}>
          La plataforma definitiva para gestionar <span style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Modelos de Naciones Unidas</span>
        </h1>

        <p style={{
          zIndex: 1,
          fontSize: '1.1rem',
          lineHeight: '1.6',
          maxWidth: '720px',
          color: 'var(--muted-text)',
          margin: '1rem 0 1.75rem 0',
          fontWeight: '400'
        }}>
          Diseñada para Mesas de Presidencia, Delegados y Comités Académicos. 
          Rápida, intuitiva, en tiempo real y sin registros obligatorios.
        </p>

        {/* ── BOTONES DE ACCIÓN PRINCIPALES ── */}
        <div style={{
          zIndex: 1,
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: '860px'
        }}>
          {/* Botón Comenzar Simulación (Chair) */}
          <button
            onClick={onNavigateToComienzo}
            style={{
              padding: '0.9rem 1.8rem',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              fontWeight: '800',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '1rem',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.35)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.35)';
            }}
          >
            <Play size={20} fill="#ffffff" /> Comenzar como Mesa (Chair)
          </button>

          {/* Botón Unirse a Sala en Vivo (Delegados / Staff) */}
          {onNavigateToJoin && (
            <button
              onClick={onNavigateToJoin}
              style={{
                padding: '0.9rem 1.8rem',
                backgroundColor: isLight ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.18)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: isLight ? '#2563eb' : '#60a5fa',
                fontWeight: '800',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '1rem',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.backgroundColor = isLight ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.28)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.backgroundColor = isLight ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.18)';
              }}
            >
              <Radio size={20} /> Unirse a Sala en Vivo
            </button>
          )}

          {/* Botón de Donación (BuyMeACoffee) */}
          <a
            href="https://buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.85rem 1.4rem',
              backgroundColor: '#ffdd00',
              color: '#000000',
              fontWeight: '800',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(255, 221, 0, 0.25)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Coffee size={18} /> Invítanos a un café
          </a>

          {/* Botón GitHub */}
          <a
            href="https://github.com/luk4sk4/OPEN2MUN"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.85rem 1.4rem',
              backgroundColor: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              fontWeight: '700',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              fontSize: '0.95rem',
              textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Code2 size={18} /> GitHub <ExternalLink size={14} style={{ opacity: 0.6 }} />
          </a>
        </div>

        {/* Píldoras de características rápidas */}
        <div style={{
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.25rem',
          justifyContent: 'center',
          marginTop: '2.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--subborder-color)',
          width: '100%',
          maxWidth: '900px',
          fontSize: '0.85rem',
          color: 'var(--muted-text)'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
            <Zap size={16} style={{ color: '#eab308' }} /> Zero Setup / Sin Registro
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
            <Globe size={16} style={{ color: '#3b82f6' }} /> Sincronización P2P en Vivo
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
            <Lock size={16} style={{ color: '#22c55e' }} /> 100% Privado y Local
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
            <Laptop size={16} style={{ color: '#a855f7' }} /> Compatible Offline
          </span>
        </div>
      </section>

      {/* ── 2. SECCIÓN VIDEOTUTORIAL: CÓMO USAR OPENMUN ── */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        backgroundColor: 'var(--panel-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '2.25rem 2rem',
        boxShadow: isLight
          ? '0 10px 30px rgba(0, 0, 0, 0.04)'
          : '0 15px 35px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Cabecera del video */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '800',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                <YouTubeIcon size={15} /> Tutorial en Video
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: '500' }}>
                Guía Rápida de 5 Minutos
              </span>
            </div>
            <h2 style={{
              fontSize: '1.6rem',
              fontWeight: '800',
              margin: '0.2rem 0 0 0',
              color: 'var(--text-color)',
              letterSpacing: '-0.01em'
            }}>
              Aprende a dominar OpenMUN en tu simulación
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--muted-text)',
              margin: 0,
              maxWidth: '680px',
              lineHeight: '1.5'
            }}>
              Descubre cómo configurar comités, moderar la Lista General de Oradores, registrar mociones y transmitir a delegados paso a paso.
            </p>
          </div>

          {/* Botón para cambiar URL de video si el usuario quiere personalizarlo */}
          <button
            onClick={() => setVideoModoCustom(!videoModoCustom)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--card-header-bg)',
              color: 'var(--text-color)',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Sliders size={14} /> {videoModoCustom ? 'Ocultar ajuste de enlace' : 'Personalizar enlace de video'}
          </button>
        </div>

        {/* Formulario opcional para ingresar link propio de YouTube */}
        {videoModoCustom && (
          <form
            onSubmit={handleAplicarVideoUrl}
            style={{
              display: 'flex',
              gap: '0.6rem',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--card-header-bg)',
              borderRadius: '10px',
              border: '1px dashed var(--border-color)',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-color)' }}>
              Pegar enlace o ID de YouTube:
            </span>
            <input
              type="text"
              placeholder="Ej: https://www.youtube.com/watch?v=... o ID de video"
              value={customInputUrl}
              onChange={(e) => setCustomInputUrl(e.target.value)}
              style={{
                flex: 1,
                minWidth: '240px',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                fontSize: '0.85rem'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.45rem 1rem',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-text)',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Aplicar Video
            </button>
          </form>
        )}

        {/* Reproductor de Video 16:9 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}>
          {/* Contenedor Iframe YouTube */}
          <div style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%', // 16:9 Aspect Ratio
            backgroundColor: '#000000',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
            border: '1px solid var(--subborder-color)'
          }}>
            <iframe
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              src={`https://www.youtube-nocookie.com/embed/${videoUrlId}?rel=0&modestbranding=1`}
              title="OpenMUN Tutorial Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Lista de Capítulos y Puntos Clave */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            backgroundColor: 'var(--card-header-bg)',
            border: '1px solid var(--subborder-color)',
            borderRadius: '14px',
            padding: '1.25rem',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
                borderBottom: '1px solid var(--subborder-color)',
                paddingBottom: '0.5rem'
              }}>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--text-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <BookOpen size={16} style={{ color: '#3b82f6' }} /> Capítulos del Tutorial
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)', fontWeight: '600' }}>
                  6 secciones
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {VIDEO_CHAPTERS.map((chap, idx) => {
                  const isSelected = capituloSeleccionado === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setCapituloSeleccionado(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        backgroundColor: isSelected
                          ? (isLight ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.22)')
                          : 'transparent',
                        border: `1px solid ${isSelected ? '#3b82f6' : 'transparent'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        fontWeight: '700',
                        color: isSelected ? '#3b82f6' : 'var(--muted-text)',
                        backgroundColor: isLight ? '#e2e8f0' : '#1e222f',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px'
                      }}>
                        {chap.time}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                        <span style={{
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? '700' : '600',
                          color: isSelected ? 'var(--text-color)' : 'var(--text-color)'
                        }}>
                          {chap.title}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                          {chap.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Consejo de presidencia */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: isLight ? 'rgba(234, 179, 8, 0.12)' : 'rgba(234, 179, 8, 0.15)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '8px',
              padding: '0.6rem 0.85rem',
              fontSize: '0.78rem',
              color: isLight ? '#854d0e' : '#fde047'
            }}>
              <Sparkles size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>Tip de Mesa:</strong> Proyecta la vista de <em>Secretaría</em> en el proyector mientras operas el panel desde tu laptop.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SHOWCASE DE CAPACIDADES Y WIDGETS ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            color: '#3b82f6',
            fontWeight: '800',
            fontSize: '0.82rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            Herramientas Modulares
          </span>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '800',
            margin: 0,
            color: 'var(--text-color)',
            letterSpacing: '-0.02em'
          }}>
            Todo lo que necesita tu Comité en un solo lugar
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'var(--muted-text)',
            maxWidth: '650px',
            margin: 0
          }}>
            Configura y personaliza cada pantalla arrastrando widgets interactivos según la fase del debate.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {FEATURES.map((feat, index) => {
            const IconComponent = feat.icon;
            return (
              <div
                key={index}
                style={{
                  backgroundColor: 'var(--panel-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  boxShadow: isLight
                    ? '0 4px 20px rgba(0, 0, 0, 0.03)'
                    : '0 8px 25px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = feat.color;
                  e.currentTarget.style.boxShadow = `0 12px 30px ${feat.color}25`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = isLight
                    ? '0 4px 20px rgba(0, 0, 0, 0.03)'
                    : '0 8px 25px rgba(0, 0, 0, 0.2)';
                }}
              >
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: feat.bg,
                  border: `1px solid ${feat.border}`,
                  color: feat.color
                }}>
                  <IconComponent size={24} />
                </div>

                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: '700',
                  margin: 0,
                  color: 'var(--text-color)'
                }}>
                  {feat.title}
                </h3>

                <p style={{
                  fontSize: '0.9rem',
                  lineHeight: '1.55',
                  color: 'var(--muted-text)',
                  margin: 0
                }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. FLUJO EN 3 PASOS ("¿CÓMO EMPEZAR?") ── */}
      <section style={{
        backgroundColor: 'var(--card-header-bg)',
        border: '1px solid var(--subborder-color)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <h2 style={{
            fontSize: '1.65rem',
            fontWeight: '800',
            margin: 0,
            color: 'var(--text-color)'
          }}>
            ¿Cómo empezar en tu simulación?
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted-text)', margin: 0 }}>
            Tres sencillos pasos para tener tu sesión lista en menos de 2 minutos
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          position: 'relative'
        }}>
          {/* Paso 1 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            backgroundColor: 'var(--panel-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: '900',
                color: '#3b82f6',
                fontFamily: 'monospace'
              }}>
                01
              </span>
              <span style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}>
                Comité & Quorum
              </span>
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--text-color)' }}>
              Configura tu sesión
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted-text)', margin: 0, lineHeight: '1.5' }}>
              Entra a la pestaña <strong>Comienzo</strong>, define el nombre del comité, tema de debate e importa tu lista de países desde Excel o texto.
            </p>
          </div>

          {/* Paso 2 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            backgroundColor: 'var(--panel-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: '900',
                color: '#10b981',
                fontFamily: 'monospace'
              }}>
                02
              </span>
              <span style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}>
                Pase de Lista & GSL
              </span>
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--text-color)' }}>
              Abre el debate
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted-text)', margin: 0, lineHeight: '1.5' }}>
              Realiza el pase de lista para calcular el quorum automáticamente y comienza a añadir oradores a la Lista General (GSL) con el temporizador.
            </p>
          </div>

          {/* Paso 3 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            backgroundColor: 'var(--panel-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: '900',
                color: '#8b5cf6',
                fontFamily: 'monospace'
              }}>
                03
              </span>
              <span style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                color: '#8b5cf6',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}>
                P2P & Proyección
              </span>
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--text-color)' }}>
              Transmite en vivo
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted-text)', margin: 0, lineHeight: '1.5' }}>
              Abre la sala en vivo, comparte el código QR con los delegados o proyecta la pantalla de secretaría en segunda ventana sin demoras.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. BLOC DE NOTAS RÁPIDO DE LA MESA (SCRATCHPAD) ── */}
      <section style={{
        backgroundColor: 'var(--panel-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: isLight
          ? '0 4px 15px rgba(0, 0, 0, 0.03)'
          : '0 8px 20px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: isLight ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.2)',
              color: '#3b82f6'
            }}>
              <Edit3 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: 'var(--text-color)' }}>
                Bloc de Notas Rápido de la Presidencia
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted-text)', margin: 0 }}>
                Guarda recordatorios, avisos o la agenda del día (se guarda localmente en tu navegador)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {notasGuardadasFlash && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.78rem',
                color: '#22c55e',
                fontWeight: '700'
              }}>
                <Check size={14} /> ¡Notas guardadas!
              </span>
            )}
            
            <button
              onClick={() => {
                if (editandoNotas) {
                  handleGuardarNotas();
                } else {
                  setEditandoNotas(true);
                  setNotasExpandidas(true);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: editandoNotas ? '#22c55e' : 'var(--btn-bg)',
                color: 'var(--btn-text)',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {editandoNotas ? <Save size={14} /> : <Edit3 size={14} />}
              {editandoNotas ? 'Guardar Cambios' : 'Editar Notas'}
            </button>

            <button
              onClick={() => setNotasExpandidas(!notasExpandidas)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.45rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'transparent',
                color: 'var(--text-color)',
                cursor: 'pointer'
              }}
              title={notasExpandidas ? 'Plegar notas' : 'Desplegar notas'}
            >
              {notasExpandidas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Contenido de notas */}
        {notasExpandidas && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {editandoNotas ? (
              <textarea
                value={notasTemp}
                onChange={(e) => setNotasTemp(e.target.value)}
                placeholder="Escribe tus notas, anotaciones de debate, directivas o recordatorios..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            ) : (
              <div style={{
                padding: '1rem',
                borderRadius: '10px',
                backgroundColor: 'var(--card-header-bg)',
                border: '1px solid var(--subborder-color)',
                fontSize: '0.92rem',
                lineHeight: '1.6',
                color: 'var(--text-color)',
                whiteSpace: 'pre-wrap',
                minHeight: '60px'
              }}>
                {notasUsuario || <span style={{ color: 'var(--muted-text)', fontStyle: 'italic' }}>Sin notas añadidas todavía...</span>}
              </div>
            )}

            {editandoNotas && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  onClick={handleLimpiarNotas}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={13} /> Limpiar todo
                </button>
                <button
                  onClick={() => {
                    setNotasTemp(notasUsuario);
                    setEditandoNotas(false);
                  }}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-color)',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── 6. SECCIÓN PREGUNTAS FRECUENTES (FAQ INTERACTIVO) ── */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        backgroundColor: 'var(--panel-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        boxShadow: isLight
          ? '0 10px 30px rgba(0, 0, 0, 0.04)'
          : '0 15px 35px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            backgroundColor: isLight ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.15)',
            color: '#3b82f6',
            fontSize: '0.8rem',
            fontWeight: '700',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            <HelpCircle size={15} /> Centro de Ayuda
          </div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '800',
            margin: 0,
            color: 'var(--text-color)',
            letterSpacing: '-0.02em'
          }}>
            Preguntas Frecuentes (FAQ)
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'var(--muted-text)',
            maxWidth: '650px',
            margin: 0
          }}>
            Resolvemos las dudas más habituales sobre el funcionamiento, privacidad y características de OpenMUN.
          </p>
        </div>

        {/* Barra de búsqueda y categorías */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '850px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Input de búsqueda */}
          <div style={{
            position: 'relative',
            width: '100%'
          }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted-text)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Buscar en preguntas frecuentes (ej: P2P, Excel, guardar, offline...)"
              value={busquedaFaq}
              onChange={(e) => setBusquedaFaq(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1rem 0.8rem 2.8rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                color: 'var(--text-color)',
                fontSize: '0.92rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
            {busquedaFaq && (
              <button
                onClick={() => setBusquedaFaq('')}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted-text)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Selector de Categorías */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {categorias.map((cat) => {
              const activa = categoriaFaq === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoriaFaq(cat)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: activa ? '700' : '500',
                    border: `1px solid ${activa ? '#3b82f6' : 'var(--border-color)'}`,
                    backgroundColor: activa
                      ? '#3b82f6'
                      : (isLight ? '#f1f5f9' : 'rgba(255,255,255,0.04)'),
                    color: activa ? '#ffffff' : 'var(--text-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Acordeones FAQ */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '850px',
          margin: '0 auto',
          width: '100%'
        }}>
          {faqsFiltrados.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2.5rem',
              color: 'var(--muted-text)',
              fontSize: '0.95rem'
            }}>
              No encontramos preguntas que coincidan con "<strong>{busquedaFaq}</strong>".
            </div>
          ) : (
            faqsFiltrados.map((faq) => {
              const estaAbierto = faqAbierto === faq.id;
              return (
                <div
                  key={faq.id}
                  style={{
                    backgroundColor: 'var(--card-header-bg)',
                    border: `1px solid ${estaAbierto ? 'rgba(59, 130, 246, 0.4)' : 'var(--subborder-color)'}`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: estaAbierto
                      ? '0 4px 15px rgba(59, 130, 246, 0.08)'
                      : 'none'
                  }}
                >
                  <button
                    onClick={() => setFaqAbierto(estaAbierto ? null : faq.id)}
                    style={{
                      width: '100%',
                      padding: '1.15rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--text-color)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        backgroundColor: isLight ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.18)',
                        color: '#3b82f6',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {faq.categoria}
                      </span>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: estaAbierto ? '700' : '600',
                        color: 'var(--text-color)'
                      }}>
                        {faq.pregunta}
                      </span>
                    </div>

                    <div style={{
                      color: estaAbierto ? '#3b82f6' : 'var(--muted-text)',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0
                    }}>
                      {estaAbierto ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>

                  {estaAbierto && (
                    <div style={{
                      padding: '0 1.25rem 1.25rem 1.25rem',
                      fontSize: '0.93rem',
                      lineHeight: '1.65',
                      color: 'var(--muted-text)',
                      borderTop: '1px solid var(--subborder-color)',
                      paddingTop: '0.9rem'
                    }}>
                      {faq.respuesta}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ── 7. SECCIÓN DE SUGERENCIAS Y COMUNIDAD ── */}
      <section style={{
        backgroundColor: 'var(--card-header-bg)',
        border: '1px solid var(--subborder-color)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        maxWidth: '880px',
        margin: '0 auto',
        width: '100%',
        boxShadow: isLight
          ? '0 10px 30px rgba(0, 0, 0, 0.04)'
          : '0 15px 35px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: isLight ? '#eff6ff' : 'rgba(59, 130, 246, 0.15)',
          color: '#3b82f6',
          boxShadow: '0 6px 20px rgba(59, 130, 246, 0.25)'
        }}>
          <MessageSquareHeart size={30} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
          <h3 style={{
            fontSize: '1.4rem',
            fontWeight: '800',
            margin: 0,
            color: 'var(--text-color)',
            letterSpacing: '-0.01em',
            textTransform: 'uppercase'
          }}>
            Por favor, forma parte de esto, envíanos sugerencias
          </h3>
          <p style={{
            fontSize: '0.98rem',
            lineHeight: '1.6',
            margin: 0,
            color: 'var(--muted-text)',
            maxWidth: '680px'
          }}>
            OpenMUN se construye con el aporte continuo de toda la comunidad internacional de MUNs. Si tienes comentarios, encuentras un error o quieres proponer una nueva funcionalidad, escríbenos directamente.
          </p>
        </div>

        {/* Caja de correo con botón de copiar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          backgroundColor: isLight ? '#ffffff' : 'rgba(0, 0, 0, 0.35)',
          border: '1px dashed var(--border-color)',
          borderRadius: '14px',
          padding: '0.75rem 1.4rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '580px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Mail size={22} style={{ color: '#3b82f6' }} />
            <span style={{
              fontSize: '1.05rem',
              fontWeight: '700',
              fontFamily: 'monospace',
              letterSpacing: '0.02em',
              color: 'var(--text-color)'
            }}>
              {emailPlaceholder}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button
              onClick={handleCopyEmail}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.95rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: copiado ? '#22c55e' : 'var(--btn-bg)',
                color: 'var(--btn-text)',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
              title="Copiar mail al portapapeles"
            >
              {copiado ? <Check size={16} /> : <Copy size={16} />}
              {copiado ? '¡Copiado!' : 'Copiar'}
            </button>

            <a
              href={`mailto:${emailPlaceholder}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.95rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'transparent',
                color: 'var(--text-color)',
                fontSize: '0.85rem',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Send size={15} /> Enviar correo
            </a>
          </div>
        </div>
      </section>

      {/* ── 8. FOOTER DE CRÉDITOS ── */}
      <footer style={{
        marginTop: '1rem',
        paddingTop: '2rem',
        borderTop: '1px solid var(--subborder-color)',
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.85rem',
        fontSize: '0.88rem',
        color: 'var(--muted-text)'
      }}>
        <div style={{
          fontWeight: '700',
          letterSpacing: '0.04em',
          color: 'var(--text-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <span>Plataforma creada por <strong>Lucas R. Kowalski</strong></span>
          <a
            href="https://github.com/luk4sk4"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub de Lucas R. Kowalski"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--card-header-bg)',
              color: 'var(--text-color)',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/lucas-kowalski"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn de Lucas R. Kowalski"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--card-header-bg)',
              color: 'var(--text-color)',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>
        </div>

        <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>
          OpenMUN © {new Date().getFullYear()} — Plataforma de Software Libre para Modelos de Naciones Unidas
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
