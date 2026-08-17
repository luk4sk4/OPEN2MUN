import React, { useEffect } from 'react';
import { FileText, ArrowLeft, Scale, Award, Heart, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Open2MunLogo from '../common/Open2MunLogo';

export default function TermsConditionsPage({ isLight = false, onBack }) {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('terms.pageTitle', 'Open2MUN - Términos y Condiciones');
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
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '1200px', height: '350px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none', borderRadius: '50%' }} />

      {/* Header Bar */}
      <header style={{ sticky: 'top', top: 0, zIndex: 30, backgroundColor: headerBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: `1px solid ${cardBorder}` }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Open2MunLogo className="h-8 text-blue-500" style={{ height: '32px' }} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>Open2MUN</span>
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '1rem' }}>
            <Scale size={14} />
            <span>{t('terms.badge', 'Condiciones de Uso y Licencia Libre')}</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '0.75rem', background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #93c5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('terms.title', 'Términos y Condiciones')}
          </h1>

          <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: textMuted, maxWidth: '600px', margin: '0 auto' }}>
            {t(
              'terms.subtitle',
              'Bienvenido a Open2MUN, una plataforma web gratuita y de código abierto creada para potenciar la gestión de Modelos de Naciones Unidas.'
            )}
          </p>
        </div>

        {/* Detailed Terms Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 1 */}
          <div style={{ padding: '1.75rem', borderRadius: '16px', backgroundColor: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <Heart size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: textPrimary }}>
                {t('terms.sec1Title', '1. Carácter Gratuito y Educativo')}
              </h3>
            </div>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: textMuted, margin: 0 }}>
              {t(
                'terms.sec1Desc',
                'Open2MUN se ofrece libremente y sin costo para conferencias, instituciones educativas, mesas presidenciales y delegados. Su propósito fundamental es enriquecer la cultura académica, el debate constructivo y la diplomacia entre estudiantes.'
              )}
            </p>
          </div>

          {/* Section 2 */}
          <div style={{ padding: '1.75rem', borderRadius: '16px', backgroundColor: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                <Award size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: textPrimary }}>
                {t('terms.sec2Title', '2. Propiedad Intelectual y Licencia Libre')}
              </h3>
            </div>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: textMuted, margin: 0 }}>
              Open2MUN es desarrollado por Lucas R. Kowalski y distribuido como Software Libre. Eres libre de usarlo, compartirlo y adaptarlo respetando los derechos morales del autor y las licencias de código abierto publicadas en el repositorio oficial de GitHub.
            </p>
          </div>

          {/* Section 3 */}
          <div style={{ padding: '1.75rem', borderRadius: '16px', backgroundColor: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <FileText size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: textPrimary }}>
                {t('terms.sec3Title', '3. Gestión de Datos y Copias de Seguridad')}
              </h3>
            </div>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: textMuted, margin: 0 }}>
              Dado que las sesiones se guardan de forma local en el navegador o en tu propio Google Drive, la responsabilidad de guardar exportaciones en archivo JSON o mantener la sesión antes de limpiar el historial del navegador corresponde al usuario.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: textMuted }}>
              <CheckCircle2 size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
              <span>Te recomendamos exportar tu sesión (.json) periódicamente en debates extensos.</span>
            </div>
          </div>

          {/* Section 4 */}
          <div style={{ padding: '1.75rem', borderRadius: '16px', backgroundColor: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                <ShieldAlert size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: textPrimary }}>
                {t('terms.sec4Title', '4. Exención de Garantías')}
              </h3>
            </div>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: textMuted, margin: 0 }}>
              El software se proporciona "tal cual" (AS IS), sin garantías explícitas o implícitas de disponibilidad ininterrumpida. Si bien se aplican los máximos estándares de calidad tecnológica, el equipo no se responsabiliza por fallos de conectividad de red local de terceros durante los debates.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '3.5rem', textAlign: 'center', fontSize: '0.85rem', color: textMuted }}>
          <p style={{ margin: '0 0 0.75rem 0' }}>Última actualización: Agosto {new Date().getFullYear()} — Open2MUN</p>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', textDecoration: 'underline' }}
          >
            ← Volver al panel principal de Open2MUN
          </button>
        </div>
      </main>
    </div>
  );
}
