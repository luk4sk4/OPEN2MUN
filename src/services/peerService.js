import { Peer } from 'peerjs';


const jitter = Math.floor(Math.random() * 1000);

export const LOCAL_BROADCAST_CHANNEL_NAME = 'openmun_local_secret_channel';

/**
 * Ajustes de sala por defecto
 */
export const DEFAULT_ROOM_SETTINGS = {
  speakerRequestMode: 'approval', // 'direct' | 'approval' | 'disabled'
  caucusRequestMode: 'approval',  // 'direct' | 'approval' | 'disabled'
  allowDelegateNotes: true,
  allowChairNotes: true,
  allowMotions: true,
  allowLiveVoting: true
};

/**
 * Tipos de mensajes normalizados
 */
export const MSG_TYPES = {
  AUTH: 'AUTH',
  AUTH_RESULT: 'AUTH_RESULT',
  SELECT_COUNTRY: 'SELECT_COUNTRY',
  SELECT_COUNTRY_RESULT: 'SELECT_COUNTRY_RESULT',
  SYNC_STATE: 'SYNC_STATE',
  SESSION_ACTION: 'SESSION_ACTION',
  UPDATE_ROOM_SETTINGS: 'UPDATE_ROOM_SETTINGS',
  ROOM_SETTINGS_UPDATED: 'ROOM_SETTINGS_UPDATED',
  REQUEST_SPEAKING: 'REQUEST_SPEAKING',
  SPEAKING_PROCESSED: 'SPEAKING_PROCESSED',
  PROCESS_SPEAKING_REQUEST: 'PROCESS_SPEAKING_REQUEST',
  SPEAKING_REQUESTS_UPDATED: 'SPEAKING_REQUESTS_UPDATED',
  SEND_NOTE: 'SEND_NOTE',
  NOTE_RECEIVED: 'NOTE_RECEIVED',
  CRISIS_ALERT: 'CRISIS_ALERT',
  CAST_VOTE: 'CAST_VOTE',
  SUBMIT_AMENDMENT: 'SUBMIT_AMENDMENT',
  REQUEST_SYNC: 'REQUEST_SYNC',
  KICK: 'KICK',
  KICK_PEER: 'KICK_PEER',
  PING: 'PING',
  PONG: 'PONG'
};

/**
 * Generador de ID de sala amigable (ej: MUN-4921)
 */
export function generateRoomCode() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `MUN-${randomNum}`;
}

/**
 * Servidores ICE: STUN y TURN (Metered.ca Relay + Google STUN + Cloudflare STUN)
 * Garantiza conectividad 100% incluso en Wi-Fi escolar, redes con NAT simétrica y 4G/5G.
 */
export const DEFAULT_ICE_SERVERS = [
  {
    urls: 'stun:stun.relay.metered.ca:80'
  },
  {
    urls: 'turn:global.relay.metered.ca:80',
    username: '0438b14d85f2705b8e015817',
    credential: 'lKwHeQnxL+Hecz8h'
  },
  {
    urls: 'turn:global.relay.metered.ca:80?transport=tcp',
    username: '0438b14d85f2705b8e015817',
    credential: 'lKwHeQnxL+Hecz8h'
  },
  {
    urls: 'turn:global.relay.metered.ca:443',
    username: '0438b14d85f2705b8e015817',
    credential: 'lKwHeQnxL+Hecz8h'
  },
  {
    urls: 'turns:global.relay.metered.ca:443?transport=tcp',
    username: '0438b14d85f2705b8e015817',
    credential: 'lKwHeQnxL+Hecz8h'
  },
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' }
];

/**
 * Servidor de Señalización propio en Render
 */
export const DEFAULT_SIGNALING_CONFIG = {
  host: 'openmun-signaling.onrender.com',
  port: 443,
  path: '/openmun',
  secure: true
};

/**
 * Obtener opciones de configuración de PeerJS combinando defaults con localStorage
 */
export function getPeerConfig(overrideOptions = {}) {
  let signaling = { ...DEFAULT_SIGNALING_CONFIG };
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('openmun_signaling_config');
      if (saved) {
        signaling = { ...signaling, ...JSON.parse(saved) };
      }
    }
  } catch (e) { }

  return {
    debug: 1,
    host: signaling.host || 'openmun-signaling.onrender.com',
    port: signaling.port ? Number(signaling.port) : 443,
    path: signaling.path || '/',
    secure: signaling.secure !== false,
    config: {
      iceServers: DEFAULT_ICE_SERVERS,
      iceCandidatePoolSize: 10,
      sdpSemantics: 'unified-plan'
    },
    ...overrideOptions
  };
}

class PeerService {
  constructor() {
    this.peer = null;
    this.connections = new Map(); // peerId -> conn
    this.peerMetadata = new Map(); // peerId -> { role, country, connectedAt }
    this.broadcastChannel = null;
    this.isHost = false;
    this.listeners = new Set();
    this.roomId = null;
    this.secretPassword = 'secreto123';
    this.backroomPassword = 'crisis123';
    this.roomSettings = { ...DEFAULT_ROOM_SETTINGS };
    this.latestSpeakingRequests = [];
    this.latestSessionState = null;
    this.latestNotes = [];
    try {
      if (typeof window !== 'undefined') {
        const savedNotes = localStorage.getItem('openmun_notes');
        if (savedNotes) this.latestNotes = JSON.parse(savedNotes);
      }
    } catch (e) { }
    this.hostConn = null;
    this.heartbeatTimer = null;
    this.isTurnRelay = false;
    this.lastBroadcastedStateHash = null;
  }

