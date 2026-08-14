import React, { useState, useRef } from 'react';
import {
  Upload,
  ClipboardPaste,
  UserPlus,
  Trash2,
  Crown,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Globe2,
  Sparkles,
  X,
  FileText
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';

// ── Diccionario rápido de banderas para auto-detección ────────────────────────
const BANDERAS_MAP = {
  // P5
  'estados unidos': '🇺🇸', 'eeuu': '🇺🇸', 'usa': '🇺🇸', 'united states': '🇺🇸',
  'reino unido': '🇬🇧', 'uk': '🇬🇧', 'united kingdom': '🇬🇧', 'gran bretaña': '🇬🇧',
  'francia': '🇫🇷', 'france': '🇫🇷',
  'rusia': '🇷🇺', 'federacion rusa': '🇷🇺', 'federación rusa': '🇷🇺', 'russia': '🇷🇺',
  'china': '🇨🇳',
  // Iberoamérica
  'espana': '🇪🇸', 'españa': '🇪🇸', 'spain': '🇪🇸',
  'mexico': '🇲🇽', 'méxico': '🇲🇽',
  'argentina': '🇦🇷',
  'colombia': '🇨🇴',
  'chile': '🇨🇱',
  'peru': '🇵🇪', 'perú': '🇵🇪',
  'brasil': '🇧🇷', 'brazil': '🇧🇷',
  'ecuador': '🇪🇨',
  'venezuela': '🇻🇪',
  'uruguay': '🇺🇾',
  'paraguay': '🇵🇾',
  'bolivia': '🇧🇴',
  'cuba': '🇨🇺',
  'republica dominicana': '🇩🇴', 'república dominicana': '🇩🇴',
  'costa rica': '🇨🇷',
  'panama': '🇵🇦', 'panamá': '🇵🇦',
  'guatemala': '🇬🇹',
  'honduras': '🇭🇳',
  'el salvador': '🇸🇻',
  'nicaragua': '🇳🇮',
  // Europa
  'alemania': '🇩🇪', 'germany': '🇩🇪',
  'italia': '🇮🇹', 'italy': '🇮🇹',
  'portugal': '🇵🇹',
  'paises bajos': '🇳🇱', 'países bajos': '🇳🇱', 'holanda': '🇳🇱', 'netherlands': '🇳🇱',
  'belgica': '🇧🇪', 'bélgica': '🇧🇪', 'belgium': '🇧🇪',
  'suiza': '🇨🇭', 'switzerland': '🇨🇭',
  'austria': '🇦🇹',
  'suecia': '🇸🇪', 'sweden': '🇸🇪',
  'noruega': '🇳🇴', 'norway': '🇳🇴',
  'dinamarca': '🇩🇰', 'denmark': '🇩🇰',
  'finlandia': '🇫🇮', 'finland': '🇫🇮',
  'grecia': '🇬🇷', 'greece': '🇬🇷',
  'polonia': '🇵🇱', 'poland': '🇵🇱',
  'irlanda': '🇮🇪', 'ireland': '🇮🇪',
  'ucrania': '🇺🇦', 'ukraine': '🇺🇦',
  'turquia': '🇹🇷', 'turquía': '🇹🇷', 'turkey': '🇹🇷',
  // Asia / Oceanía
  'japon': '🇯🇵', 'japón': '🇯🇵', 'japan': '🇯🇵',
  'corea del sur': '🇰🇷', 'south korea': '🇰🇷', 'corea': '🇰🇷',
  'corea del norte': '🇰🇵', 'north korea': '🇰🇵',
  'india': '🇮🇳',
  'indonesia': '🇮🇩',
  'pakistan': '🇵🇰', 'pakistán': '🇵🇰',
  'australia': '🇦🇺',
  'nueva zelanda': '🇳🇿', 'new zealand': '🇳🇿',
  'singapur': '🇸🇬', 'singapore': '🇸🇬',
  'filipinas': '🇵🇭', 'philippines': '🇵🇭',
  'vietnam': '🇻🇳',
  'tailandia': '🇹🇭', 'thailand': '🇹🇭',
  'malasia': '🇲🇾', 'malaysia': '🇲🇾',
  // Medio Oriente
  'israel': '🇮🇱',
  'palestina': '🇵🇸', 'palestine': '🇵🇸',
  'arabia saudita': '🇸🇦', 'arabia saudi': '🇸🇦', 'saudi arabia': '🇸🇦',
  'iran': '🇮🇷', 'irán': '🇮🇷',
  'irak': '🇮🇶', 'iraq': '🇮🇶',
  'egipto': '🇪🇬', 'egypt': '🇪🇬',
  'emiratos arabes unidos': '🇦🇪', 'emiratos árabes unidos': '🇦🇪', 'eau': '🇦🇪', 'uae': '🇦🇪',
  'qatar': '🇶🇦',
  // África
  'sudafrica': '🇿🇦', 'sudáfrica': '🇿🇦', 'south africa': '🇿🇦',
  'nigeria': '🇳🇬',
  'kenia': '🇰🇪', 'kenya': '🇰🇪',
  'marruecos': '🇲🇦', 'morocco': '🇲🇦',
  'argelia': '🇩🇿', 'algeria': '🇩🇿',
  'ghana': '🇬🇭',
  'etiopia': '🇪🇹', 'etiopía': '🇪🇹', 'ethiopia': '🇪🇹',
  // América del Norte
  'canada': '🇨🇦', 'canadá': '🇨🇦',
  // Organizaciones
  'union europea': '🇪🇺', 'unión europea': '🇪🇺', 'ue': '🇪🇺', 'eu': '🇪🇺',
  'onu': '🇺🇳', 'naciones unidas': '🇺🇳', 'un': '🇺🇳'
};

const P5_SET = new Set([
  'estados unidos', 'eeuu', 'usa', 'united states',
  'reino unido', 'uk', 'united kingdom', 'gran bretaña',
  'francia', 'france',
  'rusia', 'federacion rusa', 'federación rusa', 'russia',
  'china'
]);

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function autodetectarBanderaYVeto(nombre) {
  const norm = normalizar(nombre);
  const bandera = BANDERAS_MAP[norm] || '🇺🇳';
  const veto = P5_SET.has(norm);
  return { bandera, veto };
}

// ── Presets de Comités ───────────────────────────────────────────────────────
const PRESETS = [
  {
    id: 'unsc',
    nombre: 'Consejo de Seguridad (UNSC)',
    paises: [
      { nombre: 'China', bandera: '🇨🇳', veto: true },
      { nombre: 'Estados Unidos', bandera: '🇺🇸', veto: true },
      { nombre: 'Francia', bandera: '🇫🇷', veto: true },
      { nombre: 'Reino Unido', bandera: '🇬🇧', veto: true },
      { nombre: 'Rusia', bandera: '🇷🇺', veto: true },
      { nombre: 'Argelia', bandera: '🇩🇿', veto: false },
      { nombre: 'Dinamarca', bandera: '🇩🇰', veto: false },
      { nombre: 'Grecia', bandera: '🇬🇷', veto: false },
      { nombre: 'Guyana', bandera: '🇬🇾', veto: false },
      { nombre: 'Pakistán', bandera: '🇵🇰', veto: false },
      { nombre: 'Panamá', bandera: '🇵🇦', veto: false },
      { nombre: 'República de Corea', bandera: '🇰🇷', veto: false },
      { nombre: 'Sierra Leona', bandera: '🇸🇱', veto: false },
      { nombre: 'Eslovenia', bandera: '🇸🇮', veto: false },
      { nombre: 'Somalia', bandera: '🇸🇴', veto: false }
    ]
  },
  {
    id: 'g20',
    nombre: 'Cumbre del G20',
    paises: [
      { nombre: 'Alemania', bandera: '🇩🇪', veto: false },
      { nombre: 'Arabia Saudita', bandera: '🇸🇦', veto: false },
      { nombre: 'Argentina', bandera: '🇦🇷', veto: false },
      { nombre: 'Australia', bandera: '🇦🇺', veto: false },
      { nombre: 'Brasil', bandera: '🇧🇷', veto: false },
      { nombre: 'Canadá', bandera: '🇨🇦', veto: false },
      { nombre: 'China', bandera: '🇨🇳', veto: true },
      { nombre: 'Corea del Sur', bandera: '🇰🇷', veto: false },
      { nombre: 'Estados Unidos', bandera: '🇺🇸', veto: true },
      { nombre: 'Francia', bandera: '🇫🇷', veto: true },
      { nombre: 'India', bandera: '🇮🇳', veto: false },
      { nombre: 'Indonesia', bandera: '🇮🇩', veto: false },
      { nombre: 'Italia', bandera: '🇮🇹', veto: false },
      { nombre: 'Japón', bandera: '🇯🇵', veto: false },
      { nombre: 'México', bandera: '🇲🇽', veto: false },
      { nombre: 'Reino Unido', bandera: '🇬🇧', veto: true },
      { nombre: 'Rusia', bandera: '🇷🇺', veto: true },
      { nombre: 'Sudáfrica', bandera: '🇿🇦', veto: false },
      { nombre: 'Turquía', bandera: '🇹🇷', veto: false },
      { nombre: 'Unión Europea', bandera: '🇪🇺', veto: false }
    ]
  },
  {
    id: 'latam',
    nombre: 'América Latina y Caribe (CELAC)',
    paises: [
      { nombre: 'Argentina', bandera: '🇦🇷', veto: false },
      { nombre: 'Bolivia', bandera: '🇧🇴', veto: false },
      { nombre: 'Brasil', bandera: '🇧🇷', veto: false },
      { nombre: 'Chile', bandera: '🇨🇱', veto: false },
      { nombre: 'Colombia', bandera: '🇨🇴', veto: false },
      { nombre: 'Costa Rica', bandera: '🇨🇷', veto: false },
      { nombre: 'Cuba', bandera: '🇨🇺', veto: false },
      { nombre: 'Ecuador', bandera: '🇪🇨', veto: false },
      { nombre: 'El Salvador', bandera: '🇸🇻', veto: false },
      { nombre: 'Guatemala', bandera: '🇬🇹', veto: false },
      { nombre: 'Honduras', bandera: '🇭🇳', veto: false },
      { nombre: 'México', bandera: '🇲🇽', veto: false },
      { nombre: 'Nicaragua', bandera: '🇳🇮', veto: false },
      { nombre: 'Panamá', bandera: '🇵🇦', veto: false },
      { nombre: 'Paraguay', bandera: '🇵🇾', veto: false },
      { nombre: 'Perú', bandera: '🇵🇪', veto: false },
      { nombre: 'República Dominicana', bandera: '🇩🇴', veto: false },
      { nombre: 'Uruguay', bandera: '🇺🇾', veto: false },
      { nombre: 'Venezuela', bandera: '🇻🇪', veto: false }
    ]
  }
];

// ── Parsers flexibles ────────────────────────────────────────────────────────
function filaAPais(fila, index) {
  if (typeof fila === 'string') {
    const limpio = fila.trim();
    if (!limpio) return null;
    const { bandera, veto } = autodetectarBanderaYVeto(limpio);
    return {
      id: `pais_${Date.now()}_${index}`,
      nombre: limpio,
      bandera,
      veto,
      estatus: 'Presente'
    };
  }

  const get = (...keys) => {
    for (const k of keys) {
      const found = Object.keys(fila).find(
        key => key.trim().toLowerCase() === k.toLowerCase()
      );
      if (found !== undefined && fila[found] !== undefined && fila[found] !== '') {
        return String(fila[found]).trim();
      }
    }
    return undefined;
  };

  const nombre = get('nombre', 'name', 'pais', 'country', 'delegacion', 'delegation');
  if (!nombre) return null;

  const auto = autodetectarBanderaYVeto(nombre);
  const id = get('id', 'codigo', 'code', 'iso') || `pais_${Date.now()}_${index}`;
  const bandera = get('bandera', 'flag', 'emoji') || auto.bandera;
  const vetoRaw = get('veto', 'p5', 'permanent_member', 'miembro_permanente');
  const veto = vetoRaw !== undefined
    ? ['true', '1', 'si', 'sí', 'yes', 's'].includes(vetoRaw.toLowerCase())
    : auto.veto;
  const estatusRaw = get('estatus', 'status', 'estado', 'asistencia') || 'Presente';
  const ESTATUSES_VALIDOS = ['Presente', 'Presente y Votando', 'Ausente'];
  const estatus = ESTATUSES_VALIDOS.find(e => e.toLowerCase() === estatusRaw.toLowerCase()) || 'Presente';

  return { id, nombre, bandera, veto, estatus };
}

function parsearTexto(texto) {
  const lineas = texto.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lineas.length === 0) return [];

  // Chequear si es CSV con cabecera
  const sep = lineas[0].includes(';') ? ';' : lineas[0].includes(',') ? ',' : null;
  if (sep && lineas.length > 1 && /nombre|name|pais|country/i.test(lineas[0])) {
    const cabeceras = lineas[0].split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
    return lineas.slice(1).map((linea, i) => {
      const valores = linea.split(sep).map(v => v.trim().replace(/^"|"$/g, ''));
      const fila = {};
      cabeceras.forEach((cab, j) => { fila[cab] = valores[j] || ''; });
      return filaAPais(fila, i);
    }).filter(Boolean);
  }

  // Lista simple de nombres (1 por línea o separados por comas)
  const items = texto.includes('\n')
    ? lineas
    : texto.split(',').map(s => s.trim()).filter(Boolean);

  return items.map((item, i) => filaAPais(item, i)).filter(Boolean);
}

