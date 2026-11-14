import clsx from 'clsx';
import { useEffect, useState } from 'react';
import Lightbox, { IconButton } from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import { largestSrc, photoSrc } from '~/albums/media';
import type { Photo } from '~/albums/types';
import { Icon } from './icons';
import { PhotoDetails } from './PhotoDetails';

declare module 'yet-another-react-lightbox' {
  interface Labels {
    'Show details (I)'?: string;
    'Hide details (I)'?: string;
  }
}

type PhotoLightboxProps = {
  slug: string;
  photos: Photo[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

const INFO_KEY = 'pond.albums.info';
const InfoIcon = () => <Icon name="info" size={28} className="yarl__icon" />;

/**
 * Full-screen viewer. Desktop: an "i" button (or the I key) opens the info
 * panel beside the photo (concept C). Phones: a pill with the place opens a
 * details sheet under the photo (concept E). The open/closed choice is
 * remembered.
 */
export default function PhotoLightbox({
  slug,
  photos,
  index,
  onIndexChange,
  onClose,
}: PhotoLightboxProps) {
  const [info, setInfo] = useState(false);
  useEffect(() => setInfo(localStorage.getItem(INFO_KEY) === 'open'), []);
  const toggleInfo = () =>
    setInfo((open) => {
      localStorage.setItem(INFO_KEY, open ? 'closed' : 'open');
      return !open;
    });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'i' && !event.metaKey && !event.ctrlKey)
        toggleInfo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const photo = photos[index];
  const slides = photos.map((p) => ({
    src: largestSrc(slug, p),
    alt: p.alt,
    width: p.width,
    height: p.height,
    srcSet: p.widths.map((w) => ({
      src: photoSrc(slug, p, w),
      width: w,
      height: Math.round((w * p.height) / p.width),
    })),
  }));

  return (
    <Lightbox
      open
      close={onClose}
      index={index}
      slides={slides}
      plugins={[Counter, Zoom]}
      className={clsx('pd-lightbox', info && 'pd-lightbox--info')}
      carousel={{ finite: false, preload: 2, padding: '24px' }}
      zoom={{ maxZoomPixelRatio: 2 }}
      on={{ view: ({ index: i }) => onIndexChange(i) }}
      labels={{ Close: 'Close (Esc)' }}
      toolbar={{
        buttons: [
          <IconButton
            key="info"
            label={info ? 'Hide details (I)' : 'Show details (I)'}
            icon={InfoIcon}
            onClick={toggleInfo}
            aria-pressed={info}
            className="pd-info-button max-md:hidden"
          />,
          'close',
        ],
      }}
      render={{
        controls: () =>
          photo && (
            <>
              {!info && (
                <button
                  type="button"
                  onClick={toggleInfo}
                  className="pd-details-pill md:hidden"
                >
                  <Icon name={photo.location ? 'mapPin' : 'info'} />
                  <span>{photo.location ?? 'Details'}</span>
                  <Icon name="chevronUp" />
                </button>
              )}
              {info && (
                <aside className="pd-details" aria-label="Photo details">
                  <button
                    type="button"
                    onClick={toggleInfo}
                    className="pd-details-handle md:hidden"
                    aria-label="Hide details"
                  />
                  <PhotoDetails photo={photo} />
                </aside>
              )}
            </>
          ),
      }}
    />
  );
}
