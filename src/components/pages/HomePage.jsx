import React, { useState } from 'react';
import { Coffee, Play, Heart, Code2, Sparkles, ExternalLink, Edit3, ShieldCheck, Mail, Send, Copy, Check, MessageSquareHeart } from 'lucide-react';
import OpenMunLogo from '../common/OpenMunLogo';

const HomePage = ({ onNavigateToComienzo, isLight }) => {
  const [notasUsuario, setNotasUsuario] = useState(() => {
    return localStorage.getItem('openmun_home_notes') || 'Añade aquí tus notas personalizadas o agenda del evento...';
  });
  const [editandoNotas, setEditandoNotas] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const emailPlaceholder = 'sugerencias@openmun.org';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailPlaceholder);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

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
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg> Repositorio en GitHub <ExternalLink size={14} style={{ opacity: 0.6 }} />
          </a>
        </div>
      </div>

      {/* ── SECCIÓN: POR FAVOR, FORMA PARTE DE ESTO, ENVIANOS SUGERENCIAS ── */}
      <div style={{
        backgroundColor: 'var(--card-header-bg)',
        border: '1px solid var(--subborder-color)',
        borderRadius: '16px',
        padding: '2rem 2.25rem',
        maxWidth: '820px',
        width: '100%',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1.25rem',
        marginTop: '0.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: isLight ? '#eff6ff' : 'rgba(59, 130, 246, 0.15)',
          color: '#3b82f6',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
        }}>
          <MessageSquareHeart size={28} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            margin: 0,
            color: 'var(--text-color)',
            letterSpacing: '-0.01em',
            textTransform: 'uppercase'
          }}>
            POR FAVOR, FORMA PARTE DE ESTO, ENVÍANOS SUGERENCIAS
          </h3>
          <p style={{
            fontSize: '0.98rem',
            lineHeight: '1.6',
            margin: 0,
            color: 'var(--muted-text)',
            maxWidth: '650px',
            opacity: 0.9
          }}>
            OpenMUN se construye con el aporte continuo de toda la comunidad. Si tienes comentarios, encuentras un error o quieres proponer una nueva funcionalidad, escríbenos directamente.
          </p>
        </div>

        {/* Caja del mail placeholder y acciones */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          backgroundColor: isLight ? '#f8fafc' : 'rgba(0, 0, 0, 0.3)',
          border: '1px dashed var(--border-color)',
          borderRadius: '12px',
          padding: '0.65rem 1.25rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '560px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={20} style={{ color: '#3b82f6' }} />
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

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={handleCopyEmail}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
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
              {copiado ? <Check size={15} /> : <Copy size={15} />}
              {copiado ? '¡Copiado!' : 'Copiar'}
            </button>

            <a
              href={`mailto:${emailPlaceholder}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
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
              <Send size={15} /> Enviar mail
            </a>
          </div>
        </div>
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
        <div style={{ fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          Web desarrollada por Lucas R. Kowalski
          <a
            href="https://github.com/luk4sk4"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color, #444)',
              background: 'var(--card-bg, #1e1e1e)',
              color: 'var(--text-color)',
              textDecoration: 'none',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-bg, #2e2e2e)'; e.currentTarget.style.borderColor = '#888'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--card-bg, #1e1e1e)'; e.currentTarget.style.borderColor = 'var(--border-color, #444)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/lucas-kowalski"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color, #444)',
              background: 'var(--card-bg, #1e1e1e)',
              color: 'var(--text-color)',
              textDecoration: 'none',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-bg, #2e2e2e)'; e.currentTarget.style.borderColor = '#888'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--card-bg, #1e1e1e)'; e.currentTarget.style.borderColor = 'var(--border-color, #444)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </a>
        </div>
        
        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
          OpenMUN © {new Date().getFullYear()} — Plataforma de Software Libre para Modelos de Naciones Unidas
        </div>
      </footer >
    </div >
  );
};

export default HomePage;
