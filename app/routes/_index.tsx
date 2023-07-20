import type { V2_MetaFunction } from "@remix-run/node";

import logoText from "../assets/logo-text.svg";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Pond Design" }];
};

export default function Index() {
  return (
    <>
      <header className="min-h-screen flex flex-col items-center justify-center">
        <h1>
          <img src={logoText} alt="Pond Design" />
        </h1>
      </header>
      <footer className="text-center text-zinc-600 py-5">
        <p>Copyright 2023</p>
      </footer>
    </>
  );
}
