import { X, User, DollarSign, Wrench, Sparkles } from 'lucide-react';
import type { Property } from '../types';

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
}

const PropertyModal = ({ property, onClose }: PropertyModalProps) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Ficha Técnica - {property.name}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <div style={{ marginBottom: '24px' }}>
            <img 
              src={property.imageUrl} 
              alt={property.name} 
              style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '12px' }}
            />
          </div>

          <h4 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Datos del Anfitrión
          </h4>

          <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '16px' }}>
            <div className="detail-row">
              <div className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} /> Nombre del Anfitrión
              </div>
              <div className="detail-value">{property.hostName}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} /> Cotización Limpieza
              </div>
              <div className="detail-value">${property.cleaningFee} MXN</div>
            </div>
            <div className="detail-row">
              <div className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} /> Comisión Coanfitrión
              </div>
              <div className="detail-value">{property.commissionRate}%</div>
            </div>
            <div className="detail-row">
              <div className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wrench size={18} /> Cotización Mantenimiento
              </div>
              <div className="detail-value">${property.maintenanceFee} MXN</div>
            </div>
          </div>
          
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="btn-outline" onClick={onClose}>Cerrar</button>
            <button className="btn-primary" style={{ backgroundColor: 'var(--warning)' }}>Editar Datos</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyModal;
