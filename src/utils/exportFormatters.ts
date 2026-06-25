import type { AirbnbReview } from '../types';

export type ExportPlatform = 'facebook' | 'instagram' | 'google' | 'tiktok' | 'hotmart' | 'web';

export function formatForPlatform(reviews: AirbnbReview[], platform: ExportPlatform): string {
  const count = reviews.length;
  const header = `⭐⭐⭐⭐⭐ ${count} RESEÑAS REALES DE NUESTROS HUÉSPEDES\n`;

  switch (platform) {
    case 'facebook':
      return (
        header +
        `📣 Coanfitriones México — Hospitalidad Digital\n\n` +
        reviews
          .slice(0, 5)
          .map(r => `"${r.comments}"\n— ${r.reviewerName}`)
          .join('\n\n') +
        `\n\n🏠 ¿Tu propiedad en Airbnb? Nosotros la gestionamos.\n` +
        `📍 Querétaro y Corregidora, Qro.\n` +
        `📱 wa.me/524421851478\n` +
        `🌐 coanfitrionesmexico.com.mx`
      );

    case 'google':
      return (
        header +
        `Coanfitriones México — Co-anfitrionaje profesional en Querétaro\n\n` +
        reviews
          .slice(0, 3)
          .map(r => `★★★★★ "${r.comments}" — ${r.reviewerName}`)
          .join('\n\n') +
        `\n\nContáctanos: rp@coanfitrionesmexico.com.mx | WhatsApp: 4421851478\n` +
        `Zona de cobertura: Querétaro y Corregidora, Qro.`
      );

    case 'hotmart':
      return (
        `## Testimoniales de nuestros co-anfitrionados\n\n` +
        reviews
          .map(
            r =>
              `> ⭐⭐⭐⭐⭐ "${r.comments}"\n>\n> **— ${r.reviewerName}** | Huésped verificado en Airbnb`
          )
          .join('\n\n')
      );

    case 'web':
      return (
        `<!-- Testimoniales Coanfitriones México -->\n` +
        reviews
          .map(
            r =>
              `<blockquote>\n  <p>"${r.comments}"</p>\n  <cite>— ${r.reviewerName} ⭐⭐⭐⭐⭐</cite>\n</blockquote>`
          )
          .join('\n')
      );

    case 'instagram':
    case 'tiktok':
      return (
        `⭐⭐⭐⭐⭐ OPINIÓN REAL\n\n` +
        `"${reviews[0]?.comments ?? ''}"\n\n` +
        `— ${reviews[0]?.reviewerName ?? 'Huésped verificado'}\n\n` +
        `🏠 Coanfitriones México\n` +
        `💼 Gestionamos tu propiedad en Airbnb\n` +
        `📍 Querétaro y Corregidora, Qro.\n` +
        `📱 wa.me/524421851478\n` +
        `#CoanfitrionesMexico #Airbnb #Querétaro #Corregidora #RentaVacacional #CoHost #HospitalidadDigital`
      );
  }
}
