import clsx from 'clsx';
import type { ComponentPropsWithoutRef } from 'react';

const variants = {
  /** Date ranges. */
  neutral: 'uppercase tracking-widest bg-tag-neutral-bg text-tag-neutral-fg',
  /** Low-emphasis labels, e.g. skills. Text color is inherited. */
  muted: 'tracking-wide bg-tag-muted-bg',
  /** Calls attention, e.g. "Current Role". */
  highlight:
    'uppercase tracking-widest bg-tag-highlight-bg text-tag-highlight-fg',
} as const;

export type TagVariant = keyof typeof variants;

type TagProps = {
  variant?: TagVariant;
  /** Render as a <p> when the tag stands alone as a block of text. */
  as?: 'span' | 'p';
} & ComponentPropsWithoutRef<'span'>;

/**
 * Small rounded label. Outer spacing (margins) is left to the caller.
 * Figma: Pond Design System → Components → Tag.
 */
export default function Tag({
  variant = 'neutral',
  as: Element = 'span',
  className,
  ...props
}: TagProps) {
  return (
    <Element
      className={clsx(
        'inline-block rounded-sm px-5 py-1 text-sm',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
