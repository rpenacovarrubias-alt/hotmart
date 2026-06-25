// @ts-nocheck — legacy dead-code file, no active routes
import { useState, useRef, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ChevronLeft, Upload, X, Plus, Trash2,
  Home, Lock, Wifi, BookOpen, ListChecks, ShieldCheck, LogOut, Phone, Link, Loader,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateGuiaPDF } from '../utils/guiaPDF';
import { getBrandLogo } from '../utils/brandSettings';
import type { PropertyGuide } from '../types';

// ── Image helpers ──────────────────────────────────────────────────────────────
const MAX_PX = 800;
const QUALITY = 0.72;

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const isPng = file.type === 'image/png';
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, MAX_PX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d')!;
        // For non-PNG formats fill white before drawing (JPEG has no alpha channel)
        if (!isPng) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', QUALITY));
      };
      img.onerror = reject;
      img.src = src;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Blank guide ────────────────────────────────────────────────────────────────
const BLANK: PropertyGuide = {
  id: '',
  propertyName: '',
  propertyType: 'Alojamiento Entero · Casa',
  airbnbCustomLink: '',
  address: '',
  mapsUrl: '',
  description: '',
  logoDataUrl: undefined,
  footerDataUrl: undefined,
  imageDataUrls: [],
  bedrooms: 1,
  bathrooms: 1,
  beds: 1,
  maxGuests: 2,
  priceMin: undefined,
  priceMax: undefined,
  checkinStart: '3:00 p.m.',
  checkinEnd: '11:00 p.m.',
  checkoutTime: '12:00 p.m.',
  checkinMethod: '',
  accessCode: '',
  directions: '',
  wifiNetwork: '',
  wifiPassword: '',
  tvNotes: '',
  boilerNotes: '',
  garbageNotes: '',
  houseManualExtra: '',
  amenities: [],
  petsAllowed: false,
  eventsAllowed: false,
  smokingAllowed: false,
  silenceHours: '',
  additionalRules: '',
  coMonoxideDetector: false,
  smokeAlarm: false,
  securityCamera: false,
  safetyNotes: '',
  checkoutInstructions: [''],
  hostName: '',
  hostPhone: '',
  emergencyPhone: '911',
  cancellationPolicy: 'Flexible',
  createdAt: '',
  updatedAt: '',
};

// ── Section navigation ─────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'identificacion',  label: 'Identificación',  icon: Home       },
  { id: 'acceso',          label: 'Llegada y Acceso', icon: Lock       },
  { id: 'wifi',            label: 'WiFi y Tecno.',    icon: Wifi       },
  { id: 'manual',          label: 'Manual del Hogar', icon: BookOpen   },
  { id: 'amenidades',      label: 'Amenidades',       icon: ListChecks },
  { id: 'reglas',          label: 'Reglas',           icon: ShieldCheck},
  { id: 'seguridad',       label: 'Seguridad',        icon: ShieldCheck},
  { id: 'salida',          label: 'Salida',           icon: LogOut     },
  { id: 'contactos',       label: 'Contactos',        icon: Phone      },
  { id: 'imagenes',        label: 'Imágenes',         icon: Upload     },
];

