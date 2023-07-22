import LogoText from "~/components/icons/LogoText";

export default function Header() {
  return (
    <header className="container mx-auto min-h-[90vh] flex flex-col items-center justify-center">
      <h1>
        <span className="hidden">Pond Design</span>
        <LogoText />
      </h1>
    </header>
  );
}
