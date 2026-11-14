import clsx from 'clsx';
import type { ComponentPropsWithoutRef } from 'react';

const variants = {
  /** Serif display text, e.g. the person's name. */
  display: 'font-serif text-2xl',
  /** Serif italic section titles ("Experience"). Truncates if too long. */
  section: 'font-serif text-2xl italic truncate',
  /** Large bold titles, e.g. a role or degree. */
  title: 'font-sans font-extrabold text-4xl',
  /** Bold body-size subtitle. */
  subtitle: 'font-extrabold',
} as const;

export type HeadingVariant = keyof typeof variants;

type HeadingProps = {
  /** Document outline level; independent of how the heading looks. */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  variant: HeadingVariant;
} & ComponentPropsWithoutRef<'h2'>;

/**
 * Heading with the level (semantics) and variant (style) chosen separately.
 * Color and outer spacing are left to the caller.
 * Figma: Pond Design System → Components → Heading.
 */
export default function Heading({
  level,
  variant,
  className,
  ...props
}: HeadingProps) {
  const Element = `h${level}` as const;
  return <Element className={clsx(variants[variant], className)} {...props} />;
}