  /**
   * Determina si la conexión WebRTC actual está pasando por un servidor TURN (relay)
   */
  async checkConnectionRelay(pc) {
    if (!pc || typeof pc.getStats !== 'function') return false;
    try {
      const stats = await pc.getStats();
      for (const report of stats.values()) {
        if (report.type === 'candidate-pair' && (report.selected || report.state === 'succeeded' || report.nominated)) {
          const localCandidate = stats.get(report.localCandidateId);
          const remoteCandidate = stats.get(report.remoteCandidateId);
          if (localCandidate?.candidateType === 'relay' || remoteCandidate?.candidateType === 'relay') {
            return true;
          }
        }
      }
    } catch (e) {
      // Ignorar errores transitorios de stats
    }
    return false;
  }

  // Filtrar histórico de notas según el rol y país del receptor
  getNotesForRole(role, country) {
    if (!Array.isArray(this.latestNotes)) return [];
    if (role === 'secretariat' || role === 'chair') {
      return this.latestNotes;
    }
    if (role === 'backroom') {
      return this.latestNotes.filter(n =>
        n.to?.toUpperCase() === 'BACKROOM' ||
        n.fromRole === 'backroom' ||
        n.from?.toUpperCase() === 'BACKROOM' ||
        n.to?.toUpperCase() === 'TODOS' ||
        n.type === 'crisis'
      );
    }
    if (role === 'delegate' && country) {
      const cleanCountry = country.toLowerCase().trim();
      return this.latestNotes.filter(n =>
        (n.to && n.to.toLowerCase().trim() === cleanCountry) ||
        (n.from && n.from.toLowerCase().trim() === cleanCountry) ||
        n.to?.toUpperCase() === 'TODOS'
      );
    }
    return [];
  }

  // Suscripción a eventos de red
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emit(event, data) {
    this.listeners.forEach(cb => {
      try {
        cb(event, data);
      } catch (err) {
        console.error('Error en listener de PeerService:', err);
      }
    });
  }

