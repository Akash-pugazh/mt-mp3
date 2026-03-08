const DEFAULT_UNSPLASH_IMAGE =
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=90&w=1200&h=1200&dpr=2';

export const DEFAULT_ARTWORK_PREVIEW = DEFAULT_UNSPLASH_IMAGE;
export const DEFAULT_ARTWORK_WIDE =
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=90&w=1800&h=1000&dpr=2';

function normalizeMasstamilanImageName(imageName: string): string {
  const trimmed = imageName.trim();
  const withoutExt = trimmed.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  return withoutExt.replace(/-\d+x\d+$/i, '');
}

export function buildMasstamilanArtworkUrl(baseUrl: string, imageName: string | null | undefined): string {
  if (!imageName || !imageName.trim()) return DEFAULT_ARTWORK_PREVIEW;
  const normalized = normalizeMasstamilanImageName(imageName);
  return `${baseUrl}/${encodeURIComponent(normalized)}.jpg`;
}

export function toHighQualityImage(url: string | null | undefined, size: number = 1200): string {
  if (!url || !url.trim()) return DEFAULT_ARTWORK_PREVIEW;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (parsed.hostname.includes('images.unsplash.com')) {
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    parsed.searchParams.set('q', '90');
    parsed.searchParams.set('w', String(size));
    parsed.searchParams.set('h', String(size));
    parsed.searchParams.set('dpr', '2');
    return parsed.toString();
  }

  if (parsed.hostname.includes('masstamilan.dev') && parsed.pathname.startsWith('/i/')) {
    const lastSlash = parsed.pathname.lastIndexOf('/');
    const fileName = parsed.pathname.slice(lastSlash + 1);
    const extMatch = fileName.match(/\.(jpg|jpeg|png|webp)$/i);
    const ext = extMatch?.[0] ?? '.jpg';
    const baseName = fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const normalized = baseName.replace(/-\d+x\d+$/i, '');
    parsed.pathname = `${parsed.pathname.slice(0, lastSlash + 1)}${normalized}${ext}`;
    return parsed.toString();
  }

  return url;
}
