const DEFAULT_UNSPLASH_IMAGE =
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=100&w=1600&h=1600&dpr=3';

export const DEFAULT_ARTWORK_PREVIEW = DEFAULT_UNSPLASH_IMAGE;
export const DEFAULT_ARTWORK_WIDE =
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=100&w=2200&h=1200&dpr=3';

function normalizeMasstamilanImageName(imageName: string): string {
  const trimmed = imageName.trim();
  const withoutExt = trimmed.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  return withoutExt.replace(/-\d+x\d+$/i, '');
}

function toProxyUpscaledImage(url: URL, size: number): string {
  const withoutScheme = url.toString().replace(/^https?:\/\//i, '');
  const targetSize = Math.max(512, Math.min(size, 2600));
  const dpr = targetSize >= 1400 ? 2 : 1;
  const params = new URLSearchParams({
    url: withoutScheme,
    w: String(targetSize),
    h: String(targetSize),
    fit: 'cover',
    q: '100',
    output: 'webp',
    dpr: String(dpr),
  });
  return `https://wsrv.nl/?${params.toString()}`;
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
    parsed.searchParams.set('q', '100');
    parsed.searchParams.set('w', String(size));
    parsed.searchParams.set('h', String(size));
    parsed.searchParams.set('dpr', size >= 1400 ? '3' : '2');
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
    // The native /i/ source is currently 150x150 for many items.
    // Route through an image CDN to upscale and improve visual sharpness.
    return toProxyUpscaledImage(parsed, size);
  }

  return url;
}
