import { useState } from 'react';
import { X } from 'lucide-react';
import { mockProperties } from '../data/mockData';
import type { Expense, ExpenseCategory } from '../types';

type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Tarjeta';

interface Props {
  onAdd: (expense: Expense) => void;
  onClose: () => void;
}

const CATEGORY_OPTIONS: Array<{ value: ExpenseCategory; label: string }> = [
  { value: 'cleaning', label: 'Limpieza' },
  { value: 'supplies', label: 'Insumos' },
  { value: 'maintenance', label: 'Mantenimiento' },
  { value: 'platform_fee', label: 'Comisión Plataforma' },
  { value: 'utilities', label: 'Servicios' },
  { value: 'other', label: 'Otros' },
];

const PAYMENT_OPTIONS: PaymentMethod[] = ['Efectivo', 'Transferencia', 'Tarjeta'];

const todayStr = () => new Date().toISOString().split('T')[0];

const AddExpenseModal = ({ onAdd, onClose }: Props) => {
  const [date, setDate] = useState(todayStr());
  const [propertyId, setPropertyId] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('cleaning');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) =>
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!propertyId) e.propertyId = 'Selecciona una propiedad';
    if (!description.trim()) e.description = 'La descripción es requerida';
    if (!amount || Number(amount) <= 0) e.amount = 'Ingresa un monto válido mayor a 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const now = new Date().toISOString();
    onAdd({
      id: `e${Date.now()}`,
      propertyId,
      category,
      description: description.trim(),
      amount: Number(amount),
      date,
      paymentMethod,
      createdBy: 'u1',
      createdAt: now,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Registrar Gasto</h3>
          <button className="modal-close" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Propiedad <span style={{ color: 'var(--primary)' }}>*</span>
            </label>
            <select
              className="form-input"
              value={propertyId}
              onChange={e => { setPropertyId(e.target.value); clearError('propertyId'); }}
              style={errors.propertyId ? { borderColor: 'var(--primary)' } : {}}
            >
              <option value="">Seleccionar propiedad...</option>
              {mockProperties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.propertyId && <span className="form-error">{errors.propertyId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Categoría <span style={{ color: 'var(--primary)' }}>*</span>
            </label>
            <select
              className="form-input"
              value={category}
              onChange={e => setCategory(e.target.value as ExpenseCategory)}
            >
              {CATEGORY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Descripción <span style={{ color: 'var(--primary)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={description}
              onChange={e => { setDescription(e.target.value); clearError('description'); }}
              placeholder="Ej. Cambio de filtro A/C"
              style={errors.description ? { borderColor: 'var(--primary)' } : {}}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Monto MXN <span style={{ color: 'var(--primary)' }}>*</span>
              </label>
              <input
                type="number"
                className="form-input"
                value={amount}
                min={0.01}
                step={0.01}
                onChange={e => { setAmount(e.target.value); clearError('amount'); }}
                placeholder="0.00"
                style={errors.amount ? { borderColor: 'var(--primary)' } : {}}
              />
              {errors.amount && <span className="form-error">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Método de pago</label>
              <select
                className="form-input"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                {PAYMENT_OPTIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button className="btn-outline" onClick={onClose}>Cancelar</button>
            <button className="btn-primary" onClick={handleSubmit}>Registrar Gasto</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
