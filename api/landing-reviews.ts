import type { VercelRequest, VercelResponse } from '@vercel/node';
import { scrapeOneUrl, toAirbnbReviews } from './_scraping';

const LISTING_URLS = [
  'https://www.airbnb.mx/h/lukahomes-pyramid',
  'https://www.airbnb.mx/h/casalapuertaazul',
  'https://www.airbnb.mx/h/casanapolesii',
  'https://www.airbnb.mx/h/casagrandepuertareal',
  'https://www.airbnb.mx/h/magiaydescanso',
  'https://www.airbnb.mx/h/quintadelbosqueelpueblito',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CDN edge cache for 24h, serve stale up to 1h while revalidating
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');

  try {
    const settled = await Promise.allSettled(LISTING_URLS.map(scrapeOneUrl));

    const results = settled
      .filter(
        (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof scrapeOneUrl>>> =>
          r.status === 'fulfilled',
      )
      .map((r) => r.value);

    const reviews = toAirbnbReviews(results);

    return res.status(200).json({
      reviews,
      fetchedAt: new Date().toISOString(),
      count: reviews.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno';
    console.error('[landing-reviews]', message);
    return res.status(500).json({ error: message, reviews: [] });
  }
}
