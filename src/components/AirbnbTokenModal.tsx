import { useState } from 'react';
import { X, Key, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AirbnbTokenModalProps {
  onClose: () => void;
}

export default function AirbnbTokenModal({ onClose }: AirbnbTokenModalProps) {
  const { airbnbSession, saveAirbnbSession, clearAirbnbSession } = useApp();
  const [tokenInput, setTokenInput] = useState(airbnbSession?.token ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!tokenInput.trim()) return;
    saveAirbnbSession(tokenInput.trim());
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const handleClear = () => { clearAirbnbSession(); setTokenInput(''); };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(31,58,95,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'white', borderRadius: '20px', padding: '32px',
        width: '100%', maxWidth: '500px',
        boxShadow: '0 24px 64px rgba(31,58,95,0.2)',
        animation: 'fadeSlideIn 0.25s cubic-bezier(0.23,1,0.32,1) forwards',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(249,115,22,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Key size={20} color="#F97316" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1F3A5F', margin: 0 }}>
              Token de Sesión Airbnb
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', borderRadius: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          background: '#FFF8F2', border: '1px solid rgba(249,115,22,0.2)',
          borderRadius: '12px', padding: '16px', marginBottom: '20px',
          fontSize: '13px', color: '#6b7280', lineHeight: 1.7,
        }}>
          <strong style={{ color: '#1F3A5F' }}>Cómo obtener el token:</strong><br />
          1. Abre{' '}
          <a href="https://www.airbnb.mx/hosting" target="_blank" rel="noopener noreferrer"
            style={{ color: '#F97316', textDecoration: 'none', fontWeight: 600 }}>
            airbnb.mx/hosting <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
          </a><br />
          2. Abre DevTools (F12) → pestaña Network<br />
          3. Filtra por <code style={{ background: 'white', padding: '1px 5px', borderRadius: '4px', fontSize: '11px' }}>reviews</code> y haz clic en cualquier request<br />
          4. Copia el valor del header <code style={{ background: 'white', padding: '1px 5px', borderRadius: '4px', fontSize: '11px' }}>X-Airbnb-OAuth-Token</code>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#1F3A5F', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Token (empieza con "eyJ...")
          </label>
          <textarea
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            style={{
              width: '100%', minHeight: '90px', padding: '12px',
              border: '2px solid #e5e7eb', borderRadius: '10px',
              fontSize: '11px', fontFamily: 'monospace', resize: 'vertical',
              outline: 'none', boxSizing: 'border-box', color: '#374151',
              transition: 'border-color 150ms ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#F97316')}
            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
          />
          {airbnbSession && (
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
              Token guardado el {new Date(airbnbSession.savedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {airbnbSession && (
            <button
              onClick={handleClear}
              style={{
                padding: '10px 16px', borderRadius: '10px', cursor: 'pointer',
                background: 'none', border: '1.5px solid #fca5a5', color: '#ef4444',
                fontSize: '13px', fontWeight: 600,
              }}
            >
              Borrar token
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px', borderRadius: '10px', cursor: 'pointer',
              background: '#f3f4f6', border: 'none', color: '#374151',
              fontSize: '13px', fontWeight: 600,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!tokenInput.trim()}
            style={{
              padding: '10px 24px', borderRadius: '10px', cursor: tokenInput.trim() ? 'pointer' : 'not-allowed',
              background: saved ? '#22c55e' : '#F97316', border: 'none', color: 'white',
              fontSize: '13px', fontWeight: 700,
              transition: 'background 200ms ease-out, transform 160ms ease-out',
              opacity: tokenInput.trim() ? 1 : 0.5,
            }}
            onMouseDown={(e) => { if (tokenInput.trim()) e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {saved ? '✓ Guardado' : 'Guardar token'}
          </button>
        </div>
      </div>
    </div>
  );
}
