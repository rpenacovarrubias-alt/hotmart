import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { listingId } = req.query;
  const token = req.headers['x-airbnb-token'];

  if (!listingId || !token) {
    return res.status(400).json({ error: 'listingId y x-airbnb-token son requeridos' });
  }

  if (typeof listingId !== 'string' || typeof token !== 'string') {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }

  try {
    const url =
      `https://www.airbnb.com/api/v2/reviews?listing_id=${encodeURIComponent(listingId)}` +
      `&role=guest&_limit=50&_format=for_mobile_client`;

    const airbnbRes = await fetch(url, {
      headers: {
        'X-Airbnb-OAuth-Token': token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      },
    });

    if (!airbnbRes.ok) {
      return res.status(airbnbRes.status).json({ error: `Airbnb returned ${airbnbRes.status}` });
    }

    const data = (await airbnbRes.json()) as { reviews?: unknown[] };
    const fiveStars = (data.reviews || []).filter(
      (r: unknown) => (r as Record<string, unknown>).rating === 5
    );

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json({ reviews: fiveStars });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return res.status(500).json({ error: message });
  }
}
