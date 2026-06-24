import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MapPin, Key, Flame, Trash2, Check, Phone, ShieldAlert, Bed, Users, Copy, ExternalLink, Tv, BookOpen, DoorOpen, Sparkles, Lock } from 'lucide-react';
import { toast } from 'sonner';
import './GuideInteractive.css';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const BlueskyIcon = () => (
  <svg viewBox="0 0 576 512" width="18" height="18" fill="currentColor">
    <path d="M407.8 29.4C379.8 82.5 328.7 182.9 288 249.7 247.3 182.9 196.2 82.5 168.2 29.4 148-9.1 88.5-9.8 61.4 27.7c-26.6 36.9-4.8 112.7 15.6 172.9 23.3 68.7 64.9 143.4 96.9 183.1 27.9 34.7 65.5 50.1 101.9 57.6-56.1 11.3-107.5 14.8-129.2 11.5-63.5-9.6-96.1-47.4-106.3-103.7-1.7-9.4-11.2-14.7-20.1-11.4L4.7 344c-9.1 3.3-13.6 13.4-10.1 22.4C17.6 427.4 67.5 486.2 150.2 505c31 7.1 72.8 8 116.8-5.3 7.8-2.4 13.8-8.2 16.5-15.8L288 471.5l4.6 12.3c2.7 7.6 8.7 13.4 16.5 15.8 44 13.3 85.8 12.4 116.8 5.3 82.7-18.9 132.6-77.7 155.6-138.6 3.5-9 1-19.1-10.1-22.4l-19.5-7.1c-8.9-3.3-18.4 2-20.1 11.4-10.2 56.3-42.8 94.1-106.3 103.7-21.7 3.3-73.1-.2-129.2-11.5 36.4-7.5 74-22.9 101.9-57.6 32-39.7 73.6-114.4 96.9-183.1 20.4-60.2 42.2-136 15.6-172.9-27.1-37.5-86.6-36.8-106.8 1.7z"/>
  </svg>
);

