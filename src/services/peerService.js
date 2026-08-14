import { Peer } from 'peerjs';

export const LOCAL_BROADCAST_CHANNEL_NAME = 'openmun_local_secret_channel';

/**
 * Tipos de mensajes normalizados
 */
export const MSG_TYPES = {
  AUTH: 'AUTH',
  AUTH_RESULT: 'AUTH_RESULT',
  SYNC_STATE: 'SYNC_STATE',
  REQUEST_SPEAKING: 'REQUEST_SPEAKING',
  SPEAKING_PROCESSED: 'SPEAKING_PROCESSED',
  SEND_NOTE: 'SEND_NOTE',
  NOTE_RECEIVED: 'NOTE_RECEIVED',
  CRISIS_ALERT: 'CRISIS_ALERT',
  KICK: 'KICK',
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
    this.latestSessionState = null;
    this.hostConn = null;
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

  // ─────────────────────────────────────────────────────────────
  // INICIALIZACIÓN DEL HOST (CHAIR)
  // ─────────────────────────────────────────────────────────────
  async initHost(roomId, passwords = {}) {
    this.destroy();
    this.isHost = true;
    this.roomId = roomId || generateRoomCode();
    this.secretPassword = passwords.secretPassword || 'secreto123';
    this.backroomPassword = passwords.backroomPassword || 'crisis123';

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
      this.peer = new Peer(this.roomId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        this.emit('host_ready', { roomId: id });
        resolve(id);
      });

      this.peer.on('connection', (conn) => {
        this.handleIncomingConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('Error en PeerJS Host:', err);
        this.emit('error', { error: err.message || 'Error en conexión P2P' });
        if (err.type === 'unavailable-id') {
          reject(new Error(`El código de sala "${this.roomId}" ya está en uso. Por favor genera otro.`));
        }
      });

      this.peer.on('disconnected', () => {
        this.emit('disconnected', {});
        if (this.peer && !this.peer.destroyed) {
          try { this.peer.reconnect(); } catch (e) { }
        }
      });
    });
  }

  // Manejar conexión entrante al Host
  handleIncomingConnection(conn) {
    conn.on('open', () => {
      // Esperar mensaje AUTH del cliente
    });

    conn.on('data', (data) => {
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
    this.destroy();
    this.isHost = false;
    this.roomId = roomId;

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
        this.emit('connected', { role: 'secretariat', isLocal: true });
        return true;
      }
      throw new Error('BroadcastChannel no soportado en este navegador');
    }

    // Cliente P2P remoto
    return new Promise((resolve, reject) => {
      this.peer = new Peer({
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      });

      const connectTimeout = setTimeout(() => {
        if (this.peer) this.peer.destroy();
        reject(new Error('Tiempo de espera agotado al conectar con la sala. Verifica el código.'));
      }, 12000);

      this.peer.on('open', () => {
        const conn = this.peer.connect(roomId, {
          reliable: true
        });

        conn.on('open', () => {
          clearTimeout(connectTimeout);
          this.hostConn = conn;
          // Enviar credenciales / solicitud de rol
          conn.send({
            type: MSG_TYPES.AUTH,
            payload: { role, password, country }
          });
        });

        conn.on('data', (data) => {
          if (data?.type === MSG_TYPES.AUTH_RESULT) {
            if (data.payload?.success) {
              this.emit('connected', { role: data.payload.role, country: data.payload.country, sessionState: data.payload.sessionState });
              resolve(data.payload);
            } else {
              conn.close();
              reject(new Error(data.payload?.message || 'Acceso denegado'));
            }
            return;
          }
          this.emit('message', data);
        });

        conn.on('close', () => {
          this.emit('disconnected', { reason: 'Conexión con el Chair cerrada' });
        });

        conn.on('error', (err) => {
          clearTimeout(connectTimeout);
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        clearTimeout(connectTimeout);
        console.error('Error en PeerJS Cliente:', err);
        reject(new Error(`No se pudo conectar a la sala: ${err.message || 'Error de red'}`));
      });
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
        if (!country || !country.trim()) {
          errorMsg = 'Debes seleccionar un país';
        } else {
          // Validar si el país ya está conectado
          const yaConectado = Array.from(this.peerMetadata.values()).some(
            m => m.role === 'delegate' && m.country.toLowerCase() === country.toLowerCase()
          );
          if (yaConectado) {
            errorMsg = `La delegación de ${country} ya está conectada`;
          } else {
            authorized = true;
          }
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
          const meta = { role, country: country || (role === 'backroom' ? 'Backroom' : 'Secretaría'), connectedAt: Date.now() };
          this.peerMetadata.set(peerId, meta);

          conn.send({
            type: MSG_TYPES.AUTH_RESULT,
            payload: {
              success: true,
              role,
              country: meta.country,
              sessionState: this.latestSessionState || null
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
          payload: { success: true, role: 'secretariat', country: 'Secretaría Local', sessionState: this.latestSessionState || null }
        });
      }
      return;
    }

    // Comprobar que el peer está autenticado si es remoto
    const senderMeta = isLocal ? { role: 'secretariat', country: 'Secretaría Local' } : this.peerMetadata.get(peerId);
    if (!isLocal && !senderMeta) {
      console.warn(`Mensaje ignorado de peer no autenticado: ${peerId}`);
      return;
    }

    // 2. Notificar al Host de la recepción del mensaje
    this.emit('message_received_by_host', { peerId, senderMeta, message });

    // 3. Enrutamiento de Notas (Pajes / Mensajería)
    if (message.type === MSG_TYPES.SEND_NOTE) {
      this.routeNoteMessage(senderMeta, message);
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

    const target = note.to; // País destinatario, 'CHAIR', 'BACKROOM', 'TODOS'

    // A. Enviar a destinatarios remotos correspondientes
    this.connections.forEach((conn, peerId) => {
      const meta = this.peerMetadata.get(peerId);
      if (!meta) return;

      let shouldReceive = false;

      if (meta.role === 'delegate') {
        // Un delegado SOLO recibe notas destinadas a su país
        if (target.toLowerCase() === meta.country.toLowerCase()) {
          shouldReceive = true;
        }
      } else if (meta.role === 'backroom') {
        // El backroom recibe notas destinadas a BACKROOM o enviadas por el propio BACKROOM
        if (target.toUpperCase() === 'BACKROOM' || formattedNote.fromRole === 'backroom') {
          shouldReceive = true;
        }
      } else if (meta.role === 'secretariat') {
        // La secretaría tiene el feed completo de notas de toda la sala
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
  broadcastStateToClients(state) {
    this.latestSessionState = state;
    const msg = {
      type: MSG_TYPES.SYNC_STATE,
      payload: state
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
  }
}

export const peerService = new PeerService();
export default peerService;
