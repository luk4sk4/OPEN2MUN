import React from 'react';
import { X, Save, Download } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, config, setConfig }) => {
  if (!isOpen) return null;

  const handleColorChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [key]: value
      }
    }));
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "openmun_config.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#0a0a0a',
        border: '1px solid #262626',
        padding: '2rem',
        borderRadius: 'var(--border-radius)',
        width: '400px',
        maxWidth: '90%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.9)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Ajustes del Tema</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(config.theme).map(([key, value]) => {
            if (key === 'fontFamily' || key === 'borderRadius') return null; // skip non-color settings here for simplicity
            
            return (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: '#141414', border: '1px solid #222222', borderRadius: '6px' }}>
                <label style={{ textTransform: 'capitalize', fontSize: '0.9rem', opacity: 0.9 }}>{key.replace(/([A-Z])/g, ' $1')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="color" 
                    value={value} 
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    style={{ cursor: 'pointer', background: 'transparent', border: 'none', padding: 0, width: '28px', height: '28px' }}
                  />
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', opacity: 0.7 }}>{value}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button 
            onClick={handleDownloadJSON}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
            <Download size={18} />
            Guardar JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
