import clsx from 'clsx';
import type { ReactNode } from 'react';
import { takenAt } from '~/albums/format';
import type { Exposure, Photo } from '~/albums/types';
import { Icon, type IconName } from './icons';

/**
 * One line of photo metadata with an icon.
 * Figma: Albums — photo details explorations → Photo meta item.
 */
export function PhotoMeta({
  icon,
  children,
  className,
}: {
  icon: IconName;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={clsx('flex items-center gap-1.5', className)}>
      <Icon name={icon} className="shrink-0 opacity-70" />
      <span>{children}</span>
    </p>
  );
}

const EXPOSURE: [keyof Exposure, string, string][] = [
  ['focalLength', 'Focal length', 'Focal'],
  ['aperture', 'Aperture', 'Aperture'],
  ['shutter', 'Shutter', 'Shutter'],
  ['iso', 'ISO', 'ISO'],
];

/**
 * Everything known about one photo: place, time, camera, lens, exposure.
 * Missing fields are left out. Used by the lightbox info panel (desktop)
 * and details sheet (phones).
 */
export function PhotoDetails({ photo }: { photo: Photo }) {
  const when = takenAt(photo.takenAt);
  const exposure = EXPOSURE.filter(([key]) => photo.exposure?.[key]);
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-2.5">
        <h2 className="font-serif text-2xl text-white/95 md:text-3xl">
          {photo.location ?? 'Details'}
        </h2>
        {when && <PhotoMeta icon="calendar">{when}</PhotoMeta>}
      </div>
      {(photo.camera || photo.lens) && (
        <div className="space-y-2.5 border-white/10 border-t pt-4 md:pt-6">
          {photo.camera && <PhotoMeta icon="camera">{photo.camera}</PhotoMeta>}
          {photo.lens && <PhotoMeta icon="aperture">{photo.lens}</PhotoMeta>}
        </div>
      )}
      {exposure.length > 0 && (
        <dl className="grid grid-cols-4 gap-x-4 gap-y-5 border-white/10 border-t pt-4 md:grid-cols-2 md:pt-6">
          {exposure.map(([key, label, short]) => (
            <div key={key}>
              <dt className="font-medium text-[11px] text-white/55 uppercase tracking-wider">
                <span className="md:hidden">{short}</span>
                <span className="max-md:hidden">{label}</span>
              </dt>
              <dd className="font-mono text-base text-white/95">
                {photo.exposure?.[key]}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
