import { Link } from 'react-router';
import Heading from '~/components/Heading';
import LogoText from '~/icons/logo-text.svg?react';
import Footer from '../Footer';

type ErrorPageProps = {
  title: string;
  message: string;
  /** Error details, shown in development only. */
  details?: string;
};

/**
 * Full-page error shown by the root ErrorBoundary (404s and unexpected
 * errors). Styled with classes only: the CSP blocks inline styles.
 */
export default function ErrorPage({ title, message, details }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <title>{`${title} — Pond Design`}</title>
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <Link to="/" aria-label="Pond Design home" className="mb-16 w-40">
          <LogoText />
        </Link>
        <Heading
          level={1}
          variant="display"
          className="mb-4 text-4xl text-fg-heading"
        >
          {title}
        </Heading>
        <p className="mb-8 max-w-md text-fg-subtle">{message}</p>
        <Link to="/" className="font-extrabold hover:text-fg-accent">
          Back to pond.design
        </Link>
        {details && (
          <pre className="mt-12 max-w-full overflow-x-auto rounded bg-surface-subtle p-4 text-left font-mono text-sm">
            {details}
          </pre>
        )}
      </main>
      <Footer />
    </div>
  );
}
