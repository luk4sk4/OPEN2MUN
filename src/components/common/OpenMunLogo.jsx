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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">

        <g fill="#F8FAFC">
          <rect x="80" y="500" width="640" height="20" rx="2" />
          <rect x="100" y="480" width="600" height="20" rx="2" />
          <rect x="120" y="460" width="560" height="20" rx="2" />
        </g>

        <rect x="120" y="180" width="560" height="40" fill="#F8FAFC" />
        <rect x="120" y="195" width="560" height="5" fill="#E2E8F0" />

        <g id="techo">

          <g fill="#F8FAFC">
            <path d="M 160,180 L 160,148 L 260,94 L 260,180 Z 
                M 185,165 L 235,165 L 235,110 L 185,137 Z" />

            <path d="M 280,180 L 280,84 L 380,30 L 380,120 L 310,120 L 310,180 Z 
                M 310,100 L 350,100 L 350,55 L 310,75 Z" />

            <path d="M 420,180 L 420,30 L 520,84 L 520,104 L 450,66 L 450,110 L 500,110 L 500,130 L 450,130 L 450,160 L 520,160 L 520,180 Z" />

            <path d="M 540,180 L 540,94 L 570,110 L 610,165 L 610,132 L 640,148 L 640,180 L 610,180 L 570,125 L 570,180 Z" />
          </g>

          <polygon points="60,180 400,-5 740,180 700,180 400,10 100,180" fill="#E2E8F0" />
          <path d="M 400,-25 L 415,-5 L 385,-5 Z" fill="#E2E8F0" />
          <path d="M 60,180 L 50,160 L 70,180 Z" fill="#E2E8F0" />
          <path d="M 740,180 L 750,160 L 730,180 Z" fill="#E2E8F0" />
        </g>
        <g fill="#F8FAFC">
          <path d="M 150,460 L 150,220 L 195,220 L 235,350 L 275,220 L 320,220 L 320,460 L 285,460 L 285,290 L 245,410 L 225,410 L 185,290 L 185,460 Z" />

          <path d="M 360,220 L 395,220 L 395,400 Q 395,425 425,425 Q 455,425 455,400 L 455,200 L 490,220 L 490,400 Q 490,460 425,460 Q 360,460 360,400 Z" />

          <path d="M 530,460 L 530,220 L 565,220 L 615,360 L 615,220 L 650,220 L 650,460 L 615,460 L 565,320 L 565,460 Z" />
        </g>

        <g fill="#CBD5E1">
          <rect x="145" y="220" width="55" height="10" rx="2" />
          <rect x="270" y="220" width="55" height="10" rx="2" />
          <rect x="355" y="220" width="45" height="10" rx="2" />
          <rect x="450" y="220" width="45" height="10" rx="2" />
          <rect x="525" y="220" width="45" height="10" rx="2" />
          <rect x="610" y="220" width="45" height="10" rx="2" />
        </g>

        <g fill="#CBD5E1">
          <rect x="145" y="450" width="45" height="10" rx="2" />
          <rect x="280" y="450" width="45" height="10" rx="2" />
          <rect x="525" y="450" width="45" height="10" rx="2" />
          <rect x="610" y="450" width="45" height="10" rx="2" />
        </g>
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
