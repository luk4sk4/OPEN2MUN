const { performance } = require('perf_hooks');

// Generate Mock Data
const numPaises = 200;
const numMociones = 5000;
const numEnmiendas = 5000;
const numIntervenciones = 10000;
const numRegistroIntervenciones = 20000;

const paises = Array.from({ length: numPaises }, (_, i) => ({
  id: i,
  nombre: `Pais ${i}`
}));

const estadosAprobados = ['Aprobada', 'Aprobado', 'Aceptada', 'Aceptado'];
const randomEstado = () => Math.random() > 0.5 ? estadosAprobados[Math.floor(Math.random() * estadosAprobados.length)] : 'Rechazada';

const mocionesFiltradas = Array.from({ length: numMociones }, () => ({
  proponente: `Pais ${Math.floor(Math.random() * numPaises)}  `, // Adding spaces to test trim
  estado: randomEstado()
}));

const enmiendasFiltradas = Array.from({ length: numEnmiendas }, () => ({
  proponente: Math.random() > 0.5 ? `Pais ${Math.floor(Math.random() * numPaises)}` : null,
  paisProponente: Math.random() > 0.5 ? `Pais ${Math.floor(Math.random() * numPaises)}` : null,
  estado: randomEstado()
}));

const intervencionesFiltradas = Array.from({ length: numIntervenciones }, () => ({
  pais: `Pais ${Math.floor(Math.random() * numPaises)}`,
  tiempoHabladoExacto: Math.floor(Math.random() * 100)
}));

const registroIntervenciones = Array.from({ length: numRegistroIntervenciones }, () => ({
  orador: `Pais ${Math.floor(Math.random() * numPaises)}`,
  tiempoHablado: Math.floor(Math.random() * 100)
}));

const tiempoExtra = {};
const preguntasExtras = {};
const diaSeleccionado = 'TODOS';
const getAdjustmentKey = (paisId) => `${diaSeleccionado}_${paisId}`;

// Baseline (Current Implementation)
function calculateBaseline() {
  return paises.map(p => {
    const nombreNorm = p.nombre.toLowerCase().trim();

    const mocPresentadas = mocionesFiltradas.filter(m => m.proponente?.toLowerCase().trim() === nombreNorm).length;
    const mocAprobadas = mocionesFiltradas.filter(m =>
      m.proponente?.toLowerCase().trim() === nombreNorm &&
      (m.estado === 'Aprobada' || m.estado === 'Aprobado')
    ).length;

    const enmPresentadas = enmiendasFiltradas.filter(e =>
      (e.paisProponente || e.proponente || '').toLowerCase().trim() === nombreNorm
    ).length;
    const enmAprobadas = enmiendasFiltradas.filter(e => {
      const pProp = (e.paisProponente || e.proponente || '').toLowerCase().trim();
      const st = (e.estado || '').toLowerCase().trim();
      return pProp === nombreNorm && (st === 'aceptada' || st === 'aceptado' || st === 'aprobada' || st === 'aprobado');
    }).length;

    const intervencionesPais = intervencionesFiltradas.filter(i => {
      const pNombre = (i.pais || i.orador || '').toLowerCase().trim();
      return pNombre === nombreNorm;
    });

    const segBase = intervencionesPais.reduce((acc, curr) => acc + (curr.tiempoHabladoExacto || curr.tiempoHablado || 0), 0);
    const segAjuste = tiempoExtra[getAdjustmentKey(p.id)] || 0;
    const segHablados = Math.max(0, segBase + segAjuste);

    const todasIntervencionesPais = registroIntervenciones.filter(i => {
      const pNombre = (i.pais || i.orador || '').toLowerCase().trim();
      return pNombre === nombreNorm;
    });
    const segGlobalBase = todasIntervencionesPais.reduce((acc, curr) => acc + (curr.tiempoHabladoExacto || curr.tiempoHablado || 0), 0);
    const segGlobalHablados = Math.max(0, segGlobalBase + (tiempoExtra[`TODOS_${p.id}`] || 0));

    const preguntasBase = intervencionesPais.length;
    const preguntasManuales = preguntasExtras[getAdjustmentKey(p.id)] || 0;
    const totalPreguntas = preguntasBase + preguntasManuales;

    const minutosExactos = (segHablados / 60).toFixed(1);

    return {
      ...p,
      mocPresentadas,
      mocAprobadas,
      enmPresentadas,
      enmAprobadas,
      segHablados,
      segGlobalHablados,
      minutosExactos,
      totalPreguntas,
      intervencionesCount: intervencionesPais.length
    };
  });
}

