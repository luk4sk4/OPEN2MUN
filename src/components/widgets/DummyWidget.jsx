import React from 'react';

export const DummyWidget1 = () => {
  return (
    <div style={{ padding: '1rem', height: '100%', boxSizing: 'border-box' }}>
      <h3 style={{ margin: '0 0 1rem 0' }}>Widget de Prueba 1</h3>
      <p>Este es un widget de prueba para el entorno LAB.</p>
    </div>
  );
};

export const DummyWidget2 = () => {
  return (
    <div style={{ padding: '1rem', height: '100%', boxSizing: 'border-box' }}>
      <h3 style={{ margin: '0 0 1rem 0' }}>Widget de Prueba 2</h3>
      <p>Otro widget de prueba. Aquí irá funcionalidad compleja.</p>
      <button style={{
        marginTop: '1rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontWeight: '600',
        fontSize: '0.85rem',
        border: 'none',
        borderRadius: 'var(--border-radius)',
        cursor: 'pointer'
      }}>Acción Prueba</button>
    </div>
  );
};
