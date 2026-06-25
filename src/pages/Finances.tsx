import { useState } from 'react';
import { Plus, TrendingDown, Trash2, Pencil, CheckSquare, X } from 'lucide-react';
import { mockPropertyConfigs } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../hooks/usePermissions';
import type { Expense, Stay } from '../types';
import AddExpenseModal from '../components/AddExpenseModal';
import { usePagination } from '../hooks/usePagination';
import PaginationBar from '../components/PaginationBar';

const categoryDisplay: Record<string, string> = {
  cleaning:     'Limpieza',
  maintenance:  'Mantenimiento',
  supplies:     'Insumos',
  platform_fee: 'Comisión Plataforma',
  utilities:    'Servicios',
  repairs:      'Reparaciones',
  other:        'Otros',
};

const actionBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)', padding: '6px', borderRadius: '6px',
  display: 'flex', alignItems: 'center', transition: 'color 0.15s, background 0.15s',
};

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', fontFamily: 'inherit', fontSize: '14px',
  border: '1.5px solid var(--border-color)', borderRadius: '10px', outline: 'none',
  background: 'white', boxSizing: 'border-box',
};
const lbl: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' };

type StayForm = {
  propertyId: string;
  date: string;
  nights: string;
  registeredIncome: string;
  incomeMode: 'BEFORE' | 'AFTER';
  extraExpenses: string;
  notes: string;
};

const DEFAULT_STAY_FORM: StayForm = {
  propertyId: '', date: '', nights: '', registeredIncome: '',
  incomeMode: 'BEFORE', extraExpenses: '', notes: '',
};

