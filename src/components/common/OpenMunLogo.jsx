import React from 'react';

const OpenMunLogo = ({ width = 180, height = 44, showText = true, isLight = false, className = '', style = {} }) => {
  const primaryColor = isLight ? '#0f172a' : '#ffffff';
  const secondaryColor = isLight ? '#475569' : '#a1a1aa';
  const bgInner = isLight ? '#ffffff' : '#09090b';

  return (
    <div 
      className={`openmun-logo-container ${className}`} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.65rem', 
        userSelect: 'none',
        ...style 
      }}
    >
      <svg 
        width={height * 1.15} 
        height={height} 
        viewBox="0 0 100 90" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="neutralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>

        {/* ── TECHO DEL TEMPLO GRIEGO (Pedimento Triangular con "OPEN") ── */}
        <polygon points="50,4 96,30 4,30" fill={primaryColor} />
        <polygon points="50,9 90,30 10,30" fill={bgInner} />

        {/* Letras "O P E N" grabadas en el techo pedimento */}
        <text 
          x="50" 
          y="25" 
          fontFamily="Inter, system-ui, sans-serif" 
          fontWeight="900" 
          fontSize="14" 
          fill={primaryColor} 
          textAnchor="middle" 
          letterSpacing="4.5"
        >
          OPEN
        </text>

        {/* Cornisa Horizontal del Techo */}
        <rect x="4" y="31" width="92" height="5" rx="1.5" fill={primaryColor} />

        {/* ── COLUMNAS DEL TEMPLO GRIEGO (Formando M U N) ── */}
        <rect x="12" y="38" width="16" height="3" fill={primaryColor} rx="1" />
        <rect x="42" y="38" width="16" height="3" fill={primaryColor} rx="1" />
        <rect x="72" y="38" width="16" height="3" fill={primaryColor} rx="1" />

        {/* Columna M */}
        <path d="M14 41 L14 74 M18 41 L22 58 L26 41 M26 41 L26 74" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Columna U */}
        <path d="M44 41 L44 65 C44 73 56 73 56 65 L56 41" stroke={primaryColor} strokeWidth="3.5" strokeLinecap="round" />

        {/* Columna N */}
        <path d="M74 74 L74 41 L84 74 L84 41" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        <rect x="12" y="74" width="16" height="3" fill={primaryColor} rx="1" />
        <rect x="42" y="74" width="16" height="3" fill={primaryColor} rx="1" />
        <rect x="72" y="74" width="16" height="3" fill={primaryColor} rx="1" />

        {/* ── ESCALINATA BASE ── */}
        <rect x="6" y="78" width="88" height="4" rx="1" fill={primaryColor} opacity="0.9" />
        <rect x="2" y="83" width="96" height="5" rx="1.5" fill={primaryColor} />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ 
            fontWeight: '900', 
            fontSize: '1.25rem', 
            letterSpacing: '0.08em', 
            color: primaryColor,
          }}>
            OPEN<span style={{ color: secondaryColor }}>MUN</span>
          </span>
          <span style={{ 
            fontSize: '0.58rem', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            letterSpacing: '0.22em', 
            color: secondaryColor,
            marginTop: '3px'
          }}>
            Model United Nations
          </span>
        </div>
      )}
    </div>
  );
};

export default OpenMunLogo;
