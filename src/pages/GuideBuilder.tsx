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

  const handleExtract = () => {
    if (!airbnbUrl.trim()) {
      toast.error('Por favor ingresa una URL de Airbnb válida');
      return;
    }

    setIsExtracting(true);
    setExtractionStep(0);

    // Animación de extracción en pasos
    const interval = setInterval(() => {
      setExtractionStep(prev => {
        if (prev >= extractionMessages.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            // Completado: poblar con mock data basado en la URL
            let extractedData: Partial<WelcomeGuide> = {};

            const isPiramide = airbnbUrl.includes('1667036785999383762') || airbnbUrl.toLowerCase().includes('piramide') || airbnbUrl.toLowerCase().includes('mora');
            const isPuertaAzul = airbnbUrl.toLowerCase().includes('puerta-azul') || airbnbUrl.toLowerCase().includes('azul');

            if (isPiramide) {
              extractedData = {
                name: 'Casa 2Hab con A/C | cerca Pirámide',
                type: 'casa',
                bedrooms: 2,
                beds: 2,
                bathrooms: 1,
                maxGuests: 2,
                location: 'Paseos del Bosque, Corregidora, Querétaro, México',
                address: 'Paseos del Bosque, Corregidora, Querétaro, México',
                airbnbUrl: 'www.airbnb.mx/rooms/1667036785999383762',
                airbnbId: '1667036785999383762',
                imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
                wifiNetwork: 'Kuni',
                wifiPassword: 'Relax@33h.k',
                hostName: 'Co-Anfitrión Ricardo Peña C.',
                hostPhone: '4421851478',
                hostEmail: 'ricardo@example.com',
                welcomeMessage: 'Casa tranquila y equipada para trabajar o descansar. Espacio cómodo y silencioso ideal para trabajo remoto, parejas o familias pequeñas. Ubicada en Paseos del Bosque, a minutos de la Pirámide del Pueblito y 18 min del Centro. Lugar práctico, limpio y con buena energía.',
                inclusions: ['2 recámaras con cama matrimonial', 'Aire acondicionado', 'Smart TV 55" QLED', 'Cocina completamente equipada', 'Agua caliente', 'UPS para internet y laptop', 'Estacionamiento para 2 autos'],
                photos: ['/images/casa-mora/photo1.jpg', '/images/casa-mora/photo2.jpg', '/images/casa-mora/photo3.jpg'],
                checkInTime: '3:00 p.m.',
                checkInNote: 'hasta las 11:00 p.m.',
                checkOutTime: '12:00 p.m.',
                checkOutNote: 'Maximo',
                accessInstructions: 'A tu llegada por favor, notifica en la app de AIRBNB por mensaje y te abriremos enseguida el acceso vial. y para entrar a la propiedad. ya te habremos enviado tu código de apertura, con el que podrás tener acceso a la casa. Dentro de la casa encontrarás un llavero de control remoto para el acceso al condominio, con el podrás salir y entrar cuando lo requieras.',
                googleMapsUrl: 'https://maps.app.goo.gl/2sSTjeTdve22uyNXA',
                boilerInstructions: [
                  'El Boiler es eléctrico y está conectado y prendido, puedes asegurarte que se encuentra encendido por la pantalla led con el indicador de la temperatura.',
                  'si no lo está tiene el botón de encendido debajo de la pantalla.'
                ],
                trashInstructions: 'La basura la puedes dejar en los contenedores que se encuentran en el cuarto que se encuentra al lado de la puerta de acceso al condominio.',
                tvInstructions: 'Smart TV 55" QLED en la sala de estar.',
                additionalInstructions: 'Los focos del comedor, sala, y habitaciones tienen un control remoto para cambiar de intensidad y de color de luz Fría y Cálida. para que tu elijas el ambiente de esos espacios. El aire acondicionado funciona por horarios, solo se encuentra en el área del comedor y sala.',
                amenities: ['2 recámaras matrimoniales', 'Aire acondicionado', 'Smart TV 55" QLED', 'Cocina equipada', 'Calentador eléctrico', 'UPS para internet', 'Estacionamiento (2 autos)'],
                petsAllowed: false,
                eventsAllowed: false,
                smokingAllowed: false,
                additionalRules: ['Debido a que la casa es para hospedaje y descanso, no se permiten las fiestas en la propiedad', 'Asegurarse de dejar todo apagado la fecha de salida'],
                carbonMonoxideDetector: true,
                smokeDetector: false,
                securityCameras: true,
                checkoutSteps: ['Dejar el llaver de acceso al condominio en la mesa', 'Asegurarse de dejar todo apagado', 'Solicitar la apertura del Portón.'],
              };
            } else if (isPuertaAzul) {
              extractedData = {
                name: 'Casa de la Puerta Azul',
                type: 'casa',
                bedrooms: 4,
                beds: 4,
                bathrooms: 3,
                maxGuests: 8,
                location: 'Centro, Qro',
                address: 'Fray Francisco de Los Angeles 240, Quintas del Marques, 76047 Santiago de Querétaro, Qro.',
                airbnbUrl: 'airbnb.mx/h/casalapuertaazul',
                airbnbId: '56789012',
                imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
                wifiNetwork: 'INFINITUM56B6',
                wifiPassword: 'utHK9UGGTu',
                hostName: 'Ricardo (Co-anfitrión)',
                hostPhone: '442 185 1478',
                hostEmail: 'luis@example.com',
                welcomeMessage: 'Ubicación, Privacidad y Comodidad. A un costado del Estadio Corregidora con acceso a la Carretera 57 Mex-Qro y al Libramiento Fray Junípero Serra. Lugar tranquilo, seguro y cómodo, ideal tanto para trabajo como para descanso. Puedes llegar en tu auto o en camión – la casa se encuentra a tan solo 3 minutos de la terminal de autobuses TAQ.',
                inclusions: ['Cocina completa (refrigerador, horno, estufa)', 'Detector de monóxido de carbono', 'Estacionamiento gratuito en cochera (1 lugar)', 'Televisión HD con Netflix', 'WiFi de alta velocidad', 'Área de trabajo con escritorio y enchufe'],
                photos: ['/images/casa-puerta-azul/window-grapes.jpg', '/images/casa-puerta-azul/gate-door.jpg', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
                checkInTime: '3:00 p.m.',
                checkInNote: 'Hasta las 11:00 p.m.',
                checkOutTime: '12:00 p.m.',
                checkOutNote: 'Máximo',
                accessInstructions: 'Acceso autónomo mediante teclado digital (Keypad) en la puerta de entrada.',
                googleMapsUrl: 'https://maps.google.com/?q=Fray+Francisco+de+Los+Angeles+240,+Santiago+de+Querétaro',
                boilerInstructions: [
                  'El boiler tiene el piloto encendido de manera permanente.',
                  'Gira la perilla a la posición de "Encendido" cuando vayas a bañarte.',
                  'Espera entre 10 y 15 minutos para que el agua se caliente por completo.',
                  'Al salir de la propiedad, regresa siempre la perilla del boiler a la posición de "Piloto" para ahorrar gas y por seguridad.'
                ],
                trashInstructions: 'La basura la puedes depositar en los contenedores ubicados en el patio trasero de la casa. El camión recolector pasa de manera regular por la zona.',
                tvInstructions: 'La TV inteligente está configurada con las principales aplicaciones de streaming (Netflix, Disney+, Prime Video). Recuerda que deberás ingresar con tus cuentas personales y cerrarlas antes de tu salida.',
                additionalInstructions: 'Mantén las luces y los aparatos eléctricos apagados cuando te encuentres fuera del alojamiento. No dejes basura acumulada en el interior de la casa, colócala en el patio trasero antes de salir.',
                amenities: ['Cocina completa', 'Detector de monóxido de carbono', 'Estacionamiento (1 auto)', 'Smart TV HD', 'WiFi de alta velocidad', 'Área de trabajo'],
                petsAllowed: true,
                eventsAllowed: false,
                smokingAllowed: false,
                additionalRules: ['Mantén las luces y los aparatos eléctricos apagados cuando te encuentres fuera del alojamiento.', 'No dejes basura acumulada en el interior de la casa, colócala en el patio trasero antes de salir.', 'Al salir de la propiedad, no es necesario colocar cerraduras manuales extras adicionales; la cerradura digital inteligente se bloquea de manera autónoma.'],
                carbonMonoxideDetector: true,
                smokeDetector: false,
                securityCameras: true,
                checkoutSteps: ['Apaga todas las luces de la casa.', 'Apaga todos los aparatos eléctricos (TV, ventiladores, aire acondicionado, etc.).', 'Regresa la perilla del boiler a la posición de "Piloto".', 'Deja la basura en el patio trasero en bolsas cerradas.', 'Asegúrate de que los candados exteriores queden cerrados correctamente.'],
              };
            } else {
              // Genérico basado en URL
              const match = airbnbUrl.match(/rooms\/([0-9]+)/);
              const airbnbId = match ? match[1] : `gen_${Date.now()}`;
              extractedData = {
                name: 'Mi Nueva Propiedad Airbnb',
                type: 'casa',
                bedrooms: 3,
                beds: 3,
                bathrooms: 2,
                maxGuests: 6,
                location: 'Querétaro, Qro., México',
                address: 'Calle Ficticia #123, Colonia Hermosa, Querétaro',
                airbnbUrl: airbnbUrl.replace('https://', '').replace('http://', ''),
                airbnbId: airbnbId,
                imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
                wifiNetwork: 'Red_Propiedad_WiFi',
                wifiPassword: 'Password123',
                hostName: 'Coanfitriones México Support',
                hostPhone: '4421851478',
                welcomeMessage: '¡Bienvenido a nuestro alojamiento! Hemos preparado esta guía interactiva para facilitar tu estadía y asegurar que te sientas como en casa.',
                inclusions: ['Cocina equipada', 'Agua caliente', 'WiFi de alta velocidad', 'Televisión Smart', 'Estacionamiento'],
                photos: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
                checkInTime: '3:00 p.m.',
                checkInNote: 'Hasta las 11:00 p.m.',
                checkOutTime: '12:00 p.m.',
                checkOutNote: 'Máximo',
                accessInstructions: 'Acceso autónomo mediante caja de llaves de seguridad en el exterior con código digital.',
                googleMapsUrl: 'https://maps.google.com',
                boilerInstructions: ['El calentador de agua está encendido de manera automática.', 'No es necesario realizar ajustes adicionales.'],
                trashInstructions: 'Puedes depositar la basura en el depósito exterior principal de la privada.',
                tvInstructions: 'La televisión inteligente cuenta con conexión WiFi para que uses tus aplicaciones favoritas.',
                amenities: ['Acceso autónomo', 'WiFi', 'Cocina', 'Área de trabajo', 'Estacionamiento'],
                petsAllowed: false,
                eventsAllowed: false,
                smokingAllowed: false,
                additionalRules: ['Mantener el orden y el silencio a partir de las 10:00 p.m.', 'Apagar luces al salir.'],
                carbonMonoxideDetector: true,
                smokeDetector: true,
                securityCameras: false,
                checkoutSteps: ['Apagar luces y aire acondicionado.', 'Dejar las llaves en la caja de seguridad exterior.', 'Cerrar la puerta.', 'Avisar al anfitrión.'],
              };
            }

            setForm(prev => ({ ...prev, ...extractedData }));
            setIsExtracting(false);
            setShowEditor(true);
            toast.success('¡Extracción completada! Ya puedes personalizar los detalles.');
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Por favor ingresa un nombre para la propiedad');
      return;
    }
    if (!form.wifiNetwork.trim() || !form.wifiPassword.trim()) {
      toast.error('Por favor ingresa el nombre y la contraseña del WiFi');
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
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="text" className="form-input" style={{ flex: 1 }} value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="URL de la imagen o selecciona un archivo..." />
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <button className="btn-outline" type="button" style={{ height: '100%', whiteSpace: 'nowrap', padding: '10px 14px' }}>Subir Archivo</button>
                      <input type="file" accept="image/*" onChange={e => handleImageUpload(e, false)} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mensaje de Bienvenida</label>
                  <textarea rows={4} className="form-input" style={{ resize: 'vertical' }} value={form.welcomeMessage} onChange={e => setForm({ ...form, welcomeMessage: e.target.value })} placeholder="Un mensaje cordial introductorio..." />
                </div>

                {/* Galería (3 fotos) */}
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '24px 0 12px' }}>Fotos de la Galería (3 Requeridas)</h4>
                {[0, 1, 2].map(idx => (
                  <div key={idx} className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>Foto {idx + 1}</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ flex: 1 }}
                        value={form.photos[idx] || ''} 
                        onChange={e => {
                          const newPhotos = [...form.photos];
                          newPhotos[idx] = e.target.value;
                          setForm({ ...form, photos: newPhotos });
                        }} 
                        placeholder="URL de la imagen o selecciona un archivo..."
                      />
                      <div style={{ position: 'relative', overflow: 'hidden' }}>
                        <button className="btn-outline" type="button" style={{ height: '100%', whiteSpace: 'nowrap', padding: '10px 14px' }}>Subir Archivo</button>
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, true, idx)} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                      </div>
                    </div>
                  </div>
                ))}
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
