import { useState } from 'react';
import { Plus, Filter, X } from 'lucide-react';
import { mockUsers, mockProperties } from '../data/mockData';
import type { AppUser } from '../types';

const roleDisplay: Record<string, { label: string, color: string, bg: string }> = {
  admin: { label: 'Administrador', color: '#FFFFFF', bg: '#222222' },
  manager: { label: 'Gerente', color: '#FFFFFF', bg: '#4A4A4A' },
  host: { label: 'Anfitrión', color: '#00A699', bg: 'rgba(0, 166, 153, 0.1)' },
  cleaning_staff: { label: 'Limpieza', color: '#FC642D', bg: 'rgba(252, 100, 45, 0.1)' },
  maintenance_staff: { label: 'Mantenimiento', color: '#FF5A5F', bg: 'rgba(255, 90, 95, 0.1)' }
};

const Team = () => {
  const [users] = useState<AppUser[]>(mockUsers);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredUsers = roleFilter === 'all' ? users : users.filter(u => u.role === roleFilter);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Gestión de Usuarios</h2>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Agregar Usuario
        </button>
      </div>

      <div className="property-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Filter size={18} color="var(--text-muted)" />
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
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
                      <img src={user.avatarUrl} alt={user.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
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
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      fontWeight: 600
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
                    <button style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginRight: '12px' }}>Editar</button>
                    <button style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Desactivar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Agregar Usuario</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gap: '20px' }}>
              <div className="form-group"><label className="form-label">Nombre Completo</label><input type="text" className="form-input" placeholder="Juan Pérez" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" placeholder="juan@ejemplo.com" /></div>
                <div className="form-group"><label className="form-label">Teléfono</label><input type="text" className="form-input" placeholder="555-1234" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group"><label className="form-label">Contraseña Temporal</label><input type="text" className="form-input" placeholder="Temp1234!" /></div>
                <div className="form-group">
                  <label className="form-label">Rol</label>
                  <select className="form-input">
                    <option value="admin">Administrador</option>
                    <option value="manager">Gerente</option>
                    <option value="host">Anfitrión</option>
                    <option value="cleaning_staff">Personal de Limpieza</option>
                    <option value="maintenance_staff">Personal de Mantenimiento</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="form-label">Acceso a Propiedades</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-color)', padding: '16px', borderRadius: '8px' }}>
                  {mockProperties.map(p => (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <input type="checkbox" /> {p.name}
                    </label>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button className="btn-primary" onClick={() => setIsModalOpen(false)}>Guardar Usuario</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
