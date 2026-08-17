import React, { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Check,
  X,
  RotateCcw,
  Trash2,
  Copy,
  Download,
  Vote,
  Sparkles,
  FileSignature,
  Edit3,
  FilePlus,
  FileMinus,
  ArrowRight,
  Filter,
  Layers,
  BookOpen,
  ChevronDown,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import CountryFlag from '../common/CountryFlag';
import { useTranslation } from 'react-i18next';

// Plantilla de ejemplo de resolución MUN
const RESOLUCION_EJEMPLO = `# PROYECTO DE RESOLUCIÓN A/RES/79/L.4

**Comité:** Asamblea General - Primera Comisión (DISEC)  
**Tema:** Cooperación Internacional en la Prevención de Ciberamenazas y Seguridad Digital  
**Países Firmantes:** Francia, Brasil, Japón, Sudáfrica, Canadá  

---

### CLÁUSULAS PREAMBULATORIAS

*Reafirmando* los propósitos y principios consagrados en la Carta de las Naciones Unidas relativos al mantenimiento de la paz y seguridad internacional,

*Reconociendo* la creciente interdependencia de las infraestructuras críticas globales y su vulnerabilidad frente a ataques cibernéticos transfronterizos,

*Consciente* de la imperiosa necesidad de fortalecer las capacidades técnicas y de ciberdefensa en los Estados en desarrollo,

---

### CLÁUSULAS OPERATIVAS

**Artículo 1.** *Insta* a todos los Estados Miembros a adoptar directrices multilaterales vinculantes para la protección de infraestructuras críticas energéticas, financieras y hospitalarias contra ciberataques hostiles.

**Artículo 2.** *Propone* la creación de un Fondo Global de Asistencia Tecnológica y Ciberseguridad (FGATC), administrado bajo la supervisión de la Unión Internacional de Telecomunicaciones (UIT), financiado mediante contribuciones voluntarias de los Estados y el sector privado.

**Artículo 3.** *Exhorta* a la cooperación entre los equipos nacionales de respuesta a emergencias cibernéticas (CERT/CSIRT) para el intercambio ágil de información técnica sobre amenazas emergentes y vulnerabilidades críticas.

**Artículo 4.** *Solicita* al Secretario General que presente un informe exhaustivo en el octogésimo período de sesiones sobre los avances e implementación de mecanismos de fomento de la confianza en el ciberespacio.`;

// Parser inteligente de resolución en artículos / cláusulas
const parsearResolucion = (textoCompleto = '') => {
  if (!textoCompleto.trim()) return [];

  const lineas = textoCompleto.split('\n');
  const articulos = [];
  let buffer = [];
  let numArticulo = 1;
  let enPreambulo = true;
  let textoPreambulo = [];

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    const matchArticulo = linea.match(/^(?:(?:\*\*|\*|#+)?\s*(?:Artículo|Art\.|Cláusula|Operative Clause)\s*(\d+)[\.:\*\s]*)(.*)/i) ||
                          linea.match(/^(\d+)[\.\)]\s+(.*)/);

    if (matchArticulo) {
      if (enPreambulo && textoPreambulo.length > 0) {
        articulos.push({
          id: 'preambulo',
          numero: 0,
          prefijo: 'Preámbulo / Antecedentes',
          texto: textoPreambulo.join('\n').trim(),
          esPreambulo: true
        });
        textoPreambulo = [];
        enPreambulo = false;
      } else if (buffer.length > 0) {
        articulos.push({
          id: `art_${numArticulo - 1}`,
          numero: numArticulo - 1,
          prefijo: `Artículo ${numArticulo - 1}.`,
          texto: buffer.join('\n').trim()
        });
        buffer = [];
      }

      const numParsed = parseInt(matchArticulo[1], 10) || numArticulo;
      numArticulo = numParsed + 1;
      const contenidoRestante = matchArticulo[2] || '';
      if (contenidoRestante.trim()) {
        buffer.push(contenidoRestante.trim());
      }
    } else if (enPreambulo) {
      if (linea.includes('CLÁUSULAS OPERATIVAS') || linea.includes('OPERATIVE CLAUSES')) {
        enPreambulo = false;
        if (textoPreambulo.length > 0) {
          articulos.push({
            id: 'preambulo',
            numero: 0,
            prefijo: 'Preámbulo / Antecedentes',
            texto: textoPreambulo.join('\n').trim(),
            esPreambulo: true
          });
          textoPreambulo = [];
        }
      } else {
        textoPreambulo.push(linea);
      }
    } else {
      buffer.push(linea);
    }
  }

  if (enPreambulo && textoPreambulo.length > 0) {
    articulos.push({
      id: 'preambulo',
      numero: 0,
      prefijo: 'Preámbulo / Antecedentes',
      texto: textoPreambulo.join('\n').trim(),
      esPreambulo: true
    });
  } else if (buffer.length > 0) {
    articulos.push({
      id: `art_${numArticulo - 1}`,
      numero: numArticulo - 1,
      prefijo: `Artículo ${numArticulo - 1}.`,
      texto: buffer.join('\n').trim()
    });
  }

  // Si no se detectaron artículos explícitos, dividir por párrafos dobles
  if (articulos.length === 0 && textoCompleto.trim().length > 0) {
    const parrafos = textoCompleto.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    return parrafos.map((p, idx) => ({
      id: `art_${idx + 1}`,
      numero: idx + 1,
      prefijo: `Artículo ${idx + 1}.`,
      texto: p.trim()
    }));
  }

  return articulos;
};

const ControladorEnmiendas = () => {
  const { t } = useTranslation();
  const {
    paises,
    enmiendasSesion,
    setEnmiendasSesion,
    guardarResolucionEnmiendas,
    agregarEnmiendaResolucion,
    resolverEnmiendaResolucion,
    eliminarEnmiendaResolucion,
    configurarVotacion,
    resetearVotacion
  } = useSession();

  const {
    tituloProyecto = 'Proyecto de Resolución A/RES/79/1',
    textoResolucion = '',
    articulos = [],
    enmiendas = []
  } = enmiendasSesion || {};

  // Pestañas internas del widget: 'articulos' | 'consolidado' | 'importar'
  const [tabInterna, setTabInterna] = useState('articulos');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos' | 'pendiente' | 'aceptada' | 'rechazada'
  const [filtroArticulo, setFiltroArticulo] = useState('todos');

  // Estado del modal de proponer enmienda
  const [modalProponerOpen, setModalProponerOpen] = useState(false);
  const [selectedArticuloId, setSelectedArticuloId] = useState(null);
  const [tipoEnmienda, setTipoEnmienda] = useState('modificacion'); // 'adicion' | 'supresion' | 'modificacion'
  const [paisProponente, setPaisProponente] = useState('');
  const [textoOriginal, setTextoOriginal] = useState('');
  const [textoPropuesto, setTextoPropuesto] = useState('');
  const [justificacion, setJustificacion] = useState('');

  // Estado del editor de importación / pegado
  const [rawInputTexto, setRawInputTexto] = useState(textoResolucion || '');
  const [rawInputTitulo, setRawInputTitulo] = useState(tituloProyecto || '');
  const fileInputRef = useRef(null);

  // Países asistentes para el selector de proponentes
  const paisesAsistentes = useMemo(() => {
    return (paises || []).filter(p => p.estatus !== 'Ausente');
  }, [paises]);

  // Artículos parseados actuales o generados dinámicamente
  const articulosActuales = useMemo(() => {
    if (articulos && articulos.length > 0) return articulos;
    if (textoResolucion && textoResolucion.trim()) {
      return parsearResolucion(textoResolucion);
    }
    return [];
  }, [articulos, textoResolucion]);

  // Manejador de subida de archivos (.txt, .md)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      const parsed = parsearResolucion(content);
      const nombreLimpio = file.name.replace(/\.[^/.]+$/, "");
      
      guardarResolucionEnmiendas({
        titulo: nombreLimpio,
        texto: content,
        articulos: parsed
      });
      setRawInputTexto(content);
      setRawInputTitulo(nombreLimpio);
      setTabInterna('articulos');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Cargar borrador de ejemplo
  const handleCargarEjemplo = () => {
    const parsed = parsearResolucion(RESOLUCION_EJEMPLO);
    guardarResolucionEnmiendas({
      titulo: 'Proyecto de Resolución A/RES/79/L.4',
      texto: RESOLUCION_EJEMPLO,
      articulos: parsed
    });
    setRawInputTexto(RESOLUCION_EJEMPLO);
    setRawInputTitulo('Proyecto de Resolución A/RES/79/L.4');
    setTabInterna('articulos');
  };

  // Guardar texto pegado manualmente
  const handleGuardarTextoPegado = (e) => {
    e.preventDefault();
    const parsed = parsearResolucion(rawInputTexto);
    guardarResolucionEnmiendas({
      titulo: rawInputTitulo.trim() || 'Proyecto de Resolución',
      texto: rawInputTexto,
      articulos: parsed
    });
    setTabInterna('articulos');
  };

  // Abrir modal de enmienda con contexto de artículo
  const handleOpenProponer = (artId, textoSeleccionado = '') => {
    const art = articulosActuales.find(a => a.id === artId);
    setSelectedArticuloId(artId);
    if (textoSeleccionado) {
      setTextoOriginal(textoSeleccionado);
      setTipoEnmienda('modificacion');
    } else if (art) {
      setTextoOriginal(art.texto);
    } else {
      setTextoOriginal('');
    }
    setTextoPropuesto('');
    setJustificacion('');
    if (paisesAsistentes.length > 0 && !paisProponente) {
      setPaisProponente(paisesAsistentes[0].nombre);
    }
    setModalProponerOpen(true);
  };

  // Enviar formulario de proponer enmienda
  const handleSubmitEnmienda = (e) => {
    e.preventDefault();
    const art = articulosActuales.find(a => a.id === selectedArticuloId);
    const num = art ? art.numero : (articulosActuales.length + 1);

    agregarEnmiendaResolucion({
      tipo: tipoEnmienda,
      articuloId: selectedArticuloId,
      articuloNumero: art ? art.prefijo : `Artículo ${num}`,
      paisProponente: paisProponente.trim() || 'Delegación',
      textoOriginal: textoOriginal.trim(),
      textoPropuesto: textoPropuesto.trim(),
      justificacion: justificacion.trim()
    });

    setModalProponerOpen(false);
    setTextoPropuesto('');
    setTextoOriginal('');
  };

  // Sincronizar enmienda directamente con el Mini Widget de Votación
  const handleVotarEnmienda = (enmienda) => {
    const tipoBadge = enmienda.tipo === 'adicion'
      ? 'Adición'
      : enmienda.tipo === 'supresion'
        ? 'Supresión'
        : 'Modificación';

    const asuntoVoto = `Enmienda de ${tipoBadge} - ${enmienda.articuloNumero || 'Art.'} (${enmienda.paisProponente})`;
    
    configurarVotacion({
      asunto: asuntoVoto,
      tipoVotacion: 'substantive',
      tipoMayoria: 'simple',
      aplicarVeto: true
    });
    resetearVotacion();
  };

  // Copiar resolución consolidada al portapapeles
  const handleCopiarResolucion = () => {
    const texto = articulosActuales.map(a => `${a.prefijo ? a.prefijo + ' ' : ''}${a.texto}`).join('\n\n');
    navigator.clipboard.writeText(texto || textoResolucion);
    alert('¡Texto de la resolución copiado al portapapeles!');
  };

  // Descargar archivo de la resolución
  const handleDescargarResolucion = (formato = 'md') => {
    const texto = articulosActuales.map(a => `${a.prefijo ? a.prefijo + ' ' : ''}${a.texto}`).join('\n\n') || textoResolucion;
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(tituloProyecto || 'resolucion').toLowerCase().replace(/\s+/g, '_')}.${formato}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Estadísticas rápidas
  const totalEnmiendas = enmiendas.length;
  const enmiendasPendientes = enmiendas.filter(e => e.estado === 'pendiente').length;
  const enmiendasAceptadas = enmiendas.filter(e => e.estado === 'aceptada').length;
  const enmiendasRechazadas = enmiendas.filter(e => e.estado === 'rechazada').length;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--panel-bg)',
      color: 'var(--text-color)',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* ── HEADER DEL CONTROLADOR DE ENMIENDAS ── */}
      <div style={{
        padding: '0.65rem 0.85rem',
        paddingRight: '60px', // Dejar espacio libre en la esquina superior derecha para controles de movilidad
        borderBottom: '1px solid var(--subborder-color)',
        backgroundColor: 'var(--card-header-bg)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexShrink: 0
      }}>
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          padding: '0.35rem',
          borderRadius: '6px',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <FileSignature size={18} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: '800',
            color: 'var(--text-color)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {tituloProyecto || 'Controlador de Enmiendas'}
          </div>
          <div style={{
            fontSize: '0.68rem',
            color: 'var(--muted-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <span>{articulosActuales.length} artículos</span>
            <span>•</span>
            <span style={{ color: '#eab308' }}>{enmiendasPendientes} pendientes</span>
            <span>•</span>
            <span style={{ color: '#22c55e' }}>{enmiendasAceptadas} aceptadas</span>
          </div>
        </div>
      </div>

      {/* ── BARRA DE HERRAMIENTAS Y PESTAÑAS (Lejos de la esquina superior derecha) ── */}
      <div style={{
        padding: '0.4rem 0.75rem',
        borderBottom: '1px solid var(--subborder-color)',
        backgroundColor: 'var(--panel-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.35rem',
        flexWrap: 'wrap',
        flexShrink: 0
      }}>
        {/* Selector de Pestañas de Vista */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <button
            onClick={() => setTabInterna('articulos')}
            style={{
              background: tabInterna === 'articulos' ? 'var(--btn-bg)' : 'var(--card-hover, rgba(255,255,255,0.05))',
              color: tabInterna === 'articulos' ? 'var(--btn-text)' : 'var(--muted-text)',
              border: '1px solid var(--subborder-color)',
              borderRadius: '5px',
              padding: '0.3rem 0.6rem',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <Layers size={13} />
            <span>Por Artículos</span>
          </button>

          <button
            onClick={() => setTabInterna('consolidado')}
            style={{
              background: tabInterna === 'consolidado' ? 'var(--btn-bg)' : 'var(--card-hover, rgba(255,255,255,0.05))',
              color: tabInterna === 'consolidado' ? 'var(--btn-text)' : 'var(--muted-text)',
              border: '1px solid var(--subborder-color)',
              borderRadius: '5px',
              padding: '0.3rem 0.6rem',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <BookOpen size={13} />
            <span>Documento Consolidado</span>
          </button>

          <button
            onClick={() => setTabInterna('importar')}
            title="Importar o Pegar Resolución"
            style={{
              background: tabInterna === 'importar' ? 'var(--btn-bg)' : 'var(--card-hover, rgba(255,255,255,0.05))',
              color: tabInterna === 'importar' ? 'var(--btn-text)' : 'var(--muted-text)',
              border: '1px solid var(--subborder-color)',
              borderRadius: '5px',
              padding: '0.3rem 0.55rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.72rem',
              fontWeight: '600'
            }}
          >
            <Upload size={13} />
            <span>Cargar / Pegar</span>
          </button>
        </div>
      </div>

      {/* ── CUERPO PRINCIPAL DEL WIDGET ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {articulosActuales.length === 0 && tabInterna !== 'importar' ? (
          /* ── ESTADO VACÍO: INVITACIÓN A CARGAR RESOLUCIÓN ── */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            textAlign: 'center',
            padding: '2rem 1rem',
            color: 'var(--muted-text)',
            gap: '1rem'
          }}>
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              padding: '1rem',
              borderRadius: '50%',
              color: '#3b82f6'
            }}>
              <FileText size={40} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-color)', marginBottom: '0.25rem' }}>
                No hay ningún proyecto de resolución cargado
              </div>
              <div style={{ fontSize: '0.78rem', maxWidth: '420px', lineHeight: 1.4 }}>
                Sube un archivo (.txt o Markdown), pega el texto de un Google Doc o carga una resolución de ejemplo para empezar a gestionar enmiendas artículo por artículo.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={handleCargarEjemplo}
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981',
                  fontWeight: '700',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Sparkles size={15} /> Cargar Resolución de Ejemplo
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundColor: 'var(--btn-bg)',
                  color: 'var(--btn-text)',
                  border: 'none',
                  fontWeight: '700',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Upload size={15} /> Subir Archivo (.txt / .md)
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.text"
              style={{ display: 'none' }}
            />
          </div>
        ) : tabInterna === 'articulos' ? (
          /* ── VISTA ARTÍCULO POR ARTÍCULO Y ENMIENDAS ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Barra de Filtros y Botón de Nueva Enmienda Global */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              flexWrap: 'wrap',
              backgroundColor: 'var(--card-hover, rgba(255,255,255,0.02))',
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--subborder-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Filter size={13} color="var(--muted-text)" />
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--muted-text)' }}>Filtrar:</span>
                <select
                  value={filtroEstado}
                  onChange={e => setFiltroEstado(e.target.value)}
                  style={{
                    backgroundColor: 'var(--panel-bg)',
                    border: '1px solid var(--subborder-color)',
                    color: 'var(--text-color)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.4rem',
                    fontSize: '0.72rem'
                  }}
                >
                  <option value="todos">Todas ({totalEnmiendas})</option>
                  <option value="pendiente">Pendientes ({enmiendasPendientes})</option>
                  <option value="aceptada">Aceptadas ({enmiendasAceptadas})</option>
                  <option value="rechazada">Rechazadas ({enmiendasRechazadas})</option>
                </select>
              </div>

              <button
                onClick={() => handleOpenProponer(null)}
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#3b82f6',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '5px',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Plus size={14} /> Proponer Enmienda General
              </button>
            </div>

            {/* Listado de Artículos */}
            {articulosActuales.map(art => {
              const enmiendasArticulo = enmiendas.filter(e => {
                const coincideArt = e.articuloId === art.id;
                if (!coincideArt) return false;
                if (filtroEstado !== 'todos' && e.estado !== filtroEstado) return false;
                return true;
              });

              return (
                <div
                  key={art.id}
                  style={{
                    backgroundColor: 'var(--card-header-bg)',
                    border: `1px solid ${art.modificado ? 'rgba(34, 197, 94, 0.4)' : 'var(--subborder-color)'}`,
                    borderRadius: '8px',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Cabecera del Artículo */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: '800',
                        backgroundColor: art.esPreambulo ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        color: art.esPreambulo ? '#a855f7' : '#3b82f6',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {art.prefijo || `Artículo ${art.numero}`}
                      </span>
                      {art.modificado && (
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: '800',
                          backgroundColor: 'rgba(34, 197, 94, 0.15)',
                          color: '#22c55e',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '3px'
                        }}>
                          Modificado
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenProponer(art.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--subborder-color)',
                        color: 'var(--text-color)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Plus size={12} /> Proponer Enmienda
                    </button>
                  </div>

                  {/* Texto Oficial del Artículo */}
                  <div
                    onMouseUp={() => {
                      const selection = window.getSelection()?.toString();
                      if (selection && selection.trim().length > 3) {
                        // Selección de texto detectada
                      }
                    }}
                    style={{
                      fontSize: '0.8rem',
                      lineHeight: 1.5,
                      color: 'var(--text-color)',
                      backgroundColor: 'var(--panel-bg)',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--subborder-color)',
                      whiteSpace: 'pre-wrap',
                      userSelect: 'text'
                    }}
                  >
                    {art.texto}
                  </div>

                  {/* Feed de Enmiendas Propuestas para este Artículo */}
                  {enmiendasArticulo.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.2rem' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Mociones de Enmienda ({enmiendasArticulo.length})
                      </div>

                      {enmiendasArticulo.map(enm => {
                        const paisObj = (paises || []).find(p => p.nombre?.toLowerCase() === enm.paisProponente?.toLowerCase());
                        const esAdicion = enm.tipo === 'adicion';
                        const esSupresion = enm.tipo === 'supresion';
                        const esModificacion = enm.tipo === 'modificacion';

                        return (
                          <div
                            key={enm.id}
                            style={{
                              backgroundColor: enm.estado === 'aceptada'
                                ? 'rgba(34, 197, 94, 0.08)'
                                : enm.estado === 'rechazada'
                                  ? 'rgba(239, 68, 68, 0.08)'
                                  : 'var(--card-hover, rgba(255,255,255,0.03))',
                              border: `1px solid ${
                                enm.estado === 'aceptada'
                                  ? 'rgba(34, 197, 94, 0.4)'
                                  : enm.estado === 'rechazada'
                                    ? 'rgba(239, 68, 68, 0.4)'
                                    : 'var(--subborder-color)'
                              }`,
                              borderRadius: '6px',
                              padding: '0.6rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.4rem'
                            }}
                          >
                            {/* Cabecera de la Enmienda */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {/* Badge de Tipo */}
                                <span style={{
                                  fontSize: '0.65rem',
                                  fontWeight: '800',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  backgroundColor: esAdicion
                                    ? 'rgba(34, 197, 94, 0.2)'
                                    : esSupresion
                                      ? 'rgba(239, 68, 68, 0.2)'
                                      : 'rgba(59, 130, 246, 0.2)',
                                  color: esAdicion ? '#22c55e' : esSupresion ? '#ef4444' : '#3b82f6',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.2rem'
                                }}>
                                  {esAdicion && <FilePlus size={12} />}
                                  {esSupresion && <FileMinus size={12} />}
                                  {esModificacion && <Edit3 size={12} />}
                                  {esAdicion ? 'Adición' : esSupresion ? 'Supresión' : 'Modificación'}
                                </span>

                                {/* País Proponente */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  {paisObj && <CountryFlag country={paisObj} width="16px" height="12px" />}
                                  <span style={{ fontSize: '0.72rem', fontWeight: '700' }}>
                                    {enm.paisProponente}
                                  </span>
                                </div>
                              </div>

                              {/* Estado de la Enmienda */}
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: '800',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                backgroundColor: enm.estado === 'aceptada'
                                  ? 'rgba(34, 197, 94, 0.2)'
                                  : enm.estado === 'rechazada'
                                    ? 'rgba(239, 68, 68, 0.2)'
                                    : 'rgba(234, 179, 8, 0.2)',
                                color: enm.estado === 'aceptada'
                                  ? '#22c55e'
                                  : enm.estado === 'rechazada'
                                    ? '#ef4444'
                                    : '#eab308'
                              }}>
                                {enm.estado}
                              </span>
                            </div>

                            {/* Contenido Visual Diff */}
                            <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              {esAdicion && (
                                <div style={{
                                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                                  borderLeft: '3px solid #22c55e',
                                  padding: '0.35rem 0.5rem',
                                  borderRadius: '0 4px 4px 0',
                                  color: '#22c55e',
                                  fontWeight: '600'
                                }}>
                                  + {enm.textoPropuesto}
                                </div>
                              )}

                              {esSupresion && (
                                <div style={{
                                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                  borderLeft: '3px solid #ef4444',
                                  padding: '0.35rem 0.5rem',
                                  borderRadius: '0 4px 4px 0',
                                  color: '#ef4444',
                                  textDecoration: 'line-through',
                                  fontWeight: '500'
                                }}>
                                  - {enm.textoOriginal || 'Supresión total del artículo'}
                                </div>
                              )}

                              {esModificacion && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                  {enm.textoOriginal && (
                                    <div style={{
                                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                      padding: '0.25rem 0.45rem',
                                      borderRadius: '4px',
                                      color: '#ef4444',
                                      textDecoration: 'line-through',
                                      fontSize: '0.72rem'
                                    }}>
                                      {enm.textoOriginal}
                                    </div>
                                  )}
                                  <div style={{
                                    backgroundColor: 'rgba(34, 197, 94, 0.12)',
                                    padding: '0.25rem 0.45rem',
                                    borderRadius: '4px',
                                    color: '#22c55e',
                                    fontWeight: '600',
                                    fontSize: '0.72rem'
                                  }}>
                                    ➔ {enm.textoPropuesto}
                                  </div>
                                </div>
                              )}

                              {enm.justificacion && (
                                <div style={{ fontSize: '0.68rem', color: 'var(--muted-text)', fontStyle: 'italic', marginTop: '0.1rem' }}>
                                  Motivación: {enm.justificacion}
                                </div>
                              )}
                            </div>

                            {/* Botones de Acción sobre la Enmienda */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginTop: '0.2rem' }}>
                              <button
                                onClick={() => handleVotarEnmienda(enm)}
                                title="Votar esta enmienda en el Mini Sistema de Votación"
                                style={{
                                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                  border: '1px solid rgba(59, 130, 246, 0.3)',
                                  color: '#3b82f6',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.68rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                              >
                                <Vote size={12} /> Votar Moción
                              </button>

                              <div style={{ display: 'flex', gap: '0.3rem' }}>
                                {enm.estado === 'pendiente' ? (
                                  <>
                                    <button
                                      onClick={() => resolverEnmiendaResolucion(enm.id, 'aceptada')}
                                      title="Aceptar enmienda y actualizar texto automáticamente"
                                      style={{
                                        backgroundColor: '#16a34a',
                                        border: 'none',
                                        color: '#ffffff',
                                        padding: '0.25rem 0.55rem',
                                        borderRadius: '4px',
                                        fontSize: '0.68rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.2rem'
                                      }}
                                    >
                                      <Check size={12} /> Aceptar
                                    </button>

                                    <button
                                      onClick={() => resolverEnmiendaResolucion(enm.id, 'rechazada')}
                                      title="Rechazar enmienda"
                                      style={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                        border: '1px solid rgba(239, 68, 68, 0.4)',
                                        color: '#ef4444',
                                        padding: '0.25rem 0.55rem',
                                        borderRadius: '4px',
                                        fontSize: '0.68rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.2rem'
                                      }}
                                    >
                                      <X size={12} /> Rechazar
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => resolverEnmiendaResolucion(enm.id, 'pendiente')}
                                    title="Deshacer decisión y volver a pendiente"
                                    style={{
                                      backgroundColor: 'transparent',
                                      border: '1px solid var(--subborder-color)',
                                      color: 'var(--muted-text)',
                                      padding: '0.25rem 0.45rem',
                                      borderRadius: '4px',
                                      fontSize: '0.68rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.2rem'
                                    }}
                                  >
                                    <RotateCcw size={11} /> Deshacer
                                  </button>
                                )}

                                <button
                                  onClick={() => eliminarEnmiendaResolucion(enm.id)}
                                  title="Eliminar enmienda"
                                  style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: 'var(--muted-text)',
                                    padding: '0.25rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : tabInterna === 'consolidado' ? (
          /* ── VISTA CONSOLIDADA FINAL ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>Texto Consolidado de la Resolución</div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={handleCopiarResolucion}
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#3b82f6',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '5px',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Copy size={13} /> Copiar Texto
                </button>

                <button
                  onClick={() => handleDescargarResolucion('md')}
                  style={{
                    backgroundColor: 'var(--btn-bg)',
                    border: 'none',
                    color: 'var(--btn-text)',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '5px',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Download size={13} /> Descargar .md
                </button>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--card-header-bg)',
              border: '1px solid var(--subborder-color)',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '0.82rem',
              lineHeight: 1.6,
              color: 'var(--text-color)',
              whiteSpace: 'pre-wrap',
              userSelect: 'text'
            }}>
              {articulosActuales.length > 0
                ? articulosActuales.map(a => `${a.prefijo ? a.prefijo + ' ' : ''}${a.texto}`).join('\n\n')
                : (textoResolucion || 'Sin contenido')}
            </div>
          </div>
        ) : (
          /* ── VISTA DE IMPORTACIÓN Y PEGADO ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>Cargar Proyecto de Resolución</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)' }}>
              Pega el texto directamente desde Google Docs, Word o un archivo de texto. Nuestro parser segmentará automáticamente las cláusulas y artículos.
            </div>

            <form onSubmit={handleGuardarTextoPegado} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--muted-text)', display: 'block', marginBottom: '0.2rem' }}>
                  Título del Proyecto de Resolución:
                </label>
                <input
                  type="text"
                  value={rawInputTitulo}
                  onChange={e => setRawInputTitulo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.6rem',
                    backgroundColor: 'var(--card-hover, rgba(0,0,0,0.2))',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '6px',
                    color: 'var(--text-color)',
                    fontSize: '0.8rem'
                  }}
                  placeholder="Ej. Proyecto de Resolución A/RES/79/L.2"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--muted-text)', display: 'block', marginBottom: '0.2rem' }}>
                  Texto Completo del Borrador:
                </label>
                <textarea
                  value={rawInputTexto}
                  onChange={e => setRawInputTexto(e.target.value)}
                  rows={12}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    backgroundColor: 'var(--card-hover, rgba(0,0,0,0.2))',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '6px',
                    color: 'var(--text-color)',
                    fontSize: '0.78rem',
                    fontFamily: 'inherit',
                    lineHeight: 1.4,
                    resize: 'vertical'
                  }}
                  placeholder="Pega aquí el contenido del proyecto de resolución..."
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCargarEjemplo}
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10b981',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Usar Ejemplo
                </button>

                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--btn-bg)',
                    border: 'none',
                    color: 'var(--btn-text)',
                    padding: '0.45rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Procesar y Guardar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── MODAL DE PROPONER ENMIENDA / MOCIÓN ── */}
      {modalProponerOpen && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--panel-bg)',
            border: '1px solid var(--subborder-color)',
            borderRadius: '10px',
            padding: '1.25rem',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '800' }}>Proponer Enmienda / Moción</div>
              <button
                onClick={() => setModalProponerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--muted-text)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitEnmienda} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Selector de Tipo de Enmienda */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--muted-text)', display: 'block', marginBottom: '0.3rem' }}>
                  Naturaleza de la Enmienda:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => setTipoEnmienda('adicion')}
                    style={{
                      padding: '0.45rem',
                      borderRadius: '6px',
                      border: `1px solid ${tipoEnmienda === 'adicion' ? '#22c55e' : 'var(--subborder-color)'}`,
                      backgroundColor: tipoEnmienda === 'adicion' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                      color: tipoEnmienda === 'adicion' ? '#22c55e' : 'var(--text-color)',
                      fontWeight: '700',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <FilePlus size={13} /> Adición
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoEnmienda('supresion')}
                    style={{
                      padding: '0.45rem',
                      borderRadius: '6px',
                      border: `1px solid ${tipoEnmienda === 'supresion' ? '#ef4444' : 'var(--subborder-color)'}`,
                      backgroundColor: tipoEnmienda === 'supresion' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                      color: tipoEnmienda === 'supresion' ? '#ef4444' : 'var(--text-color)',
                      fontWeight: '700',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <FileMinus size={13} /> Supresión
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoEnmienda('modificacion')}
                    style={{
                      padding: '0.45rem',
                      borderRadius: '6px',
                      border: `1px solid ${tipoEnmienda === 'modificacion' ? '#3b82f6' : 'var(--subborder-color)'}`,
                      backgroundColor: tipoEnmienda === 'modificacion' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      color: tipoEnmienda === 'modificacion' ? '#3b82f6' : 'var(--text-color)',
                      fontWeight: '700',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Edit3 size={13} /> Modificación
                  </button>
                </div>
              </div>

              {/* Selector de Artículo Objetivo */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--muted-text)', display: 'block', marginBottom: '0.2rem' }}>
                  Artículo / Cláusula Objetivo:
                </label>
                <select
                  value={selectedArticuloId || ''}
                  onChange={e => {
                    setSelectedArticuloId(e.target.value);
                    const art = articulosActuales.find(a => a.id === e.target.value);
                    if (art && tipoEnmienda !== 'adicion') {
                      setTextoOriginal(art.texto);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.6rem',
                    backgroundColor: 'var(--card-hover, rgba(0,0,0,0.2))',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '6px',
                    color: 'var(--text-color)',
                    fontSize: '0.78rem'
                  }}
                >
                  <option value="">-- Nuevo Artículo al final --</option>
                  {articulosActuales.map(art => (
                    <option key={art.id} value={art.id}>
                      {art.prefijo || `Artículo ${art.numero}`} - {art.texto.substring(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Delegación Proponente */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--muted-text)', display: 'block', marginBottom: '0.2rem' }}>
                  Delegación Proponente:
                </label>
                {paisesAsistentes.length > 0 ? (
                  <select
                    value={paisProponente}
                    onChange={e => setPaisProponente(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      backgroundColor: 'var(--card-hover, rgba(0,0,0,0.2))',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '6px',
                      color: 'var(--text-color)',
                      fontSize: '0.78rem'
                    }}
                  >
                    {paisesAsistentes.map(p => (
                      <option key={p.id} value={p.nombre}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={paisProponente}
                    onChange={e => setPaisProponente(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      backgroundColor: 'var(--card-hover, rgba(0,0,0,0.2))',
                      border: '1px solid var(--subborder-color)',
                      borderRadius: '6px',
                      color: 'var(--text-color)',
                      fontSize: '0.78rem'
                    }}
                    placeholder="Ej. Francia"
                  />
                )}
              </div>

              {/* Campo de Texto Original (para Supresión o Modificación) */}
              {(tipoEnmienda === 'supresion' || tipoEnmienda === 'modificacion') && (
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: '700', color: '#ef4444', display: 'block', marginBottom: '0.2rem' }}>
                    {tipoEnmienda === 'supresion' ? 'Texto o Cláusula a Suprimir:' : 'Texto Original a Modificar / Reemplazar:'}
                  </label>
                  <textarea
                    value={textoOriginal}
                    onChange={e => setTextoOriginal(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      color: 'var(--text-color)',
                      fontSize: '0.76rem',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Pega o escribe el fragmento de texto a suprimir/reemplazar..."
                  />
                </div>
              )}

              {/* Campo de Texto Propuesto (para Adición o Modificación) */}
              {(tipoEnmienda === 'adicion' || tipoEnmienda === 'modificacion') && (
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: '700', color: '#22c55e', display: 'block', marginBottom: '0.2rem' }}>
                    {tipoEnmienda === 'adicion' ? 'Texto Nuevo a Añadir:' : 'Texto Propuesto de Reemplazo:'}
                  </label>
                  <textarea
                    value={textoPropuesto}
                    onChange={e => setTextoPropuesto(e.target.value)}
                    rows={3}
                    required
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      backgroundColor: 'rgba(34, 197, 94, 0.05)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '6px',
                      color: 'var(--text-color)',
                      fontSize: '0.76rem',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Escribe el texto propuesto..."
                  />
                </div>
              )}

              {/* Motivación / Justificación */}
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--muted-text)', display: 'block', marginBottom: '0.2rem' }}>
                  Justificación / Argumento (Opcional):
                </label>
                <input
                  type="text"
                  value={justificacion}
                  onChange={e => setJustificacion(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.6rem',
                    backgroundColor: 'var(--card-hover, rgba(0,0,0,0.2))',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '6px',
                    color: 'var(--text-color)',
                    fontSize: '0.76rem'
                  }}
                  placeholder="Ej. Armonizar con el derecho internacional vigente"
                />
              </div>

              {/* Botones del Modal */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setModalProponerOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '6px',
                    color: 'var(--text-color)',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: 'var(--btn-bg)',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'var(--btn-text)',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Registrar Moción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControladorEnmiendas;
