import React, { useState } from 'react';
import { ProductCarousel } from '../components/ProductCarousel';

// ─── Brand ───────────────────────────────────────────────────────────────────
const C = {
  navy:   '#1F3A5F',
  orange: '#F97316',
  sky:    '#4EA8DE',
  cream:  '#FFF8F2',
  muted:  '#6b7280',
  white:  '#ffffff',
} as const;

// ─── Hotmart URLs (reemplazar con URLs reales al publicar) ────────────────────
const HOTMART = {
  SUPERHOST:   'https://pay.hotmart.com/HOTMART_0_SUPERHOST',
  LIMPIEZA:    'https://pay.hotmart.com/HOTMART_LIMPIEZA',
  MENSAJES:    'https://pay.hotmart.com/HOTMART_MENSAJES',
  ANUNCIOS:    'https://pay.hotmart.com/HOTMART_ANUNCIOS',
  SESION_11:   'https://pay.hotmart.com/HOTMART_SESION_11',
  CONSULTORIA: 'https://pay.hotmart.com/HOTMART_CONSULTORIA',
} as const;

const WA        = 'https://wa.me/524421851478?text=Hola%2C%20quiero%20mi%20recurso%20gratis';
const WA_MENTOR = 'https://wa.me/524421851478?text=Hola%2C%20quiero%20info%20sobre%20mentor%C3%ADa';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tier = 'free' | 'course' | 'mentoring';

interface Product {
  id: string;
  name: string;
  description: string;
  type: string;
  emoji: string;
  price: string;
  priceNote?: string;
  image: string;
  tag?: string;
  ctaLabel: string;
  ctaUrl: string;
  bullets?: string[];
}

// ─── Tier color maps ──────────────────────────────────────────────────────────
const TIER_COLORS: Record<Tier, {
  border: string; bg: string; text: string;
  button: string; gradient: string;
  dotInactive: string; sectionBg: string;
  badgeBg: string;
}> = {
  free: {
    border: '#22c55e', bg: '#f0fdf4', text: '#166534',
    button: '#22c55e', gradient: 'linear-gradient(135deg,#15803d,#22c55e)',
    dotInactive: '#bbf7d0', sectionBg: '#f0fdf4',
    badgeBg: '#22c55e',
  },
  course: {
    border: '#f97316', bg: '#fff7ed', text: '#c2410c',
    button: '#f97316', gradient: 'linear-gradient(135deg,#1F3A5F,#2a4f82)',
    dotInactive: '#fed7aa', sectionBg: '#fff7ed',
    badgeBg: '#f97316',
  },
  mentoring: {
    border: '#a855f7', bg: '#faf5ff', text: '#6d28d9',
    button: '#a855f7', gradient: 'linear-gradient(135deg,#6d28d9,#a855f7)',
    dotInactive: '#ddd6fe', sectionBg: '#faf5ff',
    badgeBg: '#a855f7',
  },
};

// ─── Product data ─────────────────────────────────────────────────────────────
const TIER1: Product[] = [
  {
    id: 'kit-limpieza',
    name: 'Kit de Limpieza Profesional',
    description: '40+ productos recomendados · Protocolo por área · Checklist descargable',
    type: 'PDF', emoji: '🧹',
    price: 'GRATIS', image: '/products/portada-1-kit-limpieza.png',
    tag: 'GRATIS', ctaLabel: 'Descargar gratis →', ctaUrl: WA,
  },
  {
    id: 'calculadora',
    name: 'Calculadora de Precio Airbnb',
    description: 'Fórmulas automáticas · Temporadas · Comisiones · Punto de equilibrio',
    type: 'EXCEL', emoji: '💰',
    price: 'GRATIS', image: '/products/portada-2-calculadora.png',
    tag: 'GRATIS', ctaLabel: 'Descargar gratis →', ctaUrl: WA,
  },
  {
    id: 'guia-casa',
    name: 'Guía Profesional de Casa',
    description: 'Plantilla Canva · Español + Inglés · Lista en 30 minutos',
    type: 'CANVA', emoji: '📋',
    price: 'GRATIS', image: '/products/portada-3-guia-casa.png',
    tag: 'GRATIS', ctaLabel: 'Descargar gratis →', ctaUrl: WA,
  },
];