// Optimized Implementation
function calculateOptimized() {
    const mocionesMap = new Map();
    for (const m of mocionesFiltradas) {
      if (!m.proponente) continue;
      const prop = m.proponente.toLowerCase().trim();
      if (!mocionesMap.has(prop)) mocionesMap.set(prop, { presentadas: 0, aprobadas: 0 });
      const stats = mocionesMap.get(prop);
      stats.presentadas++;
      if (m.estado === 'Aprobada' || m.estado === 'Aprobado') {
        stats.aprobadas++;
      }
    }

    const enmiendasMap = new Map();
    for (const e of enmiendasFiltradas) {
      const propRaw = e.paisProponente || e.proponente || '';
      if (!propRaw) continue;
      const prop = propRaw.toLowerCase().trim();
      if (!enmiendasMap.has(prop)) enmiendasMap.set(prop, { presentadas: 0, aprobadas: 0 });
      const stats = enmiendasMap.get(prop);
      stats.presentadas++;
      const st = (e.estado || '').toLowerCase().trim();
      if (st === 'aceptada' || st === 'aceptado' || st === 'aprobada' || st === 'aprobado') {
        stats.aprobadas++;
      }
    }

    const intervencionesMap = new Map();
    for (const i of intervencionesFiltradas) {
      const pNombreRaw = i.pais || i.orador || '';
      if (!pNombreRaw) continue;
      const pNombre = pNombreRaw.toLowerCase().trim();
      if (!intervencionesMap.has(pNombre)) intervencionesMap.set(pNombre, { count: 0, segBase: 0 });
      const stats = intervencionesMap.get(pNombre);
      stats.count++;
      stats.segBase += (i.tiempoHabladoExacto || i.tiempoHablado || 0);
    }

    const globalIntervencionesMap = new Map();
    for (const i of registroIntervenciones) {
      const pNombreRaw = i.pais || i.orador || '';
      if (!pNombreRaw) continue;
      const pNombre = pNombreRaw.toLowerCase().trim();
      if (!globalIntervencionesMap.has(pNombre)) globalIntervencionesMap.set(pNombre, { segGlobalBase: 0 });
      const stats = globalIntervencionesMap.get(pNombre);
      stats.segGlobalBase += (i.tiempoHabladoExacto || i.tiempoHablado || 0);
    }

    return paises.map(p => {
      const nombreNorm = p.nombre.toLowerCase().trim();

      const mocStats = mocionesMap.get(nombreNorm) || { presentadas: 0, aprobadas: 0 };
      const mocPresentadas = mocStats.presentadas;
      const mocAprobadas = mocStats.aprobadas;

      const enmStats = enmiendasMap.get(nombreNorm) || { presentadas: 0, aprobadas: 0 };
      const enmPresentadas = enmStats.presentadas;
      const enmAprobadas = enmStats.aprobadas;

      const intStats = intervencionesMap.get(nombreNorm) || { count: 0, segBase: 0 };
      const segBase = intStats.segBase;
      const intervencionesCount = intStats.count;

      const segAjuste = tiempoExtra[getAdjustmentKey(p.id)] || 0;
      const segHablados = Math.max(0, segBase + segAjuste);

      const globalIntStats = globalIntervencionesMap.get(nombreNorm) || { segGlobalBase: 0 };
      const segGlobalBase = globalIntStats.segGlobalBase;
      const segGlobalHablados = Math.max(0, segGlobalBase + (tiempoExtra[`TODOS_${p.id}`] || 0));

      const preguntasBase = intervencionesCount;
      const preguntasManuales = preguntasExtras[getAdjustmentKey(p.id)] || 0;
      const totalPreguntas = preguntasBase + preguntasManuales;

      const minutosExactos = (segHablados / 60).toFixed(1);

      return {
        ...p,
        mocPresentadas,
        mocAprobadas,
        enmPresentadas,
        enmAprobadas,
        segHablados,
        segGlobalHablados,
        minutosExactos,
        totalPreguntas,
        intervencionesCount
      };
    });
}

// Run baseline
const baselineStart = performance.now();
for (let i = 0; i < 10; i++) calculateBaseline();
const baselineEnd = performance.now();
const baselineAvg = (baselineEnd - baselineStart) / 10;
console.log(`Baseline Avg: ${baselineAvg.toFixed(2)} ms`);

// Run optimized
const optStart = performance.now();
for (let i = 0; i < 10; i++) calculateOptimized();
const optEnd = performance.now();
const optAvg = (optEnd - optStart) / 10;
console.log(`Optimized Avg: ${optAvg.toFixed(2)} ms`);

console.log(`Speedup: ${(baselineAvg / optAvg).toFixed(2)}x`);