function parsearJSON(texto) {
  const data = JSON.parse(texto);
  let arr = Array.isArray(data) ? data
    : Array.isArray(data.paises) ? data.paises
      : Array.isArray(data.delegaciones) ? data.delegaciones
        : Array.isArray(data.countries) ? data.countries
          : null;
  if (!arr) throw new Error('El JSON debe contener una lista o un array en "paises".');
  return arr.map((f, i) => filaAPais(f, i)).filter(Boolean);
}

async function parsearXLSX(archivo) {
  const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs');
  const buffer = await archivo.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const filas = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return filas.map((f, i) => filaAPais(f, i)).filter(Boolean);
}

// ── Componente Principal ────────────────────────────────────────────────────
const ImportarPaises = () => {
  const { paises, setPaises } = useSession();

  const [tab, setTab] = useState('archivo'); // 'archivo' | 'pegar' | 'individual' | 'presets'
  const [textoPegar, setTextoPegar] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [preview, setPreview] = useState(null);

  const fileInputRef = useRef(null);

  // Procesar archivo seleccionado
  const handleArchivo = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (fileInputRef.current) fileInputRef.current.value = '';

    setCargando(true);
    setError('');
    setExito('');
    setPreview(null);

    try {
      const ext = archivo.name.split('.').pop().toLowerCase();
      let parsed = [];

      if (ext === 'json') {
        parsed = parsearJSON(await archivo.text());
      } else if (ext === 'csv' || ext === 'txt') {
        parsed = parsearTexto(await archivo.text());
      } else if (ext === 'xlsx' || ext === 'xls') {
        parsed = await parsearXLSX(archivo);
      } else {
        throw new Error('Formato no soportado. Sube archivos .xlsx, .csv, .json o .txt');
      }

      if (parsed.length === 0) {
        throw new Error('No se detectaron delegaciones válidas en el archivo.');
      }
      setPreview(parsed);
    } catch (err) {
      setError(err.message || 'Error al procesar el archivo.');
    } finally {
      setCargando(false);
    }
  };

  // Procesar texto pegado
  const handleProcesarPegado = () => {
    setError('');
    setExito('');
    if (!textoPegar.trim()) {
      setError('Pega una lista de países antes de continuar.');
      return;
    }
    const parsed = parsearTexto(textoPegar);
    if (parsed.length === 0) {
      setError('No se encontraron países válidos en el texto.');
      return;
    }
    setPreview(parsed);
  };

  // Cargar preset de comisión
  const handleCargarPreset = (preset) => {
    const parsed = preset.paises.map((p, i) => ({
      id: `preset_${preset.id}_${i}_${Date.now()}`,
      nombre: p.nombre,
      bandera: p.bandera,
      veto: !!p.veto,
      estatus: 'Presente'
    }));
    setPreview(parsed);
  };

  // Añadir un solo país al instante
  const handleAñadirIndividual = (e) => {
    e?.preventDefault();
    if (!nuevoNombre.trim()) return;

    const { bandera, veto } = autodetectarBanderaYVeto(nuevoNombre.trim());
    const nuevo = {
      id: `pais_${Date.now()}`,
      nombre: nuevoNombre.trim(),
      bandera,
      veto,
      estatus: 'Presente'
    };

    setPaises([...paises, nuevo]);
    setNuevoNombre('');
    setExito(`"${nuevo.nombre}" añadido.`);
    setTimeout(() => setExito(''), 3000);
  };

  // Aplicar preview
  const handleAplicar = (modo) => {
    if (!preview || preview.length === 0) return;

    if (modo === 'reemplazar') {
      setPaises(preview);
      setExito(`Lista actualizada con ${preview.length} delegaciones.`);
    } else {
      const nombresExistentes = new Set(paises.map(p => p.nombre.toLowerCase()));
      const nuevos = preview.filter(p => !nombresExistentes.has(p.nombre.toLowerCase()));
      setPaises([...paises, ...nuevos]);
      setExito(`${nuevos.length} delegaciones nuevas añadidas.`);
    }
    setPreview(null);
    setTextoPegar('');
    setTimeout(() => setExito(''), 4000);
  };

  const handleVaciarLista = () => {
    if (paises.length === 0) return;
    if (window.confirm(`¿Eliminar las ${paises.length} delegaciones actuales?`)) {
      setPaises([]);
      setExito('Lista de delegaciones vaciada.');
      setTimeout(() => setExito(''), 3000);
    }
  };

  return (
    <div style={{
      padding: '0.85rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      backgroundColor: 'var(--panel-color)',
      color: 'var(--text-color)',
      gap: '0.65rem',
      fontSize: '0.82rem'
    }}>
      {/* Barra superior con contador y vaciar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.35rem 0.55rem',
        backgroundColor: 'var(--card-header-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', fontSize: '0.78rem' }}>
          <Globe2 size={14} color="#eab308" />
          <span>Delegaciones: <strong style={{ color: '#eab308' }}>{paises.length}</strong></span>
        </div>
        {paises.length > 0 && (
          <button
            onClick={handleVaciarLista}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.7rem',
              fontWeight: '600',
              opacity: 0.8
            }}
            title="Borrar todas las delegaciones actuales"
          >
            <Trash2 size={12} /> Vaciar
          </button>
        )}
      </div>

      {/* Selector de modo simplificado */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.25rem',
        backgroundColor: 'var(--card-header-bg)',
        padding: '2px',
        borderRadius: '6px',
        border: '1px solid var(--border-color)'
      }}>
        {[
          { key: 'archivo', label: 'Archivo', icon: Upload },
          { key: 'pegar', label: 'Pegar', icon: ClipboardPaste },
          { key: 'individual', label: '1 País', icon: UserPlus },
          { key: 'presets', label: 'Plantillas', icon: Sparkles }
        ].map(m => {
          const Icon = m.icon;
          const activo = tab === m.key && !preview;
          return (
            <button
              key={m.key}
              onClick={() => {
                setTab(m.key);
                setError('');
                setExito('');
                setPreview(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                padding: '0.35rem 0.2rem',
                fontSize: '0.74rem',
                fontWeight: '700',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: activo ? '#eab308' : 'transparent',
                color: activo ? '#000000' : 'var(--muted-text)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={12} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Alertas */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'rgba(239,68,68,0.12)',
          border: '1px solid #ef4444',
          borderRadius: '5px',
          padding: '0.4rem 0.6rem',
          fontSize: '0.74rem',
          color: '#ef4444'
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
      {exito && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'rgba(34,197,94,0.12)',
          border: '1px solid #22c55e',
          borderRadius: '5px',
          padding: '0.4rem 0.6rem',
          fontSize: '0.74rem',
          color: '#22c55e'
        }}>
          <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
          <span>{exito}</span>
        </div>
      )}

      {/* ── MODO 1: ARCHIVO (Izquierda: Subida, Derecha: Columnas esperadas) ── */}
      {tab === 'archivo' && !preview && (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '0.5rem', alignItems: 'stretch' }}>
          {/* Izquierda: Subir archivo */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: '8px',
              padding: '0.75rem 0.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: 'rgba(234,179,8,0.02)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#eab308';
              e.currentTarget.style.backgroundColor = 'rgba(234,179,8,0.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.backgroundColor = 'rgba(234,179,8,0.02)';
            }}
          >
            <Upload size={22} color="#eab308" />
            <div style={{ fontWeight: '700', fontSize: '0.8rem' }}>Subir archivo</div>
            <div style={{ fontSize: '0.66rem', opacity: 0.6 }}>
              Excel (.xlsx), CSV, JSON, TXT
            </div>
            {cargando && (
              <div style={{ fontSize: '0.68rem', color: '#eab308', marginTop: '0.2rem' }}>
                ⏳ Analizando...
              </div>
            )}
          </div>

          {/* Derecha: Columnas esperadas */}
          <div style={{
            backgroundColor: 'var(--card-header-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '0.45rem 0.55rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: '0.25rem'
          }}>
            <div style={{ fontSize: '0.67rem', fontWeight: '700', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              📋 Columnas esperadas:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {[
                { col: 'nombre / name', tag: 'Requerido', req: true },
                { col: 'bandera / emoji', tag: 'Opcional (auto)', req: false },
                { col: 'veto / p5', tag: 'Opcional (si/no)', req: false },
                { col: 'estatus / status', tag: 'Opcional', req: false }
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.66rem',
                    padding: '0.15rem 0.35rem',
                    backgroundColor: 'rgba(0,0,0,0.15)',
                    borderRadius: '4px'
                  }}
                >
                  <code style={{ color: '#eab308', fontWeight: '600', fontSize: '0.66rem' }}>{c.col}</code>
                  <span style={{
                    opacity: c.req ? 0.95 : 0.5,
                    fontSize: '0.6rem',
                    color: c.req ? '#22c55e' : 'inherit',
                    fontWeight: c.req ? '700' : 'normal'
                  }}>
                    {c.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.json,.txt"
            onChange={handleArchivo}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* ── MODO 2: PEGAR LISTA DE TEXTO ── */}
      {tab === 'pegar' && !preview && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <textarea
            value={textoPegar}
            onChange={e => setTextoPegar(e.target.value)}
            placeholder={'Pega tu lista de países aquí (uno por línea o separados por coma):\n\nArgentina\nBrasil\nChile\nColombia\nEspaña\nFrancia'}
            rows={5}
            style={{
              flex: 1,
              width: '100%',
              boxSizing: 'border-box',
              padding: '0.5rem',
              backgroundColor: 'var(--card-header-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-color)',
              fontSize: '0.78rem',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={handleProcesarPegado}
            style={{
              padding: '0.45rem',
              backgroundColor: '#eab308',
              color: '#000000',
              fontWeight: '700',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.78rem'
            }}
          >
            Procesar Lista
          </button>
        </div>
      )}

      {/* ── MODO 3: AÑADIR INDIVIDUAL ── */}
      {tab === 'individual' && !preview && (
        <form onSubmit={handleAñadirIndividual} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <input
              type="text"
              placeholder="Nombre del país (ej: Argentina, Francia...)"
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                padding: '0.5rem 0.65rem',
                backgroundColor: 'var(--card-header-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-color)',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!nuevoNombre.trim()}
              style={{
                padding: '0.5rem 0.8rem',
                backgroundColor: nuevoNombre.trim() ? '#eab308' : 'var(--card-header-bg)',
                color: nuevoNombre.trim() ? '#000000' : 'var(--muted-text)',
                fontWeight: '700',
                border: 'none',
                borderRadius: '6px',
                cursor: nuevoNombre.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.78rem'
              }}
            >
              <UserPlus size={13} /> Añadir
            </button>
          </div>
          <div style={{ fontSize: '0.68rem', opacity: 0.5, textAlign: 'center' }}>
            ✨ La bandera y el estatus de Veto se detectan automáticamente.
          </div>
        </form>
      )}

      {/* ── MODO 4: PRESETS DE COMITÉS ── */}
      {tab === 'presets' && !preview && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
          {PRESETS.map(p => (
            <div
              key={p.id}
              onClick={() => handleCargarPreset(p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.6rem',
                backgroundColor: 'var(--card-header-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#eab308'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.78rem' }}>{p.nombre}</div>
                <div style={{ fontSize: '0.68rem', opacity: 0.55 }}>{p.paises.length} delegaciones</div>
              </div>
              <button
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#eab308',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '700',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                Cargar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── VISTA PREVIA Y CONFIRMACIÓN ── */}
      {preview && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '700', fontSize: '0.78rem' }}>
              Detectados: <strong style={{ color: '#eab308' }}>{preview.length} países</strong>
            </span>
            <button
              onClick={() => setPreview(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--muted-text)', cursor: 'pointer', padding: '2px' }}
              title="Cancelar"
            >
              <X size={14} />
            </button>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem',
            backgroundColor: 'var(--card-header-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.35rem',
            maxHeight: '140px'
          }}>
            {preview.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', padding: '0.15rem 0.3rem' }}>
                <span>{p.bandera}</span>
                <span style={{ flex: 1, fontWeight: '600' }}>{p.nombre}</span>
                {p.veto && <Crown size={11} color="#eab308" title="Miembro Veto" />}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
            <button
              onClick={() => handleAplicar('reemplazar')}
              style={{
                padding: '0.45rem',
                backgroundColor: '#eab308',
                color: '#000000',
                fontWeight: '700',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.74rem'
              }}
            >
              Reemplazar Lista
            </button>
            <button
              onClick={() => handleAplicar('fusionar')}
              style={{
                padding: '0.45rem',
                backgroundColor: 'transparent',
                color: '#eab308',
                fontWeight: '700',
                border: '1px solid #eab308',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.74rem'
              }}
            >
              Añadir a Actual
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportarPaises;

