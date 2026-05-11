import { useState } from 'react';
import { Plus, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import type { AppUser, UserRole } from '../types';

const roleDisplay: Record<UserRole, { label: string; color: string; bg: string }> = {
  admin:             { label: 'Administrador', color: '#FFFFFF', bg: '#222222' },
  manager:           { label: 'Gerente',       color: '#FFFFFF', bg: '#4A4A4A' },
  host:              { label: 'Anfitrión',     color: '#00A699', bg: 'rgba(0, 166, 153, 0.1)' },
  cleaning_staff:    { label: 'Limpieza',      color: '#FC642D', bg: 'rgba(252, 100, 45, 0.1)' },
  maintenance_staff: { label: 'Mantenimiento', color: '#FF5A5F', bg: 'rgba(255, 90, 95, 0.1)' },
};

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', fontFamily: 'inherit', fontSize: '14px',
  border: '1.5px solid var(--border-color)', borderRadius: '10px', outline: 'none',
  background: 'white', boxSizing: 'border-box',
};

const fallbackAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=FF5A5F&color=fff`;

type UserForm = {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  propertyAccess: string[];
  status: 'active' | 'inactive';
  avatarUrl: string;
};

const DEFAULT_FORM: UserForm = {
  name: '', email: '', phone: '', role: 'cleaning_staff', propertyAccess: [], status: 'active',
  avatarUrl: '',
};

const Team = () => {
  const { users, properties, addUser, updateUser, toggleUserStatus } = useApp();

  const [roleFilter, setRoleFilter]     = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingUser, setEditingUser]   = useState<AppUser | null>(null);
  const [form, setForm]                 = useState<UserForm>(DEFAULT_FORM);
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [avatarPhotoMode, setAvatarPhotoMode] = useState<'url' | 'upload'>('url');
  const [preloadPropertyId, setPreloadPropertyId] = useState<string>('');

  const filteredUsers = roleFilter === 'all' ? users : users.filter(u => u.role === roleFilter);

  // ── Open modals ──────────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(DEFAULT_FORM);
    setErrors({});
    setAvatarPhotoMode('url');
    setPreloadPropertyId('');
    setAddModalOpen(true);
  };

  const openEdit = (user: AppUser) => {
    setForm({
      name:           user.name,
      email:          user.email,
      phone:          user.phone ?? '',
      role:           user.role,
      propertyAccess: user.propertyAccess,
      status:         user.status,
      avatarUrl:      user.avatarUrl ?? '',
    });
    setErrors({});
    setAvatarPhotoMode('url');
    setPreloadPropertyId('');
    setEditingUser(user);
  };

  const closeModals = () => {
    setAddModalOpen(false);
    setEditingUser(null);
    setForm(DEFAULT_FORM);
    setErrors({});
    setPreloadPropertyId('');
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim())  errs.name  = 'Requerido';
    if (!form.email.trim()) errs.email = 'Requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSaveAdd = () => {
    if (!validate()) return;
    const name = form.name.trim();
    const newUser: AppUser = {
      id:             `u${Date.now()}`,
      name,
      email:          form.email.trim(),
      phone:          form.phone.trim() || undefined,
      role:           form.role,
      propertyAccess: form.propertyAccess,
      status:         form.status,
      avatarUrl:      form.avatarUrl.trim() || fallbackAvatar(name),
      createdAt:      new Date().toISOString(),
    };
    addUser(newUser);
    toast.success(`${name} agregado correctamente`);
    closeModals();
  };

  const handleSaveEdit = () => {
    if (!editingUser || !validate()) return;
    const name = form.name.trim();
    updateUser({
      ...editingUser,
      name,
      email:          form.email.trim(),
      phone:          form.phone.trim() || undefined,
      role:           form.role,
      propertyAccess: form.propertyAccess,
      status:         form.status,
      avatarUrl:      form.avatarUrl.trim() || fallbackAvatar(name),
    });
    toast.success(`${name} actualizado correctamente`);
    closeModals();
  };

  const handleToggleAccess = (propId: string) => {
    setForm(f => ({
      ...f,
      propertyAccess: f.propertyAccess.includes(propId)
        ? f.propertyAccess.filter(id => id !== propId)
        : [...f.propertyAccess, propId],
    }));
  };

  // ── Pre-load host data from existing property ─────────────────────────────
  const handlePreloadFromProperty = (propId: string) => {
    setPreloadPropertyId(propId);
    if (!propId) return;
    const prop = properties.find(p => p.id === propId);
    if (!prop) return;
    setForm(f => ({
      ...f,
      name:  prop.hostName  || f.name,
      email: prop.hostEmail || f.email,
      phone: prop.hostPhone || f.phone,
      propertyAccess: f.propertyAccess.includes(prop.id)
        ? f.propertyAccess
        : [...f.propertyAccess, prop.id],
    }));
  };

  // ── File upload → base64 ─────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({ ...f, avatarUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // ── Shared form ──────────────────────────────────────────────────────────────
  const renderForm = (onSave: () => void, saveLabel: string, isAdding: boolean) => (
    <div className="modal-body" style={{ display: 'grid', gap: '16px' }}>

      {/* Name */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
          Nombre Completo <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <input
          style={{ ...inp, borderColor: errors.name ? '#EF4444' : 'var(--border-color)' }}
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Juan Pérez"
        />
        {errors.name && <span style={{ color: '#EF4444', fontSize: '12px' }}>{errors.name}</span>}
      </div>

      {/* Email + Phone */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            Email <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="email"
            style={{ ...inp, borderColor: errors.email ? '#EF4444' : 'var(--border-color)' }}
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="juan@ejemplo.com"
          />
          {errors.email && <span style={{ color: '#EF4444', fontSize: '12px' }}>{errors.email}</span>}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Teléfono</label>
          <input
            style={inp}
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="555-1234"
          />
        </div>
      </div>

      {/* Role + Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Rol</label>
          <select
            style={inp}
            value={form.role}
            onChange={e => {
              const r = e.target.value as UserRole;
              setForm(f => ({ ...f, role: r }));
              if (r !== 'host') setPreloadPropertyId('');
            }}
          >
            <option value="admin">Administrador</option>
            <option value="manager">Gerente</option>
            <option value="host">Anfitrión</option>
            <option value="cleaning_staff">Personal de Limpieza</option>
            <option value="maintenance_staff">Personal de Mantenimiento</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Estado</label>
          <select style={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Pre-load from property — only when role=host and in add modal */}
      {isAdding && form.role === 'host' && properties.length > 0 && (
        <div style={{ background: 'rgba(0, 166, 153, 0.06)', border: '1.5px solid rgba(0, 166, 153, 0.25)', borderRadius: '10px', padding: '14px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#00A699' }}>
            Pre-cargar datos desde propiedad existente
          </label>
          <select
            style={{ ...inp, borderColor: 'rgba(0, 166, 153, 0.4)' }}
            value={preloadPropertyId}
            onChange={e => handlePreloadFromProperty(e.target.value)}
          >
            <option value="">— Seleccionar propiedad (opcional) —</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name} — {p.hostName}</option>
            ))}
          </select>
          {preloadPropertyId && (
            <p style={{ fontSize: '12px', color: '#00A699', marginTop: '6px' }}>
              ✓ Nombre, email y teléfono del anfitrión pre-cargados. Puedes editarlos antes de guardar.
            </p>
          )}
        </div>
      )}

      {/* Property access */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Acceso a Propiedades</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--bg-color)', padding: '12px', borderRadius: '8px' }}>
          {properties.map(p => (
            <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.propertyAccess.includes(p.id)}
                onChange={() => handleToggleAccess(p.id)}
              />
              {p.name}
            </label>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Sin selección = acceso a todas las propiedades
        </p>
      </div>

      {/* ── Photo field ──────────────────────────────────────────────────────── */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
          Foto de Perfil
        </label>

        {/* Current avatar preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
          <img
            src={form.avatarUrl.trim() || fallbackAvatar(form.name)}
            alt="Avatar"
            onError={e => { (e.currentTarget as HTMLImageElement).src = fallbackAvatar(form.name); }}
            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)', flexShrink: 0 }}
          />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {form.avatarUrl.trim() ? 'Foto personalizada activa' : 'Usando avatar con iniciales'}
          </span>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', border: '1.5px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
          <button
            type="button"
            onClick={() => setAvatarPhotoMode('url')}
            style={{
              flex: 1, padding: '7px 0', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
              background: avatarPhotoMode === 'url' ? 'var(--primary)' : 'white',
              color: avatarPhotoMode === 'url' ? 'white' : 'var(--text-muted)',
            }}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setAvatarPhotoMode('upload')}
            style={{
              flex: 1, padding: '7px 0', border: 'none', borderLeft: '1.5px solid var(--border-color)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
              background: avatarPhotoMode === 'upload' ? 'var(--primary)' : 'white',
              color: avatarPhotoMode === 'upload' ? 'white' : 'var(--text-muted)',
            }}
          >
            Subir archivo
          </button>
        </div>

        {/* URL input */}
        {avatarPhotoMode === 'url' && (
          <input
            style={inp}
            value={form.avatarUrl}
            onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))}
            placeholder="https://ejemplo.com/foto.jpg"
          />
        )}

        {/* File upload */}
        {avatarPhotoMode === 'upload' && (
          <div>
            <input
              type="file"
              accept="image/*"
              id="avatar-upload-input"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <label
              htmlFor="avatar-upload-input"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '10px 16px', width: '100%', boxSizing: 'border-box',
                border: '1.5px dashed var(--border-color)', borderRadius: '10px',
                cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)',
                background: 'var(--bg-color)',
              }}
            >
              📎 Clic para seleccionar imagen
            </label>
            {form.avatarUrl.startsWith('data:') && (
              <p style={{ fontSize: '12px', color: 'var(--success)', marginTop: '6px' }}>
                ✓ Imagen cargada correctamente
              </p>
            )}
          </div>
        )}

        {/* Clear photo button */}
        {form.avatarUrl.trim() && (
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, avatarUrl: '' }))}
            style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            × Quitar foto (usar iniciales)
          </button>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
        <button
          onClick={closeModals}
          style={{ background: 'none', border: '1.5px solid var(--border-color)', borderRadius: '10px', padding: '9px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'inherit' }}
        >
          Cancelar
        </button>
        <button
          onClick={onSave}
          style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', padding: '9px 22px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'inherit' }}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Gestión de Usuarios</h2>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={20} />
          Agregar Usuario
        </button>
      </div>

      <div className="property-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Filter size={18} color="var(--text-muted)" />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
          >
            <option value="all">Todos los Roles</option>
            <option value="admin">Administrador</option>
            <option value="manager">Gerente</option>
            <option value="host">Anfitrión</option>
            <option value="cleaning_staff">Limpieza</option>
            <option value="maintenance_staff">Mantenimiento</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Usuario</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Contacto</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Rol</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Propiedades</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Estado</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={user.avatarUrl || fallbackAvatar(user.name)}
                        alt={user.name}
                        onError={e => { (e.currentTarget as HTMLImageElement).src = fallbackAvatar(user.name); }}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ fontWeight: 600 }}>{user.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div>{user.email}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{user.phone || '-'}</div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      background: roleDisplay[user.role].bg,
                      color: roleDisplay[user.role].color,
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                    }}>
                      {roleDisplay[user.role].label}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                    {user.propertyAccess.length === 0 ? 'Todas' : `${user.propertyAccess.length} asignadas`}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ color: user.status === 'active' ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => openEdit(user)}
                      style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginRight: '12px' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        toggleUserStatus(user.id);
                        toast.success(`${user.name} ${user.status === 'active' ? 'desactivado' : 'activado'}`);
                      }}
                      style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      {user.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal — Agregar Usuario */}
      {addModalOpen && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Agregar Usuario</h3>
              <button className="modal-close" onClick={closeModals}><X size={24} /></button>
            </div>
            {renderForm(handleSaveAdd, 'Guardar Usuario', true)}
          </div>
        </div>
      )}

      {/* Modal — Editar Usuario */}
      {editingUser && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Editar Usuario</h3>
              <button className="modal-close" onClick={closeModals}><X size={24} /></button>
            </div>
            {renderForm(handleSaveEdit, 'Guardar Cambios', false)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
