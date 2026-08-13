import React, { useState } from 'react';
import { Coffee, Play, Heart, Code2, Sparkles, ExternalLink, Edit3, ShieldCheck } from 'lucide-react';
import OpenMunLogo from '../common/OpenMunLogo';

const HomePage = ({ onNavigateToComienzo, isLight }) => {
  const [notasUsuario, setNotasUsuario] = useState(() => {
    return localStorage.getItem('openmun_home_notes') || 'Añade aquí tus notas personalizadas o agenda del evento...';
  });
  const [editandoNotas, setEditandoNotas] = useState(false);

  const handleGuardarNotas = (texto) => {
    setNotasUsuario(texto);
    localStorage.setItem('openmun_home_notes', texto);
  };

  return (
    <div style={{
      padding: '2.5rem 1.5rem 4rem 1.5rem',
      maxWidth: '1100px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2.5rem',
      color: 'var(--text-color)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* ── HERO SECTION CON LOGO GIGANTE ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1.25rem',
        marginTop: '1rem'
      }}>
        {/* Logo SVG Gigante */}
        <OpenMunLogo height={90} isLight={isLight} />

        <p style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          color: 'var(--text-color)',
          maxWidth: '750px',
          lineHeight: '1.5',
          margin: '0.5rem 0 0 0',
          opacity: 0.95
        }}>
          OpenMUN es una iniciativa gratuita y open source para poder llevar el control de simulaciones
        </p>

        {/* Misión Statement */}
        <div style={{
          backgroundColor: 'var(--card-header-bg)',
          border: '1px solid var(--subborder-color)',
          borderRadius: '12px',
          padding: '1.25rem 1.75rem',
          maxWidth: '780px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          position: 'relative'
        }}>
          <p style={{
            fontSize: '1.05rem',
            lineHeight: '1.6',
            margin: 0,
            color: 'var(--text-color)',
            fontWeight: '500'
          }}>
            Nuestra misión es darle a toda la comunidad una experiencia sencilla, personalizable y, sobre todo,{' '}
            <strong style={{ textDecoration: 'underline', fontWeight: '800' }}>free</strong>, tanto{' '}
            <em>as "libre"</em> como <em>as "gratis"</em>.
          </p>
        </div>

        {/* ── BOTONES DE ACCIÓN: DONACIÓN, GITHUB Y COMENZAR ── */}
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.75rem' }}>
          {/* Botón Comenzar Simulación */}
          <button
            onClick={onNavigateToComienzo}
            style={{
              padding: '0.75rem 1.4rem',
              backgroundColor: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              fontWeight: '800',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.95rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            <Play size={18} fill="currentColor" /> Comenzar Simulación
          </button>

          {/* Botón de Donación (Tipico de Café) */}
          <a
            href="https://buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.75rem 1.4rem',
              backgroundColor: '#ffdd00',
              color: '#000000',
              fontWeight: '800',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(255, 221, 0, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <Coffee size={20} /> Invítanos a un café
          </a>

          {/* Botón de Link a GitHub */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.75rem 1.4rem',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              fontWeight: '700',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.95rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg> Repositorio en GitHub <ExternalLink size={14} style={{ opacity: 0.6 }} />
          </a>
        </div>
      </div>

      {/* ── SECCIÓN PERSONALIZABLE PARA NOTAS DEL USUARIO ── */}
      <div style={{
        width: '100%',
        backgroundColor: 'var(--panel-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1rem' }}>
            <Edit3 size={18} />
            <span>Espacio Personalizable de Notas de la Simulación</span>
          </div>
          <button
            onClick={() => setEditandoNotas(!editandoNotas)}
            style={{
              padding: '0.3rem 0.6rem',
              backgroundColor: 'transparent',
              border: '1px solid var(--subborder-color)',
              color: 'var(--text-color)',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: '600'
            }}
          >
            {editandoNotas ? 'Listo' : 'Editar Notas'}
          </button>
        </div>

        {editandoNotas ? (
          <textarea
            value={notasUsuario}
            onChange={e => handleGuardarNotas(e.target.value)}
            rows={5}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--card-header-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-color)',
              borderRadius: '6px',
              fontSize: '0.9rem',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        ) : (
          <div style={{
            fontSize: '0.9rem',
            lineHeight: '1.6',
            opacity: 0.85,
            whiteSpace: 'pre-wrap',
            padding: '0.5rem 0'
          }}>
            {notasUsuario}
          </div>
        )}
      </div>

      {/* ── FOOTER DE CRÉDITOS ── */}
      <footer style={{
        marginTop: '2rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--subborder-color)',
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: 'var(--muted-text)'
      }}>
        <div style={{ fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-color)' }}>
          Web desarrollada por <strong style={{ textDecoration: 'underline' }}>K4 STUDIO</strong>
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
          OpenMUN © {new Date().getFullYear()} — Plataforma de Software Libre para Modelos de Naciones Unidas
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
