import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Info,
  X,
  Sparkles
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

/**
 * ToastNotification
 * Sistema de notificaciones toast estilizado, ultra-moderno y accesible.
 * Diseñado con glassmorphism, gradientes sutiles, micro-animaciones y soporte claro/oscuro.
 */
export const ToastNotification = ({ toasts, onDismiss }) => {
  const { currentTheme } = useAccessibility();
  const isLight = currentTheme === 'light';

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        maxWidth: '420px',
        width: 'calc(100vw - 2.5rem)',
        pointerEvents: 'none'
      }}
    >
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          isLight={isLight}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, isLight, onDismiss }) => {
  const { type = 'info', title, message, duration = 4000 } = toast;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(duration);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (duration <= 0) return;

    if (!isPaused) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const currentRemaining = remainingTimeRef.current - elapsed;
        const pct = Math.max(0, (currentRemaining / duration) * 100);
        setProgress(pct);

        if (currentRemaining <= 0) {
          clearInterval(intervalRef.current);
          onDismiss();
        }
      }, 25);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isPaused, duration, onDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Configuración de estilo según el tipo de Toast
  const typeConfig = {
    success: {
      accentColor: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      badgeBg: 'rgba(16, 185, 129, 0.18)',
      borderColor: isLight ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.45)',
      icon: <CheckCircle2 size={20} color="#10b981" strokeWidth={2.4} />,
      progressBg: 'linear-gradient(90deg, #10b981, #34d399)'
    },
    error: {
      accentColor: '#f43f5e',
      bgGlow: 'rgba(244, 63, 94, 0.18)',
      badgeBg: 'rgba(244, 63, 94, 0.2)',
      borderColor: isLight ? 'rgba(244, 63, 94, 0.35)' : 'rgba(244, 63, 94, 0.45)',
      icon: <AlertOctagon size={20} color="#f43f5e" strokeWidth={2.4} />,
      progressBg: 'linear-gradient(90deg, #f43f5e, #fb7185)'
    },
    warning: {
      accentColor: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      badgeBg: 'rgba(245, 158, 11, 0.2)',
      borderColor: isLight ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.45)',
      icon: <AlertTriangle size={20} color="#f59e0b" strokeWidth={2.4} />,
      progressBg: 'linear-gradient(90deg, #f59e0b, #fbbf24)'
    },
    info: {
      accentColor: '#3b82f6',
      bgGlow: 'rgba(59, 130, 246, 0.15)',
      badgeBg: 'rgba(59, 130, 246, 0.2)',
      borderColor: isLight ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.45)',
      icon: <Info size={20} color="#3b82f6" strokeWidth={2.4} />,
      progressBg: 'linear-gradient(90deg, #3b82f6, #60a5fa)'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        pointerEvents: 'auto',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        padding: '0.9rem 1.05rem',
        borderRadius: '12px',
        backgroundColor: isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(17, 22, 33, 0.92)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: `1px solid ${config.borderColor}`,
        boxShadow: isLight
          ? `0 12px 32px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)`
          : `0 16px 36px rgba(0, 0, 0, 0.5), 0 0 20px ${config.bgGlow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
        color: isLight ? '#0f172a' : '#f8fafc',
        overflow: 'hidden',
        animation: 'toastSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        transition: 'all 0.2s ease',
        cursor: 'default'
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          flexShrink: 0,
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          backgroundColor: config.badgeBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 12px ${config.bgGlow}`
        }}
      >
        {config.icon}
      </div>

      {/* Contenido de Texto */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: '0.1rem' }}>
        {title && (
          <div
            style={{
              fontWeight: '700',
              fontSize: '0.88rem',
              lineHeight: '1.25',
              marginBottom: message ? '0.25rem' : 0,
              color: isLight ? '#0f172a' : '#f1f5f9',
              letterSpacing: '-0.01em'
            }}
          >
            {title}
          </div>
        )}
        {message && (
          <div
            style={{
              fontSize: '0.78rem',
              lineHeight: '1.4',
              color: isLight ? '#475569' : '#94a3b8',
              wordBreak: 'break-word'
            }}
          >
            {message}
          </div>
        )}
      </div>

      {/* Botón Cerrar */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        style={{
          flexShrink: 0,
          background: 'transparent',
          border: 'none',
          color: isLight ? '#94a3b8' : '#64748b',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
          marginLeft: '0.2rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = isLight ? '#0f172a' : '#f8fafc';
          e.currentTarget.style.backgroundColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = isLight ? '#94a3b8' : '#64748b';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title="Cerrar notificación"
      >
        <X size={15} />
      </button>

      {/* Barra de progreso */}
      {duration > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            width: `${progress}%`,
            background: config.progressBg,
            transition: isPaused ? 'none' : 'width 25ms linear',
            borderRadius: '0 2px 2px 0'
          }}
        />
      )}
    </div>
  );
};

export default ToastNotification;
