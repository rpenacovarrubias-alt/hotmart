import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Printer, Flame, Trash2, Check, Phone, Users } from 'lucide-react';
import './PropertyGuide.css'; // Reutilizar clases base y agregar específicas
import './GuidePdf.css';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TiktokIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .57.04.84.13V9.5a7.21 7.21 0 0 0-1-.07 6.33 6.33 0 0 0-.25 12.66 6.33 6.33 0 0 0 6.13-5.22h.06V8.71a9.77 9.77 0 0 0 6.13 2.14V7.41a6.39 6.39 0 0 1-1.87-.72z"/>
  </svg>
);

const BlueskyIcon = () => (
  <svg viewBox="0 0 576 512" width="14" height="14" fill="currentColor">
    <path d="M407.8 29.4C379.8 82.5 328.7 182.9 288 249.7 247.3 182.9 196.2 82.5 168.2 29.4 148-9.1 88.5-9.8 61.4 27.7c-26.6 36.9-4.8 112.7 15.6 172.9 23.3 68.7 64.9 143.4 96.9 183.1 27.9 34.7 65.5 50.1 101.9 57.6-56.1 11.3-107.5 14.8-129.2 11.5-63.5-9.6-96.1-47.4-106.3-103.7-1.7-9.4-11.2-14.7-20.1-11.4L4.7 344c-9.1 3.3-13.6 13.4-10.1 22.4C17.6 427.4 67.5 486.2 150.2 505c31 7.1 72.8 8 116.8-5.3 7.8-2.4 13.8-8.2 16.5-15.8L288 471.5l4.6 12.3c2.7 7.6 8.7 13.4 16.5 15.8 44 13.3 85.8 12.4 116.8 5.3 82.7-18.9 132.6-77.7 155.6-138.6 3.5-9 1-19.1-10.1-22.4l-19.5-7.1c-8.9-3.3-18.4 2-20.1 11.4-10.2 56.3-42.8 94.1-106.3 103.7-21.7 3.3-73.1-.2-129.2-11.5 36.4-7.5 74-22.9 101.9-57.6 32-39.7 73.6-114.4 96.9-183.1 20.4-60.2 42.2-136 15.6-172.9-27.1-37.5-86.6-36.8-106.8 1.7z"/>
  </svg>
);

