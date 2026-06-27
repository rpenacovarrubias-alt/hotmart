import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Home, CalendarCheck, Wallet, Package, Users, BarChart3, TrendingUp, Trash2, Pencil, BookOpen, Rocket, Calculator, BookCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../hooks/usePermissions';
import UserSwitcher from './UserSwitcher';

const NAV_ITEMS = [
  { to: '/',                        label: 'Dashboard',          icon: LayoutDashboard, end: true  },
  { to: '/propiedades',             label: 'Mis Propiedades',    icon: Home             },
  { to: '/tareas',                  label: 'Limpieza y Mant.',   icon: CalendarCheck    },
  { to: '/finanzas',                label: 'Finanzas',           icon: Wallet           },
  { to: '/inventario',              label: 'Inventario',         icon: Package          },
  { to: '/reportes',                label: 'Reportes',           icon: BarChart3        },
  { to: '/usuarios',                label: 'Gestión de Usuarios',icon: Users            },
  { to: '/control-administrativo',  label: 'Control Admin',      icon: TrendingUp       },
  { to: '/guias',                   label: 'Guías de Propiedad', icon: BookOpen          },
];

const Sidebar = () => {
  const { openDeleteModal, openEditModal } = useApp();
  const { visibleRoutes, canCreate, canDelete } = usePermissions();

  const showEdit   = canCreate('tasks') || canCreate('expenses') || canCreate('stays');
  const showDelete = canDelete('tasks') || canDelete('expenses') || canDelete('stays');

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>
          <Home size={24} />
          CoHost Admin
        </h1>
      </div>

      <UserSwitcher />

      <nav className="sidebar-nav" style={{ marginTop: 8 }}>
        {NAV_ITEMS
          .filter(item => visibleRoutes.includes(item.to))
          .map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            >
              <Icon size={20} /> {label}
            </NavLink>
          ))}

        {/* Public landings — always visible */}
        <div className="nav-separator" />
        <NavLink
          to="/landing"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          style={{ color: '#F97316', fontWeight: 700 }}
        >
          <Rocket size={20} /> Landing Dueños
        </NavLink>
        <NavLink
          to="/anfitriones"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          style={{ color: '#F97316', fontWeight: 700 }}
        >
          <Rocket size={20} /> Landing Anfitriones
        </NavLink>
        <NavLink
          to="/calculadora-precio"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          style={{ color: '#FF5A5F', fontWeight: 700 }}
        >
          <Calculator size={20} /> Calculadora de Precio
        </NavLink>
        <NavLink
          to="/manual-limpieza"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          style={{ color: '#0f3460', fontWeight: 700 }}
        >
          <BookCheck size={20} /> Manual de Limpieza
        </NavLink>

        {(showEdit || showDelete) && (
          <>
            <div className="nav-separator" />
            <div style={{
              padding: '4px 16px 6px',
              fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.8px', color: 'var(--text-muted)', opacity: 0.55,
            }}>
              Herramientas
            </div>
            {showEdit && (
              <button className="nav-edit" onClick={() => openEditModal()}>
                <Pencil size={18} />
                Editar Registro
              </button>
            )}
            {showDelete && (
              <button className="nav-delete" onClick={() => openDeleteModal()}>
                <Trash2 size={18} />
                Eliminar Registro
              </button>
            )}
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
