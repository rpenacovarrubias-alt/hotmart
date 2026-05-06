import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Home, CalendarCheck, Wallet, Package, Users, BarChart3, TrendingUp, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Sidebar = () => {
  const { openDeleteModal } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>
          <Home size={24} />
          CoHost Admin
        </h1>
      </div>
      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink
          to="/propiedades"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Home size={20} />
          Mis Propiedades
        </NavLink>
        <NavLink
          to="/tareas"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <CalendarCheck size={20} />
          Limpieza y Mant.
        </NavLink>
        <NavLink
          to="/finanzas"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Wallet size={20} />
          Finanzas
        </NavLink>
        <NavLink
          to="/inventario"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Package size={20} />
          Inventario
        </NavLink>
        <NavLink
          to="/reportes"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <BarChart3 size={20} />
          Reportes
        </NavLink>
        <NavLink
          to="/usuarios"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <Users size={20} />
          Gestión de Usuarios
        </NavLink>
        <NavLink
          to="/control-administrativo"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <TrendingUp size={20} />
          Control Admin
        </NavLink>

        {/* ── Delete separator + button ─────────────────── */}
        <div className="nav-separator" />
        <button
          className="nav-delete"
          onClick={() => openDeleteModal()}
        >
          <Trash2 size={20} />
          Eliminar Registro
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
