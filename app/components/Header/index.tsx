import logoText from "../../assets/logo-text.svg";

export default function Header() {
  return (
    <header className="container mx-auto min-h-[90vh] flex flex-col items-center justify-center">
      <h1>
        <img src={logoText} alt="Pond Design" />
      </h1>
    </header>
  );
}
