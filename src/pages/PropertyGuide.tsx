import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Printer,
  Wifi,
  Tv,
  Flame,
  Trash2,
  Check,
  Phone,
  ShieldAlert,
  Bed,
  Users,
  UtensilsCrossed,
  Briefcase,
  MonitorCheck,
  Wind,
  Key
} from 'lucide-react';
import './PropertyGuide.css';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TiktokIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .57.04.84.13V9.5a7.21 7.21 0 0 0-1-.07 6.33 6.33 0 0 0-.25 12.66 6.33 6.33 0 0 0 6.13-5.22h.06V8.71a9.77 9.77 0 0 0 6.13 2.14V7.41a6.39 6.39 0 0 1-1.87-.72z"/>
  </svg>
);

const BlueskyIcon = () => (
  <svg viewBox="0 0 576 512" width="16" height="16" fill="currentColor">
    <path d="M407.8 29.4C379.8 82.5 328.7 182.9 288 249.7 247.3 182.9 196.2 82.5 168.2 29.4 148-9.1 88.5-9.8 61.4 27.7c-26.6 36.9-4.8 112.7 15.6 172.9 23.3 68.7 64.9 143.4 96.9 183.1 27.9 34.7 65.5 50.1 101.9 57.6-56.1 11.3-107.5 14.8-129.2 11.5-63.5-9.6-96.1-47.4-106.3-103.7-1.7-9.4-11.2-14.7-20.1-11.4L4.7 344c-9.1 3.3-13.6 13.4-10.1 22.4C17.6 427.4 67.5 486.2 150.2 505c31 7.1 72.8 8 116.8-5.3 7.8-2.4 13.8-8.2 16.5-15.8L288 471.5l4.6 12.3c2.7 7.6 8.7 13.4 16.5 15.8 44 13.3 85.8 12.4 116.8 5.3 82.7-18.9 132.6-77.7 155.6-138.6 3.5-9 1-19.1-10.1-22.4l-19.5-7.1c-8.9-3.3-18.4 2-20.1 11.4-10.2 56.3-42.8 94.1-106.3 103.7-21.7 3.3-73.1-.2-129.2-11.5 36.4-7.5 74-22.9 101.9-57.6 32-39.7 73.6-114.4 96.9-183.1 20.4-60.2 42.2-136 15.6-172.9-27.1-37.5-86.6-36.8-106.8 1.7z"/>
  </svg>
);

