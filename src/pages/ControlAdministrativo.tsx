import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent, Download, FileText } from 'lucide-react';
import { mockAdminControl } from '../data/mockData';
import type { AdminControlRecord } from '../types';

const PERIODS = ['Marzo 2026', 'Abril 2026', 'Mayo 2026', 'Trimestre Completo'];
const TABS = ['Ingresos por Propiedad', 'Resumen de Rendimiento', 'Análisis Gráfico'];
const PROP_COLORS = ['#FF5A5F', '#00A699', '#FC642D', '#6B5BFF', '#00C49F', '#FFBB28', '#a78bfa', '#4ECDC4'];
const MEDALS = ['🥇', '🥈', '🥉'];

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

const marginBadge = (m: number) => (
  <span style={{
    background: marginColor(m) + '22',
    color: marginColor(m),
    padding: '2px 9px',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '12px',
    whiteSpace: 'nowrap',
  }}>
    {m.toFixed(1)}%
  </span>
);

const exportCSV = (data: AdminControlRecord[], period: string) => {
  const headers = ['Propiedad', 'Período', 'Ingreso Airbnb', 'Limpieza', 'Comisión Airbnb (13%)', 'Costo Total', 'Utilidad', '% Margen'];
  const rows = data.map(r => [
    `"${r.property_name}"`, r.period,
    r.airbnb_income, r.cleaning_cost, r.airbnb_commission,
    r.total_cost, r.profit, `${r.margin_percent}%`,
  ]);
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `control-admin-${period.replace(/\s/g, '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const KpiCard = ({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: React.ReactNode }) => (
  <div className="property-card" style={{ padding: '22px', borderLeft: `4px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '6px' }}>{label}</div>
        <div style={{ fontSize: '24px', fontWeight: 700, color }}>{value}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>{sub}</div>
      </div>
      <div style={{ background: color + '18', color, padding: '10px', borderRadius: '10px' }}>{icon}</div>
    </div>
  </div>
);

