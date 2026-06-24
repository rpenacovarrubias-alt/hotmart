import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import './GuideInteractive.css';

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
    trash: true,
    tv: false,
  });

  const toggleManual = (section: string) => {
    setExpandedManuals(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const scrollToSection = (idStr: string) => {
    const element = document.getElementById(idStr);
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
    <div className="interactive-guide-wrapper bg-surface text-on-surface custom-scrollbar">
      {/* ── TOP NAVIGATION ── */}
      <header className="fixed top-0 w-full z-50 bg-surface border-b border-surface-variant shadow-sm h-16 flex justify-between items-center px-margin-mobile md:px-margin-desktop">
        <button onClick={() => navigate('/guias')} className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors active:scale-95 bg-transparent border-none cursor-pointer">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-headline-md text-headline-md font-bold uppercase tracking-wider">REGRESAR</span>
        </button>
        <a href={`/guias/${guide.id}/pdf`} target="_blank" rel="noreferrer" className="bg-primary text-on-primary px-6 py-2 rounded-lg font-headline-md text-headline-md shadow-sm hover:brightness-110 active:scale-95 transition-all text-decoration-none flex items-center justify-center">
          Guardar PDF
        </a>
      </header>

      <main className="pt-16 pb-24 max-w-container-max mx-auto px-4 md:px-margin-desktop">
        {/* ── HERO BANNER ── */}
        <section className="relative rounded-2xl overflow-hidden mt-8 mb-12 h-[500px] flex items-end">
          <div className="absolute inset-0 z-0">
            <img alt={guide.name} className="w-full h-full object-cover" src={guide.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBV16JovlvOvXS-hfO5mRGPxIpa0cmRwljUl9-d-5ltNARMsZKlozQPvXlT-dF_lSYKrQRVvtqfEh1_U7SSEG2q6bX_7WeisTaImBuAhmV1ZyfT3pw8Usox-Ig9JKeWxPtR5VJZq4Bs4Kfre7RpOfYj5rxqG-kYLExS0Zz7t7FL9DzI9Q0bNav-iPqNlztt-W_S6l2YSwVs-CMVBNyvjxuTePoIic2KD9NL75cXeD3JaKiKUYT5bKXjOKMLNvFmXJz8iD1UZ8kvET0"} />
            <div className="absolute inset-0 hero-overlay" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(26,28,28,0.95) 100%)" }}></div>
          </div>
          <div className="relative z-10 p-8 md:p-12 w-full text-center text-on-primary">
            <p className="font-label-caps text-label-caps tracking-widest text-white mb-4 uppercase drop-shadow-md">GUÍA DE USO DIGITAL</p>
            <h1 className="font-headline-xl text-headline-xl md:text-headline-xl-mobile mb-6 drop-shadow-lg">{guide.name}</h1>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <span className="material-symbols-outlined text-secondary-fixed">bed</span>
                <span className="font-body-md text-body-md">{guide.bedrooms} Dormitorios</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <span className="material-symbols-outlined text-secondary-fixed">groups</span>
                <span className="font-body-md text-body-md">Max {guide.maxGuests} Huéspedes</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <span className="material-symbols-outlined text-secondary-fixed">location_on</span>
                <span className="font-body-md text-body-md">{guide.location}</span>
              </div>
            </div>

            <p className="font-body-lg text-body-lg text-white mb-4 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
              {guide.welcomeMessage}
            </p>
          </div>
        </section>

        {/* ── BENTO GRID SECTIONS ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          
          {/* Bento Card 1: Accesos Rápidos (Col span 12) */}
          <section className="md:col-span-12 bg-white rounded-2xl p-8 shadow-sm border border-surface-container">
            <h2 className="font-headline-md text-headline-md mb-8">Accesos Rápidos</h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              <button onClick={() => scrollToSection('sec-acceso')} className="flex flex-col items-center gap-3 group cursor-pointer bg-transparent border-none">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">key</span>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant">Acceso</span>
              </button>
              
              <button onClick={() => scrollToSection('sec-wifi')} className="flex flex-col items-center gap-3 group cursor-pointer bg-transparent border-none">
                <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">wifi</span>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant">WiFi</span>
              </button>
              
              <button onClick={() => scrollToSection('sec-manuales')} className="flex flex-col items-center gap-3 group cursor-pointer bg-transparent border-none">
                <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">menu_book</span>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant">Manuales</span>
              </button>
              
              {guide.amenities.length > 0 && (
                <button onClick={() => scrollToSection('sec-amenidades')} className="flex flex-col items-center gap-3 group cursor-pointer bg-transparent border-none">
                  <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-500 transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-3xl">home_repair_service</span>
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">Servicios</span>
                </button>
              )}
              
              <button onClick={() => scrollToSection('sec-reglas')} className="flex flex-col items-center gap-3 group cursor-pointer bg-transparent border-none">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">gavel</span>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant">Reglas</span>
              </button>
              
              {guide.checkoutSteps.length > 0 && (
                <button onClick={() => scrollToSection('sec-checkout')} className="flex flex-col items-center gap-3 group cursor-pointer bg-transparent border-none">
                  <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-3xl">logout</span>
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">Salida</span>
                </button>
              )}
              
              <button onClick={() => scrollToSection('sec-contactos')} className="flex flex-col items-center gap-3 group cursor-pointer bg-transparent border-none">
                <div className="w-14 h-14 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">support_agent</span>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant">Contacto</span>
              </button>

              <button onClick={() => scrollToSection('sec-fotos')} className="flex flex-col items-center gap-3 group cursor-pointer bg-transparent border-none">
                <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">photo_camera</span>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant">Fotos</span>
              </button>
            </div>
          </section>

          {/* Bento Card 2: Llegada y Acceso Autónomo (Col span 8) */}
          <section id="sec-acceso" className="md:col-span-8 bg-white rounded-2xl p-8 shadow-sm border border-surface-container">
            <h2 className="font-headline-md text-headline-md mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">sensor_door</span>
              Llegada y Acceso Autónomo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-6 rounded-xl bg-blue-50 border border-blue-100 text-center">
                <p className="font-label-caps text-label-caps text-blue-600 mb-2 uppercase">Entrada (Check-in)</p>
                <p className="font-headline-lg text-headline-lg text-on-surface font-bold">{guide.checkInTime}</p>
                <p className="text-xs text-blue-400 mt-1">{guide.checkInNote || "hasta las 11:00 p.m."}</p>
              </div>
              <div className="p-6 rounded-xl bg-green-50 border border-green-100 text-center">
                <p className="font-label-caps text-label-caps text-green-600 mb-2 uppercase">Salida (Check-out)</p>
                <p className="font-headline-lg text-headline-lg text-on-surface font-bold">{guide.checkOutTime}</p>
                <p className="text-xs text-green-400 mt-1">{guide.checkOutNote || "Máximo"}</p>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded-xl mb-6">
              <h3 className="font-headline-md text-headline-md text-primary mb-4">Instrucciones para Entrar</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
                {guide.accessInstructions}
              </p>
            </div>

            {guide.googleMapsUrl && (
              <a href={guide.googleMapsUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-4 border-2 border-primary-container/20 rounded-xl text-primary font-bold hover:bg-primary-container/5 transition-colors text-decoration-none">
                <span className="material-symbols-outlined">map</span>
                <span>Ubicación de la casa en Google Maps</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            )}
          </section>

          {/* Bento Card 3: WiFi (Col span 4) */}
          <section id="sec-wifi" className="md:col-span-4 bg-[#1a237e] text-white rounded-2xl p-8 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="font-headline-md text-headline-md mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-400 text-3xl">wifi_password</span>
                Conexión WiFi
              </h2>
              
              <div className="space-y-6">
                <div>
                  <p className="font-label-caps text-label-caps text-blue-200 mb-1">NOMBRE DE RED (SSID)</p>
                  <p className="font-headline-lg text-headline-lg font-bold">{guide.wifiNetwork}</p>
                </div>
                <div>
                  <p className="font-label-caps text-label-caps text-blue-200 mb-1">CONTRASEÑA</p>
                  <p className="font-headline-lg text-headline-lg font-bold text-orange-400">{guide.wifiPassword}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 flex flex-col items-center">
              <div className="bg-white p-3 rounded-xl mb-4">
                <img src={wifiQrUrl} alt="WiFi QR" className="w-32 h-32 block object-contain" />
              </div>
              <p className="text-xs text-blue-200">Escanea para Conectar</p>
              
              <button onClick={handleCopyPassword} className="mt-6 w-full py-3 bg-white/10 rounded-lg text-white font-medium hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-2 border-none cursor-pointer">
                <span className="material-symbols-outlined text-sm">content_copy</span>
                <span>{copied ? '¡Clave Copiada!' : 'Copiar Contraseña'}</span>
              </button>
            </div>
          </section>

          {/* Bento Card 4: Manual del Hogar (Col span 7) */}
          <section id="sec-manuales" className="md:col-span-7 bg-white rounded-2xl p-8 shadow-sm border border-surface-container">
            <h2 className="font-headline-md text-headline-md mb-8">Manual del Hogar &amp; Servicios</h2>
            <div className="space-y-4">
              
              {/* Boiler */}
              {guide.boilerInstructions.length > 0 && (
                <div className="p-6 rounded-xl border border-surface-variant hover:border-primary-container transition-colors cursor-pointer group" onClick={() => toggleManual('boiler')}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-headline-md text-headline-md flex items-center gap-3">
                      <span className="material-symbols-outlined text-orange-500 text-3xl">water_heater</span>
                      ¿Cómo usar el boiler?
                    </h3>
                    <span className={`material-symbols-outlined transition-transform duration-200 ${expandedManuals.boiler ? 'rotate-180' : ''}`}>expand_more</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    El Boiler es eléctrico y está conectado y prendido, puedes asegurarte por la pantalla LED.
                  </p>
                  {expandedManuals.boiler && (
                    <div className="mt-4 pt-4 border-t border-surface-variant/35" onClick={e => e.stopPropagation()}>
                      <ol className="list-decimal pl-5 space-y-2 font-body-md text-body-md text-on-surface-variant">
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
                <div className="p-6 rounded-xl border border-surface-variant hover:border-primary-container transition-colors cursor-pointer group" onClick={() => toggleManual('trash')}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-headline-md text-headline-md flex items-center gap-3">
                      <span className="material-symbols-outlined text-blue-500 text-3xl">delete</span>
                      Basura y Contenedores
                    </h3>
                    <span className={`material-symbols-outlined transition-transform duration-200 ${expandedManuals.trash ? 'rotate-180' : ''}`}>expand_more</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    La basura se deja en los contenedores al lado de la puerta de acceso al condominio.
                  </p>
                  {expandedManuals.trash && (
                    <div className="mt-4 pt-4 border-t border-surface-variant/35" onClick={e => e.stopPropagation()}>
                      <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line">
                        {guide.trashInstructions}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TV */}
              {guide.tvInstructions && (
                <div className="p-6 rounded-xl border border-surface-variant hover:border-primary-container transition-colors cursor-pointer group" onClick={() => toggleManual('tv')}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-headline-md text-headline-md flex items-center gap-3">
                      <span className="material-symbols-outlined text-purple-500 text-3xl">tv</span>
                      Uso de Smart TV
                    </h3>
                    <span className={`material-symbols-outlined transition-transform duration-200 ${expandedManuals.tv ? 'rotate-180' : ''}`}>expand_more</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    La TV cuenta con streaming para disfrutar tu estadía.
                  </p>
                  {expandedManuals.tv && (
                    <div className="mt-4 pt-4 border-t border-surface-variant/35" onClick={e => e.stopPropagation()}>
                      <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line">
                        {guide.tvInstructions}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {guide.additionalInstructions && (
                <div className="p-6 rounded-xl bg-purple-50 border border-purple-100 mt-6">
                  <h4 className="font-label-caps text-label-caps text-purple-600 mb-2">NOTAS IMPORTANTES</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">{guide.additionalInstructions}</p>
                </div>
              )}

            </div>
          </section>

          {/* Bento Card 5: Servicios Incluidos (Col span 5) */}
          {guide.amenities.length > 0 && (
            <section id="sec-amenidades" className="md:col-span-5 bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-surface-container">
              <h2 className="font-headline-md text-headline-md mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-3xl">star</span>
                Servicios Incluidos
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {guide.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 rounded-lg bg-surface border border-surface-variant">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="font-body-md text-body-md">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bento Card 6: Reglas de la Casa (Col span 6) */}
          <section id="sec-reglas" className="md:col-span-6 bg-white rounded-2xl p-8 shadow-sm border border-surface-container">
            <h2 className="font-headline-md text-headline-md mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-3xl">report</span>
              Reglas de la Casa
            </h2>
            
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-4 py-2 bg-error-container text-on-error-container rounded-full font-label-caps text-[10px] uppercase">
                Mascotas: {guide.petsAllowed ? 'Permitidas' : 'Prohibidas'}
              </span>
              <span className="px-4 py-2 bg-error-container text-on-error-container rounded-full font-label-caps text-[10px] uppercase">
                Fiestas: {guide.eventsAllowed ? 'Permitidas' : 'Prohibidas'}
              </span>
              <span className="px-4 py-2 bg-error-container text-on-error-container rounded-full font-label-caps text-[10px] uppercase">
                Fumar: {guide.smokingAllowed ? 'Permitido' : 'Prohibido'}
              </span>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl mb-6 flex items-center gap-4">
              <span className="material-symbols-outlined text-yellow-600 text-2xl">person_add</span>
              <div>
                <p className="font-body-md text-body-md font-bold text-yellow-800">Capacidad máxima:</p>
                <p className="text-yellow-700">{guide.maxGuests} personas en total.</p>
              </div>
            </div>

            {guide.additionalRules.length > 0 && (
              <div className="space-y-4">
                {guide.additionalRules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-error mt-2 flex-shrink-0"></span>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bento Card 7: Tareas de Salida (Col span 6) */}
          {guide.checkoutSteps.length > 0 && (
            <section id="sec-checkout" className="md:col-span-6 bg-white rounded-2xl p-8 shadow-sm border border-surface-container">
              <h2 className="font-headline-md text-headline-md mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">fact_check</span>
                Tareas de Salida (Checkout)
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 italic">
                Por favor, realice estas tareas antes de su salida a las <span className="font-bold text-primary">{guide.checkOutTime}</span>
              </p>

              <div className="space-y-4">
                {guide.checkoutSteps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-4 p-4 rounded-xl border border-surface-variant hover:bg-surface transition-colors cursor-pointer ${checkedSteps[idx] ? 'opacity-50' : ''}`}
                    onClick={() => toggleStep(idx)}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 border-surface-variant flex items-center justify-center transition-all ${checkedSteps[idx] ? 'bg-primary border-primary' : ''}`}>
                      {checkedSteps[idx] && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                    </div>
                    <span className={`font-body-md text-body-md ${checkedSteps[idx] ? 'line-through text-on-surface-variant' : ''}`}>{step}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bento Card 8: Fotos de la Propiedad (Col span 12) */}
          <section id="sec-fotos" className="md:col-span-12 bg-white rounded-2xl p-8 shadow-sm border border-surface-container">
            <h2 className="font-headline-md text-headline-md mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">imagesmode</span>
              Fotos de la Propiedad
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-surface-container-low border-2 border-dashed border-surface-variant flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors group">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:scale-110 transition-transform">add_a_photo</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant mt-2">Subir Foto</span>
              </div>

              {guide.photos.map((photo, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-surface-container border border-surface-variant">
                  <img src={photo} alt={`Propiedad ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              {guide.photos.length === 0 && Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-surface-container border border-surface-variant bg-gray-100 flex items-center justify-center text-gray-300">
                  <span className="material-symbols-outlined text-4xl">image</span>
                </div>
              ))}
            </div>
          </section>

          {/* Bento Card 9: Contactos & Emergencias (Col span 12) */}
          <section id="sec-contactos" className="md:col-span-12 bg-white rounded-2xl p-8 shadow-sm border border-surface-container">
            <h2 className="font-headline-md text-headline-md mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">support_agent</span>
              Contactos &amp; Emergencias
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href={`tel:${guide.hostPhone}`} className="flex flex-col justify-center items-center gap-2 p-6 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 transition-all text-center text-decoration-none">
                <span className="font-label-caps text-label-caps uppercase">Llamar al Anfitrión</span>
                <span className="font-headline-lg text-headline-lg font-bold">{guide.hostName}</span>
                <span className="font-body-md text-body-md font-semibold">{guide.hostPhone || "4421851478"}</span>
              </a>
              <a href="tel:911" className="flex flex-col justify-center items-center gap-2 p-6 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 transition-all text-center text-decoration-none">
                <span className="font-label-caps text-label-caps uppercase">Servicios de Emergencia</span>
                <span className="font-headline-lg text-headline-lg font-bold">Policía / Urgencias</span>
                <span className="font-body-md text-body-md font-semibold">911</span>
              </a>
            </div>
          </section>

        </div>
      </main>

      {/* ── SUPPORT FAB ── */}
      <div className="fixed bottom-24 right-8 z-50">
        <button onClick={() => scrollToSection('sec-contactos')} className="bg-primary text-on-primary w-16 h-16 rounded-full shadow-2xl flex items-center justify-center group active:scale-90 transition-all border-none cursor-pointer">
          <span className="material-symbols-outlined text-3xl">chat_bubble</span>
          <span className="absolute right-full mr-4 bg-on-surface text-surface px-4 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">¿Necesitas Ayuda?</span>
        </button>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface border-t border-surface-variant h-16 flex justify-around items-center pb-safe md:hidden">
        <button onClick={() => scrollToSection('sec-acceso')} className="flex flex-col items-center justify-center text-primary font-bold bg-transparent border-none cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="font-label-caps text-[10px]">INICIO</span>
        </button>
        <button onClick={() => scrollToSection('sec-wifi')} className="flex flex-col items-center justify-center text-on-surface-variant bg-transparent border-none cursor-pointer">
          <span className="material-symbols-outlined">wifi</span>
          <span className="font-label-caps text-[10px]">WIFI</span>
        </button>
        <button onClick={() => scrollToSection('sec-manuales')} className="flex flex-col items-center justify-center text-on-surface-variant bg-transparent border-none cursor-pointer">
          <span className="material-symbols-outlined">menu_book</span>
          <span className="font-label-caps text-[10px]">MANUAL</span>
        </button>
        <button onClick={() => scrollToSection('sec-contactos')} className="flex flex-col items-center justify-center text-on-surface-variant bg-transparent border-none cursor-pointer">
          <span className="material-symbols-outlined">support_agent</span>
          <span className="font-label-caps text-[10px]">AYUDA</span>
        </button>
      </nav>

      {/* ── FOOTER DE DISEÑO PROFESIONAL ── */}
      <footer className="bg-surface-container-high px-margin-mobile md:px-margin-desktop mt-12 py-8">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-on-surface font-body-md font-semibold">
            Operado por <a className="text-primary hover:underline text-decoration-none" href="https://hospitalidad-digital.vercel.app" target="_blank" rel="noreferrer">Hospitalidad Digital</a>
          </div>
          <div className="flex items-center gap-6 text-on-surface-variant">
            <a className="hover:text-primary transition-colors text-inherit text-decoration-none" href="#"><span className="material-symbols-outlined">face</span></a>
            <a className="hover:text-primary transition-colors text-inherit text-decoration-none" href="#"><span className="material-symbols-outlined">menu_book</span></a>
            <a className="hover:text-primary transition-colors text-inherit text-decoration-none" href="#"><span className="material-symbols-outlined">photo_camera</span></a>
            <a className="hover:text-primary transition-colors text-inherit text-decoration-none" href="#"><span className="material-symbols-outlined">video_library</span></a>
            <a className="hover:text-primary transition-colors text-inherit text-decoration-none" href="#"><span className="material-symbols-outlined">public</span></a>
          </div>
        </div>
        <div className="max-w-container-max mx-auto pt-6 mt-6 border-t border-surface-variant/30 text-center text-[10px] text-on-surface-variant opacity-60">
          © 2026 CoHost Admin México. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default GuideInteractiveView;
