import { useState } from 'react';
import { Plus, MapPin, Trash2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../hooks/usePermissions';
import type { Property } from '../types';
import AddPropertyModal from '../components/AddPropertyModal';
import { usePagination } from '../hooks/usePagination';
import PaginationBar from '../components/PaginationBar';

const getInitials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

const Properties = () => {
  const { properties, addProperty, openDeleteModal, openEditModal } = useApp();
  const { canCreate, canEdit, canDelete, hasPropertyAccess } = usePermissions();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  const visibleProperties = properties.filter(p => hasPropertyAccess(p.id));
  const propPag = usePagination(visibleProperties, 'properties');

  const handleAddProperty = (property: Property) => {
    addProperty(property);
  };

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    position: 'absolute',
    background: disabled ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.55)',
    border: 'none',
    borderRadius: '7px',
    padding: '7px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: disabled ? 'rgba(255,255,255,0.3)' : 'white',
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.2s',
    opacity: disabled ? 0.5 : 1,
  });

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Mis Propiedades</h2>
        {canCreate('properties') && (
          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} />
            Agregar Propiedad
          </button>
        )}
      </div>

      <div className="properties-grid">
        {propPag.paginated.map((property) => {
          const allowEdit   = canEdit('properties');
          const allowDelete = canDelete('properties');
          return (
            <div
              key={property.id}
              className="property-card"
              onClick={() => navigate(`/propiedades/${property.id}`)}
            >
              <div style={{ position: 'relative' }}>
                {property.imageUrl ? (
                  <img src={property.imageUrl} alt={property.name} className="property-image" />
                ) : (
                  <div className="property-image-placeholder">
                    {getInitials(property.name)}
                  </div>
                )}

                {/* Edit button */}
                <button
                  style={{ ...btnStyle(!allowEdit), top: '8px', right: '44px' }}
                  onClick={e => {
                    e.stopPropagation();
                    if (!allowEdit) return;
                    openEditModal({ category: 'propiedad', itemId: property.id });
                  }}
                  onMouseEnter={e => { if (allowEdit) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(107,91,255,0.85)'; }}
                  onMouseLeave={e => { if (allowEdit) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.55)'; }}
                  title={allowEdit ? 'Editar propiedad' : 'Sin permiso para editar'}
                >
                  <Pencil size={14} />
                </button>

                {/* Delete button */}
                <button
                  style={{ ...btnStyle(!allowDelete), top: '8px', right: '8px' }}
                  onClick={e => {
                    e.stopPropagation();
                    if (!allowDelete) return;
                    openDeleteModal({ category: 'propiedad', itemId: property.id });
                  }}
                  onMouseEnter={e => { if (allowDelete) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.85)'; }}
                  onMouseLeave={e => { if (allowDelete) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.55)'; }}
                  title={allowDelete ? 'Eliminar propiedad' : 'Sin permiso para eliminar'}
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
          );
        })}
      </div>

      {propPag.totalItems > 0 && (
        <div className="property-card" style={{ padding: '0', marginTop: '8px' }}>
          <PaginationBar {...propPag} />
        </div>
      )}

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
