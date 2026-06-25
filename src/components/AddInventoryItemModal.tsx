import { useState } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Property, InventoryCategory, InventoryItem } from '../types';

interface Props {
  properties: Property[];
  categories: InventoryCategory[];
  initialPropertyId: string;
  onAdd: (item: InventoryItem) => void;
  onClose: () => void;
}

const PLACEHOLDERS: Record<string, string> = {
  cat_1: 'Ej: Sábana matrimonial',
  cat_2: 'Ej: Sartén antiadherente',
  cat_3: 'Ej: Escoba y recogedor',
  cat_4: 'Ej: Shampoo mini',
  cat_5: 'Ej: Desatornillador',
  cat_6: 'Ej: Control universal',
  cat_7: 'Ej: Manguera de jardín',
  cat_8: 'Ej: Artículo...',
};

const AddInventoryItemModal = ({ properties, categories, initialPropertyId, onAdd, onClose }: Props) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [propertyId, setPropertyId] = useState(initialPropertyId);
  const [categoryId, setCategoryId] = useState('');

  // Step 2
  const [name, setName]         = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit]         = useState('');
  const [notes, setNotes]       = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const selectedCat = categories.find(c => c.id === categoryId);

  const clearErr = (field: string) =>
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  const handleNext = () => {
    const e: Record<string, string> = {};
    if (!propertyId) e.propertyId = 'Selecciona una propiedad';
    if (!categoryId) e.categoryId = 'Selecciona una categoría';
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(2);
  };

  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!name.trim())           e.name     = 'Escribe el nombre del artículo';
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) e.quantity = 'Debe ser mayor a 0';
    if (Object.keys(e).length) { setErrors(e); return; }

    onAdd({
      id:        `inv_${Date.now()}`,
      categoryId,
      propertyId,
      name:      name.trim(),
      quantity:  qty,
      unit:      unit.trim() || undefined,
      notes:     notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
    toast.success(`"${name.trim()}" agregado al inventario`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>

        {/* Header */}
        <div className="modal-header" style={{ paddingBottom: 0 }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Nuevo Artículo</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Paso {step} de 2 —&nbsp;
              {step === 1 ? 'Selecciona propiedad y categoría' : `${selectedCat?.icon} ${selectedCat?.name}`}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={24} /></button>
        </div>

        {/* Progress bar */}
        <div style={{ height: '3px', background: '#e8e8e8', margin: '10px 24px 0' }}>
          <div style={{
            height: '100%',
            width: step === 1 ? '50%' : '100%',
            background: 'var(--primary)',
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }} />
        </div>

        <div className="modal-body">

          {/* ── STEP 1 ───────────────────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">
                  Propiedad <span style={{ color: 'var(--primary)' }}>*</span>
                </label>
                <select
                  className="form-input"
                  value={propertyId}
                  onChange={e => { setPropertyId(e.target.value); clearErr('propertyId'); }}
                  style={errors.propertyId ? { borderColor: 'var(--primary)' } : {}}
                >
                  <option value="">Seleccionar propiedad...</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {errors.propertyId && <span className="form-error">{errors.propertyId}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Categoría <span style={{ color: 'var(--primary)' }}>*</span>
                </label>
                <select
                  className="form-input"
                  value={categoryId}
                  onChange={e => { setCategoryId(e.target.value); clearErr('categoryId'); }}
                  style={errors.categoryId ? { borderColor: 'var(--primary)' } : {}}
                >
                  <option value="">Seleccionar categoría...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
              </div>

              {/* Visual category pills */}
              <div style={{ marginTop: '4px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px' }}>
                  O toca directo:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {categories.map(c => {
                    const active = categoryId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setCategoryId(c.id); clearErr('categoryId'); }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: `1.5px solid ${active ? c.color : `${c.color}50`}`,
                          background: active ? c.color : `${c.color}12`,
                          color: active ? 'white' : c.color,
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: active ? 600 : 500,
                          fontFamily: 'inherit',
                          transition: 'all 0.15s',
                        }}
                      >
                        {c.icon} {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button className="btn-outline" onClick={onClose}>Cancelar</button>
                <button className="btn-primary" onClick={handleNext}>
                  Siguiente <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2 ───────────────────────────────────────────────────────── */}
          {step === 2 && (
            <>
              {/* Category badge */}
              {selectedCat && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '6px 14px', borderRadius: '20px', marginBottom: '18px',
                  background: `${selectedCat.color}15`,
                  border: `1.5px solid ${selectedCat.color}40`,
                  color: selectedCat.color, fontWeight: 600, fontSize: '13px',
                }}>
                  <span>{selectedCat.icon}</span> {selectedCat.name}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  Nombre del artículo <span style={{ color: 'var(--primary)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={PLACEHOLDERS[categoryId] ?? 'Nombre del artículo...'}
                  value={name}
                  onChange={e => { setName(e.target.value); clearErr('name'); }}
                  style={errors.name ? { borderColor: 'var(--primary)' } : {}}
                  autoFocus
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">
                    Cantidad <span style={{ color: 'var(--primary)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="form-input"
                    value={quantity}
                    onChange={e => { setQuantity(e.target.value); clearErr('quantity'); }}
                    style={errors.quantity ? { borderColor: 'var(--primary)' } : {}}
                  />
                  {errors.quantity && <span className="form-error">{errors.quantity}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Unidad (opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="piezas, juegos..."
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notas (opcional)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Ej: Cuarto principal, estado: buen uso..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '8px' }}>
                <button className="btn-outline" onClick={() => { setStep(1); setErrors({}); }}>
                  <ArrowLeft size={16} /> Atrás
                </button>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-outline" onClick={onClose}>Cancelar</button>
                  <button className="btn-primary" onClick={handleSave}>
                    Guardar artículo
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddInventoryItemModal;
