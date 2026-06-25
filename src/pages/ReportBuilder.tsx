import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { ChevronLeft, ChevronRight, Download, FileText, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../hooks/usePermissions';
import { downloadCustomReportPDF, downloadCustomReportExcel } from '../utils/downloadReport';
import type { ReportMetric, ReportRow, ReportConfig } from '../types';

// ── Metric catalogue ──────────────────────────────────────────────────────────
const METRICS: ReportMetric[] = [
  { key: 'airbnb_income',      label: 'Ingresos Brutos',        category: 'Ingresos'    },
  { key: 'profit',             label: 'Ingresos Netos',         category: 'Ingresos'    },
  { key: 'margin_percent',     label: 'Margen %',               category: 'Ingresos',  isPercent: true },
  { key: 'total_cost',         label: 'Total Egresos',          category: 'Egresos'     },
  { key: 'cleaning_cost',      label: 'Gastos Limpieza',        category: 'Gastos'      },
  { key: 'airbnb_commission',  label: 'Comisión Airbnb',        category: 'Comisiones'  },
  { key: 'tax_estimate',       label: 'Impuesto Estimado',      category: 'Impuestos'   },
  { key: 'isr_estimate',       label: 'ISR Estimado',           category: 'Impuestos'   },
  { key: 'utilidad_bruta',     label: 'Utilidad Bruta',         category: 'Utilidad'    },
  { key: 'profit',             label: 'Utilidad Neta',          category: 'Utilidad'    },
];

const UNIQUE_METRICS: ReportMetric[] = Array.from(
  new Map(METRICS.map(m => [m.key + m.label, m])).values()
);

const CATEGORIES = Array.from(new Set(METRICS.map(m => m.category)));

const VIZ_TYPES = [
  { id: 'table', label: 'Tabla',  icon: '📋' },
  { id: 'bar',   label: 'Barras', icon: '📊' },
  { id: 'line',  label: 'Líneas', icon: '📈' },
  { id: 'pie',   label: 'Pastel', icon: '🥧' },
] as const;

const PERIODS = [
  { id: 'mes_actual',  label: 'Mes Actual'    },
  { id: 'trimestre',   label: 'Trimestre'     },
  { id: 'anio',        label: 'Año Completo'  },
  { id: 'personalizado', label: 'Personalizado' },
];

const PIE_COLORS = ['#FF5A5F', '#00A699', '#FC642D', '#6B5BFF', '#FFB020', '#22C55E'];

const fmtMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n);

