// Shared scraping utilities — NOT a Vercel endpoint (underscore prefix)

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';

export interface RawReview {
  author: string;
  rating: number;
  date: string;
  text: string;
  propertyName: string;
}

export interface AirbnbReviewPayload {
  id: string;
  listingId: string;
  propertyName: string;
  rating: 5;
  comments: string;
  reviewerName: string;
  createdAt: string;
  language: string;
}

export async function fetchPage(url: string): Promise<string> {
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
  const res = await fetch(fullUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(7000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

export function extractReviewContent(html: string, url: string): string {
  const chunks: string[] = [`URL: ${url}\n`];

  const title =
    html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/)?.[1] ||
    html.match(/<title>([^<]+)<\/title>/)?.[1] ||
    '';
  chunks.push(`TITULO: ${title}\n`);

  // JSON-LD — schema.org Review objects often embedded here
  const jsonLdMatches = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi),
  ];
  for (const m of jsonLdMatches.slice(0, 5)) {
    chunks.push('JSON_LD:\n' + m[1].slice(0, 6000));
  }

  // __NEXT_DATA__ — find review-related segments
  const nextMatch = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (nextMatch) {
    const nextStr = nextMatch[1];
    const lower = nextStr.toLowerCase();
    const reviewIdx = lower.indexOf('"review');
    const commentIdx = lower.indexOf('"comments"');
    const idx = reviewIdx > -1 ? reviewIdx : commentIdx;
    if (idx > -1) {
      chunks.push(
        'NEXT_DATA_REVIEWS:\n' + nextStr.slice(Math.max(0, idx - 200), idx + 10000),
      );
    } else {
      chunks.push('NEXT_DATA_RAW:\n' + nextStr.slice(0, 8000));
    }
  }

  return chunks.join('\n\n').slice(0, 22000);
}

export async function extractReviewsWithClaude(content: string): Promise<RawReview[]> {
  if (!CLAUDE_API_KEY) throw new Error('ANTHROPIC_API_KEY no configurada');

  const prompt = `Eres un extractor de reseñas de anuncios de Airbnb. Analiza el contenido HTML/JSON y extrae:
1. El nombre del anuncio (propertyName)
2. Todas las reseñas visibles de huéspedes reales

Busca en JSON-LD (schema.org Review), __NEXT_DATA__ y texto visible.

Contenido:
${content}

Devuelve SOLO un objeto JSON sin markdown:
{
  "propertyName": "nombre del anuncio extraído del título",
  "reviews": [
    {
      "author": "nombre del huésped o Huésped",
      "rating": 5,
      "date": "fecha si disponible, sino string vacío",
      "text": "texto completo de la reseña en idioma original"
    }
  ]
}

Si no hay reseñas visibles: "reviews": []`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API ${res.status}: ${err.slice(0, 150)}`);
  }

  const data = (await res.json()) as { content: Array<{ text: string }> };
  const text = data.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];

  const parsed = JSON.parse(jsonMatch[0]) as {
    propertyName?: string;
    reviews?: RawReview[];
  };
  const propertyName = parsed.propertyName ?? '';

  return (parsed.reviews ?? [])
    .filter((r) => r.rating === 5 && typeof r.text === 'string' && r.text.length > 20)
    .map((r) => ({ ...r, propertyName }));
}

export async function scrapeOneUrl(url: string): Promise<{
  url: string;
  propertyName: string;
  reviews: RawReview[];
  error?: string;
}> {
  try {
    const html = await fetchPage(url);
    const content = extractReviewContent(html, url);
    const reviews = await extractReviewsWithClaude(content);
    const propertyName = reviews[0]?.propertyName ?? url.split('/').pop() ?? 'Propiedad';
    return { url, propertyName, reviews };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[scrape-reviews]', url, msg);
    return { url, propertyName: '', reviews: [], error: msg };
  }
}

export function toAirbnbReviews(
  results: Array<{ url: string; propertyName: string; reviews: RawReview[] }>,
): AirbnbReviewPayload[] {
  return results.flatMap((r) =>
    r.reviews.map((rv) => ({
      id: crypto.randomUUID(),
      listingId: r.url.split('/').pop() ?? r.url,
      propertyName: rv.propertyName || r.propertyName || 'Propiedad',
      rating: 5 as const,
      comments: rv.text,
      reviewerName: rv.author || 'Huésped',
      createdAt: rv.date || new Date().toISOString(),
      language: 'es',
    })),
  );
}
