import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { AVAILABLE_LANGUAGES, changeAppLanguage } from '../../languages';

/**
 * Selector de idioma modular y reutilizable.
 * Muestra automáticamente todos los idiomas registrados en `AVAILABLE_LANGUAGES`.
 */
export default function LanguageSelector({ showIcon = true, className = '', style = {} }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'es';

  return (
    <div 
      className={`language-selector-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        ...style
      }}
    >
      {showIcon && <Globe size={16} style={{ opacity: 0.8 }} />}
      <select
        value={currentLang}
        onChange={(e) => changeAppLanguage(e.target.value)}
        aria-label="Seleccionar idioma / Select language"
        style={{
          backgroundColor: 'var(--bg-color, #1e1e24)',
          color: 'var(--text-color, #ffffff)',
          border: '1px solid var(--border-color, rgba(255,255,255,0.2))',
          borderRadius: '4px',
          padding: '0.35rem 0.6rem',
          fontSize: '0.85rem',
          cursor: 'pointer',
          outline: 'none',
          transition: 'border-color 0.2s ease',
          fontWeight: '500'
        }}
      >
        {AVAILABLE_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} style={{ backgroundColor: '#18181b', color: '#fff' }}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
