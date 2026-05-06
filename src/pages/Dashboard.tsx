import { useState, useMemo } from 'react';
import { Building, ClipboardList, Wallet, Users as UsersIcon, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import { mockUsers } from '../data/mockData';
import { useApp } from '../context/AppContext';

const SHORT: Record<string, string> = {
  'Casa Grande Puerta Real': 'Puerta Real',
  'Departamento Laurel': 'Laurel',
  'Loft Sonterra': 'Sonterra',
  'Avanta Hotel & Villas': 'Avanta H&V',
  'Casa de la Puerta Azul': 'Pta. Azul',
  'Casa Mora': 'Casa Mora',
  'Casa Quintas del Bosque': 'Quintas',
  'Kenza': 'Kenza',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n);

const marginColor = (m: number) => (m >= 80 ? '#00A699' : m >= 70 ? '#FC642D' : '#FF5A5F');

type DashPeriod = 'mes' | 'trimestre' | 'custom';

const Dashboard = () => {
  const { properties, tasks, expenses, adminRecords } = useApp();

  const pendingTasks  = tasks.filter(t => t.status !== 'Completado').length;
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const [dashPeriod, setDashPeriod] = useState<DashPeriod>('mes');
  const [customMonth, setCustomMonth] = useState('Mayo 2026');

  const adminData = useMemo(() => {
    if (dashPeriod === 'trimestre') return adminRecords;
    const target = dashPeriod === 'custom' ? customMonth : 'Mayo 2026';
    return adminRecords.filter(r => r.period === target);
  }, [dashPeriod, customMonth, adminRecords]);

  const totalIncome = adminData.reduce((s, r) => s + r.airbnb_income, 0);
  const totalCost   = adminData.reduce((s, r) => s + r.total_cost, 0);
  const totalProfit = adminData.reduce((s, r) => s + r.profit, 0);
  const avgMargin   = totalIncome > 0 ? Math.round((totalProfit / totalIncome) * 1000) / 10 : 0;

  const barData = useMemo(() => {
    const map = new Map<string, { name: string; Ingresos: number; Costos: number; Utilidad: number }>();
    adminData.forEach(r => {
      const e = map.get(r.property_id) ?? { name: SHORT[r.property_name] ?? r.property_name, Ingresos: 0, Costos: 0, Utilidad: 0 };
      map.set(r.property_id, { name: e.name, Ingresos: e.Ingresos + r.airbnb_income, Costos: e.Costos + r.total_cost, Utilidad: e.Utilidad + r.profit });
    });
    return Array.from(map.values());
  }, [adminData]);

  const marginData = useMemo(() => {
    const map = new Map<string, { name: string; income: number; profit: number }>();
    adminData.forEach(r => {
      const e = map.get(r.property_id) ?? { name: SHORT[r.property_name] ?? r.property_name, income: 0, profit: 0 };
      map.set(r.property_id, { name: e.name, income: e.income + r.airbnb_income, profit: e.profit + r.profit });
    });
    return Array.from(map.values())
      .map(p => ({ name: p.name, Margen: p.income > 0 ? Math.round((p.profit / p.income) * 1000) / 10 : 0 }))
      .sort((a, b) => b.Margen - a.Margen);
  }, [adminData]);

  const periodBtnStyle = (active: boolean, color = '#6B5BFF') => ({
    padding: '5px 13px',
    borderRadius: '20px',
    border: '1.5px solid',
    borderColor: active ? color : '#ddd',
    background: active ? color : 'white',
    color: active ? 'white' : 'var(--text-main)',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500 as const,
  });

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Dashboard General</h2>
      </div>

      {/* Operational KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <div className="property-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 90, 95, 0.1)', color: 'var(--primary)', padding: '16px', borderRadius: '50%' }}>
            <Building size={28} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>Propiedades</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{properties.length}</div>
          </div>
        </div>

        <div className="property-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(0, 166, 153, 0.1)', color: 'var(--success)', padding: '16px', borderRadius: '50%' }}>
            <ClipboardList size={28} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>Tareas Pendientes</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{pendingTasks}</div>
          </div>
        </div>

        <div className="property-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(252, 100, 45, 0.1)', color: 'var(--warning)', padding: '16px', borderRadius: '50%' }}>
            <Wallet size={28} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>Gastos (Mes)</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>${totalExpenses.toLocaleString('es-MX')}</div>
          </div>
        </div>

        <div className="property-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(34, 34, 34, 0.1)', color: 'var(--text-main)', padding: '16px', borderRadius: '50%' }}>
            <UsersIcon size={28} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>Usuarios</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{mockUsers.length}</div>
          </div>
        </div>
      </div>

      {/* ─── Control Administrativo — RPC Consulting ─── */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(107, 91, 255, 0.12)', color: '#6B5BFF', padding: '9px', borderRadius: '10px' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Control Administrativo — RPC Consulting</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Vista gerencial · Ricardo Peña Covarrubias · 442 131 4203</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setDashPeriod('mes')} style={periodBtnStyle(dashPeriod === 'mes')}>Este mes</button>
            <button onClick={() => setDashPeriod('trimestre')} style={periodBtnStyle(dashPeriod === 'trimestre')}>Este trimestre</button>
            <button onClick={() => setDashPeriod('custom')} style={periodBtnStyle(dashPeriod === 'custom')}>Personalizado</button>
            {dashPeriod === 'custom' && (
              <select
                value={customMonth}
                onChange={e => setCustomMonth(e.target.value)}
                style={{ padding: '5px 10px', borderRadius: '8px', border: '1.5px solid #ddd', fontSize: '12px', cursor: 'pointer' }}
              >
                <option>Marzo 2026</option>
                <option>Abril 2026</option>
                <option>Mayo 2026</option>
              </select>
            )}
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="property-card" style={{ padding: '20px', borderLeft: '4px solid var(--success)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>💰 Ingresos Totales</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--success)' }}>{fmt(totalIncome)}</div>
          </div>
          <div className="property-card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>📉 Costos Totales</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)' }}>{fmt(totalCost)}</div>
          </div>
          <div className="property-card" style={{ padding: '20px', borderLeft: '4px solid #6B5BFF' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>✅ Utilidad Neta</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#6B5BFF' }}>{fmt(totalProfit)}</div>
          </div>
          <div className="property-card" style={{ padding: '20px', borderLeft: `4px solid ${marginColor(avgMargin)}` }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>📊 Margen Neto %</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: marginColor(avgMargin) }}>{avgMargin.toFixed(1)}%</div>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="property-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '14px' }}>Ingresos · Costos · Utilidad por Propiedad</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 4, right: 10, left: 0, bottom: 58 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" angle={-38} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Ingresos" fill="#00A699" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Costos"   fill="#FF5A5F" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Utilidad" fill="#6B5BFF" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="property-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '14px' }}>% Margen por Propiedad (orden desc.)</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={marginData} layout="vertical" margin={{ top: 4, right: 40, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={72} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="Margen" radius={[0, 3, 3, 0]}>
                  {marginData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.Margen >= 80 ? '#00A699' : '#FC642D'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '14px', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', justifyContent: 'center' }}>
              <span><span style={{ display: 'inline-block', width: 9, height: 9, background: '#00A699', borderRadius: 2, marginRight: 4 }} />≥ 80%</span>
              <span><span style={{ display: 'inline-block', width: 9, height: 9, background: '#FC642D', borderRadius: 2, marginRight: 4 }} />{'< 80%'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
