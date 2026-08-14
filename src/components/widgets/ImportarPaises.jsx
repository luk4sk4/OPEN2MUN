import React, { useState, useRef, useEffect } from 'react';
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
  FileText,
  Camera,
  Image as ImageIcon,
  Edit2,
  Plus
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import CountryFlag from '../common/CountryFlag';
import {
  normalizarBandera,
  procesarImagenBandera,
  DICCIONARIO_PAISES_ISO
} from '../../utils/flags';

const P5_SET = new Set([
  'estados unidos', 'eeuu', 'usa', 'united states', 'ee.uu.',
  'reino unido', 'uk', 'united kingdom', 'gran bretaña', 'gran bretana',
  'francia', 'france',
  'rusia', 'federacion rusa', 'federación rusa', 'russia',
  'china'
]);

function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function autodetectarBanderaYVeto(nombre) {
  const norm = normalizarTexto(nombre);
  const bandera = normalizarBandera('', nombre);
  const veto = P5_SET.has(norm);
  return { bandera, veto };
}

// ── Presets de Comités con Códigos ISO ───────────────────────────────────────
const PRESETS = [
  {
    id: 'unsc',
    nombre: 'Consejo de Seguridad (UNSC)',
    paises: [
      { nombre: 'China', bandera: 'cn', veto: true },
      { nombre: 'Estados Unidos', bandera: 'us', veto: true },
      { nombre: 'Francia', bandera: 'fr', veto: true },
      { nombre: 'Reino Unido', bandera: 'gb', veto: true },
      { nombre: 'Rusia', bandera: 'ru', veto: true },
      { nombre: 'Argelia', bandera: 'dz', veto: false },
      { nombre: 'Dinamarca', bandera: 'dk', veto: false },
      { nombre: 'Grecia', bandera: 'gr', veto: false },
      { nombre: 'Guyana', bandera: 'gy', veto: false },
      { nombre: 'Pakistán', bandera: 'pk', veto: false },
      { nombre: 'Panamá', bandera: 'pa', veto: false },
      { nombre: 'República de Corea', bandera: 'kr', veto: false },
      { nombre: 'Sierra Leona', bandera: 'sl', veto: false },
      { nombre: 'Eslovenia', bandera: 'si', veto: false },
      { nombre: 'Somalia', bandera: 'so', veto: false }
    ]
  },
  {
    id: 'g20',
    nombre: 'Cumbre del G20',
    paises: [
      { nombre: 'Alemania', bandera: 'de', veto: false },
      { nombre: 'Arabia Saudita', bandera: 'sa', veto: false },
      { nombre: 'Argentina', bandera: 'ar', veto: false },
      { nombre: 'Australia', bandera: 'au', veto: false },
      { nombre: 'Brasil', bandera: 'br', veto: false },
      { nombre: 'Canadá', bandera: 'ca', veto: false },
      { nombre: 'China', bandera: 'cn', veto: true },
      { nombre: 'Corea del Sur', bandera: 'kr', veto: false },
      { nombre: 'Estados Unidos', bandera: 'us', veto: true },
      { nombre: 'Francia', bandera: 'fr', veto: true },
      { nombre: 'India', bandera: 'in', veto: false },
      { nombre: 'Indonesia', bandera: 'id', veto: false },
      { nombre: 'Italia', bandera: 'it', veto: false },
      { nombre: 'Japón', bandera: 'jp', veto: false },
      { nombre: 'México', bandera: 'mx', veto: false },
      { nombre: 'Reino Unido', bandera: 'gb', veto: true },
      { nombre: 'Rusia', bandera: 'ru', veto: true },
      { nombre: 'Sudáfrica', bandera: 'za', veto: false },
      { nombre: 'Turquía', bandera: 'tr', veto: false },
      { nombre: 'Unión Europea', bandera: 'eu', veto: false }
    ]
  },
  {
    id: 'latam',
    nombre: 'América Latina y Caribe (CELAC)',
    paises: [
      { nombre: 'Argentina', bandera: 'ar', veto: false },
      { nombre: 'Bolivia', bandera: 'bo', veto: false },
      { nombre: 'Brasil', bandera: 'br', veto: false },
      { nombre: 'Chile', bandera: 'cl', veto: false },
      { nombre: 'Colombia', bandera: 'co', veto: false },
      { nombre: 'Costa Rica', bandera: 'cr', veto: false },
      { nombre: 'Cuba', bandera: 'cu', veto: false },
      { nombre: 'Ecuador', bandera: 'ec', veto: false },
      { nombre: 'El Salvador', bandera: 'sv', veto: false },
      { nombre: 'Guatemala', bandera: 'gt', veto: false },
      { nombre: 'Honduras', bandera: 'hn', veto: false },
      { nombre: 'México', bandera: 'mx', veto: false },
      { nombre: 'Nicaragua', bandera: 'ni', veto: false },
      { nombre: 'Panamá', bandera: 'pa', veto: false },
      { nombre: 'Paraguay', bandera: 'py', veto: false },
      { nombre: 'Perú', bandera: 'pe', veto: false },
      { nombre: 'República Dominicana', bandera: 'do', veto: false },
      { nombre: 'Uruguay', bandera: 'uy', veto: false },
      { nombre: 'Venezuela', bandera: 've', veto: false }
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
  const rawBandera = get('bandera', 'flag', 'emoji', 'imagen', 'image');
  const bandera = rawBandera ? normalizarBandera(rawBandera, nombre) : auto.bandera;
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
  const [nuevaBandera, setNuevaBandera] = useState('');
  const [nuevoVeto, setNuevoVeto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [preview, setPreview] = useState(null);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(null);

  const fileInputRef = useRef(null);
  const rowFileInputRef = useRef(null);
  const individualFileInputRef = useRef(null);

  // Soporte global de Pegado (Ctrl+V) cuando se tiene una fila de preview seleccionada
  useEffect(() => {
    const handlePaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            try {
              const base64 = await procesarImagenBandera(file);
              if (preview && selectedPreviewIndex !== null && preview[selectedPreviewIndex]) {
                e.preventDefault();
                setPreview(prev => {
                  const copy = [...prev];
                  copy[selectedPreviewIndex] = { ...copy[selectedPreviewIndex], bandera: base64 };
                  return copy;
                });
                setExito(`✨ Imagen pegada a "${preview[selectedPreviewIndex].nombre}"`);
                setTimeout(() => setExito(''), 3000);
              } else if (tab === 'individual') {
                e.preventDefault();
                setNuevaBandera(base64);
                setExito('✨ Imagen personalizada pegada');
                setTimeout(() => setExito(''), 3000);
              }
            } catch (err) {
              console.error('Error al procesar imagen pegada:', err);
            }
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [preview, selectedPreviewIndex, tab]);

  // Procesar archivo seleccionado
  const handleArchivo = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (fileInputRef.current) fileInputRef.current.value = '';

    setCargando(true);
    setError('');
    setExito('');
    setPreview(null);
    setSelectedPreviewIndex(null);

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
    setSelectedPreviewIndex(null);
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
    setSelectedPreviewIndex(null);
  };

  // Añadir un solo país al instante
  const handleAñadirIndividual = (e) => {
    e?.preventDefault();
    if (!nuevoNombre.trim()) return;

    const auto = autodetectarBanderaYVeto(nuevoNombre.trim());
    const finalBandera = nuevaBandera || auto.bandera;

    const nuevo = {
      id: `pais_${Date.now()}`,
      nombre: nuevoNombre.trim(),
      bandera: finalBandera,
      veto: nuevoVeto || auto.veto,
      estatus: 'Presente'
    };

    setPaises([...paises, nuevo]);
    setNuevoNombre('');
    setNuevaBandera('');
    setNuevoVeto(false);
    setExito(`"${nuevo.nombre}" añadido correctamente.`);
    setTimeout(() => setExito(''), 3000);
  };

  // Subir imagen para una fila concreta de la previsualización
  const handleSubirImagenFila = async (e) => {
    const file = e.target.files?.[0];
    if (!file || selectedPreviewIndex === null) return;

    try {
      const base64 = await procesarImagenBandera(file);
      setPreview(prev => {
        const copy = [...prev];
        copy[selectedPreviewIndex] = { ...copy[selectedPreviewIndex], bandera: base64 };
        return copy;
      });
      setExito(`✨ Imagen asignada a "${preview[selectedPreviewIndex].nombre}"`);
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Error al procesar la imagen.');
    } finally {
      if (rowFileInputRef.current) rowFileInputRef.current.value = '';
    }
  };

  // Subir imagen para creación individual
  const handleSubirImagenIndividual = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await procesarImagenBandera(file);
      setNuevaBandera(base64);
      setExito('✨ Imagen cargada');
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Error al procesar la imagen.');
    }
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
    setSelectedPreviewIndex(null);
    setTextoPegar('');
    setTimeout(() => setExito(''), 4000);
  };

  const handleVaciarLista = () => {
    if (paises.length === 0) return;
    if (confirm('¿Vaciar toda la lista de delegaciones del comité actual?')) {
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
      {/* Input oculto para subida de imagen por fila en preview */}
      <input
        ref={rowFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleSubirImagenFila}
        style={{ display: 'none' }}
      />

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

      {/* Selector de modo */}
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
                setSelectedPreviewIndex(null);
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

      {/* ── MODO 1: ARCHIVO ── */}
      {tab === 'archivo' && !preview && (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '0.5rem', alignItems: 'stretch' }}>
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
                { col: 'Nombre / Pais', req: true, desc: 'Nombre de la delegación' },
                { col: 'Bandera / Flag', req: false, desc: 'ISO (es, us) o URL / imagen' },
                { col: 'Veto / P5', req: false, desc: 'true/si/1 para derecho a veto' }
              ].map(c => (
                <div key={c.col} style={{ fontSize: '0.69rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <code style={{
                    backgroundColor: 'rgba(234,179,8,0.12)',
                    color: '#eab308',
                    padding: '1px 4px',
                    borderRadius: '3px',
                    fontSize: '0.66rem'
                  }}>
                    {c.col}
                  </code>
                  {c.req && <span style={{ color: '#ef4444', fontSize: '0.65rem' }}>*</span>}
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

      {/* ── MODO 2: PEGAR TEXTO ── */}
      {tab === 'pegar' && !preview && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <textarea
            value={textoPegar}
            onChange={(e) => setTextoPegar(e.target.value)}
            placeholder="Pega nombres de países (uno por línea o separados por coma):&#10;España&#10;Francia&#10;Estados Unidos&#10;Cruz Roja..."
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: 'var(--input-bg, rgba(255,255,255,0.04))',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-color)',
              fontSize: '0.76rem',
              fontFamily: 'monospace',
              resize: 'none'
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
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <Sparkles size={13} />
            Analizar y Previsualizar
          </button>
        </div>
      )}

      {/* ── MODO 3: INDIVIDUAL CON SOPORTE DE IMAGEN / CTRL+V ── */}
      {tab === 'individual' && !preview && (
        <form onSubmit={handleAñadirIndividual} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.2rem' }}>
              Nombre de la Delegación:
            </label>
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Ej. Japón, Médicos Sin Fronteras, URSS..."
              style={{
                width: '100%',
                padding: '0.45rem 0.6rem',
                backgroundColor: 'var(--input-bg, rgba(255,255,255,0.04))',
                border: '1px solid var(--border-color)',
                borderRadius: '5px',
                color: 'var(--text-color)',
                fontSize: '0.78rem',
                fontWeight: '600'
              }}
            />
          </div>

          {/* Selector / Subir Bandera o Pegar Ctrl+V */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem',
            backgroundColor: 'var(--card-header-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px'
          }}>
            <CountryFlag
              bandera={nuevaBandera || normalizarBandera('', nuevoNombre)}
              nombre={nuevoNombre || 'Delegación'}
              size="md"
            />
            <div style={{ flex: 1, fontSize: '0.7rem', color: 'var(--muted-text)' }}>
              {nuevaBandera ? 'Imagen asignada' : 'Autodetectada o pega con Ctrl+V'}
            </div>
            <button
              type="button"
              onClick={() => individualFileInputRef.current?.click()}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: 'var(--border-color)',
                color: 'var(--text-color)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <Upload size={11} /> Imagen
            </button>
            <input
              ref={individualFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleSubirImagenIndividual}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.2rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={nuevoVeto}
                onChange={(e) => setNuevoVeto(e.target.checked)}
                style={{ accentColor: '#eab308' }}
              />
              <span>Derecho a Veto (P5)</span>
            </label>

            <button
              type="submit"
              style={{
                padding: '0.45rem 0.9rem',
                backgroundColor: '#22c55e',
                color: '#ffffff',
                fontWeight: '700',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Plus size={14} />
              Añadir
            </button>
          </div>
        </form>
      )}

      {/* ── MODO 4: PRESETS ── */}
      {tab === 'presets' && !preview && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto' }}>
          {PRESETS.map(p => (
            <div
              key={p.id}
              onClick={() => handleCargarPreset(p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.65rem',
                backgroundColor: 'var(--card-header-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.78rem' }}>{p.nombre}</div>
                <div style={{ fontSize: '0.68rem', opacity: 0.55 }}>{p.paises.length} delegaciones oficiales</div>
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

      {/* ── VISTA PREVIA INTERACTIVA (Paso de revisión con cambio de bandera y Ctrl+V) ── */}
      {preview && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '700', fontSize: '0.78rem' }}>
              Detectados: <strong style={{ color: '#eab308' }}>{preview.length} países</strong>
              <span style={{ fontSize: '0.68rem', color: 'var(--muted-text)', marginLeft: '0.4rem' }}>
                (Haz clic en 📷 o presiona <strong>Ctrl+V</strong> para asignar imagen)
              </span>
            </span>
            <button
              onClick={() => { setPreview(null); setSelectedPreviewIndex(null); }}
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
            gap: '0.25rem',
            backgroundColor: 'var(--card-header-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.4rem',
            maxHeight: '150px'
          }}>
            {preview.map((p, i) => {
              const isSelected = selectedPreviewIndex === i;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedPreviewIndex(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.74rem',
                    padding: '0.2rem 0.4rem',
                    borderRadius: '4px',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
                    border: isSelected ? '1px solid #3b82f6' : '1px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  <CountryFlag bandera={p.bandera} nombre={p.nombre} size="sm" />
                  
                  {/* Botón rápido para subir imagen a esta delegación */}
                  <button
                    type="button"
                    title="Subir imagen personalizada para esta delegación"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPreviewIndex(i);
                      rowFileInputRef.current?.click();
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '2px',
                      color: isSelected ? '#3b82f6' : 'var(--muted-text)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Camera size={12} />
                  </button>

                  <span style={{ flex: 1, fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.nombre}
                  </span>

                  {p.veto && <Crown size={12} color="#eab308" title="Miembro Veto" />}

                  {/* Eliminar fila del preview */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(prev => prev.filter((_, idx) => idx !== i));
                      if (selectedPreviewIndex === i) setSelectedPreviewIndex(null);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--muted-text)',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                    title="Eliminar de la lista"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
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
