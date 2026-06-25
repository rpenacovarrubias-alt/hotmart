import { useState, type FormEvent } from 'react';
import { Home, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const ERROR_MESSAGES: Record<string, string> = {
  not_found:     'No existe una cuenta con ese correo.',
  wrong_password:'Contraseña incorrecta.',
  inactive:      'Esta cuenta está desactivada. Contacta al administrador.',
};

const Login = () => {
  const { login } = useAuth();
  const { users } = useApp();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await login(users, email, password);
    setLoading(false);
    if (result !== 'ok') {
      setError(ERROR_MESSAGES[result] ?? 'Error desconocido.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f1923 100%)',
      fontFamily: 'inherit',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        margin: '0 24px',
        background: '#fff',
        borderRadius: '20px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #FF5A5F 0%, #FC642D 100%)',
          padding: '36px 40px 32px',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <Home size={28} color="#fff" />
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              CoHost Admin
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', margin: 0 }}>
            Gestión de propiedades Airbnb
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '36px 40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', marginBottom: '28px', marginTop: 0 }}>
            Iniciar sesión
          </h2>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#444', marginBottom: '6px' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@cohost.mx"
              autoComplete="email"
              style={{
                width: '100%', padding: '11px 14px', fontSize: '14px', fontFamily: 'inherit',
                border: '1.5px solid #e0e0e0', borderRadius: '10px', outline: 'none',
                background: '#fafafa', boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#FF5A5F'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e0e0e0'; }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#444', marginBottom: '6px' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '11px 42px 11px 14px', fontSize: '14px', fontFamily: 'inherit',
                  border: '1.5px solid #e0e0e0', borderRadius: '10px', outline: 'none',
                  background: '#fafafa', boxSizing: 'border-box',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#FF5A5F'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e0e0e0'; }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0,
                }}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fff1f2', border: '1px solid #fca5a5', borderRadius: '8px',
              padding: '10px 14px', fontSize: '13px', color: '#dc2626',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px', fontSize: '15px', fontWeight: 700, fontFamily: 'inherit',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #FF5A5F 0%, #FC642D 100%)',
              color: '#fff', border: 'none', borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Verificando...' : 'Entrar'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '20px', marginBottom: 0 }}>
            ¿Olvidaste tu contraseña? Contacta al administrador.
          </p>
        </form>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;
