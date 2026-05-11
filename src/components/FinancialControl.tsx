import { useState, useMemo } from 'react';
import { Download, FileText, Plus, Save, Pencil, Trash2, CheckSquare, X } from 'lucide-react';
import { mockPropertyConfigs, mockStays } from '../data/mockData';
import { useApp } from '../context/AppContext';
import type { Stay, PropertyConfig } from '../types';

type StayForm = {
  date: string;
  nights: string;
  registeredIncome: string;
  incomeMode: 'BEFORE' | 'AFTER';
  extraExpenses: string;
  notes: string;
};

const DEFAULT_STAY_FORM: StayForm = {
  date: '', nights: '', registeredIncome: '', incomeMode: 'BEFORE', extraExpenses: '', notes: '',
};

export default function FinancialControl({ propertyId }: { propertyId: string }) {
  const { expenses: contextExpenses, properties } = useApp();

  // ── Tabs & period ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'config' | 'stays' | 'report' | 'expenses'>('stays');
  const [period, setPeriod]       = useState('month');

  // ── Core data ─────────────────────────────────────────────────────────────
  const [config] = useState<PropertyConfig | undefined>(
    mockPropertyConfigs.find(c => c.propertyId === propertyId)
  );
  const [stays, setStays] = useState<Stay[]>(mockStays.filter(s => s.propertyId === propertyId));

  // ── Tab A: owner select ───────────────────────────────────────────────────
  const ownerOptions = [...new Set(properties.map(p => p.hostName).filter(Boolean))];
  const [ownerName, setOwnerName] = useState(config?.ownerName ?? '');

  // ── Tab B: stay modal ─────────────────────────────────────────────────────
  const [stayModalOpen, setStayModalOpen] = useState(false);
  const [editingStay, setEditingStay]     = useState<Stay | null>(null);
  const [stayForm, setStayForm]           = useState<StayForm>(DEFAULT_STAY_FORM);
  const [stayErrors, setStayErrors]       = useState<Record<string, string>>({});

  // ── Tab B: multi-select ───────────────────────────────────────────────────
  const [selectMode, setSelectMode]       = useState(false);
  const [selectedStays, setSelectedStays] = useState<Set<string>>(new Set());

  // ── Date filter ───────────────────────────────────────────────────────────
  const now = new Date();
  const filterByDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === 'week')  { const diff = (now.getTime() - d.getTime()) / (1000 * 3600 * 24); return diff >= 0 && diff <= 7; }
    if (period === 'today') return d.toDateString() === now.toDateString();
    return true;
  };

  const filteredStays    = stays.filter(s => filterByDate(s.date));
  const filteredExpenses = contextExpenses.filter(e => e.propertyId === propertyId && filterByDate(e.date));

  const handleConfigSave = (e: React.FormEvent) => { e.preventDefault(); alert('Configuración guardada exitosamente.'); };

  const reportSummary = useMemo(() => filteredStays.reduce((acc, stay) => {
    acc.totalNights       += stay.nights;
    acc.registeredIncome  += stay.registeredIncome;
    acc.airbnbCommission  += stay.airbnbCommission;
    acc.afterAirbnb       += stay.afterAirbnb;
    acc.cleaning          += stay.cleaningFee;
    acc.subtotal          += stay.subtotal;
    acc.cohostCommission  += stay.cohostCommission;
    acc.extraExpenses     += stay.extraExpenses;
    acc.netProfit         += stay.netProfit;
    return acc;
  }, { totalNights: 0, registeredIncome: 0, airbnbCommission: 0, afterAirbnb: 0, cleaning: 0, subtotal: 0, cohostCommission: 0, extraExpenses: 0, netProfit: 0 }), [filteredStays]);

  // ── Early return — after all hooks ────────────────────────────────────────
  if (!config) return <div style={{ padding: '24px', color: 'var(--text-muted)' }}>Configuración no encontrada.</div>;

  // ── Stay calculator ───────────────────────────────────────────────────────
  const calcStay = (form: StayForm, id: string, stayNumber: number): Stay => {
    const income     = parseFloat(form.registeredIncome) || 0;
    const mode       = form.incomeMode;
    const airbnbComm = mode === 'BEFORE' ? income * config.airbnbCommission : 0;
    const afterAirbnb = mode === 'BEFORE' ? income - airbnbComm : income;
    const cleaning   = config.cleaningFee;
    const subtotal   = afterAirbnb - cleaning;
    const cohostComm = subtotal * config.cohostCommission;
    const extras     = parseFloat(form.extraExpenses) || 0;
    return {
      id, propertyId, stayNumber,
      date:             form.date,
      nights:           parseInt(form.nights) || 1,
      registeredIncome: income,
      incomeMode:       mode,
      airbnbCommission: airbnbComm,
      afterAirbnb,
      cleaningFee:      cleaning,
      subtotal,
      cohostCommission: cohostComm,
      extraExpenses:    extras,
      netProfit:        subtotal - cohostComm - extras,
      notes:            form.notes.trim() || undefined,
    };
  };

  // ── Stay modal handlers ───────────────────────────────────────────────────
  const openAddStay = () => {
    setStayForm({ ...DEFAULT_STAY_FORM, incomeMode: config.incomeMode });
    setStayErrors({});
    setEditingStay(null);
    setStayModalOpen(true);
  };

  const openEditStay = (stay: Stay) => {
    setStayForm({
      date:            stay.date,
      nights:          String(stay.nights),
      registeredIncome: String(stay.registeredIncome),
      incomeMode:      stay.incomeMode,
      extraExpenses:   stay.extraExpenses > 0 ? String(stay.extraExpenses) : '',
      notes:           stay.notes ?? '',
    });
    setStayErrors({});
    setEditingStay(stay);
    setStayModalOpen(true);
  };

  const closeStayModal = () => {
    setStayModalOpen(false);
    setEditingStay(null);
    setStayForm(DEFAULT_STAY_FORM);
    setStayErrors({});
  };

  const validateStay = (): boolean => {
    const errs: Record<string, string> = {};
    if (!stayForm.date) errs.date = 'Requerido';
    if (!stayForm.nights || parseInt(stayForm.nights) < 1) errs.nights = 'Mínimo 1';
    if (!stayForm.registeredIncome || parseFloat(stayForm.registeredIncome) <= 0) errs.registeredIncome = 'Monto inválido';
    setStayErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveStay = () => {
    if (!validateStay()) return;
    if (editingStay) {
      setStays(prev => prev.map(s => s.id === editingStay.id ? calcStay(stayForm, editingStay.id, editingStay.stayNumber) : s));
    } else {
      const nextNum = stays.length > 0 ? Math.max(...stays.map(s => s.stayNumber)) + 1 : 1;
      setStays(prev => [...prev, calcStay(stayForm, `stay_${Date.now()}`, nextNum)]);
    }
    closeStayModal();
  };

  // ── Multi-select handlers ─────────────────────────────────────────────────
  const toggleSelectStay = (id: string) => {
    setSelectedStays(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => { setSelectMode(false); setSelectedStays(new Set()); };

  const handleDeleteSelected = () => {
    if (!window.confirm(`¿Eliminar ${selectedStays.size} estancia${selectedStays.size !== 1 ? 's' : ''} seleccionada${selectedStays.size !== 1 ? 's' : ''}?`)) return;
    setStays(prev => prev.filter(s => !selectedStays.has(s.id)));
    exitSelectMode();
  };

  // ── Modal form styles ─────────────────────────────────────────────────────
  const minp = (err?: boolean): React.CSSProperties => ({
    width: '100%', padding: '10px 14px', fontFamily: 'inherit', fontSize: '14px',
    border: `1.5px solid ${err ? '#EF4444' : 'var(--border-color)'}`,
    borderRadius: '10px', outline: 'none', background: 'white', boxSizing: 'border-box',
  });
  const mlbl: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' };
  const mfld: React.CSSProperties = { marginBottom: '16px' };

  // ── Tab button style ──────────────────────────────────────────────────────
  const tabBtn = (tab: string): React.CSSProperties => ({
    background: 'none', border: 'none', padding: '12px 16px', fontWeight: 600, cursor: 'pointer',
    whiteSpace: 'nowrap',
    color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
    borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
  });

  // ── Icon btn style ────────────────────────────────────────────────────────
  const iconBtnStyle: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
    borderRadius: '5px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)',
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ marginTop: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Control Financiero</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['month', 'week', 'today', 'custom'].map((p, i) => (
            <button key={p} className="btn-outline" onClick={() => setPeriod(p)} style={{ padding: '6px 12px', fontSize: '12px', background: period === p ? 'var(--primary)' : '', color: period === p ? 'white' : '' }}>
              {['Este mes', 'Semana actual', 'Hoy', 'Todo Histórico'][i]}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('config')}   style={tabBtn('config')}>A. Configuración</button>
        <button onClick={() => setActiveTab('stays')}    style={tabBtn('stays')}>B. Registro de Estancias</button>
        <button onClick={() => setActiveTab('report')}   style={tabBtn('report')}>C. Reporte del Período</button>
        <button onClick={() => setActiveTab('expenses')} style={tabBtn('expenses')}>D. Gastos Extras</button>
      </div>

      <div className="property-card" style={{ padding: '24px', overflowX: 'auto' }}>

        {/* ── Tab A: Configuración ─────────────────────────────────────── */}
        {activeTab === 'config' && (
          <form onSubmit={handleConfigSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Propietario</label>
                <select className="form-input" value={ownerName} onChange={e => setOwnerName(e.target.value)}>
                  {ownerName && !ownerOptions.includes(ownerName) && <option value={ownerName}>{ownerName}</option>}
                  {ownerOptions.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Co-Anfitrión</label><input type="text" className="form-input" defaultValue={config.cohostName} /></div>
              <div className="form-group"><label className="form-label">Precio x Noche Base</label><input type="number" className="form-input" defaultValue={config.nightlyRate} /></div>
              <div className="form-group"><label className="form-label">Costo de Limpieza</label><input type="number" className="form-input" defaultValue={config.cleaningFee} /></div>
              <div className="form-group"><label className="form-label">Comisión Airbnb (%)</label><input type="number" step="0.01" className="form-input" defaultValue={config.airbnbCommission * 100} /></div>
              <div className="form-group"><label className="form-label">Comisión Ricardo (%)</label><input type="number" step="0.01" className="form-input" defaultValue={config.cohostCommission * 100} /></div>
              <div className="form-group">
                <label className="form-label">Modo de Registro</label>
                <select className="form-input" defaultValue={config.incomeMode}>
                  <option value="BEFORE">ANTES (Ingreso Bruto cobrado al huésped)</option>
                  <option value="AFTER">DESPUÉS (Lo que deposita Airbnb)</option>
                </select>
                <small style={{ color: 'var(--text-muted)' }}>Si es ANTES, el sistema restará la comisión de Airbnb. Si es DESPUÉS, asume que Airbnb ya descontó su comisión.</small>
              </div>
              <div className="form-group"><label className="form-label">Mínimo de Noches</label><input type="number" className="form-input" defaultValue={config.minNights} /></div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary"><Save size={18} /> Guardar Configuración</button>
            </div>
          </form>
        )}

        {/* ── Tab B: Registro de Estancias ─────────────────────────────── */}
        {activeTab === 'stays' && (
          <div>
            {/* Top bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '16px' }}>
              {selectMode ? (
                <button className="btn-outline" onClick={exitSelectMode} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <X size={16} /> Cancelar
                </button>
              ) : (
                <button className="btn-outline" onClick={() => setSelectMode(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare size={16} /> Seleccionar
                </button>
              )}
              <button className="btn-primary" style={{ background: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={openAddStay}>
                <Plus size={18} /> Agregar Estancia
              </button>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px', minWidth: '960px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)' }}>
                  {selectMode && <th style={{ padding: '12px', width: '36px' }} />}
                  <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Fecha</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Noches</th>
                  <th style={{ padding: '12px' }}>Ingreso Reg.</th>
                  <th style={{ padding: '12px', color: '#FC642D' }}>Airbnb</th>
                  <th style={{ padding: '12px' }}>Después Airbnb</th>
                  <th style={{ padding: '12px', color: '#FC642D' }}>Limpieza</th>
                  <th style={{ padding: '12px' }}>Subtotal</th>
                  <th style={{ padding: '12px', color: '#FC642D' }}>Mi Comis.</th>
                  <th style={{ padding: '12px', color: '#FC642D' }}>Extras</th>
                  <th style={{ padding: '12px', color: 'var(--success)' }}>Utilidad Neta</th>
                  {!selectMode && <th style={{ padding: '12px', width: '48px' }} />}
                </tr>
              </thead>
              <tbody>
                {filteredStays.map(stay => {
                  const isSelected = selectedStays.has(stay.id);
                  return (
                    <tr
                      key={stay.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(0, 112, 243, 0.04)' : undefined,
                        cursor: selectMode ? 'pointer' : 'default',
                        outline: isSelected ? '1px solid var(--primary)' : undefined,
                      }}
                      onClick={() => selectMode && toggleSelectStay(stay.id)}
                    >
                      {/* Checkbox cell */}
                      {selectMode && (
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{
                            width: '18px', height: '18px', borderRadius: '4px', margin: '0 auto',
                            border: isSelected ? 'none' : '2px solid var(--border-color)',
                            background: isSelected ? 'var(--primary)' : 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isSelected && (
                              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                                <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        </td>
                      )}
                      <td style={{ padding: '12px', textAlign: 'left' }}>{stay.stayNumber}</td>
                      <td style={{ padding: '12px', textAlign: 'left' }}>{new Date(stay.date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{stay.nights}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>${stay.registeredIncome.toFixed(2)}</td>
                      <td style={{ padding: '12px', color: '#FC642D' }}>-${stay.airbnbCommission.toFixed(2)}</td>
                      <td style={{ padding: '12px' }}>${stay.afterAirbnb.toFixed(2)}</td>
                      <td style={{ padding: '12px', color: '#FC642D' }}>-${stay.cleaningFee.toFixed(2)}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>${stay.subtotal.toFixed(2)}</td>
                      <td style={{ padding: '12px', color: '#FC642D', fontWeight: 600 }}>-${stay.cohostCommission.toFixed(2)}</td>
                      <td style={{ padding: '12px', color: '#FC642D' }}>-${stay.extraExpenses.toFixed(2)}</td>
                      <td style={{ padding: '12px', color: 'var(--success)', fontWeight: 700 }}>${stay.netProfit.toFixed(2)}</td>
                      {/* Edit icon */}
                      {!selectMode && (
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            style={iconBtnStyle}
                            onClick={e => { e.stopPropagation(); openEditStay(stay); }}
                            title="Editar estancia"
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,112,243,0.08)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                          >
                            <Pencil size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}

                {/* Totals row */}
                <tr style={{ background: 'var(--bg-color)', fontWeight: 700 }}>
                  {selectMode && <td />}
                  <td colSpan={2} style={{ padding: '12px', textAlign: 'left' }}>TOTALES</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{reportSummary.totalNights}</td>
                  <td style={{ padding: '12px' }}>${reportSummary.registeredIncome.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: '#FC642D' }}>-${reportSummary.airbnbCommission.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>${reportSummary.afterAirbnb.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: '#FC642D' }}>-${reportSummary.cleaning.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>${reportSummary.subtotal.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: '#FC642D' }}>-${reportSummary.cohostCommission.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: '#FC642D' }}>-${reportSummary.extraExpenses.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: 'var(--success)' }}>${reportSummary.netProfit.toFixed(2)}</td>
                  {!selectMode && <td />}
                </tr>
              </tbody>
            </table>

            {/* Floating action bar (multi-select) */}
            {selectMode && selectedStays.size > 0 && (
              <div style={{
                position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--text-main)', color: 'white', borderRadius: '16px',
                padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.28)', zIndex: 1000,
                fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap',
              }}>
                <span>{selectedStays.size} seleccionada{selectedStays.size !== 1 ? 's' : ''}</span>
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.25)' }} />
                <button
                  onClick={handleDeleteSelected}
                  style={{
                    background: 'rgba(255,90,95,0.22)', color: '#FF8A8E', border: 'none',
                    borderRadius: '8px', padding: '6px 16px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Tab C: Reporte ───────────────────────────────────────────── */}
        {activeTab === 'report' && (
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>Reporte Financiero de Propiedad</h2>
              <p style={{ color: 'var(--text-muted)' }}>Período Seleccionado: {filteredStays.length} Estancias Registradas</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>Resumen Ejecutivo</h4>
                <div className="detail-row"><div className="detail-label">Total Estancias</div><div className="detail-value">{filteredStays.length}</div></div>
                <div className="detail-row"><div className="detail-label">Total Noches</div><div className="detail-value">{reportSummary.totalNights}</div></div>
                <div className="detail-row"><div className="detail-label">Promedio Noches / Estancia</div><div className="detail-value">{(reportSummary.totalNights / (filteredStays.length || 1)).toFixed(1)}</div></div>
                <div className="detail-row"><div className="detail-label">Promedio Utilidad / Noche</div><div className="detail-value">${(reportSummary.netProfit / (reportSummary.totalNights || 1)).toFixed(2)}</div></div>
              </div>
              <div style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>Resumen Financiero</h4>
                <div className="detail-row"><div className="detail-label">Ingreso Registrado</div><div className="detail-value">${reportSummary.registeredIncome.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{ color: '#FC642D' }}>- Comisión Airbnb</div><div className="detail-value" style={{ color: '#FC642D' }}>-${reportSummary.airbnbCommission.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{ fontWeight: 600 }}>Después de Airbnb</div><div className="detail-value" style={{ fontWeight: 600 }}>${reportSummary.afterAirbnb.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{ color: '#FC642D' }}>- Limpieza</div><div className="detail-value" style={{ color: '#FC642D' }}>-${reportSummary.cleaning.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{ fontWeight: 600 }}>Subtotal</div><div className="detail-value" style={{ fontWeight: 600 }}>${reportSummary.subtotal.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{ color: '#FF5A5F' }}>- Comisión Ricardo</div><div className="detail-value" style={{ color: '#FF5A5F' }}>-${reportSummary.cohostCommission.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{ color: '#FC642D' }}>- Gastos Extras</div><div className="detail-value" style={{ color: '#FC642D' }}>-${reportSummary.extraExpenses.toFixed(2)}</div></div>
                <div className="detail-row" style={{ borderTop: '2px solid var(--border-color)', marginTop: '8px' }}>
                  <div className="detail-label" style={{ fontWeight: 700 }}>Utilidad Neta</div>
                  <div className="detail-value" style={{ fontWeight: 800, fontSize: '18px', color: 'var(--success)' }}>${reportSummary.netProfit.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>Distribución del Ingreso</h4>
              <div style={{ height: '30px', width: '100%', display: 'flex', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${(reportSummary.airbnbCommission / reportSummary.registeredIncome) * 100}%`, background: '#FC642D' }} title="Airbnb" />
                <div style={{ width: `${(reportSummary.cleaning / reportSummary.registeredIncome) * 100}%`, background: '#FFB020' }} title="Limpieza" />
                <div style={{ width: `${(reportSummary.cohostCommission / reportSummary.registeredIncome) * 100}%`, background: '#FF5A5F' }} title="Ricardo" />
                <div style={{ width: `${(reportSummary.netProfit / reportSummary.registeredIncome) * 100}%`, background: 'var(--success)' }} title="Utilidad Neta" />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', justifyContent: 'center' }}>
                {[['#FC642D', 'Airbnb'], ['#FFB020', 'Limpieza'], ['#FF5A5F', 'Co-Anfitrión'], ['var(--success)', 'Propietario']].map(([color, label]) => (
                  <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 10, height: 10, background: color, borderRadius: '50%' }} /> {label}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ borderBottom: '1px solid var(--text-main)', height: '40px', marginBottom: '8px' }} />
                <div style={{ fontSize: '12px', fontWeight: 600 }}>Propietario</div>
              </div>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ borderBottom: '1px solid var(--text-main)', height: '40px', marginBottom: '8px' }} />
                <div style={{ fontSize: '12px', fontWeight: 600 }}>Ricardo Peña (Co-Anfitrión)</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
              <button className="btn-outline"><Download size={18} /> Descargar PDF</button>
              <button className="btn-outline"><FileText size={18} /> Descargar Excel</button>
            </div>
          </div>
        )}

        {/* ── Tab D: Gastos Extras ─────────────────────────────────────── */}
        {activeTab === 'expenses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button className="btn-primary" style={{ background: '#FC642D' }}><Plus size={18} /> Agregar Gasto</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Fecha</th>
                  <th style={{ padding: '12px' }}>Descripción</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px' }}>{new Date(exp.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>{exp.description}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#FC642D' }}>-${exp.amount.toFixed(2)}</td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Sin gastos en este período.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Stay Modal (Add / Edit) ──────────────────────────────────────── */}
      {stayModalOpen && (
        <div className="modal-overlay" onClick={closeStayModal}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>
                {editingStay ? `Editar Estancia #${editingStay.stayNumber}` : 'Nueva Estancia'}
              </h3>
              <button className="modal-close" onClick={closeStayModal}><X size={24} /></button>
            </div>

            <div className="modal-body">
              {/* Date + Nights */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', ...mfld }}>
                <div>
                  <label style={mlbl}>Fecha de llegada <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="date" style={minp(!!stayErrors.date)} value={stayForm.date}
                    onChange={e => setStayForm(f => ({ ...f, date: e.target.value }))} />
                  {stayErrors.date && <span className="form-error">{stayErrors.date}</span>}
                </div>
                <div>
                  <label style={mlbl}>Noches <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="number" min={1} style={minp(!!stayErrors.nights)} value={stayForm.nights}
                    onChange={e => setStayForm(f => ({ ...f, nights: e.target.value }))} placeholder="1" />
                  {stayErrors.nights && <span className="form-error">{stayErrors.nights}</span>}
                </div>
              </div>

              {/* Income + Mode */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', ...mfld }}>
                <div>
                  <label style={mlbl}>Ingreso registrado (MXN) <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="number" min={0} step={0.01} style={minp(!!stayErrors.registeredIncome)} value={stayForm.registeredIncome}
                    onChange={e => setStayForm(f => ({ ...f, registeredIncome: e.target.value }))} placeholder="0.00" />
                  {stayErrors.registeredIncome && <span className="form-error">{stayErrors.registeredIncome}</span>}
                </div>
                <div>
                  <label style={mlbl}>Modo</label>
                  <select style={minp()} value={stayForm.incomeMode}
                    onChange={e => setStayForm(f => ({ ...f, incomeMode: e.target.value as 'BEFORE' | 'AFTER' }))}>
                    <option value="BEFORE">ANTES</option>
                    <option value="AFTER">DESPUÉS</option>
                  </select>
                </div>
              </div>

              {/* Extra expenses + Notes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', ...mfld }}>
                <div>
                  <label style={mlbl}>Gastos extras (MXN)</label>
                  <input type="number" min={0} step={0.01} style={minp()} value={stayForm.extraExpenses}
                    onChange={e => setStayForm(f => ({ ...f, extraExpenses: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <label style={mlbl}>Notas</label>
                  <input style={minp()} value={stayForm.notes}
                    onChange={e => setStayForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observaciones..." />
                </div>
              </div>

              {/* Live preview */}
              {stayForm.registeredIncome && parseFloat(stayForm.registeredIncome) > 0 && (() => {
                const prev = calcStay(stayForm, 'preview', 0);
                return (
                  <div style={{ background: 'var(--bg-color)', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px', fontSize: '13px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>Vista previa de cálculo</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      <div><span style={{ color: 'var(--text-muted)' }}>Comis. Airbnb</span><br /><strong style={{ color: '#FC642D' }}>-${prev.airbnbCommission.toFixed(2)}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Limpieza</span><br /><strong style={{ color: '#FC642D' }}>-${prev.cleaningFee.toFixed(2)}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Comis. Co-host</span><br /><strong style={{ color: '#FC642D' }}>-${prev.cohostCommission.toFixed(2)}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Subtotal</span><br /><strong>${prev.subtotal.toFixed(2)}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Extras</span><br /><strong style={{ color: '#FC642D' }}>-${prev.extraExpenses.toFixed(2)}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Utilidad Neta</span><br /><strong style={{ color: 'var(--success)', fontSize: '15px' }}>${prev.netProfit.toFixed(2)}</strong></div>
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn-outline" onClick={closeStayModal}>Cancelar</button>
                <button className="btn-primary" onClick={handleSaveStay}>
                  {editingStay ? 'Guardar Cambios' : 'Agregar Estancia'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
