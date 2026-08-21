import React from 'react';

/**
 * Parsea el texto del mensaje buscando patrones de destinatario al inicio como `[Para X]`, `[Para Todo Staff]`, etc.
 * Retorna un componente con el tag estilizado como badge y el resto del texto formateado.
 *
 * @param {string} mensaje - El texto del mensaje recibido
 * @param {object} customStyle - Estilos adicionales para el contenedor
 */
export const formatearMensajeAviso = (mensaje) => {
  if (!mensaje || typeof mensaje !== 'string') return mensaje;

  // Coincide con [Para ...] o [PARA ...] al inicio del mensaje
  const match = mensaje.match(/^(\[(?:Para|PARA|para)\s+([^\]]+)\])\s*(.*)/s);

  if (!match) {
    return <span>{mensaje}</span>;
  }

  const [_, fullTag, targetName, contenidoRestante] = match;
  const targetClean = targetName.trim();
  const targetLower = targetClean.toLowerCase();

  // Colores temáticos dinámicos según el tipo de destinatario
  let badgeBg = 'rgba(59, 130, 246, 0.15)';
  let badgeColor = '#3b82f6';
  let badgeBorder = 'rgba(59, 130, 246, 0.35)';

  if (targetLower.includes('urgente') || targetLower.includes('alerta') || targetLower.includes('seguridad')) {
    badgeBg = 'rgba(239, 68, 68, 0.15)';
    badgeColor = '#ef4444';
    badgeBorder = 'rgba(239, 68, 68, 0.35)';
  } else if (targetLower.includes('staff') || targetLower.includes('logistica') || targetLower.includes('logística')) {
    badgeBg = 'rgba(245, 158, 11, 0.15)';
    badgeColor = '#f59e0b';
    badgeBorder = 'rgba(245, 158, 11, 0.35)';
  } else if (targetLower.includes('secretar') || targetLower.includes('organizac') || targetLower.includes('presidencia')) {
    badgeBg = 'rgba(139, 92, 246, 0.15)';
    badgeColor = '#a855f7';
    badgeBorder = 'rgba(139, 92, 246, 0.35)';
  }

  return (
    <div style={{ display: 'inline', wordBreak: 'break-word' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.74rem',
          fontWeight: '800',
          padding: '0.12rem 0.5rem',
          borderRadius: '6px',
          backgroundColor: badgeBg,
          color: badgeColor,
          border: `1px solid ${badgeBorder}`,
          marginRight: '0.45rem',
          letterSpacing: '0.02em',
          verticalAlign: 'baseline',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}
      >
        <span style={{ opacity: 0.75, fontWeight: '600' }}>Para:</span>
        <span>{targetClean}</span>
      </span>
      <span>{contenidoRestante}</span>
    </div>
  );
};

/**
 * Filtra si un aviso de Base de Datos le corresponde a la entidad/rol actual.
 *
 * @param {object} aviso - Objeto de aviso desde la base de datos
 * @param {object} context - Contexto del visor { role: 'secretaria'|'staff'|'chair'|'delegate', currentComiteId: string }
 * @returns {boolean}
 */
export const correspondeAviso = (aviso, { role = 'staff', currentComiteId = null } = {}) => {
  if (!aviso) return false;

  // La Secretaría General / Organización siempre ve TODO
  if (role === 'secretaria' || role === 'organizacion' || role === 'admin') {
    return true;
  }

  const comiteId = aviso.comite_id ? String(aviso.comite_id).trim() : '';

  // 1. Mensajes Globales (sin comite_id o 'GLOBAL') -> Llegan a todos
  if (!comiteId || comiteId === 'GLOBAL') {
    return true;
  }

  // 2. Si el rol es STAFF
  if (role === 'staff') {
    // STAFF_ALL le llega a todos los staffs
    if (comiteId === 'STAFF_ALL') return true;
    
    // Si está dirigido específicamente al staff de este comité
    if (currentComiteId && (comiteId === `STAFF_COMITE_${currentComiteId}` || comiteId === `STAFF_${currentComiteId}`)) {
      return true;
    }

    // Si es un aviso dirigido a la mesa de este comité y el staff está en esa sala
    if (currentComiteId && comiteId === currentComiteId) {
      return true;
    }

    return false;
  }

  // 3. Si el rol es CHAIR / MESA DIRECTIVA
  if (role === 'chair' || role === 'mesa') {
    if (currentComiteId && comiteId === currentComiteId) return true;
    return false;
  }

  // 4. Si el rol es DELEGATE
  if (role === 'delegate') {
    if (currentComiteId && comiteId === currentComiteId) return true;
    return false;
  }

  return true;
};
