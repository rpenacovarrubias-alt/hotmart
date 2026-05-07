import { useState } from 'react';
import { Plus, MapPin, Trash2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Property } from '../types';
import AddPropertyModal from '../components/AddPropertyModal';

const getInitials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

const Properties = () => {
  const { properties, addProperty, openDeleteModal, openEditModal } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddProperty = (property: Property) => {
    addProperty(property);
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Mis Propiedades</h2>
        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={20} />
          Agregar Propiedad
        </button>
      </div>

      <div className="properties-grid">
        {properties.map((property) => (
          <div
            key={property.id}
            className="property-card"
            onClick={() => navigate(`/propiedades/${property.id}`)}
          >
            {/* Image / placeholder with action overlays */}
            <div style={{ position: 'relative' }}>
              {property.imageUrl ? (
                <img src={property.imageUrl} alt={property.name} className="property-image" />
              ) : (
                <div className="property-image-placeholder">
                  {getInitials(property.name)}
                </div>
              )}

              {/* Edit icon */}
              <button
                style={{
                  position: 'absolute', top: '8px', right: '44px',
                  background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '7px',
                  padding: '7px', cursor: 'pointer', color: 'white',
                  display: 'flex', alignItems: 'center', transition: 'background 0.2s',
                }}
                onClick={e => {
                  e.stopPropagation();
                  openEditModal({ category: 'propiedad', itemId: property.id });
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(107,91,255,0.85)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.55)'; }}
                title="Editar propiedad"
              >
                <Pencil size={14} />
              </button>

              {/* Delete icon */}
              <button
                style={{
                  position: 'absolute', top: '8px', right: '8px',
                  background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '7px',
                  padding: '7px', cursor: 'pointer', color: 'white',
                  display: 'flex', alignItems: 'center', transition: 'background 0.2s',
                }}
                onClick={e => {
                  e.stopPropagation();
                  openDeleteModal({ category: 'propiedad', itemId: property.id });
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.85)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.55)'; }}
                title="Eliminar propiedad"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="property-info">
              <h3 className="property-name">{property.name}</h3>
              <div className="property-location">
                <MapPin size={16} />
                {property.location}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <AddPropertyModal
          onAdd={handleAddProperty}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Properties;
