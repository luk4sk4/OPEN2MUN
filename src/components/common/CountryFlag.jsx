import React, { useState } from 'react';
import { getFlagImageUrl, obtenerIniciales, generarColorAvatar } from '../../utils/flags';

const SIZES = {
  xs: { width: '16px', height: '12px', fontSize: '0.55rem' },
  sm: { width: '20px', height: '15px', fontSize: '0.65rem' },
  md: { width: '24px', height: '18px', fontSize: '0.75rem' },
  lg: { width: '32px', height: '24px', fontSize: '0.9rem' },
  xl: { width: '48px', height: '36px', fontSize: '1.2rem' },
  '2xl': { width: '64px', height: '48px', fontSize: '1.5rem' }
};

/**
 * Componente universal para renderizar banderas en imagen (SVG/PNG o Base64 personalizadas).
 */
const CountryFlag = ({
  bandera,
  nombre = '',
  size = 'md',
  shape = 'rect', // 'rect' | 'circle' | 'square'
  style = {},
  className = '',
  title = ''
}) => {
  const [hasError, setHasError] = useState(false);
  const imageUrl = getFlagImageUrl(bandera, nombre);

  const dimension = SIZES[size] || (typeof size === 'number' ? { width: `${size}px`, height: `${Math.round(size * 0.75)}px`, fontSize: `${Math.round(size * 0.4)}px` } : SIZES.md);

  const borderRadius = shape === 'circle' ? '50%' : shape === 'square' ? '4px' : '3px';
  const width = shape === 'circle' || shape === 'square' ? dimension.height : dimension.width;
  const height = dimension.height;

  // Fallback si la imagen no existe o falla su carga
  if (!imageUrl || hasError) {
    const iniciales = obtenerIniciales(nombre || bandera);
    const bgColor = generarColorAvatar(nombre || bandera || 'Delegación');

    return (
      <span
        title={title || nombre}
        className={`country-flag-badge ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: width,
          height: height,
          minWidth: width,
          borderRadius: borderRadius,
          backgroundColor: bgColor,
          color: '#ffffff',
          fontWeight: '700',
          fontSize: dimension.fontSize,
          letterSpacing: '-0.5px',
          userSelect: 'none',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.2)',
          flexShrink: 0,
          ...style
        }}
      >
        {iniciales}
      </span>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={nombre || 'Bandera'}
      title={title || nombre}
      onError={() => setHasError(true)}
      className={`country-flag-img ${className}`}
      style={{
        display: 'inline-block',
        width: width,
        height: height,
        minWidth: width,
        objectFit: 'cover',
        borderRadius: borderRadius,
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
    />
  );
};

export default CountryFlag;
