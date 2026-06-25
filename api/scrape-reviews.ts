import type { VercelRequest, VercelResponse } from '@vercel/node';
import { scrapeOneUrl, toAirbnbReviews } from './_scraping';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { urls } = req.body as { urls?: string[] };

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Se requiere urls: string[]' });
  }

  if (urls.length > 10) {
    return res.status(400).json({ error: 'Máximo 10 URLs por solicitud' });
  }

  try {
    const settled = await Promise.allSettled(urls.map(scrapeOneUrl));

    const results = settled
      .filter(
        (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof scrapeOneUrl>>> =>
          r.status === 'fulfilled',
      )
      .map((r) => r.value);

    const reviews = toAirbnbReviews(results);
    const errors = results
      .filter((r) => r.error)
      .map((r) => ({ url: r.url, error: r.error }));

    return res.status(200).json({
      reviews,
      fetchedAt: new Date().toISOString(),
      count: reviews.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno';
    console.error('[scrape-reviews]', message);
    return res.status(500).json({ error: message, reviews: [] });
  }
}
