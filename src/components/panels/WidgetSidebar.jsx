import React from 'react';
import { X, Plus } from 'lucide-react';
import WidgetRegistry from '../widgets/WidgetRegistry';

const WidgetSidebar = ({ isOpen, onClose, currentLayout, activeTab, onAddWidget }) => {
  if (!isOpen) return null;

  // Obtenemos todos los IDs de los widgets disponibles en el sistema
  const allWidgets = Object.keys(WidgetRegistry);
  
  // Obtenemos los IDs de los widgets que ya están en el layout actual
  const activeWidgetIds = currentLayout.map(item => item.i);
  
  // Los widgets inactivos son los que están en el registro pero no en el layout actual
  const inactiveWidgets = allWidgets.filter(w => !activeWidgetIds.includes(w));

  return (
    <>
      {/* Overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(2px)',
          zIndex: 900
        }} 
      />
      
      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: '300px',
        backgroundColor: '#0a0a0a',
        borderRight: '1px solid #262626',
        boxShadow: '8px 0 25px rgba(0,0,0,0.8)',
        zIndex: 901,
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out'
      }}>
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid #262626',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Widgets Disponibles</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>
        
        <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {inactiveWidgets.length === 0 ? (
            <div style={{ opacity: 0.5, textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
              Todos los widgets están activos en {activeTab}.
            </div>
          ) : (
            inactiveWidgets.map(widgetId => (
              <div 
                key={widgetId}
                style={{
                  padding: '1rem',
                  backgroundColor: '#141414',
                  border: '1px solid #262626',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{widgetId}</div>
                <button 
                  onClick={() => onAddWidget(widgetId)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem'
                  }}
                >
                  <Plus size={16} /> Añadir al panel
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default WidgetSidebar;
