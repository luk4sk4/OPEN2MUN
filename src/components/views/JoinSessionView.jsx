import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  ArrowLeft, 
  Key, 
  ShieldCheck, 
  User, 
  Lock, 
  Globe, 
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { useP2P } from '../../context/P2PContext';
import OpenMunLogo from '../common/OpenMunLogo';

const PAISES_DEFAULT = [
  "Alemania", "Argentina", "Brasil", "Canadá", "China", "Colombia", "Corea del Sur",
  "Egipto", "España", "Estados Unidos", "Federación Rusa", "Francia", "India", "Italia",
  "Japón", "México", "Noruega", "Reino Unido", "Sudáfrica", "Turquía", "Ucrania"
];

const JoinSessionView = ({ isLight, onBackToChair }) => {
  const { joinRoom, connectionStatus, error, roomId: defaultRoomId } = useP2P();

  const [roomIdInput, setRoomIdInput] = useState('');
  const [selectedRole, setSelectedRole] = useState('delegate'); // 'delegate' | 'secretariat' | 'backroom'
  const [selectedCountry, setSelectedCountry] = useState('');
  const [customCountry, setCustomCountry] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Si viene en la URL ?room=MUN-XXXX
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      const urlRole = params.get('role');
      if (urlRoom) setRoomIdInput(urlRoom.toUpperCase());
      else if (defaultRoomId) setRoomIdInput(defaultRoomId);

      if (urlRole && ['delegate', 'secretariat', 'backroom'].includes(urlRole)) {
        setSelectedRole(urlRole);
      }
    }
  }, [defaultRoomId]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!roomIdInput.trim()) {
      alert('Por favor introduce el código de la sala');
      return;
    }

    const finalCountry = customCountry.trim() || selectedCountry;
    if (selectedRole === 'delegate' && !finalCountry) {
      alert('Por favor selecciona o escribe tu país / delegación');
      return;
    }

    setIsSubmitting(true);
    const success = await joinRoom({
      targetRoomId: roomIdInput.trim().toUpperCase(),
      targetRole: selectedRole,
      password: passwordInput,
      country: finalCountry
    });
    setIsSubmitting(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-color)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Botón Volver a la Mesa Principal */}
      <button
        onClick={onBackToChair}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'transparent',
          border: '1px solid var(--subborder-color)',
          borderRadius: '8px',
          color: 'var(--muted-text)',
          padding: '0.5rem 0.85rem',
          fontSize: '0.82rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          transition: 'all 0.15s ease'
        }}
      >
        <ArrowLeft size={16} /> Volver a Modo Mesa (Chair)
      </button>

      <div style={{
        backgroundColor: 'var(--panel-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2.25rem 2rem',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Encabezado y Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
          <OpenMunLogo height={42} isLight={isLight} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Unirse a Sala en Vivo
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--muted-text)' }}>
              Conéctate a la sesión activa mediante red P2P
            </p>
          </div>
        </div>

        {/* Mensaje de Error si ocurrió alguno */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
            color: '#f87171'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Input Código de Sala */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Código de la Sala
            </label>
            <div style={{ display: 'flex', position: 'relative', marginTop: '0.4rem' }}>
              <input
                type="text"
                required
                placeholder="Ej: MUN-4921"
                value={roomIdInput}
                onChange={e => setRoomIdInput(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--card-header-bg)',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '8px',
                  padding: '0.7rem 0.9rem',
                  color: 'var(--text-color)',
                  fontWeight: '800',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  letterSpacing: '0.05em'
                }}
              />
            </div>
          </div>

          {/* Selector de Rol */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tipo de Sesión / Rol
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.4rem' }}>
              <button
                type="button"
                onClick={() => setSelectedRole('delegate')}
                style={{
                  padding: '0.65rem 0.5rem',
                  borderRadius: '8px',
                  border: `1px solid ${selectedRole === 'delegate' ? 'var(--btn-bg)' : 'var(--subborder-color)'}`,
                  backgroundColor: selectedRole === 'delegate' ? 'var(--btn-bg)' : 'var(--card-header-bg)',
                  color: selectedRole === 'delegate' ? 'var(--btn-text)' : 'var(--muted-text)',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <User size={16} /> Delegado
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('secretariat')}
                style={{
                  padding: '0.65rem 0.5rem',
                  borderRadius: '8px',
                  border: `1px solid ${selectedRole === 'secretariat' ? 'var(--btn-bg)' : 'var(--subborder-color)'}`,
                  backgroundColor: selectedRole === 'secretariat' ? 'var(--btn-bg)' : 'var(--card-header-bg)',
                  color: selectedRole === 'secretariat' ? 'var(--btn-text)' : 'var(--muted-text)',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <Layers size={16} /> Secreto
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('backroom')}
                style={{
                  padding: '0.65rem 0.5rem',
                  borderRadius: '8px',
                  border: `1px solid ${selectedRole === 'backroom' ? 'var(--btn-bg)' : 'var(--subborder-color)'}`,
                  backgroundColor: selectedRole === 'backroom' ? 'var(--btn-bg)' : 'var(--card-header-bg)',
                  color: selectedRole === 'backroom' ? 'var(--btn-text)' : 'var(--muted-text)',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <ShieldCheck size={16} /> Backroom
              </button>
            </div>
          </div>

          {/* Campos específicos por rol */}
          {selectedRole === 'delegate' ? (
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tu País / Delegación
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.4rem' }}>
                <select
                  value={selectedCountry}
                  onChange={e => { setSelectedCountry(e.target.value); setCustomCountry(''); }}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--card-header-bg)',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: 'var(--text-color)',
                    fontSize: '0.88rem',
                    fontWeight: '600'
                  }}
                >
                  <option value="">-- Seleccionar de la lista --</option>
                  {PAISES_DEFAULT.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="O escribe el nombre de tu delegación..."
                  value={customCountry}
                  onChange={e => { setCustomCountry(e.target.value); setSelectedCountry(''); }}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--card-header-bg)',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '8px',
                    padding: '0.6rem 0.85rem',
                    color: 'var(--text-color)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Contraseña / PIN de {selectedRole === 'secretariat' ? 'Secretaría' : 'Backroom'}
              </label>
              <div style={{ display: 'flex', position: 'relative', marginTop: '0.4rem' }}>
                <input
                  type="password"
                  required
                  placeholder="Introduce la contraseña"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--card-header-bg)',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: 'var(--text-color)',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                />
              </div>
            </div>
          )}

          {/* Botón Unirse */}
          <button
            type="submit"
            disabled={isSubmitting || connectionStatus === 'connecting'}
            style={{
              marginTop: '0.5rem',
              backgroundColor: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.8rem 1.5rem',
              fontWeight: '800',
              fontSize: '0.95rem',
              cursor: isSubmitting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <Radio size={17} />
            {isSubmitting ? 'Conectando...' : `Conectarse como ${selectedRole === 'delegate' ? 'Delegado' : selectedRole}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinSessionView;
