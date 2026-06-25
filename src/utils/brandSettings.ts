const STORAGE_KEY = 'airbnb_brand_settings';

interface Stored { logoDataUrl?: string }

export function getBrandLogo(): string | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return (JSON.parse(raw) as Stored).logoDataUrl;
  } catch { /* noop */ }
  return undefined;
}

export function saveBrandLogo(dataUrl: string) {
  const existing = getBrandRaw();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, logoDataUrl: dataUrl }));
}

export function clearBrandLogo() {
  const existing = getBrandRaw();
  delete existing.logoDataUrl;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

function getBrandRaw(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Stored;
  } catch { /* noop */ }
  return {};
}
