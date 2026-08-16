// ─────────────────────────────────────────────────────────────────────────────
// Utilidades de Banderas e Imágenes de Delegaciones para openMUN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convierte un emoji de bandera Unicode (ej: '🇪🇸') a su código ISO de 2 letras ('es').
 */
export function emojiToIso(emoji) {
  if (!emoji || typeof emoji !== 'string') return null;
  const trimmed = emoji.trim();
  
  // Casos especiales frecuentes
  if (trimmed === '🇺🇳') return 'un';
  if (trimmed === '🇪🇺') return 'eu';
  
  const codePoints = Array.from(trimmed).map(char => char.codePointAt(0));
  if (codePoints.length >= 2) {
    const [c1, c2] = codePoints;
    // Regional Indicator Symbols están en el rango 0x1F1E6 ('A') a 0x1F1FF ('Z')
    if (c1 >= 0x1F1E6 && c1 <= 0x1F1FF && c2 >= 0x1F1E6 && c2 <= 0x1F1FF) {
      const l1 = String.fromCharCode(c1 - 0x1F1E6 + 65);
      const l2 = String.fromCharCode(c2 - 0x1F1E6 + 65);
      return `${l1}${l2}`.toLowerCase();
    }
  }
  return null;
}

/**
 * Diccionario normalizado de nombres comunes a códigos ISO 3166-1 alpha-2
 */
export const DICCIONARIO_PAISES_ISO = {
  // P5 y Organizaciones
  'estados unidos': 'us', 'eeuu': 'us', 'usa': 'us', 'united states': 'us', 'ee.uu.': 'us',
  'reino unido': 'gb', 'uk': 'gb', 'united kingdom': 'gb', 'gran bretaña': 'gb', 'gran bretana': 'gb', 'inglaterra': 'gb',
  'francia': 'fr', 'france': 'fr',
  'rusia': 'ru', 'federacion rusa': 'ru', 'federación rusa': 'ru', 'russia': 'ru',
  'china': 'cn', 'republica popular china': 'cn', 'república popular china': 'cn',
  'onu': 'un', 'naciones unidas': 'un', 'united nations': 'un', 'un': 'un',
  'union europea': 'eu', 'unión europea': 'eu', 'european union': 'eu', 'ue': 'eu', 'eu': 'eu',

  // Iberoamérica
  'espana': 'es', 'españa': 'es', 'spain': 'es',
  'mexico': 'mx', 'méxico': 'mx',
  'argentina': 'ar',
  'colombia': 'co',
  'chile': 'cl',
  'peru': 'pe', 'perú': 'pe',
  'brasil': 'br', 'brazil': 'br',
  'ecuador': 'ec',
  'venezuela': 've',
  'uruguay': 'uy',
  'paraguay': 'py',
  'bolivia': 'bo',
  'cuba': 'cu',
  'republica dominicana': 'do', 'república dominicana': 'do',
  'costa rica': 'cr',
  'panama': 'pa', 'panamá': 'pa',
  'guatemala': 'gt',
  'honduras': 'hn',
  'el salvador': 'sv',
  'nicaragua': 'ni',
  'puerto rico': 'pr',

  // Europa
  'alemania': 'de', 'germany': 'de',
  'italia': 'it', 'italy': 'it',
  'portugal': 'pt',
  'paises bajos': 'nl', 'países bajos': 'nl', 'holanda': 'nl', 'netherlands': 'nl',
  'belgica': 'be', 'bélgica': 'be', 'belgium': 'be',
  'suiza': 'ch', 'switzerland': 'ch',
  'austria': 'at',
  'suecia': 'se', 'sweden': 'se',
  'noruega': 'no', 'norway': 'no',
  'dinamarca': 'dk', 'denmark': 'dk',
  'finlandia': 'fi', 'finland': 'fi',
  'grecia': 'gr', 'greece': 'gr',
  'polonia': 'pl', 'poland': 'pl',
  'irlanda': 'ie', 'ireland': 'ie',
  'ucrania': 'ua', 'ukraine': 'ua',
  'rumania': 'ro', 'romania': 'ro',
  'turquia': 'tr', 'turquía': 'tr', 'turkey': 'tr', 'turkiye': 'tr',
  'republica checa': 'cz', 'república checa': 'cz', 'chequia': 'cz', 'czechia': 'cz',
  'hungria': 'hu', 'hungría': 'hu', 'hungary': 'hu',
  'croacia': 'hr', 'croatia': 'hr',
  'serbia': 'rs',
  'vaticano': 'va', 'santa sede': 'va',

  // Asia y Medio Oriente
  'japon': 'jp', 'japón': 'jp', 'japan': 'jp',
  'corea del sur': 'kr', 'south korea': 'kr', 'corea': 'kr',
  'corea del norte': 'kp', 'north korea': 'kp',
  'india': 'in',
  'israel': 'il',
  'palestina': 'ps', 'palestine': 'ps',
  'iran': 'ir', 'irán': 'ir',
  'irak': 'iq', 'iraq': 'iq',
  'arabia saudita': 'sa', 'arabia saudi': 'sa', 'saudi arabia': 'sa',
  'emiratos arabes unidos': 'ae', 'emiratos árabes unidos': 'ae', 'eau': 'ae', 'uae': 'ae',
  'qatar': 'qa', 'catar': 'qa',
  'kuwait': 'kw',
  'siria': 'sy', 'syria': 'sy',
  'libano': 'lb', 'líbano': 'lb', 'lebanon': 'lb',
  'jordania': 'jo', 'jordan': 'jo',
  'indonesia': 'id',
  'pakistan': 'pk', 'pakistán': 'pk',
  'filipinas': 'ph', 'philippines': 'ph',
  'vietnam': 'vn', 'viet nam': 'vn',
  'tailandia': 'th', 'thailand': 'th',
  'malasia': 'my', 'malaysia': 'my',
  'singapur': 'sg', 'singapore': 'sg',
  'australia': 'au',
  'nueva zelanda': 'nz', 'new zealand': 'nz',

  // África
  'sudafrica': 'za', 'sudáfrica': 'za', 'south africa': 'za',
  'egipto': 'eg', 'egypt': 'eg',
  'marruecos': 'ma', 'morocco': 'ma',
  'nigeria': 'ng',
  'kenia': 'ke', 'kenya': 'ke',
  'etiopia': 'et', 'etiopía': 'et', 'ethiopia': 'et',
  'ghana': 'gh',
  'argelia': 'dz', 'algeria': 'dz',
  'senegal': 'sn',
  'tunez': 'tn', 'túnez': 'tn', 'tunisia': 'tn',
  'angola': 'ao',
  'congo': 'cg', 'r d congo': 'cd', 'rd congo': 'cd'
};

