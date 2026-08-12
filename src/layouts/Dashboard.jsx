import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, Eye, Menu, LogIn, X, GripVertical } from 'lucide-react';
import configMaster from '../config/config_master.json';
import WidgetRegistry from '../components/widgets/WidgetRegistry';
import SettingsModal from '../components/modals/SettingsModal';
import AccessibilityModal from '../components/modals/AccessibilityModal';
import WidgetSidebar from '../components/panels/WidgetSidebar';

// ─── Grid constants ────────────────────────────────────────────────────────────
const COLS = 12;
const ROWS = 8;
const ROW_HEIGHT = 100; // px
const GAP = 12;         // px gap between cells

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCellSize(containerWidth) {
  const totalGap = GAP * (COLS + 1);
  const cellW = (containerWidth - totalGap) / COLS;
  const cellH = ROW_HEIGHT;
  return { cellW, cellH };
}

function pixelToCell(px, py, containerWidth) {
  const { cellW, cellH } = getCellSize(containerWidth);
  const col = Math.round((px - GAP) / (cellW + GAP));
  const row = Math.round((py - GAP) / (cellH + GAP));
  return {
    col: Math.max(0, Math.min(COLS - 1, col)),
    row: Math.max(0, Math.min(ROWS - 1, row)),
  };
}

function cellToPixel(col, row, containerWidth) {
  const { cellW, cellH } = getCellSize(containerWidth);
  return {
    x: GAP + col * (cellW + GAP),
    y: GAP + row * (cellH + GAP),
  };
}

