import { useState } from 'react';
import { X, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { DeleteCategory } from '../context/AppContext';

// ─── Category metadata ────────────────────────────────────────────────────────
const CATEGORIES: Array<{ id: DeleteCategory; emoji: string; label: string; accent: string }> = [
  { id: 'propiedad', emoji: '🏠', label: 'Propiedad',       accent: '#00A699' },
  { id: 'gasto',     emoji: '💸', label: 'Gasto',           accent: '#FC642D' },
  { id: 'tarea',     emoji: '✅', label: 'Tarea',           accent: '#6B5BFF' },
  { id: 'reporte',   emoji: '📊', label: 'Reporte',         accent: '#FF5A5F' },
];

const CAT_LABEL: Record<DeleteCategory, string> = {
  propiedad: 'Propiedad',
  gasto:     'Gasto',
  tarea:     'Tarea',
  reporte:   'Reporte',
};

// ─── Per-category item builders ───────────────────────────────────────────────
interface ListItem { id: string; label: string; sublabel: string }

// ─── Component ────────────────────────────────────────────────────────────────
const DeleteModal = () => {
  const {
    properties, tasks, expenses, adminRecords,
    deleteProperty, deleteTask, deleteExpense, deleteAdminRecord,
    deleteModalPreselect, closeDeleteModal,
  } = useApp();

  const fromInline = deleteModalPreselect?.fromInline ?? false;

  const [step, setStep]                       = useState<1 | 2 | 3>(fromInline ? 3 : 1);
  const [selectedCategory, setSelectedCategory] = useState<DeleteCategory | null>(
    deleteModalPreselect?.category ?? null
  );
  const [selectedItemId, setSelectedItemId]   = useState<string | null>(
    deleteModalPreselect?.itemId ?? null
  );
  const [search, setSearch]                   = useState('');
  const [isDeleting, setIsDeleting]           = useState(false);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getPropName = (id: string) => properties.find(p => p.id === id)?.name ?? '—';

  const getItems = (cat: DeleteCategory): ListItem[] => {
    switch (cat) {
      case 'propiedad':
        return properties.map(p => ({ id: p.id, label: p.name, sublabel: p.location }));
      case 'gasto':
        return expenses.map(e => ({
          id: e.id,
          label: `$${e.amount.toFixed(2)}`,
          sublabel: `${new Date(e.date).toLocaleDateString('es-MX')} · ${getPropName(e.propertyId)}`,
        }));
      case 'tarea':
        return tasks.map(t => ({
          id: t.id,
          label: t.title,
          sublabel: `${getPropName(t.propertyId)} · ${t.status}`,
        }));
      case 'reporte':
        return adminRecords.map(r => ({
          id: r.id,
          label: r.property_name,
          sublabel: r.period,
        }));
    }
  };

  const getItemLabel = (cat: DeleteCategory, itemId: string): string => {
    const item = getItems(cat).find(x => x.id === itemId);
    if (!item) return 'elemento desconocido';
    return cat === 'gasto' ? `${item.label} — ${item.sublabel}` : item.label;
  };

  // ── Delete handler ──────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (!selectedCategory || !selectedItemId || isDeleting) return;
    setIsDeleting(true);
    setTimeout(() => {
      switch (selectedCategory) {
        case 'propiedad': deleteProperty(selectedItemId);    break;
        case 'gasto':     deleteExpense(selectedItemId);     break;
        case 'tarea':     deleteTask(selectedItemId);        break;
        case 'reporte':   deleteAdminRecord(selectedItemId); break;
      }
      closeDeleteModal();
    }, 700);
  };

  // ── Step helpers ─────────────────────────────────────────────────────────────
  const handleCategorySelect = (cat: DeleteCategory) => {
    setSelectedCategory(cat);
    setSelectedItemId(null);
    setSearch('');
    setStep(2);
  };

  const handleItemSelect = (id: string) => {
    setSelectedItemId(id);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 3) {
      if (fromInline) { closeDeleteModal(); return; }
      setStep(2);
    } else if (step === 2) {
      setStep(1);
      setSelectedCategory(null);
      setSearch('');
    }
  };

  const stepTitle: Record<number, string> = {
    1: '¿Qué deseas eliminar?',
    2: `Seleccionar ${selectedCategory ? CAT_LABEL[selectedCategory] : ''}`,
    3: 'Confirmar eliminación',
  };

  // ── Filtered items in step 2 ─────────────────────────────────────────────────
  const allItems = selectedCategory ? getItems(selectedCategory) : [];
  const filteredItems = allItems.filter(item => {
    const q = search.toLowerCase();
    return item.label.toLowerCase().includes(q) || item.sublabel.toLowerCase().includes(q);
  });

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={() => !isDeleting && closeDeleteModal()}>
      <div
        className="modal-content"
        style={{ maxWidth: '500px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {step > 1 && (
              <button
                className="modal-close"
                onClick={handleBack}
                disabled={isDeleting}
                style={{ padding: '6px', marginRight: '2px' }}
                title="Atrás"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{stepTitle[step]}</h3>
          </div>
          <button className="modal-close" onClick={() => !isDeleting && closeDeleteModal()}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* ── STEP 1: Category grid ── */}
          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  style={{
                    background: 'var(--bg-color)',
                    border: `2px solid var(--border-color)`,
                    borderRadius: '12px',
                    padding: '28px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.18s ease',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = cat.accent;
                    (e.currentTarget as HTMLButtonElement).style.background = cat.accent + '12';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-color)';
                  }}
                >
                  <span style={{ fontSize: '36px', lineHeight: 1 }}>{cat.emoji}</span>
                  <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-main)' }}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ── STEP 2: Item list ── */}
          {step === 2 && selectedCategory && (
            <>
              {/* Search */}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Buscar ${CAT_LABEL[selectedCategory].toLowerCase()}...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Scrollable item list */}
              <div style={{
                maxHeight: '340px',
                overflowY: 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
              }}>
                {filteredItems.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    {allItems.length === 0
                      ? `No hay ${CAT_LABEL[selectedCategory].toLowerCase()}s registrados.`
                      : 'Sin resultados para la búsqueda.'}
                  </div>
                ) : (
                  filteredItems.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemSelect(item.id)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'none',
                        border: 'none',
                        borderBottom: idx < filteredItems.length - 1 ? '1px solid var(--border-color)' : 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-color)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {item.sublabel}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}

          {/* ── STEP 3: Confirmation ── */}
          {step === 3 && selectedCategory && selectedItemId && (
            <>
              {/* Warning icon area */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '28px',
                paddingTop: '8px',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Trash2 size={28} color="#EF4444" />
                </div>

                <p style={{
                  textAlign: 'center',
                  fontSize: '15px',
                  color: 'var(--text-main)',
                  lineHeight: 1.6,
                  maxWidth: '360px',
                }}>
                  ¿Estás seguro de que deseas eliminar{' '}
                  <strong>"{getItemLabel(selectedCategory, selectedItemId)}"</strong>?{' '}
                  <span style={{ color: 'var(--text-muted)' }}>
                    Esta acción no se puede deshacer.
                  </span>
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn-outline"
                  style={{ flex: 1 }}
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  style={{
                    flex: 1,
                    background: isDeleting ? '#f87171' : '#EF4444',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Sí, eliminar
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
