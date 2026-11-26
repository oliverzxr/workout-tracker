import { useState } from 'react';
import { ScanLine } from 'lucide-react';

export function ExerciseImage({ src, alt, thumbnail = false }: { src?: string; alt: string; thumbnail?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const className = thumbnail ? 'catalog-visual thumbnail' : 'catalog-visual full-frame';
  return src && failedSrc !== src ? <span className={className}>
    <img src={src} alt={alt} width={thumbnail ? 144 : 480} height={thumbnail ? 108 : 360}
      loading="lazy" decoding="async" onError={() => setFailedSrc(src)} />
  </span> : <span className={className + ' neutral'} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
    <ScanLine size={thumbnail ? 19 : 34} aria-hidden="true" />
  </span>;
}