const GuideInteractiveView = () => {
  const { id } = useParams();
  const { guides } = useApp();

  const guide = guides.find(g => g.id === id);
  const [copied, setCopied] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!guide) {
    return (
      <div className="error-screen">
        <h2>Guía Interactiva no disponible</h2>
        <p>El enlace que estás intentando visitar no es válido o ha expirado.</p>
      </div>
    );
  }

  const formattedDate = new Date(guide.updatedAt || guide.createdAt || new Date()).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(guide.wifiPassword);
    setCopied(true);
    toast.success('¡Contraseña de WiFi copiada!');
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleStep = (index: number) => {
    setCheckedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const wifiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=WIFI:S:${encodeURIComponent(guide.wifiNetwork)};T:WPA;P:${encodeURIComponent(guide.wifiPassword)};;`;

  return (
    <div className="interactive-guide-wrapper">
      {/* ── HEADER NAVIGATION ── */}
      <header className="guest-header">
        <div className="guest-header-inner">
          <div className="guest-brand">
            <svg className="guest-logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
              <path fill="#1B6CB5" d="M22,82 C20,70 24,58 32,52 L32,38 C32,33 35,31 38,31 C41,31 44,33 44,38 L44,48 L44,34 C44,29 47,27 50,27 C53,27 56,29 56,34 L56,48 L56,36 C56,31 59,29 62,29 C65,29 68,31 68,36 L68,52 L68,44 C68,39 71,37 74,37 C77,37 80,39 80,44 L80,62 C82,60 86,62 86,68 C86,74 82,78 78,80 L68,90 C62,96 52,98 42,98 C32,98 24,94 20,88Z"/>
              <path fill="white" d="M42,76 C42,68 34,60 34,52 C34,46 38,44 42,48 C44,50 45,53 46,55 C47,53 48,50 50,48 C54,44 58,46 58,52 C58,60 50,68 50,76Z"/>
              <circle cx="30" cy="26" r="8" fill="none" stroke="white" stroke-width="2.5"/>
              <line x1="35" y1="31" x2="54" y2="50" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            <span className="guest-brand-name">Coanfitriones México</span>
          </div>
          <a href={`/guias/${guide.id}/pdf`} target="_blank" rel="noreferrer" className="btn-pdf-download">
            Guardar PDF
          </a>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <section className="guest-hero-section" style={{ backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.85), rgba(15,23,42,0.95)), url(${guide.imageUrl})` }}>
        <div className="guest-hero-content">
          <span className="guest-hero-eyebrow">Guía de Uso Digital</span>
          <h1 className="guest-hero-title">{guide.name}</h1>
          
          <div className="guest-hero-badges">
            <span className="guest-badge"><Bed size={14} /> {guide.bedrooms} Dormitorios</span>
            <span className="guest-badge"><Users size={14} /> Max {guide.maxGuests} Huéspedes</span>
            <span className="guest-badge"><MapPin size={14} /> {guide.location}</span>
          </div>

          <p className="guest-hero-desc">{guide.welcomeMessage}</p>
        </div>
      </section>

      <main className="guest-main-container">
        {/* ── CUADRÍCULA DE ACCESOS RÁPIDOS ── */}
        <div className="guest-quick-nav-card">
          <h3 className="quick-nav-title">Accesos Rápidos</h3>
          <div className="quick-nav-grid">
            <button onClick={() => scrollToSection('sec-acceso')} className="quick-nav-item">
              <div className="quick-nav-icon-circle accent-blue" title="Acceso (Llave)">
                <Key size={22} />
              </div>
              <span className="quick-nav-text">Acceso</span>
            </button>
            
            <button onClick={() => scrollToSection('sec-wifi')} className="quick-nav-item">
              <div className="quick-nav-icon-circle accent-orange" title="WiFi (Cerradura)">
                <Lock size={22} />
              </div>
              <span className="quick-nav-text">WiFi</span>
            </button>
            
            <button onClick={() => scrollToSection('sec-manuales')} className="quick-nav-item">
              <div className="quick-nav-icon-circle accent-purple" title="Manuales">
                <BookOpen size={22} />
              </div>
              <span className="quick-nav-text">Manuales</span>
            </button>
            
            {guide.amenities.length > 0 && (
              <button onClick={() => scrollToSection('sec-amenidades')} className="quick-nav-item">
                <div className="quick-nav-icon-circle accent-green" title="Servicios">
                  <Sparkles size={22} />
                </div>
                <span className="quick-nav-text">Servicios</span>
              </button>
            )}
            
            <button onClick={() => scrollToSection('sec-reglas')} className="quick-nav-item">
              <div className="quick-nav-icon-circle accent-red" title="Reglas">
                <ShieldAlert size={22} />
              </div>
              <span className="quick-nav-text">Reglas</span>
            </button>
            
            {guide.checkoutSteps.length > 0 && (
              <button onClick={() => scrollToSection('sec-checkout')} className="quick-nav-item">
                <div className="quick-nav-icon-circle accent-coral" title="Salida (Puerta)">
                  <DoorOpen size={22} />
                </div>
                <span className="quick-nav-text">Salida</span>
              </button>
            )}
            
            <button onClick={() => scrollToSection('sec-contactos')} className="quick-nav-item">
              <div className="quick-nav-icon-circle accent-cyan" title="Contactos">
                <Phone size={22} />
              </div>
              <span className="quick-nav-text">Contactos</span>
            </button>
          </div>
        </div>

        {/* ── ACCESO Y LLEGADA ── */}
        <section id="sec-acceso" className="guest-section-card">
          <h2 className="guest-section-title">
            <Key className="section-title-icon" color="var(--primary-color)" />
            Llegada y Acceso Autónomo
          </h2>
          
          <div className="guest-access-times">
            <div className="time-block check-in">
              <span className="time-label">Check-in</span>
              <span className="time-value">{guide.checkInTime}</span>
              <span className="time-sub">{guide.checkInNote}</span>
            </div>
            <div className="time-block check-out">
              <span className="time-label">Check-out</span>
              <span className="time-value">{guide.checkOutTime}</span>
              <span className="time-sub">{guide.checkOutNote}</span>
            </div>
          </div>

          <div className="guest-info-block">
            <h4>Instrucciones para Entrar</h4>
            <p style={{ whiteSpace: 'pre-line' }}>{guide.accessInstructions}</p>
          </div>

          {guide.googleMapsUrl && (
            <a href={guide.googleMapsUrl} target="_blank" rel="noreferrer" className="guest-maps-btn">
              <MapPin size={18} />
              Abrir Dirección en Google Maps
              <ExternalLink size={14} />
            </a>
          )}
        </section>

        {/* ── WIFI ── */}
        <section id="sec-wifi" className="guest-section-card guest-wifi-card">
          <div className="guest-wifi-info-panel">
            <h2 className="guest-section-title" style={{ color: 'white' }}>
              <Lock className="section-title-icon" color="#FBBF24" />
              Conexión WiFi
            </h2>
            
            <div className="wifi-credential-row">
              <div className="wifi-field">
                <span className="wifi-label">Nombre de Red (SSID)</span>
                <span className="wifi-value">{guide.wifiNetwork}</span>
              </div>
              <div className="wifi-field" style={{ marginTop: '16px' }}>
                <span className="wifi-label">Contraseña (WPA/WPA2)</span>
                <span className="wifi-value password">{guide.wifiPassword}</span>
              </div>
            </div>

            <button onClick={handleCopyPassword} className="guest-copy-wifi-btn">
              <Copy size={16} />
              {copied ? '¡Clave Copiada!' : 'Copiar Contraseña'}
            </button>
          </div>
          
          <div className="guest-wifi-qr-panel">
            <div className="wifi-qr-bg">
              <img src={wifiQrUrl} alt="WiFi QR" className="wifi-qr-img" />
            </div>
            <span className="wifi-qr-caption">Escanea para Conectar</span>
          </div>
        </section>

        {/* ── MANUALES ── */}
        <section id="sec-manuales" className="guest-section-card">
          <h2 className="guest-section-title">
            <BookOpen className="section-title-icon" color="var(--primary-color)" />
            Manual del Hogar & Servicios
          </h2>

          {guide.boilerInstructions.length > 0 && (
            <div className="guest-manual-box">
              <h4>
                <Flame size={18} style={{ color: '#EF4444' }} />
                ¿Cómo usar el boiler/calentador de agua?
              </h4>
              <ol className="manual-list-styled">
                {guide.boilerInstructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {guide.trashInstructions && (
            <div className="guest-manual-box">
              <h4>
                <Trash2 size={18} style={{ color: '#1B6CB5' }} />
                Tirado de Basura y Contenedores
              </h4>
              <p>{guide.trashInstructions}</p>
            </div>
          )}

          {guide.tvInstructions && (
            <div className="guest-manual-box">
              <h4>
                <Tv size={18} style={{ color: '#7C3AED' }} />
                Uso de Smart TV y Streaming
              </h4>
              <p>{guide.tvInstructions}</p>
            </div>
          )}

          {guide.additionalInstructions && (
            <div className="guest-manual-box" style={{ background: '#FAF5FF', border: '1px solid #E9D5FF' }}>
              <h4 style={{ color: '#7C3AED' }}>Notas Importantes Adicionales</h4>
              <p style={{ color: '#5B21B6' }}>{guide.additionalInstructions}</p>
            </div>
          )}
        </section>

        {/* ── AMENIDADES ── */}
        {guide.amenities.length > 0 && (
          <section id="sec-amenidades" className="guest-section-card">
            <h2 className="guest-section-title">
              <Sparkles className="section-title-icon" color="var(--guide-success, #00A699)" />
              Servicios Incluidos
            </h2>
            <div className="guest-amenities-grid">
              {guide.amenities.map((item, idx) => (
                <div key={idx} className="guest-amenity-pill">
                  <Check size={14} color="#00A699" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── REGLAS DE CASA ── */}
        <section id="sec-reglas" className="guest-section-card">
          <h2 className="guest-section-title">
            <ShieldAlert className="section-title-icon" color="#EF4444" />
            Reglas de la Casa
          </h2>
          
          <div className="guest-rules-tag-row">
            <span className={`guest-rule-badge ${guide.petsAllowed ? 'yes' : 'no'}`}>
              Mascotas: {guide.petsAllowed ? 'Permitidas' : 'Prohibidas'}
            </span>
            <span className={`guest-rule-badge ${guide.eventsAllowed ? 'yes' : 'no'}`}>
              Fiestas / Eventos: {guide.eventsAllowed ? 'Permitidos' : 'Prohibidos'}
            </span>
            <span className={`guest-rule-badge ${guide.smokingAllowed ? 'yes' : 'no'}`}>
              Fumar: {guide.smokingAllowed ? 'Permitido' : 'Prohibido'}
            </span>
          </div>

          <div className="guest-warning-banner">
            <Users size={18} />
            <span>Capacidad máxima establecida: <strong>{guide.maxGuests} personas</strong> en total.</span>
          </div>

          {guide.additionalRules.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Normas de Convivencia Detalladas</h4>
              <ul className="guest-rules-list-dot">
                {guide.additionalRules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ── INTERACTIVE CHECKOUT CHECKLIST ── */}
        {guide.checkoutSteps.length > 0 && (
          <section id="sec-checkout" className="guest-section-card">
            <h2 className="guest-section-title">
              <DoorOpen className="section-title-icon" color="var(--primary-color)" />
              Tareas de Salida (Checkout)
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Por favor, realiza estas tareas antes de tu salida a las <strong>{guide.checkOutTime}</strong> para ayudarnos a mantener la propiedad impecable.
            </p>

            <div className="guest-checkout-checklist">
              {guide.checkoutSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`guest-checklist-item ${checkedSteps[idx] ? 'checked' : ''}`}
                  onClick={() => toggleStep(idx)}
                >
                  <div className="guest-checkbox">
                    {checkedSteps[idx] && <Check size={14} color="white" />}
                  </div>
                  <span className="guest-checklist-text">{step}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SEGURIDAD Y CONTACTOS ── */}
        <section id="sec-contactos" className="guest-section-card" style={{ marginBottom: '40px' }}>
          <h2 className="guest-section-title">
            <Phone className="section-title-icon" color="var(--primary-color)" />
            Contactos & Emergencias
          </h2>
          
          <div className="guest-contact-actions">
            <a href={`tel:${guide.hostPhone}`} className="guest-contact-button host-call">
              <span className="btn-label">Llamar al Anfitrión</span>
              <span className="btn-name">{guide.hostName}</span>
              <span className="btn-num">{guide.hostPhone}</span>
            </a>
            <a href="tel:911" className="guest-contact-button emergency-call">
              <span className="btn-label">Servicios de Emergencia</span>
              <span className="btn-name">Policía / Ambulancia</span>
              <span className="btn-num">911</span>
            </a>
          </div>
        </section>
      </main>

      {/* ── FOOTER DE DISEÑO PROFESIONAL (RÉPLICA PDF) ── */}
      <footer className="guest-brand-footer">
        <div className="guest-brand-footer-left">
          <div className="guest-brand-social-row">
            <img src="/images/hospitalidad-digital-logo.png" alt="Hospitalidad Digital Logo" className="guest-brand-footer-logo" />
            <div className="guest-brand-social-icons">
              <a href="https://facebook.com/coanfitrionesmexico" target="_blank" rel="noreferrer" className="guest-brand-social-link"><FacebookIcon /></a>
              <a href="https://instagram.com/coanfitrionesmexico" target="_blank" rel="noreferrer" className="guest-brand-social-link"><InstagramIcon /></a>
              <a href="https://bsky.app" target="_blank" rel="noreferrer" className="guest-brand-social-link"><BlueskyIcon /></a>
            </div>
          </div>
          <span className="guest-brand-website">coanfitrionesmexico.com.mx</span>
        </div>
        <div className="guest-brand-footer-right">
          <span className="guest-brand-phone">Tel: {guide.hostPhone || '4421851478'}</span>
          <span className="guest-brand-confidential">Este documento digital es confidencial y de uso exclusivo del huésped.</span>
          <span className="guest-brand-date">Actualizado el {formattedDate}</span>
        </div>
      </footer>
    </div>
  );
};

export default GuideInteractiveView;