// ── Component ─────────────────────────────────────────────────────────────────
const ReportBuilder = () => {
  const { adminRecords, properties } = useApp();
  const { hasPropertyAccess } = usePermissions();
  const navigate = useNavigate();

  const accessibleProps = properties.filter(p => hasPropertyAccess(p.id));

  const [step, setStep]                   = useState(1);
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set(['airbnb_income', 'profit']));
  const [selectedProps, setSelectedProps]   = useState<Set<string>>(new Set());
  const [period, setPeriod]               = useState('mes_actual');
  const [customPeriod, setCustomPeriod]   = useState('');
  const [vizType, setVizType]             = useState<'table' | 'bar' | 'line' | 'pie'>('bar');

  const availableMonths = useMemo(() =>
    Array.from(new Set(adminRecords.map(r => r.period))), [adminRecords]);

  const periodLabel = useMemo(() => {
    if (period === 'mes_actual') return availableMonths[availableMonths.length - 1] ?? 'Mes actual';
    if (period === 'trimestre')  return 'Trimestre';
    if (period === 'anio')       return 'Año completo';
    return customPeriod || 'Período personalizado';
  }, [period, customPeriod, availableMonths]);

  const filteredRecords = useMemo(() => {
    let recs = adminRecords;
    if (selectedProps.size > 0) recs = recs.filter(r => selectedProps.has(r.property_id));
    else recs = recs.filter(r => hasPropertyAccess(r.property_id));
    if (period === 'mes_actual') {
      const target = availableMonths[availableMonths.length - 1];
      recs = recs.filter(r => r.period === target);
    } else if (period === 'personalizado' && customPeriod) {
      recs = recs.filter(r => r.period === customPeriod);
    }
    return recs;
  }, [adminRecords, selectedProps, period, customPeriod, availableMonths, hasPropertyAccess]);

  const reportRows: ReportRow[] = useMemo(() => {
    const map = new Map<string, ReportRow>();
    filteredRecords.forEach(r => {
      const existing = map.get(r.property_id) ?? {
        propertyId: r.property_id,
        propertyName: r.property_name,
      };
      const merged: ReportRow = {
        ...existing,
        airbnb_income:     ((existing.airbnb_income     as number) || 0) + r.airbnb_income,
        total_cost:        ((existing.total_cost        as number) || 0) + r.total_cost,
        cleaning_cost:     ((existing.cleaning_cost     as number) || 0) + r.cleaning_cost,
        airbnb_commission: ((existing.airbnb_commission as number) || 0) + r.airbnb_commission,
        profit:            ((existing.profit            as number) || 0) + r.profit,
        utilidad_bruta:    ((existing.airbnb_income     as number) || 0) + r.airbnb_income - ((existing.cleaning_cost as number) || 0) - r.cleaning_cost,
        tax_estimate:      Math.round(r.airbnb_income * 0.08),
        isr_estimate:      Math.round(r.airbnb_income * 0.012),
      };
      merged.margin_percent = merged.airbnb_income as number > 0
        ? Math.round(((merged.profit as number) / (merged.airbnb_income as number)) * 1000) / 10
        : 0;
      map.set(r.property_id, merged);
    });
    return Array.from(map.values());
  }, [filteredRecords]);

  const activeMetrics = UNIQUE_METRICS.filter(m => selectedMetrics.has(m.key + m.label) || selectedMetrics.has(m.key));

  const toggleMetric = (metric: ReportMetric) => {
    const key = metric.key + metric.label;
    setSelectedMetrics(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size === 1) return prev;
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const isMetricSelected = (m: ReportMetric) =>
    selectedMetrics.has(m.key + m.label) || selectedMetrics.has(m.key);

  const toggleProp = (id: string) => {
    setSelectedProps(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const reportConfig: ReportConfig = {
    selectedMetrics: activeMetrics,
    propertyIds: Array.from(selectedProps),
    propertyNames: Array.from(selectedProps).map(id => properties.find(p => p.id === id)?.name ?? id),
    periodLabel,
    vizType,
  };

  const handleDownloadPDF = () => downloadCustomReportPDF(reportConfig, reportRows);
  const handleDownloadExcel = () => downloadCustomReportExcel(reportConfig, reportRows);

  const stepStyle = (n: number): React.CSSProperties => ({
    width: '32px', height: '32px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '14px',
    background: step >= n ? 'var(--primary)' : 'var(--border-color)',
    color: step >= n ? 'white' : 'var(--text-muted)',
    flexShrink: 0,
  });

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
    border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border-color)'}`,
    background: active ? 'rgba(255,90,95,0.06)' : 'transparent',
    fontSize: '13px', fontWeight: active ? 600 : 400,
    fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px',
    color: active ? 'var(--primary)' : 'var(--text-main)',
    transition: 'all 0.15s',
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/reportes')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="page-title" style={{ margin: 0 }}>Constructor de Reportes</h2>
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', overflowX: 'auto' }}>
        {[1, 2, 3, 4].map((n, i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div style={stepStyle(n)}>
              {step > n ? '✓' : n}
            </div>
            <span style={{ fontSize: '13px', color: step >= n ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: step === n ? 600 : 400 }}>
              {['Métricas', 'Propiedades', 'Período', 'Visualización'][i]}
            </span>
            {i < 3 && <div style={{ width: '24px', height: '2px', background: step > n ? 'var(--primary)' : 'var(--border-color)', borderRadius: '1px' }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: wizard */}
        <div className="property-card" style={{ padding: '28px' }}>
          {/* Step 1: Metrics */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Paso 1: Selecciona métricas</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Elige qué datos incluir en el reporte.</p>
              {CATEGORIES.map(cat => (
                <div key={cat} style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                    {cat}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {UNIQUE_METRICS.filter(m => m.category === cat).map(metric => (
                      <button key={metric.key + metric.label} onClick={() => toggleMetric(metric)} style={pillStyle(isMetricSelected(metric))}>
                        {metric.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Properties */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Paso 2: Propiedades</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Sin selección = todas tus propiedades.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {accessibleProps.map(p => (
                  <label key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                    border: `1.5px solid ${selectedProps.has(p.id) ? 'var(--primary)' : 'var(--border-color)'}`,
                    background: selectedProps.has(p.id) ? 'rgba(255,90,95,0.05)' : 'transparent',
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedProps.has(p.id)}
                      onChange={() => toggleProp(p.id)}
                      style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: selectedProps.has(p.id) ? 600 : 400 }}>{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Period */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Paso 3: Período</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Selecciona el rango de tiempo.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {PERIODS.map(p => (
                  <button key={p.id} onClick={() => setPeriod(p.id)} style={pillStyle(period === p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
              {period === 'personalizado' && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Selecciona período:</label>
                  <select
                    className="form-input"
                    value={customPeriod}
                    onChange={e => setCustomPeriod(e.target.value)}
                  >
                    <option value="">-- Seleccionar --</option>
                    {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Visualization */}
          {step === 4 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Paso 4: Visualización</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Elige cómo se presenta la información.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {VIZ_TYPES.map(v => (
                  <button key={v.id} onClick={() => setVizType(v.id)} style={{
                    ...pillStyle(vizType === v.id),
                    justifyContent: 'center', padding: '16px',
                    flexDirection: 'column', gap: '6px',
                  }}>
                    <span style={{ fontSize: '24px' }}>{v.icon}</span>
                    <span>{v.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: step === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep(s => Math.min(4, s + 1))}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Siguiente <ChevronRight size={16} />
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleDownloadPDF} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> PDF
                </button>
                <button onClick={handleDownloadExcel} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Download size={16} /> Excel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live preview */}
        <div className="property-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Vista Previa</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {periodLabel} · {reportRows.length} propiedad{reportRows.length !== 1 ? 'es' : ''}
            </p>
          </div>

          {reportRows.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              Sin datos para mostrar
            </div>
          ) : vizType === 'table' ? (
            <div style={{ overflowX: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#FF5A5F', color: 'white' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700 }}>Propiedad</th>
                    {activeMetrics.map(m => (
                      <th key={m.key + m.label} style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>{m.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportRows.map((row, i) => (
                    <tr key={row.propertyId} style={{ background: i % 2 === 0 ? '#fafafa' : 'white', borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 500 }}>{row.propertyName}</td>
                      {activeMetrics.map(m => {
                        const v = row[m.key];
                        return (
                          <td key={m.key + m.label} style={{ padding: '8px 12px', textAlign: 'right' }}>
                            {typeof v === 'number'
                              ? m.isPercent ? `${v.toFixed(1)}%` : fmtMXN(v)
                              : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : vizType === 'bar' ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportRows} margin={{ top: 4, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="propertyName" angle={-35} textAnchor="end" tick={{ fontSize: 9 }} interval={0} />
                <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 9 }} />
                <Tooltip formatter={(v) => fmtMXN(v as number)} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                {activeMetrics.filter(m => !m.isPercent).map((m, i) => (
                  <Bar key={m.key + m.label} dataKey={m.key} name={m.label} fill={PIE_COLORS[i % PIE_COLORS.length]} radius={[2, 2, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : vizType === 'line' ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportRows} margin={{ top: 4, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="propertyName" angle={-35} textAnchor="end" tick={{ fontSize: 9 }} interval={0} />
                <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 9 }} />
                <Tooltip formatter={(v) => fmtMXN(v as number)} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                {activeMetrics.filter(m => !m.isPercent).map((m, i) => (
                  <Line key={m.key + m.label} dataKey={m.key} name={m.label} stroke={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportRows}
                  dataKey={activeMetrics[0]?.key ?? 'profit'}
                  nameKey="propertyName"
                  cx="50%" cy="50%"
                  outerRadius={110}
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine
                >
                  {reportRows.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtMXN(v as number)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;
