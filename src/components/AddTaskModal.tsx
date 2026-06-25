import { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Task, TaskType } from '../types';

interface Props {
  onAdd: (task: Task) => void;
  onClose: () => void;
}

const TASK_TYPES: TaskType[] = ['Limpieza', 'Mantenimiento', 'Revisión', 'Otro'];

type TeamType = 'anfitrion' | 'coanfitrion' | 'limpieza' | 'mantenimiento';

const TEAM_OPTIONS: { key: TeamType; label: string; icon: string; color: string }[] = [
  { key: 'anfitrion',     label: 'Anfitrión',     icon: '🏠', color: '#00A699' },
  { key: 'coanfitrion',   label: 'Co-anfitrión',  icon: '🤝', color: '#6B5BFF' },
  { key: 'limpieza',      label: 'Limpieza',       icon: '🧹', color: '#FC642D' },
  { key: 'mantenimiento', label: 'Mantenimiento',  icon: '🔧', color: '#FF8C00' },
];

const AddTaskModal = ({ onAdd, onClose }: Props) => {
  const { properties, users } = useApp();

  const [type, setType]               = useState<TaskType>('Limpieza');
  const [propertyId, setPropertyId]   = useState('');
  const [description, setDescription] = useState('');
  const [teamType, setTeamType]       = useState<TeamType | ''>('');
  const [assignedTo, setAssignedTo]   = useState('');
  const [date, setDate]               = useState('');
  const [priority, setPriority]       = useState<'Normal' | 'Urgente'>('Normal');
  const [cost, setCost]               = useState('');
  const [errors, setErrors]           = useState<Record<string, string>>({});

  const clearError = (field: string) =>
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });

  const selectedProperty = properties.find(p => p.id === propertyId);

  // Returns active users matching roles that have access to the selected property.
  // propertyAccess = [] means access to ALL properties.
  const getUsers = (roles: string[]) =>
    users.filter(u =>
      u.status === 'active' &&
      roles.includes(u.role) &&
      (u.propertyAccess.length === 0 || u.propertyAccess.includes(propertyId))
    );

  const hostsForProp    = propertyId ? getUsers(['host'])                              : [];
  const coHostsForProp  = propertyId ? getUsers(['cohost', 'admin', 'manager'])        : [];
  const cleanersForProp = propertyId ? getUsers(['cleaning_staff'])                    : [];
  const maintForProp    = propertyId ? getUsers(['maintenance_staff'])                 : [];

  // Anfitrión fallback: if property has a hostName not already in the users catalog,
  // offer it as an extra option so the task can still be assigned.
  const hostNamesInCatalog = hostsForProp.map(u => u.name.toLowerCase());
  const propHostName       = selectedProperty?.hostName?.trim() ?? '';
  const showPropFallback   =
    propHostName && !hostNamesInCatalog.includes(propHostName.toLowerCase());

  const hostOptions = [
    ...hostsForProp.map(u => ({ id: u.id, name: u.name })),
    ...(showPropFallback ? [{ id: '__prop_host', name: propHostName }] : []),
  ];

  const handlePropertyChange = (propId: string) => {
    setPropertyId(propId);
    setAssignedTo('');   // reset person when property changes
    clearError('propertyId');
  };

  const handleTeamTypeChange = (t: TeamType) => {
    setTeamType(t);
    setAssignedTo('');   // reset person when category changes
    clearError('assignedTo');
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!propertyId)         e.propertyId  = 'Selecciona una propiedad';
    if (!description.trim()) e.description = 'La descripción es requerida';
    if (!date)               e.date        = 'La fecha es requerida';
    if (!teamType)           e.assignedTo  = 'Selecciona un tipo de equipo';
    else if (!assignedTo)    e.assignedTo  = 'Selecciona un miembro del equipo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const parsedCost = parseFloat(cost);
    onAdd({
      id:          `t${Date.now()}`,
      propertyId,
      title:       `${type} – ${selectedProperty?.name ?? ''}`,
      description: description.trim(),
      status:      'Pendiente',
      type,
      assignedTo,
      date,
      photos:      [],
      priority,
      cost: !isNaN(parsedCost) && parsedCost > 0 ? parsedCost : undefined,
    });
    onClose();
  };

  // ── shared UI helpers ────────────────────────────────────────────────────────

  const InfoBox = ({ msg, color = 'var(--text-muted)' }: { msg: string; color?: string }) => (
    <div style={{
      padding: '10px 14px', borderRadius: '8px',
      background: 'rgba(118,118,118,0.06)', border: '1px solid rgba(118,118,118,0.18)',
      fontSize: '13px', color,
    }}>
      {msg}
    </div>
  );

  const PersonDropdown = ({
    options,
    placeholder,
  }: { options: { id: string; name: string }[]; placeholder: string }) => (
    <select
      className="form-input"
      value={assignedTo}
      onChange={e => { setAssignedTo(e.target.value); clearError('assignedTo'); }}
      style={errors.assignedTo ? { borderColor: 'var(--primary)' } : {}}
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o.id} value={o.name}>{o.name}</option>
      ))}
    </select>
  );

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Nueva Tarea</h3>
          <button className="modal-close" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body">

          {/* Tipo de tarea */}
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

          {/* Propiedad */}
          <div className="form-group">
            <label className="form-label">
              Propiedad <span style={{ color: 'var(--primary)' }}>*</span>
            </label>
            <select
              className="form-input"
              value={propertyId}
              onChange={e => handlePropertyChange(e.target.value)}
              style={errors.propertyId ? { borderColor: 'var(--primary)' } : {}}
            >
              <option value="">Seleccionar propiedad...</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.propertyId && <span className="form-error">{errors.propertyId}</span>}
          </div>

          {/* Descripción */}
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

          {/* ── Asignado a ─────────────────────────────────────────────────────── */}
          <div className="form-group">
            <label className="form-label">
              Asignado a <span style={{ color: 'var(--primary)' }}>*</span>
            </label>

            {/* Category pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {TEAM_OPTIONS.map(({ key, label, icon, color }) => {
                const active = teamType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTeamTypeChange(key)}
                    style={{
                      padding: '7px 15px', borderRadius: '20px',
                      border: `1.5px solid ${active ? color : '#e0e0e0'}`,
                      background: active ? color : 'transparent',
                      color: active ? 'white' : '#484848',
                      cursor: 'pointer', fontSize: '13px',
                      fontWeight: active ? 600 : 400, fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    {icon} {label}
                  </button>
                );
              })}
            </div>

            {/* No category selected */}
            {!teamType && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                Selecciona el tipo de equipo arriba.
              </p>
            )}

            {/* Category selected but no property yet */}
            {teamType && !propertyId && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                Selecciona primero una propiedad para ver el equipo disponible.
              </p>
            )}

            {/* ── Anfitrión ─────────────────────────────────────────────────── */}
            {teamType === 'anfitrion' && propertyId && (
              hostOptions.length === 0 ? (
                <InfoBox msg="Sin anfitrión registrado para esta propiedad. Edita la propiedad para agregar el nombre, o ve a Gestión de Usuarios y agrega un usuario con rol Anfitrión asignado a esta propiedad." />
              ) : (
                <PersonDropdown
                  options={hostOptions}
                  placeholder="Seleccionar anfitrión..."
                />
              )
            )}

            {/* ── Co-anfitrión ──────────────────────────────────────────────── */}
            {teamType === 'coanfitrion' && propertyId && (
              coHostsForProp.length === 0 ? (
                <InfoBox msg="Sin co-anfitriones disponibles para esta propiedad. En Gestión de Usuarios agrega uno con rol Co-anfitrión, Gerente o Administrador y asígnale acceso a esta propiedad (o deja vacío para acceso a todas)." />
              ) : (
                <PersonDropdown
                  options={coHostsForProp.map(u => ({ id: u.id, name: u.name }))}
                  placeholder="Seleccionar co-anfitrión..."
                />
              )
            )}

            {/* ── Limpieza ──────────────────────────────────────────────────── */}
            {teamType === 'limpieza' && propertyId && (
              cleanersForProp.length === 0 ? (
                <InfoBox msg="Sin personal de limpieza para esta propiedad. En Gestión de Usuarios agrega uno con rol Personal de Limpieza." />
              ) : (
                <PersonDropdown
                  options={cleanersForProp.map(u => ({ id: u.id, name: u.name }))}
                  placeholder="Seleccionar personal de limpieza..."
                />
              )
            )}

            {/* ── Mantenimiento ─────────────────────────────────────────────── */}
            {teamType === 'mantenimiento' && propertyId && (
              maintForProp.length === 0 ? (
                <InfoBox msg="Sin personal de mantenimiento para esta propiedad. En Gestión de Usuarios agrega uno con rol Personal de Mantenimiento." />
              ) : (
                <PersonDropdown
                  options={maintForProp.map(u => ({ id: u.id, name: u.name }))}
                  placeholder="Seleccionar personal de mantenimiento..."
                />
              )
            )}

            {errors.assignedTo && <span className="form-error">{errors.assignedTo}</span>}
          </div>

          {/* Fecha + Prioridad + Costo */}
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
                type="number" min={0} step={0.01}
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
