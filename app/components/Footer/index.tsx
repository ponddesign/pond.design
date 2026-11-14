// The build's year, so it updates on the next deploy (and the server and
// browser render the same text).
const currentYear = new Date(import.meta.env.BUILD_TIME).getUTCFullYear();

export default function Footer() {
  return (
    <footer className="text-fg-faint container mx-auto py-5">
      <p className="copyright text-center">
        Copyright &copy; {currentYear} Pond Design. All rights reserved.
      </p>
      <p className="social hidden">
        <a rel="me" href="https://mstdn.social/@ponddesign">
          Mastodon
        </a>
      </p>
    </footer>
  );
}
