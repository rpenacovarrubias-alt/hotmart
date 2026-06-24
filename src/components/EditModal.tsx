import { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockUsers } from '../data/mockData';
import type { EditCategory } from '../context/AppContext';
import type { Property, TaskStatus, TaskType, ExpenseCategory } from '../types';

// ── Local form state types ─────────────────────────────────────────────────────

type PropForm = {
  name: string; location: string; type: Property['type']; description: string;
  imageUrl: string; hostName: string; commissionRate: number; status: Property['status'];
};

type ExpForm = {
  date: string; propertyId: string; category: ExpenseCategory;
  description: string; amount: string;
  paymentMethod: 'Efectivo' | 'Transferencia' | 'Tarjeta';
};

type TaskForm = {
  title: string; type: TaskType; propertyId: string; description: string;
  assignedTo: string; date: string; priority: 'Normal' | 'Urgente'; status: TaskStatus;
  cost: string;
};

type RepForm = {
  reportLabel: string; period: string; property_id: string;
  notes: string; periodType: 'Semanal' | 'Mensual' | 'Trimestral' | 'Anual';
};

// ── Constants ─────────────────────────────────────────────────────────────────

const EXP_LABELS: Record<ExpenseCategory, string> = {
  cleaning: 'Limpieza', maintenance: 'Mantenimiento', supplies: 'Insumos',
  platform_fee: 'Comisión Plataforma', utilities: 'Servicios',
  repairs: 'Reparaciones', other: 'Otros',
};

const CAT_META: Record<EditCategory, { icon: string; label: string; color: string; bg: string }> = {
  propiedad: { icon: '🏠', label: 'Propiedad', color: '#FF5A5F', bg: 'rgba(255,90,95,0.08)' },
  gasto:     { icon: '💸', label: 'Gasto',     color: '#FC642D', bg: 'rgba(252,100,45,0.08)' },
  tarea:     { icon: '✅', label: 'Tarea',     color: '#00A699', bg: 'rgba(0,166,153,0.08)'  },
  reporte:   { icon: '📊', label: 'Reporte',   color: '#6B5BFF', bg: 'rgba(107,91,255,0.08)' },
};

const STEP_LABEL: Record<1 | 2 | 3, string> = {
  1: 'Selecciona categoría',
  2: 'Selecciona registro',
  3: 'Edita los datos',
};

const DEFAULT_PROP: PropForm = {
  name: '', location: '', type: 'departamento', description: '',
  imageUrl: '', hostName: '', commissionRate: 15, status: 'activo',
};
const DEFAULT_EXP: ExpForm = {
  date: '', propertyId: '', category: 'cleaning',
  description: '', amount: '', paymentMethod: 'Efectivo',
};
const DEFAULT_TASK: TaskForm = {
  title: '', type: 'Limpieza', propertyId: '', description: '',
  assignedTo: '', date: '', priority: 'Normal', status: 'Pendiente', cost: '',
};
const DEFAULT_REP: RepForm = {
  reportLabel: '', period: '', property_id: '', notes: '', periodType: 'Mensual',
};

// ── Shared style helpers ───────────────────────────────────────────────────────

