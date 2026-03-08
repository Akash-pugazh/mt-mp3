import { ImgHTMLAttributes, useEffect, useState } from "react";
import { getCachedImageSrc } from "@/lib/image-cache";

type CachedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
  disableCache?: boolean;
};

const CachedImage = ({ src, fallbackSrc, disableCache = false, onError, ...props }: CachedImageProps) => {
  const rawSrc = typeof src === "string" ? src : "";
  const [resolvedSrc, setResolvedSrc] = useState<string>(rawSrc);

  useEffect(() => {
    let cancelled = false;

    if (!rawSrc || disableCache) {
      setResolvedSrc(rawSrc);
      return () => {
        cancelled = true;
      };
    }

    void getCachedImageSrc(rawSrc)
      .then((cachedSrc) => {
        if (!cancelled) setResolvedSrc(cachedSrc || rawSrc);
      })
      .catch(() => {
        if (!cancelled) setResolvedSrc(rawSrc);
      });

    return () => {
      cancelled = true;
    };
  }, [rawSrc, disableCache]);

  return (
    <img
      {...props}
      src={resolvedSrc || rawSrc}
      onError={(e) => {
        if (fallbackSrc && resolvedSrc !== fallbackSrc) {
          setResolvedSrc(fallbackSrc);
        }
        onError?.(e);
      }}
    />
  );
};

export default CachedImage;
