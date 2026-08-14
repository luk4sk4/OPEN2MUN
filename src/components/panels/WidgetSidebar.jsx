import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Clock, 
  Users, 
  FileText, 
  Timer, 
  Hourglass, 
  Globe, 
  BarChart3, 
  TestTube, 
  FlaskConical,
  Check,
  Zap,
  Sliders,
  Vote,
  FileCheck2,
  Upload,
  Building2,
  UserPlus
} from 'lucide-react';
import WidgetRegistry from '../widgets/WidgetRegistry';

// Metadata rica para cada widget disponible
export const WIDGET_METADATA = {
  anadir_paises: {
    title: 'Añadir Países',
    category: 'Debate',
    description: 'Búsqueda rápida y selección de países para añadir a la Lista General o Debate.',
    icon: UserPlus,
    iconBg: 'rgba(168, 85, 247, 0.2)',
    iconColor: '#c084fc',
    defaultColSpan: 6,
    defaultRowSpan: 4,
  },
  establecer_agenda: {
    title: 'Comité y Agenda',
    category: 'Configuración',
    description: 'Configuración del nombre del comité y gestión ordenada de los puntos de agenda.',
    icon: FileCheck2,
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconColor: '#3b82f6',
    defaultColSpan: 6,
    defaultRowSpan: 4,
  },
  votacion_oficial: {
    title: 'Sistema de Votación Oficial',
    category: 'Votaciones',
    description: 'Votación Procedimental vs Sustantiva, tipos de mayoría, Veto P5, orden alfabético yRoll Call.',
    icon: Vote,
    iconBg: 'rgba(59, 130, 246, 0.2)',
    iconColor: '#3b82f6',
    defaultColSpan: 7,
    defaultRowSpan: 5,
  },
  cronometro_principal: {
    title: 'Cronómetro Principal',
    category: 'Tiempo',
    description: 'Temporizador para discursos de delegaciones con tiempos predefinidos y ceder palabra.',
    icon: Clock,
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconColor: '#3b82f6',
    defaultColSpan: 6,
    defaultRowSpan: 3,
  },
  lista_oradores: {
    title: 'Lista de Oradores',
    category: 'Debate',
    description: 'Gestión de la cola de oradores GSL y control de turnos en directo.',
    icon: Users,
    iconBg: 'rgba(168, 85, 247, 0.15)',
    iconColor: '#a855f7',
    defaultColSpan: 6,
    defaultRowSpan: 4,
  },
  pizarra_mociones: {
    title: 'Pizarra de Mociones',
    category: 'Mociones',
    description: 'Registro interactivo, ordenamiento y votación rápida de mociones.',
    icon: FileText,
    iconBg: 'rgba(234, 179, 8, 0.15)',
    iconColor: '#eab308',
    defaultColSpan: 6,
    defaultRowSpan: 4,
  },
  cronometro_dual: {
    title: 'Cronómetro Dual',
    category: 'Tiempo',
    description: 'Reloj doble para tiempo individual por orador y tiempo total del caucus.',
    icon: Timer,
    iconBg: 'rgba(249, 115, 22, 0.15)',
    iconColor: '#f97316',
    defaultColSpan: 5,
    defaultRowSpan: 4,
  },
  cronometro_only_time: {
    title: 'Cronómetro Solo Tiempo',
    category: 'Tiempo',
    description: 'Temporizador simplificado de tiempo total para libres negociaciones.',
    icon: Hourglass,
    iconBg: 'rgba(236, 72, 153, 0.15)',
    iconColor: '#ec4899',
    defaultColSpan: 5,
    defaultRowSpan: 3,
  },
  matriz_paises: {
    title: 'Matriz de Países',
    category: 'Votaciones',
    description: 'Control de asistencia, derecho a veto, quórum y votaciones roll-call.',
    icon: Globe,
    iconBg: 'rgba(34, 197, 94, 0.15)',
    iconColor: '#22c55e',
    defaultColSpan: 6,
    defaultRowSpan: 4,
  },
  historico_delegaciones: {
    title: 'Histórico Delegaciones',
    category: 'Estadísticas',
    description: 'Estadísticas de participación, interrupciones e intervenciones.',
    icon: BarChart3,
    iconBg: 'rgba(6, 182, 212, 0.15)',
    iconColor: '#06b6d4',
    defaultColSpan: 6,
    defaultRowSpan: 4,
  },
  importar_paises: {
    title: 'Importar Países',
    category: 'Configuración',
    description: 'Carga delegaciones desde archivo xlsx, csv o json, o añádelas manualmente.',
    icon: Upload,
    iconBg: 'rgba(234, 179, 8, 0.15)',
    iconColor: '#eab308',
    defaultColSpan: 6,
    defaultRowSpan: 4,
  },
  configurar_comite: {
    title: 'Nombre del Comité',
    category: 'Configuración',
    description: 'Asigna el nombre oficial del comité o asamblea para esta sesión.',
    icon: Building2,
    iconBg: 'rgba(234, 179, 8, 0.15)',
    iconColor: '#eab308',
    defaultColSpan: 6,
    defaultRowSpan: 3,
  },
  widget_prueba_1: {
    title: 'Widget Prueba 1',
    category: 'Laboratorio',
    description: 'Componente experimental de prueba para desarrollo.',
    icon: TestTube,
    iconBg: 'rgba(100, 116, 139, 0.15)',
    iconColor: '#94a3b8',
    defaultColSpan: 4,
    defaultRowSpan: 2,
  },
  widget_prueba_2: {
    title: 'Widget Prueba 2',
    category: 'Laboratorio',
    description: 'Componente secundario de demostración.',
    icon: FlaskConical,
    iconBg: 'rgba(100, 116, 139, 0.15)',
    iconColor: '#94a3b8',
    defaultColSpan: 4,
    defaultRowSpan: 2,
  },
};