const field: React.CSSProperties = { marginBottom: '16px' };
const lbl: React.CSSProperties   = { display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' };

const inp = (err?: boolean): React.CSSProperties => ({
  width: '100%', padding: '10px 14px', fontFamily: 'inherit', fontSize: '14px',
  border: `1.5px solid ${err ? '#EF4444' : 'var(--border-color)'}`,
  borderRadius: '10px', outline: 'none', background: 'white', transition: 'border-color 0.2s',
});

const staff = mockUsers.filter(u => u.role === 'cleaning_staff' || u.role === 'maintenance_staff');

// ── Component ─────────────────────────────────────────────────────────────────

const EditModal = () => {
  const {
    properties, tasks, expenses, adminRecords,
    updateProperty, updateTask, updateExpense, updateAdminRecord, addExpense,
    editModalPreselect, closeEditModal, showToast,
  } = useApp();

  const fromInline = editModalPreselect !== null;

  const [step, setStep]           = useState<1 | 2 | 3>(fromInline ? 3 : 1);
  const [category, setCategory]   = useState<EditCategory | null>(editModalPreselect?.category ?? null);
  const [selectedId, setSelectedId] = useState<string>(editModalPreselect?.itemId ?? '');
  const [search, setSearch]       = useState('');
  const [imgError, setImgError]   = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const [propForm, setPropForm]   = useState<PropForm>(DEFAULT_PROP);
  const [expForm, setExpForm]     = useState<ExpForm>(DEFAULT_EXP);
  const [taskForm, setTaskForm]   = useState<TaskForm>(DEFAULT_TASK);
  const [repForm, setRepForm]     = useState<RepForm>(DEFAULT_REP);

  // Populate form whenever selectedId + category resolves
  useEffect(() => {
    if (!category || !selectedId) return;
    setErrors({});
    setImgError(false);

    if (category === 'propiedad') {
      const p = properties.find(x => x.id === selectedId);
      if (p) setPropForm({
        name: p.name, location: p.location, type: p.type,
        description: p.description ?? '', imageUrl: p.imageUrl,
        hostName: p.hostName, commissionRate: p.commissionRate, status: p.status,
      });
    } else if (category === 'gasto') {
      const e = expenses.find(x => x.id === selectedId);
      if (e) setExpForm({
        date: e.date, propertyId: e.propertyId, category: e.category,
        description: e.description, amount: String(e.amount),
        paymentMethod: e.paymentMethod ?? 'Efectivo',
      });
    } else if (category === 'tarea') {
      const t = tasks.find(x => x.id === selectedId);
      if (t) setTaskForm({
        title: t.title, type: t.type, propertyId: t.propertyId,
        description: t.description, assignedTo: t.assignedTo,
        date: t.date, priority: t.priority ?? 'Normal', status: t.status,
        cost: t.cost != null ? String(t.cost) : '',
      });
    } else if (category === 'reporte') {
      const r = adminRecords.find(x => x.id === selectedId);
      if (r) setRepForm({
        reportLabel: r.reportLabel ?? `${r.property_name} — ${r.period}`,
        period: r.period, property_id: r.property_id,
        notes: r.notes ?? '', periodType: r.periodType ?? 'Mensual',
      });
    }
  }, [selectedId, category, properties, tasks, expenses, adminRecords]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const propName = (id: string) => properties.find(p => p.id === id)?.name ?? '—';

  const recordLabel = (): string => {
    if (!category || !selectedId) return '';
    if (category === 'propiedad') return properties.find(p => p.id === selectedId)?.name ?? '';
    if (category === 'gasto') {
      const e = expenses.find(x => x.id === selectedId);
      return e ? `${EXP_LABELS[e.category]} — ${e.description}` : '';
    }
    if (category === 'tarea') return tasks.find(t => t.id === selectedId)?.title ?? '';
    if (category === 'reporte') {
      const r = adminRecords.find(x => x.id === selectedId);
      return r ? (r.reportLabel ?? `${r.property_name} — ${r.period}`) : '';
    }
    return '';
  };

  const getItems = () => {
    if (!category) return [] as { id: string; label: string; sub: string }[];
    const q = search.toLowerCase();

    if (category === 'propiedad') {
      return properties
        .filter(p => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q))
        .map(p => ({
          id: p.id, label: p.name,
          sub: `${p.location} · ${p.status === 'activo' ? 'Activa' : p.status === 'inactivo' ? 'Inactiva' : 'En mantenimiento'}`,
        }));
    }
    if (category === 'gasto') {
      return expenses
        .filter(e => e.description.toLowerCase().includes(q) || propName(e.propertyId).toLowerCase().includes(q))
        .slice(0, 40)
        .map(e => ({
          id: e.id, label: e.description,
          sub: `${new Date(e.date).toLocaleDateString('es-MX')} · ${propName(e.propertyId)} · ${EXP_LABELS[e.category]} · $${e.amount.toLocaleString('es-MX')}`,
        }));
    }
    if (category === 'tarea') {
      return tasks
        .filter(t =>
          t.title.toLowerCase().includes(q) ||
          t.assignedTo.toLowerCase().includes(q) ||
          propName(t.propertyId).toLowerCase().includes(q)
        )
        .slice(0, 40)
        .map(t => ({
          id: t.id, label: t.title,
          sub: `${propName(t.propertyId)} · ${t.status} · ${new Date(t.date).toLocaleDateString('es-MX')}`,
        }));
    }
    if (category === 'reporte') {
      return adminRecords
        .filter(r => r.property_name.toLowerCase().includes(q) || r.period.toLowerCase().includes(q))
        .map(r => ({
          id: r.id,
          label: r.reportLabel ?? `${r.property_name} — ${r.period}`,
          sub: `${r.property_name} · ${r.period}`,
        }));
    }
    return [] as { id: string; label: string; sub: string }[];
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = () => {
    const errs: Record<string, string> = {};

    if (category === 'propiedad') {
      if (!propForm.name.trim())     errs.name     = 'Requerido';
      if (!propForm.location.trim()) errs.location = 'Requerido';
      if (Object.keys(errs).length) { setErrors(errs); return; }
      const base = properties.find(p => p.id === selectedId)!;
      updateProperty({
        ...base,
        name: propForm.name.trim(),
        location: propForm.location.trim(),
        type: propForm.type,
        description: propForm.description.trim() || undefined,
        imageUrl: propForm.imageUrl.trim(),
        hostName: propForm.hostName.trim(),
        commissionRate: propForm.commissionRate,
        status: propForm.status,
      });
      showToast(`${propForm.name.trim()} actualizado correctamente`);

    } else if (category === 'gasto') {
      if (!expForm.propertyId)         errs.propertyId  = 'Requerido';
      if (!expForm.description.trim()) errs.description = 'Requerido';
      const amt = parseFloat(expForm.amount);
      if (isNaN(amt) || amt <= 0) errs.amount = 'Ingresa un monto válido';
      if (Object.keys(errs).length) { setErrors(errs); return; }
      const base = expenses.find(e => e.id === selectedId)!;
      updateExpense({
        ...base,
        date: expForm.date, propertyId: expForm.propertyId,
        category: expForm.category, description: expForm.description.trim(),
        amount: amt, paymentMethod: expForm.paymentMethod,
      });
      showToast(`${expForm.description.trim()} actualizado correctamente`);

    } else if (category === 'tarea') {
      if (!taskForm.propertyId)         errs.propertyId  = 'Requerido';
      if (!taskForm.description.trim()) errs.description = 'Requerido';
      if (!taskForm.assignedTo)         errs.assignedTo  = 'Requerido';
      if (!taskForm.date)               errs.date        = 'Requerido';
      if (Object.keys(errs).length) { setErrors(errs); return; }
      const base = tasks.find(t => t.id === selectedId)!;
      const derivedTitle = taskForm.title.trim() || `${taskForm.type} – ${propName(taskForm.propertyId)}`;
      const parsedCost = parseFloat(taskForm.cost);
      const newCost = !isNaN(parsedCost) && parsedCost > 0 ? parsedCost : undefined;
      updateTask({
        ...base,
        title: derivedTitle, type: taskForm.type, propertyId: taskForm.propertyId,
        description: taskForm.description.trim(), assignedTo: taskForm.assignedTo,
        date: taskForm.date, priority: taskForm.priority, status: taskForm.status,
        cost: newCost,
      });
      if (taskForm.status === 'Completado' && base.status !== 'Completado' && newCost && newCost > 0) {
        const catMap: Record<string, import('../types').ExpenseCategory> = {
          Limpieza: 'cleaning', Mantenimiento: 'maintenance', 'Revisión': 'maintenance',
        };
        addExpense({
          id: `exp_task_${selectedId}_${Date.now()}`,
          propertyId: taskForm.propertyId,
          category: catMap[taskForm.type] ?? 'other',
          description: `[Tarea] ${derivedTitle}`,
          amount: newCost,
          date: new Date().toISOString().split('T')[0],
          createdBy: taskForm.assignedTo,
          createdAt: new Date().toISOString(),
        });
      }
      showToast(`${derivedTitle} actualizada correctamente`);

    } else if (category === 'reporte') {
      if (!repForm.period.trim()) errs.period = 'Requerido';
      if (Object.keys(errs).length) { setErrors(errs); return; }
      const base = adminRecords.find(r => r.id === selectedId)!;
      const resolvedName = properties.find(p => p.id === repForm.property_id)?.name ?? base.property_name;
      updateAdminRecord({
        ...base,
        period: repForm.period.trim(),
        property_id: repForm.property_id || base.property_id,
        property_name: repForm.property_id ? resolvedName : base.property_name,
        reportLabel: repForm.reportLabel.trim() || undefined,
        notes: repForm.notes.trim() || undefined,
        periodType: repForm.periodType,
      });
      showToast(`${repForm.reportLabel.trim() || repForm.period.trim()} actualizado correctamente`);
    }

    closeEditModal();
  };

  const handleBack = () => {
    setErrors({});
    if (step === 3) {
      if (fromInline) { closeEditModal(); return; }
      setStep(2);
    } else if (step === 2) {
      setStep(1);
      setSelectedId('');
      setSearch('');
    }
  };

  // ── Step 1 ─────────────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
      {(Object.entries(CAT_META) as [EditCategory, typeof CAT_META[EditCategory]][]).map(([key, m]) => (
        <button
          key={key}
          onClick={() => { setCategory(key); setSelectedId(''); setSearch(''); setStep(2); }}
          style={{
            background: 'var(--bg-color)',
            border: `2px solid var(--border-color)`,
            borderRadius: '12px', padding: '24px 16px', cursor: 'pointer',
            textAlign: 'left', transition: 'all 0.16s', fontFamily: 'inherit',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = m.color;
            (e.currentTarget as HTMLButtonElement).style.background  = m.bg;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)';
            (e.currentTarget as HTMLButtonElement).style.background  = 'var(--bg-color)';
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>{m.icon}</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{m.label}</div>
        </button>
      ))}
    </div>
  );

  // ── Step 2 ─────────────────────────────────────────────────────────────────

  const renderStep2 = () => {
    const items = getItems();
    const accent = category ? CAT_META[category].color : 'var(--primary)';
    const accentBg = category ? CAT_META[category].bg : 'var(--bg-color)';

    return (
      <div>
        <input
          type="text"
          placeholder="Buscar registro..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inp(), marginBottom: '12px' }}
          autoFocus
        />
        <div style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
          {items.length === 0 ? (
            <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No se encontraron registros
            </div>
          ) : items.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => { setSelectedId(item.id); setStep(3); }}
              style={{
                width: '100%', padding: '13px 16px', background: 'none', border: 'none',
                borderBottom: idx < items.length - 1 ? '1px solid var(--border-color)' : 'none',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', gap: '3px', transition: 'background 0.13s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = accentBg;
                (e.currentTarget as HTMLButtonElement).style.color = accent;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'none';
                (e.currentTarget as HTMLButtonElement).style.color = 'inherit';
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>{item.label}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.sub}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ── Step 3 forms ───────────────────────────────────────────────────────────

  const renderPropForm = () => (
    <>
      <div style={field}>
        <label style={lbl}>Nombre <span style={{ color: '#EF4444' }}>*</span></label>
        <input style={inp(!!errors.name)} value={propForm.name}
          onChange={e => setPropForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Casa Grande Puerta Real" />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div style={field}>
        <label style={lbl}>Ubicación / Colonia Ciudad <span style={{ color: '#EF4444' }}>*</span></label>
        <input style={inp(!!errors.location)} value={propForm.location}
          onChange={e => setPropForm(f => ({ ...f, location: e.target.value }))}
          placeholder="Puerta Real, Qro" />
        {errors.location && <span className="form-error">{errors.location}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', ...field }}>
        <div>
          <label style={lbl}>Tipo</label>
          <select style={inp()} value={propForm.type}
            onChange={e => setPropForm(f => ({ ...f, type: e.target.value as Property['type'] }))}>
            <option value="casa">Casa</option>
            <option value="departamento">Departamento</option>
            <option value="loft">Loft</option>
            <option value="hotel">Hotel</option>
            <option value="villa">Villa</option>
            <option value="suite">Suite</option>
            <option value="habitación">Habitación</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Estado</label>
          <select style={inp()} value={propForm.status}
            onChange={e => setPropForm(f => ({ ...f, status: e.target.value as Property['status'] }))}>
            <option value="activo">Activa</option>
            <option value="inactivo">Inactiva</option>
            <option value="mantenimiento">En mantenimiento</option>
          </select>
        </div>
      </div>

      <div style={field}>
        <label style={lbl}>Descripción corta</label>
        <textarea rows={3} style={{ ...inp(), resize: 'vertical' as const }} value={propForm.description}
          onChange={e => setPropForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Descripción breve de la propiedad..." />
      </div>

      <div style={field}>
        <label style={lbl}>Imagen de portada</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input style={{ ...inp(), flex: 1 }} value={propForm.imageUrl}
            onChange={e => { setPropForm(f => ({ ...f, imageUrl: e.target.value })); setImgError(false); }}
            placeholder="URL de la imagen o selecciona un archivo..." />
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <button className="btn-outline" type="button" style={{ height: '100%', whiteSpace: 'nowrap', padding: '10px 14px' }}>Subir Archivo</button>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => {
                  setPropForm(f => ({ ...f, imageUrl: reader.result as string }));
                  setImgError(false);
                };
                reader.readAsDataURL(file);
              }}
              style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
            />
          </div>
        </div>
        {propForm.imageUrl && !imgError && (
          <img src={propForm.imageUrl} alt="Preview" onError={() => setImgError(true)}
            style={{ marginTop: 8, width: '100%', height: 110, objectFit: 'cover', borderRadius: 8 }} />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={lbl}>Propietario / Contacto</label>
          <input style={inp()} value={propForm.hostName}
            onChange={e => setPropForm(f => ({ ...f, hostName: e.target.value }))}
            placeholder="Juan Pérez" />
        </div>
        <div>
          <label style={lbl}>Comisión co-host %</label>
          <input type="number" min={0} max={100} style={inp()} value={propForm.commissionRate}
            onChange={e => setPropForm(f => ({ ...f, commissionRate: Number(e.target.value) }))} />
        </div>
      </div>
    </>
  );

  const renderExpForm = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', ...field }}>
        <div>
          <label style={lbl}>Fecha</label>
          <input type="date" style={inp()} value={expForm.date}
            onChange={e => setExpForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div>
          <label style={lbl}>Método de pago</label>
          <select style={inp()} value={expForm.paymentMethod}
            onChange={e => setExpForm(f => ({ ...f, paymentMethod: e.target.value as ExpForm['paymentMethod'] }))}>
            <option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option>
          </select>
        </div>
      </div>

      <div style={field}>
        <label style={lbl}>Propiedad <span style={{ color: '#EF4444' }}>*</span></label>
        <select style={inp(!!errors.propertyId)} value={expForm.propertyId}
          onChange={e => setExpForm(f => ({ ...f, propertyId: e.target.value }))}>
          <option value="">Seleccionar...</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {errors.propertyId && <span className="form-error">{errors.propertyId}</span>}
      </div>

      <div style={field}>
        <label style={lbl}>Categoría</label>
        <select style={inp()} value={expForm.category}
          onChange={e => setExpForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}>
          {(Object.entries(EXP_LABELS) as [ExpenseCategory, string][]).map(([k, v]) =>
            <option key={k} value={k}>{v}</option>
          )}
        </select>
      </div>

      <div style={field}>
        <label style={lbl}>Descripción <span style={{ color: '#EF4444' }}>*</span></label>
        <input style={inp(!!errors.description)} value={expForm.description}
          onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Descripción del gasto..." />
        {errors.description && <span className="form-error">{errors.description}</span>}
      </div>

      <div style={field}>
        <label style={lbl}>Monto MXN <span style={{ color: '#EF4444' }}>*</span></label>
        <input type="number" min={0} step={0.01} style={inp(!!errors.amount)} value={expForm.amount}
          onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))}
          placeholder="0.00" />
        {errors.amount && <span className="form-error">{errors.amount}</span>}
      </div>
    </>
  );

  const renderTaskForm = () => (
    <>
      <div style={field}>
        <label style={lbl}>Título de tarea</label>
        <input style={inp()} value={taskForm.title}
          onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Limpieza post check-out..." />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', ...field }}>
        <div>
          <label style={lbl}>Tipo</label>
          <select style={inp()} value={taskForm.type}
            onChange={e => setTaskForm(f => ({ ...f, type: e.target.value as TaskType }))}>
            <option>Limpieza</option><option>Mantenimiento</option>
            <option>Revisión</option><option>Otro</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Prioridad</label>
          <select style={inp()} value={taskForm.priority}
            onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value as 'Normal' | 'Urgente' }))}>
            <option>Normal</option><option>Urgente</option>
          </select>
        </div>
      </div>

      <div style={field}>
        <label style={lbl}>Propiedad <span style={{ color: '#EF4444' }}>*</span></label>
        <select style={inp(!!errors.propertyId)} value={taskForm.propertyId}
          onChange={e => setTaskForm(f => ({ ...f, propertyId: e.target.value }))}>
          <option value="">Seleccionar...</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {errors.propertyId && <span className="form-error">{errors.propertyId}</span>}
      </div>

      <div style={field}>
        <label style={lbl}>Descripción <span style={{ color: '#EF4444' }}>*</span></label>
        <textarea rows={3} style={{ ...inp(!!errors.description), resize: 'vertical' as const }}
          value={taskForm.description}
          onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Descripción detallada..." />
        {errors.description && <span className="form-error">{errors.description}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', ...field }}>
        <div>
          <label style={lbl}>Asignado a <span style={{ color: '#EF4444' }}>*</span></label>
          <select style={inp(!!errors.assignedTo)} value={taskForm.assignedTo}
            onChange={e => setTaskForm(f => ({ ...f, assignedTo: e.target.value }))}>
            <option value="">Seleccionar...</option>
            {staff.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
          {errors.assignedTo && <span className="form-error">{errors.assignedTo}</span>}
        </div>
        <div>
          <label style={lbl}>Fecha programada <span style={{ color: '#EF4444' }}>*</span></label>
          <input type="date" style={inp(!!errors.date)} value={taskForm.date}
            onChange={e => setTaskForm(f => ({ ...f, date: e.target.value }))} />
          {errors.date && <span className="form-error">{errors.date}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', ...field }}>
        <div>
          <label style={lbl}>Estado</label>
          <select style={inp()} value={taskForm.status}
            onChange={e => setTaskForm(f => ({ ...f, status: e.target.value as TaskStatus }))}>
            <option value="Pendiente">Pendiente</option>
            <option value="En Progreso">En Progreso</option>
            <option value="Completado">Completado</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Costo (MXN)</label>
          <input type="number" min={0} step={0.01} style={inp()} value={taskForm.cost}
            onChange={e => setTaskForm(f => ({ ...f, cost: e.target.value }))}
            placeholder="0.00" />
        </div>
      </div>
    </>
  );

  const renderRepForm = () => (
    <>
      <div style={field}>
        <label style={lbl}>Nombre del reporte</label>
        <input style={inp()} value={repForm.reportLabel}
          onChange={e => setRepForm(f => ({ ...f, reportLabel: e.target.value }))}
          placeholder="Reporte Mayo 2026 — Casa Mora" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', ...field }}>
        <div>
          <label style={lbl}>Período <span style={{ color: '#EF4444' }}>*</span></label>
          <input style={inp(!!errors.period)} value={repForm.period}
            onChange={e => setRepForm(f => ({ ...f, period: e.target.value }))}
            placeholder="Mayo 2026" />
          {errors.period && <span className="form-error">{errors.period}</span>}
        </div>
        <div>
          <label style={lbl}>Tipo de período</label>
          <select style={inp()} value={repForm.periodType}
            onChange={e => setRepForm(f => ({ ...f, periodType: e.target.value as RepForm['periodType'] }))}>
            <option>Semanal</option><option>Mensual</option>
            <option>Trimestral</option><option>Anual</option>
          </select>
        </div>
      </div>

      <div style={field}>
        <label style={lbl}>Propiedad relacionada</label>
        <select style={inp()} value={repForm.property_id}
          onChange={e => setRepForm(f => ({ ...f, property_id: e.target.value }))}>
          <option value="">Sin propiedad específica</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div style={field}>
        <label style={lbl}>Notas / Observaciones</label>
        <textarea rows={4} style={{ ...inp(), resize: 'vertical' as const }} value={repForm.notes}
          onChange={e => setRepForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Observaciones adicionales sobre este reporte..." />
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      {category && (
        <div style={{
          background: CAT_META[category].bg, color: CAT_META[category].color,
          padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
          marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          {CAT_META[category].icon} Editando: {recordLabel()}
        </div>
      )}
      {category === 'propiedad' && renderPropForm()}
      {category === 'gasto'     && renderExpForm()}
      {category === 'tarea'     && renderTaskForm()}
      {category === 'reporte'   && renderRepForm()}
    </>
  );

  // ── Main render ────────────────────────────────────────────────────────────

  const showBack = step > 1 || fromInline;

  return (
    <div className="modal-overlay" onClick={closeEditModal}>
      <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {showBack && (
              <button className="modal-close" onClick={handleBack} style={{ padding: '6px', marginRight: '2px' }} title="Atrás">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                Paso {step} de 3 — {STEP_LABEL[step]}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>✏️ Editar Registro</h3>
            </div>
          </div>
          <button className="modal-close" onClick={closeEditModal}><X size={24} /></button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer — only visible on step 3 */}
        {step === 3 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1 }} />
            <button
              onClick={closeEditModal}
              style={{ background: 'none', border: '1.5px solid var(--border-color)', borderRadius: '10px', padding: '9px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'inherit' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{ background: '#EF4444', color: 'white', border: 'none', borderRadius: '10px', padding: '9px 22px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'inherit' }}
            >
              Guardar Cambios
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditModal;
