import clsx from 'clsx';
import type { MetaFunction } from 'react-router';

import Heading from '~/components/Heading';
import Section from '~/components/Section';
import Tag from '~/components/Tag';
import resume from '~/data/resume.json';

export const meta: MetaFunction = () => {
  return [
    {
      title: `${resume.basics.name}'s Resumé — ${resume.basics.label}`,
    },
    {
      name: 'description',
      content: `${resume.basics.name}'s professional resumé as ${resume.basics.label}.`,
    },
  ];
};

const formatMonthYearUTC = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

// Summaries separate paragraphs with blank lines; split on any run of line
// breaks so blank lines don't render as empty <p> elements.
const toParagraphs = (text: string) =>
  text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const formatYearUTC = (dateString: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(dateString));

export default function Index() {
  return (
    <main
      className={clsx(
        'bg-surface-subtle',
        'text-fg-strong',
        'space-y-20',
        'px-6',
        'py-24',
      )}
    >
      <div className="resume container mx-auto max-w-3xl">
        {/* INTRO */}
        <header className="container mx-auto mb-6">
          <Section divider={false}>
            <div>
              <Heading level={1} variant="display" className="mb-4">
                {resume.basics.name}
              </Heading>
              <p className="mb-1 font-extrabold">{resume.basics.label}</p>
              <p>
                <a
                  href={`mailto:${resume.basics.email}`}
                  className="text-fg-subtle hover:text-fg-accent"
                >
                  {resume.basics.email}
                </a>
              </p>
              <p className="text-fg-subtle">{resume.basics.location.address}</p>
            </div>
          </Section>
        </header>

        <Section
          title="Experience"
          className="experience"
          contentClassName="space-y-12"
        >
          {resume.work.map((job) => (
            <article
              key={`${job.name}-${job.position}-${job.startDate}-${job.endDate ?? 'present'}`}
            >
              <div className="mb-6">
                <p className="mb-2">
                  <Tag variant="neutral" className="date-tag mb-3 mr-2">
                    {formatMonthYearUTC(job.startDate)}
                    {job.endDate && ` - ${formatMonthYearUTC(job.endDate)}`}
                  </Tag>
                  {!job.endDate && (
                    <Tag variant="highlight" className="mb-3">
                      Current Role
                    </Tag>
                  )}
                </p>
                <Heading
                  level={3}
                  variant="title"
                  className="mb-1 text-fg-heading"
                >
                  {job.position}
                </Heading>
                <p className="font-serif text-2xl italic">
                  {job.url ? (
                    <a href={job.url} target="_blank" rel="noreferrer nofollow">
                      {job.name}
                    </a>
                  ) : (
                    job.name
                  )}
                </p>
              </div>

              {job.summary &&
                toParagraphs(job.summary).map((paragraph) => (
                  <p key={paragraph} className="mb-4">
                    {paragraph}
                  </p>
                ))}
            </article>
          ))}
        </Section>

        <Section
          title="Skills"
          className="skills"
          contentClassName="leading-loose"
        >
          {resume.skills.map((skill) => (
            <Tag key={skill.name} variant="muted" className="mb-3 mr-2">
              {skill.name}
            </Tag>
          ))}
        </Section>

        <Section title="Education" className="education">
          {resume.education.map((school) =>
            school.studyType ? (
              <div key={school.institution} className="school">
                <Tag as="p" variant="neutral" className="mb-3">
                  {formatYearUTC(school.startDate)}
                  {` - ${school.endDate ? formatYearUTC(school.endDate) : 'Current'}`}
                </Tag>
                <Heading level={3} variant="title" className="degree mb-4">
                  {school.studyType}
                </Heading>
                {school.institution && (
                  <p className="institution">{school.institution}</p>
                )}
                {school.area && <p className="area">{school.area}</p>}
              </div>
            ) : null,
          )}
        </Section>
      </div>
    </main>
  );
}
