import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import peerService, { MSG_TYPES, generateRoomCode, DEFAULT_ROOM_SETTINGS } from '../services/peerService';

const P2PContext = createContext();

export const P2PProvider = ({ children }) => {
  const { t } = useTranslation();
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

  // Ajustes de Sala y Permisos de Delegados
  const [roomSettings, setRoomSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('openmun_room_settings');
      return saved ? { ...DEFAULT_ROOM_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_ROOM_SETTINGS };
    } catch (e) {
      return { ...DEFAULT_ROOM_SETTINGS };
    }
  });

  const [connectedPeers, setConnectedPeers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [unreadNotesCount, setUnreadNotesCount] = useState(0);
  const [speakingRequests, setSpeakingRequests] = useState([]);
  const [remoteSessionState, setRemoteSessionState] = useState(null);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Sincronizar ajustes P2P si se importan datos a localStorage
  useEffect(() => {
    const handleSessionImported = () => {
      try {
        const savedSettings = localStorage.getItem('openmun_room_settings');
        if (savedSettings) {
          setRoomSettings(JSON.parse(savedSettings));
        }
        const savedSecret = localStorage.getItem('openmun_secret_pass');
        if (savedSecret) setSecretPassword(savedSecret);
        const savedBackroom = localStorage.getItem('openmun_backroom_pass');
        if (savedBackroom) setBackroomPassword(savedBackroom);
        const savedCountry = localStorage.getItem('openmun_last_country');
        if (savedCountry) setClientCountry(savedCountry);
      } catch (e) {
        console.error('Error sincronizando P2PContext tras importación:', e);
      }
    };

    window.addEventListener('openmun_session_imported', handleSessionImported);
    window.addEventListener('storage', handleSessionImported);
    return () => {
      window.removeEventListener('openmun_session_imported', handleSessionImported);
      window.removeEventListener('storage', handleSessionImported);
    };
  }, []);

  // Callback ref para manipulación de SessionContext desde Host al procesar solicitudes automáticas o remotas
  const sessionActionHandlersRef = useRef({
    onAddSpeakerGSL: null,
    onAddSpeakerCaucus: null,
    onAddMotion: null,
    onCastVote: null,
    onSessionAction: null,
    onSyncState: null
  });

  const registerSessionHandlers = useCallback((handlers) => {
    sessionActionHandlersRef.current = { ...sessionActionHandlersRef.current, ...handlers };
  }, []);

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
        if (data.roomSettings) setRoomSettings(data.roomSettings);
        localStorage.setItem('openmun_last_room_id', data.roomId);
        addNotification(t('liveSession.notifications.roomStarted', { roomId: data.roomId }), 'success');
      }

      if (event === 'connected') {
        setConnectionStatus('connected');
        setRole(data.role);
        setError(null);
        if (data.country) setClientCountry(data.country);
        if (data.sessionState) {
          setRemoteSessionState(data.sessionState);
          if (sessionActionHandlersRef.current.onSyncState) {
            sessionActionHandlersRef.current.onSyncState(data.sessionState);
          }
        }
        if (data.roomSettings) setRoomSettings(data.roomSettings);
        if (data.speakingRequests) setSpeakingRequests(data.speakingRequests);
        addNotification(t('liveSession.notifications.connectedAs', { roleOrCountry: data.country || data.role }), 'success');
      }

      if (event === 'session_action') {
        const { action, payload } = data;
        if (sessionActionHandlersRef.current.onSessionAction) {
          sessionActionHandlersRef.current.onSessionAction(action, payload);
        }
      }

      if (event === 'disconnected') {
        setConnectionStatus('disconnected');
        addNotification(data.reason || t('liveSession.notifications.disconnectedFromRoom'), 'warning');
      }

      if (event === 'error') {
        setError(data.error);
        setConnectionStatus('error');
        addNotification(`${data.error}`, 'error');
      }

      if (event === 'peer_list_updated') {
        setConnectedPeers(data);
      }

      if (event === 'peer_authenticated') {
        addNotification(t('liveSession.notifications.peerJoined', { peer: data.meta.country || data.meta.role }), 'info');
      }

      if (event === 'peer_disconnected') {
        if (data.meta) {
          addNotification(t('liveSession.notifications.peerDisconnected', { peer: data.meta.country || data.meta.role }), 'info');
        }
      }

      if (event === 'room_settings_updated') {
        setRoomSettings(data);
        localStorage.setItem('openmun_room_settings', JSON.stringify(data));
        addNotification(t('liveSession.notifications.roomSettingsUpdated'), 'info');
      }

      // Solicitud directa de orador (Host auto-adiciona a la sesión)
      if (event === 'direct_speaker_request') {
        const { speechType, country } = data;
        if (speechType === 'GSL') {
          if (sessionActionHandlersRef.current.onAddSpeakerGSL) {
            sessionActionHandlersRef.current.onAddSpeakerGSL({ nombre: country, bandera: '🇺🇳' });
          }
          addNotification(t('liveSession.notifications.addedToSpeakersListDirect', { country }), 'success');
        } else if (speechType === 'CAUCUS') {
          if (sessionActionHandlersRef.current.onAddSpeakerCaucus) {
            sessionActionHandlersRef.current.onAddSpeakerCaucus({ nombre: country, bandera: '🇺🇳' });
          }
          addNotification(t('liveSession.notifications.addedToCaucusDirect', { country }), 'success');
        }
      }

      // Procesamiento de solicitud desde Secretaría (Host ejecuta)
      if (event === 'process_speaking_request') {
        const { requestId, action, requestData } = data;
        setSpeakingRequests(prev => {
          const updated = prev.filter(r => r.id !== requestId);
          peerService.broadcastSpeakingRequests(updated);
          return updated;
        });
        if (action === 'accept' && requestData) {
          if (requestData.speechType === 'GSL' && sessionActionHandlersRef.current.onAddSpeakerGSL) {
            sessionActionHandlersRef.current.onAddSpeakerGSL({ nombre: requestData.country, bandera: '🇺🇳' });
          } else if (requestData.speechType === 'CAUCUS' && sessionActionHandlersRef.current.onAddSpeakerCaucus) {
            sessionActionHandlersRef.current.onAddSpeakerCaucus({ nombre: requestData.country, bandera: '🇺🇳' });
          } else if (requestData.speechType === 'POINT_MOTION' && sessionActionHandlersRef.current.onAddMotion) {
            sessionActionHandlersRef.current.onAddMotion({
              tipo: requestData.details?.tipo || t('liveSession.defaultMotionType', 'Punto de Orden'),
              proponente: requestData.country,
              tema: requestData.details?.tema || t('liveSession.defaultMotionTopic', 'Solicitud de Delegación'),
              tiempoTotal: requestData.details?.tiempoTotal || 0,
              tiempoOrador: requestData.details?.tiempoOrador || 0
            });
          }
          addNotification(t('liveSession.notifications.requestApprovedBySec', { country: requestData.country }), 'success');
        } else if (action === 'reject') {
          addNotification(t('liveSession.notifications.requestRejectedBySec'), 'info');
        }
      }

      // Recepción de voto telemático en Host
      if (event === 'vote_received') {
        const { country, vote } = data;
        if (sessionActionHandlersRef.current.onCastVote) {
          sessionActionHandlersRef.current.onCastVote(country, vote);
        }
        addNotification(t('liveSession.notifications.voteRegistered', { country, vote }), 'info');
      }

      // Recepción de Notas
      if (event === 'note_for_chair') {
        setNotes(prev => [data, ...prev]);
        setUnreadNotesCount(prev => prev + 1);
        addNotification(t('liveSession.notifications.noteFromTo', { from: data.from, to: data.to }), 'info');
      }

      // Mensajes recibidos en Host desde clientes
      if (event === 'message_received_by_host') {
        const { senderMeta, message } = data;
        if (message.type === MSG_TYPES.REQUEST_SPEAKING) {
          const req = {
            id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            country: senderMeta.country,
            speechType: message.payload.speechType,
            details: message.payload.details,
            timestamp: Date.now()
          };
          setSpeakingRequests(prev => {
            const next = [req, ...prev.filter(r => !(r.country === req.country && r.speechType === req.speechType))];
            peerService.broadcastSpeakingRequests(next);
            return next;
          });
          addNotification(t('liveSession.notifications.turnRequested', { country: senderMeta.country, speechType: message.payload.speechType }), 'info');
        }
      }

      // Mensajes recibidos en Cliente desde Host
      if (event === 'message') {
        const message = data;
        if (message.type === MSG_TYPES.AUTH_RESULT) {
          if (message.payload?.success) {
            setConnectionStatus('connected');
            if (message.payload.role) setRole(message.payload.role);
            if (message.payload.country) setClientCountry(message.payload.country);
            if (message.payload.roomSettings) {
              setRoomSettings(message.payload.roomSettings);
            }
            if (message.payload.speakingRequests) {
              setSpeakingRequests(message.payload.speakingRequests);
            }
            if (message.payload.sessionState) {
              setRemoteSessionState(message.payload.sessionState);
              if (sessionActionHandlersRef.current.onSyncState) {
                sessionActionHandlersRef.current.onSyncState(message.payload.sessionState);
              }
            }
          }
        } else if (message.type === MSG_TYPES.SYNC_STATE) {
          setRemoteSessionState(message.payload);
          if (sessionActionHandlersRef.current.onSyncState) {
            sessionActionHandlersRef.current.onSyncState(message.payload);
          }
          if (message.payload?.roomSettings) {
            setRoomSettings(message.payload.roomSettings);
          }
          if (message.payload?.speakingRequests) {
            setSpeakingRequests(message.payload.speakingRequests);
          }
        } else if (message.type === MSG_TYPES.SPEAKING_REQUESTS_UPDATED) {
          setSpeakingRequests(message.payload || []);
        } else if (message.type === MSG_TYPES.ROOM_SETTINGS_UPDATED) {
          setRoomSettings(message.payload);
          addNotification(t('liveSession.notifications.settingsUpdatedByChair'), 'info');
        } else if (message.type === MSG_TYPES.SPEAKING_PROCESSED) {
          const { success, mode, message: msgText } = message.payload || {};
          addNotification(msgText || (success ? t('liveSession.notifications.requestProcessed') : t('liveSession.notifications.couldNotProcess')), success ? 'success' : 'warning');
        } else if (message.type === MSG_TYPES.NOTE_RECEIVED) {
          setNotes(prev => [message.payload, ...prev]);
          setUnreadNotesCount(prev => prev + 1);
          addNotification(t('liveSession.notifications.newNoteFrom', { from: message.payload.from }), 'info');
        } else if (message.type === MSG_TYPES.CRISIS_ALERT) {
          addNotification(t('liveSession.notifications.crisisNotice', { title: message.payload.title || t('liveSession.officialCommunique', 'Comunicado oficial') }), 'error');
        } else if (message.type === MSG_TYPES.KICK) {
          peerService.destroy();
          setConnectionStatus('disconnected');
          setRole('none');
          setViewMode('join');
          addNotification(t('liveSession.notifications.kickedByChair'), 'warning');
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [addNotification, t]);

  // Guardar contraseñas y ajustes cuando cambien
  useEffect(() => {
    localStorage.setItem('openmun_secret_pass', secretPassword);
    localStorage.setItem('openmun_backroom_pass', backroomPassword);
  }, [secretPassword, backroomPassword]);

  useEffect(() => {
    localStorage.setItem('openmun_room_settings', JSON.stringify(roomSettings));
  }, [roomSettings]);

  // ─────────────────────────────────────────────────────────────
  // MÉTODOS DE CONTROL
  // ─────────────────────────────────────────────────────────────
  const updateRoomSettings = useCallback((newSettings) => {
    const merged = { ...roomSettings, ...newSettings };
    setRoomSettings(merged);
    localStorage.setItem('openmun_room_settings', JSON.stringify(merged));

    if (connectionStatus === 'host_active') {
      peerService.broadcastRoomSettings(merged);
    } else if (connectionStatus === 'connected' && (role === 'secretariat' || role === 'chair')) {
      peerService.updateRoomSettingsAsClient(merged);
    }
    addNotification(t('liveSession.notifications.roomSettingsSaved'), 'success');
  }, [roomSettings, connectionStatus, role, addNotification, t]);

  const startHosting = useCallback(async (customRoomId, secPass, bckPass, customSettings = null) => {
    const finalRoomId = customRoomId || roomId || generateRoomCode();
    const finalSecPass = secPass || secretPassword;
    const finalBckPass = bckPass || backroomPassword;
    const finalSettings = customSettings || roomSettings;

    setConnectionStatus('connecting');
    setError(null);
    try {
      await peerService.initHost(finalRoomId, {
        secretPassword: finalSecPass,
        backroomPassword: finalBckPass,
        roomSettings: finalSettings
      });
      return true;
    } catch (err) {
      setError(err.message);
      setConnectionStatus('error');
      return false;
    }
  }, [roomId, secretPassword, backroomPassword, roomSettings]);

  const stopHosting = useCallback(() => {
    peerService.destroy();
    setConnectionStatus('disconnected');
    setConnectedPeers([]);
    setRole('none');
    addNotification(t('liveSession.notifications.roomEnded'), 'info');
  }, [addNotification, t]);

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

  const approveSpeakingRequest = useCallback((req) => {
    if (connectionStatus === 'host_active') {
      // Si somos el Chair/Host, ejecutamos inmediatamente con los handlers registrados
      if (req.speechType === 'GSL' && sessionActionHandlersRef.current.onAddSpeakerGSL) {
        sessionActionHandlersRef.current.onAddSpeakerGSL({ nombre: req.country, bandera: '🇺🇳' });
      } else if (req.speechType === 'CAUCUS' && sessionActionHandlersRef.current.onAddSpeakerCaucus) {
        sessionActionHandlersRef.current.onAddSpeakerCaucus({ nombre: req.country, bandera: '🇺🇳' });
      } else if (req.speechType === 'POINT_MOTION' && sessionActionHandlersRef.current.onAddMotion) {
        sessionActionHandlersRef.current.onAddMotion({
          tipo: req.details?.tipo || t('liveSession.defaultMotionType', 'Punto de Orden'),
          proponente: req.country,
          tema: req.details?.tema || t('liveSession.defaultMotionTopic', 'Solicitud de Delegación'),
          tiempoTotal: req.details?.tiempoTotal || 0,
          tiempoOrador: req.details?.tiempoOrador || 0
        });
      }
      setSpeakingRequests(prev => {
        const next = prev.filter(r => r.id !== req.id);
        peerService.broadcastSpeakingRequests(next);
        return next;
      });
      addNotification(t('liveSession.notifications.requestAcceptedFor', { country: req.country }), 'success');
    } else {
      // Si somos Secretaría (cliente remoto o local), enviamos el comando al host
      peerService.processSpeakingRequestAsClient(req.id, 'accept', req);
      setSpeakingRequests(prev => prev.filter(r => r.id !== req.id));
      addNotification(t('liveSession.notifications.approvalSentFor', { country: req.country }), 'info');
    }
  }, [connectionStatus, addNotification, t]);

  const rejectSpeakingRequest = useCallback((reqId) => {
    if (connectionStatus === 'host_active') {
      setSpeakingRequests(prev => {
        const next = prev.filter(r => r.id !== reqId);
        peerService.broadcastSpeakingRequests(next);
        return next;
      });
    } else {
      peerService.processSpeakingRequestAsClient(reqId, 'reject');
      setSpeakingRequests(prev => prev.filter(r => r.id !== reqId));
    }
    addNotification(t('liveSession.notifications.requestRejected'), 'info');
  }, [connectionStatus, addNotification, t]);

  const castVote = useCallback((voteOption) => {
    if (connectionStatus === 'connected' && role === 'delegate') {
      peerService.castVoteAsClient(clientCountry, voteOption);
      addNotification(t('liveSession.notifications.voteCast', { vote: voteOption }), 'success');
    }
  }, [connectionStatus, role, clientCountry, addNotification, t]);

  const kickPeer = useCallback((peerId) => {
    if (connectionStatus === 'host_active') {
      peerService.kickPeer(peerId);
    } else {
      peerService.kickPeerAsClient(peerId);
    }
  }, [connectionStatus]);

  const markNotesAsRead = useCallback(() => {
    setUnreadNotesCount(0);
  }, []);

  // Broadcast desde el Chair hacia todos los clientes
  const broadcastCurrentState = useCallback((state) => {
    if (connectionStatus === 'host_active') {
      peerService.broadcastStateToClients(state);
    }
  }, [connectionStatus]);

  // Enviar acción de sesión desde Secretaría al Host o ejecutarla localmente si somos Host
  const sendSessionAction = useCallback((action, payload) => {
    if (connectionStatus === 'host_active') {
      if (sessionActionHandlersRef.current.onSessionAction) {
        sessionActionHandlersRef.current.onSessionAction(action, payload);
      }
    } else {
      peerService.sendSessionActionAsClient(action, payload);
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
      roomSettings,
      setRoomSettings,
      updateRoomSettings,
      connectedPeers,
      notes,
      setNotes,
      unreadNotesCount,
      markNotesAsRead,
      speakingRequests,
      setSpeakingRequests,
      approveSpeakingRequest,
      rejectSpeakingRequest,
      castVote,
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
      sendSessionAction,
      registerSessionHandlers,
      notifications
    }}>
      {children}

      {/* Renderizado de Notificaciones Toasts Globales */}
      {notifications.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 100000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          pointerEvents: 'none'
        }}>
          {notifications.map(n => {
            const IconComponent = n.type === 'error' ? AlertCircle : (n.type === 'success' ? CheckCircle2 : (n.type === 'warning' ? AlertTriangle : Info));
            const iconColor = n.type === 'error' ? '#f87171' : (n.type === 'success' ? '#4ade80' : (n.type === 'warning' ? '#fbbf24' : '#60a5fa'));
            const accentBg = n.type === 'error' ? 'rgba(239, 68, 68, 0.22)' : (n.type === 'success' ? 'rgba(34, 197, 94, 0.22)' : (n.type === 'warning' ? 'rgba(245, 158, 11, 0.22)' : 'rgba(59, 130, 246, 0.22)'));
            const borderColor = n.type === 'error' ? 'rgba(239, 68, 68, 0.35)' : (n.type === 'success' ? 'rgba(34, 197, 94, 0.35)' : (n.type === 'warning' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(59, 130, 246, 0.35)'));
            const bgGradient = n.type === 'error'
              ? 'linear-gradient(135deg, rgba(24, 10, 15, 0.95) 0%, rgba(40, 14, 20, 0.98) 100%)'
              : (n.type === 'success'
                ? 'linear-gradient(135deg, rgba(6, 26, 16, 0.95) 0%, rgba(10, 40, 22, 0.98) 100%)'
                : (n.type === 'warning'
                  ? 'linear-gradient(135deg, rgba(28, 22, 10, 0.95) 0%, rgba(42, 32, 12, 0.98) 100%)'
                  : 'linear-gradient(135deg, rgba(10, 20, 36, 0.95) 0%, rgba(16, 30, 54, 0.98) 100%)'));

            return (
              <div
                key={n.id}
                style={{
                  background: bgGradient,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid ${borderColor}`,
                  borderLeft: `4px solid ${iconColor}`,
                  color: '#f8fafc',
                  padding: '0.8rem 1.15rem',
                  borderRadius: '12px',
                  fontSize: '0.86rem',
                  fontWeight: '600',
                  boxShadow: `0 14px 36px rgba(0, 0, 0, 0.5), 0 0 15px ${borderColor}`,
                  animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  maxWidth: '430px',
                  pointerEvents: 'auto'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: accentBg,
                  flexShrink: 0
                }}>
                  <IconComponent size={17} color={iconColor} />
                </div>
                <span style={{ flexGrow: 1, lineHeight: '1.4', letterSpacing: '0.01em' }}>{n.text}</span>
                <button
                  onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.45)',
                    cursor: 'pointer',
                    padding: '3px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                  title="Cerrar"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
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

