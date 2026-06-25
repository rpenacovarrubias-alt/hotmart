import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { WelcomeGuide } from '../types';
import { ArrowLeft, Save, Sparkles, Flame, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import './GuideBuilder.css';

const GuideBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { guides, addGuide, updateGuide } = useApp();

  const isEdit = Boolean(id);
  const existingGuide = isEdit ? guides.find(g => g.id === id) : null;

  // Extractor State
  const [airbnbUrl, setAirbnbUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState(0);
  const [showEditor, setShowEditor] = useState(isEdit);

  // Form State
  const [form, setForm] = useState<WelcomeGuide>({
    id: `guide_${Date.now()}`,
    name: '',
    type: 'casa',
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    maxGuests: 4,
    location: '',
    address: '',
    airbnbUrl: '',
    airbnbId: '',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    wifiNetwork: '',
    wifiPassword: '',
    hostName: '',
    hostPhone: '',
    hostEmail: '',
    welcomeMessage: '',
    inclusions: [],
    photos: [],
    checkInTime: '3:00 p.m.',
    checkInNote: 'Hasta las 11:00 p.m.',
    checkOutTime: '12:00 p.m.',
    checkOutNote: 'Máximo',
    accessInstructions: '',
    googleMapsUrl: '',
    boilerInstructions: [],
    trashInstructions: '',
    tvInstructions: '',
    additionalInstructions: '',
    amenities: [],
    petsAllowed: false,
    eventsAllowed: false,
    smokingAllowed: false,
    additionalRules: [],
    carbonMonoxideDetector: true,
    smokeDetector: false,
    securityCameras: true,
    checkoutSteps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Load existing guide if in edit mode
  useEffect(() => {
    if (isEdit && existingGuide) {
      setForm(existingGuide);
      setShowEditor(true);
    }
  }, [isEdit, existingGuide]);

  // Tab State
  const [activeTab, setActiveTab] = useState<'general' | 'acceso' | 'wifi' | 'manuales' | 'reglas' | 'seguridad'>('general');

  // Simulated extraction steps
  const extractionMessages = [
    'Conectando con Airbnb.com...',
    'Obteniendo información básica de la propiedad...',
    'Identificando número de habitaciones y baños...',
    'Extrayendo descripción del anfitrión y amenidades...',
    'Recuperando fotos del listing...',
    '¡Guía pre-estructurada con éxito!',
  ];

  const handleExtract = async () => {
    if (!airbnbUrl.trim()) {
      toast.error('Por favor ingresa una URL de Airbnb válida');
      return;
    }

    setIsExtracting(true);
    setExtractionStep(0);

    // Progress animation while real API call runs in parallel
    const stepInterval = setInterval(() => {
      setExtractionStep(prev =>
        prev < extractionMessages.length - 2 ? prev + 1 : prev
      );
    }, 3000);

    try {
      const response = await fetch('/api/import-airbnb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: airbnbUrl.trim() }),
      });

      clearInterval(stepInterval);
      setExtractionStep(extractionMessages.length - 1);

      if (!response.ok) {
        const { error } = await response.json() as { error: string };
        throw new Error(error ?? `Error ${response.status}`);
      }

      const { guide } = await response.json() as { guide: Record<string, unknown> };

      // Extract listing ID from URL for airbnbId
      const idMatch = airbnbUrl.match(/\/(\d{10,})/);
      const detectedId = idMatch ? idMatch[1] : `imported_${Date.now()}`;

      // Map API response (PropertyGuide-style fields) → WelcomeGuide fields
      const str  = (v: unknown, fallback = '') => (typeof v === 'string' && v ? v : fallback);
      const num  = (v: unknown, fallback = 0) => (typeof v === 'number' ? v : fallback);
      const bool = (v: unknown) => v === true;
      const arr  = (v: unknown): string[] =>
        Array.isArray(v) ? (v as unknown[]).filter(x => typeof x === 'string') as string[] : [];
      const strArr = (v: unknown): string[] => {
        if (Array.isArray(v)) return arr(v);
        if (typeof v === 'string' && v.trim()) return [v.trim()];
        return [];
      };

      const accessParts = [str(guide.checkinMethod), str(guide.directions)].filter(Boolean);

      const extractedPhotos = arr(guide.photos).filter(u => u.startsWith('http'));
      const extractedCover  = str(guide.coverPhoto) || extractedPhotos[0] || '';

      const extractedData: Partial<WelcomeGuide> = {
        name:                   str(guide.propertyName, 'Mi Propiedad Airbnb'),
        type:                   str(guide.propertyType, 'casa'),
        airbnbUrl:              str(guide.airbnbCustomLink, airbnbUrl),
        airbnbId:               detectedId,
        address:                str(guide.address),
        location:               str(guide.address),
        welcomeMessage:         str(guide.description),
        bedrooms:               num(guide.bedrooms, 1),
        beds:                   num(guide.beds, 1),
        bathrooms:              num(guide.bathrooms, 1),
        maxGuests:              num(guide.maxGuests, 2),
        checkInTime:            str(guide.checkinStart, '3:00 p.m.'),
        checkInNote:            str(guide.checkinEnd),
        checkOutTime:           str(guide.checkoutTime, '12:00 p.m.'),
        accessInstructions:     accessParts.join('\n\n'),
        googleMapsUrl:          str(guide.mapsUrl),
        wifiNetwork:            str(guide.wifiNetwork),
        wifiPassword:           str(guide.wifiPassword),
        tvInstructions:         str(guide.tvNotes),
        boilerInstructions:     strArr(guide.boilerNotes),
        trashInstructions:      str(guide.garbageNotes),
        additionalInstructions: str(guide.houseManualExtra),
        amenities:              arr(guide.amenities),
        inclusions:             arr(guide.amenities).slice(0, 7),
        petsAllowed:            bool(guide.petsAllowed),
        eventsAllowed:          bool(guide.eventsAllowed),
        smokingAllowed:         bool(guide.smokingAllowed),
        additionalRules:        strArr(guide.additionalRules),
        carbonMonoxideDetector: bool(guide.coMonoxideDetector),
        smokeDetector:          bool(guide.smokeAlarm),
        securityCameras:        bool(guide.securityCamera),
        checkoutSteps:          arr(guide.checkoutInstructions),
        hostName:               str(guide.hostName),
        hostPhone:              str(guide.hostPhone),
        imageUrl:               extractedCover,
        photos:                 extractedPhotos.slice(0, 5),
      };

      setTimeout(() => {
        setForm(prev => ({ ...prev, ...extractedData }));
        setIsExtracting(false);
        setShowEditor(true);
        toast.success('¡Datos extraídos con éxito! Revisa y personaliza los detalles.');
      }, 600);

    } catch (err) {
      clearInterval(stepInterval);
      setIsExtracting(false);
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error al extraer datos: ${msg}`);
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Por favor ingresa un nombre para la propiedad');
      return;
    }

    const finalForm = {
      ...form,
      updatedAt: new Date().toISOString(),
    };

    if (isEdit) {
      updateGuide(finalForm);
      toast.success('¡Guía actualizada correctamente!');
    } else {
      addGuide(finalForm);
      toast.success('¡Nueva guía creada correctamente!');
    }
    navigate('/guias');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean, index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isGallery && index !== undefined) {
        setForm(prev => {
          const newPhotos = [...prev.photos];
          newPhotos[index] = base64String;
          return { ...prev, photos: newPhotos };
        });
      } else {
        setForm(prev => ({ ...prev, imageUrl: base64String }));
      }
      toast.success('Imagen cargada con éxito');
    };
    reader.readAsDataURL(file);
  };

  // Helper arrays update
  const handleArrayChange = (field: 'boilerInstructions' | 'checkoutSteps' | 'additionalRules' | 'inclusions' | 'amenities', index: number, value: string) => {
    setForm(prev => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleAddArrayItem = (field: 'boilerInstructions' | 'checkoutSteps' | 'additionalRules' | 'inclusions' | 'amenities') => {
    setForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleRemoveArrayItem = (field: 'boilerInstructions' | 'checkoutSteps' | 'additionalRules' | 'inclusions' | 'amenities', index: number) => {
    setForm(prev => {
      const arr = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: arr };
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/guias')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} color="var(--text-main)" />
          </button>
          <div>
            <h2 className="page-title" style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>
              {isEdit ? 'Editar Guía de Casa' : 'Nueva Guía de Casa'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {isEdit ? form.name : 'Ingresa la URL del listing de Airbnb para extraer los detalles o construye una desde cero.'}
            </p>
          </div>
        </div>
        {showEditor && (
          <button className="btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '10px' }}>
            <Save size={16} />
            Guardar Cambios
          </button>
        )}
      </div>

      {/* EXTRACTOR STEP */}
      {!showEditor && !isExtracting && (
        <div className="extractor-card">
          <div className="extractor-icon-container">
            <Sparkles size={32} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>Extractor de Datos Airbnb</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
            Pega la URL de tu anuncio en Airbnb y nuestro sistema intentará pre-cargar las recámaras, m², fotos, ubicación e información general automáticamente.
          </p>

          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="https://www.airbnb.mx/rooms/1667036785999383762" 
              value={airbnbUrl}
              onChange={e => setAirbnbUrl(e.target.value)}
              style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1.5px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
            />
            <button className="btn-primary" onClick={handleExtract} style={{ padding: '0 24px', borderRadius: '10px' }}>
              Extraer Detalles
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>O, si lo prefieres: </span>
            <button 
              onClick={() => setShowEditor(true)} 
              style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '12px', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
            >
              Comenzar con una guía en blanco
            </button>
          </div>
        </div>
      )}

      {/* LOADING EXTRACTION SCREEN */}
      {isExtracting && (
        <div className="extractor-card" style={{ padding: '80px 24px' }}>
          <div className="spinner"></div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>Extrayendo Información del Anuncio</h3>
          <p style={{ color: 'var(--primary-color)', fontSize: '14px', fontWeight: 600, animation: 'pulse 1.5s infinite' }}>
            {extractionMessages[extractionStep]}
          </p>
          <div style={{ width: '100%', maxWidth: '300px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', margin: '20px auto 0', overflow: 'hidden' }}>
            <div style={{ width: `${((extractionStep + 1) / extractionMessages.length) * 100}%`, height: '100%', background: 'var(--primary-color)', borderRadius: '3px', transition: 'width 0.4s ease' }}></div>
          </div>
        </div>
      )}

      {/* EDITOR FORM */}
      {showEditor && (
        <div className="editor-grid">
          {/* Left Column: Tab list */}
          <div className="editor-sidebar-tabs">
            <button className={`tab-item-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
              Información General
            </button>
            <button className={`tab-item-btn ${activeTab === 'acceso' ? 'active' : ''}`} onClick={() => setActiveTab('acceso')}>
              Llegada y Acceso
            </button>
            <button className={`tab-item-btn ${activeTab === 'wifi' ? 'active' : ''}`} onClick={() => setActiveTab('wifi')}>
              Conexión WiFi
            </button>
            <button className={`tab-item-btn ${activeTab === 'manuales' ? 'active' : ''}`} onClick={() => setActiveTab('manuales')}>
              Manual del Hogar
            </button>
            <button className={`tab-item-btn ${activeTab === 'reglas' ? 'active' : ''}`} onClick={() => setActiveTab('reglas')}>
              Amenidades y Reglas
            </button>
            <button className={`tab-item-btn ${activeTab === 'seguridad' ? 'active' : ''}`} onClick={() => setActiveTab('seguridad')}>
              Seguridad y Contactos
            </button>
          </div>

          {/* Right Column: Tab Content */}
          <div className="editor-content-card">
            {/* 1. GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="tab-pane-content">
                <h3 className="section-form-title">Información Básica de la Casa</h3>

                <div className="form-group">
                  <label className="form-label">Nombre del Anuncio / Propiedad <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="text" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej. Casa 2Hab con A/C | cerca Pirámide" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Tipo de Alojamiento</label>
                    <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="casa">Casa</option>
                      <option value="departamento">Departamento</option>
                      <option value="loft">Loft</option>
                      <option value="hotel">Hotel</option>
                      <option value="villa">Villa</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ubicación (Ciudad/Estado)</label>
                    <input type="text" className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ej. Corregidora, Querétaro, México" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Recámaras</label>
                    <input type="number" min={0} className="form-input" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: Number(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Camas</label>
                    <input type="number" min={0} className="form-input" value={form.beds} onChange={e => setForm({ ...form, beds: Number(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Baños</label>
                    <input type="number" min={0} className="form-input" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: Number(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Máx. Huéspedes</label>
                    <input type="number" min={1} className="form-input" value={form.maxGuests} onChange={e => setForm({ ...form, maxGuests: Number(e.target.value) })} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Dirección Completa</label>
                  <input type="text" className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Calle, Número, C.P., Ciudad" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Enlace de Airbnb</label>
                    <input type="text" className="form-input" value={form.airbnbUrl} onChange={e => setForm({ ...form, airbnbUrl: e.target.value })} placeholder="airbnb.mx/rooms/..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ID del Anuncio</label>
                    <input type="text" className="form-input" value={form.airbnbId} onChange={e => setForm({ ...form, airbnbId: e.target.value })} placeholder="1667036785..." />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Imagen de Portada</label>
                  {form.imageUrl ? (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <img src={form.imageUrl} alt="Portada" style={{ width: 140, height: 95, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)', flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                          <button className="btn-outline" type="button" style={{ whiteSpace: 'nowrap', padding: '8px 14px', fontSize: 13 }}>Cambiar Imagen</button>
                          <input type="file" accept="image/*" onChange={e => handleImageUpload(e, false)} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                        </div>
                        <input type="text" className="form-input" value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="O pega una URL..." style={{ fontSize: 12 }} />
                        <button type="button" onClick={() => setForm({ ...form, imageUrl: '' })} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 12, cursor: 'pointer', textAlign: 'left', padding: 0 }}>✕ Quitar imagen</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input type="text" className="form-input" style={{ flex: 1 }} value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://... o sube un archivo" />
                      <div style={{ position: 'relative', overflow: 'hidden' }}>
                        <button className="btn-outline" type="button" style={{ height: '100%', whiteSpace: 'nowrap', padding: '10px 14px' }}>Subir Archivo</button>
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, false)} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Mensaje de Bienvenida</label>
                  <textarea rows={4} className="form-input" style={{ resize: 'vertical' }} value={form.welcomeMessage} onChange={e => setForm({ ...form, welcomeMessage: e.target.value })} placeholder="Un mensaje cordial introductorio..." />
                </div>

                {/* Galería (hasta 5 fotos) */}
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '24px 0 12px' }}>Fotos de la Galería</h4>
                {[0, 1, 2, 3, 4].map(idx => {
                  const photoVal = form.photos[idx] || '';
                  const hasPhoto = Boolean(photoVal);
                  return (
                    <div key={idx} className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Foto {idx + 1}</label>
                      {hasPhoto ? (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <img src={photoVal} alt={`Foto ${idx + 1}`} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)', flexShrink: 0 }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                            <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                              <button className="btn-outline" type="button" style={{ whiteSpace: 'nowrap', padding: '7px 12px', fontSize: 12 }}>Cambiar</button>
                              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, true, idx)} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                            </div>
                            <input type="text" className="form-input" value={photoVal.startsWith('data:') ? '' : photoVal} onChange={e => { const p = [...form.photos]; p[idx] = e.target.value; setForm({ ...form, photos: p }); }} placeholder="O pega una URL..." style={{ fontSize: 12 }} />
                            <button type="button" onClick={() => { const p = [...form.photos]; p[idx] = ''; setForm({ ...form, photos: p }); }} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 12, cursor: 'pointer', textAlign: 'left', padding: 0 }}>✕ Quitar foto</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <input type="text" className="form-input" style={{ flex: 1 }} value={photoVal} onChange={e => { const p = [...form.photos]; p[idx] = e.target.value; setForm({ ...form, photos: p }); }} placeholder="https://... o sube un archivo" />
                          <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <button className="btn-outline" type="button" style={{ height: '100%', whiteSpace: 'nowrap', padding: '10px 14px' }}>Subir Archivo</button>
                            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, true, idx)} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. ACCESO Y LLEGADA TAB */}
            {activeTab === 'acceso' && (
              <div className="tab-pane-content">
                <h3 className="section-form-title">Detalles de la Llegada</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Hora de Check-in</label>
                    <input type="text" className="form-input" value={form.checkInTime} onChange={e => setForm({ ...form, checkInTime: e.target.value })} placeholder="3:00 p.m." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nota de Check-in</label>
                    <input type="text" className="form-input" value={form.checkInNote} onChange={e => setForm({ ...form, checkInNote: e.target.value })} placeholder="Hasta las 11:00 p.m." />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Hora de Check-out</label>
                    <input type="text" className="form-input" value={form.checkOutTime} onChange={e => setForm({ ...form, checkOutTime: e.target.value })} placeholder="12:00 p.m." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nota de Check-out</label>
                    <input type="text" className="form-input" value={form.checkOutNote} onChange={e => setForm({ ...form, checkOutNote: e.target.value })} placeholder="Máximo" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ubicación en Google Maps (URL)</label>
                  <input type="text" className="form-input" value={form.googleMapsUrl} onChange={e => setForm({ ...form, googleMapsUrl: e.target.value })} placeholder="https://maps.app.goo.gl/..." />
                </div>

                <div className="form-group">
                  <label className="form-label">Instrucciones de Entrada / Código</label>
                  <textarea rows={4} className="form-input" style={{ resize: 'vertical' }} value={form.accessInstructions} onChange={e => setForm({ ...form, accessInstructions: e.target.value })} placeholder="Código de la chapa, portón, llaveros, etc..." />
                </div>
              </div>
            )}

            {/* 3. WIFI TAB */}
            {activeTab === 'wifi' && (
              <div className="tab-pane-content">
                <h3 className="section-form-title">Configuración de Conexión WiFi</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Esta información se utilizará para generar el código QR de conexión automática para que los huéspedes lo escaneen en sus teléfonos celulares.
                </p>

                <div className="form-group">
                  <label className="form-label">Nombre de la Red (SSID) <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="text" className="form-input" value={form.wifiNetwork} onChange={e => setForm({ ...form, wifiNetwork: e.target.value })} placeholder="Ej. INFINITUM_5G" />
                </div>

                <div className="form-group">
                  <label className="form-label">Contraseña <span style={{ color: '#EF4444' }}>*</span></label>
                  <input type="text" className="form-input" value={form.wifiPassword} onChange={e => setForm({ ...form, wifiPassword: e.target.value })} placeholder="Ej. utHK9UGGTu" />
                </div>

                {form.wifiNetwork && form.wifiPassword && (
                  <div style={{ marginTop: '30px', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--bg-light)' }}>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=WIFI:S:${encodeURIComponent(form.wifiNetwork)};T:WPA;P:${encodeURIComponent(form.wifiPassword)};;`} 
                        alt="Preview QR WiFi" 
                        style={{ width: '100px', height: '100px' }}
                      />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0' }}>Vista previa del QR WiFi</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                        El huésped solo tendrá que escanear este código con la cámara de su teléfono para conectarse automáticamente sin escribir la contraseña.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. MANUALES TAB */}
            {activeTab === 'manuales' && (
              <div className="tab-pane-content">
                <h3 className="section-form-title">Manual de Uso y Funcionamiento</h3>

                {/* Boiler */}
                <div style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    <Flame size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
                    Instrucciones del Calentador (Boiler)
                  </label>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>Escribe los pasos para encender o configurar el boiler (ej. "gira la perilla a piloto", etc.).</p>
                  
                  {form.boilerInstructions.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ alignSelf: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--primary-color)' }}>{idx + 1}.</span>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={step} 
                        onChange={e => handleArrayChange('boilerInstructions', idx, e.target.value)} 
                        placeholder={`Paso ${idx + 1}`}
                      />
                      <button className="btn-outline" onClick={() => handleRemoveArrayItem('boilerInstructions', idx)} style={{ padding: '0 10px', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button className="btn-outline" onClick={() => handleAddArrayItem('boilerInstructions')} style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px', padding: '6px 12px' }}>
                    <Plus size={14} /> Agregar Paso
                  </button>
                </div>

                {/* Basura */}
                <div className="form-group">
                  <label className="form-label">
                    <Trash2 size={16} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
                    Gestión de Basura y Reciclaje
                  </label>
                  <textarea rows={3} className="form-input" style={{ resize: 'vertical' }} value={form.trashInstructions} onChange={e => setForm({ ...form, trashInstructions: e.target.value })} placeholder="Dónde colocar las bolsas de basura y en qué días pasa la recolección..." />
                </div>

                {/* TV */}
                <div className="form-group">
                  <label className="form-label">Entretenimiento / Smart TV</label>
                  <textarea rows={3} className="form-input" style={{ resize: 'vertical' }} value={form.tvInstructions} onChange={e => setForm({ ...form, tvInstructions: e.target.value })} placeholder="Instrucciones para encender la Smart TV o las aplicaciones instaladas..." />
                </div>

                {/* Instrucciones Adicionales */}
                <div className="form-group">
                  <label className="form-label">Instrucciones Especiales / Notas Adicionales</label>
                  <textarea rows={4} className="form-input" style={{ resize: 'vertical' }} value={form.additionalInstructions} onChange={e => setForm({ ...form, additionalInstructions: e.target.value })} placeholder="Notas especiales de luces, controles remotos, aire acondicionado..." />
                </div>
              </div>
            )}

            {/* 5. REGLAS Y AMENIDADES TAB */}
            {activeTab === 'reglas' && (
              <div className="tab-pane-content">
                <h3 className="section-form-title">Amenidades y Reglas de Convivencia</h3>

                {/* Amenidades */}
                <div style={{ marginBottom: '28px' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Inclusiones / Amenidades de la Casa</label>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>Escribe las 5-7 principales amenidades que se mostrarán en cuadros con íconos.</p>
                  
                  {form.inclusions.map((inc, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={inc} 
                        onChange={e => handleArrayChange('inclusions', idx, e.target.value)} 
                        placeholder={`Amenidad ${idx + 1}`}
                      />
                      <button className="btn-outline" onClick={() => handleRemoveArrayItem('inclusions', idx)} style={{ padding: '0 10px', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button className="btn-outline" onClick={() => handleAddArrayItem('inclusions')} style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px', padding: '6px 12px' }}>
                    <Plus size={14} /> Agregar Amenidad
                  </button>
                </div>

                {/* Reglas de la Casa */}
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '24px 0 16px' }}>Reglas de la Casa (Permitido/Prohibido)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>¿Acepta Mascotas?</span>
                    <input type="checkbox" checked={form.petsAllowed} onChange={e => setForm({ ...form, petsAllowed: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>¿Permite Eventos?</span>
                    <input type="checkbox" checked={form.eventsAllowed} onChange={e => setForm({ ...form, eventsAllowed: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>¿Permite Fumar?</span>
                    <input type="checkbox" checked={form.smokingAllowed} onChange={e => setForm({ ...form, smokingAllowed: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  </label>
                </div>

                {/* Reglas Adicionales */}
                <div style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Reglas y Normas de Convivencia Detalladas</label>
                  
                  {form.additionalRules.map((rule, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={rule} 
                        onChange={e => handleArrayChange('additionalRules', idx, e.target.value)} 
                        placeholder={`Norma ${idx + 1}`}
                      />
                      <button className="btn-outline" onClick={() => handleRemoveArrayItem('additionalRules', idx)} style={{ padding: '0 10px', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button className="btn-outline" onClick={() => handleAddArrayItem('additionalRules')} style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px', padding: '6px 12px' }}>
                    <Plus size={14} /> Agregar Norma
                  </button>
                </div>
              </div>
            )}

            {/* 6. SEGURIDAD Y CONTACTOS TAB */}
            {activeTab === 'seguridad' && (
              <div className="tab-pane-content">
                <h3 className="section-form-title">Dispositivos de Seguridad y Contactos</h3>

                {/* Seguridad Badges */}
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Seguridad y Alarmas</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>Detector Monóxido Carbono</span>
                    <input type="checkbox" checked={form.carbonMonoxideDetector} onChange={e => setForm({ ...form, carbonMonoxideDetector: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>Detector de Humo</span>
                    <input type="checkbox" checked={form.smokeDetector} onChange={e => setForm({ ...form, smokeDetector: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>Cámaras Exteriores</span>
                    <input type="checkbox" checked={form.securityCameras} onChange={e => setForm({ ...form, securityCameras: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  </label>
                </div>

                {/* Checkout Steps */}
                <div style={{ marginBottom: '32px' }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Tareas de Salida (Checkout steps)</label>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>Indica los pasos requeridos para hacer el checkout (ej. "dejar llaves en la mesa", "apagar luces").</p>
                  
                  {form.checkoutSteps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ alignSelf: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--primary-color)' }}>{idx + 1}.</span>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={step} 
                        onChange={e => handleArrayChange('checkoutSteps', idx, e.target.value)} 
                        placeholder={`Paso ${idx + 1}`}
                      />
                      <button className="btn-outline" onClick={() => handleRemoveArrayItem('checkoutSteps', idx)} style={{ padding: '0 10px', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button className="btn-outline" onClick={() => handleAddArrayItem('checkoutSteps')} style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px', padding: '6px 12px' }}>
                    <Plus size={14} /> Agregar Paso de Salida
                  </button>
                </div>

                {/* Contactos */}
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Contacto del Anfitrión</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Nombre del Anfitrión / Co-Anfitrión</label>
                    <input type="text" className="form-input" value={form.hostName} onChange={e => setForm({ ...form, hostName: e.target.value })} placeholder="Ej. Ricardo Peña" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono de Soporte (10 dígitos)</label>
                    <input type="text" className="form-input" value={form.hostPhone} onChange={e => setForm({ ...form, hostPhone: e.target.value })} placeholder="Ej. 4421851478" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideBuilder;
