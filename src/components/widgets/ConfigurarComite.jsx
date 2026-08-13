import React, { useState } from 'react';
import { Building2, Check, Pencil } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const ConfigurarComite = () => {
  const { nombreComite, setNombreComite } = useSession();
  const [editando, setEditando] = useState(false);
  const [inputValue, setInputValue] = useState(nombreComite);
  const [guardado, setGuardado] = useState(false);

  const handleGuardar = () => {
    if (!inputValue.trim()) return;
    setNombreComite(inputValue.trim());
    setEditando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleGuardar();
    if (e.key === 'Escape') {
      setInputValue(nombreComite);
      setEditando(false);
    }
  };

  const handleEditar = () => {
    setInputValue(nombreComite);
    setEditando(true);
    setGuardado(false);
  };

  return (
    <div style={{
      padding: '1.25rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      backgroundColor: 'var(--panel-color)',
      color: 'var(--text-color)',
      gap: '1rem'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <Building2 size={18} color="#eab308" />
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Nombre del Comité</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.55 }}>Identifica la asamblea o comisión de esta sesión</div>
        </div>
      </div>

      {/* Nombre actual */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        {/* Display del nombre actual */}
        <div style={{
          backgroundColor: 'rgba(234, 179, 8, 0.07)',
          border: '1px solid #eab308',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          boxShadow: '0 0 18px rgba(234,179,8,0.08)'
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            🏛️ COMITÉ ACTIVO
          </div>
          {nombreComite ? (
            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-color)', lineHeight: 1.3 }}>
              {nombreComite}
            </div>
          ) : (
            <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#52525b', fontStyle: 'italic' }}>
              Sin nombre asignado
            </div>
          )}
        </div>

        {/* Input de edición */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: '600', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {nombreComite ? 'Cambiar nombre:' : 'Asignar nombre:'}
          </label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setEditando(true)}
              placeholder="Ej: Asamblea General • Consejo de Seguridad • ECOSOC..."
              style={{
                flex: 1,
                padding: '0.6rem 0.85rem',
                backgroundColor: 'var(--card-header-bg)',
                border: `1px solid ${editando ? '#eab308' : 'var(--border-color)'}`,
                borderRadius: '6px',
                color: 'var(--text-color)',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
            />
            <button
              onClick={handleGuardar}
              disabled={!inputValue.trim()}
              style={{
                padding: '0.6rem 1rem',
                backgroundColor: guardado ? '#22c55e' : (inputValue.trim() ? '#eab308' : '#27272a'),
                color: guardado ? '#ffffff' : (inputValue.trim() ? '#000000' : '#52525b'),
                fontWeight: '700',
                border: 'none',
                borderRadius: '6px',
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.82rem',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {guardado ? <><Check size={15} /> Guardado</> : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurarComite;
