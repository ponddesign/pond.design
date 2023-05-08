import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Pond Design" }];
};

export default function Index() {
  return (
    <div>
      <header>
        <h1>Pond Design</h1>
      </header>
      <main>
        <p>Under construction.</p>
      </main>
      <footer>
        <p>Copyright 2023</p>
      </footer>
    </div>
  );
}
