/**
 * sessionValidator.js
 * Validador robusto de archivos de sesión JSON para OpenMUN.
 * Comprueba sintaxis, estructura requerida y tipos de datos antes de importar
 * para prevenir errores de ejecución y roturas de estado.
 */

export function validateSessionJSON(rawInput) {
  let parsed = null;

  // 1. Validar sintaxis JSON si viene como texto
  if (typeof rawInput === 'string') {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return {
        valid: false,
        errorType: 'EMPTY_CONTENT',
        message: 'El archivo está vacío.'
      };
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch (syntaxErr) {
      return {
        valid: false,
        errorType: 'SYNTAX_ERROR',
        message: `Error de sintaxis JSON: ${syntaxErr.message}`
      };
    }
  } else if (rawInput && typeof rawInput === 'object') {
    parsed = rawInput;
  } else {
    return {
      valid: false,
      errorType: 'INVALID_TYPE',
      message: 'El contenido no es un objeto JSON válido.'
    };
  }

  // 2. Comprobar que sea un objeto plano (no null ni array de primer nivel)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      valid: false,
      errorType: 'NOT_AN_OBJECT',
      message: 'El archivo debe ser un objeto JSON con los datos de la sesión.'
    };
  }

  // 3. Descartar explícitamente formatos ajenos conocidos (ComfyUI workflows, etc.)
  if (
    parsed.last_node_id !== undefined ||
    parsed.last_link_id !== undefined ||
    (Array.isArray(parsed.nodes) && parsed.nodes.some(n => n && (n.widgets_values !== undefined || n.pos !== undefined)))
  ) {
    return {
      valid: false,
      errorType: 'NOT_OPENMUN_SESSION',
      message: 'El archivo corresponde a un formato no compatible (flujo de ComfyUI) y no a una sesión de OpenMUN.'
    };
  }

  // 4. Comprobar si tiene claves representativas de openMUN
  const snapshot = parsed.localStorageSnapshot && typeof parsed.localStorageSnapshot === 'object'
    ? parsed.localStorageSnapshot
    : {};

  const hasExplicitBackupTag = parsed.tipo === 'openmun_full_backup' || parsed.tipo === 'openmun_session';
  const hasSnapshotKey = Object.keys(snapshot).some(k => k.startsWith('openmun_'));
  const hasPrefixedKey = Object.keys(parsed).some(k => k.startsWith('openmun_'));

  const directSessionKeys = [
    'paises',
    'oradoresCola',
    'oradoresGSL',
    'oradoresCaucus',
    'registroIntervenciones',
    'intervenciones',
    'mociones',
    'historicoMociones',
    'caucusActivo',
    'votacionSesion',
    'agendaSesion',
    'alertasCrisis',
    'eventosCrisis',
    'crisisEventos',
    'relojCrisis',
    'relojSimulacion'
  ];

  const hasDirectSessionKey = directSessionKeys.some(k => k in parsed);

  // Validar si 'config' o 'openmun_config' es una configuración real de OpenMUN
  const rawConfig = parsed.config || parsed.openmun_config || snapshot.openmun_config;
  let hasValidOpenMunConfig = false;
  if (rawConfig) {
    try {
      const cfgObj = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
      if (cfgObj && typeof cfgObj === 'object' && !Array.isArray(cfgObj)) {
        if (cfgObj.layouts && typeof cfgObj.layouts === 'object' && !Array.isArray(cfgObj.layouts)) {
          hasValidOpenMunConfig = true;
        } else if (cfgObj.theme && typeof cfgObj.theme === 'object' && (cfgObj.theme.backgroundColor || cfgObj.theme.primaryColor)) {
          hasValidOpenMunConfig = true;
        } else if (cfgObj.accessibility && typeof cfgObj.accessibility === 'object' && (cfgObj.accessibility.themeMode !== undefined || cfgObj.accessibility.dyslexiaMode !== undefined)) {
          hasValidOpenMunConfig = true;
        }
      }
    } catch {
      hasValidOpenMunConfig = false;
    }
  }

  const hasComiteKey = typeof parsed.nombreComite === 'string' || typeof parsed.comision === 'string';

  const isRecognizedSession = hasExplicitBackupTag || hasSnapshotKey || hasDirectSessionKey || hasPrefixedKey || (hasComiteKey && hasValidOpenMunConfig) || hasValidOpenMunConfig;

  if (!isRecognizedSession) {
    return {
      valid: false,
      errorType: 'NOT_OPENMUN_SESSION',
      message: 'El archivo no contiene una estructura reconocida de sesión de OpenMUN.'
    };
  }

  // 5. Validar y sanear estructuras internas para evitar crashes
  const sanitized = { ...parsed };

  // Países
  const rawPaises = sanitized.paises || snapshot.openmun_paises;
  if (rawPaises !== undefined) {
    if (!Array.isArray(rawPaises)) {
      return {
        valid: false,
        errorType: 'CORRUPT_PAISES',
        message: 'El listado de países (paises) debe ser una lista/array.'
      };
    }
    // Asegurar que cada país tenga al menos un identificador y nombre válidos
    sanitized.paises = rawPaises.filter(p => p && typeof p === 'object').map((p, idx) => ({
      id: p.id || `pais_${Date.now()}_${idx}`,
      nombre: typeof p.nombre === 'string' ? p.nombre : (p.name || `Delegación ${idx + 1}`),
      estatus: typeof p.estatus === 'string' ? p.estatus : 'Presente',
      bandera: typeof p.bandera === 'string' ? p.bandera : (p.flag || '🌐'),
      tieneVeto: Boolean(p.tieneVeto || p.veto),
      ...p
    }));
  }

  // Oradores
  const rawOradores = sanitized.oradoresCola || sanitized.oradoresGSL || snapshot.openmun_oradores;
  if (rawOradores !== undefined && !Array.isArray(rawOradores)) {
    return {
      valid: false,
      errorType: 'CORRUPT_ORADORES',
      message: 'La lista de oradores (oradoresCola) debe ser una lista/array.'
    };
  }

  // Caucus Oradores
  const rawCaucusOradores = sanitized.oradoresCaucus || snapshot.openmun_oradores_caucus;
  if (rawCaucusOradores !== undefined && !Array.isArray(rawCaucusOradores)) {
    return {
      valid: false,
      errorType: 'CORRUPT_CAUCUS_ORADORES',
      message: 'La lista de oradores del caucus debe ser una lista/array.'
    };
  }

  // Caucus Activo
  const rawCaucus = sanitized.caucusActivo || snapshot.openmun_caucus;
  if (rawCaucus !== undefined && (typeof rawCaucus !== 'object' || rawCaucus === null || Array.isArray(rawCaucus))) {
    return {
      valid: false,
      errorType: 'CORRUPT_CAUCUS',
      message: 'La configuración de caucus activo debe ser un objeto.'
    };
  }

  // Votación
  const rawVotacion = sanitized.votacionSesion || snapshot.openmun_votacion;
  if (rawVotacion !== undefined && (typeof rawVotacion !== 'object' || rawVotacion === null || Array.isArray(rawVotacion))) {
    return {
      valid: false,
      errorType: 'CORRUPT_VOTACION',
      message: 'El estado de votación debe ser un objeto válido.'
    };
  }

  // Configuración de Layouts / Widgets
  if (rawConfig !== undefined) {
    try {
      const parsedConfig = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
      if (parsedConfig && typeof parsedConfig === 'object' && !Array.isArray(parsedConfig)) {
        // Asegurar que layouts sea un objeto válido si existe
        if (parsedConfig.layouts && (typeof parsedConfig.layouts !== 'object' || Array.isArray(parsedConfig.layouts))) {
          return {
            valid: false,
            errorType: 'CORRUPT_CONFIG_LAYOUTS',
            message: 'La configuración de layouts de la sesión está dañada.'
          };
        }
        if (parsedConfig.layouts || parsedConfig.theme || parsedConfig.accessibility) {
          sanitized.config = parsedConfig;
        } else {
          delete sanitized.config;
        }
      } else {
        delete sanitized.config;
      }
    } catch {
      return {
        valid: false,
        errorType: 'CORRUPT_CONFIG',
        message: 'La configuración de interfaz (config) no pudo ser leída.'
      };
    }
  }

  return {
    valid: true,
    data: sanitized
  };
}