/**
 * Normaliza cualquier entrada de bandera (emoji, ISO, nombre o URL).
 */
export function normalizarBandera(input, nombrePais = '') {
  if (!input && !nombrePais) return 'un';
  
  const raw = (input || '').trim();
  
  // 1. Si ya es una URL web o DataURL Base64
  if (raw.startsWith('data:image/') || raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('blob:')) {
    return raw;
  }

  // 2. Si es un emoji de bandera
  const isoFromEmoji = emojiToIso(raw);
  if (isoFromEmoji) return isoFromEmoji;

  // 3. Si es un código de 2 letras
  if (/^[a-zA-Z]{2}$/.test(raw)) {
    return raw.toLowerCase();
  }

  // 4. Búsqueda en diccionario por el valor recibido o por el nombre del país
  const cleanInput = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (DICCIONARIO_PAISES_ISO[cleanInput]) {
    return DICCIONARIO_PAISES_ISO[cleanInput];
  }

  if (nombrePais) {
    const cleanNombre = nombrePais.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (DICCIONARIO_PAISES_ISO[cleanNombre]) {
      return DICCIONARIO_PAISES_ISO[cleanNombre];
    }
  }

  return raw || 'un';
}

/**
 * Retorna la URL de la imagen de la bandera.
 */
export function getFlagImageUrl(bandera, nombrePais = '') {
  const norm = normalizarBandera(bandera, nombrePais);
  
  if (!norm) return null;

  // Si ya es una URL completa o Base64
  if (norm.startsWith('data:image/') || norm.startsWith('http://') || norm.startsWith('https://') || norm.startsWith('blob:')) {
    return norm;
  }

  // Si es un código ISO (ej: 'es', 'un', 'us')
  if (/^[a-z]{2}$/.test(norm)) {
    return `https://flagcdn.com/w80/${norm}.png`;
  }

  return null;
}

/**
 * Obtiene iniciales elegantes de una delegación (ej: "Estados Unidos" -> "EU", "Cruz Roja" -> "CR").
 */
export function obtenerIniciales(nombre = '') {
  const palabras = (nombre || '').trim().split(/\s+/).filter(p => !['de', 'del', 'la', 'las', 'el', 'los', 'y', 'and', 'the', 'of'].includes(p.toLowerCase()));
  if (palabras.length === 0) return 'UN';
  if (palabras.length === 1) return palabras[0].substring(0, 2).toUpperCase();
  return (palabras[0][0] + palabras[1][0]).toUpperCase();
}

/**
 * Genera un color armónico basado en el string para insignias sin bandera.
 */
export function generarColorAvatar(nombre = '') {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 45%)`;
}

/**
 * Procesa y comprime una imagen (File, Blob o Clipboard item) a un DataURL Base64 optimizado (máx 200x150 px).
 * Esto garantiza que la imagen se guarde de forma ultraligera en localStorage y P2P.
 */
export function procesarImagenBandera(fileOrBlob, maxWidth = 200, maxHeight = 150) {
  return new Promise((resolve, reject) => {
    if (!fileOrBlob) {
      return reject(new Error('No se proporcionó ningún archivo de imagen'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular ratio de reducción manteniendo proporción
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Suavizado de imagen de alta calidad
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Formato PNG o WebP según soporte
        const dataUrl = canvas.toDataURL('image/png', 0.88);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('No se pudo decodificar la imagen'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Convierte un código ISO (ej: 'es') a su correspondiente emoji de bandera (ej: '🇪🇸').
 */
export function isoToEmoji(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const clean = iso.trim().toLowerCase();
  if (clean === 'un') return '🇺🇳';
  if (clean === 'eu') return '🇪🇺';
  if (clean.length === 2 && /^[a-z]{2}$/.test(clean)) {
    const c1 = clean.toUpperCase().charCodeAt(0) - 65 + 0x1F1E6;
    const c2 = clean.toUpperCase().charCodeAt(1) - 65 + 0x1F1E6;
    return String.fromCodePoint(c1, c2);
  }
  return null;
}

/**
 * Obtiene el emoji visual de la bandera o un fallback adecuado para selects y textos planos.
 */
export function getFlagEmoji(bandera, nombrePais = '') {
  if (!bandera && !nombrePais) return '🇺🇳';
  const str = (bandera || '').trim();
  const codePoints = Array.from(str).map(c => c.codePointAt(0));
  if (codePoints.length >= 2 && codePoints[0] >= 0x1F1E6 && codePoints[0] <= 0x1F1FF) {
    return str;
  }
  const iso = normalizarBandera(bandera, nombrePais);
  if (iso) {
    const emoji = isoToEmoji(iso);
    if (emoji) return emoji;
  }
  return '🌐';
}

