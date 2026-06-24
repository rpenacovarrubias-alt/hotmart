import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, BookOpen, Eye, Printer, Edit2, Trash2, Wifi, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const GuideBuilderDashboard = () => {
  const navigate = useNavigate();
  const { guides, deleteGuide } = useApp();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (guideId: string) => {
    // Generar la URL basada en el puerto y host actual
    const guestLink = `${window.location.origin}/guia/${guideId}`;
    navigator.clipboard.writeText(guestLink);
    setCopiedId(guideId);
    toast.success('¡Enlace copiado al portapapeles!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la guía de "${name}"?`)) {
      deleteGuide(id);
      toast.error(`Guía de "${name}" eliminada`);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 className="page-title" style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>Constructor de Guías de Casas</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Crea, edita y distribuye guías interactivas y PDFs profesionales para tus huéspedes.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/guias/nueva')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '10px' }}>
          <Plus size={18} />
          Nueva Guía de Casa
        </button>
      </div>

      {guides.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--primary-color)' }}>
            <BookOpen size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No hay guías de casas</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            Empieza extrayendo la información de tu propiedad directamente desde un enlace de Airbnb o construyendo una guía personalizada desde cero.
          </p>
          <button className="btn-primary" onClick={() => navigate('/guias/nueva')}>
            Crear Primera Guía
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {guides.map(guide => (
            <div key={guide.id} style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} className="guide-card-hover">
              {/* Cover Image */}
              <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={guide.imageUrl} 
                  alt={guide.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255, 255, 255, 0.95)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {guide.type}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>{guide.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{guide.location}</span>
                </p>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', background: 'var(--bg-light)', padding: '4px 8px', borderRadius: '6px', color: 'var(--text-muted)' }}>{guide.bedrooms} Rec.</span>
                  <span style={{ fontSize: '12px', background: 'var(--bg-light)', padding: '4px 8px', borderRadius: '6px', color: 'var(--text-muted)' }}>{guide.beds} Camas</span>
                  <span style={{ fontSize: '12px', background: 'var(--bg-light)', padding: '4px 8px', borderRadius: '6px', color: 'var(--text-muted)' }}>{guide.bathrooms} Baño</span>
                  <span style={{ fontSize: '12px', background: 'var(--bg-light)', padding: '4px 8px', borderRadius: '6px', color: 'var(--text-muted)' }}>Max {guide.maxGuests} Huésp.</span>
                </div>

                {/* WiFi details */}
                <div style={{ background: 'var(--bg-light)', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', border: '1px solid var(--border-color)' }}>
                  <Wifi size={16} color="var(--primary-color)" />
                  <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <strong>Red:</strong> {guide.wifiNetwork} | <strong>Clave:</strong> {guide.wifiPassword}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  {/* Row 1: Direct link for Guests */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <button 
                      onClick={() => handleCopyLink(guide.id)}
                      className="btn-outline" 
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', padding: '8px 12px', cursor: 'pointer' }}
                    >
                      {copiedId === guide.id ? <Check size={16} color="green" /> : <Copy size={16} />}
                      {copiedId === guide.id ? '¡Enlace Copiado!' : 'Copiar URL Huésped'}
                    </button>
                    <a 
                      href={`/guia/${guide.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-outline" 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
                      title="Ver Vista Huésped"
                    >
                      <Eye size={16} />
                    </a>
                  </div>

                  {/* Row 2: Admin Tools */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <button 
                      onClick={() => navigate(`/guias/${guide.id}/pdf`)}
                      className="btn-outline" 
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', padding: '8px', color: 'var(--primary-color)', borderColor: 'rgba(30, 58, 138, 0.2)', background: 'rgba(30, 58, 138, 0.02)' }}
                    >
                      <Printer size={14} />
                      Imprimir PDF
                    </button>
                    <button 
                      onClick={() => navigate(`/guias/${guide.id}/editar`)}
                      className="btn-outline" 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', padding: 0 }}
                      title="Editar Guía"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(guide.id, guide.name)}
                      className="btn-outline" 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', padding: 0, color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                      title="Eliminar Guía"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuideBuilderDashboard;
