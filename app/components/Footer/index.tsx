import dayjs from "dayjs";

const currentYear = dayjs().format("YYYY");

export default function Footer() {
  return (
    <footer className="text-primary-400 container mx-auto py-5">
      <p className="text-center">
        Copyright &copy; {currentYear} Pond Design. All rights reserved.
      </p>
    </footer>
  );
}
