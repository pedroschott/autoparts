"use client";

import { useState } from "react";

/**
 * Part artwork is a small static SVG per part type, so it is served directly
 * rather than through the image optimizer — nothing to resize or re-encode.
 */
export function ProductImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="grid h-full w-full place-items-center bg-ink-100 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
        No image
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full object-contain"
    />
  );
}