// Componente Toggle Estilizado de Alta Gama
const StylizedToggle = ({ checked, onChange, disabled }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange();
      }}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '48px',
        height: '26px',
        borderRadius: '9999px',
        padding: '3px',
        backgroundColor: checked ? '#3b82f6' : '#27272a',
        boxShadow: checked ? '0 0 12px rgba(59, 130, 246, 0.4)' : 'inset 0 2px 4px rgba(0,0,0,0.5)',
        border: `1px solid ${checked ? '#60a5fa' : '#3f3f46'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
        flexShrink: 0
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          transform: checked ? 'translateX(22px)' : 'translateX(0px)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease',
        }}
      >
        {checked && <Check size={11} color="#3b82f6" strokeWidth={3.5} />}
      </span>
    </button>
  );
};

const WidgetSidebar = ({ isOpen, onClose, currentLayout = [], activeTab, onToggleWidget, onActivateAll, onDeactivateAll }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('TODOS');

  if (!isOpen) return null;

  const allWidgetIds = Object.keys(WidgetRegistry);
  const activeWidgetIds = currentLayout.map(item => item.i);

  const categories = ['TODOS', 'Tiempo', 'Debate', 'Mociones', 'Votaciones', 'Estadísticas', 'Laboratorio'];

  // Filtrar widgets por búsqueda y categoría
  const filteredWidgets = allWidgetIds.filter(id => {
    const meta = WIDGET_METADATA[id] || { title: id, category: 'Otros', description: '' };
    const matchesSearch = meta.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          meta.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'TODOS' || meta.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Overlay Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          animation: 'fadeIn 0.2s ease-out'
        }} 
      />
      
      {/* Sidebar Content */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: '380px',
        maxWidth: '90vw',
        backgroundColor: 'var(--panel-color)',
        borderRight: '1px solid var(--border-color)',
        boxShadow: '10px 0 35px rgba(0,0,0,0.5)',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        color: 'var(--text-color)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--card-header-bg)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sliders size={20} color="currentColor" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', letterSpacing: '-0.01em' }}>
                Gestor de Widgets
              </h3>
            </div>
            <button 
              onClick={onClose} 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#a1a1aa', 
                cursor: 'pointer', 
                display: 'flex',
                padding: '4px',
                borderRadius: '6px',
                transition: 'all 0.15s ease'
              }}
              title="Cerrar Panel"
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ 
            marginTop: '0.75rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: '#a1a1aa',
            backgroundColor: '#18181b',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #27272a'
          }}>
            <span>Pestaña Actual:</span>
            <span style={{ 
              fontWeight: '700', 
              color: '#60a5fa', 
              backgroundColor: 'rgba(59, 130, 246, 0.15)', 
              padding: '0.15rem 0.5rem', 
              borderRadius: '4px',
              letterSpacing: '0.04em'
            }}>
              {activeTab}
            </span>
          </div>
        </div>

        {/* Buscador & Acciones Rápida */}
        <div style={{ padding: '1rem 1.5rem 0.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Buscador */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
            <input
              type="text"
              placeholder="Buscar widget..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2.1rem',
                backgroundColor: '#141417',
                border: '1px solid #27272a',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>

          {/* Categorías (Pills) */}
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.73rem',
                  fontWeight: filterCategory === cat ? '700' : '500',
                  borderRadius: '9999px',
                  border: filterCategory === cat ? '1px solid #3b82f6' : '1px solid #27272a',
                  backgroundColor: filterCategory === cat ? 'rgba(59, 130, 246, 0.2)' : '#141417',
                  color: filterCategory === cat ? '#60a5fa' : '#a1a1aa',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Botones de acción masiva */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
            <button
              onClick={onActivateAll}
              style={{
                flex: 1,
                padding: '0.35rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                color: '#34d399',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Zap size={13} /> Activar Todos
            </button>
            <button
              onClick={onDeactivateAll}
              style={{
                flex: 1,
                padding: '0.35rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                color: '#f87171',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                transition: 'all 0.15s ease'
              }}
            >
              <X size={13} /> Desactivar Todos
            </button>
          </div>
        </div>

        {/* Lista de Widgets con Toggles Estilizados */}
        <div style={{ 
          padding: '0.75rem 1.5rem 1.5rem 1.5rem', 
          overflowY: 'auto', 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.75rem' 
        }}>
          {filteredWidgets.length === 0 ? (
            <div style={{ color: '#71717a', textAlign: 'center', marginTop: '3rem', fontSize: '0.85rem' }}>
              No se encontraron widgets con la búsqueda actual.
            </div>
          ) : (
            filteredWidgets.map(widgetId => {
              const meta = WIDGET_METADATA[widgetId] || {
                title: widgetId,
                category: 'General',
                description: 'Widget personalizado',
                icon: Sliders,
                iconBg: 'rgba(255, 255, 255, 0.1)',
                iconColor: '#ffffff'
              };

              const isActive = activeWidgetIds.includes(widgetId);
              const IconComp = meta.icon || Sliders;

              return (
                <div 
                  key={widgetId}
                  onClick={() => onToggleWidget(widgetId, !isActive)}
                  style={{
                    padding: '0.9rem 1rem',
                    backgroundColor: isActive ? '#141419' : '#0d0d0f',
                    border: `1px solid ${isActive ? '#3b82f644' : '#26262b'}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 14px rgba(0,0,0,0.4)' : 'none'
                  }}
                >
                  {/* Icono + Información */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: meta.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <IconComp size={19} color={meta.iconColor} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.88rem', color: '#f4f4f5' }}>
                          {meta.title}
                        </span>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: meta.iconColor,
                          backgroundColor: meta.iconBg,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px'
                        }}>
                          {meta.category}
                        </span>
                      </div>

                      <div style={{ 
                        fontSize: '0.74rem', 
                        color: '#a1a1aa', 
                        marginTop: '0.2rem', 
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {meta.description}
                      </div>

                      {/* Badge de Estado */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem' }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: isActive ? '#22c55e' : '#52525b',
                          boxShadow: isActive ? '0 0 6px #22c55e' : 'none'
                        }} />
                        <span style={{ fontSize: '0.68rem', fontWeight: '600', color: isActive ? '#4ade80' : '#71717a' }}>
                          {isActive ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Toggle Estilizado */}
                  <StylizedToggle
                    checked={isActive}
                    onChange={() => onToggleWidget(widgetId, !isActive)}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default WidgetSidebar;
