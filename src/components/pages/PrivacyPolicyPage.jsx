import React, { useEffect } from 'react';
import { ShieldCheck, ArrowLeft, Cookie, HardDrive, Cpu, Cloud, Lock, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import OpenMunLogo from '../common/OpenMunLogo';

export default function PrivacyPolicyPage({ isLight = false, onBack }) {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('privacy.pageTitle', 'OpenMUN - Política de Privacidad');
    window.scrollTo(0, 0);
  }, [t]);

  // Color Tokens
  const pageBg = isLight ? '#f8fafc' : '#090d16';
  const textPrimary = isLight ? '#0f172a' : '#f8fafc';
  const textMuted = isLight ? '#475569' : '#94a3b8';
  const cardBg = isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(22, 27, 38, 0.85)';
  const cardBorder = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';
  const headerBg = isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.85)';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: pageBg, color: textPrimary, fontFamily: 'Inter, system-ui, -apple-system, sans-serif', position: 'relative', overflowX: 'hidden' }}>
      {/* Background ambient lighting */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '1200px', height: '350px', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none', borderRadius: '50%' }} />

      {/* Header Bar */}
      <header style={{ sticky: 'top', top: 0, zIndex: 30, backgroundColor: headerBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: `1px solid ${cardBorder}` }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <OpenMunLogo className="h-8 text-blue-500" style={{ height: '32px' }} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>OpenMUN</span>
          </div>

          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.1rem',
              borderRadius: '10px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={16} />
            <span>{t('common.backToApp', 'Volver a la App')}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '850px', margin: '0 auto', padding: '2.5rem 1.25rem 4rem 1.25rem', position: 'relative', zIndex: 10 }}>
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '1rem' }}>
            <ShieldCheck size={14} />
            <span>{t('privacy.badge', 'Compromiso Total con la Privacidad')}</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '0.75rem', background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #93c5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('privacy.title', 'Política de Privacidad')}
          </h1>

          <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: textMuted, maxWidth: '600px', margin: '0 auto' }}>
            {t(
              'privacy.subtitle',
              'OpenMUN ha sido diseñado desde cero bajo el principio de Privacidad por Diseño. Tus datos te pertenecen a ti y a tu comité.'
            )}
          </p>
        </div>

        {/* PROMINENT ZERO COOKIES CARD */}
        <div
          style={{
            marginBottom: '2.5rem',
            padding: '2rem',
            borderRadius: '20px',
            background: isLight
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(14, 165, 233, 0.08) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: '16px',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Cookie size={36} />
            </div>

            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                <CheckCircle2 size={16} />
                <span>{t('privacy.noCookiesTitle', 'Garantía 100% Libre de Cookies')}</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: textPrimary }}>
                {t('privacy.noCookiesHeading', 'NO Utilizamos Cookies')}
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: isLight ? '#334155' : '#cbd5e1', margin: 0 }}>
                {t(
                  'privacy.noCookiesDescription',
                  'En OpenMUN NO instalamos ni leemos cookies de ningún tipo en tu navegador. No usamos cookies de seguimiento, no usamos cookies de terceros, ni utilizamos píxeles analíticos o publicitarios. Navegas y trabajas con total libertad e intimidad.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 1 */}
          <div style={{ padding: '1.75rem', borderRadius: '16px', backgroundColor: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                <HardDrive size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: textPrimary }}>
                {t('privacy.localStorageTitle', '1. Almacenamiento Local (LocalStorage)')}
              </h3>
            </div>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: textMuted, margin: 0 }}>
              {t(
                'privacy.localStorageDesc',
                'Para garantizar que no pierdas tu trabajo si recargas la página o cierras el navegador, OpenMUN almacena los datos de tu sesión (nombre del comité, lista de delegados, mociones, cronómetros y preferencias de accesibilidad) exclusivamente de forma LOCAL en tu propio dispositivo utilizando LocalStorage.'
              )}
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: textMuted }}>
                <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                <span>Tus datos de debate nunca se envían a servidores centrales de OpenMUN.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: textMuted }}>
                <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                <span>Puedes borrar todo en cualquier momento limpiando los datos de tu navegador.</span>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div style={{ padding: '1.75rem', borderRadius: '16px', backgroundColor: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                <Cpu size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: textPrimary }}>
                {t('privacy.p2pTitle', '2. Conexiones Peer-to-Peer (WebRTC & P2P)')}
              </h3>
            </div>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: textMuted, margin: 0 }}>
              {t(
                'privacy.p2pDesc',
                'Las funciones de sincronización en vivo (como el modo Delegado, Secretaría o Backroom) utilizan WebRTC / PeerJS. La comunicación se realiza de punto a punto (peer-to-peer) entre el dispositivo de la Mesa de Presidencia y los dispositivos conectados.'
              )}
            </p>
          </div>

          {/* Section 3 */}
          <div style={{ padding: '1.75rem', borderRadius: '16px', backgroundColor: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.25)' }}>
                <Cloud size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: textPrimary }}>
                {t('privacy.driveTitle', '3. Sincronización Opcional con Google Drive')}
              </h3>
            </div>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: textMuted, margin: 0 }}>
              {t(
                'privacy.driveDesc',
                'Si decides vincular voluntariamente tu cuenta de Google Drive para realizar copias de seguridad de tus sesiones de MUN, el token de autorización se almacena de forma segura en tu propio navegador. Las copias de seguridad se transfieren directamente desde tu navegador a tu espacio personal de Google Drive, sin intermediarios.'
              )}
            </p>
          </div>

          {/* Section 4 */}
          <div style={{ padding: '1.75rem', borderRadius: '16px', backgroundColor: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <Lock size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: textPrimary }}>
                {t('privacy.openSourceTitle', '4. Código Abierto y Transparencia')}
              </h3>
            </div>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: textMuted, margin: 0 }}>
              {t(
                'privacy.openSourceDesc',
                'OpenMUN es un proyecto de Software Libre e independiente. Cualquiera puede auditar el código fuente público en GitHub para comprobar que no existen rastreadores ni recopilación oculta de datos.'
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '3.5rem', textAlign: 'center', fontSize: '0.85rem', color: textMuted }}>
          <p style={{ margin: '0 0 0.75rem 0' }}>Última actualización: Agosto {new Date().getFullYear()} — OpenMUN</p>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', textDecoration: 'underline' }}
          >
            ← Volver al panel principal de OpenMUN
          </button>
        </div>
      </main>
    </div>
  );
}
