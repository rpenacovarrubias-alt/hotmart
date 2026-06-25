import { useState } from 'react';
import { X, Eye, EyeOff, Loader, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { hashPassword, verifyPassword } from '../utils/password';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { AppUser } from '../types';

interface Props {
  targetUser: AppUser;      // the user whose password is being changed
  isAdminReset: boolean;    // true = admin resetting someone else's password
  onClose: () => void;
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 40px 10px 14px', fontFamily: 'inherit', fontSize: '14px',
  border: '1.5px solid #e0e0e0', borderRadius: '10px', outline: 'none',
  background: 'white', boxSizing: 'border-box',
};

const ChangePasswordModal = ({ targetUser, isAdminReset, onClose }: Props) => {
  const { updateUserPassword } = useApp();
  const { currentUser, setCurrentUser } = useAuth();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]  = useState('');
  const [loading, setLoading] = useState(false);

  const isNumericOnly = (s: string) => /^\d+$/.test(s);

  const validatePasswordStrength = (pw: string): string | null => {
    if (!pw) return 'Ingresa una contraseña.';
    if (isNumericOnly(pw)) {
      if (pw.length < 4) return 'El PIN numérico debe tener al menos 4 dígitos.';
    } else {
      if (pw.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    }
    return null;
  };

  const handleSave = async () => {
    setError('');

    // Validate new password
    const pwError = validatePasswordStrength(newPw);
    if (pwError) {
      setError(pwError);
      return;
    }
    if (newPw !== confirmPw) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    // If not admin reset, verify current password first
    if (!isAdminReset) {
      if (!targetUser.passwordHash) {
        setError('Este usuario no tiene contraseña configurada.');
        setLoading(false);
        return;
      }
      const valid = await verifyPassword(currentPw, targetUser.id, targetUser.passwordHash);
      if (!valid) {
        setError('La contraseña actual es incorrecta.');
        setLoading(false);
        return;
      }
    }

    const newHash = await hashPassword(newPw, targetUser.id);
    updateUserPassword(targetUser.id, newHash);

    // If the current user changed their own password, refresh their session data
    if (currentUser?.id === targetUser.id) {
      setCurrentUser({ ...currentUser, passwordHash: newHash });
    }

    setLoading(false);
    toast.success(
      isAdminReset
        ? `Contraseña de ${targetUser.name} restablecida.`
        : 'Contraseña actualizada correctamente.'
    );
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <KeyRound size={20} color="#FF5A5F" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
              {isAdminReset ? `Restablecer contraseña — ${targetUser.name}` : 'Cambiar mi contraseña'}
            </h3>
          </div>
          <button className="modal-close" onClick={onClose}><X size={22} /></button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gap: '16px', padding: '20px 24px 24px' }}>
          {isAdminReset && (
            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#92400e' }}>
              Como administrador puedes establecer una nueva contraseña sin conocer la actual.
            </div>
          )}

          {/* Current password — only for self-change */}
          {!isAdminReset && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Contraseña actual <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  style={inp}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(v => !v)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* New password */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Nueva contraseña <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNew ? 'text' : 'password'}
                style={inp}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="8+ chars o PIN de 4+ dígitos"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Strength hint */}
            {newPw.length > 0 && (() => {
              const err = validatePasswordStrength(newPw);
              return (
                <p style={{ fontSize: '11px', marginTop: '4px', color: err ? '#dc2626' : '#16a34a' }}>
                  {err ? `✗ ${err}` : isNumericOnly(newPw) ? `✓ PIN de ${newPw.length} dígitos` : '✓ Longitud correcta'}
                </p>
              );
            })()}
          </div>

          {/* Confirm password */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Confirmar nueva contraseña <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                style={inp}
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPw.length > 0 && newPw !== confirmPw && (
              <p style={{ fontSize: '11px', marginTop: '4px', color: '#dc2626' }}>✗ No coinciden</p>
            )}
            {confirmPw.length > 0 && newPw === confirmPw && newPw.length >= 8 && (
              <p style={{ fontSize: '11px', marginTop: '4px', color: '#16a34a' }}>✓ Coinciden</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fff1f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626' }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
            <button
              onClick={onClose}
              style={{ background: 'none', border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '9px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#666', fontFamily: 'inherit' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                background: loading ? '#ccc' : '#FF5A5F',
                color: 'white', border: 'none', borderRadius: '10px',
                padding: '9px 22px', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {loading && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              {isAdminReset ? 'Restablecer' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