const Finances = () => {
  const { expenses, addExpense, deleteExpense, openDeleteModal, openEditModal, properties, stays, addStay, updateStay } = useApp();
  const { canCreate, canDelete, hasPropertyAccess } = usePermissions();
  const [activeTab, setActiveTab] = useState(1);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const visibleExpenses = expenses.filter(e => hasPropertyAccess(e.propertyId));
  const visibleStays    = stays.filter(s => hasPropertyAccess(s.propertyId));
  const allowDeleteExp  = canDelete('expenses');


  const expPag  = usePagination(visibleExpenses, 'finances_expenses');
  const stayPag = usePagination(visibleStays, 'finances_stays');

  // ── Tab 1 multi-select ────────────────────────────────────────────────────
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected]     = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const exitSelectMode = () => { setSelectMode(false); setSelected(new Set()); };
  const handleDeleteSelected = () => {
    if (!window.confirm(`¿Eliminar ${selected.size} gasto${selected.size !== 1 ? 's' : ''} seleccionado${selected.size !== 1 ? 's' : ''}?`)) return;
    selected.forEach(id => deleteExpense(id));
    exitSelectMode();
  };

  // ── Tab 2 stay modal ──────────────────────────────────────────────────────
  const [stayModalOpen, setStayModalOpen] = useState(false);
  const [editingStay, setEditingStay]     = useState<Stay | null>(null);
  const [stayForm, setStayForm]           = useState<StayForm>(DEFAULT_STAY_FORM);
  const [stayErrors, setStayErrors]       = useState<Record<string, string>>({});

  const calcStay = (form: StayForm, id: string, stayNumber: number): Stay => {
    const cfg = mockPropertyConfigs.find(c => c.propertyId === form.propertyId);
    const airbnbRate  = cfg?.airbnbCommission ?? 0.20;
    const cleaningFee = cfg?.cleaningFee      ?? 0;
    const cohostRate  = cfg?.cohostCommission ?? 0.15;
    const income      = parseFloat(form.registeredIncome) || 0;
    const airbnbComm  = form.incomeMode === 'BEFORE' ? income * airbnbRate : 0;
    const afterAirbnb = form.incomeMode === 'BEFORE' ? income - airbnbComm : income;
    const subtotal    = afterAirbnb - cleaningFee;
    const cohostComm  = subtotal * cohostRate;
    const extras      = parseFloat(form.extraExpenses) || 0;
    return {
      id, stayNumber,
      propertyId:       form.propertyId,
      date:             form.date,
      nights:           parseInt(form.nights) || 1,
      registeredIncome: income,
      incomeMode:       form.incomeMode,
      airbnbCommission: airbnbComm,
      afterAirbnb,
      cleaningFee,
      subtotal,
      cohostCommission: cohostComm,
      extraExpenses:    extras,
      netProfit:        subtotal - cohostComm - extras,
      notes:            form.notes.trim() || undefined,
    };
  };

  const openAddStay = () => {
    setStayForm(DEFAULT_STAY_FORM);
    setStayErrors({});
    setEditingStay(null);
    setStayModalOpen(true);
  };

  const openEditStay = (stay: Stay) => {
    setStayForm({
      propertyId:       stay.propertyId,
      date:             stay.date,
      nights:           String(stay.nights),
      registeredIncome: String(stay.registeredIncome),
      incomeMode:       stay.incomeMode,
      extraExpenses:    stay.extraExpenses > 0 ? String(stay.extraExpenses) : '',
      notes:            stay.notes ?? '',
    });
    setStayErrors({});
    setEditingStay(stay);
    setStayModalOpen(true);
  };

  const closeStayModal = () => { setStayModalOpen(false); setEditingStay(null); setStayForm(DEFAULT_STAY_FORM); setStayErrors({}); };

  const validateStay = (): boolean => {
    const errs: Record<string, string> = {};
    if (!stayForm.propertyId) errs.propertyId = 'Requerido';
    if (!stayForm.date) errs.date = 'Requerido';
    if (!stayForm.nights || parseInt(stayForm.nights) < 1) errs.nights = 'Mínimo 1';
    if (!stayForm.registeredIncome || parseFloat(stayForm.registeredIncome) <= 0) errs.registeredIncome = 'Monto inválido';
    setStayErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveStay = () => {
    if (!validateStay()) return;
    if (editingStay) {
      updateStay(calcStay(stayForm, editingStay.id, editingStay.stayNumber));
    } else {
      const nextNum = stays.length > 0 ? Math.max(...stays.map(s => s.stayNumber)) + 1 : 1;
      addStay(calcStay(stayForm, `stay_${Date.now()}`, nextNum));
    }
    closeStayModal();
  };

  const totalExpenses = visibleExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const getPropertyName = (id: string) => properties.find(p => p.id === id)?.name ?? 'Desconocida';
  const handleAddExpense = (expense: Expense) => { addExpense(expense); };

  // Live preview for stay modal
  const stayPreview = stayForm.propertyId && stayForm.registeredIncome && parseFloat(stayForm.registeredIncome) > 0
    ? calcStay(stayForm, 'preview', 0)
    : null;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2 className="page-title">Finanzas</h2>
        {activeTab === 1 && canCreate('expenses') && (
          <button className="btn-primary" onClick={() => setIsExpenseModalOpen(true)}>
            <Plus size={20} /> Registrar Gasto
          </button>
        )}
        {activeTab === 2 && canCreate('stays') && (
          <button className="btn-primary" style={{ background: 'var(--success)' }} onClick={openAddStay}>
            <Plus size={20} /> Registrar Estancia
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <button
          onClick={() => { setActiveTab(1); exitSelectMode(); expPag.resetPage(); }}
          style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: 600, color: activeTab === 1 ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: '8px 16px', borderBottom: activeTab === 1 ? '2px solid var(--primary)' : '2px solid transparent' }}
        >
          Gastos Extras
        </button>
        <button
          onClick={() => { setActiveTab(2); exitSelectMode(); stayPag.resetPage(); }}
          style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: 600, color: activeTab === 2 ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: '8px 16px', borderBottom: activeTab === 2 ? '2px solid var(--primary)' : '2px solid transparent' }}
        >
          Estancias (Reservas)
        </button>
      </div>

      {/* ── Tab 1: Gastos Extras ────────────────────────────────────────────── */}
      {activeTab === 1 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div className="property-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(252, 100, 45, 0.1)', color: 'var(--warning)', padding: '16px', borderRadius: '50%' }}>
                <TrendingDown size={28} />
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>Gastos Totales (Mes)</div>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>${totalExpenses.toFixed(2)} MXN</div>
              </div>
            </div>
          </div>

          <div className="property-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Historial de Gastos Extras</h3>
              {selectMode ? (
                <button className="btn-outline" onClick={exitSelectMode} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '6px 14px' }}>
                  <X size={15} /> Cancelar
                </button>
              ) : (
                <button className="btn-outline" onClick={() => setSelectMode(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '6px 14px' }}>
                  <CheckSquare size={15} /> Seleccionar
                </button>
              )}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>
                    {selectMode && <th style={{ padding: '16px 12px', width: '36px' }} />}
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Fecha</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Propiedad</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Categoría</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Descripción</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Monto</th>
                    {!selectMode && <th style={{ padding: '16px 20px', fontWeight: 600 }} />}
                  </tr>
                </thead>
                <tbody>
                  {expPag.paginated.map(expense => {
                    const isSelected = selected.has(expense.id);
                    return (
                      <tr
                        key={expense.id}
                        style={{
                          borderBottom: '1px solid var(--border-color)', fontSize: '14px',
                          background: isSelected ? 'rgba(0, 112, 243, 0.04)' : undefined,
                          outline: isSelected ? '1px solid rgba(0,112,243,0.25)' : undefined,
                          cursor: selectMode ? 'pointer' : 'default',
                        }}
                        onClick={() => selectMode && toggleSelect(expense.id)}
                      >
                        {selectMode && (
                          <td style={{ padding: '16px 12px', textAlign: 'center' }}>
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
                        <td style={{ padding: '16px 20px' }}>{new Date(expense.date).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 20px', fontWeight: 500 }}>{getPropertyName(expense.propertyId)}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: 'var(--bg-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                            {categoryDisplay[expense.category]}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{expense.description}</td>
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--warning)' }}>-${expense.amount.toFixed(2)}</td>
                        {!selectMode && (
                          <td style={{ padding: '12px 12px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                style={actionBtn}
                                onClick={() => openEditModal({ category: 'gasto', itemId: expense.id })}
                                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#6B5BFF'; b.style.background = 'rgba(107,91,255,0.08)'; }}
                                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'var(--text-muted)'; b.style.background = 'none'; }}
                                title="Editar gasto"
                              ><Pencil size={14} /></button>
                              {allowDeleteExp && (
                              <button
                                style={actionBtn}
                                onClick={() => openDeleteModal({ category: 'gasto', itemId: expense.id })}
                                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#EF4444'; b.style.background = 'rgba(239,68,68,0.08)'; }}
                                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'var(--text-muted)'; b.style.background = 'none'; }}
                                title="Eliminar gasto"
                              ><Trash2 size={14} /></button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationBar {...expPag} />
          </div>

          {/* Floating action bar */}
          {selectMode && selected.size > 0 && allowDeleteExp && (
            <div style={{
              position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
              background: 'var(--text-main)', color: 'white', borderRadius: '16px',
              padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.28)', zIndex: 1000,
              fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              <span>{selected.size} seleccionado{selected.size !== 1 ? 's' : ''}</span>
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
        </>
      )}

      {/* ── Tab 2: Estancias ────────────────────────────────────────────────── */}
      {activeTab === 2 && (
        <div className="property-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Registro de Estancias (Comisiones Auto-Calculadas)</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Propiedad</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Fecha In</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Noches</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Bruto</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Airbnb (20%)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Neto - Limpieza</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Mi Comisión</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Utilidad Propietario</th>
                  <th style={{ padding: '12px 16px', width: '48px' }} />
                </tr>
              </thead>
              <tbody>
                {stayPag.paginated.map(stay => (
                  <tr key={stay.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{getPropertyName(stay.propertyId)}</td>
                    <td style={{ padding: '12px 16px' }}>{new Date(stay.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>{stay.nights}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>${stay.registeredIncome.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--warning)' }}>-${stay.airbnbCommission.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px' }}>${stay.subtotal.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--primary)' }}>${stay.cohostCommission.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--success)' }}>${stay.netProfit.toFixed(2)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <button
                        style={actionBtn}
                        onClick={() => openEditStay(stay)}
                        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'var(--primary)'; b.style.background = 'rgba(0,112,243,0.08)'; }}
                        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'var(--text-muted)'; b.style.background = 'none'; }}
                        title="Editar estancia"
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar {...stayPag} />
        </div>
      )}

      {/* ── Expense modal ──────────────────────────────────────────────────── */}
      {isExpenseModalOpen && (
        <AddExpenseModal onAdd={handleAddExpense} onClose={() => setIsExpenseModalOpen(false)} />
      )}

      {/* ── Stay modal (Add / Edit) ────────────────────────────────────────── */}
      {stayModalOpen && (
        <div className="modal-overlay" onClick={closeStayModal}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>
                {editingStay ? `Editar Estancia #${editingStay.stayNumber}` : 'Nueva Estancia'}
              </h3>
              <button className="modal-close" onClick={closeStayModal}><X size={24} /></button>
            </div>

            <div className="modal-body" style={{ display: 'grid', gap: '14px' }}>
              {/* Property */}
              <div>
                <label style={lbl}>Propiedad <span style={{ color: '#EF4444' }}>*</span></label>
                <select
                  style={{ ...inp, borderColor: stayErrors.propertyId ? '#EF4444' : 'var(--border-color)' }}
                  value={stayForm.propertyId}
                  onChange={e => setStayForm(f => ({ ...f, propertyId: e.target.value }))}
                >
                  <option value="">— Seleccionar propiedad —</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {stayErrors.propertyId && <span style={{ color: '#EF4444', fontSize: '12px' }}>{stayErrors.propertyId}</span>}
              </div>

              {/* Date + Nights */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Fecha de llegada <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    type="date"
                    style={{ ...inp, borderColor: stayErrors.date ? '#EF4444' : 'var(--border-color)' }}
                    value={stayForm.date}
                    onChange={e => setStayForm(f => ({ ...f, date: e.target.value }))}
                  />
                  {stayErrors.date && <span style={{ color: '#EF4444', fontSize: '12px' }}>{stayErrors.date}</span>}
                </div>
                <div>
                  <label style={lbl}>Noches <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    type="number" min={1}
                    style={{ ...inp, borderColor: stayErrors.nights ? '#EF4444' : 'var(--border-color)' }}
                    value={stayForm.nights}
                    onChange={e => setStayForm(f => ({ ...f, nights: e.target.value }))}
                    placeholder="1"
                  />
                  {stayErrors.nights && <span style={{ color: '#EF4444', fontSize: '12px' }}>{stayErrors.nights}</span>}
                </div>
              </div>

              {/* Income + Mode */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Ingreso registrado (MXN) <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    type="number" min={0} step={0.01}
                    style={{ ...inp, borderColor: stayErrors.registeredIncome ? '#EF4444' : 'var(--border-color)' }}
                    value={stayForm.registeredIncome}
                    onChange={e => setStayForm(f => ({ ...f, registeredIncome: e.target.value }))}
                    placeholder="0.00"
                  />
                  {stayErrors.registeredIncome && <span style={{ color: '#EF4444', fontSize: '12px' }}>{stayErrors.registeredIncome}</span>}
                </div>
                <div>
                  <label style={lbl}>Modo</label>
                  <select
                    style={inp}
                    value={stayForm.incomeMode}
                    onChange={e => setStayForm(f => ({ ...f, incomeMode: e.target.value as 'BEFORE' | 'AFTER' }))}
                  >
                    <option value="BEFORE">ANTES</option>
                    <option value="AFTER">DESPUÉS</option>
                  </select>
                </div>
              </div>

              {/* Extras + Notes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Gastos extras (MXN)</label>
                  <input
                    type="number" min={0} step={0.01} style={inp}
                    value={stayForm.extraExpenses}
                    onChange={e => setStayForm(f => ({ ...f, extraExpenses: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label style={lbl}>Notas</label>
                  <input
                    style={inp} value={stayForm.notes}
                    onChange={e => setStayForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Observaciones..."
                  />
                </div>
              </div>

              {/* Live preview */}
              {stayPreview && (
                <div style={{ background: 'var(--bg-color)', borderRadius: '10px', padding: '14px 16px', fontSize: '13px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>Vista previa de cálculo</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Comis. Airbnb</span><br /><strong style={{ color: '#FC642D' }}>-${stayPreview.airbnbCommission.toFixed(2)}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Limpieza</span><br /><strong style={{ color: '#FC642D' }}>-${stayPreview.cleaningFee.toFixed(2)}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Comis. Co-host</span><br /><strong style={{ color: '#FC642D' }}>-${stayPreview.cohostCommission.toFixed(2)}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Subtotal</span><br /><strong>${stayPreview.subtotal.toFixed(2)}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Extras</span><br /><strong style={{ color: '#FC642D' }}>-${stayPreview.extraExpenses.toFixed(2)}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Utilidad Neta</span><br /><strong style={{ color: 'var(--success)', fontSize: '15px' }}>${stayPreview.netProfit.toFixed(2)}</strong></div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn-outline" onClick={closeStayModal}>Cancelar</button>
                <button className="btn-primary" style={{ background: 'var(--success)' }} onClick={handleSaveStay}>
                  {editingStay ? 'Guardar Cambios' : 'Registrar Estancia'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finances;
