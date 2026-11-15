/**
 * Formatting shared by the resumé page and its PDF (./pdf.ts), so the two
 * show the same text. The PDF is built by Node from vite.config.ts, so this
 * file and its imports must be plain, erasable TypeScript.
 */

/** Where the PDF is served from. */
export const RESUME_PDF_PATH = '/resume.pdf';

/** File name for the download, e.g. "jane-doe-resume.pdf". */
export const resumePdfFileName = (name: string) =>
  `${name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}-resume.pdf`;

export const formatMonthYearUTC = (dateString: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(dateString));

export const formatYearUTC = (dateString: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(dateString));

// Summaries separate paragraphs with blank lines; split on any run of line
// breaks so blank lines don't render as empty paragraphs.
export const toParagraphs = (text: string) =>
  text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
