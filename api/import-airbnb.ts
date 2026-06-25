import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLAUDE_API_KEY  = process.env.ANTHROPIC_API_KEY ?? '';
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN  ?? '';

// ── URL normalizer ────────────────────────────────────────────────────────────
// /hosting/listings/editor/{id}/details  →  /rooms/{id}
function normalizeAirbnbUrl(url: string): { publicUrl: string; listingId: string | null } {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/hosting\/listings\/(?:editor\/)?(\d+)/);
    if (match) {
      const listingId = match[1];
      return { publicUrl: `${u.protocol}//${u.host}/rooms/${listingId}`, listingId };
    }
    const roomsMatch = u.pathname.match(/\/rooms\/(\d+)/);
    return { publicUrl: url, listingId: roomsMatch?.[1] ?? null };
  } catch {
    return { publicUrl: url, listingId: null };
  }
}

// ── Method 1: Airbnb internal JSON API ───────────────────────────────────────
// Often bypasses Cloudflare because it's an API endpoint, not HTML
async function tryAirbnbJsonApi(listingId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.airbnb.mx/api/v2/pdp_listing_details/${listingId}?_format=for_rooms_show&key=d306zoyjsyarp7ifhu67rjxn&currency=MXN&locale=es`,
      {
        headers: {
          'User-Agent': 'Airbnb/21.46.0 (com.airbnb.android)',
          Accept: 'application/json',
          'X-Airbnb-API-Key': 'd306zoyjsyarp7ifhu67rjxn',
        },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('json')) return null;
    const data = await res.json();
    return 'AIRBNB_API_V2_JSON:\n' + JSON.stringify(data, null, 2).slice(0, 25000);
  } catch {
    return null;
  }
}

// ── Method 2: Direct HTML fetch ───────────────────────────────────────────────
// May be blocked by Cloudflare from cloud IPs — returns null if blocked
async function tryDirectHtmlFetch(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Detect Cloudflare challenge or login wall (no actual listing data)
    const isBlocked =
      !html.includes('__NEXT_DATA__') &&
      (html.includes('Just a moment') ||
        html.includes('cf-browser-verification') ||
        html.includes('/login?') ||
        (html.includes('redirectUrl') && !html.includes('listingTitle')));
    return isBlocked ? null : html;
  } catch {
    return null;
  }
}

// ── Method 3: Apify RAG web browser ──────────────────────────────────────────
// Uses residential proxies — bypasses Cloudflare reliably
// Requires APIFY_API_TOKEN env var in Vercel
async function fetchViaApify(url: string): Promise<string> {
  if (!APIFY_API_TOKEN) {
    throw new Error(
      'Airbnb está bloqueando el acceso desde el servidor (Cloudflare). ' +
        'Para habilitar la importación automática, agrega APIFY_API_TOKEN en ' +
        'Vercel → Project → Settings → Environment Variables. ' +
        'Obtén tu token gratis en console.apify.com.',
    );
  }

  const res = await fetch(
    `https://api.apify.com/v2/acts/apify~rag-web-browser/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}&timeout=45&memory=512`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startUrls: [{ url }],
        maxResults: 1,
        outputFormats: ['markdown'],
      }),
      signal: AbortSignal.timeout(52000),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Apify error ${res.status}: ${err.slice(0, 200)}`);
  }

  const items = await res.json() as Array<{
    markdown?: string;
    text?: string;
    title?: string;
    url?: string;
  }>;
  if (!items?.length) throw new Error('Apify no devolvió contenido para esta URL');

  const item = items[0];
  return `URL: ${item.url ?? url}\nTITULO: ${item.title ?? ''}\n\n${item.markdown ?? item.text ?? ''}`;
}

// ── Extract useful content from HTML ──────────────────────────────────────────
function extractContent(html: string, originalUrl: string): string {
  const chunks: string[] = [`URL: ${originalUrl}\n`];

  const og = (prop: string) =>
    html.match(new RegExp(`<meta[^>]+property="${prop}"[^>]+content="([^"]+)"`))?.[1] ??
    html.match(new RegExp(`<meta[^>]+content="([^"]+)"[^>]+property="${prop}"`))?.[1] ??
    '';

  const title  = og('og:title') || html.match(/<title>([^<]+)<\/title>/)?.[1] || '';
  const ogDesc = og('og:description');
  chunks.push(`TITULO: ${title}\nDESCRIPCION_OG: ${ogDesc}\n`);

  const nextMatch = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (nextMatch) {
    try {
      const nd = JSON.parse(nextMatch[1]);
      const listing =
        nd?.props?.pageProps?.listing ??
        nd?.props?.pageProps?.listingInfo ??
        nd?.props?.pageProps?.listingInfo?.listing ??
        nd?.props?.pageProps?.bootstrapData?.reduxData?.homePDP?.listingInfo?.listing ??
        nd?.props?.pageProps?.pdpSections ??
        nd?.props?.pageProps?.sections ??
        null;
      if (listing) {
        chunks.push('LISTING_JSON:\n' + JSON.stringify(listing, null, 2).slice(0, 12000));
      } else {
        chunks.push(
          'NEXT_DATA_RAW:\n' +
            JSON.stringify(nd?.props?.pageProps ?? nd, null, 2).slice(0, 12000),
        );
      }
    } catch {
      chunks.push('NEXT_DATA_RAW:\n' + nextMatch[1].slice(0, 10000));
    }
  }

  const jsonLdMatches = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi),
  ];
  for (const m of jsonLdMatches.slice(0, 3)) {
    chunks.push('JSON_LD:\n' + m[1].slice(0, 3000));
  }

  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .slice(0, 8000);
  chunks.push('TEXTO_PAGINA:\n' + stripped);

  return chunks.join('\n\n').slice(0, 28000);
}

