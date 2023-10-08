import dayjs from 'dayjs';

const currentYear = dayjs().format('YYYY');

export default function Footer() {
  return (
    <footer className="text-primary-400 container mx-auto py-5">
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
