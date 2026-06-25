import { useState, useEffect } from 'react';
import { RefreshCw, MessageSquare, Key, MapPin, Star, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ReviewCard from '../components/ReviewCard';
import ExportModule from '../components/ExportModule';
import AirbnbTokenModal from '../components/AirbnbTokenModal';
import type { AirbnbReview } from '../types';

// ── Brand constants ────────────────────────────────────────────────────────────
const C = {
  navy:    '#1F3A5F',
  orange:  '#F97316',
  sky:     '#4EA8DE',
  cream:   '#FFF8F2',
  muted:   '#6b7280',
  white:   '#ffffff',
};

const WA_LINK   = 'https://wa.me/524421851478?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20gesti%C3%B3n%20de%20mi%20propiedad%20y%20suscribirme%20a%20la%20comunidad%20de%20Hospitalidad%20Digital';
const EMAIL     = 'rp@coanfitrionesmexico.com.mx';

// ── Reusable micro-components ──────────────────────────────────────────────────
function Stars({ color = C.orange }: { color?: string }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={16} fill={color} color={color} />
      ))}
    </div>
  );
}

function CTAButton({
  href, children, primary = true,
}: {
  href: string; children: React.ReactNode; primary?: boolean;
}) {
  const isFragment = href.startsWith('#');
  return (
    <a
      href={href}
      target={isFragment ? undefined : '_blank'}
      rel={isFragment ? undefined : 'noopener noreferrer'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        padding: '16px 32px', borderRadius: '14px', textDecoration: 'none',
        fontSize: '15px', fontWeight: 700,
        background: primary ? C.orange : 'rgba(255,255,255,0.12)',
        color: C.white,
        border: primary ? 'none' : `1px solid rgba(255,255,255,0.25)`,
        boxShadow: primary ? `0 4px 24px rgba(249,115,22,0.4)` : 'none',
        transition: 'transform 160ms ease-out',
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
      onMouseUp={(e)   => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e)=> (e.currentTarget.style.transform = 'scale(1)')}
    >
      {children}
    </a>
  );
}

