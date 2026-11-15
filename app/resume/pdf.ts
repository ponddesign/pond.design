/**
 * The resumé as a PDF, built from the same data and formatting as the
 * /resume page. vite.config.ts renders it with Node at build time (and on
 * request in dev), so this file uses createElement instead of JSX and imports
 * with explicit `.ts` extensions.
 */
import { createRequire } from 'node:module';
import {
  Document,
  Font,
  Link,
  Page,
  renderToBuffer,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { createElement as h, type ReactNode } from 'react';
import type resumeJson from '../data/resume.json';
import { formatMonthYearUTC, formatYearUTC, toParagraphs } from './format.ts';

export type Resume = typeof resumeJson;

// react-pdf can't use variable fonts, so DM Sans comes from Fontsource's
// static package here; the site uses the variable version.
const fontFile = createRequire(import.meta.url).resolve;
Font.register({
  family: 'DM Sans',
  fonts: [
    {
      src: fontFile('@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff'),
      fontWeight: 400,
    },
    {
      src: fontFile('@fontsource/dm-sans/files/dm-sans-latin-800-normal.woff'),
      fontWeight: 800,
    },
  ],
});
Font.register({
  family: 'DM Serif Display',
  fonts: [
    {
      src: fontFile(
        '@fontsource/dm-serif-display/files/dm-serif-display-latin-400-normal.woff',
      ),
    },
    {
      src: fontFile(
        '@fontsource/dm-serif-display/files/dm-serif-display-latin-400-italic.woff',
      ),
      fontStyle: 'italic',
    },
  ],
});
// Wrap whole words, as the page does, instead of hyphenating.
Font.registerHyphenationCallback((word) => [word]);

// Light-theme values from app/styles/theme.css (design tokens).
const color = {
  fgDefault: '#56635e',
  fgStrong: '#1e2321',
  fgHeading: '#1e2321',
  fgSubtle: '#68685c',
  border: '#dadad3',
  tagNeutralBg: '#b9c0be',
  tagNeutralFg: '#1e2321',
  tagMutedBg: '#aeaea3',
  tagHighlightBg: '#fdba74',
  tagHighlightFg: '#9a3412',
};

// Body text size and line height. react-pdf scales a unitless lineHeight
// correctly only when the same style sets fontSize, and a lineHeight
// inherited from the Page stops it drawing the page number, so text styles
// spread this instead of inheriting it.
const bodyText = { fontSize: 9.5, lineHeight: 1.45 };

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingHorizontal: 54,
    paddingBottom: 60,
    fontFamily: 'DM Sans',
    fontSize: 9.5,
    color: color.fgStrong,
  },
  text: { ...bodyText },
  name: {
    fontFamily: 'DM Serif Display',
    fontSize: 28,
    lineHeight: 1.15,
    marginBottom: 6,
  },
  label: { fontWeight: 800, ...bodyText, marginBottom: 2 },
  subtle: { color: color.fgSubtle, ...bodyText, textDecoration: 'none' },
  section: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: color.border,
    paddingTop: 14,
    marginTop: 14,
  },
  sectionTitle: {
    width: '25%',
    paddingRight: 12,
    fontFamily: 'DM Serif Display',
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 1.2,
  },
  sectionBody: { width: '75%' },
  job: { marginBottom: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  tag: {
    borderRadius: 2,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 8,
  },
  tagNeutral: {
    backgroundColor: color.tagNeutralBg,
    color: color.tagNeutralFg,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tagMuted: { backgroundColor: color.tagMutedBg, letterSpacing: 0.25 },
  tagHighlight: {
    backgroundColor: color.tagHighlightBg,
    color: color.tagHighlightFg,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontWeight: 800,
    fontSize: 14,
    lineHeight: 1.25,
    color: color.fgHeading,
    marginBottom: 2,
  },
  company: {
    fontFamily: 'DM Serif Display',
    fontStyle: 'italic',
    fontSize: 12,
    lineHeight: 1.3,
    marginBottom: 6,
  },
  link: { color: color.fgStrong, textDecoration: 'none' },
  paragraph: { color: color.fgStrong, ...bodyText, marginBottom: 5 },
  footer: {
    position: 'absolute',
    bottom: 30,
    fontSize: 8,
    color: color.fgSubtle,
  },
  footerLeft: { left: 54 },
  footerRight: { right: 54 },
});

