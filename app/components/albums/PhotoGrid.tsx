import {
  type CSSProperties,
  type MouseEvent,
  useEffect,
  useState,
} from 'react';
import {
  averageColor,
  largestSrc,
  photoSrc,
  photoSrcSet,
  placeholder,
  widthAtLeast,
} from '~/albums/media';
import type { Photo } from '~/albums/types';
import { PhotoMeta } from './PhotoDetails';

type PhotoGridProps = {
  slug: string;
  photos: Photo[];
  /** Opens the lightbox. Without JavaScript the link opens the full photo. */
  onOpen: (index: number) => void;
};

/**
 * Justified rows: every photo keeps its aspect ratio and each row fills the
 * width at the same height. Pure CSS (see .pd-justified in albums.css), so
 * the server-rendered layout is final and nothing jumps on load.
 *
 * Hovering or focusing a photo shows its place, camera and exposure
 * (concept A). Touch screens skip the overlay; the lightbox has the details.
 */
export default function PhotoGrid({ slug, photos, onOpen }: PhotoGridProps) {
  // Blurred placeholders are drawn in the browser; the server sends colors.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return (
    <ul className="pd-justified">
      {photos.map((photo, index) => {
        const open = (event: MouseEvent) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey) return;
          event.preventDefault();
          onOpen(index);
        };
        const ratio = photo.width / photo.height;
        const e = photo.exposure;
        const exposure = e
          ? [
              e.focalLength,
              e.aperture,
              e.shutter,
              e.iso && `ISO ${e.iso}`,
            ].filter(Boolean)
          : [];
        const hasDetails =
          Boolean(photo.location || photo.camera) || exposure.length > 0;
        return (
          <li
            key={photo.id}
            style={{ '--ar': ratio } as CSSProperties}
            className="group relative"
          >
            <a
              href={largestSrc(slug, photo)}
              onClick={open}
              className="block overflow-hidden rounded-[2px] bg-surface-default outline-offset-2 focus-visible:outline-2 focus-visible:outline-fg-accent"
            >
              <img
                src={photoSrc(slug, photo, widthAtLeast(photo, 960))}
                srcSet={photoSrcSet(slug, photo)}
                sizes={`(max-width: 640px) ${Math.round(180 * ratio)}px, ${Math.round(300 * ratio * 1.15)}px`}
                width={photo.width}
                height={photo.height}
                alt={photo.alt}
                loading={index < 6 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : undefined}
                decoding="async"
                style={{
                  backgroundColor: averageColor(photo),
                  backgroundImage: hydrated
                    ? `url(${placeholder(photo)})`
                    : undefined,
                }}
                className="block h-auto w-full bg-cover"
              />
              {hasDetails && (
                <div
                  aria-hidden="true"
                  className="pd-overlay pointer-events-none absolute inset-0 flex flex-col justify-end gap-1 p-4 text-sm text-white/90"
                >
                  {photo.location && (
                    <PhotoMeta icon="mapPin">{photo.location}</PhotoMeta>
                  )}
                  {photo.camera && (
                    <PhotoMeta icon="camera">{photo.camera}</PhotoMeta>
                  )}
                  {exposure.length > 0 && (
                    <p className="flex flex-wrap gap-x-3 font-mono text-white/75 text-xs">
                      {exposure.map((value) => (
                        <span key={value}>{value}</span>
                      ))}
                    </p>
                  )}
                </div>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
