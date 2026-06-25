import { useState, useRef, useEffect } from 'react';
import { ChevronDown, UserCircle, LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  host: 'Anfitrión',
  cohost: 'Co-Anfitrión',
  maintenance_staff: 'Mantenimiento',
  cleaning_staff: 'Limpieza',
};

const ROLE_COLORS: Record<string, string> = {
  admin: '#FF5A5F',
  manager: '#4A4A4A',
  host: '#00A699',
  cohost: '#6B5BFF',
  maintenance_staff: '#FF5A5F',
  cleaning_staff: '#FC642D',
};

const UserSwitcher = () => {
  const { currentUser, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!currentUser) return null;

  const roleColor = ROLE_COLORS[currentUser.role] ?? '#888';

  return (
    <>
      <div ref={ref} style={{ position: 'relative', margin: '8px 12px 0' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            cursor: 'pointer',
            color: 'inherit',
          }}
        >
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <UserCircle size={28} style={{ flexShrink: 0, color: roleColor }} />
          )}
          <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: 10, color: roleColor, fontWeight: 600 }}>
              {ROLE_LABELS[currentUser.role]}
            </div>
          </div>
          <ChevronDown size={14} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {open && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            overflow: 'hidden',
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            <div style={{ padding: '6px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              Mi cuenta
            </div>

            <button
              onClick={() => { setChangePwOpen(true); setOpen(false); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 12,
                textAlign: 'left',
              }}
            >
              <KeyRound size={14} />
              Cambiar contraseña
            </button>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => { logout(); setOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#FF5A5F',
                  fontSize: 12,
                }}
              >
                <LogOut size={14} /> Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {changePwOpen && (
        <ChangePasswordModal
          targetUser={currentUser}
          isAdminReset={false}
          onClose={() => setChangePwOpen(false)}
        />
      )}
    </>
  );
};

export default UserSwitcher;