// ── FAQ item (accordion) ───────────────────────────────────────────────────────
function LandingFAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: '14px',
      overflow: 'hidden', marginBottom: '10px',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '18px 22px',
          background: open ? C.cream : 'white',
          border: 'none', cursor: 'pointer', textAlign: 'left', gap: '16px',
          transition: 'background 150ms ease',
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: 700, color: C.navy }}>{q}</span>
        {open
          ? <ChevronUp size={18} color={C.orange} />
          : <ChevronDown size={18} color={C.muted} />}
      </button>
      {open && (
        <div style={{
          padding: '0 22px 18px',
          fontSize: '14px', color: '#374151', lineHeight: 1.8,
          background: C.cream,
        }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { reviewsState, fetchAllReviews, properties } = useApp();
  const { currentUser } = useAuth();
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [calcRate, setCalcRate] = useState(1200);
  const [landingReviews, setLandingReviews] = useState<AirbnbReview[]>([]);
  const [landingLoading, setLandingLoading] = useState(false);

  useEffect(() => {
    setLandingLoading(true);
    fetch('/api/landing-reviews')
      .then(r => r.json() as Promise<{ reviews: AirbnbReview[] }>)
      .then(d => { if (d.reviews?.length) setLandingReviews(d.reviews); })
      .catch(() => {})
      .finally(() => setLandingLoading(false));
  }, []);

  const displayReviews = landingReviews.length > 0 ? landingReviews : reviewsState.reviews;
  const isLoadingAny   = reviewsState.isLoading || landingLoading;

  const selfMonthly = Math.round(calcRate * 0.48 * 30 / 100) * 100;
  const cohoMonthly = Math.round(calcRate * 0.65 * 30 * 0.78 / 100) * 100;
  const calcGain    = cohoMonthly - selfMonthly;
  const calcGainPct = Math.round((cohoMonthly / selfMonthly - 1) * 100);

  const handleRefresh = () => { fetchAllReviews(); };

  return (
    <div style={{
      background: C.cream,
      minHeight: '100dvh',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#374151',
    }}>

      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ── NAV ────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(31,58,95,0.97)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '11px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src="/logo-coanfitriones.png"
            alt="Coanfitriones México"
            style={{ height: '32px', objectFit: 'contain' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'white', lineHeight: 1 }}>Coanfitriones</div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: C.orange }}>México</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/anfitriones" style={{
            fontSize: '13px', fontWeight: 600,
            color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
            transition: 'color 150ms',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          >
            Para anfitriones →
          </a>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '8px 16px', borderRadius: '10px', textDecoration: 'none',
              background: C.orange, color: C.white,
              fontSize: '12px', fontWeight: 700,
              boxShadow: '0 2px 10px rgba(249,115,22,0.4)',
            }}
          >
            <MessageSquare size={13} /> WhatsApp
          </a>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(150deg, ${C.navy} 0%, #2a4f82 100%)`,
        padding: '0 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Admin floating controls */}
        {currentUser && (
          <div style={{
            position: 'absolute', top: '16px', right: '20px',
            display: 'flex', gap: '8px', zIndex: 10,
          }}>
            <button
              onClick={() => setShowTokenModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)',
                color: 'white', fontSize: '12px', fontWeight: 600,
              }}
            >
              <Key size={13} /> Token
            </button>
            <button
              onClick={handleRefresh}
              disabled={isLoadingAny}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px', cursor: isLoadingAny ? 'not-allowed' : 'pointer',
                background: 'rgba(249,115,22,0.85)', border: 'none',
                color: 'white', fontSize: '12px', fontWeight: 700,
                opacity: isLoadingAny ? 0.65 : 1,
              }}
            >
              <RefreshCw
                size={13}
                style={{ animation: isLoadingAny ? 'spin 1s linear infinite' : 'none' }}
              />
              {isLoadingAny ? 'Actualizando...' : 'Actualizar reseñas'}
            </button>
          </div>
        )}

        {/* Logo */}
        <div style={{ paddingTop: '64px', marginBottom: '24px' }}>
          <img
            src="/logo-coanfitriones.png"
            alt="Coanfitriones México"
            style={{ height: '72px', objectFit: 'contain' }}
            onError={(e) => {
              // Fallback: show text logo if image not found
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              const next = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (next) next.style.display = 'flex';
            }}
          />
          {/* Fallback text logo */}
          <div style={{
            display: 'none',
            alignItems: 'center', justifyContent: 'center', gap: '10px',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '14px',
              background: C.orange,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px',
            }}>🏠</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', lineHeight: 1.1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Coanfitriones
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: C.orange }}>México</div>
            </div>
          </div>
        </div>

        {/* Brand tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: '20px', padding: '5px 16px', marginBottom: '28px',
        }}>
          <span style={{ fontSize: '11px', color: C.orange, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Hospitalidad Digital
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 'clamp(36px, 5.5vw, 68px)',
          fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: '24px',
          maxWidth: '800px', margin: '0 auto 24px',
          opacity: 0,
          animation: 'fadeSlideIn 0.65s cubic-bezier(0.23,1,0.32,1) 80ms forwards',
        }}>
          Tu propiedad genera ingresos.<br />
          <span style={{ color: C.orange }}>Nosotros nos encargamos de todo.</span>
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: 'rgba(255,255,255,0.78)',
          lineHeight: 1.75, maxWidth: '600px', margin: '0 auto 40px',
          opacity: 0,
          animation: 'fadeSlideIn 0.65s cubic-bezier(0.23,1,0.32,1) 180ms forwards',
        }}>
          Somos co-anfitriones profesionales en Airbnb. Gestionamos tu propiedad como si fuera la nuestra — para que tú solo recibas el depósito cada mes.
        </p>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center',
          opacity: 0,
          animation: 'fadeSlideIn 0.65s cubic-bezier(0.23,1,0.32,1) 260ms forwards',
        }}>
          <CTAButton href={WA_LINK} primary>
            <MessageSquare size={17} /> Cotiza gratis por WhatsApp
          </CTAButton>
          <CTAButton href="#como-funciona" primary={false}>
            Ver cómo funciona →
          </CTAButton>
        </div>
      </section>

      {/* ── CREDIBILITY BAR ────────────────────────────────────────────── */}
      <section style={{ background: C.navy }}>
        <div style={{
          maxWidth: '960px', margin: '0 auto',
          padding: '28px 24px',
          display: 'flex', flexWrap: 'wrap', gap: '8px',
          justifyContent: 'center',
        }}>
          {[
            { value: `${properties.length || '1'}+`, label: 'propiedades gestionadas' },
            { value: displayReviews.length > 0 ? `${displayReviews.length}` : '5★', label: displayReviews.length > 0 ? 'reseñas 5★ verificadas' : 'calificación constante' },
            { value: '65%',    label: 'ocupación promedio' },
            { value: '30+',    label: 'años en hotelería' },
            { value: '4',      label: 'años en Airbnb' },
          ].map(({ value, label }) => (
            <div key={label} style={{
              textAlign: 'center', minWidth: '140px', padding: '12px 20px',
              borderRight: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontSize: '30px', fontWeight: 800, color: C.orange, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '6px' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── EL PROBLEMA ────────────────────────────────────────────────── */}
      <section style={{ padding: '88px 24px', maxWidth: '780px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800,
          color: C.navy, lineHeight: 1.25, marginBottom: '32px',
        }}>
          Tener una propiedad en Airbnb debería ser pasivo.{' '}
          <span style={{ color: C.muted, fontStyle: 'italic', fontWeight: 700 }}>
            No siempre lo es.
          </span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
          {[
            'Pasas horas respondiendo mensajes a cualquier hora del día',
            'Coordinas limpieza, check-in y check-out sin descanso',
            'Tus calificaciones bajan cuando algo falla y no estás disponible',
            'Sientes que trabajas más de lo que realmente ganas',
          ].map((pain) => (
            <div key={pain} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span style={{
                color: 'white', background: '#ef4444', fontWeight: 800,
                fontSize: '13px', borderRadius: '6px', padding: '2px 8px',
                marginTop: '2px', flexShrink: 0,
              }}>✕</span>
              <p style={{ margin: 0, fontSize: '17px', color: '#374151', lineHeight: 1.65 }}>{pain}</p>
            </div>
          ))}
        </div>
        <p style={{
          fontSize: '18px', color: C.navy, fontWeight: 700,
          fontStyle: 'italic', borderLeft: `4px solid ${C.orange}`,
          paddingLeft: '20px', margin: 0,
        }}>
          "La buena noticia: existe una forma diferente de hacerlo."
        </p>
      </section>

      {/* ── CÓMO FUNCIONA ──────────────────────────────────────────────── */}
      <section id="como-funciona" style={{ background: C.cream, padding: '88px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
            borderRadius: '20px', padding: '5px 16px', marginBottom: '16px',
          }}>
            <span style={{ fontSize: '11px', color: C.orange, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              El proceso
            </span>
          </div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800,
            color: C.navy, lineHeight: 1.2, marginBottom: '12px',
          }}>
            Así funciona
          </h2>
          <p style={{ fontSize: '17px', color: C.muted, lineHeight: 1.75, maxWidth: '520px', margin: '0 auto 56px' }}>
            Tres pasos. Sin burocracia. Sin letra pequeña.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2px',
            background: 'rgba(249,115,22,0.08)',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid rgba(249,115,22,0.12)',
          }}>
            {([
              {
                num: '01', icon: '💬', title: 'Nos platicamos',
                desc: 'Agenda 15 minutos por WhatsApp. Escuchamos sobre tu propiedad y te decimos si somos el match. Sin compromiso.',
              },
              {
                num: '02', icon: '📄', title: 'Firmamos el acuerdo',
                desc: 'Todo por escrito y claro. Comisión sobre lo que se genera. Sin pago por adelantado ni contratos largos.',
              },
              {
                num: '03', icon: '💰', title: 'Tú recibes el depósito',
                desc: 'Gestionamos huéspedes, precios, limpieza y reportes. Tú solo recibes el dinero en tu cuenta cada mes.',
              },
            ] as const).map(({ num, icon, title, desc }) => (
              <div key={num} style={{
                padding: '36px 28px', textAlign: 'center',
                background: 'white',
                transition: 'background 200ms ease',
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = C.cream)}
                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'white')}
              >
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px',
                  background: `linear-gradient(135deg, ${C.navy}, #2a4f82)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', fontSize: '28px',
                  boxShadow: '0 6px 20px rgba(31,58,95,0.18)',
                }}>
                  {icon}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: C.orange, letterSpacing: '0.12em', marginBottom: '10px' }}>
                  PASO {num}
                </div>
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '19px', fontWeight: 800, color: C.navy, marginBottom: '12px',
                }}>
                  {title}
                </h3>
                <p style={{ fontSize: '14px', color: C.muted, lineHeight: 1.8, margin: 0 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '44px' }}>
            <CTAButton href={WA_LINK} primary>
              <MessageSquare size={17} /> Agendar llamada ahora
            </CTAButton>
          </div>
        </div>
      </section>

      {/* ── LA SOLUCIÓN ────────────────────────────────────────────────── */}
      <section style={{ background: 'white', padding: '88px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800,
              color: C.navy, lineHeight: 1.2, marginBottom: '10px',
            }}>
              Tú pones la propiedad.
            </h2>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 700,
              color: C.orange, lineHeight: 1.2, margin: 0,
            }}>
              Coanfitriones México pone todo lo demás.
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {[
              { icon: '💬', title: 'Gestión de mensajes 7 días', desc: 'Respondemos en minutos, cualquier hora. Nunca pierdas una reserva por demora.' },
              { icon: '💰', title: 'Precios dinámicos inteligentes', desc: 'Maximizamos tu ingreso con tarifas ajustadas a demanda real y temporada.' },
              { icon: '🧹', title: 'Coordinación de limpieza', desc: 'Red certificada de limpieza. Tu propiedad siempre impecable para cada huésped.' },
              { icon: '📊', title: 'Reportes mensuales claros', desc: 'Transparencia total. Ves exactamente cuánto entra y cuánto cuesta cada mes.' },
              { icon: '📸', title: 'Optimización del anuncio', desc: 'Fotos, textos y posicionamiento para máxima visibilidad en el buscador.' },
              { icon: '🔑', title: 'Check-in / Check-out sin fricción', desc: 'Proceso automatizado que garantiza una experiencia de 5 estrellas siempre.' },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{
                  background: C.cream, borderRadius: '20px', padding: '28px',
                  border: '1px solid rgba(249,115,22,0.1)',
                  transition: 'box-shadow 200ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(31,58,95,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ fontSize: '36px', marginBottom: '14px' }}>{icon}</div>
                <h4 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '15px', fontWeight: 700, color: C.navy, marginBottom: '10px',
                }}>{title}</h4>
                <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARACIÓN ──────────────────────────────────────────────────── */}
      <section style={{ background: C.navy, padding: '88px 24px' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.4)', borderRadius: '20px', padding: '5px 16px', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', color: C.orange, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Diferencia real</span>
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '12px' }}>
              Solo vs con nosotros
            </h2>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              Los números hablan solos.
            </p>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.3fr', minWidth: '480px', marginBottom: '6px' }}>
              <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Métrica</div>
              <div style={{ padding: '8px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tú solo</div>
              <div style={{ padding: '8px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Con Coanfitriones</div>
            </div>

            {/* Data rows */}
            {[
              { metric: 'Ocupación mensual',   solo: '~48%',              coho: '65%+' },
              { metric: 'Tu tiempo/semana',    solo: '10–15 horas',       coho: '0 horas' },
              { metric: 'Respuesta mensajes',  solo: 'Cuando puedes',     coho: '<1h · 7 días' },
              { metric: 'Precios por noche',   solo: 'Estáticos',         coho: 'Dinámicos +25%' },
              { metric: 'Penalización salida', solo: 'Sin definir',       coho: 'Ninguna' },
              { metric: 'Pago inicial',        solo: 'Tiempo + costos',   coho: '$0 — sin anticipo' },
            ].map(({ metric, solo, coho }, i) => (
              <div key={metric} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.3fr', minWidth: '480px', background: i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent', borderRadius: '12px', marginBottom: '4px', alignItems: 'center' }}>
                <div style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{metric}</div>
                <div style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>{solo}</span>
                </div>
                <div style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <span style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', fontWeight: 700, color: C.orange }}>✓ {coho}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '44px' }}>
            <CTAButton href={WA_LINK} primary>
              <MessageSquare size={17} /> Me interesa — hablemos
            </CTAButton>
          </div>
        </div>
      </section>

      {/* ── CALCULADORA DE INGRESOS ──────────────────────────────────────── */}
      <section style={{ background: 'white', padding: '88px 24px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '20px', padding: '5px 16px', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', color: C.orange, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Calculadora</span>
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 800, color: C.navy, lineHeight: 1.2, marginBottom: '12px' }}>
              ¿Cuánto podrías ganar con nosotros?
            </h2>
            <p style={{ fontSize: '16px', color: C.muted, lineHeight: 1.7, maxWidth: '500px', margin: '0 auto' }}>
              Ajusta tu tarifa por noche y ve la diferencia real.
            </p>
          </div>

          {/* Slider */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 800, color: C.navy, lineHeight: 1, marginBottom: '10px' }}>
              ${calcRate.toLocaleString('es-MX')}
              <span style={{ fontSize: '16px', fontWeight: 500, color: C.muted, marginLeft: '8px' }}>MXN / noche</span>
            </div>
            <input
              type="range"
              min={500} max={5000} step={100}
              value={calcRate}
              onChange={e => setCalcRate(Number(e.target.value))}
              style={{ width: '100%', maxWidth: '500px', accentColor: C.orange, cursor: 'pointer', height: '6px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '500px', margin: '4px auto 0', fontSize: '11px', color: '#9ca3af' }}>
              <span>$500</span><span>$5,000</span>
            </div>
          </div>

          {/* Result cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Self-managed */}
            <div style={{ background: C.cream, borderRadius: '20px', padding: '28px 24px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Gestionando solo</div>
              <div style={{ fontSize: '12px', color: C.muted, marginBottom: '12px' }}>~48% ocupación promedio</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '42px', fontWeight: 800, color: '#374151', lineHeight: 1, marginBottom: '6px' }}>
                ${selfMonthly.toLocaleString('es-MX')}
              </div>
              <div style={{ fontSize: '12px', color: C.muted }}>/ mes bruto</div>
            </div>

            {/* With Coanfitriones */}
            <div style={{ background: C.navy, borderRadius: '20px', padding: '28px 24px', border: '2px solid rgba(249,115,22,0.4)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '14px', right: '14px', background: C.orange, borderRadius: '10px', padding: '3px 10px', fontSize: '10px', fontWeight: 700, color: 'white' }}>
                +{calcGainPct}%
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: C.orange, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Con Coanfitriones</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginBottom: '12px' }}>65% ocupación + optimización</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '42px', fontWeight: 800, color: 'white', lineHeight: 1, marginBottom: '6px' }}>
                ${cohoMonthly.toLocaleString('es-MX')}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>/ mes neto (después comisión)</div>
            </div>
          </div>

          {/* Net gain highlight */}
          <div style={{ textAlign: 'center', padding: '18px 24px', background: 'rgba(249,115,22,0.08)', borderRadius: '16px', border: '1px solid rgba(249,115,22,0.2)', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: C.navy }}>
              Podrías recibir{' '}
              <strong style={{ color: C.orange, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '20px' }}>
                ${calcGain.toLocaleString('es-MX')} MXN más
              </strong>
              {' '}al mes — sin hacer nada extra.
            </span>
          </div>
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', margin: 0 }}>
            * Estimación basada en promedios del mercado de Querétaro. Comisión aplicada del 22%.
            Los resultados reales varían según la propiedad y temporada.
          </p>
        </div>
      </section>

      {/* ── PRECIOS / TRANSPARENCIA ─────────────────────────────────────── */}
      <section style={{ background: C.navy, padding: '88px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.4)',
            borderRadius: '20px', padding: '5px 16px', marginBottom: '16px',
          }}>
            <span style={{ fontSize: '11px', color: C.orange, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Transparencia
            </span>
          </div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800,
            color: 'white', lineHeight: 1.2, marginBottom: '12px',
          }}>
            Sin letra pequeña.
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, maxWidth: '560px', margin: '0 auto 56px' }}>
            Cobramos comisión sobre lo que generamos juntos. Si tu propiedad no produce, nosotros tampoco ganamos.
          </p>

          {/* Modelo de comisión */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px', marginBottom: '40px',
          }}>
            {[
              { num: '$0', label: 'Pago por adelantado', desc: 'No cobras nada hasta que generamos tu primera reserva.' },
              { num: '20–25%', label: 'Comisión sobre ingresos', desc: 'Dependiendo del nivel de servicio y tipo de propiedad.' },
              { num: '0%', label: 'Penalización por salida', desc: 'Sin contratos de permanencia. Te vas cuando quieres.' },
            ].map(({ num, label, desc }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.06)', borderRadius: '20px',
                padding: '32px 24px', border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '42px', fontWeight: 800, color: C.orange, lineHeight: 1, marginBottom: '8px',
                }}>
                  {num}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {label}
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>

          {/* Qué incluye / qué no incluye */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
            maxWidth: '680px', margin: '0 auto 44px', textAlign: 'left',
          }}>
            {/* Incluye */}
            <div style={{
              background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px',
              border: '1px solid rgba(249,115,22,0.2)',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: C.orange, letterSpacing: '0.1em', marginBottom: '16px' }}>
                ✓ INCLUYE
              </div>
              {[
                'Mensajes 7 días',
                'Precios dinámicos',
                'Coordinación limpieza',
                'Reportes mensuales',
                'Optimización anuncio',
                'Check-in / Check-out',
              ].map(item => (
                <div key={item} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: C.orange }}>✓</span> {item}
                </div>
              ))}
            </div>
            {/* No incluye */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '24px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', marginBottom: '16px' }}>
                ✗ NO INCLUYE
              </div>
              {[
                'Costo de limpieza (pasa al huésped)',
                'Mantenimiento estructural',
                'Suministros (jabón, café, etc.)',
                'Impuestos sobre renta',
              ].map(item => (
                <div key={item} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                  <span>✗</span> {item}
                </div>
              ))}
            </div>
          </div>

          <CTAButton href={WA_LINK} primary>
            <MessageSquare size={17} /> Platica con nosotros — sin costo
          </CTAButton>
        </div>
      </section>

      {/* ── RESEÑAS 5★ ─────────────────────────────────────────────────── */}
      <section style={{ padding: '88px 24px' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <Stars />
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800,
              color: C.navy, lineHeight: 1.25, margin: '16px 0 12px',
            }}>
              Lo que dicen los huéspedes
            </h2>
            <p style={{ fontSize: '16px', color: C.muted, fontStyle: 'italic', margin: 0 }}>
              Reseñas reales de Airbnb — sin filtros, sin editar.
            </p>
            {reviewsState.lastFetchedAt && (
              <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '10px' }}>
                Actualizado el {new Date(reviewsState.lastFetchedAt).toLocaleDateString('es-MX')}
              </p>
            )}
          </div>

          {/* Loading */}
          {reviewsState.isLoading && (
            <div style={{ textAlign: 'center', padding: '60px', color: C.muted }}>
              <RefreshCw
                size={32}
                style={{ animation: 'spin 1s linear infinite', marginBottom: '16px', color: C.orange }}
              />
              <p style={{ fontSize: '15px' }}>Obteniendo reseñas de Airbnb...</p>
            </div>
          )}

          {/* Error */}
          {reviewsState.error && !reviewsState.isLoading && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5',
              borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '24px',
            }}>
              <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: '12px' }}>
                {reviewsState.error}
              </p>
              {currentUser && (
                <button
                  onClick={() => setShowTokenModal(true)}
                  style={{
                    padding: '9px 20px', borderRadius: '10px',
                    background: C.navy, color: 'white', border: 'none',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                  }}
                >
                  Configurar token de sesión
                </button>
              )}
            </div>
          )}

          {/* Empty state */}
          {!isLoadingAny && displayReviews.length === 0 && !reviewsState.error && (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: '#9ca3af' }}>
              <TrendingUp size={52} style={{ marginBottom: '20px', opacity: 0.35, color: C.orange }} />
              <p style={{ fontSize: '17px', fontWeight: 600, color: C.navy, marginBottom: '6px' }}>
                Las reseñas aparecerán aquí
              </p>
              <p style={{ fontSize: '14px', marginBottom: '24px' }}>
                Pronto verás aquí las reseñas 5★ de nuestras propiedades.
              </p>
              {currentUser && (
                <button
                  onClick={handleRefresh}
                  style={{
                    padding: '12px 28px', borderRadius: '12px',
                    background: C.orange, color: 'white', border: 'none',
                    cursor: 'pointer', fontSize: '14px', fontWeight: 700,
                    boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
                  }}
                >
                  Cargar reseñas desde Airbnb
                </button>
              )}
            </div>
          )}

          {/* Reviews grid */}
          {displayReviews.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}>
              {displayReviews.map((review, index) => (
                <ReviewCard key={review.id} review={review} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── COBERTURA GEOGRÁFICA ────────────────────────────────────────── */}
      <section style={{ background: C.navy, padding: '64px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Left: heading */}
            <div style={{ flex: '1 1 280px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.4)',
                borderRadius: '20px', padding: '4px 14px', marginBottom: '16px',
              }}>
                <span style={{ fontSize: '11px', color: C.orange, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Dónde operamos
                </span>
              </div>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(22px, 2.8vw, 34px)', fontWeight: 800,
                color: 'white', lineHeight: 1.25, marginBottom: '12px',
              }}>
                ¿Tu propiedad está aquí?
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
                Operamos principalmente en el estado de Querétaro. Si tu propiedad está en otra ciudad,{' '}
                <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ color: C.orange, textDecoration: 'underline' }}>
                  escríbenos
                </a>
                {' '}— evaluamos cada caso.
              </p>
            </div>

            {/* Right: area chips */}
            <div style={{ flex: '1 1 320px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              {[
                { name: 'Querétaro Centro', emoji: '🏙️', highlight: true },
                { name: 'Corregidora',      emoji: '🏡', highlight: true },
                { name: 'Juriquilla',       emoji: '🌿', highlight: true },
                { name: 'San Juan del Río', emoji: '🏘️', highlight: false },
                { name: '¿Tu zona?',        emoji: '📍', highlight: false, isQuestion: true },
              ].map(({ name, emoji, highlight, isQuestion }) => (
                <div
                  key={name}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 18px', borderRadius: '14px',
                    background: highlight
                      ? 'rgba(249,115,22,0.15)'
                      : isQuestion
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(255,255,255,0.05)',
                    border: highlight
                      ? '1px solid rgba(249,115,22,0.35)'
                      : '1px solid rgba(255,255,255,0.1)',
                    cursor: isQuestion ? 'pointer' : 'default',
                  }}
                  onClick={isQuestion ? () => window.open(WA_LINK, '_blank') : undefined}
                >
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>{emoji}</span>
                  <span style={{
                    fontSize: '13px', fontWeight: highlight ? 700 : 500,
                    color: highlight ? C.orange : isQuestion ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.6)',
                  }}>
                    {name}
                  </span>
                  {isQuestion && (
                    <span style={{ fontSize: '11px', color: C.orange, fontWeight: 700 }}>→</span>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── QUIÉNES SOMOS ──────────────────────────────────────────────── */}
      <section style={{ background: 'white', padding: '88px 24px' }}>
        <div style={{
          maxWidth: '960px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', gap: '60px', alignItems: 'center',
        }}>
          {/* Photo */}
          <div style={{ flex: '0 0 auto' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src="/foto-ricardo-opt.jpg"
                alt="Ricardo Peña — Coanfitriones México"
                style={{
                  width: '280px', height: '280px',
                  borderRadius: '24px', objectFit: 'cover',
                  boxShadow: '0 8px 32px rgba(31,58,95,0.18)',
                  display: 'block',
                }}
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = 'none';
                  const fb = el.nextElementSibling as HTMLElement | null;
                  if (fb) fb.style.display = 'flex';
                }}
              />
              {/* Fallback avatar */}
              <div style={{
                display: 'none', width: '220px', height: '220px',
                borderRadius: '24px', background: `linear-gradient(135deg, ${C.navy}, ${C.sky})`,
                alignItems: 'center', justifyContent: 'center',
                fontSize: '72px', boxShadow: '0 8px 32px rgba(31,58,95,0.18)',
              }}>🏠</div>
              {/* Orange badge */}
              <div style={{
                position: 'absolute', bottom: '-14px', left: '50%',
                transform: 'translateX(-50%)',
                background: C.orange, color: 'white',
                borderRadius: '20px', padding: '6px 18px',
                fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(249,115,22,0.4)',
              }}>
                30+ años en Hotelería
              </div>
            </div>
          </div>

          {/* Text */}
          <div style={{ flex: '1 1 320px', minWidth: '280px' }}>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 800,
              color: C.navy, marginBottom: '20px', lineHeight: 1.25,
            }}>
              Quiénes somos
            </h2>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '16px' }}>
              Somos el equipo detrás de <strong>Hospitalidad Digital</strong>, especializados en la operación profesional de propiedades en Airbnb en Querétaro y Corregidora, Qro.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '24px' }}>
              Combinamos <strong>más de 30 años de experiencia hotelera</strong> con tecnología y automatización para ofrecer un co-anfitrionaje que realmente funciona: más ingresos, menos trabajo para ti.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {[
                { icon: <MapPin size={14} />, label: 'Querétaro y Corregidora, Qro.' },
                { icon: <Star size={14} />,    label: '65% de ocupación promedio' },
                { icon: <TrendingUp size={14} />, label: '4 años en Airbnb' },
              ].map(({ icon, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  background: C.cream, borderRadius: '10px',
                  padding: '8px 14px', fontSize: '12px', fontWeight: 600, color: C.navy,
                  border: '1px solid rgba(249,115,22,0.15)',
                }}>
                  <span style={{ color: C.orange }}>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS DE DUEÑOS ────────────────────────────────────────── */}
      <section style={{ background: 'white', padding: '88px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
              borderRadius: '20px', padding: '5px 16px', marginBottom: '16px',
            }}>
              <span style={{ fontSize: '11px', color: C.orange, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Propietarios
              </span>
            </div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800,
              color: C.navy, lineHeight: 1.25, marginBottom: '12px',
            }}>
              Lo que dicen los dueños
            </h2>
            <p style={{ fontSize: '16px', color: C.muted, lineHeight: 1.75 }}>
              Propietarios que delegaron la operación y ahora solo esperan el depósito.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {([
              {
                name: 'Ana P.',
                ciudad: 'Querétaro Centro, Qro.',
                propiedades: '1 depto.',
                quote: 'La verdad dudé mucho en dejar mi departamento en manos de alguien más. Pero desde el primer mes vi la diferencia. Antes sacaba 60% de ocupación con mucho trabajo. Ahora saco más del 70% sin tocar nada.',
              },
              {
                name: 'Jorge M.',
                ciudad: 'Corregidora, Qro.',
                propiedades: '2 casas',
                quote: 'Tengo dos casas con ellos. El reporte mensual es clarísimo — sé exactamente qué entró, qué se gastó y qué me depositan. Sin sorpresas. Eso para mí vale más que el porcentaje que cobran.',
              },
              {
                name: 'Valeria C.',
                ciudad: 'Juriquilla, Qro.',
                propiedades: '1 casa',
                quote: 'Vivía pegada al celular contestando huéspedes. Era agotador. Desde que Coanfitriones lleva mi propiedad, lo único que hago es revisar el reporte cada mes. Literalmente ingreso pasivo.',
              },
            ] as const).map(({ name, ciudad, propiedades, quote }) => (
              <div
                key={name}
                style={{
                  background: C.cream, borderRadius: '20px', padding: '28px',
                  border: '1px solid rgba(249,115,22,0.1)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  display: 'flex', flexDirection: 'column', gap: '16px',
                }}
              >
                <Stars />
                <blockquote style={{
                  margin: 0, fontSize: '14px', lineHeight: 1.8,
                  color: '#374151', fontStyle: 'italic', fontFamily: 'Georgia, serif', flexGrow: 1,
                }}>
                  "{quote}"
                </blockquote>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: C.navy }}>— {name}</div>
                  <div style={{ fontSize: '11px', color: C.muted, marginTop: '3px' }}>{ciudad} · {propiedades}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '44px' }}>
            <CTAButton href={WA_LINK} primary>
              <MessageSquare size={17} /> Soy propietario — quiero saber más
            </CTAButton>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section style={{ background: C.cream, padding: '88px 24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
              borderRadius: '20px', padding: '5px 16px', marginBottom: '16px',
            }}>
              <span style={{ fontSize: '11px', color: C.orange, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Preguntas frecuentes
              </span>
            </div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 800,
              color: C.navy, lineHeight: 1.2, margin: 0,
            }}>
              Lo que todo dueño pregunta
            </h2>
          </div>
          {([
            {
              q: '¿Cuánto cobran por el co-anfitrionaje?',
              a: 'Cobramos una comisión porcentual sobre los ingresos generados — sin pago fijo mensual, sin costo de inicio. Si tu propiedad no genera, nosotros tampoco cobramos. La tasa exacta la definimos en la llamada inicial según el tipo y ubicación de tu propiedad.',
            },
            {
              q: '¿Pierdo control de mi propiedad?',
              a: 'No. Tú sigues siendo el dueño y tienes visibilidad total en todo momento. Accedes al anuncio, ves las reservas y recibes reportes mensuales claros. Nosotros operamos con tu autorización — no tomamos decisiones importantes sin consultarte.',
            },
            {
              q: '¿Qué necesito para empezar?',
              a: 'Solo necesitas una propiedad amueblada lista para recibir huéspedes. Nos encargamos de optimizar el anuncio, definir precios, coordinar la limpieza y atender a los huéspedes desde el primer día.',
            },
            {
              q: '¿Hay contrato de permanencia?',
              a: 'No hay contratos de largo plazo. Trabajamos mes a mes con un acuerdo claro y por escrito. Si en algún momento decides continuar solo, lo hacemos sin complicaciones.',
            },
            {
              q: '¿También manejan propiedades fuera de Querétaro?',
              a: 'Por ahora operamos principalmente en Querétaro y Corregidora, Qro. Si tu propiedad está en otra ciudad, contáctanos — evaluamos caso por caso.',
            },
          ] as const).map(({ q, a }, i) => (
            <LandingFAQItem key={i} q={q} a={a} />
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(150deg, ${C.navy} 0%, #2a4f82 100%)`,
        padding: '88px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '660px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 800,
            color: 'white', lineHeight: 1.2, marginBottom: '18px',
          }}>
            ¿Tu propiedad lista para generar ingresos este mes?
          </h2>
          <p style={{
            fontSize: '18px', color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.75, marginBottom: '40px',
          }}>
            Sin compromisos. Sin contratos largos.<br />
            Una llamada de 15 minutos para ver si somos el match correcto.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '28px' }}>
            <CTAButton href={WA_LINK} primary>
              <MessageSquare size={17} /> Agendar llamada por WhatsApp
            </CTAButton>
            <CTAButton href={`mailto:${EMAIL}`} primary={false}>
              Escribir por email
            </CTAButton>
          </div>

          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
            Sin comisión por adelantado · Pago solo cuando tu propiedad genera
          </p>
        </div>
      </section>

      {/* ── EXPORT MODULE (admin only) ──────────────────────────────────── */}
      <ExportModule reviews={displayReviews} />

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0f172a', padding: '32px 24px' }}>
        <div style={{
          maxWidth: '960px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', gap: '24px',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src="/logo-coanfitriones.png"
              alt="Coanfitriones México"
              style={{ height: '28px', objectFit: 'contain' }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'white', lineHeight: 1 }}>Coanfitriones</div>
              <div style={{ fontSize: '10px', color: C.orange, fontWeight: 600 }}>México · Hospitalidad Digital</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'WhatsApp', href: WA_LINK },
              { label: 'Email', href: `mailto:${EMAIL}` },
              { label: 'Para anfitriones →', href: '/anfitriones' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}
              >
                {label}
              </a>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} Coanfitriones México
          </div>
        </div>
      </footer>

      {/* ── FLOATING WA BUTTON ───────────────────────────────────────────── */}
      <a
        href={WA_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-fab"
        aria-label="Escríbenos por WhatsApp"
        title="¿Hablamos?"
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          width: '58px', height: '58px', borderRadius: '50%',
          background: '#25D366', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
          textDecoration: 'none',
          animation: 'waPulse 2.8s ease-in-out infinite',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.164 0 0 7.164 0 16c0 2.82.738 5.47 2.03 7.782L0 32l8.407-2.004A15.947 15.947 0 0016 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm0 29.268c-2.652 0-5.12-.72-7.238-1.972l-.518-.306-5.382 1.284 1.31-5.246-.335-.54A13.22 13.22 0 012.733 16C2.733 8.68 8.68 2.733 16 2.733S29.267 8.68 29.267 16c0 7.32-5.947 13.268-13.267 13.268zm7.266-9.936c-.398-.2-2.352-1.162-2.718-1.293-.364-.133-.63-.2-.895.198-.264.4-1.025 1.293-1.257 1.557-.232.264-.464.298-.862.1-.398-.2-1.682-.62-3.203-1.978-1.183-1.057-1.98-2.362-2.213-2.76-.232-.4-.024-.616.175-.815.18-.18.398-.465.598-.697.2-.232.265-.4.397-.665.133-.265.067-.5-.033-.697-.1-.2-.895-2.154-1.226-2.95-.323-.774-.65-.668-.895-.68-.232-.01-.497-.013-.762-.013-.265 0-.696.1-1.06.497-.364.397-1.39 1.36-1.39 3.313 0 1.953 1.424 3.841 1.622 4.106.2.265 2.8 4.274 6.784 5.993.948.41 1.688.655 2.265.838.952.302 1.82.26 2.505.158.764-.114 2.352-.962 2.685-1.892.332-.93.332-1.727.232-1.892-.1-.165-.364-.265-.762-.465z"/>
        </svg>
      </a>

      {/* ── MODALS ─────────────────────────────────────────────────────── */}
      {showTokenModal && <AirbnbTokenModal onClose={() => setShowTokenModal(false)} />}

      {/* Keyframe animations */}
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes waPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(37,211,102,0.45); }
          50%       { box-shadow: 0 4px 28px rgba(37,211,102,0.7), 0 0 0 8px rgba(37,211,102,0.12); }
        }
        .wa-fab { transition: transform 150ms ease-out; }
        .wa-fab:hover { transform: scale(1.1); }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          @keyframes fadeSlideIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes waPulse {
            from { box-shadow: 0 4px 20px rgba(37,211,102,0.45); }
            to   { box-shadow: 0 4px 20px rgba(37,211,102,0.45); }
          }
        }
      `}</style>
    </div>
  );
}
