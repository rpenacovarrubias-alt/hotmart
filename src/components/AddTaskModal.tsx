import { useState } from 'react';
import { X } from 'lucide-react';
import { mockProperties, mockUsers } from '../data/mockData';
import type { Task, TaskType } from '../types';

interface Props {
  onAdd: (task: Task) => void;
  onClose: () => void;
}

const TASK_TYPES: TaskType[] = ['Limpieza', 'Mantenimiento', 'Revisión', 'Otro'];

const AddTaskModal = ({ onAdd, onClose }: Props) => {
  const [type, setType]         = useState<TaskType>('Limpieza');
  const [propertyId, setPropertyId] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo]   = useState('');
  const [date, setDate]           = useState('');
  const [priority, setPriority]   = useState<'Normal' | 'Urgente'>('Normal');
  const [cost, setCost]           = useState('');
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const staff = mockUsers.filter(
    u => u.role === 'cleaning_staff' || u.role === 'maintenance_staff'
  );

  const clearError = (field: string) =>
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!propertyId)          e.propertyId  = 'Selecciona una propiedad';
    if (!description.trim())  e.description = 'La descripción es requerida';
    if (!assignedTo)          e.assignedTo  = 'Selecciona a quién asignar';
    if (!date)                e.date        = 'La fecha es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const property = mockProperties.find(p => p.id === propertyId);
    const parsedCost = parseFloat(cost);
    onAdd({
      id:          `t${Date.now()}`,
      propertyId,
      title:       `${type} – ${property?.name ?? ''}`,
      description: description.trim(),
      status:      'Pendiente',
      type,
      assignedTo,
      date,
      photos:      [],
      priority,
      cost:        !isNaN(parsedCost) && parsedCost > 0 ? parsedCost : undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Nueva Tarea</h3>
          <button className="modal-close" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Tipo de tarea</label>
            <select
              className="form-input"
              value={type}
              onChange={e => setType(e.target.value as TaskType)}
            >
              {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
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
              Descripción <span style={{ color: 'var(--primary)' }}>*</span>
            </label>
            <textarea
              className="form-input"
              rows={3}
              value={description}
              onChange={e => { setDescription(e.target.value); clearError('description'); }}
              placeholder="Detalla la tarea a realizar..."
              style={errors.description ? { borderColor: 'var(--primary)' } : {}}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Asignado a <span style={{ color: 'var(--primary)' }}>*</span>
            </label>
            <select
              className="form-input"
              value={assignedTo}
              onChange={e => { setAssignedTo(e.target.value); clearError('assignedTo'); }}
              style={errors.assignedTo ? { borderColor: 'var(--primary)' } : {}}
            >
              <option value="">Seleccionar equipo...</option>
              {staff.map(u => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </select>
            {errors.assignedTo && <span className="form-error">{errors.assignedTo}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Fecha programada <span style={{ color: 'var(--primary)' }}>*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={e => { setDate(e.target.value); clearError('date'); }}
                style={errors.date ? { borderColor: 'var(--primary)' } : {}}
              />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Prioridad</label>
              <select
                className="form-input"
                value={priority}
                onChange={e => setPriority(e.target.value as 'Normal' | 'Urgente')}
              >
                <option value="Normal">Normal</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Costo (MXN)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                className="form-input"
                value={cost}
                onChange={e => setCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button className="btn-outline" onClick={onClose}>Cancelar</button>
            <button className="btn-primary" onClick={handleSubmit}>Agregar Tarea</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