function widgetPixelRect(w, containerWidth) {
  const { cellW, cellH } = getCellSize(containerWidth);
  const x = GAP + w.col * (cellW + GAP);
  const y = GAP + w.row * (cellH + GAP);
  const width  = w.colSpan * cellW + (w.colSpan - 1) * GAP;
  const height = w.rowSpan * cellH + (w.rowSpan - 1) * GAP;
  return { x, y, width, height };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('LAB');
  const [config, setConfig]       = useState(configMaster);
  const [isSettingsOpen, setIsSettingsOpen]   = useState(false);
  const [isAccessOpen,   setIsAccessOpen]     = useState(false);
  const [isSidebarOpen,  setIsSidebarOpen]    = useState(false);

  const boardRef   = useRef(null);
  const [boardW, setBoardW] = useState(0);

  useEffect(() => {
    const update = () => boardRef.current && setBoardW(boardRef.current.offsetWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const tabs = ['GSL', 'DEBATE', 'VOTING', 'INFO', 'LAB'];

  // widgets is an array of { id, col, row, colSpan, rowSpan }
  const widgets = config.layouts[activeTab] || [];

  const setWidgets = (fn) => {
    setConfig(prev => ({
      ...prev,
      layouts: {
        ...prev.layouts,
        [activeTab]: typeof fn === 'function' ? fn(prev.layouts[activeTab] || []) : fn,
      }
    }));
  };

  // ─── Drag state ─────────────────────────────────────────────────────────────
  const drag = useRef(null); // { widgetId, startMouseX, startMouseY, startCol, startRow }

  const onDragStart = useCallback((e, widgetId) => {
    e.preventDefault();
    const w = widgets.find(w => w.i === widgetId);
    if (!w) return;
    drag.current = {
      widgetId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startCol: w.col,
      startRow: w.row,
    };
  }, [widgets]);

  const onMouseMove = useCallback((e) => {
    const activeDrag = drag.current;
    if (!activeDrag || !boardRef.current || boardW === 0) return;
    const board  = boardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - board.left;
    const mouseY = e.clientY - board.top;

    const dx = e.clientX - activeDrag.startMouseX;
    const dy = e.clientY - activeDrag.startMouseY;

    const { cellW, cellH } = getCellSize(boardW);
    const colDelta = Math.round(dx / (cellW + GAP));
    const rowDelta = Math.round(dy / (cellH + GAP));

    const newCol = Math.max(0, Math.min(COLS - 1, activeDrag.startCol + colDelta));
    const newRow = Math.max(0, Math.min(ROWS - 1, activeDrag.startRow + rowDelta));

    setWidgets(prev => prev.map(w => {
      if (w.i !== activeDrag.widgetId) return w;
      // clamp so widget doesn't overflow right/bottom
      const clampedCol = Math.min(newCol, COLS - w.colSpan);
      const clampedRow = Math.min(newRow, ROWS - w.rowSpan);
      return { ...w, col: clampedCol, row: clampedRow };
    }));
  }, [boardW]);

  const onMouseUp = useCallback(() => {
    drag.current = null;
  }, []);

  // Attach global mouse events while dragging
  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // ─── Resize state ───────────────────────────────────────────────────────────
  const resz = useRef(null); // { widgetId, startMouseX, startMouseY, startColSpan, startRowSpan }

  const onResizeStart = useCallback((e, widgetId) => {
    e.preventDefault();
    e.stopPropagation();
    const w = widgets.find(w => w.i === widgetId);
    if (!w) return;
    resz.current = {
      widgetId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startColSpan: w.colSpan,
      startRowSpan: w.rowSpan,
    };
  }, [widgets]);

  const onResizeMove = useCallback((e) => {
    const activeResz = resz.current;
    if (!activeResz || boardW === 0) return;
    const dx = e.clientX - activeResz.startMouseX;
    const dy = e.clientY - activeResz.startMouseY;
    const { cellW, cellH } = getCellSize(boardW);
    const colDelta = Math.round(dx / (cellW + GAP));
    const rowDelta = Math.round(dy / (cellH + GAP));

    setWidgets(prev => prev.map(w => {
      if (w.i !== activeResz.widgetId) return w;
      const newColSpan = Math.max(1, Math.min(COLS - w.col, activeResz.startColSpan + colDelta));
      const newRowSpan = Math.max(1, Math.min(ROWS - w.row, activeResz.startRowSpan + rowDelta));
      return { ...w, colSpan: newColSpan, rowSpan: newRowSpan };
    }));
  }, [boardW]);

  const onResizeUp = useCallback(() => {
    resz.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onResizeMove);
    window.addEventListener('mouseup', onResizeUp);
    return () => {
      window.removeEventListener('mousemove', onResizeMove);
      window.removeEventListener('mouseup', onResizeUp);
    };
  }, [onResizeMove, onResizeUp]);

  // ─── Add / Remove ────────────────────────────────────────────────────────────
  const removeWidget = (id) => setWidgets(prev => prev.filter(w => w.i !== id));
  const addWidget    = (id) => {
    setWidgets(prev => [...prev, { i: id, col: 0, row: 0, colSpan: 4, rowSpan: 2 }]);
    setIsSidebarOpen(false);
  };

  // ─── Accessibility ──────────────────────────────────────────────────────────
  const acc = config.accessibility || { dyslexiaMode: false, fontSizeScale: 1, colorblindMode: 'none' };
  let filterString = 'none';
  if (acc.colorblindMode === 'protanopia')    filterString = 'contrast(90%) hue-rotate(15deg)';
  if (acc.colorblindMode === 'deuteranopia')  filterString = 'contrast(90%) hue-rotate(-15deg)';
  if (acc.colorblindMode === 'tritanopia')    filterString = 'sepia(50%) hue-rotate(180deg)';
  if (acc.colorblindMode === 'achromatopsia') filterString = 'grayscale(100%)';

  const isLight = config.accessibility?.themeMode === 'light';

  const themeStyles = {
    '--bg-color':        config.theme.backgroundColor,
    '--panel-color':     config.theme.panelColor,
    '--text-color':      config.theme.textColor,
    '--primary-color':   config.theme.primaryColor,
    '--border-color':    isLight ? '#e4e4e7' : '#262626',
    '--subborder-color': isLight ? '#e4e4e7' : '#222222',
    '--header-bg':       isLight ? '#ffffff' : '#000000',
    '--subnav-bg':       isLight ? '#f4f4f5' : '#0d0d0d',
    '--card-header-bg': isLight ? '#e4e4e7' : '#141414',
    '--btn-bg':          isLight ? '#000000' : '#ffffff',
    '--btn-text':        isLight ? '#ffffff' : '#000000',
    '--grid-line':       isLight ? '#e4e4e7' : '#222222',
    '--muted-text':      isLight ? '#71717a' : '#888888',
    '--font-family':     acc.dyslexiaMode ? '"OpenDyslexic","Comic Sans MS",sans-serif' : config.theme.fontFamily,
    '--border-radius':   config.theme.borderRadius,
    backgroundColor:     'var(--bg-color)',
    color:               'var(--text-color)',
    fontFamily:          'var(--font-family)',
    fontSize:            `${acc.fontSizeScale}rem`,
    minHeight:           '100vh',
    display:             'flex',
    flexDirection:       'column',
    filter:              filterString,
    transition:          'filter 0.3s ease, font-size 0.3s ease, background-color 0.3s ease, color 0.3s ease',
  };

  // ─── Board pixel dimensions ─────────────────────────────────────────────────
  const { cellW, cellH } = boardW ? getCellSize(boardW) : { cellW: 0, cellH: 0 };
  const boardHeight = GAP + ROWS * (ROW_HEIGHT + GAP);

  return (
    <div style={themeStyles}>
      <SettingsModal    isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} config={config} setConfig={setConfig} />
      <AccessibilityModal isOpen={isAccessOpen} onClose={() => setIsAccessOpen(false)} config={config} setConfig={setConfig} />
      <WidgetSidebar
        isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
        currentLayout={widgets} activeTab={activeTab} onAddWidget={addWidget}
      />

      {/* ── Navbar ── */}
      <nav style={{ display:'flex', padding:'0.75rem 1.5rem', backgroundColor:'var(--header-bg)', borderBottom:'1px solid var(--subborder-color)', alignItems:'center', justifyContent:'space-between', transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', width:'250px' }}>
          <button onClick={() => setIsSidebarOpen(true)} style={{ background:'transparent', border:'none', color:'var(--text-color)', cursor:'pointer', display:'flex', padding: '4px', borderRadius: '4px' }} title="Widgets">
            <Menu size={22} />
          </button>
          <div style={{ fontWeight:'700', fontSize:'1.2rem', letterSpacing: '0.05em', color: 'var(--text-color)' }}>🏛️ OPENMUN</div>
        </div>

        <div style={{ display:'flex', gap:'0.35rem', backgroundColor: 'var(--subnav-bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--subborder-color)', transition: 'background-color 0.3s ease' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding:'0.4rem 1rem',
              backgroundColor: activeTab === tab ? 'var(--text-color)' : 'transparent',
              color: activeTab === tab ? 'var(--bg-color)' : 'var(--muted-text)',
              border:'none', borderRadius:'6px', cursor:'pointer',
              fontWeight: activeTab === tab ? '700' : '500', 
              fontSize: '0.85rem',
              letterSpacing: '0.03em',
              transition:'all 0.15s ease'
            }}>{tab}</button>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', width:'250px', justifyContent:'flex-end' }}>
          <button onClick={() => setIsAccessOpen(true)}  style={{ background:'transparent', border:'1px solid var(--subborder-color)', borderRadius: '6px', color:'var(--text-color)', cursor:'pointer', display:'flex', padding: '6px' }} title="Accesibilidad"><Eye size={18} /></button>
          <button onClick={() => setIsSettingsOpen(true)} style={{ background:'transparent', border:'1px solid var(--subborder-color)', borderRadius: '6px', color:'var(--text-color)', cursor:'pointer', display:'flex', padding: '6px' }} title="Ajustes"><Settings size={18} /></button>
          <div style={{ width:'1px', height:'20px', backgroundColor:'var(--subborder-color)' }} />
          <button style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--btn-bg)', border:'none', color:'var(--btn-text)', fontWeight: '600', padding:'0.45rem 1rem', borderRadius:'6px', cursor:'pointer', fontSize: '0.85rem', transition: 'all 0.2s ease' }}>
            <LogIn size={15} /> Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* ── Board ── */}
      <main style={{ flex:1, padding:'1rem', userSelect: drag.current || resz.current ? 'none' : 'auto' }}>
        <div
          ref={boardRef}
          style={{
            position: 'relative',
            width: '100%',
            height: `${boardHeight}px`,
          }}
        >
          {/* Background grid cells */}
          {boardW > 0 && Array.from({ length: ROWS }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
              const x = GAP + col * (cellW + GAP);
              const y = GAP + row * (cellH + GAP);
              return (
                <div
                  key={`cell-${col}-${row}`}
                  style={{
                    position: 'absolute',
                    left: x, top: y,
                    width: cellW, height: cellH,
                    border: '1px dashed var(--grid-line)',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    pointerEvents: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                />
              );
            })
          )}

          {/* Widgets */}
          {boardW > 0 && widgets.map(w => {
            const x = GAP + w.col * (cellW + GAP);
            const y = GAP + w.row * (cellH + GAP);
            const width  = w.colSpan * cellW + (w.colSpan - 1) * GAP;
            const height = w.rowSpan * cellH + (w.rowSpan - 1) * GAP;
            const WidgetComponent = WidgetRegistry[w.i];

            return (
              <div
                key={w.i}
                style={{
                  position: 'absolute',
                  left: x, top: y,
                  width, height,
                  backgroundColor: 'var(--panel-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.08)' : '0 8px 30px rgba(0,0,0,0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: (drag.current?.widgetId === w.i || resz.current?.widgetId === w.i) ? 'none' : 'left 0.15s ease, top 0.15s ease, width 0.15s ease, height 0.15s ease, background-color 0.3s ease, border-color 0.3s ease',
                  zIndex: (drag.current?.widgetId === w.i || resz.current?.widgetId === w.i) ? 100 : 1,
                }}
              >
                {/* Drag handle bar */}
                <div
                  onMouseDown={(e) => onDragStart(e, w.i)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.35rem 0.6rem',
                    backgroundColor: 'var(--card-header-bg)',
                    borderBottom: '1px solid var(--border-color)',
                    borderTopLeftRadius: 'var(--border-radius)',
                    borderTopRightRadius: 'var(--border-radius)',
                    cursor: 'grab',
                    flexShrink: 0,
                    transition: 'background-color 0.3s ease, border-color 0.3s ease'
                  }}
                >
                  <GripVertical size={14} style={{ opacity: 0.5 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: '500', opacity: 0.7, flex: 1, textAlign: 'center', letterSpacing: '0.02em' }}>{w.i}</span>
                  <button
                    onMouseDown={e => e.stopPropagation()}
                    onClick={() => removeWidget(w.i)}
                    style={{ background:'transparent', border:'none', color:'var(--text-color)', cursor:'pointer', display:'flex', opacity: 0.6, padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Content */}
                <div style={{ flex:1, overflow:'auto', borderBottomLeftRadius:'var(--border-radius)', borderBottomRightRadius:'var(--border-radius)' }}>
                  {WidgetComponent ? <WidgetComponent /> : <div style={{ padding:'1rem', opacity:0.5 }}>Widget: {w.i}</div>}
                </div>

                {/* Resize handle */}
                <div
                  onMouseDown={(e) => onResizeStart(e, w.i)}
                  style={{
                    position: 'absolute',
                    bottom: 3, right: 3,
                    width: 14, height: 14,
                    cursor: 'nwse-resize',
                    opacity: 0.5,
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ color: 'var(--text-color)' }}>
                    <path d="M8 2L2 8M8 5L5 8M8 8L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