const ControlAdministrativo = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [period, setPeriod] = useState('Mayo 2026');

  const data = useMemo(
    () => period === 'Trimestre Completo' ? mockAdminControl : mockAdminControl.filter(r => r.period === period),
    [period]
  );

  const totals = useMemo(() => {
    const inc = data.reduce((s, r) => s + r.airbnb_income, 0);
    const cln = data.reduce((s, r) => s + r.cleaning_cost, 0);
    const com = data.reduce((s, r) => s + r.airbnb_commission, 0);
    const cst = data.reduce((s, r) => s + r.total_cost, 0);
    const prf = data.reduce((s, r) => s + r.profit, 0);
    const mrg = inc > 0 ? Math.round((prf / inc) * 1000) / 10 : 0;
    return { inc, cln, com, cst, prf, mrg };
  }, [data]);

  const byProp = useMemo(() => {
    const map = new Map<string, { name: string; inc: number; cst: number; prf: number; cln: number; com: number }>();
    data.forEach(r => {
      const e = map.get(r.property_id) ?? { name: r.property_name, inc: 0, cst: 0, prf: 0, cln: 0, com: 0 };
      map.set(r.property_id, {
        name: r.property_name,
        inc: e.inc + r.airbnb_income,
        cst: e.cst + r.total_cost,
        prf: e.prf + r.profit,
        cln: e.cln + r.cleaning_cost,
        com: e.com + r.airbnb_commission,
      });
    });
    return Array.from(map.values()).map(p => ({
      ...p,
      short: SHORT[p.name] ?? p.name.substring(0, 10),
      margin: p.inc > 0 ? Math.round((p.prf / p.inc) * 1000) / 10 : 0,
    }));
  }, [data]);

  const barChartData = byProp.map(p => ({
    name: p.short,
    Ingresos: p.inc,
    Costos: p.cst,
    Utilidad: p.prf,
  }));

  const lineData = ['Marzo 2026', 'Abril 2026', 'Mayo 2026'].map(pd => ({
    mes: pd.split(' ')[0],
    Ingresos: mockAdminControl.filter(r => r.period === pd).reduce((s, r) => s + r.airbnb_income, 0),
  }));

  const pieData = byProp.map(p => ({ name: p.short, value: p.prf }));
  const ranked = [...byProp].sort((a, b) => b.prf - a.prf);
  const marginSorted = [...byProp].sort((a, b) => b.margin - a.margin).map(p => ({
    name: p.short,
    Margen: p.margin,
  }));

  const btnStyle = (active: boolean) => ({
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1.5px solid',
    borderColor: active ? 'var(--primary)' : '#ddd',
    background: active ? 'var(--primary)' : 'white',
    color: active ? 'white' : 'var(--text-main)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500 as const,
  });

  const tabStyle = (active: boolean) => ({
    padding: '10px 22px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: active ? 700 : 400,
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
    marginBottom: '-2px',
  } as const);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Control Administrativo</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
            RPC Consulting · Vista Gerencial · Ricardo Peña Covarrubias · 442 185 1478
          </p>
        </div>
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>Período:</span>
        {PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={btnStyle(period === p)}>{p}</button>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '28px' }}>
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} style={tabStyle(activeTab === i)}>{tab}</button>
        ))}
      </div>

      {/* ─── TAB A — Ingresos por Propiedad ─── */}
      {activeTab === 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '16px' }}>
            <button
              onClick={() => exportCSV(data, period)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1.5px solid var(--success)', background: 'white', color: 'var(--success)', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
            >
              <Download size={14} /> Exportar Excel
            </button>
            <button
              onClick={() => window.print()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1.5px solid var(--primary)', background: 'white', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
            >
              <FileText size={14} /> Exportar PDF
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8f8f8' }}>
                  {['Propiedad', 'Período', 'Monto Pagado Airbnb', 'Limpieza', 'Comisión Airbnb (13%)', 'Costo Total', 'Utilidad', '% Margen'].map(h => (
                    <th key={h} style={{ padding: '12px 10px', textAlign: h === 'Propiedad' || h === 'Período' ? 'left' : 'right', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '2px solid #eee' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((r, idx) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '10px', fontWeight: 500 }}>{r.property_name}</td>
                    <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{r.period}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>{fmt(r.airbnb_income)}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: 'var(--primary)' }}>{fmt(r.cleaning_cost)}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: 'var(--primary)' }}>{fmt(r.airbnb_commission)}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>{fmt(r.total_cost)}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: 'var(--success)', fontWeight: 700 }}>{fmt(r.profit)}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>{marginBadge(r.margin_percent)}</td>
                  </tr>
                ))}
                <tr style={{ background: '#f0faf9', borderTop: '2px solid var(--success)' }}>
                  <td colSpan={2} style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--success)' }}>TOTALES</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{fmt(totals.inc)}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 700 }}>{fmt(totals.cln)}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 700 }}>{fmt(totals.com)}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 700 }}>{fmt(totals.cst)}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>{fmt(totals.prf)}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>{marginBadge(totals.mrg)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB B — Resumen de Rendimiento ─── */}
      {activeTab === 1 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            <KpiCard label="💰 Ingresos Totales" value={fmt(totals.inc)} sub="Airbnb bruto del período" color="var(--success)" icon={<TrendingUp size={18} />} />
            <KpiCard label="📉 Costos Totales" value={fmt(totals.cst)} sub="Limpieza + Comisión Airbnb" color="var(--primary)" icon={<TrendingDown size={18} />} />
            <KpiCard label="✅ Utilidad Neta" value={fmt(totals.prf)} sub="Ingresos − Costos Totales" color="#6B5BFF" icon={<DollarSign size={18} />} />
            <KpiCard label="📊 Margen Neto" value={`${totals.mrg.toFixed(1)}%`} sub="Promedio ponderado" color={marginColor(totals.mrg)} icon={<Percent size={18} />} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Detalle por Propiedad</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8f8f8' }}>
                      {['Propiedad', 'Ingresos', 'Costos', 'Utilidad', '% Margen'].map(h => (
                        <th key={h} style={{ padding: '10px 8px', textAlign: h === 'Propiedad' ? 'left' : 'right', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '2px solid #eee', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {byProp.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '9px 8px', fontWeight: 500, fontSize: '12px' }}>{SHORT[p.name] ?? p.name}</td>
                        <td style={{ padding: '9px 8px', textAlign: 'right', color: 'var(--success)' }}>{fmt(p.inc)}</td>
                        <td style={{ padding: '9px 8px', textAlign: 'right', color: 'var(--primary)' }}>{fmt(p.cst)}</td>
                        <td style={{ padding: '9px 8px', textAlign: 'right', fontWeight: 700 }}>{fmt(p.prf)}</td>
                        <td style={{ padding: '9px 8px', textAlign: 'right' }}>{marginBadge(p.margin)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Distribución de Utilidad</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" outerRadius={100} dataKey="value" labelLine={false}>
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={PROP_COLORS[idx % PROP_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v as number)} />
                  <Legend
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => <span style={{ fontSize: '11px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB C — Análisis Gráfico ─── */}
      {activeTab === 2 && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: 'white', borderRadius: '12px', padding: '20px 28px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '19px', fontWeight: 700, marginBottom: '4px' }}>RPC Consulting</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Consultoría Hotelería &amp; Turismo con IA</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '13px', opacity: 0.9 }}>
              <div style={{ fontWeight: 600 }}>Ricardo Peña Covarrubias</div>
              <div>442 185 1478</div>
            </div>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Comparativa por Propiedad — Ingresos · Costos · Utilidad</h3>
          <div className="property-card" style={{ padding: '20px', marginBottom: '28px' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmt(v as number)} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Ingresos" fill="#00A699" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Costos"   fill="#FF5A5F" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Utilidad" fill="#6B5BFF" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Tendencia de Ingresos — Últimos 3 Meses</h3>
          <div className="property-card" style={{ padding: '20px', marginBottom: '28px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmt(v as number)} />
                <Line type="monotone" dataKey="Ingresos" stroke="#00A699" strokeWidth={2.5} dot={{ r: 5, fill: '#00A699' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Ranking de Propiedades por Utilidad Generada</h3>
          <div className="property-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8f8f8' }}>
                  {['#', 'Propiedad', 'Ingresos', 'Costos', 'Utilidad', '% Margen'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Propiedad' || h === '#' ? 'left' : 'right', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '2px solid #eee' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ranked.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i < 3 ? PROP_COLORS[i] + '0a' : 'white' }}>
                    <td style={{ padding: '12px 16px', fontSize: '20px', lineHeight: 1 }}>{MEDALS[i] ?? i + 1}</td>
                    <td style={{ padding: '12px 16px', fontWeight: i < 3 ? 700 : 500 }}>{p.name}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--success)' }}>{fmt(p.inc)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--primary)' }}>{fmt(p.cst)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>{fmt(p.prf)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>{marginBadge(p.margin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '28px 0 12px' }}>% Margen por Propiedad</h3>
          <div className="property-card" style={{ padding: '20px' }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={marginSorted} layout="vertical" margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={75} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="Margen" radius={[0, 4, 4, 0]}>
                  {marginSorted.map((entry, idx) => (
                    <Cell key={idx} fill={entry.Margen >= 80 ? '#00A699' : '#FC642D'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', justifyContent: 'center' }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#00A699', borderRadius: 2, marginRight: 4 }} />≥ 80% — Meta alcanzada</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#FC642D', borderRadius: 2, marginRight: 4 }} />{'< 80%'} — Optimizable</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlAdministrativo;