type Variant = 'neutral' | 'muted' | 'highlight';
const tagVariant = {
  neutral: styles.tagNeutral,
  muted: styles.tagMuted,
  highlight: styles.tagHighlight,
};
const tag = (variant: Variant, text: string, key?: string) =>
  h(Text, { key, style: [styles.tag, tagVariant[variant]] }, text);

/**
 * A titled section. Short sections pass `keepTogether` so the title isn't
 * left at the bottom of a page on its own.
 */
const section = (
  title: string,
  keepTogether: boolean,
  ...children: ReactNode[]
) =>
  h(
    View,
    { style: styles.section, wrap: !keepTogether },
    h(Text, { style: styles.sectionTitle }, title),
    h(View, { style: styles.sectionBody }, ...children),
  );

export function ResumeDocument({ resume }: { resume: Resume }) {
  const { basics } = resume;
  return h(
    Document,
    {
      title: `${basics.name}'s Resumé`,
      author: basics.name,
      subject: basics.label,
      creator: 'pond.design',
      producer: 'pond.design',
      language: 'en-US',
    },
    h(
      Page,
      { size: 'LETTER', style: styles.page },
      // Intro
      h(
        View,
        null,
        h(Text, { style: styles.name }, basics.name),
        h(Text, { style: styles.label }, basics.label),
        h(
          Link,
          { src: `mailto:${basics.email}`, style: styles.subtle },
          basics.email,
        ),
        h(Text, { style: styles.subtle }, basics.location.address),
      ),
      section(
        'Experience',
        false,
        ...resume.work.map((job) => {
          const [first, ...rest] = job.summary ? toParagraphs(job.summary) : [];
          const paragraph = (text: string) =>
            h(Text, { key: text, style: styles.paragraph }, text);
          return h(
            View,
            {
              key: `${job.name}-${job.position}-${job.startDate}-${job.endDate ?? 'present'}`,
              style: styles.job,
            },
            // Keep each role's heading and first paragraph on one page.
            h(
              View,
              { wrap: false },
              h(
                View,
                { style: styles.tags },
                tag(
                  'neutral',
                  `${formatMonthYearUTC(job.startDate)}${
                    job.endDate ? ` - ${formatMonthYearUTC(job.endDate)}` : ''
                  }`,
                ),
                job.endDate ? null : tag('highlight', 'Current Role'),
              ),
              h(Text, { style: styles.title }, job.position),
              job.url
                ? h(
                    Link,
                    { src: job.url, style: [styles.company, styles.link] },
                    job.name,
                  )
                : h(Text, { style: styles.company }, job.name),
              first ? paragraph(first) : null,
            ),
            ...rest.map(paragraph),
          );
        }),
      ),
      section(
        'Skills',
        true,
        h(
          View,
          { style: styles.tags },
          ...resume.skills.map((skill) => tag('muted', skill.name, skill.name)),
        ),
      ),
      section(
        'Education',
        true,
        ...resume.education
          .filter((school) => school.studyType)
          .map((school) =>
            h(
              View,
              { key: school.institution, wrap: false },
              h(
                View,
                { style: styles.tags },
                tag(
                  'neutral',
                  `${formatYearUTC(school.startDate)} - ${
                    school.endDate ? formatYearUTC(school.endDate) : 'Current'
                  }`,
                ),
              ),
              h(Text, { style: styles.title }, school.studyType),
              school.institution
                ? h(Text, { style: styles.text }, school.institution)
                : null,
              school.area ? h(Text, { style: styles.text }, school.area) : null,
            ),
          ),
      ),
      // Footer on every page.
      h(
        Text,
        { style: [styles.footer, styles.footerLeft], fixed: true },
        `${basics.name} — ${basics.label}`,
      ),
      h(Text, {
        style: [styles.footer, styles.footerRight],
        fixed: true,
        render: ({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`,
      }),
    ),
  );
}

/** Renders the resumé PDF. */
export const renderResumePdf = (resume: Resume) =>
  renderToBuffer(ResumeDocument({ resume }));
