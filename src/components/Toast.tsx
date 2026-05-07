import { useApp } from '../context/AppContext';

const Toast = () => {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: '#1a1a2e',
      color: 'white',
      padding: '14px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 500,
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      animation: 'slideInToast 0.3s ease',
      maxWidth: '380px',
    }}>
      <span style={{ fontSize: '16px' }}>✅</span>
      {toast}
    </div>
  );
};

export default Toast;
