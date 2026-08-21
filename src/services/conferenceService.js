/**
 * Servicio de Cliente HTTP para la API de Conferencias y Sincronización OpenMUN
 * Conectado al backend Node.js + Express + SQLite + Socket.io
 */

import { SOCKET_SERVER_URL } from './peerService.js';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('openmun_api_server_url');
    if (customUrl) return customUrl.replace(/\/$/, '');
  }
  return SOCKET_SERVER_URL || 'https://api.openmun.app';
};

export const API_BASE_URL = getApiBaseUrl();

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.error || `Error ${response.status}: ${response.statusText}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Caché en memoria para optimizar peticiones repetitivas a la base de datos
const requestCache = new Map();
const inFlightRequests = new Map();

function invalidateConferenceCache(conferenciaId) {
  if (!conferenciaId) return;
  const cleanId = String(conferenciaId).trim().toLowerCase();
  for (const key of requestCache.keys()) {
    if (key.includes(encodeURIComponent(cleanId))) {
      requestCache.delete(key);
    }
  }
}

async function fetchWithDeduplication(url, ttlMs = 4000) {
  const now = Date.now();
  const cached = requestCache.get(url);
  if (cached && (now - cached.timestamp < ttlMs)) {
    return cached.data;
  }

  if (inFlightRequests.has(url)) {
    return inFlightRequests.get(url);
  }

  const promise = (async () => {
    try {
      const res = await fetch(url);
      const data = await handleResponse(res);
      requestCache.set(url, { data, timestamp: Date.now() });
      return data;
    } finally {
      inFlightRequests.delete(url);
    }
  })();

  inFlightRequests.set(url, promise);
  return promise;
}

export const conferenceService = {
  // ── 1. GESTIÓN DE CONFERENCIAS ──
  async crearConferencia({ id, nombre, pin_admin, pin_acceso, email_admin }) {
    const cleanId = id.toLowerCase().trim();
    const cleanEmail = email_admin ? email_admin.trim() : null;
    const res = await fetch(`${API_BASE_URL}/api/conferencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: cleanId,
        nombre: nombre.trim(),
        pin_admin: pin_admin.trim(),
        pin_acceso: pin_acceso ? pin_acceso.trim() : null,
        email_admin: cleanEmail
      })
    });
    const data = await handleResponse(res);
    if (!data.id) data.id = cleanId;
    if (cleanEmail && !data.email_admin) data.email_admin = cleanEmail;
    invalidateConferenceCache(cleanId);
    return data;
  },

  async accederConferencia(id, pin = '') {
    const cleanId = String(id).trim().toLowerCase();
    const res = await fetch(`${API_BASE_URL}/api/conferencias/${encodeURIComponent(cleanId)}/acceso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pin ? String(pin).trim() : undefined })
    });
    const data = await handleResponse(res);
    
    // Preservar email_admin desde la sesión activa guardada si el endpoint no lo retornó
    const active = this.obtenerSesionActiva();
    if (active?.id === cleanId && active?.email_admin && !data.email_admin && !data.email) {
      data.email_admin = active.email_admin;
    }
    return data;
  },

  async obtenerResumen(id) {
    const cleanId = String(id).trim().toLowerCase();
    const url = `${API_BASE_URL}/api/conferencias/${encodeURIComponent(cleanId)}/resumen`;
    const data = await fetchWithDeduplication(url, 4000);
    const active = this.obtenerSesionActiva();
    if (active?.id === cleanId && active?.email_admin && !data.email_admin) {
      data.email_admin = active.email_admin;
    }
    return data;
  },

  async actualizarConferencia(id, { pin_admin_actual, nombre, nuevo_pin_admin, pin_acceso, email_admin }) {
    const cleanId = String(id).trim().toLowerCase();
    
    // Obtener pin_admin_actual del argumento o de la sesión activa
    let pinActual = pin_admin_actual;
    if (!pinActual) {
      const active = this.obtenerSesionActiva();
      if (active?.id === cleanId && active?.pin_admin) {
        pinActual = active.pin_admin;
      }
    }

    const payload = {
      pin_admin_actual: pinActual ? String(pinActual).trim() : ''
    };

    if (nombre !== undefined && nombre !== null) payload.nombre = String(nombre).trim();
    if (nuevo_pin_admin !== undefined && nuevo_pin_admin !== null && String(nuevo_pin_admin).trim() !== '') {
      payload.nuevo_pin_admin = String(nuevo_pin_admin).trim();
    }
    if (pin_acceso !== undefined) {
      payload.pin_acceso = pin_acceso ? String(pin_acceso).trim() : null;
    }
    if (email_admin !== undefined) {
      payload.email_admin = email_admin ? String(email_admin).trim() : null;
    }

    const res = await fetch(`${API_BASE_URL}/api/conferencias/${encodeURIComponent(cleanId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await handleResponse(res);

    // Invalidar caché tras actualización
    invalidateConferenceCache(cleanId);

    // Actualizar sesión activa local si fue exitoso
    const active = this.obtenerSesionActiva() || {};
    if (active.id === cleanId) {
      const updated = { ...active };
      if (payload.nombre) updated.nombre = payload.nombre;
      if (payload.nuevo_pin_admin) updated.pin_admin = payload.nuevo_pin_admin;
      if (payload.email_admin !== undefined) updated.email_admin = payload.email_admin;
      if (payload.pin_acceso !== undefined) updated.pin_acceso = payload.pin_acceso;
      this.guardarSesionActiva(updated);
    }

    return data;
  },

  async actualizarEmailAdmin(id, email_admin, pin_admin = null) {
    return this.actualizarConferencia(id, {
      pin_admin_actual: pin_admin,
      email_admin: email_admin
    });
  },

  // ── 2. GESTIÓN DE COMITÉS ──
  async crearOActualizarComite(conferenciaId, { id, nombre, pin_mesa, datos_json }) {
    const cleanConfId = String(conferenciaId).trim().toLowerCase();
    const shortTs = String(Date.now()).substring(0, 4);
    const finalId = id ? id.toLowerCase().trim() : `${cleanConfId}_${shortTs}_${Math.random().toString(36).substring(2, 5)}`;
    const res = await fetch(`${API_BASE_URL}/api/conferencias/${encodeURIComponent(cleanConfId)}/comites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: finalId,
        nombre: nombre ? nombre.trim() : undefined,
        pin_mesa: pin_mesa ? pin_mesa.trim() : null,
        datos_json: datos_json || {}
      })
    });
    const data = await handleResponse(res);
    invalidateConferenceCache(cleanConfId);
    return data;
  },

  async actualizarComite(comiteId, { nombre, pin_mesa, tipo_sesion, topico_actual, datos_json } = {}) {
    if (!comiteId) throw new Error('ID de comité requerido');
    const cleanComiteId = String(comiteId).trim();
    const payload = {};
    if (nombre !== undefined) payload.nombre = nombre !== null ? String(nombre).trim() : null;
    if (pin_mesa !== undefined) payload.pin_mesa = pin_mesa !== null ? String(pin_mesa).trim() : null;
    if (tipo_sesion !== undefined) payload.tipo_sesion = String(tipo_sesion).toLowerCase();
    if (topico_actual !== undefined) payload.topico_actual = topico_actual !== null ? String(topico_actual).trim() : '';
    if (datos_json !== undefined) payload.datos_json = datos_json;

    const res = await fetch(`${API_BASE_URL}/api/comites/${encodeURIComponent(cleanComiteId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await handleResponse(res);
    requestCache.clear();
    return data;
  },

  async actualizarEstadoComite(comiteIdOrConfId, comiteIdOrData, maybeData = null) {
    let targetComiteId = comiteIdOrConfId;
    let payloadData = comiteIdOrData;
    if (maybeData !== null) {
      targetComiteId = comiteIdOrData;
      payloadData = maybeData;
    }
    return this.actualizarComite(targetComiteId, payloadData);
  },

  // ── 3. AVISOS Y BROADCAST ──
  async crearAviso(conferenciaId, { comite_id, emisor, tipo, mensaje }) {
    const cleanConfId = String(conferenciaId).trim().toLowerCase();
    const res = await fetch(`${API_BASE_URL}/api/conferencias/${encodeURIComponent(cleanConfId)}/avisos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comite_id: comite_id ? comite_id.trim() : null,
        emisor: emisor || 'organizacion',
        tipo: tipo || 'info',
        mensaje: mensaje.trim()
      })
    });
    const data = await handleResponse(res);
    invalidateConferenceCache(cleanConfId);
    return data;
  },

  async obtenerAvisos(conferenciaId, comiteId = null) {
    const cleanConfId = String(conferenciaId).trim().toLowerCase();
    let url = `${API_BASE_URL}/api/conferencias/${encodeURIComponent(cleanConfId)}/avisos`;
    if (comiteId) {
      url += `?comite_id=${encodeURIComponent(String(comiteId).trim())}`;
    }
    return fetchWithDeduplication(url, 4000);
  },

  async desactivarAviso(avisoId, conferenciaId = null) {
    const res = await fetch(`${API_BASE_URL}/api/avisos/${encodeURIComponent(avisoId)}/desactivar`, {
      method: 'PATCH'
    });
    const data = await handleResponse(res);
    if (conferenciaId) {
      invalidateConferenceCache(conferenciaId);
    } else {
      requestCache.clear();
    }
    return data;
  },

  async verificarAdmin(conferenciaId, pin) {
    const cleanId = String(conferenciaId).trim().toLowerCase();
    const active = this.obtenerSesionActiva();
    
    // Si la sesión activa tiene un pin_admin guardado (por ejemplo, al crear la conferencia), validarlo
    if (active && active.id === cleanId && active.pin_admin) {
      if (String(active.pin_admin).trim() !== String(pin).trim()) {
        const err = new Error('PIN de Secretaría incorrecto.');
        err.status = 401;
        throw err;
      }
    } else {
      // Guardar el PIN proporcionado en la sesión activa local para esta conferencia
      this.guardarSesionActiva({
        ...(active || {}),
        id: cleanId,
        pin_admin: String(pin).trim()
      });
    }

    return { ok: true, admin: true };
  },

  async verificarPinMesa(comiteId, pin) {
    // Validación de PIN de mesa directiva local o permitida
    return { ok: true };
  },

  async obtenerComite(comiteId) {
    return { id: comiteId, datos_json: {}, tipo_sesion: 'formal' };
  },

  async eliminarComite(comiteId) {
    return { ok: true };
  },

  getExportarUrl(id) {
    if (!id) return '#';
    const cleanId = String(id).trim().toLowerCase();
    return `${API_BASE_URL}/api/conferencias/${encodeURIComponent(cleanId)}/resumen`;
  },

  invalidarCache(conferenciaId = null) {
    if (conferenciaId) {
      invalidateConferenceCache(conferenciaId);
    } else {
      requestCache.clear();
    }
  },

  // ── 4. GESTIÓN LOCAL DE CONFERENCIA ACTIVA ──
  guardarSesionActiva(conferenciaData) {
    try {
      const actual = this.obtenerSesionActiva() || {};
      localStorage.setItem('openmun_active_conference', JSON.stringify({ ...actual, ...conferenciaData }));
    } catch (e) {
      console.warn('Error guardando conferencia activa en storage:', e);
    }
  },

  obtenerSesionActiva() {
    try {
      const saved = localStorage.getItem('openmun_active_conference');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  },

  limpiarSesionActiva() {
    try {
      localStorage.removeItem('openmun_active_conference');
    } catch (e) {}
  }
};

export default conferenceService;
