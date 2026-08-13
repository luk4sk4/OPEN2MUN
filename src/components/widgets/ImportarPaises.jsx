import React, { useState, useRef } from 'react';
import {
  Upload,
  UserPlus,
  Trash2,
  Crown,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileJson,
  X
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';

// ── Parsers ──────────────────────────────────────────────────────────────────

/**
 * Convierte una fila de objeto (columnas flexibles) a la estructura de país esperada.
 * Acepta variantes de nombre de columna en español e inglés.
 */
function filaAPais(fila, index) {
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

  const id = get('id', 'codigo', 'code', 'iso') || `pais_${Date.now()}_${index}`;
  const bandera = get('bandera', 'flag', 'emoji') || '🏳';
  const vetoRaw = get('veto', 'p5', 'permanent_member', 'miembro_permanente');
  const veto = vetoRaw
    ? ['true', '1', 'si', 'sí', 'yes', 's'].includes(vetoRaw.toLowerCase())
    : false;
  const estatusRaw = get('estatus', 'status', 'estado', 'asistencia') || 'Presente';
  const ESTATUSES_VALIDOS = ['Presente', 'Presente y Votando', 'Ausente'];
  const estatus = ESTATUSES_VALIDOS.find(e => e.toLowerCase() === estatusRaw.toLowerCase())
    || 'Presente';

  return { id, nombre, bandera, veto, estatus };
}

/**
 * Parsea CSV simple (coma o punto y coma). Primera línea = cabeceras.
 */
function parsearCSV(texto) {
  const lineas = texto.trim().split(/\r?\n/).filter(l => l.trim());
  if (lineas.length < 2) return [];

  const sep = lineas[0].includes(';') ? ';' : ',';
  const cabeceras = lineas[0].split(sep).map(c => c.trim().replace(/^"|"$/g, ''));

  return lineas.slice(1).map((linea, i) => {
    const valores = linea.split(sep).map(v => v.trim().replace(/^"|"$/g, ''));
    const fila = {};
    cabeceras.forEach((cab, j) => { fila[cab] = valores[j] || ''; });
    return filaAPais(fila, i);
  }).filter(Boolean);
}

/**
 * Parsea JSON: acepta array de objetos o { paises: [...] } o { delegaciones: [...] }.
 */
function parsearJSON(texto) {
  const data = JSON.parse(texto);
  let arr = Array.isArray(data) ? data
    : Array.isArray(data.paises) ? data.paises
    : Array.isArray(data.delegaciones) ? data.delegaciones
    : Array.isArray(data.countries) ? data.countries
    : null;
  if (!arr) throw new Error('El JSON debe ser un array o tener una propiedad "paises"/"countries"');
  return arr.map((f, i) => filaAPais(f, i)).filter(Boolean);
}

/**
 * Parsea XLSX usando SheetJS (cargado dinámicamente).
 */
async function parsearXLSX(archivo) {
  const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs');
  const buffer = await archivo.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const filas = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return filas.map((f, i) => filaAPais(f, i)).filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────

const ESTATUS_OPTS = ['Presente', 'Presente y Votando', 'Ausente'];

const PAIS_VACIO = { nombre: '', bandera: '🏳', veto: false, estatus: 'Presente' };

const ImportarPaises = () => {
  const { paises, setPaises } = useSession();

  // Estado UI
  const [tab, setTab] = useState('upload'); // 'upload' | 'manual'
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [preview, setPreview] = useState(null); // array de países parseados antes de confirmar

  // Formulario manual
  const [nuevoPais, setNuevoPais] = useState({ ...PAIS_VACIO });
  const fileInputRef = useRef(null);

  // ── Handlers de archivo ─────────────────────────────────────────────────

  const handleArchivo = async (e) => {
    const archivo = e.target.files[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
    if (!archivo) return;

    setCargando(true);
    setError('');
    setExito('');
    setPreview(null);

    try {
      const ext = archivo.name.split('.').pop().toLowerCase();
      let parsed = [];

      if (ext === 'json') {
        const texto = await archivo.text();
        parsed = parsearJSON(texto);
      } else if (ext === 'csv') {
        const texto = await archivo.text();
        parsed = parsearCSV(texto);
      } else if (ext === 'xlsx' || ext === 'xls') {
        parsed = await parsearXLSX(archivo);
      } else {
        throw new Error('Formato no soportado. Usa .json, .csv o .xlsx');
      }

      if (parsed.length === 0) {
        throw new Error('No se encontraron filas válidas. Revisa que el archivo tenga columna "nombre" o "name".');
      }

      setPreview(parsed);
    } catch (err) {
      setError(err.message || 'Error al procesar el archivo.');
    } finally {
      setCargando(false);
    }
  };

  const handleConfirmarImport = (modo) => {
    if (!preview) return;
    if (modo === 'reemplazar') {
      setPaises(preview);
    } else {
      // Fusionar: añade los nuevos que no existen (por nombre)
      const nombresExistentes = new Set(paises.map(p => p.nombre.toLowerCase()));
      const nuevos = preview.filter(p => !nombresExistentes.has(p.nombre.toLowerCase()));
      setPaises([...paises, ...nuevos]);
    }
    setExito(`${preview.length} delegaciones ${modo === 'reemplazar' ? 'importadas (lista reemplazada)' : `fusionadas (${preview.filter(p => !new Set(paises.map(x => x.nombre.toLowerCase())).has(p.nombre.toLowerCase())).length} nuevas añadidas)`}`);
    setPreview(null);
  };

  const handleCancelarPreview = () => {
    setPreview(null);
    setError('');
  };

  // ── Formulario manual ────────────────────────────────────────────────────

  const handleAñadirManual = () => {
    if (!nuevoPais.nombre.trim()) return;
    const paisNuevo = {
      ...nuevoPais,
      id: `pais_${Date.now()}`,
      nombre: nuevoPais.nombre.trim()
    };
    setPaises([...paises, paisNuevo]);
    setNuevoPais({ ...PAIS_VACIO });
    setExito(`"${paisNuevo.nombre}" añadido correctamente.`);
    setTimeout(() => setExito(''), 3000);
  };

  const handleEliminarPais = (id) => {
    setPaises(paises.filter(p => p.id !== id));
  };

  const handleToggleVeto = (id) => {
    setPaises(paises.map(p => p.id === id ? { ...p, veto: !p.veto } : p));
  };

  const handleLimpiarTodo = () => {
    if (paises.length === 0) return;
    if (window.confirm(`¿Eliminar las ${paises.length} delegaciones actuales?`)) {
      setPaises([]);
      setExito('Lista de delegaciones vaciada.');
      setTimeout(() => setExito(''), 3000);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  const inputStyle = {
    padding: '0.45rem 0.65rem',
    backgroundColor: 'var(--card-header-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: 'var(--text-color)',
    fontSize: '0.8rem',
    outline: 'none'
  };

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
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.3rem', backgroundColor: 'var(--card-header-bg)', padding: '3px', borderRadius: '7px', border: '1px solid var(--border-color)' }}>
        {[
          { key: 'upload', label: '📂 Importar Archivo', icon: FileSpreadsheet },
          { key: 'manual', label: '✍️ Añadir Manual', icon: UserPlus }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setError(''); setExito(''); setPreview(null); }}
            style={{
              flex: 1,
              padding: '0.4rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: tab === t.key ? '#eab308' : 'transparent',
              color: tab === t.key ? '#000000' : 'var(--muted-text)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '6px', padding: '0.6rem 0.75rem', fontSize: '0.78rem', color: '#ef4444' }}>
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
          {error}
        </div>
      )}
      {exito && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid #22c55e', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: '#22c55e' }}>
          <CheckCircle2 size={15} />
          {exito}
        </div>
      )}

      {/* ── TAB UPLOAD ── */}
      {tab === 'upload' && !preview && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Zona de drop / click */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: '10px',
              padding: '2rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: 'rgba(234,179,8,0.03)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#eab308'; e.currentTarget.style.backgroundColor = 'rgba(234,179,8,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'rgba(234,179,8,0.03)'; }}
          >
            <Upload size={32} color="#eab308" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
              Haz clic para seleccionar archivo
            </div>
            <div style={{ fontSize: '0.72rem', opacity: 0.55 }}>
              Formatos soportados: <strong>.xlsx</strong> · <strong>.csv</strong> · <strong>.json</strong>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.json"
            onChange={handleArchivo}
            style={{ display: 'none' }}
          />

          {/* Guía de columnas */}
          <div style={{ backgroundColor: 'var(--card-header-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', marginBottom: '0.5rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              📋 Columnas esperadas (nombres flexibles):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', fontSize: '0.72rem' }}>
              {[
                ['nombre / name', 'Requerido'],
                ['bandera / flag', 'Opcional (emoji)'],
                ['veto / p5', 'Opcional (true/false)'],
                ['estatus / status', 'Opcional (Presente...)'],
                ['id / codigo', 'Opcional'],
              ].map(([col, nota]) => (
                <div key={col} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0.4rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                  <code style={{ color: '#eab308', fontSize: '0.7rem' }}>{col}</code>
                  <span style={{ opacity: 0.55, fontSize: '0.68rem' }}>{nota}</span>
                </div>
              ))}
            </div>
          </div>

          {cargando && (
            <div style={{ textAlign: 'center', opacity: 0.6, fontSize: '0.8rem' }}>⏳ Procesando archivo...</div>
          )}
        </div>
      )}

      {/* ── PREVIEW DE IMPORTACIÓN ── */}
      {tab === 'upload' && preview && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>
              Vista previa: <span style={{ color: '#eab308' }}>{preview.length} delegaciones</span>
            </div>
            <button onClick={handleCancelarPreview} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', opacity: 0.6 }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '180px' }}>
            {preview.slice(0, 50).map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.5rem', backgroundColor: 'var(--card-header-bg)', borderRadius: '4px', fontSize: '0.78rem' }}>
                <span>{p.bandera}</span>
                <span style={{ flex: 1, fontWeight: '600' }}>{p.nombre}</span>
                {p.veto && <Crown size={12} color="#eab308" />}
                <span style={{ opacity: 0.5, fontSize: '0.68rem' }}>{p.estatus}</span>
              </div>
            ))}
            {preview.length > 50 && <div style={{ opacity: 0.5, textAlign: 'center', fontSize: '0.72rem' }}>...y {preview.length - 50} más</div>}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleConfirmarImport('reemplazar')}
              style={{ flex: 1, padding: '0.55rem', backgroundColor: '#eab308', color: '#000000', fontWeight: '700', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Reemplazar lista ({preview.length})
            </button>
            <button
              onClick={() => handleConfirmarImport('fusionar')}
              style={{ flex: 1, padding: '0.55rem', backgroundColor: 'transparent', color: '#eab308', fontWeight: '700', border: '1px solid #eab308', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Fusionar con actual
            </button>
          </div>
        </div>
      )}

      {/* ── TAB MANUAL ── */}
      {tab === 'manual' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Formulario de nuevo país */}
          <div style={{ backgroundColor: 'var(--card-header-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontWeight: '700', fontSize: '0.78rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nueva delegación</div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Nombre del país / delegación *"
                value={nuevoPais.nombre}
                onChange={e => setNuevoPais(p => ({ ...p, nombre: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAñadirManual()}
                style={{ ...inputStyle, gridColumn: '1 / -1' }}
              />
              <input
                type="text"
                placeholder="Bandera (emoji) 🏳"
                value={nuevoPais.bandera}
                onChange={e => setNuevoPais(p => ({ ...p, bandera: e.target.value }))}
                style={inputStyle}
              />
              <select
                value={nuevoPais.estatus}
                onChange={e => setNuevoPais(p => ({ ...p, estatus: e.target.value }))}
                style={inputStyle}
              >
                {ESTATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={nuevoPais.veto}
                  onChange={e => setNuevoPais(p => ({ ...p, veto: e.target.checked }))}
                  style={{ accentColor: '#eab308' }}
                />
                <Crown size={13} color={nuevoPais.veto ? '#eab308' : '#52525b'} />
                <span style={{ opacity: nuevoPais.veto ? 1 : 0.5 }}>Miembro P5 (Derecho a Veto)</span>
              </label>

              <button
                onClick={handleAñadirManual}
                disabled={!nuevoPais.nombre.trim()}
                style={{
                  padding: '0.45rem 0.9rem',
                  backgroundColor: nuevoPais.nombre.trim() ? '#eab308' : '#27272a',
                  color: nuevoPais.nombre.trim() ? '#000000' : '#52525b',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: nuevoPais.nombre.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.78rem'
                }}
              >
                <UserPlus size={14} /> Añadir
              </button>
            </div>
          </div>

          {/* Lista actual de países */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Delegaciones actuales ({paises.length})
            </div>
            {paises.length > 0 && (
              <button
                onClick={handleLimpiarTodo}
                style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.68rem', fontWeight: '700', cursor: 'pointer' }}
              >
                Vaciar todo
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {paises.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.35, fontSize: '0.8rem', marginTop: '1rem' }}>
                No hay delegaciones. Añade una arriba o importa un archivo.
              </div>
            ) : paises.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.5rem', backgroundColor: 'var(--card-header-bg)', borderRadius: '5px', fontSize: '0.78rem', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '1rem' }}>{p.bandera}</span>
                <span style={{ flex: 1, fontWeight: '600' }}>{p.nombre}</span>
                <button
                  onClick={() => handleToggleVeto(p.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', opacity: p.veto ? 1 : 0.25 }}
                  title={p.veto ? 'Quitar veto' : 'Dar veto'}
                >
                  <Crown size={13} color={p.veto ? '#eab308' : '#888'} fill={p.veto ? '#eab308' : 'none'} />
                </button>
                <span style={{ fontSize: '0.65rem', opacity: 0.5, minWidth: '60px', textAlign: 'right' }}>{p.estatus.replace('Presente y Votando', 'P.yV.')}</span>
                <button
                  onClick={() => handleEliminarPais(p.id)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6, padding: '2px' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportarPaises;