  // Keep-alive optimizado para el WebSocket del servidor de señalización (25s para minimizar MB)
  startSignalingHeartbeat() {
    this.stopSignalingHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.peer && !this.peer.destroyed) {
        if (this.peer.disconnected) {
          try {
            console.log('Reconectando Peer al servidor de señalización...');
            this.peer.reconnect();
          } catch (e) { }
        } else if (this.peer.socket && typeof this.peer.socket.send === 'function') {
          try {
            this.peer.socket.send({ type: 'HEARTBEAT' });
          } catch (e) { }
        }
      }
    }, 25000);
  }

  stopSignalingHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // INICIALIZACIÓN DEL HOST (CHAIR)
  // ─────────────────────────────────────────────────────────────
  async initHost(roomId, options = {}) {
    // Normalizar ID de sala
    const cleanRoomId = (roomId || generateRoomCode()).trim().toUpperCase();
    this.destroy();
    this.isHost = true;
    this.roomId = cleanRoomId;
    this.secretPassword = options.secretPassword || 'secreto123';
    this.backroomPassword = options.backroomPassword || 'crisis123';
    if (options.roomSettings) {
      this.roomSettings = { ...DEFAULT_ROOM_SETTINGS, ...options.roomSettings };
    }

    // Inicializar BroadcastChannel para la sesión secreta local (mismo navegador)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(LOCAL_BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingMessage('local_broadcast_secretariat', event.data, true);
        };
      } catch (err) {
        console.warn('BroadcastChannel no soportado o bloqueado:', err);
      }
    }

    return new Promise((resolve, reject) => {
      let isResolved = false;
      let hasTriedFallback = false;

      const createHostPeer = (useCloudFallback = false) => {
        try {
          if (useCloudFallback) {
            console.warn('Iniciando Host en PeerJS Cloud como fallback...');
            this.peer = new Peer(this.roomId, {
              debug: 1,
              config: {
                iceServers: DEFAULT_ICE_SERVERS,
                iceCandidatePoolSize: 10
              }
            });
          } else {
            const config = getPeerConfig(options.peerConfig || {});
            this.peer = new Peer(this.roomId, config);
          }
        } catch (err) {
          if (!isResolved) {
            isResolved = true;
            reject(new Error(`Error inicializando Host: ${err.message}`));
          }
          return;
        }

        this.peer.on('open', (id) => {
          if (!isResolved) {
            isResolved = true;
            this.startSignalingHeartbeat();
            this.emit('host_ready', { roomId: id, roomSettings: this.roomSettings });
            resolve(id);
          }
        });

        this.peer.on('connection', (conn) => {
          this.handleIncomingConnection(conn);
        });

        this.peer.on('error', (err) => {
          console.error('Error en PeerJS Host:', err);
          const errMsg = err?.message || 'Error en conexión P2P';
          const errType = err?.type;

          // Si el servidor de señalización de Render falla (ej: dormido o error de socket), intentar fallback a nube pública una vez
          if (!isResolved && !hasTriedFallback && (errType === 'server-error' || errType === 'socket-error' || errType === 'socket-closed')) {
            hasTriedFallback = true;
            console.warn('Servidor de señalización primario no disponible. Reintentando Host en PeerJS Cloud...');
            try { this.peer.destroy(); } catch (e) { }
            createHostPeer(true);
            return;
          }

          this.emit('error', { error: errMsg });
          if (!isResolved) {
            isResolved = true;
            if (errType === 'unavailable-id') {
              reject(new Error(`El código de sala "${this.roomId}" ya está en uso. Por favor genera otro o reinicia la sala.`));
            } else {
              reject(new Error(`Error al iniciar la sala: ${errMsg}`));
            }
          }
        });

        this.peer.on('disconnected', () => {
          console.warn('Host desconectado del servidor de señalización. Reconectando...');
          if (this.peer && !this.peer.destroyed) {
            try { this.peer.reconnect(); } catch (e) { }
          }
        });
      };

      createHostPeer(false);
    });
  }

  // Manejar conexión entrante al Host
  handleIncomingConnection(conn) {
    conn.on('open', () => {
      // Conexión DataChannel abierta con el peer
      setTimeout(async () => {
        if (conn.peerConnection) {
          const isRelay = await this.checkConnectionRelay(conn.peerConnection);
          const meta = this.peerMetadata.get(conn.peer);
          if (meta) meta.isRelay = isRelay;
          const anyRelay = isRelay || Array.from(this.peerMetadata.values()).some(m => m.isRelay);
          this.isTurnRelay = anyRelay;
          this.emit('connection_type', {
            isRelay: anyRelay,
            type: anyRelay ? 'relay' : 'direct',
            mode: anyRelay ? 'TURN Server (Relay)' : 'P2P Directo'
          });
        }
      }, 1000);
    });

    conn.on('data', (data) => {
      if (data?.type === MSG_TYPES.PING) {
        try { conn.send({ type: MSG_TYPES.PONG, timestamp: Date.now() }); } catch (e) { }
        return;
      }
      this.handleIncomingMessage(conn.peer, data, false, conn);
    });

    conn.on('close', () => {
      const meta = this.peerMetadata.get(conn.peer);
      this.connections.delete(conn.peer);
      this.peerMetadata.delete(conn.peer);
      this.emit('peer_disconnected', { peerId: conn.peer, meta });
      this.broadcastPeerList();
    });

    conn.on('error', (err) => {
      console.warn(`Error en conexión con peer ${conn.peer}:`, err);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // INICIALIZACIÓN DEL CLIENTE (DELEGADO / SECRETO / BACKROOM)
  // ─────────────────────────────────────────────────────────────
  async initClient({ roomId, role, password, country, isLocalBroadcast = false }) {
    const cleanRoomId = (roomId || '').trim().toUpperCase();
    this.destroy();
    this.isHost = false;
    this.roomId = cleanRoomId;

    // Modo Secreto Local mediante BroadcastChannel
    if (isLocalBroadcast) {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel(LOCAL_BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          this.emit('message', event.data);
        };
        // Notificar al Chair que se ha unido una pantalla secreta local
        this.broadcastChannel.postMessage({
          type: MSG_TYPES.AUTH,
          payload: { role: 'secretariat', country: 'Secretaría Local', isLocal: true },
          id: `auth-${Date.now()}`
        });
        this.emit('connected', { role: 'secretariat', isLocal: true, roomSettings: this.roomSettings });
        return true;
      }
      throw new Error('BroadcastChannel no soportado en este navegador');
    }

    // Cliente P2P remoto con reintentos progresivos y soporte TURN
    return new Promise((resolve, reject) => {
      let isSettled = false;
      let attempt = 0;
      const MAX_ATTEMPTS = 3;
      let currentConn = null;
      let hasTriedFallback = false;
      let retryTimer = null;

      const safeReject = (err) => {
        if (!isSettled) {
          isSettled = true;
          if (connectTimeout) clearTimeout(connectTimeout);
          if (retryTimer) clearTimeout(retryTimer);
          this.destroy();
          const message = typeof err === 'string' ? err : (err?.message || 'Error de conexión P2P');
          reject(new Error(message));
        }
      };

      const safeResolve = (data) => {
        if (!isSettled) {
          isSettled = true;
          if (connectTimeout) clearTimeout(connectTimeout);
          if (retryTimer) clearTimeout(retryTimer);
          resolve(data);
        }
      };

      // Timeout global adaptativo (30 segundos para permitir activación de Render y relay TURN)
      const connectTimeout = setTimeout(() => {
        safeReject(`Tiempo de espera agotado al conectar con la sala "${cleanRoomId}". Verifica que el código sea correcto y que el Chair tenga la sala iniciada.`);
      }, 30000);

      const establishDataConnection = () => {
        if (isSettled || !this.peer || this.peer.destroyed) return;

        attempt++;
        if (attempt > 1) {
          this.emit('connecting_status', { attempt, max: MAX_ATTEMPTS, text: `Reintentando conexión con la sala (${attempt}/${MAX_ATTEMPTS})...` });
        }

        try {
          if (currentConn) {
            try { currentConn.close(); } catch (e) { }
            currentConn = null;
          }

          // Conexión DataChannel con reliable: true para garantizar orden y entrega
          currentConn = this.peer.connect(cleanRoomId, {
            reliable: true
          });

          currentConn.on('open', () => {
            this.hostConn = currentConn;
            currentConn.send({
              type: MSG_TYPES.AUTH,
              payload: { role, password, country }
            });

            // Detectar si la conexión es vía TURN Relay y emitir estado
            const checkRelay = async () => {
              if (currentConn?.peerConnection) {
                const isRelay = await this.checkConnectionRelay(currentConn.peerConnection);
                this.isTurnRelay = isRelay;
                this.emit('connection_type', {
                  isRelay,
                  type: isRelay ? 'relay' : 'direct',
                  mode: isRelay ? 'TURN Server (Relay)' : 'P2P Directo'
                });
              }
            };
            setTimeout(checkRelay, 1200);
            try {
              if (currentConn.peerConnection) {
                currentConn.peerConnection.addEventListener('iceconnectionstatechange', () => {
                  if (currentConn?.peerConnection?.iceConnectionState === 'connected' || currentConn?.peerConnection?.iceConnectionState === 'completed') {
                    checkRelay();
                  }
                });
              }
            } catch (e) { }
          });

          currentConn.on('data', (data) => {
            if (data?.type === MSG_TYPES.PING) {
              try { currentConn.send({ type: MSG_TYPES.PONG, timestamp: Date.now() }); } catch (e) { }
              return;
            }

            if (data?.type === MSG_TYPES.AUTH_RESULT) {
              if (data.payload?.success) {
                if (data.payload.roomSettings) {
                  this.roomSettings = data.payload.roomSettings;
                }
                if (data.payload.speakingRequests) {
                  this.latestSpeakingRequests = data.payload.speakingRequests;
                }
                this.emit('connected', {
                  role: data.payload.role,
                  country: data.payload.country,
                  sessionState: data.payload.sessionState,
                  roomSettings: data.payload.roomSettings,
                  speakingRequests: data.payload.speakingRequests || []
                });
                safeResolve(data.payload);
              } else {
                currentConn.close();
                safeReject(data.payload?.message || 'Acceso denegado');
              }
              return;
            }
            this.emit('message', data);
          });

          currentConn.on('close', () => {
            this.emit('disconnected', { reason: 'Conexión con el Chair cerrada' });
          });

          currentConn.on('error', (err) => {
            console.warn(`Error en conexión con el host (intento ${attempt}):`, err);
            const errText = err?.message || String(err);

            if (attempt < MAX_ATTEMPTS && !isSettled) {
              retryTimer = setTimeout(establishDataConnection, 1800);
            } else if (errText.includes('Negotiation') || errText.includes('negotiation')) {
              safeReject(`Error de negociación WebRTC con la sala "${cleanRoomId}". Verifica que la sala esté iniciada por el Chair.`);
            } else {
              safeReject(errText);
            }
          });
        } catch (err) {
          if (attempt < MAX_ATTEMPTS && !isSettled) {
            retryTimer = setTimeout(establishDataConnection, 1800);
          } else {
            safeReject(err);
          }
        }
      };

      const createClientPeer = (useCloudFallback = false) => {
        try {
          if (useCloudFallback) {
            console.warn('Iniciando Cliente en PeerJS Cloud como fallback...');
            this.peer = new Peer({
              debug: 1,
              config: {
                iceServers: DEFAULT_ICE_SERVERS,
                iceCandidatePoolSize: 10
              }
            });
          } else {
            const config = getPeerConfig();
            this.peer = new Peer(config);
          }
        } catch (err) {
          safeReject(`Error inicializando WebRTC: ${err.message}`);
          return;
        }

        this.peer.on('open', () => {
          this.startSignalingHeartbeat();
          establishDataConnection();
        });

        this.peer.on('error', (err) => {
          console.error('Error en PeerJS Cliente:', err);
          const errType = err.type;
          const errMsg = err.message || '';

          // Fallback a nube si el servidor de señalización primario tiene fallo de socket
          if (!isSettled && !hasTriedFallback && (errType === 'server-error' || errType === 'socket-error' || errType === 'socket-closed')) {
            hasTriedFallback = true;
            console.warn('Servidor de señalización primario no disponible. Reintentando Cliente en PeerJS Cloud...');
            try { this.peer.destroy(); } catch (e) { }
            createClientPeer(true);
            return;
          }

          if (errType === 'peer-unavailable') {
            if (attempt < MAX_ATTEMPTS && !isSettled) {
              console.log(`Sala aún no disponible en señalización. Reintentando en 2s (intento ${attempt + 1}/${MAX_ATTEMPTS})...`);
              retryTimer = setTimeout(establishDataConnection, 2000 + jitter);
              return;
            }
            safeReject(`La sala "${cleanRoomId}" no se encuentra activa en el servidor. Asegúrate de que el Chair haya iniciado la sala primero.`);
          } else if ((errType === 'negotiation-failed' || errMsg.includes('Negotiation') || errMsg.includes('negotiation')) && attempt < MAX_ATTEMPTS) {
            console.log(`Reintentando negociación WebRTC (intento ${attempt + 1}/${MAX_ATTEMPTS})...`);
            retryTimer = setTimeout(establishDataConnection, 1500);
          } else if (errType === 'negotiation-failed' || errMsg.includes('Negotiation') || errMsg.includes('negotiation')) {
            safeReject(`Error de negociación WebRTC al conectar con la sala "${cleanRoomId}".`);
          } else {
            safeReject(`No se pudo conectar a la sala: ${errMsg || 'Error de red'}`);
          }
        });
      };

      createClientPeer(false);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // ENRUTAMIENTO Y PROCESAMIENTO DE MENSAJES EN EL HOST
  // ─────────────────────────────────────────────────────────────
  handleIncomingMessage(peerId, message, isLocal = false, conn = null) {
    if (!message || !message.type) return;

    // 1. Mensaje de Autenticación
    if (message.type === MSG_TYPES.AUTH) {
      const { role, password, country } = message.payload || {};
      let authorized = false;
      let errorMsg = '';

      if (isLocal) {
        authorized = true;
      } else if (role === 'delegate') {
        if (country && country.trim()) {
          // Validar si el país ya está conectado
          const yaConectado = Array.from(this.peerMetadata.values()).some(
            m => m.role === 'delegate' && m.country && m.country.toLowerCase() === country.trim().toLowerCase()
          );
          if (yaConectado) {
            errorMsg = `La delegación de ${country} ya está conectada`;
          } else {
            authorized = true;
          }
        } else {
          // El delegado se conecta para elegir país de la lista oficial que le envía el Host
          authorized = true;
        }
      } else if (role === 'secretariat') {
        if (password === this.secretPassword) {
          authorized = true;
        } else {
          errorMsg = 'Contraseña de Secretaría incorrecta';
        }
      } else if (role === 'backroom') {
        if (password === this.backroomPassword) {
          authorized = true;
        } else {
          errorMsg = 'Contraseña de Backroom incorrecta';
        }
      } else {
        errorMsg = 'Rol desconocido';
      }

      if (conn) {
        if (authorized) {
          this.connections.set(peerId, conn);
          const meta = { role, country: country?.trim() || null, connectedAt: Date.now() };
          this.peerMetadata.set(peerId, meta);

          const roleNotes = meta.country ? this.getNotesForRole(role, meta.country) : [];

          conn.send({
            type: MSG_TYPES.AUTH_RESULT,
            payload: {
              success: true,
              role,
              country: meta.country,
              roomSettings: this.roomSettings,
              speakingRequests: this.latestSpeakingRequests || [],
              sessionState: this.latestSessionState || null,
              notes: roleNotes
            }
          });

          this.emit('peer_authenticated', { peerId, meta });
          this.broadcastPeerList();
        } else {
          conn.send({
            type: MSG_TYPES.AUTH_RESULT,
            payload: { success: false, message: errorMsg }
          });
          setTimeout(() => conn.close(), 300);
        }
      } else if (isLocal && authorized) {
        this.broadcastLocal({
          type: MSG_TYPES.AUTH_RESULT,
          payload: {
            success: true,
            role: 'secretariat',
            country: 'Secretaría Local',
            roomSettings: this.roomSettings,
            speakingRequests: this.latestSpeakingRequests || [],
            sessionState: this.latestSessionState || null,
            notes: this.latestNotes || []
          }
        });
      }
      return;
    }

    // 1.1 Selección / Toma de País por parte del Delegado (desde el array de países enviado por el Host)
    if (message.type === MSG_TYPES.SELECT_COUNTRY) {
      const selectedCountry = (message.payload?.country || '').trim();
      if (!selectedCountry) {
        if (conn) {
          conn.send({
            type: MSG_TYPES.SELECT_COUNTRY_RESULT,
            payload: { success: false, message: 'Por favor selecciona un país válido' }
          });
        }
        return;
      }

      // Validar si otro peer ya tiene asignado este país
      const yaOcupado = Array.from(this.peerMetadata.entries()).some(
        ([id, m]) => id !== peerId && m.role === 'delegate' && m.country && m.country.toLowerCase() === selectedCountry.toLowerCase()
      );

      if (yaOcupado) {
        if (conn) {
          conn.send({
            type: MSG_TYPES.SELECT_COUNTRY_RESULT,
            payload: { success: false, message: `La delegación de ${selectedCountry} ya ha sido seleccionada por otro participante.` }
          });
        }
        return;
      }

      // Asignar el país al peer
      const currentMeta = this.peerMetadata.get(peerId) || { role: 'delegate', connectedAt: Date.now() };
      const updatedMeta = { ...currentMeta, country: selectedCountry };
      this.peerMetadata.set(peerId, updatedMeta);

      const roleNotes = this.getNotesForRole('delegate', selectedCountry);

      if (conn) {
        conn.send({
          type: MSG_TYPES.SELECT_COUNTRY_RESULT,
          payload: {
            success: true,
            country: selectedCountry,
            roomSettings: this.roomSettings,
            sessionState: this.latestSessionState || null,
            speakingRequests: this.latestSpeakingRequests || [],
            notes: roleNotes
          }
        });
      }

      this.emit('peer_authenticated', { peerId, meta: updatedMeta });
      this.broadcastPeerList();
      return;
    }

    // Comprobar que el peer está autenticado si es remoto
    const senderMeta = isLocal ? { role: 'secretariat', country: 'Secretaría Local' } : this.peerMetadata.get(peerId);
    if (!isLocal && !senderMeta) {
      console.warn(`Mensaje ignorado de peer no autenticado: ${peerId}`);
      return;
    }

    // 2. Modificación de Ajustes de Sala (desde Secretaría u otro operador autorizado)
    if (message.type === MSG_TYPES.UPDATE_ROOM_SETTINGS) {
      if (senderMeta.role === 'secretariat' || isLocal) {
        this.roomSettings = { ...this.roomSettings, ...message.payload };
        this.emit('room_settings_updated', this.roomSettings);
        this.broadcastRoomSettings();
      }
      return;
    }

    // 3. Procesamiento de Solicitudes de Oradores desde Secretaría
    if (message.type === MSG_TYPES.PROCESS_SPEAKING_REQUEST) {
      if (senderMeta.role === 'secretariat' || isLocal) {
        this.emit('process_speaking_request', message.payload);
      }
      return;
    }

    // 4. Expulsión de peer desde Secretaría
    if (message.type === MSG_TYPES.KICK_PEER) {
      if (senderMeta.role === 'secretariat' || isLocal) {
        this.kickPeer(message.payload?.peerId);
      }
      return;
    }

    // 5. Emisión de Voto desde Delegado
    if (message.type === MSG_TYPES.CAST_VOTE) {
      if (this.roomSettings.allowLiveVoting) {
        this.emit('vote_received', {
          country: senderMeta.country,
          vote: message.payload?.vote
        });
      }
      return;
    }

    // 5.1 Envío de Enmienda desde Delegado
    if (message.type === MSG_TYPES.SUBMIT_AMENDMENT) {
      const amendmentData = {
        id: `prop_del_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        paisProponente: senderMeta.country,
        tipo: message.payload?.tipo || 'modificacion',
        articuloId: message.payload?.articuloId || null,
        articuloNumero: message.payload?.articuloNumero || '',
        textoOriginal: message.payload?.textoOriginal || '',
        textoPropuesto: message.payload?.textoPropuesto || '',
        justificacion: message.payload?.justificacion || '',
        timestamp: Date.now()
      };

      this.emit('amendment_proposed_by_delegate', amendmentData);

      if (conn) {
        conn.send({
          type: MSG_TYPES.SPEAKING_PROCESSED,
          payload: { success: true, mode: 'amendment', message: '¡Enmienda enviada a la Mesa para su revisión!' }
        });
      }
      return;
    }

    // 6. Solicitudes de Orador / Moción (desde Delegado)
    if (message.type === MSG_TYPES.REQUEST_SPEAKING) {
      const speechType = message.payload?.speechType; // 'GSL' | 'CAUCUS' | 'POINT_MOTION'
      const country = senderMeta.country;

      // Verificar modo de solicitud según tipo
      if (speechType === 'GSL') {
        const mode = this.roomSettings.speakerRequestMode;
        if (mode === 'disabled') {
          if (conn) {
            conn.send({
              type: MSG_TYPES.SPEAKING_PROCESSED,
              payload: { success: false, mode: 'disabled', message: 'Las solicitudes a la Lista de Oradores están cerradas por la Mesa.' }
            });
          }
          return;
        } else if (mode === 'direct') {
          // Inserción directa en la lista de oradores
          this.emit('direct_speaker_request', { speechType: 'GSL', country });
          if (conn) {
            conn.send({
              type: MSG_TYPES.SPEAKING_PROCESSED,
              payload: { success: true, mode: 'direct', message: '¡Te has añadido a la Lista de Oradores!' }
            });
          }
          return;
        }
      } else if (speechType === 'CAUCUS') {
        const mode = this.roomSettings.caucusRequestMode;
        if (mode === 'disabled') {
          if (conn) {
            conn.send({
              type: MSG_TYPES.SPEAKING_PROCESSED,
              payload: { success: false, mode: 'disabled', message: 'Las solicitudes para Caucus Moderado están cerradas por la Mesa.' }
            });
          }
          return;
        } else if (mode === 'direct') {
          this.emit('direct_speaker_request', { speechType: 'CAUCUS', country });
          if (conn) {
            conn.send({
              type: MSG_TYPES.SPEAKING_PROCESSED,
              payload: { success: true, mode: 'direct', message: '¡Te has añadido a la lista del Caucus!' }
            });
          }
          return;
        }
      } else if (speechType === 'POINT_MOTION') {
        if (!this.roomSettings.allowMotions) {
          if (conn) {
            conn.send({
              type: MSG_TYPES.SPEAKING_PROCESSED,
              payload: { success: false, mode: 'disabled', message: 'La presentación de mociones está deshabilitada por la Mesa.' }
            });
          }
          return;
        }
      }

      // Si requiere aprobación (o moción), se añade a la cola de pendientes del Host y Secretaría
      if (conn) {
        conn.send({
          type: MSG_TYPES.SPEAKING_PROCESSED,
          payload: { success: true, mode: 'approval', message: 'Solicitud enviada a la Mesa para su aprobación.' }
        });
      }
    }

    // Notificar al Host de la recepción del mensaje
    this.emit('message_received_by_host', { peerId, senderMeta, message });

    // 7. Enrutamiento de Notas (Pajes / Mensajería)
    if (message.type === MSG_TYPES.SEND_NOTE) {
      // Validar si las notas están permitidas
      if (senderMeta.role === 'delegate') {
        const target = message.payload?.to;
        if (target === 'CHAIR' && !this.roomSettings.allowChairNotes) {
          return;
        }
        if (target !== 'CHAIR' && target !== 'BACKROOM' && !this.roomSettings.allowDelegateNotes) {
          return;
        }
      }
      this.routeNoteMessage(senderMeta, message);
    }

    // 8. Acción de Sesión (desde Secretaría u Operador Autorizado)
    if (message.type === MSG_TYPES.SESSION_ACTION) {
      if (senderMeta.role === 'secretariat' || senderMeta.role === 'chair' || isLocal) {
        this.emit('session_action', {
          peerId,
          senderMeta,
          action: message.payload?.action,
          payload: message.payload?.payload,
          timestamp: message.payload?.timestamp || Date.now()
        });
      }
      return;
    }

    // 9. Solicitud de Sincronización de Estado (ej: Recargar Documento / Estado desde Delegado o Secretaría)
    if (message.type === MSG_TYPES.REQUEST_SYNC) {
      const syncMsg = {
        type: MSG_TYPES.SYNC_STATE,
        payload: {
          ...(this.latestSessionState || {}),
          roomSettings: this.roomSettings,
          speakingRequests: this.latestSpeakingRequests || []
        }
      };
      if (conn) {
        try {
          conn.send(syncMsg);
        } catch (e) { }
      } else if (isLocal) {
        this.broadcastLocal(syncMsg);
      }
      return;
    }
  }

  // Enrutador de Notas según Matriz de Privacidad
  routeNoteMessage(senderMeta, message) {
    const note = message.payload;
    if (!note || !note.to) return;

    const formattedNote = {
      ...note,
      id: note.id || `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      from: senderMeta.country || senderMeta.role,
      fromRole: senderMeta.role,
      timestamp: note.timestamp || Date.now()
    };

    // Guardar en el histórico del Host
    if (!this.latestNotes) this.latestNotes = [];
    if (!this.latestNotes.some(n => n.id === formattedNote.id)) {
      this.latestNotes = [formattedNote, ...this.latestNotes];
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('openmun_notes', JSON.stringify(this.latestNotes));
        }
      } catch (e) { }
    }

    const target = note.to; // País destinatario, 'CHAIR', 'BACKROOM', 'TODOS'

    // A. Enviar a destinatarios remotos correspondientes (Optimización de Privacidad y Ancho de Banda)
    this.connections.forEach((conn, peerId) => {
      const meta = this.peerMetadata.get(peerId);
      if (!meta) return;

      let shouldReceive = false;

      if (meta.role === 'delegate') {
        // Un delegado SOLO recibe notas dirigidas a su país, enviadas por él o para TODOS
        const myCountry = (meta.country || '').toLowerCase().trim();
        const targetClean = (target || '').toLowerCase().trim();
        const fromClean = (formattedNote.from || '').toLowerCase().trim();

        if (myCountry && (targetClean === myCountry || targetClean === 'todos' || fromClean === myCountry)) {
          shouldReceive = true;
        }
      } else if (meta.role === 'backroom') {
        // El backroom recibe notas destinadas a BACKROOM, enviadas por BACKROOM o a TODOS
        if (target.toUpperCase() === 'BACKROOM' || formattedNote.fromRole === 'backroom' || target.toUpperCase() === 'TODOS') {
          shouldReceive = true;
        }
      } else if (meta.role === 'secretariat') {
        // La secretaría tiene la consola completa de notas
        shouldReceive = true;
      }

      if (shouldReceive) {
        try {
          conn.send({
            type: MSG_TYPES.NOTE_RECEIVED,
            payload: formattedNote
          });
        } catch (e) {
          console.warn(`Error enviando nota a ${peerId}:`, e);
        }
      }
    });

    // B. Enviar a Secretaría Local (BroadcastChannel)
    this.broadcastLocal({
      type: MSG_TYPES.NOTE_RECEIVED,
      payload: formattedNote
    });

    // C. Notificar al propio Chair
    this.emit('note_for_chair', formattedNote);
  }

  // ─────────────────────────────────────────────────────────────
  // EMISIÓN Y SINCRONIZACIÓN DESDE EL CHAIR
  // ─────────────────────────────────────────────────────────────
  getPublicSessionState(state) {
    if (!state || typeof state !== 'object') return {};
    return {
      paises: state.paises || [],
      agendaSesion: state.agendaSesion || {},
      caucusActivo: state.caucusActivo || {},
      oradoresCola: state.oradoresCola || [],
      oradoresCaucus: state.oradoresCaucus || [],
      votacionSesion: state.votacionSesion || {},
      documento: state.documento || null,
      isPaused: state.isPaused,
      tiempoRestante: state.tiempoRestante,
      temaActual: state.temaActual || state.agendaSesion?.temaActual || ''
    };
  }

  broadcastStateToClients(state) {
    this.latestSessionState = state;
    const publicState = this.getPublicSessionState(state);

    const msg = {
      type: MSG_TYPES.SYNC_STATE,
      payload: {
        ...publicState,
        roomSettings: this.roomSettings,
        speakingRequests: this.latestSpeakingRequests || []
      }
    };

    this.connections.forEach((conn) => {
      try {
        conn.send(msg);
      } catch (e) { }
    });

    this.broadcastLocal(msg);
  }

  broadcastSpeakingRequests(requests) {
    this.latestSpeakingRequests = requests || [];
    const msg = {
      type: MSG_TYPES.SPEAKING_REQUESTS_UPDATED,
      payload: this.latestSpeakingRequests
    };

    this.connections.forEach((conn, peerId) => {
      const meta = this.peerMetadata.get(peerId);
      if (meta && (meta.role === 'secretariat' || meta.role === 'chair')) {
        try { conn.send(msg); } catch (e) { }
      }
    });

    this.broadcastLocal(msg);
  }

  broadcastRoomSettings(settings = null) {
    if (settings) {
      this.roomSettings = { ...this.roomSettings, ...settings };
    }
    const msg = {
      type: MSG_TYPES.ROOM_SETTINGS_UPDATED,
      payload: this.roomSettings
    };

    this.connections.forEach((conn) => {
      try {
        conn.send(msg);
      } catch (e) { }
    });

    this.broadcastLocal(msg);
  }

  broadcastCrisisAlert(alertData) {
    const msg = {
      type: MSG_TYPES.CRISIS_ALERT,
      payload: alertData
    };

    this.connections.forEach((conn) => {
      try {
        conn.send(msg);
      } catch (e) { }
    });

    this.broadcastLocal(msg);
  }

  broadcastPeerList() {
    const list = Array.from(this.peerMetadata.entries()).map(([id, meta]) => ({
      peerId: id,
      ...meta
    }));
    this.emit('peer_list_updated', list);
  }

  broadcastLocal(data) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(data);
      } catch (e) { }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // MÉTODOS DEL CLIENTE
  // ─────────────────────────────────────────────────────────────
  sendToServer(type, payload) {
    const msg = {
      type,
      payload,
      id: `msg-${Date.now()}`
    };

    if (this.hostConn && this.hostConn.open) {
      this.hostConn.send(msg);
      return true;
    } else if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(msg);
      return true;
    }
    return false;
  }

  sendNoteAsClient(to, text, type = 'general') {
    return this.sendToServer(MSG_TYPES.SEND_NOTE, {
      to,
      text,
      type,
      timestamp: Date.now()
    });
  }

  requestSpeakingAsClient(speechType, details = {}) {
    return this.sendToServer(MSG_TYPES.REQUEST_SPEAKING, {
      speechType, // 'GSL' | 'CAUCUS' | 'POINT_MOTION'
      details,
      timestamp: Date.now()
    });
  }

  updateRoomSettingsAsClient(settings) {
    return this.sendToServer(MSG_TYPES.UPDATE_ROOM_SETTINGS, settings);
  }

  processSpeakingRequestAsClient(requestId, action, requestData = {}) {
    return this.sendToServer(MSG_TYPES.PROCESS_SPEAKING_REQUEST, {
      requestId,
      action, // 'accept' | 'reject'
      requestData
    });
  }

  selectCountryAsClient(country) {
    return this.sendToServer(MSG_TYPES.SELECT_COUNTRY, {
      country,
      timestamp: Date.now()
    });
  }

  castVoteAsClient(country, vote) {
    return this.sendToServer(MSG_TYPES.CAST_VOTE, {
      country,
      vote,
      timestamp: Date.now()
    });
  }

  submitAmendmentAsClient(amendmentData) {
    return this.sendToServer(MSG_TYPES.SUBMIT_AMENDMENT, amendmentData);
  }

  requestStateSyncAsClient() {
    return this.sendToServer(MSG_TYPES.REQUEST_SYNC, { timestamp: Date.now() });
  }

  sendSessionActionAsClient(action, payload) {
    return this.sendToServer(MSG_TYPES.SESSION_ACTION, {
      action,
      payload,
      timestamp: Date.now()
    });
  }

  kickPeerAsClient(peerId) {
    return this.sendToServer(MSG_TYPES.KICK_PEER, { peerId });
  }

  kickPeer(peerId) {
    const conn = this.connections.get(peerId);
    if (conn) {
      try {
        conn.send({ type: MSG_TYPES.KICK, payload: { reason: 'Desconectado por la Mesa (Chair)' } });
        conn.close();
      } catch (e) { }
      this.connections.delete(peerId);
      this.peerMetadata.delete(peerId);
      this.broadcastPeerList();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // LIMPIEZA
  // ─────────────────────────────────────────────────────────────
  destroy() {
    this.stopSignalingHeartbeat();
    if (this.connections) {
      this.connections.forEach(conn => {
        try { conn.close(); } catch (e) { }
      });
      this.connections.clear();
    }
    if (this.peerMetadata) {
      this.peerMetadata.clear();
    }
    if (this.hostConn) {
      try { this.hostConn.close(); } catch (e) { }
      this.hostConn = null;
    }
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch (e) { }
      this.broadcastChannel = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) { }
      this.peer = null;
    }
    this.isHost = false;
    this.roomId = null;
    this.isTurnRelay = false;
  }
}

export const peerService = new PeerService();
export default peerService;
