import React, { useEffect } from 'react';
import Dashboard from './layouts/Dashboard';
import { SessionProvider } from './context/SessionContext';
import { P2PProvider, useP2P } from './context/P2PContext';
import DelegateView from './components/views/DelegateView';
import SecretariatView from './components/views/SecretariatView';
import BackroomView from './components/views/BackroomView';
import JoinSessionView from './components/views/JoinSessionView';

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

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', backgroundColor: '#fff', height: '100vh', overflow: 'auto' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Click for error details</summary>
            <br />
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { viewMode, setViewMode, joinRoom } = useP2P();

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

  if (viewMode === 'delegate') {
    return <DelegateView onExit={() => setViewMode('chair')} />;
  }

  if (viewMode === 'secretariat') {
    return <SecretariatView onExit={() => setViewMode('chair')} />;
  }

  if (viewMode === 'backroom') {
    return <BackroomView onExit={() => setViewMode('chair')} />;
  }

  if (viewMode === 'join') {
    return <JoinSessionView onBackToChair={() => setViewMode('chair')} />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <P2PProvider>
          <AppContent />
        </P2PProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}

export default App;
