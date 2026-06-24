import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, MapPin, Key, Flame, Trash2, Check, Phone, 
  ShieldAlert, Bed, Users, Copy, ExternalLink, Tv, 
  BookOpen, DoorOpen, Sparkles, Lock, ChevronDown, 
  MessageSquare, Image, CheckCircle
} from 'lucide-react';
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
  const navigate = useNavigate();
  const { guides } = useApp();

  const guide = guides.find(g => g.id === id);
  const [copied, setCopied] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  
  // Accordion State for Manuales
  const [expandedManuals, setExpandedManuals] = useState<Record<string, boolean>>({
    boiler: true,
    trash: false,
    tv: false,
  });

  const toggleManual = (section: string) => {
    setExpandedManuals(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
      {/* ── TOP NAVIGATION ── */}
      <header className="guest-header">
        <div className="guest-header-inner">
          <button onClick={() => navigate('/guias')} className="guest-back-btn">
            <ArrowLeft size={18} />
            <span className="guest-back-text">REGRESAR</span>
          </button>
          <a href={`/guias/${guide.id}/pdf`} target="_blank" rel="noreferrer" className="btn-pdf-download">
            Guardar PDF
          </a>
        </div>
      </header>

      <main className="guest-main-container">
        {/* ── HERO BANNER ── */}
        <section className="guest-hero-section" style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%), url(${guide.imageUrl})` }}>
          <div className="guest-hero-content">
            <span className="guest-hero-eyebrow">GUÍA DE USO DIGITAL</span>
            <h1 className="guest-hero-title">{guide.name}</h1>
            
            <div className="guest-hero-badges">
              <span className="guest-badge">
                <Bed size={16} className="text-secondary-fixed" />
                <span>{guide.bedrooms} Dormitorios</span>
              </span>
              <span className="guest-badge">
                <Users size={16} className="text-secondary-fixed" />
                <span>Max {guide.maxGuests} Huéspedes</span>
              </span>
              <span className="guest-badge">
                <MapPin size={16} className="text-secondary-fixed" />
                <span>{guide.location}</span>
              </span>
            </div>

            <p className="guest-hero-desc">{guide.welcomeMessage}</p>
          </div>
        </section>

        {/* ── BENTO GRID SECTIONS ── */}
        <div className="guest-bento-grid">
          
          {/* Bento Card 1: Accesos Rápidos (Col span 12) */}
          <section className="bento-card col-span-12">
            <h2 className="bento-card-title">Accesos Rápidos</h2>
            <div className="quick-nav-grid-bento">
              <button onClick={() => scrollToSection('sec-acceso')} className="quick-nav-item-bento">
                <div className="quick-nav-circle bg-blue-50 text-blue-500">
                  <Key size={24} />
                </div>
                <span className="quick-nav-label-bento">Acceso</span>
              </button>
              
              <button onClick={() => scrollToSection('sec-wifi')} className="quick-nav-item-bento">
                <div className="quick-nav-circle bg-orange-50 text-orange-500">
                  <Lock size={24} />
                </div>
                <span className="quick-nav-label-bento">WiFi</span>
              </button>
              
              <button onClick={() => scrollToSection('sec-manuales')} className="quick-nav-item-bento">
                <div className="quick-nav-circle bg-purple-50 text-purple-500">
                  <BookOpen size={24} />
                </div>
                <span className="quick-nav-label-bento">Manuales</span>
              </button>
              
              {guide.amenities.length > 0 && (
                <button onClick={() => scrollToSection('sec-amenidades')} className="quick-nav-item-bento">
                  <div className="quick-nav-circle bg-green-50 text-green-500">
                    <Sparkles size={24} />
                  </div>
                  <span className="quick-nav-label-bento">Servicios</span>
                </button>
              )}
              
              <button onClick={() => scrollToSection('sec-reglas')} className="quick-nav-item-bento">
                <div className="quick-nav-circle bg-red-50 text-red-500">
                  <ShieldAlert size={24} />
                </div>
                <span className="quick-nav-label-bento">Reglas</span>
              </button>
              
              {guide.checkoutSteps.length > 0 && (
                <button onClick={() => scrollToSection('sec-checkout')} className="quick-nav-item-bento">
                  <div className="quick-nav-circle bg-rose-50 text-rose-500">
                    <DoorOpen size={24} />
                  </div>
                  <span className="quick-nav-label-bento">Salida</span>
                </button>
              )}
              
              <button onClick={() => scrollToSection('sec-contactos')} className="quick-nav-item-bento">
                <div className="quick-nav-circle bg-cyan-50 text-cyan-500">
                  <Phone size={24} />
                </div>
                <span className="quick-nav-label-bento">Contacto</span>
              </button>

              <button onClick={() => scrollToSection('sec-fotos')} className="quick-nav-item-bento">
                <div className="quick-nav-circle bg-purple-50 text-purple-500">
                  <Image size={24} />
                </div>
                <span className="quick-nav-label-bento">Fotos</span>
              </button>
            </div>
          </section>

          {/* Bento Card 2: Llegada y Acceso Autónomo (Col span 8) */}
          <section id="sec-acceso" className="bento-card col-span-8">
            <h2 className="bento-card-title flex items-center gap-2">
              <DoorOpen className="text-primary-color" size={24} />
              Llegada y Acceso Autónomo
            </h2>
            
            <div className="guest-access-times-bento">
              <div className="time-block-bento bg-blue-50 border-blue-100">
                <span className="time-label-bento text-blue-600">Entrada (Check-in)</span>
                <span className="time-value-bento">{guide.checkInTime}</span>
                <span className="time-sub-bento text-blue-400">{guide.checkInNote}</span>
              </div>
              <div className="time-block-bento bg-green-50 border-green-100">
                <span className="time-label-bento text-green-600">Salida (Check-out)</span>
                <span className="time-value-bento">{guide.checkOutTime}</span>
                <span className="time-sub-bento text-green-400">{guide.checkOutNote}</span>
              </div>
            </div>

            <div className="guest-info-block-bento">
              <h3 className="guest-info-block-title text-primary-color">Instrucciones para Entrar</h3>
              <p className="guest-info-block-text">{guide.accessInstructions}</p>
            </div>

            {guide.googleMapsUrl && (
              <a href={guide.googleMapsUrl} target="_blank" rel="noreferrer" className="guest-maps-btn-bento">
                <MapPin size={18} />
                <span>Ubicación de la casa en Google Maps</span>
                <ExternalLink size={14} />
              </a>
            )}
          </section>

          {/* Bento Card 3: WiFi (Col span 4) */}
          <section id="sec-wifi" className="bento-card col-span-4 wifi-dark-card">
            <div className="wifi-dark-card-inner">
              <h2 className="bento-card-title text-white flex items-center gap-2">
                <Lock className="text-orange-400" size={24} />
                Conexión WiFi
              </h2>
              
              <div className="wifi-credentials-bento">
                <div className="wifi-credential-item">
                  <span className="wifi-credential-label text-blue-200">NOMBRE DE RED (SSID)</span>
                  <span className="wifi-credential-val text-white">{guide.wifiNetwork}</span>
                </div>
                <div className="wifi-credential-item mt-4">
                  <span className="wifi-credential-label text-blue-200">CONTRASEÑA</span>
                  <span className="wifi-credential-val text-orange-400">{guide.wifiPassword}</span>
                </div>
              </div>
            </div>
            
            <div className="wifi-qr-section-bento">
              <div className="wifi-qr-wrapper-bento">
                <img src={wifiQrUrl} alt="WiFi QR" className="wifi-qr-img-bento" />
              </div>
              <span className="wifi-qr-caption-bento text-blue-200">Escanea para Conectar</span>
              
              <button onClick={handleCopyPassword} className="guest-copy-wifi-btn-bento">
                <Copy size={16} />
                <span>{copied ? '¡Clave Copiada!' : 'Copiar Contraseña'}</span>
              </button>
            </div>
          </section>

          {/* Bento Card 4: Manual del Hogar (Col span 7) */}
          <section id="sec-manuales" className="bento-card col-span-7">
            <h2 className="bento-card-title">Manual del Hogar &amp; Servicios</h2>
            <div className="accordion-list-manuals">
              
              {/* Boiler */}
              {guide.boilerInstructions.length > 0 && (
                <div className={`accordion-item-manual ${expandedManuals.boiler ? 'active' : ''}`}>
                  <div className="accordion-header-manual" onClick={() => toggleManual('boiler')}>
                    <h3 className="accordion-title-manual flex items-center gap-3">
                      <Flame size={20} className="text-orange-500" />
                      <span>¿Cómo usar el boiler?</span>
                    </h3>
                    <ChevronDown size={18} className="accordion-arrow" />
                  </div>
                  {expandedManuals.boiler && (
                    <div className="accordion-body-manual">
                      <ol className="manual-list-styled-bento">
                        {guide.boilerInstructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {/* Trash */}
              {guide.trashInstructions && (
                <div className={`accordion-item-manual ${expandedManuals.trash ? 'active' : ''}`}>
                  <div className="accordion-header-manual" onClick={() => toggleManual('trash')}>
                    <h3 className="accordion-title-manual flex items-center gap-3">
                      <Trash2 size={20} className="text-blue-500" />
                      <span>Basura y Contenedores</span>
                    </h3>
                    <ChevronDown size={18} className="accordion-arrow" />
                  </div>
                  {expandedManuals.trash && (
                    <div className="accordion-body-manual">
                      <p className="accordion-body-text">{guide.trashInstructions}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TV */}
              {guide.tvInstructions && (
                <div className={`accordion-item-manual ${expandedManuals.tv ? 'active' : ''}`}>
                  <div className="accordion-header-manual" onClick={() => toggleManual('tv')}>
                    <h3 className="accordion-title-manual flex items-center gap-3">
                      <Tv size={20} className="text-purple-500" />
                      <span>Uso de Smart TV</span>
                    </h3>
                    <ChevronDown size={18} className="accordion-arrow" />
                  </div>
                  {expandedManuals.tv && (
                    <div className="accordion-body-manual">
                      <p className="accordion-body-text">{guide.tvInstructions}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {guide.additionalInstructions && (
                <div className="notes-box-bento">
                  <h4 className="notes-box-title text-purple-600">NOTAS IMPORTANTE ADICIONALES</h4>
                  <p className="notes-box-text">{guide.additionalInstructions}</p>
                </div>
              )}

            </div>
          </section>

          {/* Bento Card 5: Servicios Incluidos (Col span 5) */}
          {guide.amenities.length > 0 && (
            <section id="sec-amenidades" className="bento-card col-span-5 bg-surface-lowest">
              <h2 className="bento-card-title flex items-center gap-2">
                <Sparkles className="text-secondary" size={24} />
                Servicios Incluidos
              </h2>
              <div className="amenities-grid-bento">
                {guide.amenities.map((item, idx) => (
                  <div key={idx} className="amenity-item-bento">
                    <CheckCircle size={16} className="text-secondary" />
                    <span className="amenity-text-bento">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bento Card 6: Reglas de la Casa (Col span 6) */}
          <section id="sec-reglas" className="bento-card col-span-6">
            <h2 className="bento-card-title flex items-center gap-2">
              <ShieldAlert className="text-error" size={24} />
              Reglas de la Casa
            </h2>
            
            <div className="rules-badges-row-bento">
              <span className="rule-badge-bento bg-error-container">
                Mascotas: {guide.petsAllowed ? 'Permitidas' : 'Prohibidas'}
              </span>
              <span className="rule-badge-bento bg-error-container">
                Fiestas: {guide.eventsAllowed ? 'Permitidas' : 'Prohibidas'}
              </span>
              <span className="rule-badge-bento bg-error-container">
                Fumar: {guide.smokingAllowed ? 'Permitido' : 'Prohibido'}
              </span>
            </div>

            <div className="warning-banner-bento bg-yellow-50">
              <Users size={20} className="text-yellow-600" />
              <div>
                <p className="warning-banner-title text-yellow-800">Capacidad máxima:</p>
                <p className="warning-banner-desc text-yellow-700">{guide.maxGuests} personas en total.</p>
              </div>
            </div>

            {guide.additionalRules.length > 0 && (
              <div className="additional-rules-list-bento">
                {guide.additionalRules.map((rule, idx) => (
                  <div key={idx} className="additional-rule-item-bento">
                    <span className="bullet-rule bg-error"></span>
                    <p className="rule-text-bento">{rule}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bento Card 7: Tareas de Salida (Col span 6) */}
          {guide.checkoutSteps.length > 0 && (
            <section id="sec-checkout" className="bento-card col-span-6">
              <h2 className="bento-card-title flex items-center gap-2">
                <CheckCircle className="text-primary-color" size={24} />
                Tareas de Salida (Checkout)
              </h2>
              <p className="checkout-subtitle-bento">
                Por favor, realice estas tareas antes de su salida a las <span className="font-bold text-primary-color">{guide.checkOutTime}</span>
              </p>

              <div className="checkout-checklist-bento">
                {guide.checkoutSteps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`checkout-checklist-item-bento ${checkedSteps[idx] ? 'checked' : ''}`}
                    onClick={() => toggleStep(idx)}
                  >
                    <div className="checkout-checkbox-bento">
                      {checkedSteps[idx] && <Check size={14} color="white" />}
                    </div>
                    <span className="checkout-checklist-text-bento">{step}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bento Card 8: Fotos de la Propiedad (Col span 12) */}
          <section id="sec-fotos" className="bento-card col-span-12">
            <h2 className="bento-card-title flex items-center gap-2">
              <Image className="text-primary-color" size={24} />
              Fotos de la Propiedad
            </h2>
            
            <div className="gallery-grid-bento">
              {guide.photos.map((photo, idx) => (
                <div key={idx} className="gallery-photo-wrapper-bento">
                  <img src={photo} alt={`Propiedad ${idx + 1}`} className="gallery-photo-bento" />
                </div>
              ))}
              
              <div className="gallery-photo-add-bento">
                <Sparkles size={28} className="text-primary-color" />
                <span className="gallery-photo-add-text">Ver más fotos</span>
              </div>
            </div>
          </section>

          {/* Contactos & Emergencias (Col span 12) */}
          <section id="sec-contactos" className="bento-card col-span-12 contacts-card-bento">
            <h2 className="bento-card-title flex items-center gap-2">
              <Phone className="text-primary-color" size={24} />
              Contactos &amp; Emergencias
            </h2>
            
            <div className="contact-actions-grid-bento">
              <a href={`tel:${guide.hostPhone}`} className="contact-btn-bento host-call-bento">
                <span className="contact-btn-label-bento">Llamar al Anfitrión</span>
                <span className="contact-btn-name-bento">{guide.hostName}</span>
                <span className="contact-btn-num-bento">{guide.hostPhone}</span>
              </a>
              <a href="tel:911" className="contact-btn-bento emergency-call-bento">
                <span className="contact-btn-label-bento">Servicios de Emergencia</span>
                <span className="contact-btn-name-bento">Policía / Ambulancia</span>
                <span className="contact-btn-num-bento">911</span>
              </a>
            </div>
          </section>

        </div>
      </main>

      {/* ── SUPPORT FAB ── */}
      <div className="support-fab-container">
        <button onClick={() => scrollToSection('sec-contactos')} className="support-fab-btn" title="¿Necesitas Ayuda?">
          <MessageSquare size={24} />
          <span className="support-fab-label">¿Necesitas Ayuda?</span>
        </button>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION (Only visible on Mobile screens) ── */}
      <nav className="mobile-bottom-nav">
        <button onClick={() => scrollToSection('sec-acceso')} className="mobile-nav-btn active">
          <DoorOpen size={20} />
          <span className="mobile-nav-label">INICIO</span>
        </button>
        <button onClick={() => scrollToSection('sec-wifi')} className="mobile-nav-btn">
          <Lock size={20} />
          <span className="mobile-nav-label">WIFI</span>
        </button>
        <button onClick={() => scrollToSection('sec-manuales')} className="mobile-nav-btn">
          <BookOpen size={20} />
          <span className="mobile-nav-label">MANUAL</span>
        </button>
        <button onClick={() => scrollToSection('sec-contactos')} className="mobile-nav-btn">
          <Phone size={20} />
          <span className="mobile-nav-label">AYUDA</span>
        </button>
      </nav>

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
