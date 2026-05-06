import { useState } from 'react';
import { X, ImageOff } from 'lucide-react';
import type { Property } from '../types';

interface Props {
  onAdd: (property: Property) => void;
  onClose: () => void;
}

const TYPE_OPTIONS: Array<{ value: Property['type']; label: string }> = [
  { value: 'departamento', label: 'Departamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'loft', label: 'Loft' },
  { value: 'villa', label: 'Villa' },
  { value: 'suite', label: 'Suite' },
  { value: 'habitación', label: 'Habitación' },
];

const STATUS_OPTIONS: Array<{ value: Property['status']; label: string }> = [
  { value: 'activo', label: 'Activa' },
  { value: 'inactivo', label: 'Inactiva' },
  { value: 'mantenimiento', label: 'En mantenimiento' },
];

const getInitials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

const AddPropertyModal = ({ onAdd, onClose }: Props) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<Property['type']>('departamento');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imgError, setImgError] = useState(false);
  const [hostName, setHostName] = useState('');
  const [commissionRate, setCommissionRate] = useState('15');
  const [status, setStatus] = useState<Property['status']>('activo');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) =>
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });

  const handleImageChange = (val: string) => {
    setImageUrl(val);
    setImgError(false);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'El nombre es requerido';
    if (!location.trim()) e.location = 'La ubicación es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const commission = Math.min(100, Math.max(0, Number(commissionRate) || 0));
    onAdd({
      id: `prop_${Date.now()}`,
      name: name.trim(),
      location: location.trim(),
      type,
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim(),
      gallery: [],
      role: 'cohost',
      hostName: hostName.trim(),
      hostPhone: '',
      hostEmail: '',
      cleaningFee: 0,
      commissionRate: commission,
      maintenanceFee: 0,
      pricePerNight: 0,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      sqft: 0,
      parking: false,
      pool: false,
      petFriendly: false,
      airbnbUrl: '',
      airbnbId: '',
      status,
    });
    onClose();
  };

  const showPlaceholder = !imageUrl || imgError;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Nueva Propiedad</h3>
          <button className="modal-close" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">
              Nombre <span style={{ color: 'var(--primary)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={e => { setName(e.target.value); clearError('name'); }}
              placeholder="Ej. Casa Grande Puerta Real"
              style={errors.name ? { borderColor: 'var(--primary)' } : {}}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Ubicación / Colonia, Ciudad <span style={{ color: 'var(--primary)' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={location}
              onChange={e => { setLocation(e.target.value); clearError('location'); }}
              placeholder="Ej. Centro, Querétaro"
              style={errors.location ? { borderColor: 'var(--primary)' } : {}}
            />
            {errors.location && <span className="form-error">{errors.location}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select
                className="form-input"
                value={type}
                onChange={e => setType(e.target.value as Property['type'])}
              >
                {TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="form-input"
                value={status}
                onChange={e => setStatus(e.target.value as Property['status'])}
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Propietario / Contacto</label>
            <input
              type="text"
              className="form-input"
              value={hostName}
              onChange={e => setHostName(e.target.value)}
              placeholder="Nombre del propietario"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Comisión co-host (%)</label>
            <input
              type="number"
              className="form-input"
              value={commissionRate}
              min={0}
              max={100}
              onChange={e => setCommissionRate(e.target.value)}
              placeholder="15"
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL imagen de portada</label>
            <input
              type="text"
              className="form-input"
              value={imageUrl}
              onChange={e => handleImageChange(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Preview en tiempo real */}
          <div
            style={{
              width: '100%',
              height: '160px',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '20px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-color)',
            }}
          >
            {showPlaceholder ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: 'var(--text-muted)',
                }}
              >
                {name ? (
                  <span style={{ fontSize: '42px', fontWeight: 700, color: 'var(--primary)' }}>
                    {getInitials(name)}
                  </span>
                ) : (
                  <ImageOff size={36} />
                )}
                <span style={{ fontSize: '12px' }}>
                  {name ? name : 'Vista previa de imagen'}
                </span>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt="Preview"
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Descripción corta</label>
            <textarea
              className="form-input"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe brevemente la propiedad..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button className="btn-outline" onClick={onClose}>Cancelar</button>
            <button className="btn-primary" onClick={handleSubmit}>Agregar Propiedad</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyModal;
