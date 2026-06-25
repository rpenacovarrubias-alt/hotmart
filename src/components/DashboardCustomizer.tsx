import { useState } from 'react';
import { X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../hooks/usePermissions';
import type { DashboardWidget } from '../types';

const WIDGET_LABELS: Record<DashboardWidget, string> = {
  kpi_properties: 'Tarjeta — Total Propiedades',
  kpi_tasks:      'Tarjeta — Tareas Pendientes',
  kpi_expenses:   'Tarjeta — Gastos del Mes',
  kpi_users:      'Tarjeta — Usuarios Activos',
  chart_income:   'Gráfica — Ingresos · Costos · Utilidad',
  chart_costs:    'Gráfica — Margen por Propiedad',
  chart_margin:   'Gráfica — Análisis de Margen',
  table_tasks:    'Tabla — Tareas Recientes',
  table_stays:    'Tabla — Estancias Recientes',
};

const WIDGET_GROUPS: { label: string; widgets: DashboardWidget[] }[] = [
  {
    label: 'Tarjetas KPI',
    widgets: ['kpi_properties', 'kpi_tasks', 'kpi_expenses', 'kpi_users'],
  },
  {
    label: 'Gráficas',
    widgets: ['chart_income', 'chart_costs', 'chart_margin'],
  },
  {
    label: 'Tablas',
    widgets: ['table_tasks', 'table_stays'],
  },
];

interface Props {
  onClose: () => void;
}

const DashboardCustomizer = ({ onClose }: Props) => {
  const { currentUser, setCurrentUser } = useAuth();
  const { updateUser } = useApp();
  const { availableWidgets, activeWidgets } = usePermissions();

  const [selected, setSelected] = useState<Set<DashboardWidget>>(
    new Set(activeWidgets)
  );

  const toggle = (widget: DashboardWidget) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(widget)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(widget);
      } else {
        next.add(widget);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!currentUser) return;
    const widgets = Array.from(selected);
    const updated = { ...currentUser, dashboardWidgets: widgets };
    updateUser(updated);
    setCurrentUser(updated);
    onClose();
  };

  const handleReset = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, dashboardWidgets: undefined };
    updateUser(updated);
    setCurrentUser(updated);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          zIndex: 1000, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '340px',
        background: 'white', zIndex: 1001, boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.2s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LayoutDashboard size={20} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: '16px' }}>Personalizar Dashboard</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
            Selecciona los widgets que quieres ver en tu dashboard. Requiere al menos uno activo.
          </p>

          {WIDGET_GROUPS.map(group => {
            const available = group.widgets.filter(w => availableWidgets.includes(w));
            if (available.length === 0) return null;
            return (
              <div key={group.label} style={{ marginBottom: '24px' }}>
                <div style={{
                  fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px',
                }}>
                  {group.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {available.map(widget => {
                    const on = selected.has(widget);
                    return (
                      <label
                        key={widget}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                          border: `1.5px solid ${on ? 'var(--primary)' : 'var(--border-color)'}`,
                          background: on ? 'rgba(255, 90, 95, 0.05)' : 'transparent',
                          transition: 'all 0.15s',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggle(widget)}
                          style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: on ? 600 : 400 }}>
                          {WIDGET_LABELS[widget]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--border-color)',
          display: 'flex', gap: '10px',
        }}>
          <button
            onClick={handleReset}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border-color)',
              background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              color: 'var(--text-muted)', fontFamily: 'inherit',
            }}
          >
            Restablecer
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 2, padding: '10px', borderRadius: '10px', border: 'none',
              background: 'var(--primary)', color: 'white', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
            }}
          >
            Guardar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default DashboardCustomizer;