const TIER2: Product[] = [
  {
    id: 'superhost',
    name: 'Airbnb de 0 a Superhost',
    description: '8 módulos · 40+ lecciones · Acceso de por vida · Certificado',
    type: 'CURSO', emoji: '🎓',
    price: '$1,497', priceNote: 'MXN',
    image: '/products/portada-7-superhost.png',
    tag: '⭐ MÁS POPULAR',
    ctaLabel: 'Comprar en Hotmart →', ctaUrl: HOTMART.SUPERHOST,
    bullets: ['8 módulos completos', 'Certificado incluido', 'Acceso de por vida'],
  },
  {
    id: 'limpieza-pro',
    name: 'Curso Limpieza Profesional',
    description: 'Protocolos por área · Checklists · Estándar 5 estrellas',
    type: 'CURSO', emoji: '🧹',
    price: '$697', priceNote: 'MXN',
    image: '/products/portada-6-limpieza-pro.png',
    ctaLabel: 'Comprar en Hotmart →', ctaUrl: HOTMART.LIMPIEZA,
  },
  {
    id: 'mensajes',
    name: 'Automatización de Mensajes',
    description: '50+ plantillas · Flujos automáticos · Check-in, check-out, reseñas',
    type: 'CURSO', emoji: '🤖',
    price: '$397', priceNote: 'MXN',
    image: '/products/portada-4-mensajes.png',
    ctaLabel: 'Comprar en Hotmart →', ctaUrl: HOTMART.MENSAJES,
  },
  {
    id: 'anuncios',
    name: 'Optimización de Anuncios',
    description: 'Título · Descripción · Fotos · SEO de Airbnb',
    type: 'CURSO', emoji: '📸',
    price: '$597', priceNote: 'MXN',
    image: '/products/portada-5-anuncios.png',
    ctaLabel: 'Comprar en Hotmart →', ctaUrl: HOTMART.ANUNCIOS,
  },
];

const TIER3: Product[] = [
  {
    id: 'sesion-11',
    name: 'Sesión 1:1 con Ricardo',
    description: '1 hora · Análisis de tu anuncio · Plan personalizado 30 días',
    type: '1:1', emoji: '🎯',
    price: '$2,997', priceNote: 'MXN',
    image: '/products/portada-8-sesion-1-1.png',
    ctaLabel: 'Agendar sesión →', ctaUrl: HOTMART.SESION_11,
  },
  {
    id: 'consultoria',
    name: 'Consultoría Completa',
    description: 'Auditoría + Implementación + 3 meses de soporte directo',
    type: 'MENTORÍA', emoji: '🏆',
    price: '$5,997', priceNote: 'MXN',
    image: '/products/portada-9-consultoria.png',
    ctaLabel: 'Reservar lugar →', ctaUrl: HOTMART.CONSULTORIA,
  },
];

