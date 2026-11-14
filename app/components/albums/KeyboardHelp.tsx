import clsx from 'clsx';
import { Fragment, useEffect, useRef } from 'react';
import type { ShortcutGroup } from '~/albums/keyboard';
import { Icon } from './icons';

/**
 * The "/" overlay listing keyboard shortcuts. A modal <dialog>: Escape or a
 * click outside closes it, and keys pressed inside don't reach the page or
 * the lightbox underneath.
 */
export default function KeyboardHelp({
  open,
  onClose,
  groups,
}: {
  open: boolean;
  onClose: () => void;
  groups: ShortcutGroup[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="keyboard-help-title"
      className="pd-help"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
      onKeyDown={(event) => {
        // Keep keys (Escape, arrows) away from the lightbox underneath.
        event.stopPropagation();
        if (event.key === '/' || event.key === '?') {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <div className="flex items-center justify-between gap-6">
        <h2 id="keyboard-help-title" className="font-serif text-2xl">
          Keyboard shortcuts
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close shortcuts"
          className="rounded-full p-1.5 text-white/60 hover:text-white"
        >
          <Icon name="x" size={20} />
        </button>
      </div>
      <div className="mt-5 grid gap-x-10 gap-y-6 sm:grid-cols-2">
        {groups.map((group) => (
          <section key={group.title}>
            <h3 className="mb-2 font-medium text-[11px] text-white/50 uppercase tracking-widest">
              {group.title}
            </h3>
            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
              {group.keys.map(([keys, label]) => (
                <Fragment key={label}>
                  <dt className="flex gap-1">
                    {keys.map((key) => (
                      <kbd key={key}>{key}</kbd>
                    ))}
                  </dt>
                  <dd className="text-white/85">{label}</dd>
                </Fragment>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </dialog>
  );
}

/** Small "Shortcuts /" button; only shown on devices with a pointer. */
export function ShortcutsButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'hidden items-center gap-2 text-fg-subtle text-sm hover:text-fg-accent [@media(hover:hover)]:inline-flex',
        className,
      )}
    >
      <Icon name="keyboard" />
      Shortcuts
      <kbd className="rounded border border-border-default px-1.5 font-mono text-xs">
        /
      </kbd>
    </button>
  );
}
