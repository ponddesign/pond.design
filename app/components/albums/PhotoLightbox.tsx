import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import Lightbox, {
  type FullscreenRef,
  IconButton,
  type ZoomRef,
} from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import { ALBUM_SHORTCUTS, isHelpKey, useKeys } from '~/albums/keyboard';
import { largestSrc, photoSrc } from '~/albums/media';
import type { Photo } from '~/albums/types';
import { Icon } from './icons';
import KeyboardHelp from './KeyboardHelp';
import { PhotoDetails } from './PhotoDetails';

declare module 'yet-another-react-lightbox' {
  interface Labels {
    'Show details (I)'?: string;
    'Hide details (I)'?: string;
    'Keyboard shortcuts (/)'?: string;
  }
}

type PhotoLightboxProps = {
  slug: string;
  photos: Photo[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** The "/" shortcuts overlay; shared with the album page. */
  help: boolean;
  onHelpChange: (open: boolean) => void;
};

const INFO_KEY = 'pond.albums.info';
const InfoIcon = () => <Icon name="info" size={28} className="yarl__icon" />;
const KeyboardIcon = () => (
  <Icon name="keyboard" size={28} className="yarl__icon" />
);

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
  help,
  onHelpChange,
}: PhotoLightboxProps) {
  const zoom = useRef<ZoomRef>(null);
  const fullscreen = useRef<FullscreenRef>(null);
  const [info, setInfo] = useState(false);
  useEffect(() => setInfo(localStorage.getItem(INFO_KEY) === 'open'), []);
  const toggleInfo = () =>
    setInfo((open) => {
      localStorage.setItem(INFO_KEY, open ? 'closed' : 'open');
      return !open;
    });

  // Lightroom-style keys. Esc is handled by the lightbox itself.
  useKeys((event) => {
    if (isHelpKey(event)) {
      onHelpChange(true);
      return true;
    }
    const z = zoom.current;
    switch (event.key) {
      case 'i':
      case 'I':
        toggleInfo();
        return true;
      case 'z':
      case 'Z':
        // Toggle between fit and 100% (one image pixel per screen pixel).
        if (!z || z.disabled) return true;
        z.changeZoom(z.zoom > z.minZoom ? z.minZoom : z.maxZoom);
        return true;
      case '+':
      case '=':
        z?.zoomIn();
        return true;
      case '-':
      case '_':
        z?.zoomOut();
        return true;
      case 'f':
      case 'F': {
        const f = fullscreen.current;
        if (f && !f.disabled) (f.fullscreen ? f.exit : f.enter)();
        return true;
      }
      case 'g':
      case 'G':
        onClose();
        return true;
      // The lightbox handles arrows itself when it has focus (and stops them
      // there); these catch the ones that reach the page, e.g. right after
      // opening with the keyboard.
      case 'ArrowLeft':
        onIndexChange((index - 1 + photos.length) % photos.length);
        return true;
      case 'ArrowRight':
        onIndexChange((index + 1) % photos.length);
        return true;
      case 'Home':
        onIndexChange(0);
        return true;
      case 'End':
        onIndexChange(photos.length - 1);
        return true;
    }
    return false;
  }, !help);

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
      plugins={[Counter, Fullscreen, Zoom]}
      className={clsx('pd-lightbox', info && 'pd-lightbox--info')}
      carousel={{ finite: false, preload: 2, padding: '24px' }}
      // Max zoom = 100%: one image pixel per screen pixel, as in Lightroom.
      zoom={{ ref: zoom, maxZoomPixelRatio: 1 }}
      fullscreen={{ ref: fullscreen }}
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
          <IconButton
            key="keys"
            label="Keyboard shortcuts (/)"
            icon={KeyboardIcon}
            onClick={() => onHelpChange(true)}
            className="pd-keys-button"
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
              {/* Inside the lightbox: it makes the rest of the page inert. */}
              <KeyboardHelp
                open={help}
                onClose={() => onHelpChange(false)}
                groups={ALBUM_SHORTCUTS}
              />
            </>
          ),
      }}
    />
  );
}
