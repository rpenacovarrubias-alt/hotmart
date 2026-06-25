import type { AirbnbReview, AirbnbSession } from '../types';

const REVIEWS_CACHE_KEY = 'airbnb_reviews_cache';
const SESSION_KEY = 'airbnb_session';

export function saveSession(token: string): AirbnbSession {
  const session: AirbnbSession = { token, savedAt: new Date().toISOString() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function loadSession(): AirbnbSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AirbnbSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function saveReviewsCache(reviews: AirbnbReview[]): void {
  localStorage.setItem(
    REVIEWS_CACHE_KEY,
    JSON.stringify({ reviews, fetchedAt: new Date().toISOString() })
  );
}

export function loadReviewsCache(): { reviews: AirbnbReview[]; fetchedAt: string } | null {
  const raw = localStorage.getItem(REVIEWS_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function fetchReviewsByUrls(urls: string[]): Promise<AirbnbReview[]> {
  const res = await fetch('/api/scrape-reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls }),
  });
  if (!res.ok) throw new Error(`Error ${res.status} al obtener reseñas`);
  const data = (await res.json()) as { reviews: AirbnbReview[] };
  return data.reviews ?? [];
}

export async function fetchReviewsForListing(
  listingId: string,
  propertyName: string,
  token: string
): Promise<AirbnbReview[]> {
  const res = await fetch(`/api/airbnb-reviews?listingId=${encodeURIComponent(listingId)}`, {
    headers: { 'x-airbnb-token': token },
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status} al obtener reseñas de listing ${listingId}`);
  }

  const data = await res.json() as { reviews: unknown[] };

  return (data.reviews || []).map((r: unknown) => {
    const review = r as Record<string, unknown>;
    return {
      id: String(review.id ?? crypto.randomUUID()),
      listingId,
      propertyName,
      rating: 5 as const,
      comments: String(review.comments ?? ''),
      reviewerName: String((review.reviewer as Record<string, unknown>)?.first_name ?? 'Huésped'),
      createdAt: String(review.created_at ?? new Date().toISOString()),
      language: String(review.language ?? 'es'),
    };
  });
}