// ── Claude extraction ─────────────────────────────────────────────────────────
async function extractWithClaude(
  content: string,
  originalUrl: string,
): Promise<Record<string, unknown>> {
  const prompt = `Eres un extractor de datos de anuncios de Airbnb. Lee el contenido del anuncio y devuelve ÚNICAMENTE un objeto JSON válido con los campos indicados. Si un campo no está disponible en el anuncio, usa el valor por defecto indicado. No incluyas markdown, texto adicional ni explicaciones.

Contenido del anuncio:
${content}

Devuelve SOLO este JSON (todos los campos, exactamente con estos nombres):
{
  "propertyName": "nombre del anuncio",
  "propertyType": "tipo (ej: Alojamiento Entero · Casa, Habitación Privada, etc.)",
  "airbnbCustomLink": "${originalUrl}",
  "address": "ciudad y dirección si está disponible, sino null",
  "description": "descripción completa del anuncio",
  "bedrooms": 1,
  "beds": 1,
  "bathrooms": 1,
  "maxGuests": 2,
  "priceMin": null,
  "priceMax": null,
  "checkinStart": "hora de check-in si la hay, ej: 3:00 p.m.",
  "checkinEnd": "hora límite de check-in si la hay",
  "checkoutTime": "hora de check-out si la hay, ej: 12:00 p.m.",
  "checkinMethod": "método de acceso si se menciona (caja de llaves, anfitrión, etc.)",
  "directions": "",
  "mapsUrl": "",
  "wifiNetwork": "",
  "wifiPassword": "",
  "tvNotes": "",
  "boilerNotes": "",
  "garbageNotes": "",
  "houseManualExtra": "",
  "amenities": ["lista completa de amenidades y servicios"],
  "petsAllowed": false,
  "eventsAllowed": false,
  "smokingAllowed": false,
  "silenceHours": "",
  "additionalRules": "texto de las reglas de la casa extraído del anuncio",
  "coMonoxideDetector": false,
  "smokeAlarm": false,
  "securityCamera": false,
  "safetyNotes": "",
  "checkoutInstructions": [],
  "hostName": "nombre del anfitrión si se menciona",
  "hostPhone": "",
  "emergencyPhone": "911",
  "cancellationPolicy": "política de cancelación mencionada",
  "coverPhoto": "URL de la foto principal del listing — busca en og:image, en LISTING_JSON como photos[0].large o pictureUrl o picture_urls[0], o en AIRBNB_API_V2_JSON como listing.photos[0].large. Devuelve string vacío si no encuentras.",
  "photos": ["array con hasta 5 URLs de fotos del listing — busca en LISTING_JSON photos[].large, picture_urls[], o AIRBNB_API_V2_JSON listing.photos[].large. Solo URLs que empiecen con http. Devuelve array vacío si no encuentras."]
}`;

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
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as { content: Array<{ text: string }> };
  const text = data.content[0].text.trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude no devolvió JSON válido');

  return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { url } = (req.body ?? {}) as { url?: string };

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Parámetro "url" requerido' });
  }

  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  try { new URL(normalizedUrl); } catch {
    return res.status(400).json({ error: `URL inválida: ${url}` });
  }
  if (!normalizedUrl.includes('airbnb')) {
    return res.status(400).json({ error: 'Solo se aceptan URLs de Airbnb' });
  }
  if (!CLAUDE_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY no configurada en Vercel' });
  }

  const { publicUrl, listingId } = normalizeAirbnbUrl(normalizedUrl);
  console.log('[import-airbnb] original:', normalizedUrl, '→ public:', publicUrl, 'id:', listingId);

  try {
    let content: string | null = null;

    // Method 1: Airbnb internal JSON API (fastest, no proxy needed)
    if (listingId) {
      const apiData = await tryAirbnbJsonApi(listingId);
      if (apiData) {
        content = `URL: ${publicUrl}\n\n${apiData}`;
        console.log('[import-airbnb] ✓ Method 1 (Airbnb API v2)');
      }
    }

    // Method 2: Direct HTML scrape (may work from some IPs)
    if (!content) {
      const html = await tryDirectHtmlFetch(publicUrl);
      if (html) {
        content = extractContent(html, publicUrl);
        console.log('[import-airbnb] ✓ Method 2 (direct HTML)');
      }
    }

    // Method 3: Apify (residential proxy, always works, requires APIFY_API_TOKEN)
    if (!content) {
      content = await fetchViaApify(publicUrl);
      console.log('[import-airbnb] ✓ Method 3 (Apify)');
    }

    const guide = await extractWithClaude(content, publicUrl);
    return res.status(200).json({ success: true, guide });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[import-airbnb]', msg);
    return res.status(500).json({ error: msg });
  }
}
