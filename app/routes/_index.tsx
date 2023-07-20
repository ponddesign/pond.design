import type { V2_MetaFunction } from "@remix-run/node";
import dayjs from "dayjs";

import logoText from "../assets/logo-text.svg";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Pond Design" }];
};

const currentYear = dayjs().format("YYYY");

export default function Index() {
  return (
    <div>
      <header className="container mx-auto min-h-[90vh] flex flex-col items-center justify-center">
        <h1>
          <img src={logoText} alt="Pond Design" />
        </h1>
      </header>
      <footer className="container mx-auto text-zinc-600 py-5">
        <p className="text-center">
          Copyright &copy; {currentYear} Pond Design. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
