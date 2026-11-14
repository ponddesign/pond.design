import clsx from 'clsx';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import Heading from '~/components/Heading';

type SectionProps = {
  /** Section title, shown in the left column on wider screens. */
  title?: ReactNode;
  /** Top divider line. */
  divider?: boolean;
  /** Classes for the content column (only used with `title`). */
  contentClassName?: string;
} & Omit<ComponentPropsWithoutRef<'section'>, 'title'>;

/**
 * Page section: a 4-column grid with the title in the first column and the
 * content spanning the other three. Without a `title`, children are placed
 * directly in the grid.
 * Figma: Pond Design System → Components → Section.
 */
export default function Section({
  title,
  divider = true,
  contentClassName,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={clsx(
        'container mx-auto py-12 sm:grid sm:grid-flow-col sm:grid-cols-4 sm:gap-4',
        divider ? 'border-t border-t-border-default' : 'pt-0',
        className,
      )}
      {...props}
    >
      {title ? (
        <>
          <Heading level={2} variant="section" className="mb-4">
            {title}
          </Heading>
          <div className={clsx('sm:col-span-3', contentClassName)}>
            {children}
          </div>
        </>
      ) : (
        children
      )}
    </section>
  );
}
