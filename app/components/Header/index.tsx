import clsx from 'clsx';

import LogoText from "~/components/icons/LogoText";

export default function Header({ short = false }) {
  return (
    <header className={clsx("container mx-auto flex flex-col py-6 items-center justify-center", {
      'min-h-[90vh]': !short,
    })}>
      <h1>
        <span className="hidden">Pond Design</span>
        <LogoText />
      </h1>
    </header>
  );
}
