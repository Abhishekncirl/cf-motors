import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import type { VehicleImage } from '../../lib/types';

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='800' height='600' fill='%231A1A1A'/%3E%3Ctext x='50%25' y='50%25' fill='%234FE3DE' font-family='sans-serif' font-size='28' text-anchor='middle' dominant-baseline='middle'%3ECF Motor Sales%3C/text%3E%3C/svg%3E";

/** Image gallery: main image, thumbnails, swipe on mobile, full-screen lightbox. */
export function Gallery({ images, alt }: { images: VehicleImage[]; alt: string }) {
  const ordered = images.length ? images : [{ url: PLACEHOLDER, storagePath: '', sortOrder: 0, isPrimary: true }];
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStart = useRef<number | null>(null);

  const go = (delta: number) =>
    setIndex((i) => (i + delta + ordered.length) % ordered.length);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, ordered.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
    touchStart.current = null;
  };

  return (
    <div>
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-brand-black"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={ordered[index].url}
          alt={`${alt} - image ${index + 1} of ${ordered.length}`}
          width={800}
          height={600}
          className="h-full w-full object-cover"
          decoding="async"
        />
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute right-3 top-3 rounded-md bg-brand-black/70 p-2 text-brand-white hover:text-brand-cyan"
          aria-label="Open full-screen gallery"
        >
          <Expand size={18} aria-hidden />
        </button>
        {ordered.length > 1 && (
          <>
            <GalleryArrow dir="left" onClick={() => go(-1)} />
            <GalleryArrow dir="right" onClick={() => go(1)} />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-black/70 px-3 py-1 text-xs text-brand-white">
              {index + 1} / {ordered.length}
            </div>
          </>
        )}
      </div>

      {ordered.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {ordered.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-md border-2 ${
                i === index ? 'border-brand-cyan' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt="" width={80} height={64} className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-label="Full-screen image gallery"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 rounded-md p-2 text-white hover:text-brand-cyan"
            aria-label="Close gallery"
          >
            <X size={28} aria-hidden />
          </button>
          <img
            src={ordered[index].url}
            alt={`${alt} - image ${index + 1} of ${ordered.length}`}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />
          {ordered.length > 1 && (
            <>
              <GalleryArrow dir="left" onClick={() => go(-1)} large />
              <GalleryArrow dir="right" onClick={() => go(1)} large />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function GalleryArrow({
  dir,
  onClick,
  large,
}: {
  dir: 'left' | 'right';
  onClick: () => void;
  large?: boolean;
}) {
  const Icon = dir === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'left' ? 'Previous image' : 'Next image'}
      className={`absolute top-1/2 -translate-y-1/2 ${dir === 'left' ? 'left-3' : 'right-3'} rounded-full bg-brand-black/70 p-2 text-brand-white hover:text-brand-cyan`}
    >
      <Icon size={large ? 32 : 22} aria-hidden />
    </button>
  );
}
