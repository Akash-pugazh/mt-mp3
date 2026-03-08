const IMAGE_CACHE_NAME = "mt-mp3-image-cache-v1";
const MAX_MEMORY_OBJECT_URLS = 220;

const objectUrlBySrc = new Map<string, string>();
const inFlightBySrc = new Map<string, Promise<string>>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function touchEntry(src: string, objectUrl: string) {
  if (objectUrlBySrc.has(src)) {
    objectUrlBySrc.delete(src);
  }
  objectUrlBySrc.set(src, objectUrl);

  if (objectUrlBySrc.size <= MAX_MEMORY_OBJECT_URLS) return;
  const oldest = objectUrlBySrc.entries().next().value as [string, string] | undefined;
  if (!oldest) return;
  objectUrlBySrc.delete(oldest[0]);
  URL.revokeObjectURL(oldest[1]);
}

async function responseToObjectUrl(response: Response): Promise<string> {
  const blob = await response.blob();
  if (!blob || blob.size <= 0) throw new Error("Empty image blob");
  return URL.createObjectURL(blob);
}

async function readFromCache(src: string): Promise<string | null> {
  if (!isBrowser() || !("caches" in window)) return null;
  try {
    const cache = await window.caches.open(IMAGE_CACHE_NAME);
    const matched = await cache.match(src);
    if (!matched) return null;
    return await responseToObjectUrl(matched);
  } catch {
    return null;
  }
}

async function fetchAndStore(src: string): Promise<string> {
  const res = await fetch(src, { cache: "force-cache", mode: "cors" });
  if (!res.ok) throw new Error(`Failed image fetch: ${res.status}`);

  if (isBrowser() && "caches" in window) {
    try {
      const cache = await window.caches.open(IMAGE_CACHE_NAME);
      await cache.put(src, res.clone());
    } catch {
      // Ignore cache write failures and still render the image.
    }
  }

  return await responseToObjectUrl(res);
}

export async function getCachedImageSrc(src: string): Promise<string> {
  if (!src || !isBrowser()) return src;

  const existing = objectUrlBySrc.get(src);
  if (existing) {
    touchEntry(src, existing);
    return existing;
  }

  const inFlight = inFlightBySrc.get(src);
  if (inFlight) return inFlight;

  const task = (async () => {
    const cached = await readFromCache(src);
    const objectUrl = cached ?? (await fetchAndStore(src));
    touchEntry(src, objectUrl);
    return objectUrl;
  })();

  inFlightBySrc.set(src, task);
  try {
    return await task;
  } finally {
    inFlightBySrc.delete(src);
  }
}