const GuidePdfView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { guides } = useApp();

  const guide = guides.find(g => g.id === id);

  if (!guide) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Guía no encontrada</h2>
        <button className="btn-outline" onClick={() => navigate('/guias')} style={{ marginTop: '16px' }}>
          Volver al Dashboard
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const renderSocialIcons = () => (
    <div className="footer-social-icons" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <a href="https://facebook.com/coanfitrionesmexico" target="_blank" rel="noreferrer" className="footer-social-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: '#F1F5F9', color: '#475569' }}><FacebookIcon /></a>
      <a href="https://instagram.com/coanfitrionesmexico" target="_blank" rel="noreferrer" className="footer-social-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: '#F1F5F9', color: '#475569' }}><InstagramIcon /></a>
      <a href="https://tiktok.com/@coanfitrionesmexico" target="_blank" rel="noreferrer" className="footer-social-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: '#F1F5F9', color: '#475569' }}><TiktokIcon /></a>
      <a href="https://bluesky.com" target="_blank" rel="noreferrer" className="footer-social-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: '#F1F5F9', color: '#475569' }}><BlueskyIcon /></a>
    </div>
  );

  const renderPageFooter = (pageNumber: number, totalPages: number) => (
    <div className="guide-page-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '12px', fontSize: '11px', color: '#64748B', marginTop: 'auto' }}>
      <span>{guide.name}</span>
      <div className="footer-brand-social" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>Operado por Hospitalidad Digital</span>
        {renderSocialIcons()}
      </div>
      <span>Página {pageNumber} de {totalPages}</span>
    </div>
  );

  const formattedDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const wifiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=WIFI:S:${encodeURIComponent(guide.wifiNetwork)};T:WPA;P:${encodeURIComponent(guide.wifiPassword)};;`;

  return (
    <div className="guide-wrapper pdf-view-wrapper">
      {/* Control Superior (Oculto al imprimir) */}
      <div className="guide-controls no-print">
        <button className="btn-guide-back" onClick={() => navigate('/guias')}>
          <ArrowLeft size={18} />
          Volver al Dashboard
        </button>
        <button className="btn-guide-print" onClick={handlePrint}>
          <Printer size={18} />
          Guardar PDF / Imprimir
        </button>
      </div>

      <div className="guide-container pdf-container">
        {/* PÁGINA 1: PORTADA */}
        <div className="guide-cover pdf-page-break">
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
            <h1 className="cover-title">{guide.name}</h1>
            <p className="cover-subtitle" style={{ textTransform: 'capitalize' }}>
              Alojamiento Entero • {guide.type}
            </p>
          </div>

          <div className="cover-stats">
            <span className="cover-stat-badge">{guide.bedrooms} Rec.</span>
            <span className="cover-stat-badge">{guide.beds} Cama{guide.beds > 1 ? 's' : ''}</span>
            <span className="cover-stat-badge">{guide.bathrooms} Baño{guide.bathrooms > 1 ? 's' : ''}</span>
            <span className="cover-stat-badge">{guide.maxGuests} Huésp.</span>
          </div>

          <div className="cover-address-block">
            <p className="cover-address">{guide.address}</p>
            <a 
              href={`https://${guide.airbnbUrl}`} 
              target="_blank" 
              rel="noreferrer" 
              className="cover-link"
            >
              https://{guide.airbnbUrl}
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
              <span className="cover-phone">Tel: {guide.hostPhone}</span>
              <span className="cover-conf">Este documento es confidencial y de uso exclusivo del huésped.</span>
              <span className="cover-date">Generado el {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* PÁGINA 2: BIENVENIDA, STATS, FOTOS, CHECKIN/OUT */}
        <div className="guide-page pdf-page-break">
          <div className="guide-page-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', marginBottom: '20px' }}>
            <span>{guide.name}</span>
            <span>Guía de Uso de la Propiedad</span>
          </div>
          
          <div className="section-header">
            <div className="section-bar"></div>
            <h2 className="section-title">Bienvenido/a a {guide.name}</h2>
          </div>
          
          <p style={{ fontSize: '14px', color: '#334155', marginBottom: '16px', lineHeight: '1.6' }}>
            {guide.welcomeMessage}
          </p>
          
          {guide.inclusions.length > 0 && (
            <div className="inclusions-block" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '8px', color: 'var(--guide-primary)' }}>Incluye:</span>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: '#334155', lineHeight: '1.6' }}>
                {guide.inclusions.map((inc, i) => (
                  <li key={i}>{inc}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-label">Recámaras</div>
              <div className="stat-value">{guide.bedrooms}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Camas</div>
              <div className="stat-value">{guide.beds}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Baños</div>
              <div className="stat-value">{guide.bathrooms}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Huéspedes</div>
              <div className="stat-value" style={{ fontSize: '18px', paddingTop: '6px' }}>Max {guide.maxGuests}</div>
            </div>
          </div>

          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div className="section-bar"></div>
            <h2 className="section-title">Fotos de la Propiedad</h2>
          </div>
          
          <div className="photos-grid three-cols" style={{ marginBottom: '24px' }}>
            {[0, 1, 2].map(idx => (
              <div key={idx} className="photo-wrapper">
                <img 
                  src={guide.photos[idx] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'} 
                  alt={`Propiedad ${idx + 1}`} 
                  className="photo-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
            ))}
          </div>

          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div className="section-bar"></div>
            <h2 className="section-title">Llegada y Acceso</h2>
          </div>
          <div className="access-grid" style={{ marginBottom: '16px' }}>
            <div className="access-card check-in">
              <div className="access-title">Check-in</div>
              <div className="access-time">{guide.checkInTime}</div>
              <div className="access-note">{guide.checkInNote}</div>
            </div>
            <div className="access-card check-out">
              <div className="access-title">Check-out</div>
              <div className="access-time">{guide.checkOutTime}</div>
              <div className="access-note">{guide.checkOutNote}</div>
            </div>
          </div>

          {renderPageFooter(2, 5)}
        </div>

        {/* PÁGINA 3: CÓMO LLEGAR, WIFI Y MANUAL DEL HOGAR */}
        <div className="guide-page pdf-page-break">
          <div className="guide-page-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', marginBottom: '20px' }}>
            <span>{guide.name}</span>
            <span>Guía de Uso de la Propiedad</span>
          </div>

          <div className="manual-box" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px', color: '#0369A1' }}>&gt;&gt; Instrucciones de Entrada</h3>
            <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', color: '#0284C7' }}>Cómo Llegar</h4>
            <p style={{ fontSize: '13.5px', margin: 0, lineHeight: '1.6', color: '#0369A1' }}>
              {guide.accessInstructions}
            </p>
          </div>

          {guide.googleMapsUrl && (
            <div className="maps-banner" style={{ marginBottom: '24px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', display: 'block', color: 'var(--guide-success)' }}>Google Maps:</span>
              <a href={guide.googleMapsUrl} target="_blank" rel="noreferrer" className="maps-link" style={{ fontSize: '13.5px' }}>
                {guide.googleMapsUrl}
              </a>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                (escribe la direccion en tu app de mapas)
              </p>
            </div>
          )}

          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div className="section-bar"></div>
            <h2 className="section-title">WiFi y Tecnología</h2>
          </div>
          
          <div className="wifi-card" style={{ marginBottom: '24px' }}>
            <div className="wifi-info">
              <div className="wifi-item">
                <div className="wifi-label">Nombre de la Red</div>
                <div className="wifi-value">{guide.wifiNetwork}</div>
              </div>
              <div className="wifi-item" style={{ marginTop: '16px' }}>
                <div className="wifi-label">Contraseña</div>
                <div className="wifi-value password">{guide.wifiPassword}</div>
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
            <h2 className="section-title">Manual del Hogar</h2>
          </div>
          
          {guide.boilerInstructions.length > 0 && (
            <div className="manual-box" style={{ marginBottom: '16px', padding: '16px' }}>
              <h3 className="manual-title" style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={18} /> Boiler / Calentador de Agua
              </h3>
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                {guide.boilerInstructions.map((step, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {guide.trashInstructions && (
            <div className="manual-box" style={{ marginBottom: '16px', padding: '16px' }}>
              <h3 className="manual-title" style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={18} /> Basura y Reciclaje
              </h3>
              <p style={{ fontSize: '13px', margin: 0, lineHeight: '1.5', color: '#334155' }}>
                {guide.trashInstructions}
              </p>
            </div>
          )}

          {renderPageFooter(3, 5)}
        </div>

        {/* PÁGINA 4: INSTRUCCIONES ADICIONALES, AMENIDADES, REGLAS Y SEGURIDAD */}
        <div className="guide-page pdf-page-break">
          <div className="guide-page-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', marginBottom: '20px' }}>
            <span>{guide.name}</span>
            <span>Guía de Uso de la Propiedad</span>
          </div>

          {guide.additionalInstructions && (
            <div className="manual-box" style={{ background: '#FAF5FF', borderColor: '#E9D5FF', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                Instrucciones Adicionales
              </h3>
              <p style={{ fontSize: '13px', color: '#5B21B6', margin: 0, lineHeight: '1.5' }}>
                {guide.additionalInstructions}
              </p>
            </div>
          )}

          {guide.amenities.length > 0 && (
            <>
              <div className="section-header" style={{ marginBottom: '16px' }}>
                <div className="section-bar"></div>
                <h2 className="section-title">Amenidades y Servicios</h2>
              </div>
              <div className="amenities-grid" style={{ marginBottom: '24px' }}>
                {guide.amenities.map((item, idx) => (
                  <div className="amenity-item" key={idx}>
                    <Check className="amenity-icon" size={18} style={{ color: 'var(--guide-success)' }} />
                    <span style={{ fontSize: '13px' }}>{item}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div className="section-bar"></div>
            <h2 className="section-title">Reglas de la Casa</h2>
          </div>
          <div className="rules-grid" style={{ marginBottom: '16px' }}>
            <div className="rule-card">
              <span className="rule-badge">NO</span>
              <span className="rule-text" style={{ fontSize: '12.5px' }}>Mascotas {guide.petsAllowed ? 'Permitidas' : 'NO permitidas'}</span>
            </div>
            <div className="rule-card">
              <span className="rule-badge">NO</span>
              <span className="rule-text" style={{ fontSize: '12.5px' }}>Eventos {guide.eventsAllowed ? 'Permitidos' : 'NO permitidos'}</span>
            </div>
            <div className="rule-card">
              <span className="rule-badge">NO</span>
              <span className="rule-text" style={{ fontSize: '12.5px' }}>Fumar {guide.smokingAllowed ? 'Permitido' : 'NO permitido'}</span>
            </div>
          </div>

          <div className="max-guests-alert" style={{ background: '#FFFBEB', borderColor: '#F59E0B', color: '#B45309', marginBottom: '16px' }}>
            <Users size={20} />
            <span>(!!) Capacidad máxima de huéspedes: {guide.maxGuests} personas</span>
          </div>

          {guide.additionalRules.length > 0 && (
            <>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>Normas de Convivencia</h4>
              <ul className="additional-rules-list" style={{ marginBottom: '24px', paddingLeft: '20px', fontSize: '13px', color: '#334155' }}>
                {guide.additionalRules.map((rule, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{rule}</li>
                ))}
              </ul>
            </>
          )}

          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div className="section-bar"></div>
            <h2 className="section-title">Seguridad</h2>
          </div>
          <div className="security-list" style={{ marginBottom: '16px' }}>
            <div className="security-item" style={{ padding: '10px 14px' }}>
              <span>Detector de Monóxido de Carbono</span>
              <span className={`security-badge ${guide.carbonMonoxideDetector ? 'yes' : 'no'}`}>
                {guide.carbonMonoxideDetector ? 'SI' : 'NO'}
              </span>
            </div>
            <div className="security-item" style={{ padding: '10px 14px' }}>
              <span>Alarma de Humo</span>
              <span className={`security-badge ${guide.smokeDetector ? 'yes' : 'no'}`}>
                {guide.smokeDetector ? 'SI' : 'NO'}
              </span>
            </div>
            <div className="security-item" style={{ padding: '10px 14px' }}>
              <span>Cámara de Seguridad Exterior</span>
              <span className={`security-badge ${guide.securityCameras ? 'yes' : 'no'}`}>
                {guide.securityCameras ? 'SI' : 'NO'}
              </span>
            </div>
          </div>

          {renderPageFooter(4, 5)}
        </div>

        {/* PÁGINA 5: INSTRUCCIONES DE SALIDA, CONTACTOS Y DESPEDIDA */}
        <div className="guide-page pdf-page-break">
          <div className="guide-page-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', marginBottom: '20px' }}>
            <span>{guide.name}</span>
            <span>Guía de Uso de la Propiedad</span>
          </div>

          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div className="section-bar"></div>
            <h2 className="section-title">Instrucciones de Salida — Antes de las {guide.checkOutTime}</h2>
          </div>
          
          {guide.checkoutSteps.length > 0 && (
            <div className="checkout-timeline" style={{ marginBottom: '24px' }}>
              {guide.checkoutSteps.map((step, idx) => (
                <div className="checkout-step" key={idx}>
                  <div className="step-number">{idx + 1}</div>
                  <div className="step-content" style={{ fontSize: '13px', padding: '10px 16px' }}>{step}</div>
                </div>
              ))}
            </div>
          )}

          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div className="section-bar"></div>
            <h2 className="section-title">Contactos</h2>
          </div>
          <div className="contacts-grid" style={{ marginBottom: '20px' }}>
            <div className="contact-card" style={{ borderLeft: '4px solid var(--guide-primary)', padding: '16px', background: '#F8FAFC', borderRadius: '12px' }}>
              <div className="contact-label" style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Anfitrión / Co-anfitrión</div>
              <div className="contact-name" style={{ fontSize: '15px', fontWeight: 700, margin: '4px 0' }}>{guide.hostName}</div>
              <div className="contact-phone" style={{ fontSize: '13.5px', color: 'var(--guide-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} />
                {guide.hostPhone}
              </div>
            </div>
            <div className="contact-card" style={{ borderLeft: '4px solid #EF4444', padding: '16px', background: '#FFF5F5', borderRadius: '12px' }}>
              <div className="contact-label" style={{ fontSize: '11px', color: '#E53E3E', textTransform: 'uppercase', fontWeight: 600 }}>Emergencias</div>
              <div className="contact-name" style={{ fontSize: '15px', fontWeight: 700, margin: '4px 0', color: '#E53E3E' }}>Servicios de emergencia</div>
              <div className="contact-phone" style={{ color: '#EF4444', fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} />
                911
              </div>
            </div>
          </div>

          <div className="cancelation-box" style={{ padding: '12px 16px', marginBottom: '24px', fontSize: '13px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px' }}>
            <span style={{ fontWeight: 700, marginRight: '8px', color: '#065F46' }}>POLÍTICA DE CANCELACIÓN:</span>
            <span style={{ color: '#047857', fontWeight: 700 }}>Flexible</span>
          </div>

          <div className="thank-you-banner" style={{ padding: '30px 20px', marginTop: 'auto', marginBottom: '16px', background: '#FF5A5F', borderRadius: '16px', color: 'white', textAlign: 'center' }}>
            <h2 className="thank-you-title" style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0' }}>¡Gracias por tu estadía!</h2>
            <p className="thank-you-subtitle" style={{ fontSize: '13.5px', margin: '0 0 12px 0', opacity: 0.9 }}>Esperamos que hayas disfrutado tu tiempo aquí.</p>
            <a href={`https://${guide.airbnbUrl}`} className="thank-you-link" target="_blank" rel="noreferrer" style={{ fontSize: '13.5px', color: 'white', textDecoration: 'underline', fontWeight: 600 }}>
              https://{guide.airbnbUrl}
            </a>
          </div>

          {renderPageFooter(5, 5)}
        </div>
      </div>
    </div>
  );
};

export default GuidePdfView;
