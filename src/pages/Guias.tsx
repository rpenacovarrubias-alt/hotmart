// @ts-nocheck — legacy dead-code file, no active routes
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, FileDown, Pencil, Trash2, Home, BedDouble, Bath, Users, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { generateGuiaPDF, CASA_PUERTA_AZUL } from '../utils/guiaPDF';
import { getBrandLogo, saveBrandLogo, clearBrandLogo } from '../utils/brandSettings';
import type { PropertyGuide } from '../types';

const Guias = () => {
  const { guides, addGuide, deleteGuide } = useApp();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [brandLogo, setBrandLogo] = useState<string | undefined>(getBrandLogo);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = (id: string) => {
    if (deleting === id) {
      deleteGuide(id);
      setDeleting(null);
      toast.success('Guía eliminada');
    } else {
      setDeleting(id);
      setTimeout(() => setDeleting(null), 3000);
    }
  };

  const handleSeedCasaAzul = () => {
    const exists = guides.find(g => g.id === CASA_PUERTA_AZUL.id);
    if (exists) { toast.info('Casa de la Puerta Azul ya existe'); return; }
    addGuide({ ...CASA_PUERTA_AZUL, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    toast.success('Guía de Casa de la Puerta Azul cargada');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      saveBrandLogo(dataUrl);
      setBrandLogo(dataUrl);
      toast.success('Logo guardado como predeterminado');
    };
    reader.readAsDataURL(file);
  };

  const handleClearLogo = () => {
    clearBrandLogo();
    setBrandLogo(undefined);
    toast.success('Logo eliminado');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Guías de Propiedad</h1>
          <p className="page-subtitle">Guías de uso para huéspedes · Genera PDFs profesionales</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {guides.length === 0 && (
            <button
              className="btn btn-secondary"
              onClick={handleSeedCasaAzul}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Home size={16} />
              Cargar Casa Puerta Azul
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => navigate('/guias/nueva')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={18} />
            Nueva Guía
          </button>
        </div>
      </div>

      {/* Brand panel */}
      <div style={{
        background: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: 10,
        padding: '14px 18px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-main)', minWidth: 140 }}>
          Logo predeterminado
        </div>
        {brandLogo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src={brandLogo}
              alt="Logo de marca"
              style={{ height: 44, maxWidth: 110, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--border-color)', padding: 4, background: 'white' }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Aplicado a todos los PDFs</span>
            <button
              onClick={handleClearLogo}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
            >
              <X size={14} /> Quitar
            </button>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin logo — las guías usarán el espacio vacío</span>
        )}
        <button
          className="btn btn-secondary"
          onClick={() => logoInputRef.current?.click()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginLeft: 'auto' }}
        >
          <Upload size={15} />
          {brandLogo ? 'Cambiar logo' : 'Subir logo'}
        </button>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleLogoUpload}
        />
      </div>

      {guides.length === 0 ? (
        <EmptyState onNew={() => navigate('/guias/nueva')} onSeed={handleSeedCasaAzul} />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 20,
        }}>
          {guides.map(guide => (
            <GuideCard
              key={guide.id}
              guide={guide}
              isDeleting={deleting === guide.id}
              onEdit={() => navigate(`/guias/${guide.id}/editar`)}
              onDelete={() => handleDelete(guide.id)}
              onPDF={() => {
                generateGuiaPDF(guide, brandLogo);
                toast.success('PDF generado');
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

interface CardProps {
  guide: PropertyGuide;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onPDF: () => void;
}

const GuideCard = ({ guide, isDeleting, onEdit, onDelete, onPDF }: CardProps) => (
  <div style={{
    background: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: 12,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.2s',
  }}>
    {/* Image or placeholder */}
    <div style={{
      height: 140,
      background: guide.imageDataUrls[0]
        ? `url(${guide.imageDataUrls[0]}) center/cover`
        : 'linear-gradient(135deg, #FF5A5F22 0%, #FF5A5F44 100%)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {!guide.imageDataUrls[0] && (
        <BookOpen size={40} color="#FF5A5F" style={{ opacity: 0.5 }} />
      )}
      {guide.logoDataUrl && (
        <img
          src={guide.logoDataUrl}
          alt="Logo"
          style={{
            position: 'absolute', top: 10, left: 10,
            height: 36, objectFit: 'contain',
            background: 'white', borderRadius: 6, padding: 4,
          }}
        />
      )}
    </div>

    {/* Content */}
    <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
          {guide.propertyName}
        </h3>
        <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
          {guide.propertyType}
        </p>
      </div>

      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
        {guide.address}
      </p>

      {/* Capacity chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Chip icon={<BedDouble size={12} />} label={`${guide.bedrooms} rec.`} />
        <Chip icon={<Bath size={12} />} label={`${guide.bathrooms} baño${guide.bathrooms > 1 ? 's' : ''}`} />
        <Chip icon={<Users size={12} />} label={`Máx ${guide.maxGuests}`} />
      </div>

      {/* WiFi preview */}
      <div style={{
        background: 'var(--bg-color)',
        borderRadius: 6,
        padding: '6px 10px',
        fontSize: 12,
        color: 'var(--text-muted)',
        display: 'flex',
        gap: 8,
      }}>
        <span>📶</span>
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{guide.wifiNetwork || '—'}</span>
        <span>·</span>
        <span>{guide.wifiPassword || '—'}</span>
      </div>

      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
        Actualizada {new Date(guide.updatedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
      </p>
    </div>

    {/* Actions */}
    <div style={{
      borderTop: '1px solid var(--border-color)',
      padding: '10px 16px',
      display: 'flex',
      gap: 8,
    }}>
      <button
        className="btn btn-primary"
        onClick={onPDF}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}
      >
        <FileDown size={15} />
        Descargar PDF
      </button>
      <button
        className="btn btn-secondary"
        onClick={onEdit}
        style={{ padding: '8px 12px' }}
        title="Editar"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onDelete}
        style={{
          padding: '8px 12px',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          background: isDeleting ? '#dc2626' : 'var(--bg-color)',
          color: isDeleting ? 'white' : '#dc2626',
          transition: 'all 0.2s',
          fontSize: 13,
        }}
        title={isDeleting ? 'Click para confirmar eliminación' : 'Eliminar'}
      >
        <Trash2 size={15} />
      </button>
    </div>
  </div>
);

const Chip = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: 'var(--bg-color)', border: '1px solid var(--border-color)',
    borderRadius: 20, padding: '2px 8px', fontSize: 11, color: 'var(--text-muted)',
  }}>
    {icon} {label}
  </span>
);

const EmptyState = ({ onNew, onSeed }: { onNew: () => void; onSeed: () => void }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '80px 20px', textAlign: 'center',
    gap: 16,
  }}>
    <div style={{
      width: 80, height: 80, borderRadius: '50%',
      background: '#FF5A5F22',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <BookOpen size={36} color="#FF5A5F" />
    </div>
    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-main)' }}>
      Sin guías aún
    </h2>
    <p style={{ margin: 0, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.5 }}>
      Crea guías de uso profesionales para tus propiedades y genera PDFs
      listos para compartir con tus huéspedes.
    </p>
    <div style={{ display: 'flex', gap: 10 }}>
      <button className="btn btn-secondary" onClick={onSeed} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Home size={16} />
        Cargar Casa Puerta Azul
      </button>
      <button className="btn btn-primary" onClick={onNew} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Plus size={18} />
        Crear Guía
      </button>
    </div>
  </div>
);

export default Guias;