// ── Main component ─────────────────────────────────────────────────────────────
const GuiaForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { guides, addGuide, updateGuide } = useApp();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<PropertyGuide>(() => {
    if (id) {
      const existing = guides.find(g => g.id === id);
      return existing ?? { ...BLANK };
    }
    return { ...BLANK, logoDataUrl: getBrandLogo() };
  });
  const [activeSection, setActiveSection] = useState('identificacion');
  const [newAmenity, setNewAmenity] = useState('');
  const [saving, setSaving] = useState(false);

  // Import from Airbnb URL
  const [importUrl, setImportUrl]     = useState('');
  const [importing, setImporting]     = useState(false);
  const [importError, setImportError] = useState('');

  const logoRef    = useRef<HTMLInputElement>(null);
  const footerRef  = useRef<HTMLInputElement>(null);
  const imagesRef  = useRef<HTMLInputElement>(null);

  // ── Field helpers ──────────────────────────────────────────────────────────
  const set = <K extends keyof PropertyGuide>(key: K, val: PropertyGuide[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, target: 'logo' | 'footer' | 'gallery') => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    try {
      const urls = await Promise.all(files.map(fileToDataUrl));
      if (target === 'logo')    set('logoDataUrl', urls[0]);
      if (target === 'footer')  set('footerDataUrl', urls[0]);
      if (target === 'gallery') setForm(f => ({ ...f, imageDataUrls: [...f.imageDataUrls, ...urls] }));
      toast.success(`${target === 'gallery' ? files.length + ' imagen(es)' : 'Imagen'} cargada`);
    } catch {
      toast.error('Error al procesar la imagen');
    }
    e.target.value = '';
  };

  const removeGalleryImage = (idx: number) =>
    setForm(f => ({ ...f, imageDataUrls: f.imageDataUrls.filter((_, i) => i !== idx) }));

  const addAmenity = () => {
    if (!newAmenity.trim()) return;
    setForm(f => ({ ...f, amenities: [...f.amenities, newAmenity.trim()] }));
    setNewAmenity('');
  };

  const addInstruction = () =>
    setForm(f => ({ ...f, checkoutInstructions: [...f.checkoutInstructions, ''] }));

  const updateInstruction = (idx: number, val: string) =>
    setForm(f => ({
      ...f,
      checkoutInstructions: f.checkoutInstructions.map((s, i) => i === idx ? val : s),
    }));

  const removeInstruction = (idx: number) =>
    setForm(f => ({ ...f, checkoutInstructions: f.checkoutInstructions.filter((_, i) => i !== idx) }));

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!form.propertyName.trim()) {
      toast.error('El nombre de la propiedad es obligatorio');
      setActiveSection('identificacion');
      return;
    }
    setSaving(true);
    const now = new Date().toISOString();
    const guide: PropertyGuide = {
      ...form,
      id: isEdit ? form.id : `guide_${Date.now()}`,
      createdAt: isEdit ? form.createdAt : now,
      updatedAt: now,
      checkoutInstructions: form.checkoutInstructions.filter(s => s.trim()),
    };
    if (isEdit) updateGuide(guide);
    else addGuide(guide);
    toast.success(isEdit ? 'Guía actualizada' : 'Guía creada');
    setSaving(false);
    navigate('/guias');
  };

  const handleSaveAndPDF = () => {
    handleSave();
    setTimeout(() => {
      const now = new Date().toISOString();
      const guide: PropertyGuide = {
        ...form,
        id: isEdit ? form.id : `guide_${Date.now()}`,
        createdAt: isEdit ? form.createdAt : now,
        updatedAt: now,
        checkoutInstructions: form.checkoutInstructions.filter(s => s.trim()),
      };
      generateGuiaPDF(guide, getBrandLogo());
    }, 300);
  };

  // ── Import from Airbnb URL ─────────────────────────────────────────────────
  const handleImport = async () => {
    const url = importUrl.trim();
    if (!url) return;
    if (!url.includes('airbnb')) {
      setImportError('Ingresa una URL válida de Airbnb');
      return;
    }
    setImporting(true);
    setImportError('');
    try {
      const res = await fetch('/api/import-airbnb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json() as { success?: boolean; guide?: Partial<PropertyGuide>; error?: string };

      if (!res.ok || !data.success || !data.guide) {
        throw new Error(data.error ?? 'Error al importar');
      }

      const g = data.guide;
      setForm(prev => ({
        ...prev,
        propertyName:        g.propertyName        || prev.propertyName,
        propertyType:        g.propertyType        || prev.propertyType,
        airbnbCustomLink:    g.airbnbCustomLink    || prev.airbnbCustomLink,
        address:             g.address             || prev.address,
        description:         g.description         || prev.description,
        bedrooms:            g.bedrooms            ?? prev.bedrooms,
        beds:                g.beds                ?? prev.beds,
        bathrooms:           g.bathrooms           ?? prev.bathrooms,
        maxGuests:           g.maxGuests           ?? prev.maxGuests,
        priceMin:            g.priceMin            ?? prev.priceMin,
        priceMax:            g.priceMax            ?? prev.priceMax,
        checkinStart:        g.checkinStart        || prev.checkinStart,
        checkinEnd:          g.checkinEnd          || prev.checkinEnd,
        checkoutTime:        g.checkoutTime        || prev.checkoutTime,
        checkinMethod:       g.checkinMethod       || prev.checkinMethod,
        directions:          g.directions          || prev.directions,
        mapsUrl:             g.mapsUrl             || prev.mapsUrl,
        wifiNetwork:         g.wifiNetwork         || prev.wifiNetwork,
        tvNotes:             g.tvNotes             || prev.tvNotes,
        boilerNotes:         g.boilerNotes         || prev.boilerNotes,
        garbageNotes:        g.garbageNotes        || prev.garbageNotes,
        houseManualExtra:    g.houseManualExtra    || prev.houseManualExtra,
        amenities:           g.amenities?.length   ? g.amenities : prev.amenities,
        petsAllowed:         g.petsAllowed         ?? prev.petsAllowed,
        eventsAllowed:       g.eventsAllowed       ?? prev.eventsAllowed,
        smokingAllowed:      g.smokingAllowed      ?? prev.smokingAllowed,
        silenceHours:        g.silenceHours        || prev.silenceHours,
        additionalRules:     g.additionalRules     || prev.additionalRules,
        coMonoxideDetector:  g.coMonoxideDetector  ?? prev.coMonoxideDetector,
        smokeAlarm:          g.smokeAlarm          ?? prev.smokeAlarm,
        securityCamera:      g.securityCamera      ?? prev.securityCamera,
        safetyNotes:         g.safetyNotes         || prev.safetyNotes,
        checkoutInstructions: g.checkoutInstructions?.length ? g.checkoutInstructions : prev.checkoutInstructions,
        hostName:            g.hostName            || prev.hostName,
        hostPhone:           g.hostPhone           || prev.hostPhone,
        emergencyPhone:      g.emergencyPhone      || prev.emergencyPhone,
        cancellationPolicy:  g.cancellationPolicy  || prev.cancellationPolicy,
      }));
      toast.success('¡Anuncio importado! Revisa y completa los campos faltantes.');
      setImportUrl('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setImportError(msg);
    } finally {
      setImporting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-container" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/guias')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="page-title">{isEdit ? 'Editar Guía' : 'Nueva Guía de Propiedad'}</h1>
            <p className="page-subtitle">Completa los datos para generar el PDF de bienvenida</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleSaveAndPDF} disabled={saving}>
            Guardar y PDF
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* ── Import from Airbnb panel ──────────────────────────────────────── */}
      <div style={{
        marginTop: 16,
        padding: '14px 18px',
        borderRadius: 12,
        border: '1.5px dashed #FF5A5F55',
        background: 'linear-gradient(135deg, #FF5A5F08, #FF5A5F04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link size={16} color="#FF5A5F" />
          <span style={{ fontWeight: 700, fontSize: 13, color: '#FF5A5F' }}>
            Importar desde Airbnb
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
            — Pega el link del anuncio y llenamos el formulario automáticamente
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="form-input"
            style={{ flex: 1 }}
            type="url"
            placeholder="https://www.airbnb.mx/rooms/1234567890  ·  También acepta links de hosting/editor"
            value={importUrl}
            onChange={e => { setImportUrl(e.target.value); setImportError(''); }}
            onKeyDown={e => e.key === 'Enter' && !importing && handleImport()}
            disabled={importing}
          />
          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={importing || !importUrl.trim()}
            style={{ minWidth: 110, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {importing ? (
              <>
                <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Leyendo…
              </>
            ) : (
              <>
                <Link size={14} />
                Importar
              </>
            )}
          </button>
        </div>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
          Acepta links públicos (<code style={{ fontFamily: 'monospace', background: 'var(--bg-color)', padding: '0 3px', borderRadius: 3 }}>airbnb.mx/rooms/ID</code>)
          {' '}o links del editor de anfitrión — los convertimos automáticamente al link público.
        </p>
        {importing && (
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Leyendo el anuncio y extrayendo información con IA… puede tomar 15-30 segundos.
          </p>
        )}
        {importError && (
          <p style={{ margin: 0, fontSize: 12, color: '#E53935', fontWeight: 600 }}>
            ⚠ {importError}
          </p>
        )}
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, marginTop: 8 }}>
        {/* Sidebar nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'sticky', top: 20, alignSelf: 'start' }}>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 14px',
                borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                fontSize: 13, fontWeight: activeSection === s.id ? 700 : 400,
                background: activeSection === s.id ? '#FF5A5F22' : 'transparent',
                color: activeSection === s.id ? '#FF5A5F' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Form sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ── 1. IDENTIFICACIÓN ─────────────────────────────────────────────── */}
          {activeSection === 'identificacion' && (
            <Section title="Identificación de la Propiedad">
              <Row>
                <Field label="Nombre de la propiedad *" required>
                  <input className="form-input" value={form.propertyName}
                    onChange={e => set('propertyName', e.target.value)}
                    placeholder="Ej: Casa de la Puerta Azul" />
                </Field>
                <Field label="Tipo de alojamiento">
                  <input className="form-input" value={form.propertyType}
                    onChange={e => set('propertyType', e.target.value)}
                    placeholder="Ej: Alojamiento Entero · Casa" />
                </Field>
              </Row>
              <Field label="Dirección completa">
                <input className="form-input" value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder="Calle, colonia, ciudad, estado, CP" />
              </Field>
              <Row>
                <Field label="Link Google Maps">
                  <input className="form-input" value={form.mapsUrl ?? ''}
                    onChange={e => set('mapsUrl', e.target.value)}
                    placeholder="https://maps.app.goo.gl/..." />
                </Field>
                <Field label="Link personalizado Airbnb">
                  <input className="form-input" value={form.airbnbCustomLink ?? ''}
                    onChange={e => set('airbnbCustomLink', e.target.value)}
                    placeholder="airbnb.mx/h/mi-propiedad" />
                </Field>
              </Row>
              <Field label="Descripción de la propiedad">
                <textarea className="form-input" rows={4} value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Describe la ubicación, comodidades y lo que hace especial a tu propiedad..." />
              </Field>
              <Row>
                <NumField label="Recámaras" value={form.bedrooms} onChange={v => set('bedrooms', v)} min={0} />
                <NumField label="Camas" value={form.beds} onChange={v => set('beds', v)} min={1} />
                <NumField label="Baños" value={form.bathrooms} onChange={v => set('bathrooms', v)} min={1} />
                <NumField label="Máx. huéspedes" value={form.maxGuests} onChange={v => set('maxGuests', v)} min={1} />
              </Row>
              <Row>
                <Field label="Precio mín. por noche (MXN)">
                  <input type="number" className="form-input" value={form.priceMin ?? ''}
                    onChange={e => set('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="1099" />
                </Field>
                <Field label="Precio máx. por noche (MXN)">
                  <input type="number" className="form-input" value={form.priceMax ?? ''}
                    onChange={e => set('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="1250" />
                </Field>
              </Row>
            </Section>
          )}

          {/* ── 2. ACCESO ───────────────────────────────────────────────────── */}
          {activeSection === 'acceso' && (
            <Section title="Llegada y Acceso">
              <Row>
                <Field label="Check-in desde">
                  <input className="form-input" value={form.checkinStart}
                    onChange={e => set('checkinStart', e.target.value)}
                    placeholder="3:00 p.m." />
                </Field>
                <Field label="Check-in hasta">
                  <input className="form-input" value={form.checkinEnd}
                    onChange={e => set('checkinEnd', e.target.value)}
                    placeholder="11:00 p.m." />
                </Field>
                <Field label="Check-out antes de">
                  <input className="form-input" value={form.checkoutTime}
                    onChange={e => set('checkoutTime', e.target.value)}
                    placeholder="12:00 p.m." />
                </Field>
              </Row>
              <Row>
                <Field label="Método de entrada">
                  <input className="form-input" value={form.checkinMethod}
                    onChange={e => set('checkinMethod', e.target.value)}
                    placeholder="Ej: Teclado, Caja de llaves, Llave en persona…" />
                </Field>
                <Field label="Código de acceso (opcional)">
                  <input className="form-input" value={form.accessCode ?? ''}
                    onChange={e => set('accessCode', e.target.value)}
                    placeholder="Ej: 1234" />
                </Field>
              </Row>
              <Field label="Cómo llegar (indicaciones detalladas)">
                <textarea className="form-input" rows={5} value={form.directions}
                  onChange={e => set('directions', e.target.value)}
                  placeholder="Describe la ruta, referencias visuales, dónde estacionar, etc." />
              </Field>
            </Section>
          )}

          {/* ── 3. WIFI ─────────────────────────────────────────────────────── */}
          {activeSection === 'wifi' && (
            <Section title="WiFi y Tecnología">
              <Row>
                <Field label="Nombre de la red WiFi">
                  <input className="form-input" value={form.wifiNetwork}
                    onChange={e => set('wifiNetwork', e.target.value)}
                    placeholder="NOMBRE_RED" />
                </Field>
                <Field label="Contraseña WiFi">
                  <input className="form-input" value={form.wifiPassword}
                    onChange={e => set('wifiPassword', e.target.value)}
                    placeholder="contraseña" />
                </Field>
              </Row>
              <Field label="Televisión y entretenimiento">
                <textarea className="form-input" rows={3} value={form.tvNotes ?? ''}
                  onChange={e => set('tvNotes', e.target.value)}
                  placeholder="Describe cómo usar la TV, controles, plataformas disponibles…" />
              </Field>
            </Section>
          )}

          {/* ── 4. MANUAL ───────────────────────────────────────────────────── */}
          {activeSection === 'manual' && (
            <Section title="Manual del Hogar">
              <Field label="Boiler / Calentador de agua">
                <textarea className="form-input" rows={4} value={form.boilerNotes ?? ''}
                  onChange={e => set('boilerNotes', e.target.value)}
                  placeholder="Instrucciones para encender el boiler, cuánto tarda, apagado correcto…" />
              </Field>
              <Field label="Basura y reciclaje">
                <textarea className="form-input" rows={3} value={form.garbageNotes ?? ''}
                  onChange={e => set('garbageNotes', e.target.value)}
                  placeholder="Dónde dejar la basura, días de recolección, separación…" />
              </Field>
              <Field label="Instrucciones adicionales">
                <textarea className="form-input" rows={4} value={form.houseManualExtra ?? ''}
                  onChange={e => set('houseManualExtra', e.target.value)}
                  placeholder="Electrodomésticos, calefacción, aire acondicionado, cortinas, jacuzzi…" />
              </Field>
            </Section>
          )}

          {/* ── 5. AMENIDADES ───────────────────────────────────────────────── */}
          {activeSection === 'amenidades' && (
            <Section title="Amenidades y Servicios">
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  className="form-input"
                  value={newAmenity}
                  onChange={e => setNewAmenity(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addAmenity()}
                  placeholder="Ej: Cocina completa, Estacionamiento, WiFi…"
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" onClick={addAmenity} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={16} /> Agregar
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {form.amenities.map((am, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--bg-color)', borderRadius: 8, padding: '8px 12px',
                    border: '1px solid var(--border-color)',
                  }}>
                    <span style={{ fontSize: 14 }}>✓ {am}</span>
                    <button
                      onClick={() => setForm(f => ({ ...f, amenities: f.amenities.filter((_, j) => j !== i) }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {form.amenities.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 16 }}>
                    Sin amenidades aún. Escribe y presiona Agregar.
                  </p>
                )}
              </div>
            </Section>
          )}

          {/* ── 6. REGLAS ───────────────────────────────────────────────────── */}
          {activeSection === 'reglas' && (
            <Section title="Reglas de la Casa">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <Toggle label="Mascotas permitidas" value={form.petsAllowed} onChange={v => set('petsAllowed', v)} />
                <Toggle label="Eventos permitidos" value={form.eventsAllowed} onChange={v => set('eventsAllowed', v)} />
                <Toggle label="Fumar permitido" value={form.smokingAllowed} onChange={v => set('smokingAllowed', v)} />
              </div>
              <Field label="Horas de silencio">
                <input className="form-input" value={form.silenceHours ?? ''}
                  onChange={e => set('silenceHours', e.target.value)}
                  placeholder="Ej: 10:00 p.m. – 8:00 a.m." />
              </Field>
              <Field label="Reglas adicionales">
                <textarea className="form-input" rows={5} value={form.additionalRules ?? ''}
                  onChange={e => set('additionalRules', e.target.value)}
                  placeholder="Una regla por línea o separadas por punto." />
              </Field>
            </Section>
          )}

          {/* ── 7. SEGURIDAD ────────────────────────────────────────────────── */}
          {activeSection === 'seguridad' && (
            <Section title="Seguridad">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <Toggle label="Detector de CO" value={form.coMonoxideDetector} onChange={v => set('coMonoxideDetector', v)} />
                <Toggle label="Alarma de humo" value={form.smokeAlarm} onChange={v => set('smokeAlarm', v)} />
                <Toggle label="Cámara exterior" value={form.securityCamera} onChange={v => set('securityCamera', v)} />
              </div>
              <Field label="Notas de seguridad">
                <textarea className="form-input" rows={4} value={form.safetyNotes ?? ''}
                  onChange={e => set('safetyNotes', e.target.value)}
                  placeholder="Información adicional de seguridad para el huésped…" />
              </Field>
            </Section>
          )}

          {/* ── 8. SALIDA ───────────────────────────────────────────────────── */}
          {activeSection === 'salida' && (
            <Section title="Instrucciones de Salida">
              <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-muted)' }}>
                Lista de verificación que el huésped debe completar antes de salir.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {form.checkoutInstructions.map((inst, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      minWidth: 24, height: 24, borderRadius: '50%',
                      background: '#FF5A5F', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                    }}>{i + 1}</span>
                    <input
                      className="form-input"
                      value={inst}
                      onChange={e => updateInstruction(i, e.target.value)}
                      placeholder={`Paso ${i + 1}…`}
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => removeInstruction(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="btn btn-secondary"
                onClick={addInstruction}
                style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={16} /> Agregar paso
              </button>
            </Section>
          )}

          {/* ── 9. CONTACTOS ────────────────────────────────────────────────── */}
          {activeSection === 'contactos' && (
            <Section title="Contactos y Política">
              <Row>
                <Field label="Nombre del anfitrión">
                  <input className="form-input" value={form.hostName ?? ''}
                    onChange={e => set('hostName', e.target.value)}
                    placeholder="Tu nombre o el del co-anfitrión" />
                </Field>
                <Field label="Teléfono del anfitrión">
                  <input className="form-input" value={form.hostPhone ?? ''}
                    onChange={e => set('hostPhone', e.target.value)}
                    placeholder="442 131 4203" />
                </Field>
              </Row>
              <Row>
                <Field label="Teléfono de emergencias">
                  <input className="form-input" value={form.emergencyPhone ?? ''}
                    onChange={e => set('emergencyPhone', e.target.value)}
                    placeholder="911" />
                </Field>
                <Field label="Política de cancelación">
                  <select className="form-input" value={form.cancellationPolicy ?? 'Flexible'}
                    onChange={e => set('cancellationPolicy', e.target.value)}>
                    <option>Flexible</option>
                    <option>Moderada</option>
                    <option>Estricta</option>
                    <option>Super Estricta 30</option>
                    <option>Super Estricta 60</option>
                    <option>Sin reembolso</option>
                  </select>
                </Field>
              </Row>
            </Section>
          )}

          {/* ── 10. IMÁGENES ────────────────────────────────────────────────── */}
          {activeSection === 'imagenes' && (
            <Section title="Imágenes">
              {/* Logo */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  LOGOTIPO (aparece en la portada)
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {form.logoDataUrl ? (
                    <div style={{ position: 'relative' }}>
                      <img src={form.logoDataUrl} alt="Logo" style={{ height: 70, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--border-color)' }} />
                      <button onClick={() => set('logoDataUrl', undefined)} style={{ position: 'absolute', top: -8, right: -8, background: '#dc2626', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <UploadButton label="Subir logo" onClick={() => logoRef.current?.click()} />
                  )}
                  <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'logo')} />
                </div>
              </div>

              {/* Footer image */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  PIE DE PÁGINA (aparece en la parte inferior de la portada)
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {form.footerDataUrl ? (
                    <div style={{ position: 'relative' }}>
                      <img src={form.footerDataUrl} alt="Footer" style={{ width: 200, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }} />
                      <button onClick={() => set('footerDataUrl', undefined)} style={{ position: 'absolute', top: -8, right: -8, background: '#dc2626', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <UploadButton label="Subir imagen de pie" onClick={() => footerRef.current?.click()} />
                  )}
                  <input ref={footerRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'footer')} />
                </div>
              </div>

              {/* Gallery */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  GALERÍA DE IMÁGENES (aparecen en la página de bienvenida, máx. 3 visibles en PDF)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                  {form.imageDataUrls.map((url, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={url} alt="" style={{ width: 110, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }} />
                      <button onClick={() => removeGalleryImage(i)} style={{ position: 'absolute', top: -8, right: -8, background: '#dc2626', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <UploadButton label="+ Agregar" onClick={() => imagesRef.current?.click()} small />
                  <input ref={imagesRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'gallery')} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  Las imágenes se comprimen automáticamente. Formatos: JPG, PNG, WebP.
                </p>
              </div>
            </Section>
          )}

          {/* Bottom save */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingBottom: 40 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/guias')}>Cancelar</button>
            <button className="btn btn-secondary" onClick={handleSaveAndPDF} disabled={saving}>Guardar y generar PDF</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar guía'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Mini components ────────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{
    background: 'var(--surface-color)',
    border: '1px solid var(--border-color)',
    borderRadius: 12, padding: 24,
    display: 'flex', flexDirection: 'column', gap: 14,
  }}>
    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>{title}</h2>
    {children}
  </div>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min((children as React.ReactNode[]).length ?? 1, 4)}, 1fr)`, gap: 12 }}>
    {children}
  </div>
);

const Field = ({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label}{required && <span style={{ color: '#FF5A5F' }}> *</span>}
    </label>
    {children}
  </div>
);

const NumField = ({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) => (
  <Field label={label}>
    <input type="number" className="form-input" value={value} min={min}
      onChange={e => onChange(Math.max(min, Number(e.target.value)))} />
  </Field>
);

const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div
    onClick={() => onChange(!value)}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 8, padding: 16, borderRadius: 10, cursor: 'pointer',
      border: `2px solid ${value ? '#00A699' : 'var(--border-color)'}`,
      background: value ? '#F5FFFB' : 'var(--bg-color)',
      transition: 'all 0.15s',
    }}
  >
    <span style={{ fontSize: 22 }}>{value ? '✓' : '✗'}</span>
    <span style={{ fontSize: 12, fontWeight: 600, color: value ? '#00A699' : 'var(--text-muted)', textAlign: 'center' }}>
      {label}
    </span>
  </div>
);

const UploadButton = ({ label, onClick, small }: { label: string; onClick: () => void; small?: boolean }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', flexDirection: small ? 'row' : 'column',
      alignItems: 'center', justifyContent: 'center', gap: 6,
      width: small ? 80 : 120, height: small ? 80 : 90,
      border: '2px dashed var(--border-color)',
      borderRadius: 8, background: 'var(--bg-color)',
      color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
      transition: 'all 0.15s',
    }}
  >
    <Upload size={small ? 16 : 24} />
    {label}
  </button>
);

export default GuiaForm;