// ─── Pain points ──────────────────────────────────────────────────────────────
const PAIN_POINTS = [
  { emoji: '📉', text: 'Pocas reservas aunque mi propiedad se ve bien' },
  { emoji: '⭐', text: 'Las reseñas no llegan o no mejoran' },
  { emoji: '💬', text: 'Paso horas en mensajes con huéspedes' },
  { emoji: '💸', text: 'No sé cómo fijar el precio correcto' },
  { emoji: '🔍', text: 'Mi anuncio no aparece en los primeros resultados' },
  { emoji: '🧹', text: 'La limpieza me cuesta tiempo y problemas' },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIOS = [
  { name: 'Mariana G.', city: 'Querétaro', text: 'Con el kit de limpieza profesional mis reseñas subieron de 4.6 a 4.9 en solo dos meses. No lo podía creer.' },
  { name: 'Carlos M.', city: 'San Miguel de Allende', text: 'El curso de 0 a Superhost me dio el sistema que necesitaba. Logré Superhost en mi primera temporada.' },
  { name: 'Patricia L.', city: 'Querétaro', text: 'La calculadora de precios me ayudó a subir mis tarifas 30% sin perder ocupación. Increíble herramienta.' },
  { name: 'Roberto T.', city: 'Guadalajara', text: 'Las plantillas de mensajes automáticos me ahorran 2 horas diarias. Ya no vivo pegado al teléfono.' },
  { name: 'Sofía R.', city: 'Ciudad de México', text: 'La mentoría con Ricardo fue un antes y después. Identifiqué problemas que no veía en mi propio anuncio.' },
  { name: 'Alejandro V.', city: 'Monterrey', text: 'Pensé que ya lo sabía todo de Airbnb. El curso de optimización de anuncios me demostró que no.' },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: '¿Necesito experiencia previa para los cursos?', a: 'No. Los cursos están diseñados para anfitriones en cualquier etapa. "0 a Superhost" empieza desde cero con una secuencia lógica de aprendizaje.' },
  { q: '¿Cuánto tarda en llegar el acceso a Hotmart?', a: 'El acceso es inmediato después del pago. Recibirás un correo con tus credenciales en menos de 5 minutos.' },
  { q: '¿Los recursos gratuitos tienen algún costo oculto?', a: 'Cero. Solo nos escribes por WhatsApp y te enviamos el link directo. Sin tarjeta de crédito.' },
  { q: '¿Puedo tomar la mentoría sin haber hecho los cursos?', a: 'Sí. La sesión 1:1 se adapta exactamente a tu situación actual, sea nueva propiedad o propiedad activa que quieres optimizar.' },
  { q: '¿En qué ciudades aplica lo que enseñan?', a: 'Los principios aplican para cualquier ciudad de México. La experiencia de Ricardo es en Querétaro con 5+ años en Airbnb.' },
  { q: '¿Hay garantía de devolución?', a: 'Sí. Hotmart ofrece garantía de 7 días en todos los productos digitales. Si no estás satisfecho, Hotmart te reembolsa sin preguntas.' },
];

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ product, tier }: { product: Product; tier: Tier }) {
  const tc = TIER_COLORS[tier];
  const isFree = tier === 'free';

  return (
    <div
      style={{
        border: `2px solid ${tc.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: `0 4px 20px ${tc.border}22`,
        position: 'relative',
      }}
    >
      {/* Badge */}
      {product.tag && (
        <div style={{
          position: 'absolute', top: 0, right: 0, zIndex: 2,
          background: tc.badgeBg, color: 'white',
          fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
          padding: '4px 10px', borderRadius: '0 14px 0 8px',
        }}>
          {product.tag}
        </div>
      )}

      {/* Header image with gradient fallback */}
      <div style={{
        height: 150,
        background: `url(${product.image}) center/cover no-repeat, ${tc.gradient}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }} />

      {/* Body */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
          {product.emoji} {product.type}
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, lineHeight: 1.3, marginBottom: 6 }}>
          {product.name}
        </div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 10, flex: 1 }}>
          {product.description}
        </div>
        {product.bullets && (
          <ul style={{ margin: '0 0 10px', padding: 0, listStyle: 'none' }}>
            {product.bullets.map(b => (
              <li key={b} style={{ fontSize: 11, color: C.navy, fontWeight: 600, marginBottom: 3 }}>✓ {b}</li>
            ))}
          </ul>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
          <span style={{ fontSize: isFree ? 16 : 22, fontWeight: 800, color: tc.text }}>
            {product.price}
          </span>
          {product.priceNote && (
            <span style={{ fontSize: 11, color: C.muted }}>{product.priceNote}</span>
          )}
        </div>
        <a
          href={product.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', textAlign: 'center',
            background: tc.button, color: 'white',
            padding: '10px 12px', borderRadius: 8,
            fontSize: 12, fontWeight: 700, textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          {product.ctaLabel}
        </a>
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function AnfitrionesCursosPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif", background: C.cream, minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: C.white, borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 24px',
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, background: C.navy, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 18 }}>🏠</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, lineHeight: 1 }}>Hospitalidad Digital</div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 500 }}>Para anfitriones Airbnb</div>
            </div>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <a href="#gratis"   style={{ fontSize: 13, color: '#22c55e', fontWeight: 700, textDecoration: 'none' }}>Gratis</a>
            <a href="#cursos"   style={{ fontSize: 13, color: C.orange,  fontWeight: 700, textDecoration: 'none' }}>Cursos</a>
            <a href="#mentoria" style={{ fontSize: 13, color: '#a855f7', fontWeight: 700, textDecoration: 'none' }}>Mentoría</a>
            <a
              href={WA}
              target="_blank" rel="noopener noreferrer"
              style={{
                background: '#25D366', color: 'white',
                padding: '8px 16px', borderRadius: 8,
                fontSize: 12, fontWeight: 700, textDecoration: 'none',
              }}
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #1F3A5F 0%, #2a4f82 50%, #1a3558 100%)',
        padding: '80px 24px 64px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.4)',
            borderRadius: 20, padding: '6px 16px',
            fontSize: 12, fontWeight: 700, color: C.orange,
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20,
          }}>
            🏠 Cursos y Mentoría para Anfitriones de Airbnb
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900,
            color: 'white', lineHeight: 1.15, marginBottom: 20,
          }}>
            De anfitrión a{' '}
            <span style={{ color: C.orange }}>Superhost</span>
            {' '}con las herramientas correctas
          </h1>
          <p style={{
            fontSize: 18, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7,
            maxWidth: 580, margin: '0 auto 36px',
          }}>
            Recursos gratuitos, cursos prácticos y mentoría 1:1 para multiplicar tus reservas y valoraciones.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { href: '#gratis',   bg: '#22c55e', label: '🎁 Empieza gratis' },
              { href: '#cursos',   bg: C.orange,  label: '📚 Ver cursos' },
              { href: '#mentoria', bg: '#9333ea',  label: '🧠 Mentoría 1:1' },
            ].map(btn => (
              <a
                key={btn.href}
                href={btn.href}
                style={{
                  background: btn.bg, color: 'white',
                  padding: '12px 24px', borderRadius: 8,
                  fontWeight: 700, fontSize: 14, textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {btn.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section style={{ background: C.white, padding: '56px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            ¿TE IDENTIFICAS?
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 800, color: C.navy, marginBottom: 36 }}>
            Los problemas más comunes de los anfitriones
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {PAIN_POINTS.map(pp => (
              <div
                key={pp.text}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: '#fafafa', border: '1px solid #e5e7eb',
                  borderRadius: 12, padding: '14px 18px',
                }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{pp.emoji}</span>
                <span style={{ fontSize: 14, color: '#374151', fontWeight: 500, lineHeight: 1.4 }}>{pp.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE LADDER ── */}
      <section style={{ background: C.cream, padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            TU CAMINO
          </p>
          <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 800, color: C.navy, marginBottom: 32 }}>
            La escalera hacia Superhost
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 0 }}>
            {[
              { href: '#gratis',   emoji: '🎁', label: 'GRATIS',   sub: 'Descarga recursos',        price: '$0',              color: '#22c55e', bg: '#dcfce7' },
              { href: '#cursos',   emoji: '📚', label: 'CURSOS',   sub: 'Aprende y aplica',          price: '$397 – $1,497',   color: '#f97316', bg: '#fed7aa' },
              { href: '#mentoria', emoji: '🧠', label: 'MENTORÍA', sub: 'Resultados garantizados',   price: '$2,997 – $5,997', color: '#a855f7', bg: '#ddd6fe' },
            ].map((step, i, arr) => (
              <React.Fragment key={step.href}>
                <a href={step.href} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      background: step.bg, borderRadius: 12, padding: '24px 16px',
                      border: `2px solid ${step.color}30`,
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)')}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{step.emoji}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: step.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{step.label}</div>
                    <div style={{ fontSize: 13, color: '#4b5563', marginBottom: 8 }}>{step.sub}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: step.color }}>{step.price}</div>
                  </div>
                </a>
                {i < arr.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: C.muted }}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIER 1: GRATIS ── */}
      <section id="gratis" style={{ background: TIER_COLORS.free.sectionBg, padding: '64px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#22c55e', color: 'white',
              borderRadius: 24, padding: '6px 20px',
              fontSize: 13, fontWeight: 800, marginBottom: 16,
            }}>
              🎁 NIVEL 1 — COMPLETAMENTE GRATIS
            </span>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: '#166534', marginBottom: 12 }}>
              Empieza con recursos gratuitos
            </h2>
            <p style={{ color: '#4b7c5a', maxWidth: 520, margin: '0 auto', lineHeight: 1.7, fontSize: 15 }}>
              Sin tarjeta de crédito. Descarga y aplica hoy mismo.
            </p>
          </div>
        </div>
        <ProductCarousel
          tierColor={TIER_COLORS.free.border}
          dotInactiveColor={TIER_COLORS.free.dotInactive}
          slides={TIER1.map(p => ({
            key: p.id,
            node: <ProductCard product={p} tier="free" />,
          }))}
        />
      </section>

      {/* ── TIER 2: CURSOS ── */}
      <section id="cursos" style={{ background: TIER_COLORS.course.sectionBg, padding: '64px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: 'white',
              borderRadius: 24, padding: '6px 20px',
              fontSize: 13, fontWeight: 800, marginBottom: 16,
            }}>
              📚 NIVEL 2 — CURSOS & HERRAMIENTAS
            </span>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: '#c2410c', marginBottom: 12 }}>
              Aprende, aplica y multiplica tus reservas
            </h2>
            <p style={{ color: '#9a3412', maxWidth: 520, margin: '0 auto', lineHeight: 1.7, fontSize: 15 }}>
              Cursos en video · Acceso de por vida · Compra directo en Hotmart — acceso inmediato.
            </p>
          </div>
        </div>
        <ProductCarousel
          tierColor={TIER_COLORS.course.border}
          dotInactiveColor={TIER_COLORS.course.dotInactive}
          slides={TIER2.map(p => ({
            key: p.id,
            node: <ProductCard product={p} tier="course" />,
          }))}
        />
      </section>

      {/* ── TIER 3: MENTORÍA ── */}
      <section id="mentoria" style={{ background: TIER_COLORS.mentoring.sectionBg, padding: '64px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: 'white',
              borderRadius: 24, padding: '6px 20px',
              fontSize: 13, fontWeight: 800, marginBottom: 16,
            }}>
              🧠 NIVEL 3 — MENTORÍA & CONSULTORÍA
            </span>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: '#6d28d9', marginBottom: 12 }}>
              Resultados con guía personalizada de Ricardo
            </h2>
            <p style={{ color: '#5b21b6', maxWidth: 520, margin: '0 auto', lineHeight: 1.7, fontSize: 15 }}>
              Atención 1:1 · Plan a tu medida · Soporte directo de quien ya lo logró.
            </p>
          </div>
        </div>
        <ProductCarousel
          tierColor={TIER_COLORS.mentoring.border}
          dotInactiveColor={TIER_COLORS.mentoring.dotInactive}
          slides={TIER3.map(p => ({
            key: p.id,
            node: <ProductCard product={p} tier="mentoring" />,
          }))}
        />
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <div style={{
            display: 'inline-block', background: 'white', borderRadius: 12,
            padding: '16px 24px', border: '1px solid #ddd6fe', marginTop: 8,
          }}>
            <p style={{ color: '#6d28d9', fontWeight: 600, fontSize: 14, margin: 0 }}>
              ¿Dudas antes de decidir?{' '}
              <a href={WA_MENTOR} target="_blank" rel="noopener noreferrer" style={{ color: '#a855f7', fontWeight: 700 }}>
                Escríbeme por WhatsApp →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section style={{ background: C.white, padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            LO QUE DICEN LOS ANFITRIONES
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 800, color: C.navy, marginBottom: 40 }}>
            Resultados reales de anfitriones como tú
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {TESTIMONIOS.map(t => (
              <div
                key={t.name}
                style={{
                  background: C.cream, border: '1px solid #e5e7eb',
                  borderRadius: 14, padding: '20px 22px',
                }}
              >
                <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                  {['★','★','★','★','★'].map((s, i) => (
                    <span key={i} style={{ color: '#f59e0b', fontSize: 16 }}>{s}</span>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 14, fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `linear-gradient(135deg,${C.navy},${C.sky})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: 14, flexShrink: 0,
                  }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.navy }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUIÉN ES RICARDO ── */}
      <section style={{ background: C.navy, padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg,#4EA8DE,#1F3A5F)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 20px', border: '3px solid rgba(255,255,255,0.2)',
          }}>
            🏠
          </div>
          <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 800, color: 'white', marginBottom: 16 }}>
            Hola, soy Ricardo Peña
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 1.8, marginBottom: 24 }}>
            Anfitrión Airbnb con más de 5 años de experiencia en Querétaro. He pasado de no tener reservas a mantener ocupación del 90%+ y el estatus Superhost de forma consistente. Creé estos recursos y cursos para que no tengas que aprender por ensayo y error como yo.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {[
              { label: '5+', sub: 'años en Airbnb' },
              { label: '90%+', sub: 'ocupación promedio' },
              { label: '4.9★', sub: 'valoración media' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.orange }}>{stat.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: C.cream, padding: '64px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 800, color: C.navy, marginBottom: 36 }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: 'white', borderRadius: 12,
                  border: `1px solid ${openFaq === i ? C.orange : '#e5e7eb'}`,
                  overflow: 'hidden', transition: 'border-color 0.2s',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '16px 20px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.navy, lineHeight: 1.4 }}>{faq.q}</span>
                  <span style={{
                    fontSize: 20, color: C.orange, flexShrink: 0, marginLeft: 12,
                    display: 'inline-block',
                    transform: openFaq === i ? 'rotate(45deg)' : 'none',
                    transition: 'transform 0.25s',
                  }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 16px', fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        background: 'linear-gradient(135deg,#1F3A5F,#2a4f82)',
        padding: '80px 24px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🏆</div>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 900,
            color: 'white', marginBottom: 16, lineHeight: 1.2,
          }}>
            Tu camino a Superhost{' '}
            <span style={{ color: C.orange }}>empieza hoy</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 17, lineHeight: 1.7, marginBottom: 36 }}>
            Más de 50 anfitriones en México ya lo lograron. Empieza con los recursos gratuitos o da el salto con un curso.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#gratis"
              style={{
                background: '#22c55e', color: 'white',
                padding: '14px 28px', borderRadius: 10,
                fontWeight: 800, fontSize: 15, textDecoration: 'none',
              }}
            >
              🎁 Empieza gratis
            </a>
            <a
              href={WA_MENTOR}
              target="_blank" rel="noopener noreferrer"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '2px solid rgba(255,255,255,0.35)',
                color: 'white', padding: '14px 28px', borderRadius: 10,
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
              }}
            >
              💬 Hablar con Ricardo
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f1f38', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>🏠</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 6 }}>Hospitalidad Digital</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>
            rp@coanfitrionesmexico.com.mx
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
            <a href="#gratis"   style={{ fontSize: 13, color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>Recursos gratis</a>
            <a href="#cursos"   style={{ fontSize: 13, color: C.orange,  textDecoration: 'none', fontWeight: 600 }}>Cursos</a>
            <a href="#mentoria" style={{ fontSize: 13, color: '#a855f7', textDecoration: 'none', fontWeight: 600 }}>Mentoría</a>
            <a href="/landing"  style={{ fontSize: 13, color: C.sky,     textDecoration: 'none', fontWeight: 600 }}>¿Quieres co-anfitrión?</a>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} Hospitalidad Digital · Todos los derechos reservados
          </div>
        </div>
      </footer>

      {/* ── FLOATING WA ── */}
      <a
        href={WA}
        target="_blank" rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          width: 56, height: 56, borderRadius: '50%',
          background: '#25D366', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, boxShadow: '0 4px 20px rgba(37,211,102,0.5)',
          textDecoration: 'none', transition: 'transform 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        💬
      </a>

    </div>
  );
}
