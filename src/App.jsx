import React, { useEffect } from 'react';
import Dashboard from './layouts/Dashboard';
import { SessionProvider } from './context/SessionContext';
import { P2PProvider, useP2P } from './context/P2PContext';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import DelegateView from './components/views/DelegateView';
import SecretariatView from './components/views/SecretariatView';
import BackroomView from './components/views/BackroomView';
import JoinSessionView from './components/views/JoinSessionView';
import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import TermsConditionsPage from './components/pages/TermsConditionsPage';
import LegalBanner from './components/common/LegalBanner';
import { useRouter } from './utils/router';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('openmun_config');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2.5rem', color: '#ef4444', backgroundColor: '#0f172a', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '2rem', borderRadius: '12px', maxWidth: '600px', width: '100%', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#f87171', fontSize: '1.5rem' }}>⚠️ Ocurrió un error inesperado</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              El archivo JSON importado o los datos guardados en la sesión contenían un formato no reconocido. Hemos prevenido que tu trabajo sufra daños.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.65rem 1.25rem',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Restablecer configuración y recargar
              </button>
            </div>
            <details style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: '#cbd5e1', backgroundColor: '#0f172a', padding: '1rem', borderRadius: '6px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Ver detalles del error</summary>
              <br />
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { viewMode, setViewMode, joinRoom } = useP2P();
  const { isLight } = useAccessibility();
  const { route, navigateTo } = useRouter();

  useEffect(() => {
    if (route === 'privacy') return;
    if (route === 'terms') return;

    switch (viewMode) {
      case 'backroom':
        document.title = 'OpenMUN - Backroom';
        break;
      case 'secretariat':
        document.title = 'OpenMUN - Secretaría';
        break;
      case 'delegate':
        document.title = 'OpenMUN - Delegación';
        break;
      case 'join':
        document.title = 'OpenMUN - Unirse a Sala';
        break;
      case 'chair':
      default:
        document.title = 'OpenMUN';
        break;
    }
  }, [viewMode, route]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isLocal = params.get('local') === 'true';
      const mode = params.get('mode');

      if (isLocal && mode === 'secretariat') {
        // Conexión automática por BroadcastChannel para pantalla secreta local
        joinRoom({
          targetRole: 'secretariat',
          isLocalBroadcast: true
        });
      }
    }
  }, [joinRoom]);

  // Si la ruta solicitada es Privacidad o Términos, renderizamos su página específica
  if (route === 'privacy') {
    return (
      <>
        <PrivacyPolicyPage isLight={isLight} onBack={() => navigateTo('/')} />
        <LegalBanner isLight={isLight} />
      </>
    );
  }

  if (route === 'terms') {
    return (
      <>
        <TermsConditionsPage isLight={isLight} onBack={() => navigateTo('/')} />
        <LegalBanner isLight={isLight} />
      </>
    );
  }

  let currentView;
  if (viewMode === 'delegate') {
    currentView = <DelegateView isLight={isLight} onExit={() => setViewMode('chair')} />;
  } else if (viewMode === 'secretariat') {
    currentView = <SecretariatView isLight={isLight} onExit={() => setViewMode('chair')} />;
  } else if (viewMode === 'backroom') {
    currentView = <BackroomView isLight={isLight} onExit={() => setViewMode('chair')} />;
  } else if (viewMode === 'join') {
    currentView = <JoinSessionView isLight={isLight} onBackToChair={() => setViewMode('chair')} />;
  } else {
    currentView = <Dashboard />;
  }

  return (
    <>
      {currentView}
      <LegalBanner isLight={isLight} />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <SessionProvider>
          <P2PProvider>
            <AppContent />
          </P2PProvider>
        </SessionProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App;
