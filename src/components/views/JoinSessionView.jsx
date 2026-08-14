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
  Layers,
  Eye,
  EyeOff,
  Building2,
  ShieldAlert,
  CheckCircle2
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
  const [mostrarPassword, setMostrarPassword] = useState(false);
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
      fontFamily: 'Inter, system-ui, sans-serif',
      position: 'relative'
    }}>
      {/* Botón Volver a la Mesa Principal */}
      <button
        onClick={onBackToChair}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          background: 'transparent',
          border: '1px solid var(--subborder-color)',
          borderRadius: '10px',
          color: 'var(--muted-text)',
          padding: '0.55rem 0.95rem',
          fontSize: '0.82rem',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          transition: 'all 0.15s ease'
        }}
      >
        <ArrowLeft size={16} /> Volver a Modo Mesa (Chair)
      </button>

      <div style={{
        backgroundColor: 'var(--panel-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '2.5rem 2.2rem',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 25px 60px rgba(0,0,0,0.55)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Encabezado y Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.85rem' }}>
          <OpenMunLogo height={46} isLight={isLight} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Unirse a Sala en Vivo
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--muted-text)' }}>
              Conéctate a la sesión activa mediante la red descentralizada P2P
            </p>
          </div>
        </div>

        {/* Mensaje de Error si ocurrió alguno */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            color: '#f87171',
            fontSize: '0.82rem'
          }}>
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Código de Sala */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Código de Sala (Room ID)
            </label>
            <div style={{ position: 'relative', marginTop: '0.4rem' }}>
              <input
                type="text"
                placeholder="Ej: MUN-4921"
                value={roomIdInput}
                onChange={e => setRoomIdInput(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--card-header-bg)',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  color: 'var(--text-color)',
                  fontWeight: '800',
                  fontFamily: 'monospace',
                  fontSize: '1.15rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              />
              <Radio size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-text)' }} />
            </div>
          </div>

          {/* Selector de Rol en Tarjetas */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tipo de Acceso / Rol
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginTop: '0.4rem' }}>
              {/* Delegado */}
              <div
                onClick={() => setSelectedRole('delegate')}
                style={{
                  border: `1.5px solid ${selectedRole === 'delegate' ? '#22c55e' : 'var(--subborder-color)'}`,
                  backgroundColor: selectedRole === 'delegate' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  padding: '0.75rem 0.5rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <User size={18} color={selectedRole === 'delegate' ? '#22c55e' : 'var(--muted-text)'} />
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: selectedRole === 'delegate' ? '#22c55e' : 'var(--text-color)' }}>
                  Delegación
                </span>
              </div>

              {/* Secretaría */}
              <div
                onClick={() => setSelectedRole('secretariat')}
                style={{
                  border: `1.5px solid ${selectedRole === 'secretariat' ? '#3b82f6' : 'var(--subborder-color)'}`,
                  backgroundColor: selectedRole === 'secretariat' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  padding: '0.75rem 0.5rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <Layers size={18} color={selectedRole === 'secretariat' ? '#3b82f6' : 'var(--muted-text)'} />
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: selectedRole === 'secretariat' ? '#3b82f6' : 'var(--text-color)' }}>
                  Secretaría
                </span>
              </div>

              {/* Backroom */}
              <div
                onClick={() => setSelectedRole('backroom')}
                style={{
                  border: `1.5px solid ${selectedRole === 'backroom' ? '#f97316' : 'var(--subborder-color)'}`,
                  backgroundColor: selectedRole === 'backroom' ? 'rgba(249, 115, 22, 0.12)' : 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  padding: '0.75rem 0.5rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <ShieldAlert size={18} color={selectedRole === 'backroom' ? '#f97316' : 'var(--muted-text)'} />
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: selectedRole === 'backroom' ? '#f97316' : 'var(--text-color)' }}>
                  Backroom
                </span>
              </div>
            </div>
          </div>

          {/* Formulario según el Rol seleccionado */}
          {selectedRole === 'delegate' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                País o Delegación
              </label>

              <select
                value={selectedCountry}
                onChange={e => {
                  setSelectedCountry(e.target.value);
                  if (e.target.value) setCustomCountry('');
                }}
                style={{
                  backgroundColor: 'var(--card-header-bg)',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '10px',
                  padding: '0.7rem 0.9rem',
                  color: 'var(--text-color)',
                  fontWeight: '700',
                  fontSize: '0.88rem'
                }}
              >
                <option value="">Selecciona un país de la lista...</option>
                {PAISES_DEFAULT.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted-text)', fontWeight: '700' }}>
                — O escribe el nombre si no está en la lista —
              </div>

              <input
                type="text"
                placeholder="Nombre de la delegación (ej: Singapur)"
                value={customCountry}
                onChange={e => {
                  setCustomCountry(e.target.value);
                  if (e.target.value) setSelectedCountry('');
                }}
                style={{
                  backgroundColor: 'var(--card-header-bg)',
                  border: '1px solid var(--subborder-color)',
                  borderRadius: '10px',
                  padding: '0.7rem 0.9rem',
                  color: 'var(--text-color)',
                  fontWeight: '700',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Contraseña de Acceso ({selectedRole === 'secretariat' ? 'Secretaría' : 'Backroom'})
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  placeholder="Introduce la contraseña proporcionada por el Chair"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--card-header-bg)',
                    border: '1px solid var(--subborder-color)',
                    borderRadius: '10px',
                    padding: '0.75rem 2.5rem 0.75rem 1rem',
                    color: 'var(--text-color)',
                    fontSize: '0.88rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
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
                  {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              border: 'none',
              borderRadius: '10px',
              padding: '0.85rem',
              fontWeight: '800',
              fontSize: '0.92rem',
              cursor: isSubmitting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <Radio size={17} /> {isSubmitting ? 'Conectando...' : 'Entrar a la Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinSessionView;
