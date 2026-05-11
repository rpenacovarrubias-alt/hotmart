import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Bed, Bath, Users, Maximize, Car, Waves, Dog, Link as LinkIcon, Activity, CheckCircle } from 'lucide-react';
import { mockIncomes } from '../data/mockData';
import { useApp } from '../context/AppContext';
import FinancialControl from '../components/FinancialControl';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, tasks } = useApp();

  const property = properties.find(p => p.id === id);

  if (!property) return <div>Propiedad no encontrada</div>;

  const pendingTasksCount = tasks.filter(t => t.propertyId === id && t.status !== 'Completado').length;
  const monthlyIncome = mockIncomes.filter(i => i.propertyId === id).reduce((acc, curr) => acc + curr.grossIncome, 0);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/propiedades')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={24} color="var(--text-main)" />
          </button>
          <h2 className="page-title" style={{ margin: 0 }}>Ficha Técnica</h2>
        </div>
        <button
          className="btn-outline"
          onClick={() => navigate(`/propiedades/${id}/editar`)}
        >
          Editar Propiedad
        </button>
      </div>

      <div className="property-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ position: 'relative' }}>
          <img
            src={property.imageUrl}
            alt={property.name}
            style={{ width: '100%', height: '350px', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', top: '20px', left: '20px',
            background: property.role === 'cohost' ? 'rgba(0, 112, 243, 0.9)' : 'rgba(0, 166, 153, 0.9)',
            color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase'
          }}>
            {property.role === 'cohost' ? 'Co-Anfitrión' : 'Anfitrión'}
          </div>
        </div>

        <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>

          <div>
            <h3 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>{property.name}</h3>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <MapPin size={16} /> {property.location}
            </div>

            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Detalles Físicos</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BuildingIcon type={property.type} /> <span style={{textTransform: 'capitalize'}}>{property.type}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Bed size={18} /> {property.bedrooms} Recámaras</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Bath size={18} /> {property.bathrooms} Baños</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Max. {property.maxGuests} pax</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Maximize size={18} /> {property.sqft} m²</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: property.parking ? 'inherit' : 'var(--border-color)' }}><Car size={18} /> Estacionamiento</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: property.pool ? 'inherit' : 'var(--border-color)' }}><Waves size={18} /> Alberca</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: property.petFriendly ? 'inherit' : 'var(--border-color)' }}><Dog size={18} /> Pet Friendly</div>
            </div>

            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Airbnb</h4>
            <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '16px', marginBottom: '32px' }}>
              <div className="detail-row"><div className="detail-label"><LinkIcon size={16} style={{marginRight: '8px'}} />URL</div><div className="detail-value"><a href={property.airbnbUrl} target="_blank" rel="noreferrer" style={{color: 'var(--primary)'}}>{property.airbnbUrl}</a></div></div>
              <div className="detail-row"><div className="detail-label"><Activity size={16} style={{marginRight: '8px'}}/>ID</div><div className="detail-value">{property.airbnbId}</div></div>
              <div className="detail-row"><div className="detail-label"><CheckCircle size={16} style={{marginRight: '8px'}}/>Estado</div><div className="detail-value" style={{textTransform: 'capitalize'}}>{property.status}</div></div>
            </div>

            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Estadísticas Rápidas (Mes Actual)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Ocupación</div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>75%</div>
              </div>
              <div style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Ingresos</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>${monthlyIncome}</div>
              </div>
              <div style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Tareas Pendientes</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: pendingTasksCount > 0 ? 'var(--warning)' : 'var(--text-main)' }}>{pendingTasksCount}</div>
              </div>
              <div style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Próx. Check-in</div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>2 días</div>
              </div>
            </div>

          </div>

          <div>
            <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tarifas y Comisiones
              </h4>
              <div className="detail-row"><div className="detail-label">Precio x Noche (Promedio)</div><div className="detail-value">${property.pricePerNight}</div></div>
              <div className="detail-row"><div className="detail-label">Tarifa de Limpieza</div><div className="detail-value">${property.cleaningFee}</div></div>
              <div className="detail-row"><div className="detail-label">Fondo de Mantenimiento</div><div className="detail-value">${property.maintenanceFee}</div></div>
              <div className="detail-row"><div className="detail-label">Comisión Coanfitrión</div><div className="detail-value" style={{color: 'var(--primary)'}}>{property.commissionRate}%</div></div>
            </div>

            <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '24px' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Propietario / Contacto
              </h4>
              <div className="detail-row"><div className="detail-label">Nombre</div><div className="detail-value">{property.hostName}</div></div>
              <div className="detail-row"><div className="detail-label">Teléfono</div><div className="detail-value">{property.hostPhone}</div></div>
              <div className="detail-row"><div className="detail-label">Email</div><div className="detail-value">{property.hostEmail}</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Financiero Módulo */}
      <FinancialControl propertyId={property.id} />
    </div>
  );
};

const BuildingIcon = ({ type }: { type: string }) => {
  if (type === 'departamento') return <MapPin size={18} />;
  return <MapPin size={18} />;
}

export default PropertyDetail;
