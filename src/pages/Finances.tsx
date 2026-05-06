import { useState } from 'react';
import { Plus, TrendingDown, Trash2 } from 'lucide-react';
import { mockStays } from '../data/mockData';
import { useApp } from '../context/AppContext';
import type { Expense, Stay } from '../types';
import AddExpenseModal from '../components/AddExpenseModal';

const categoryDisplay: Record<string, string> = {
  cleaning:      'Limpieza',
  maintenance:   'Mantenimiento',
  supplies:      'Insumos',
  platform_fee:  'Comisión Plataforma',
  utilities:     'Servicios',
  repairs:       'Reparaciones',
  other:         'Otros',
};

const Finances = () => {
  const { expenses, addExpense, openDeleteModal, properties } = useApp();
  const [activeTab, setActiveTab] = useState(1);
  const [stays] = useState<Stay[]>(mockStays);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const getPropertyName = (id: string) =>
    properties.find(p => p.id === id)?.name ?? 'Desconocida';

  const handleAddExpense = (expense: Expense) => {
    addExpense(expense);
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2 className="page-title">Finanzas</h2>
        {activeTab === 1 ? (
          <button className="btn-primary" onClick={() => setIsExpenseModalOpen(true)}>
            <Plus size={20} />
            Registrar Gasto
          </button>
        ) : (
          <button className="btn-primary" style={{ background: 'var(--success)' }}>
            <Plus size={20} />
            Registrar Estancia
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <button
          onClick={() => setActiveTab(1)}
          style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: 600, color: activeTab === 1 ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: '8px 16px', borderBottom: activeTab === 1 ? '2px solid var(--primary)' : '2px solid transparent' }}
        >
          Gastos Extras
        </button>
        <button
          onClick={() => setActiveTab(2)}
          style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: 600, color: activeTab === 2 ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: '8px 16px', borderBottom: activeTab === 2 ? '2px solid var(--primary)' : '2px solid transparent' }}
        >
          Estancias (Reservas)
        </button>
      </div>

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
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Historial de Gastos Extras</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Fecha</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Propiedad</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Categoría</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Descripción</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Monto</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600 }} />
                  </tr>
                </thead>
                <tbody>
                  {expenses.slice(0, 15).map(expense => (
                    <tr key={expense.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                      <td style={{ padding: '16px 20px' }}>{new Date(expense.date).toLocaleDateString()}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 500 }}>{getPropertyName(expense.propertyId)}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: 'var(--bg-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          {categoryDisplay[expense.category]}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{expense.description}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--warning)' }}>-${expense.amount.toFixed(2)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => openDeleteModal({ category: 'gasto', itemId: expense.id })}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'color 0.15s, background 0.15s',
                          }}
                          onMouseEnter={e => {
                            const b = e.currentTarget as HTMLButtonElement;
                            b.style.color = '#EF4444';
                            b.style.background = 'rgba(239,68,68,0.08)';
                          }}
                          onMouseLeave={e => {
                            const b = e.currentTarget as HTMLButtonElement;
                            b.style.color = 'var(--text-muted)';
                            b.style.background = 'none';
                          }}
                          title="Eliminar gasto"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

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
                </tr>
              </thead>
              <tbody>
                {stays.slice(0, 15).map(stay => (
                  <tr key={stay.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{getPropertyName(stay.propertyId)}</td>
                    <td style={{ padding: '12px 16px' }}>{new Date(stay.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>{stay.nights}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>${stay.registeredIncome.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--warning)' }}>-${stay.airbnbCommission.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px' }}>${stay.subtotal.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--primary)' }}>${stay.cohostCommission.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--success)' }}>${stay.netProfit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isExpenseModalOpen && (
        <AddExpenseModal
          onAdd={handleAddExpense}
          onClose={() => setIsExpenseModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Finances;