const PropertyGuide = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties } = useApp();

  const property = properties.find(p => p.id === id);

  if (!property) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Propiedad no encontrada</h2>
        <button className="btn-outline" onClick={() => navigate('/propiedades')} style={{ marginTop: '16px' }}>
          Volver a Propiedades
        </button>
      </div>
    );
  }

  // Verificar si es la "Casa de la Puerta Azul"
  const isPuertaAzul = property.name.toLowerCase().includes('puerta azul') || property.id === '5';
  
  // Verificar si es "Casa 2Hab con A/C | cerca Pirámide"
  const isPiramide = property.name.toLowerCase().includes('pirámide') || property.name.toLowerCase().includes('mora') || property.id === '6';

  // Usar nombre explícito correcto para la Pirámide para evitar problemas con la caché de localStorage
  const displayName = isPiramide ? 'Casa 2Hab con A/C | cerca Pirámide' : property.name;

  const handlePrint = () => {
    window.print();
  };

  const renderSocialIcons = () => (
    <div className="footer-social-icons">
      <a href="https://facebook.com/coanfitrionesmexico" target="_blank" rel="noreferrer" className="footer-social-link"><FacebookIcon /></a>
      <a href="https://instagram.com/coanfitrionesmexico" target="_blank" rel="noreferrer" className="footer-social-link"><InstagramIcon /></a>
      <a href="https://tiktok.com/@coanfitrionesmexico" target="_blank" rel="noreferrer" className="footer-social-link"><TiktokIcon /></a>
      <a href="https://bluesky.com" target="_blank" rel="noreferrer" className="footer-social-link"><BlueskyIcon /></a>
    </div>
  );

  const renderPageFooter = (pageNumber: number, totalPages: number) => (
    <div className="guide-page-footer">
      <span>{displayName}</span>
      <div className="footer-brand-social">
        <span>Operado por Hospitalidad Digital</span>
        {renderSocialIcons()}
      </div>
      <span>Página {pageNumber} de {totalPages}</span>
    </div>
  );

  // Formatear fecha actual en español
  const formattedDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Datos específicos de cada propiedad o fallbacks genéricos
  const guideData = {
    address: isPuertaAzul 
      ? 'Fray Francisco de Los Angeles 240, Quintas del Marques, 76047 Santiago de Querétaro, Qro.'
      : isPiramide
      ? 'Paseos del Bosque, Corregidora, Querétaro, México'
      : property.location,
    airbnbUrl: isPuertaAzul 
      ? 'airbnb.mx/h/casalapuertaazul'
      : isPiramide
      ? 'www.airbnb.mx/rooms/1667036785999383762'
      : property.airbnbUrl || 'airbnb.mx',
    wifiNetwork: isPuertaAzul ? 'INFINITUM56B6' : isPiramide ? 'Kuni' : 'Red_Propiedad_WiFi',
    wifiPassword: isPuertaAzul ? 'utHK9UGGTu' : isPiramide ? 'Relax@33h.k' : 'Password123',
    hostPhone: isPuertaAzul ? '442 185 1478' : isPiramide ? '4421851478' : property.hostPhone,
    hostName: isPuertaAzul ? 'Ricardo (Co-anfitrión)' : isPiramide ? 'Co-Anfitrión Ricardo Peña C.' : property.hostName,
    checkInTime: '3:00 p.m.',
    checkInNote: isPiramide ? 'hasta las 11:00 p.m.' : 'Hasta las 11:00 p.m.',
    checkOutTime: '12:00 p.m.',
    checkOutNote: isPiramide ? 'Maximo' : 'Máximo',
    priceRange: isPuertaAzul ? '$1,099 - $1,250 MXN' : isPiramide ? '$1,800 MXN' : `$${property.pricePerNight} MXN`,
    welcomeMessage: isPuertaAzul
      ? 'Ubicación, Privacidad y Comodidad. A un costado del Estadio Corregidora con acceso a la Carretera 57 Mex-Qro y al Libramiento Fray Junípero Serra. Lugar tranquilo, seguro y cómodo, ideal tanto para trabajo como para descanso. Puedes llegar en tu auto o en camión – la casa se encuentra a tan solo 3 minutos de la terminal de autobuses TAQ.'
      : isPiramide
      ? 'Casa tranquila y equipada para trabajar o descansar. Espacio cómodo y silencioso ideal para trabajo remoto, parejas o familias pequeñas. Ubicada en Paseos del Bosque, a minutos de la Pirámide del Pueblito y 18 min del Centro. Lugar práctico, limpio y con buena energía.'
      : 'Bienvenido a nuestra propiedad. Hemos preparado esta guía para que tu estancia sea lo más cómoda y placentera posible. Disfruta de tu tiempo aquí y no dudes en contactarnos si necesitas cualquier ayuda.',
    
    // Configuración específica de boiler
    boilerInstructions: isPiramide
      ? [
          'El Boiler es eléctrico y está conectado y prendido, puedes asegurarte que se encuentra encendido por la pantalla led con el indicador de la temperatura.',
          'si no lo está tiene el botón de encendido debajo de la pantalla.'
        ]
      : [
          'El boiler tiene el piloto encendido de manera permanente.',
          'Gira la perilla a la posición de "Encendido" cuando vayas a bañarte.',
          'Espera entre 10 y 15 minutos para que el agua se caliente por completo.',
          'Al salir de la propiedad, regresa siempre la perilla del boiler a la posición de "Piloto" para ahorrar gas y por seguridad.'
        ],

    trashInstructions: isPiramide
      ? 'La basura la puedes dejar en los contenedores que se encuentran en el cuarto que se encuentra al lado de la puerta de acceso al condominio.'
      : 'La basura la puedes depositar en los contenedores ubicados en el patio trasero de la casa. El camión recolector pasa de manera regular por la zona.',

    checkoutSteps: isPiramide
      ? [
          'Dejar el llaver de acceso al condominio en la mesa',
          'Asegurarse de dejar todo apagado',
          'Solicitar la apertura del Portón.'
        ]
      : [
          'Apaga todas las luces de la casa.',
          'Apaga todos los aparatos eléctricos (TV, ventiladores, aire acondicionado, etc.).',
          'Regresa la perilla del boiler a la posición de "Piloto".',
          'Deja la basura en el patio trasero en bolsas cerradas.',
          'Asegúrate de que los candados exteriores queden cerrados correctamente.',
          'Cierra la puerta principal (no requiere seguro adicional).',
          'Comunica tu salida enviando un mensaje al anfitrión.'
        ],

    amenities: isPiramide
      ? [
          { text: '2 recámaras con cama matrimonial', icon: <Bed className="amenity-icon" /> },
          { text: 'Aire acondicionado', icon: <Wind className="amenity-icon" /> },
          { text: 'Smart TV 55" QLED', icon: <Tv className="amenity-icon" /> },
          { text: 'Cocina completamente equipada', icon: <UtensilsCrossed className="amenity-icon" /> },
          { text: 'Agua caliente', icon: <Flame className="amenity-icon" /> },
          { text: 'UPS para internet y laptop', icon: <MonitorCheck className="amenity-icon" /> },
          { text: 'Estacionamiento para 2 autos', icon: <Check className="amenity-icon" /> }
        ]
      : [
          { text: 'Cocina completa (refrigerador, horno, estufa)', icon: <UtensilsCrossed className="amenity-icon" /> },
          { text: 'Detector de monóxido de carbono', icon: <ShieldAlert className="amenity-icon" /> },
          { text: 'Estacionamiento gratuito en cochera (1 lugar)', icon: <Check className="amenity-icon" /> },
          { text: 'Televisión HD con Netflix', icon: <Tv className="amenity-icon" /> },
          { text: 'WiFi de alta velocidad', icon: <Wifi className="amenity-icon" /> },
          { text: 'Área de trabajo con escritorio y enchufe', icon: <Briefcase className="amenity-icon" /> }
        ]
  };

  // Genera el código QR oficial de conexión WiFi
  const wifiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=WIFI:S:\${encodeURIComponent(guideData.wifiNetwork)};T:WPA;P:\${encodeURIComponent(guideData.wifiPassword)};;`;

  return (
    <div className="guide-wrapper">
      {/* Control Superior */}
      <div className="guide-controls">
        <button className="btn-guide-back" onClick={() => navigate(`/propiedades/\${id}`)}>
          <ArrowLeft size={18} />
          Volver a la Ficha
        </button>
        <button className="btn-guide-print" onClick={handlePrint}>
          <Printer size={18} />
          Guardar PDF / Imprimir
        </button>
      </div>

      <div className="guide-container">
        {/* PÁGINA 1: PORTADA */}
        <div className="guide-cover">
          <div className="cover-header">
            <div className="cover-logos-container">
              <div className="logo-box">
                <img src="/images/airbnb-logo.png" alt="Airbnb Logo" />
              </div>
              <div className="logo-divider"></div>
              <div className="logo-box">
                <img src="/images/hospitalidad-digital-logo.png" alt="Hospitalidad Digital Logo" />
              </div>
            </div>
            <span className="cover-tagline">Guía de Uso de la Propiedad</span>
          </div>

          <div className="cover-title-group">
            <h1 className="cover-title">{displayName}</h1>
            <p className="cover-subtitle" style={{ textTransform: 'capitalize' }}>
              Alojamiento Entero • {isPiramide ? 'Residencia' : property.type}
            </p>
          </div>

          <div className="cover-stats">
            <span className="cover-stat-badge">{isPiramide ? 2 : property.bedrooms} Rec.</span>
            <span className="cover-stat-badge">{isPiramide ? '2 Camas' : `${property.bedrooms} Camas`}</span>
            <span className="cover-stat-badge">{isPiramide ? 1 : property.bathrooms} Baño{(isPiramide ? 1 : property.bathrooms) > 1 ? 's' : ''}</span>
            <span className="cover-stat-badge">{isPiramide ? 2 : property.maxGuests} Huésp.</span>
          </div>

          <div className="cover-address-block">
            <p className="cover-address">{guideData.address}</p>
            <a 
              href={`https://\${guideData.airbnbUrl}`} 
              target="_blank" 
              rel="noreferrer" 
              className="cover-link"
            >
              https://{guideData.airbnbUrl}
            </a>
          </div>

          <div className="cover-footer">
            <div className="cover-footer-left">
              <div className="cover-social-icons-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src="/images/hospitalidad-digital-logo.png" alt="Hospitalidad Digital Logo" className="cover-footer-logo" />
                {renderSocialIcons()}
              </div>
              <span className="cover-website" style={{ marginTop: '8px' }}>coanfitrionesmexico.com.mx</span>
            </div>
            <div className="cover-footer-right">
              <span className="cover-phone">Tel: {guideData.hostPhone}</span>
              <span className="cover-conf">Este documento es confidencial y de uso exclusivo del huésped.</span>
              <span className="cover-date">Generado el {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL POR PROPIEDAD */}
        {isPiramide ? (
          <>
            {/* PÁGINA 2 DE 4: BIENVENIDA, STATS, FOTOS Y LLEGADA/ACCESO */}
            <div className="guide-page">
              <div className="guide-page-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--guide-text-muted)', borderBottom: '1px solid var(--guide-border)', paddingBottom: '8px', marginBottom: '20px' }}>
                <span>{displayName}</span>
                <span>Guía de Uso de la Propiedad</span>
              </div>
              
              <div className="section-header">
                <div className="section-bar"></div>
                <h2 className="section-title">Bienvenido/a a {displayName}</h2>
              </div>
              
              <p style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--guide-text-dark)', marginBottom: '8px' }}>
                Casa tranquila y equipada para trabajar o descansar.
              </p>
              <p style={{ fontSize: '14px', color: 'var(--guide-text-muted)', marginBottom: '12px' }}>
                Espacio cómodo y silencioso ideal para trabajo remoto, parejas o familias pequeñas.
              </p>
              <p style={{ fontSize: '14px', color: 'var(--guide-text-muted)', marginBottom: '16px' }}>
                Paseos del Bosque, a minutos de la Pirámide del Pueblito y 18 min del Centro.
              </p>
              
              <div className="inclusions-block" style={{ background: 'var(--guide-bg-light)', border: '1px solid var(--guide-border)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '8px' }}>Incluye:</span>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--guide-text-dark)', lineHeight: '1.7' }}>
                  <li>2 recámaras con cama matrimonial</li>
                  <li>Aire acondicionado</li>
                  <li>Smart TV 55" QLED</li>
                  <li>Cocina completamente equipada</li>
                  <li>Agua caliente</li>
                  <li>UPS para internet y laptop</li>
                  <li>Estacionamiento para 2 autos</li>
                </ul>
              </div>

              <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--guide-text-muted)', marginBottom: '24px' }}>
                Lugar práctico, limpio y con buena energía.
              </p>

              <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                  <div className="stat-label">Recámaras</div>
                  <div className="stat-value">2</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Camas</div>
                  <div className="stat-value">2</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Baños</div>
                  <div className="stat-value">1</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Huéspedes</div>
                  <div className="stat-value" style={{ fontSize: '18px', paddingTop: '6px' }}>Max 2</div>
                </div>
              </div>

              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div className="section-bar"></div>
                <h2 className="section-title">Fotos de la Propiedad</h2>
              </div>
              <div className="photos-grid three-cols" style={{ marginBottom: '24px' }}>
                <div className="photo-wrapper">
                  <img 
                    src="/images/casa-mora/photo1.jpg" 
                    alt="Fachada" 
                    className="photo-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = property.imageUrl;
                    }}
                  />
                </div>
                <div className="photo-wrapper">
                  <img 
                    src="/images/casa-mora/photo2.jpg" 
                    alt="Chapa inteligente" 
                    className="photo-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = property.imageUrl;
                    }}
                  />
                </div>
                <div className="photo-wrapper">
                  <img 
                    src="/images/casa-mora/photo3.jpg" 
                    alt="Llaves" 
                    className="photo-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = property.imageUrl;
                    }}
                  />
                </div>
              </div>

              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div className="section-bar"></div>
                <h2 className="section-title">Llegada y Acceso</h2>
              </div>
              <div className="access-grid" style={{ marginBottom: '16px' }}>
                <div className="access-card check-in">
                  <div className="access-title">Check-in</div>
                  <div className="access-time">{guideData.checkInTime}</div>
                  <div className="access-note">{guideData.checkInNote}</div>
                </div>
                <div className="access-card check-out">
                  <div className="access-title">Check-out</div>
                  <div className="access-time">{guideData.checkOutTime}</div>
                  <div className="access-note">{guideData.checkOutNote}</div>
                </div>
              </div>

              {renderPageFooter(1, 4)}
            </div>

            {/* PÁGINA 3 DE 4: CÓMO LLEGAR, WIFI Y MANUAL DEL HOGAR */}
            <div className="guide-page">
              <div className="guide-page-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--guide-text-muted)', borderBottom: '1px solid var(--guide-border)', paddingBottom: '8px', marginBottom: '20px' }}>
                <span>{displayName}</span>
                <span>Guía de Uso de la Propiedad</span>
              </div>

              <div className="manual-box" style={{ background: 'var(--guide-bg-light)', border: '1px solid var(--guide-border)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px', color: 'var(--guide-primary)' }}>&gt;&gt; A distancia y con Código</h3>
                <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', color: 'var(--guide-text-muted)' }}>Cómo Llegar</h4>
                <p style={{ fontSize: '14px', marginBottom: '10px', lineHeight: '1.6' }}>
                  A tu llegada por favor, notifica en la app de AIRBNB por mensaje y te abriremos enseguida el acceso vial. y para entrar a la propiedad. ya te habremos enviado tu código de apertura, con el que podrás tener acceso a la casa.
                </p>
                <p style={{ fontSize: '14px', marginBottom: '10px', lineHeight: '1.6' }}>
                  Dentro de la casa encontrarás un llavero de control remoto para el acceso al condominio, con el podrás salir y entrar cuando lo requieras.
                </p>
                <p style={{ fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                  A tu salida podrás dejar el llavero en la mesa nuevamente y solicitar que te abran el portón por medio de la app y te abriremos inmediatamente vía remota.
                </p>
              </div>

              <div className="maps-banner" style={{ marginBottom: '24px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', display: 'block', color: 'var(--guide-success)' }}>Google Maps:</span>
                <a href="https://maps.app.goo.gl/2sSTjeTdve22uyNXA" target="_blank" rel="noreferrer" className="maps-link" style={{ fontSize: '14px' }}>
                  https://maps.app.goo.gl/2sSTjeTdve22uyNXA
                </a>
                <p style={{ fontSize: '12px', color: 'var(--guide-text-muted)', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                  (escribe la direccion en tu app de mapas)
                </p>
              </div>

              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div className="section-bar"></div>
                <h2 className="section-title">WiFi y Tecnología</h2>
              </div>
              <div className="wifi-card" style={{ marginBottom: '24px' }}>
                <div className="wifi-info">
                  <div className="wifi-item">
                    <div className="wifi-label">Nombre de la Red</div>
                    <div className="wifi-value">{guideData.wifiNetwork}</div>
                  </div>
                  <div className="wifi-item" style={{ marginTop: '16px' }}>
                    <div className="wifi-label">Contraseña</div>
                    <div className="wifi-value password">{guideData.wifiPassword}</div>
                  </div>
                </div>
                <div className="wifi-qr-container">
                  <div className="wifi-qr-placeholder">
                    <img src={wifiQrUrl} alt="WiFi QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <span className="wifi-qr-text">Escanea para conectar</span>
                </div>
              </div>

              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div className="section-bar"></div>
                <h2 className="section-title">Televisión y Entretenimiento</h2>
              </div>
              <div className="manual-box" style={{ padding: '16px', background: '#F8FAFC', marginBottom: '24px' }}>
                <p style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--guide-text-dark)' }}>
                  Smart TV 55" QLED
                </p>
              </div>

              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div className="section-bar"></div>
                <h2 className="section-title">Manual del Hogar</h2>
              </div>
              <div className="manual-box" style={{ marginBottom: '16px' }}>
                <h3 className="manual-title" style={{ fontSize: '15px', fontWeight: 700 }}>
                  <Flame size={18} /> Boiler / Calentador de Agua
                </h3>
                <p style={{ fontSize: '13.5px', margin: 0, lineHeight: '1.6' }}>
                  {guideData.boilerInstructions[0]} {guideData.boilerInstructions[1]}
                </p>
              </div>
              <div className="manual-box" style={{ marginBottom: '16px' }}>
                <h3 className="manual-title" style={{ fontSize: '15px', fontWeight: 700 }}>
                  <Trash2 size={18} /> Basura y Reciclaje
                </h3>
                <p style={{ fontSize: '13.5px', margin: 0, lineHeight: '1.6' }}>
                  {guideData.trashInstructions}
                </p>
              </div>

              {renderPageFooter(2, 4)}
            </div>

            {/* PÁGINA 3: INSTRUCCIONES ADICIONALES, AMENIDADES, REGLAS Y SEGURIDAD */}
            <div className="guide-page">
              <div className="guide-page-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--guide-text-muted)', borderBottom: '1px solid var(--guide-border)', paddingBottom: '8px', marginBottom: '20px' }}>
                <span>{displayName}</span>
                <span>Guía de Uso de la Propiedad</span>
              </div>

              <div className="manual-box" style={{ background: '#FAF5FF', borderColor: '#E9D5FF', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  Instrucciones Adicionales
                </h3>
                <p style={{ fontSize: '13.5px', color: '#5B21B6', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                  Los focos del comedor, sala, y habitaciones tienen un control remoto para cambiar de intensidad y de color de luz Fría y Cálida. para que tu elijas el ambiente de esos espacios.
                </p>
                <p style={{ fontSize: '13.5px', color: '#5B21B6', margin: 0, lineHeight: '1.5' }}>
                  El aire acondicionado funciona por horarios, solo se encuentra en el área del comedor y sala.
                </p>
              </div>

              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div className="section-bar"></div>
                <h2 className="section-title">Amenidades y Servicios</h2>
              </div>
              <div className="amenities-grid" style={{ marginBottom: '24px' }}>
                {guideData.amenities.map((item, idx) => (
                  <div className="amenity-item" key={idx}>
                    <Check className="amenity-icon" size={18} style={{ color: 'var(--guide-success)' }} />
                    <span style={{ fontSize: '13.5px' }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div className="section-bar"></div>
                <h2 className="section-title">Reglas de la Casa</h2>
              </div>
              <div className="rules-grid" style={{ marginBottom: '16px' }}>
                <div className="rule-card">
                  <span className="rule-badge">NO</span>
                  <span className="rule-text" style={{ fontSize: '13px' }}>Mascotas NO permitidas</span>
                </div>
                <div className="rule-card">
                  <span className="rule-badge">NO</span>
                  <span className="rule-text" style={{ fontSize: '13px' }}>Eventos NO permitidos</span>
                </div>
                <div className="rule-card">
                  <span className="rule-badge">NO</span>
                  <span className="rule-text" style={{ fontSize: '13px' }}>Fumar NO permitido</span>
                </div>
              </div>

              <div className="max-guests-alert" style={{ background: '#FFFBEB', borderColor: '#F59E0B', color: '#B45309', marginBottom: '16px' }}>
                <Users size={20} />
                <span>(!!) Maximo de huespedes: 2 personas</span>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--guide-text-dark)' }}>Reglas Adicionales</h4>
              <ul className="additional-rules-list" style={{ marginBottom: '24px', paddingLeft: '20px', fontSize: '13.5px' }}>
                <li style={{ marginBottom: '6px' }}>Debido a que la casa es para hospedaje y descanso, no se permiten las fiestas en la propiedad</li>
                <li>Asegurarse de dejar todo apagado la fecha de salida</li>
              </ul>

              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div className="section-bar"></div>
                <h2 className="section-title">Seguridad</h2>
              </div>
              <div className="security-list" style={{ marginBottom: '16px' }}>
                <div className="security-item" style={{ padding: '10px 14px' }}>
                  <span>Detector de Monóxido de Carbono</span>
                  <span className="security-badge yes">SI</span>
                </div>
                <div className="security-item" style={{ padding: '10px 14px' }}>
                  <span>Alarma de Humo (no disponible)</span>
                  <span className="security-badge no">NO</span>
                </div>
                <div className="security-item" style={{ padding: '10px 14px' }}>
                  <span>Cámara de Seguridad Exterior</span>
                  <span className="security-badge yes">SI</span>
                </div>
              </div>

              {renderPageFooter(3, 4)}
            </div>

            {/* PÁGINA 4: INSTRUCCIONES DE SALIDA, CONTACTOS Y DESPEDIDA */}
            <div className="guide-page">
              <div className="guide-page-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--guide-text-muted)', borderBottom: '1px solid var(--guide-border)', paddingBottom: '8px', marginBottom: '20px' }}>
                <span>{displayName}</span>
                <span>Guía de Uso de la Propiedad</span>
              </div>

              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div className="section-bar"></div>
                <h2 className="section-title">Instrucciones de Salida — Antes de las 12:00 p.m.</h2>
              </div>
              <div className="checkout-timeline" style={{ marginBottom: '24px' }}>
                {guideData.checkoutSteps.map((step, idx) => (
                  <div className="checkout-step" key={idx}>
                    <div className="step-number">{idx + 1}</div>
                    <div className="step-content" style={{ fontSize: '13.5px', padding: '10px 16px' }}>{step}</div>
                  </div>
                ))}
              </div>

              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div className="section-bar"></div>
                <h2 className="section-title">Contactos</h2>
              </div>
              <div className="contacts-grid" style={{ marginBottom: '20px' }}>
                <div className="contact-card" style={{ borderLeft: '4px solid var(--guide-primary)', padding: '16px' }}>
                  <div className="contact-label">Anfitrion / Co-anfitrion</div>
                  <div className="contact-name" style={{ fontSize: '15px' }}>{guideData.hostName}</div>
                  <div className="contact-phone" style={{ fontSize: '14px' }}>
                    <Phone size={14} />
                    {guideData.hostPhone}
                  </div>
                </div>
                <div className="contact-card" style={{ borderLeft: '4px solid #EF4444', padding: '16px' }}>
                  <div className="contact-label">Emergencias</div>
                  <div className="contact-name" style={{ fontSize: '15px' }}>Servicios de emergencia</div>
                  <div className="contact-phone" style={{ color: '#EF4444', fontSize: '14px' }}>
                    <Phone size={14} />
                    911
                  </div>
                </div>
              </div>

              <div className="cancelation-box" style={{ padding: '12px 16px', marginBottom: '24px', fontSize: '13.5px' }}>
                <span style={{ fontWeight: 700, marginRight: '8px' }}>POLITICA DE CANCELACION:</span>
                <span style={{ color: 'var(--guide-success)', fontWeight: 600 }}>Flexible</span>
              </div>

              <div className="thank-you-banner" style={{ padding: '30px 20px', marginTop: 'auto', marginBottom: '16px' }}>
                <h2 className="thank-you-title" style={{ fontSize: '24px' }}>¡Gracias por tu estadía!</h2>
                <p className="thank-you-subtitle" style={{ fontSize: '14px', marginBottom: '12px' }}>Esperamos que hayas disfrutado tu tiempo aquí.</p>
                <a href={`https://\${guideData.airbnbUrl}`} className="thank-you-link" target="_blank" rel="noreferrer" style={{ fontSize: '14px' }}>
                  https://{guideData.airbnbUrl}
                </a>
              </div>

              {renderPageFooter(4, 4)}
            </div>
          </>
        ) : (
          <>
            {/* ORIGINAL 6-PAGE STRUCTURE (e.g. isPuertaAzul or fallback) */}
            {/* PÁGINA 2: BIENVENIDA, FOTOS Y ACCESO */}
            <div className="guide-page">
              <div className="guide-page-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--guide-text-muted)', borderBottom: '1px solid var(--guide-border)', paddingBottom: '8px', marginBottom: '20px' }}>
                <span>{displayName}</span>
                <span>Guía de Uso de la Propiedad</span>
              </div>
              
              <div className="section-header">
                <div className="section-bar"></div>
                <h2 className="section-title">Bienvenido/a a {displayName}</h2>
              </div>
              
              <p className="intro-text">{guideData.welcomeMessage}</p>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Recámaras</div>
                  <div className="stat-value">{property.bedrooms}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Camas</div>
                  <div className="stat-value">{property.bedrooms}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Baños</div>
                  <div className="stat-value">{property.bathrooms}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Huéspedes</div>
                  <div className="stat-value">Max {property.maxGuests}</div>
                </div>
              </div>

              <div className="price-banner">
                <span className="price-label">Rango Tarifario de la Zona:</span>
                <span className="price-value">{guideData.priceRange}</span>
              </div>

              <div className="section-header">
                <div className="section-bar"></div>
                <h2 className="section-title">Fotos de la Propiedad</h2>
              </div>
              <div className="photos-grid">
                <div className="photo-wrapper">
                  <img 
                    src={isPuertaAzul ? "/images/casa-puerta-azul/window-grapes.jpg" : property.imageUrl} 
                    alt="Fachada" 
                    className="photo-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = property.imageUrl;
                    }}
                  />
                </div>
                <div className="photo-wrapper">
                  <img 
                    src={isPuertaAzul ? "/images/casa-puerta-azul/gate-door.jpg" : property.imageUrl} 
                    alt="Detalle" 
                    className="photo-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = property.imageUrl;
                    }}
                  />
                </div>
              </div>

              <div className="section-header">
                <div className="section-bar"></div>
                <h2 className="section-title">Llegada y Acceso</h2>
              </div>
              <div className="keypad-banner" style={{ marginBottom: '16px' }}>
                <Key size={20} className="amenity-icon" />
                <span>Acceso autónomo mediante teclado digital (Keypad) en la puerta de entrada.</span>
              </div>

              {renderPageFooter(1, 5)}
            </div>

            {/* PÁGINA 3: LLEGADA, MAPAS Y WIFI */}
            <div className="guide-page">
              <div className="guide-page-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--guide-text-muted)', borderBottom: '1px solid var(--guide-border)', paddingBottom: '8px', marginBottom: '20px' }}>
                <span>{displayName}</span>
                <span>Guía de Uso de la Propiedad</span>
              </div>
              
              <div className="section-header">
                <div className="section-bar"></div>
                <h2 className="section-title">Ubicación y Llegada</h2>
              </div>
              <div className="access-grid">
                <div className="access-card check-in">
                  <div className="access-title">Check-in</div>
                  <div className="access-time">{guideData.checkInTime}</div>
                  <div className="access-note">{guideData.checkInNote}</div>
                </div>
                <div className="access-card check-out">
                  <div className="access-title">Check-out</div>
                  <div className="access-time">{guideData.checkOutTime}</div>
                  <div className="access-note">{guideData.checkOutNote}</div>
                </div>
              </div>

              <div className="maps-banner">
                <span style={{ fontWeight: 700, fontSize: '14px', display: 'block', color: 'var(--guide-success)' }}>Enlace de Ubicación Oficial:</span>
                <a href={`https://\${guideData.airbnbUrl}`} className="maps-link">
                  {guideData.airbnbUrl}
                </a>
              </div>

              <div className="section-header">
                <div className="section-bar"></div>
                <h2 className="section-title">Conexión WiFi</h2>
              </div>
              <div className="wifi-card">
                <div className="wifi-info">
                  <div className="wifi-item">
                    <div className="wifi-label">Nombre de la Red (SSID)</div>
                    <div className="wifi-value">{guideData.wifiNetwork}</div>
                  </div>
                  <div className="wifi-item" style={{ marginTop: '16px' }}>
                    <div className="wifi-label">Contraseña (WPA/WPA2)</div>
                    <div className="wifi-value password">{guideData.wifiPassword}</div>
                  </div>
                </div>
                <div className="wifi-qr-container">
                  <div className="wifi-qr-placeholder">
                    <img src={wifiQrUrl} alt="WiFi QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <span className="wifi-qr-text">Escanea para conectar</span>
                </div>
              </div>

              {renderPageFooter(2, 5)}
            </div>

            {/* PÁGINA 4: MANUAL DEL HOGAR, AMENIDADES Y REGLAS */}
            <div className="guide-page">
              <div className="guide-page-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--guide-text-muted)', borderBottom: '1px solid var(--guide-border)', paddingBottom: '8px', marginBottom: '20px' }}>
                <span>{displayName}</span>
                <span>Guía de Uso de la Propiedad</span>
              </div>
              
              <div className="section-header">
                <div className="section-bar"></div>
                <h2 className="section-title">Manual de Uso de Equipamiento</h2>
              </div>

              <div className="manual-box">
                <h3 className="manual-title">
                  <Flame size={18} />
                  Calentador de Agua (Boiler)
                </h3>
                <ol className="manual-steps">
                  {guideData.boilerInstructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="manual-box">
                <h3 className="manual-title">
                  <Trash2 size={18} />
                  Gestión de Basura y Reciclaje
                </h3>
                <p style={{ fontSize: '14px' }}>{guideData.trashInstructions}</p>
              </div>

              <div className="section-header" style={{ marginTop: '40px' }}>
                <div className="section-bar"></div>
                <h2 className="section-title">Entretenimiento</h2>
              </div>
              <div className="manual-box" style={{ background: '#FAF5FF', borderColor: '#E9D5FF' }}>
                <h3 className="manual-title" style={{ color: '#7C3AED' }}>
                  <Tv size={18} />
                  Televisión y Entretenimiento
                </h3>
                <p style={{ fontSize: '14px', color: '#5B21B6' }}>
                  La TV inteligente está configurada con las principales aplicaciones de streaming (Netflix, Disney+, Prime Video). Recuerda que deberás ingresar con tus cuentas personales y cerrarlas antes de tu salida.
                </p>
              </div>

              <div className="section-header" style={{ marginTop: '40px' }}>
                <div className="section-bar"></div>
                <h2 className="section-title">Amenidades Incluidas</h2>
              </div>
              <div className="amenities-grid">
                {guideData.amenities.map((item, idx) => (
                  <div className="amenity-item" key={idx}>
                    {item.icon}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {renderPageFooter(3, 5)}
            </div>

            {/* PÁGINA 5: REGLAS DE LA CASA, SEGURIDAD E INSTRUCCIONES DE SALIDA */}
            <div className="guide-page">
              <div className="guide-page-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--guide-text-muted)', borderBottom: '1px solid var(--guide-border)', paddingBottom: '8px', marginBottom: '20px' }}>
                <span>{displayName}</span>
                <span>Guía de Uso de la Propiedad</span>
              </div>
              
              <div className="section-header">
                <div className="section-bar"></div>
                <h2 className="section-title">Reglas de la Casa</h2>
              </div>

              <div className="rules-grid">
                <div className="rule-card">
                  <span className="rule-badge">Prohibido</span>
                  <span className="rule-text">Mascotas no permitidas</span>
                </div>
                <div className="rule-card">
                  <span className="rule-badge">Prohibido</span>
                  <span className="rule-text">Fiestas y eventos prohibidos</span>
                </div>
                <div className="rule-card">
                  <span className="rule-badge">Prohibido</span>
                  <span className="rule-text">Espacio 100% libre de humo</span>
                </div>
              </div>

              <div className="max-guests-alert">
                <Users size={20} />
                <span>Capacidad Máxima Permitida: 5 personas en total.</span>
              </div>

              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Normas de Convivencia Adicionales</h4>
              <ul className="additional-rules-list" style={{ marginBottom: '32px' }}>
                <li>Mantén las luces y los aparatos eléctricos apagados cuando te encuentres fuera del alojamiento.</li>
                <li>No dejes basura acumulada en el interior de la casa, colócala en el patio trasero antes de salir.</li>
                <li>Al salir de la propiedad, no es necesario colocar cerraduras manuales extras adicionales; la cerradura digital inteligente se bloquea de manera autónoma.</li>
                <li>Asegúrate de mantener cerrados con llave los candados de los accesos exteriores.</li>
                <li>Recuerda volver la perilla del calentador (boiler) a la posición "Piloto" antes de tu salida.</li>
              </ul>

              <div className="section-header">
                <div className="section-bar"></div>
                <h2 className="section-title">Seguridad y Dispositivos</h2>
              </div>
              <div className="security-list">
                <div className="security-item">
                  <span>Detector de Monóxido de Carbono</span>
                  <span className="security-badge yes">Disponible</span>
                </div>
                <div className="security-item">
                  <span>Detector de Humo</span>
                  <span className="security-badge no">No Disponible</span>
                </div>
                <div className="security-item">
                  <span>Cámaras de Seguridad Exteriores</span>
                  <span className="security-badge yes">Activas</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--guide-text-muted)', fontStyle: 'italic', marginBottom: '24px' }}>
                * Contamos con cámaras de seguridad en el exterior para salvaguardar tu integridad física. Por favor contáctanos de inmediato ante cualquier eventualidad.
              </p>

              {renderPageFooter(4, 5)}
            </div>

            {/* PÁGINA 6: INSTRUCCIONES DE SALIDA Y CONTACTOS */}
            <div className="guide-page" style={{ pageBreakAfter: 'avoid' }}>
              <div className="guide-page-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--guide-text-muted)', borderBottom: '1px solid var(--guide-border)', paddingBottom: '8px', marginBottom: '20px' }}>
                <span>{displayName}</span>
                <span>Guía de Uso de la Propiedad</span>
              </div>
              
              <div className="section-header">
                <div className="section-bar"></div>
                <h2 className="section-title">Instrucciones de Salida</h2>
              </div>
              <p className="intro-text" style={{ marginBottom: '20px' }}>
                Le solicitamos amablemente realizar los siguientes pasos antes de su salida (límite: 12:00 p.m.):
              </p>

              <div className="checkout-timeline" style={{ marginBottom: '40px' }}>
                {guideData.checkoutSteps.map((step, idx) => (
                  <div className="checkout-step" key={idx}>
                    <div className="step-number">{idx + 1}</div>
                    <div className="step-content">{step}</div>
                  </div>
                ))}
              </div>

              <div className="section-header">
                <div className="section-bar"></div>
                <h2 className="section-title">Contactos de Soporte y Emergencias</h2>
              </div>

              <div className="contacts-grid">
                <div className="contact-card" style={{ borderLeft: '4px solid var(--guide-primary)' }}>
                  <div className="contact-label">Contacto Principal</div>
                  <div className="contact-name">{guideData.hostName}</div>
                  <div className="contact-phone">
                    <Phone size={16} />
                    {guideData.hostPhone}
                  </div>
                </div>
                <div className="contact-card" style={{ borderLeft: '4px solid #EF4444' }}>
                  <div className="contact-label">Servicios de Emergencia</div>
                  <div className="contact-name">Policía / Bomberos / Ambulancia</div>
                  <div className="contact-phone" style={{ color: '#EF4444' }}>
                    <Phone size={16} />
                    911
                  </div>
                </div>
              </div>

              <div className="cancelation-box" style={{ marginBottom: '32px' }}>
                <span style={{ fontWeight: 700, marginRight: '8px' }}>Política de Cancelación:</span>
                <span style={{ color: 'var(--guide-success)', fontWeight: 600 }}>Flexible</span>
              </div>

              <div className="thank-you-banner">
                <h2 className="thank-you-title">¡Gracias por tu estadía!</h2>
                <p className="thank-you-subtitle">Esperamos que hayas disfrutado de tu estancia en Querétaro y que vuelvas pronto.</p>
                <a href={`https://\${guideData.airbnbUrl}`} className="thank-you-link" target="_blank" rel="noreferrer">
                  {guideData.airbnbUrl}
                </a>
              </div>

              {renderPageFooter(5, 5)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyGuide;
