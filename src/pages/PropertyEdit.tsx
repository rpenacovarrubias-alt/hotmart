import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Property } from '../types';

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', fontFamily: 'inherit', fontSize: '14px',
  border: '1.5px solid var(--border-color)', borderRadius: '10px', outline: 'none',
  background: 'white', boxSizing: 'border-box',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px',
};
const section: React.CSSProperties = {
  background: 'white', borderRadius: '12px', padding: '24px',
  border: '1px solid var(--border-color)', marginBottom: '20px',
};

const PropertyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, updateProperty, showToast } = useApp();

  const property = properties.find(p => p.id === id);

  const [form, setForm] = useState<Property | null>(property ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imgError, setImgError] = useState(false);

  if (!property || !form) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Propiedad no encontrada.</p>
        <button className="btn-outline" style={{ marginTop: '16px' }} onClick={() => navigate('/propiedades')}>
          Volver a propiedades
        </button>
      </div>
    );
  }

  const set = (field: keyof Property, value: unknown) =>
    setForm(f => f ? { ...f, [field]: value } : f);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim())     errs.name     = 'Requerido';
    if (!form.location.trim()) errs.location = 'Requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateProperty({ ...form, name: form.name.trim(), location: form.location.trim() });
    showToast(`${form.name.trim()} actualizado correctamente`);
    navigate(`/propiedades/${id}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate(`/propiedades/${id}`)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={24} color="var(--text-main)" />
          </button>
          <div>
            <h2 className="page-title" style={{ margin: 0 }}>Editar Propiedad</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{property.name}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-outline" onClick={() => navigate(`/propiedades/${id}`)}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <Save size={16} /> Guardar Cambios
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Columna izquierda */}
        <div>
          {/* Información básica */}
          <div style={section}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Información Básica</h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Nombre <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                style={{ ...inp, borderColor: errors.name ? '#EF4444' : 'var(--border-color)' }}
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Casa Grande Puerta Real"
              />
              {errors.name && <span style={{ color: '#EF4444', fontSize: '12px' }}>{errors.name}</span>}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Ubicación <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                style={{ ...inp, borderColor: errors.location ? '#EF4444' : 'var(--border-color)' }}
                value={form.location}
                onChange={e => set('location', e.target.value)}
                placeholder="Puerta Real, Qro"
              />
              {errors.location && <span style={{ color: '#EF4444', fontSize: '12px' }}>{errors.location}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={lbl}>Tipo</label>
                <select style={inp} value={form.type} onChange={e => set('type', e.target.value)}>
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
                <label style={lbl}>Rol</label>
                <select style={inp} value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="cohost">Co-Anfitrión</option>
                  <option value="host">Anfitrión</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Estado</label>
                <select style={inp} value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="activo">Activa</option>
                  <option value="inactivo">Inactiva</option>
                  <option value="mantenimiento">En mantenimiento</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Descripción</label>
              <textarea
                rows={3}
                style={{ ...inp, resize: 'vertical' as const }}
                value={form.description ?? ''}
                onChange={e => set('description', e.target.value)}
                placeholder="Descripción breve de la propiedad..."
              />
            </div>

            <div>
              <label style={lbl}>Imagen de Portada</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  style={{ ...inp, flex: 1 }}
                  value={form.imageUrl}
                  onChange={e => { set('imageUrl', e.target.value); setImgError(false); }}
                  placeholder="URL de la imagen o selecciona un archivo..."
                />
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
                        set('imageUrl', reader.result as string);
                        setImgError(false);
                      };
                      reader.readAsDataURL(file);
                    }}
                    style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                  />
                </div>
              </div>
              {form.imageUrl && !imgError && (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  onError={() => setImgError(true)}
                  style={{ marginTop: 8, width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }}
                />
              )}
            </div>
          </div>

          {/* Airbnb */}
          <div style={section}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Datos Airbnb</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div>
                <label style={lbl}>URL del listing</label>
                <input style={inp} value={form.airbnbUrl} onChange={e => set('airbnbUrl', e.target.value)} placeholder="https://airbnb.com/h/..." />
              </div>
              <div>
                <label style={lbl}>ID Airbnb</label>
                <input style={inp} value={form.airbnbId} onChange={e => set('airbnbId', e.target.value)} placeholder="12345678" />
              </div>
            </div>
          </div>

          {/* Detalles físicos */}
          <div style={section}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Detalles Físicos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={lbl}>Recámaras</label>
                <input type="number" min={0} style={inp} value={form.bedrooms} onChange={e => set('bedrooms', Number(e.target.value))} />
              </div>
              <div>
                <label style={lbl}>Baños</label>
                <input type="number" min={0} style={inp} value={form.bathrooms} onChange={e => set('bathrooms', Number(e.target.value))} />
              </div>
              <div>
                <label style={lbl}>Máx. huéspedes</label>
                <input type="number" min={1} style={inp} value={form.maxGuests} onChange={e => set('maxGuests', Number(e.target.value))} />
              </div>
              <div>
                <label style={lbl}>m²</label>
                <input type="number" min={0} style={inp} value={form.sqft} onChange={e => set('sqft', Number(e.target.value))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              {(['parking', 'pool', 'petFriendly'] as const).map(field => (
                <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input type="checkbox" checked={form[field]} onChange={e => set(field, e.target.checked)} />
                  {field === 'parking' ? 'Estacionamiento' : field === 'pool' ? 'Alberca' : 'Pet Friendly'}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div>
          {/* Propietario */}
          <div style={section}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Propietario / Contacto</h3>
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Nombre</label>
              <input style={inp} value={form.hostName} onChange={e => set('hostName', e.target.value)} placeholder="Juan Pérez" />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Teléfono</label>
              <input style={inp} value={form.hostPhone} onChange={e => set('hostPhone', e.target.value)} placeholder="555-1234" />
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input type="email" style={inp} value={form.hostEmail} onChange={e => set('hostEmail', e.target.value)} placeholder="juan@ejemplo.com" />
            </div>
          </div>

          {/* Tarifas */}
          <div style={section}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Tarifas y Comisiones</h3>
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Precio x Noche (MXN)</label>
              <input type="number" min={0} style={inp} value={form.pricePerNight} onChange={e => set('pricePerNight', Number(e.target.value))} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Tarifa de Limpieza (MXN)</label>
              <input type="number" min={0} style={inp} value={form.cleaningFee} onChange={e => set('cleaningFee', Number(e.target.value))} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Fondo de Mantenimiento (MXN)</label>
              <input type="number" min={0} style={inp} value={form.maintenanceFee} onChange={e => set('maintenanceFee', Number(e.target.value))} />
            </div>
            <div>
              <label style={lbl}>Comisión Co-host (%)</label>
              <input type="number" min={0} max={100} style={inp} value={form.commissionRate} onChange={e => set('commissionRate', Number(e.target.value))} />
            </div>
          </div>

          {/* Botón guardar móvil (visible en columna derecha) */}
          <button className="btn-primary" onClick={handleSave} style={{ width: '100%' }}>
            <Save size={16} /> Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyEdit;
