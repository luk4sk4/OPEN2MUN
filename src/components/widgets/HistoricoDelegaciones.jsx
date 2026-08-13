import React, { useState } from 'react';
import { Search, Trophy, Clock, FileText, CheckCircle, HelpCircle, ArrowUpDown } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const HistoricoDelegaciones = () => {
  const { paises, mociones, historicoMociones = [], registroIntervenciones } = useSession();

  const [busqueda, setBusqueda] = useState('');
  const [columnaOrden, setColumnaOrden] = useState('tiempoHablado'); // 'nombre' | 'mociones' | 'aprobadas' | 'tiempoHablado' | 'preguntas'
  const [ordenAsc, setOrdenAsc] = useState(false);

  // Contador manual de preguntas por país (idPais -> numero)
  const [preguntasExtras, setPreguntasExtras] = useState({});
  // Ajuste manual de tiempo en segundos por país (idPais -> segundos)
  const [tiempoExtra, setTiempoExtra] = useState({});

  const handleIncrementarPregunta = (paisId) => {
    setPreguntasExtras(prev => ({
      ...prev,
      [paisId]: (prev[paisId] || 0) + 1
    }));
  };

  const handleDecrementarPregunta = (paisId) => {
    setPreguntasExtras(prev => ({
      ...prev,
      [paisId]: Math.max(0, (prev[paisId] || 0) - 1)
    }));
  };

  const handleAjustarTiempo = (paisId, deltaSeg) => {
    setTiempoExtra(prev => ({
      ...prev,
      [paisId]: Math.max(-(100000), (prev[paisId] || 0) + deltaSeg)
    }));
  };

  // Formatear segundos a MM:SS o Xm Ys
  const formatTiempo = (totalSeg) => {
    if (!totalSeg || totalSeg <= 0) return '0m 00s';
    const mins = Math.floor(totalSeg / 60);
    const secs = totalSeg % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const listaMocionesFuente = (historicoMociones && historicoMociones.length > 0) ? historicoMociones : mociones;

  // Calcular métricas para cada país
  const datosPaises = paises.map(p => {
    const nombreNorm = p.nombre.toLowerCase().trim();

    // 1. Mociones Presentadas (en todo el histórico)
    const mocPresentadas = listaMocionesFuente.filter(m => m.proponente?.toLowerCase().trim() === nombreNorm).length;

    // 2. Mociones Aprobadas (en todo el histórico)
    const mocAprobadas = listaMocionesFuente.filter(m => 
      m.proponente?.toLowerCase().trim() === nombreNorm && 
      (m.estado === 'Aprobada' || m.estado === 'Aprobado')
    ).length;

    // 3. Tiempo Hablado (acumulado en segundos de registroIntervenciones + tiempoExtra manual)
    const intervenciones = registroIntervenciones.filter(i => {
      const pNombre = (i.pais || i.orador || '').toLowerCase().trim();
      return pNombre === nombreNorm;
    });

    const segBase = intervenciones.reduce((acc, curr) => acc + (curr.tiempoHabladoExacto || curr.tiempoHablado || 0), 0);
    const segAjuste = tiempoExtra[p.id] || 0;
    const segHablados = Math.max(0, segBase + segAjuste);

    // 4. Preguntas Realizadas (intervenciones registradas + extras manuales)
    const preguntasBase = intervenciones.length;
    const preguntasManuales = preguntasExtras[p.id] || 0;
    const totalPreguntas = preguntasBase + preguntasManuales;

    return {
      ...p,
      mocPresentadas,
      mocAprobadas,
      segHablados,
      totalPreguntas,
      preguntasManuales
    };
  });

  // Filtrar por búsqueda
  const paisesFiltrados = datosPaises.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Ordenar
  const paisesOrdenados = [...paisesFiltrados].sort((a, b) => {
    let valA = a.nombre;
    let valB = b.nombre;

    if (columnaOrden === 'mociones') {
      valA = a.mocPresentadas;
      valB = b.mocPresentadas;
    } else if (columnaOrden === 'aprobadas') {
      valA = a.mocAprobadas;
      valB = b.mocAprobadas;
    } else if (columnaOrden === 'tiempoHablado') {
      valA = a.segHablados;
      valB = b.segHablados;
    } else if (columnaOrden === 'preguntas') {
      valA = a.totalPreguntas;
      valB = b.totalPreguntas;
    }

    if (valA < valB) return ordenAsc ? -1 : 1;
    if (valA > valB) return ordenAsc ? 1 : -1;
    return 0;
  });

  const cambiarOrden = (col) => {
    if (columnaOrden === col) {
      setOrdenAsc(!ordenAsc);
    } else {
      setColumnaOrden(col);
      setOrdenAsc(false);
    }
  };

  return (
    <div style={{
      padding: '1rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      backgroundColor: 'var(--panel-color)',
      color: 'var(--text-color)',
      fontFamily: 'var(--font-mono)',
      gap: '0.6rem'
    }}>
      {/* Header & Buscador */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Trophy size={16} color="#ff007f" />
          <span style={{ fontWeight: '700', fontSize: '0.9rem', letterSpacing: '0.04em' }}>
            HISTÓRICO DE DELEGACIONES
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(5, 5, 8, 0.95)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius)',
          padding: '0.25rem 0.5rem',
          gap: '0.3rem'
        }}>
          <Search size={12} style={{ opacity: 0.6 }} />
          <input
            type="text"
            placeholder="BUSCAR PAÍS..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-color)',
              outline: 'none',
              fontSize: '0.72rem',
              width: '110px',
              fontFamily: 'var(--font-mono)'
            }}
          />
        </div>
      </div>

      {/* Tabla del Histórico */}
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--card-header-bg)', borderBottom: '1px solid var(--border-color)' }}>
              <th onClick={() => cambiarOrden('nombre')} style={{ padding: '0.4rem 0.6rem', cursor: 'pointer', userSelect: 'none' }}>
                PAÍS <ArrowUpDown size={11} style={{ display: 'inline', opacity: 0.7 }} />
              </th>
              <th onClick={() => cambiarOrden('mociones')} style={{ padding: '0.4rem 0.6rem', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}>
                MOC. PRESENTADAS <ArrowUpDown size={11} style={{ display: 'inline', opacity: 0.7 }} />
              </th>
              <th onClick={() => cambiarOrden('aprobadas')} style={{ padding: '0.4rem 0.6rem', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}>
                MOC. APROBADAS <ArrowUpDown size={11} style={{ display: 'inline', opacity: 0.7 }} />
              </th>
              <th onClick={() => cambiarOrden('tiempoHablado')} style={{ padding: '0.4rem 0.6rem', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}>
                TIEMPO HABLADO <ArrowUpDown size={11} style={{ display: 'inline', opacity: 0.7 }} />
              </th>
              <th onClick={() => cambiarOrden('preguntas')} style={{ padding: '0.4rem 0.6rem', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}>
                PREGUNTAS / POIs <ArrowUpDown size={11} style={{ display: 'inline', opacity: 0.7 }} />
              </th>
            </tr>
          </thead>
          <tbody>
            {paisesOrdenados.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', opacity: 0.5 }}>
                  No hay delegaciones que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              paisesOrdenados.map((p, idx) => (
                <tr 
                  key={p.id} 
                  style={{
                    borderBottom: '1px solid var(--subborder-color)',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'
                  }}
                >
                  {/* País */}
                  <td style={{ padding: '0.45rem 0.6rem', fontWeight: '600' }}>
                    <span style={{ marginRight: '0.3rem' }}>{p.bandera}</span>
                    {p.nombre}
                  </td>

                  {/* Mociones Presentadas */}
                  <td style={{ padding: '0.45rem 0.6rem', textAlign: 'center', fontWeight: '700', color: p.mocPresentadas > 0 ? '#3b82f6' : 'inherit' }}>
                    {p.mocPresentadas}
                  </td>

                  {/* Mociones Aprobadas */}
                  <td style={{ padding: '0.45rem 0.6rem', textAlign: 'center', fontWeight: '700', color: p.mocAprobadas > 0 ? '#22c55e' : 'inherit' }}>
                    {p.mocAprobadas}
                  </td>

                  {/* Tiempo Hablado */}
                  <td style={{ padding: '0.45rem 0.6rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                      <button
                        onClick={() => handleAjustarTiempo(p.id, -60)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-color)',
                          padding: '1px 3px',
                          fontSize: '0.65rem',
                          borderRadius: '2px',
                          cursor: 'pointer'
                        }}
                        title="Restar 1 minuto"
                      >
                        -1m
                      </button>
                      <span style={{ fontWeight: '700', color: p.segHablados > 0 ? '#ff007f' : 'inherit', minWidth: '55px', textAlign: 'center' }}>
                        {formatTiempo(p.segHablados)}
                      </span>
                      <button
                        onClick={() => handleAjustarTiempo(p.id, 60)}
                        style={{
                          background: 'rgba(255, 0, 127, 0.12)',
                          border: '1px solid #ff007f',
                          color: '#ff007f',
                          padding: '1px 3px',
                          fontSize: '0.65rem',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontWeight: '700'
                        }}
                        title="Sumar 1 minuto"
                      >
                        +1m
                      </button>
                    </div>
                  </td>

                  {/* Preguntas Realizadas */}
                  <td style={{ padding: '0.45rem 0.6rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                      <button
                        onClick={() => handleDecrementarPregunta(p.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-color)',
                          width: '18px',
                          height: '18px',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          lineHeight: 1
                        }}
                        title="Restar 1 pregunta"
                      >
                        -
                      </button>
                      <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>
                        {p.totalPreguntas}
                      </span>
                      <button
                        onClick={() => handleIncrementarPregunta(p.id)}
                        style={{
                          background: 'rgba(255, 0, 127, 0.15)',
                          border: '1px solid #ff007f',
                          color: '#ff007f',
                          width: '18px',
                          height: '18px',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          lineHeight: 1,
                          fontWeight: '700'
                        }}
                        title="Sumar 1 pregunta realizada"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoricoDelegaciones;
