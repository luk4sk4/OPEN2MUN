import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import peerService, { MSG_TYPES, generateRoomCode } from '../services/peerService';

const P2PContext = createContext();

export const P2PProvider = ({ children }) => {
  const [viewMode, setViewMode] = useState(() => {
    // Detectar si la URL contiene parámetros de unión directa (?room=... o ?mode=...)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      if (mode && ['delegate', 'secretariat', 'backroom', 'join'].includes(mode)) {
        return mode;
      }
      if (params.get('room')) {
        return 'join';
      }
    }
    return 'chair'; // Modo Chair por defecto
  });

  const [role, setRole] = useState('none'); // 'chair' | 'delegate' | 'secretariat' | 'backroom' | 'none'
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected' | 'connecting' | 'connected' | 'host_active' | 'error'
  const [error, setError] = useState(null);
  const [roomId, setRoomId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('room') || localStorage.getItem('openmun_last_room_id') || generateRoomCode();
    }
    return generateRoomCode();
  });

  const [clientCountry, setClientCountry] = useState(() => {
    return localStorage.getItem('openmun_last_country') || '';
  });

  const [secretPassword, setSecretPassword] = useState(() => {
    return localStorage.getItem('openmun_secret_pass') || 'secreto123';
  });

  const [backroomPassword, setBackroomPassword] = useState(() => {
    return localStorage.getItem('openmun_backroom_pass') || 'crisis123';
  });

  const [connectedPeers, setConnectedPeers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [unreadNotesCount, setUnreadNotesCount] = useState(0);
  const [speakingRequests, setSpeakingRequests] = useState([]);
  const [remoteSessionState, setRemoteSessionState] = useState(null);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((text, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // SUSCRIPCIÓN A EVENTOS DEL PEERSERVICE
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = peerService.subscribe((event, data) => {
      if (event === 'host_ready') {
        setConnectionStatus('host_active');
        setRole('chair');
        setError(null);
        setRoomId(data.roomId);
        localStorage.setItem('openmun_last_room_id', data.roomId);
        addNotification(`🟢 Sala P2P iniciada con éxito (${data.roomId})`, 'success');
      }

      if (event === 'connected') {
        setConnectionStatus('connected');
        setRole(data.role);
        setError(null);
        if (data.country) setClientCountry(data.country);
        if (data.sessionState) setRemoteSessionState(data.sessionState);
        addNotification(`✅ Conectado a la sala como ${data.country || data.role}`, 'success');
      }

      if (event === 'disconnected') {
        setConnectionStatus('disconnected');
        addNotification(data.reason || 'Desconectado de la sala', 'warning');
      }

      if (event === 'error') {
        setError(data.error);
        setConnectionStatus('error');
        addNotification(`❌ ${data.error}`, 'error');
      }

      if (event === 'peer_list_updated') {
        setConnectedPeers(data);
      }

      if (event === 'peer_authenticated') {
        addNotification(`👋 ${data.meta.country || data.meta.role} se ha unido a la sala`, 'info');
      }

      if (event === 'peer_disconnected') {
        if (data.meta) {
          addNotification(`🚪 ${data.meta.country || data.meta.role} se ha desconectado`, 'info');
        }
      }

      // Recepción de Notas
      if (event === 'note_for_chair') {
        setNotes(prev => [data, ...prev]);
        setUnreadNotesCount(prev => prev + 1);
        addNotification(`✉️ Nota de ${data.from} para ${data.to}`, 'info');
      }

      // Mensajes recibidos en Host desde clientes
      if (event === 'message_received_by_host') {
        const { senderMeta, message } = data;
        if (message.type === MSG_TYPES.REQUEST_SPEAKING) {
          const req = {
            id: `req-${Date.now()}`,
            country: senderMeta.country,
            speechType: message.payload.speechType,
            details: message.payload.details,
            timestamp: Date.now()
          };
          setSpeakingRequests(prev => [req, ...prev]);
          addNotification(`🗣️ ${senderMeta.country} ha solicitado turno (${message.payload.speechType})`, 'info');
        }
      }

      // Mensajes recibidos en Cliente desde Host
      if (event === 'message') {
        const message = data;
        if (message.type === MSG_TYPES.SYNC_STATE) {
          setRemoteSessionState(message.payload);
        } else if (message.type === MSG_TYPES.NOTE_RECEIVED) {
          setNotes(prev => [message.payload, ...prev]);
          setUnreadNotesCount(prev => prev + 1);
          addNotification(`✉️ Nueva nota de ${message.payload.from}`, 'info');
        } else if (message.type === MSG_TYPES.CRISIS_ALERT) {
          addNotification(`🚨 AVISO DE CRISIS: ${message.payload.title || 'Comunicado oficial'}`, 'error');
        } else if (message.type === MSG_TYPES.KICK) {
          peerService.destroy();
          setConnectionStatus('disconnected');
          setRole('none');
          setViewMode('join');
          addNotification('Has sido desconectado de la sala por la Mesa.', 'warning');
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [addNotification]);

  // Guardar contraseñas cuando cambien
  useEffect(() => {
    localStorage.setItem('openmun_secret_pass', secretPassword);
    localStorage.setItem('openmun_backroom_pass', backroomPassword);
  }, [secretPassword, backroomPassword]);

  // ─────────────────────────────────────────────────────────────
  // MÉTODOS DE CONTROL
  // ─────────────────────────────────────────────────────────────
  const startHosting = useCallback(async (customRoomId, secPass, bckPass) => {
    const finalRoomId = customRoomId || roomId || generateRoomCode();
    const finalSecPass = secPass || secretPassword;
    const finalBckPass = bckPass || backroomPassword;

    setConnectionStatus('connecting');
    setError(null);
    try {
      await peerService.initHost(finalRoomId, {
        secretPassword: finalSecPass,
        backroomPassword: finalBckPass
      });
      return true;
    } catch (err) {
      setError(err.message);
      setConnectionStatus('error');
      return false;
    }
  }, [roomId, secretPassword, backroomPassword]);

  const stopHosting = useCallback(() => {
    peerService.destroy();
    setConnectionStatus('disconnected');
    setConnectedPeers([]);
    setRole('none');
    addNotification('Sala P2P finalizada', 'info');
  }, [addNotification]);

  const joinRoom = useCallback(async ({ targetRoomId, targetRole, password, country, isLocalBroadcast = false }) => {
    setConnectionStatus('connecting');
    setError(null);
    try {
      await peerService.initClient({
        roomId: targetRoomId || roomId,
        role: targetRole,
        password,
        country,
        isLocalBroadcast
      });
      setRole(targetRole);
      setViewMode(targetRole);
      if (country) {
        setClientCountry(country);
        localStorage.setItem('openmun_last_country', country);
      }
      return true;
    } catch (err) {
      setError(err.message);
      setConnectionStatus('error');
      return false;
    }
  }, [roomId]);

  const leaveRoom = useCallback(() => {
    peerService.destroy();
    setConnectionStatus('disconnected');
    setRole('none');
    setViewMode('chair');
  }, []);

  const sendNote = useCallback((to, text, type = 'general') => {
    const ok = peerService.sendNoteAsClient(to, text, type);
    if (ok) {
      // Agregar localmente a mis notas enviadas
      const selfNote = {
        id: `note-${Date.now()}`,
        from: clientCountry || role,
        fromRole: role,
        to,
        text,
        type,
        timestamp: Date.now(),
        isOutgoing: true
      };
      setNotes(prev => [selfNote, ...prev]);
    }
    return ok;
  }, [clientCountry, role]);

  const requestSpeaking = useCallback((speechType, details = {}) => {
    return peerService.requestSpeakingAsClient(speechType, details);
  }, []);

  const kickPeer = useCallback((peerId) => {
    peerService.kickPeer(peerId);
  }, []);

  const markNotesAsRead = useCallback(() => {
    setUnreadNotesCount(0);
  }, []);

  // Broadcast desde el Chair hacia todos los clientes
  const broadcastCurrentState = useCallback((state) => {
    if (connectionStatus === 'host_active') {
      peerService.broadcastStateToClients(state);
    }
  }, [connectionStatus]);

  const openLiveModal = useCallback(() => setIsLiveModalOpen(true), []);
  const closeLiveModal = useCallback(() => setIsLiveModalOpen(false), []);

  return (
    <P2PContext.Provider value={{
      viewMode,
      setViewMode,
      role,
      connectionStatus,
      error,
      roomId,
      setRoomId,
      clientCountry,
      setClientCountry,
      secretPassword,
      setSecretPassword,
      backroomPassword,
      setBackroomPassword,
      connectedPeers,
      notes,
      setNotes,
      unreadNotesCount,
      markNotesAsRead,
      speakingRequests,
      setSpeakingRequests,
      remoteSessionState,
      isLiveModalOpen,
      openLiveModal,
      closeLiveModal,
      startHosting,
      stopHosting,
      joinRoom,
      leaveRoom,
      sendNote,
      requestSpeaking,
      kickPeer,
      broadcastCurrentState,
      notifications
    }}>
      {children}

      {/* Renderizado de Notificaciones Toasts Globales */}
      {notifications.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 100000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          pointerEvents: 'none'
        }}>
          {notifications.map(n => (
            <div
              key={n.id}
              style={{
                backgroundColor: n.type === 'error' ? '#450a0a' : (n.type === 'success' ? '#052e16' : '#18181b'),
                border: `1px solid ${n.type === 'error' ? '#ef4444' : (n.type === 'success' ? '#22c55e' : '#3f3f46')}`,
                color: '#ffffff',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                animation: 'slideInRight 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                maxWidth: '380px'
              }}
            >
              {n.text}
            </div>
          ))}
        </div>
      )}
    </P2PContext.Provider>
  );
};

export const useP2P = () => {
  const context = useContext(P2PContext);
  if (!context) {
    throw new Error('useP2P debe ser usado dentro de un P2PProvider');
  }
  return context;
};

export default P2PContext;
