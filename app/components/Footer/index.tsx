import dayjs from "dayjs";

const currentYear = dayjs().format("YYYY");

export default function Footer() {
  return (
    <footer className="container mx-auto text-zinc-600 py-5">
      <p className="text-center">
        Copyright &copy; {currentYear} Pond Design. All rights reserved.
      </p>
    </footer>
  );
}
