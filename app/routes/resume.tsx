import type { HTMLProps } from "react";
import type { MetaFunction } from "@remix-run/react";
import { Link } from "@remix-run/react";
import clsx from "clsx";

import resume from '../data/resume.json'

export const meta: MetaFunction = () => {
  return [
    {
      title: `${resume.basics.name}'s Resumé — ${resume.basics.label}`,
    },
    {
      name: "description",
      content: `${resume.basics.name}'s professional resumé as ${resume.basics.label}.`,
    }
  ];
};

const resumeStyles = {
  h1: `font-serif text-2xl mb-4`,
  h2: `font-extrabold mb-1`,
  tag: `text-sm py-1 px-5 mb-3 inline-block rounded`,
  tagDateRange: `uppercase tracking-widest bg-primary-300 dark:bg-primary-500 dark:text-primary-100`,
  tagHighlight: "uppercase tracking-widest bg-orange-300 text-orange-800",
  section: [
    "py-12 sm:grid sm:grid-cols-4 sm:grid-flow-col sm:gap-4",
    'container',
    'mx-auto',
  ],
  sectionContent: `sm:col-span-3`,
}

export default function Index() {
  if (process.env.NODE_ENV === 'development')
    console.log('resume', resume);

  return (
    <main className={clsx('bg-primary-200 dark:bg-primary-700',
      'text-primary-900 dark:text-primary-100', 'space-y-20', 'px-6', 'py-24')}>
      <div className={clsx(['resume',
        'container',
        'mx-auto',
        'max-w-3xl'
      ])}>

        {/* INTRO */}
        <header className="container mx-auto mb-6">
          <Section noDivider>
            <div>
              <h1 className={clsx(resumeStyles.h1, "text-2xl mb-4 font-serif")}>{resume.basics.name}</h1>
              <h2 className={clsx(resumeStyles.h2)}>{resume.basics.label}</h2>
              <p className={clsx('dark:text-secondary-200')}>
                <a href={`mailto:${resume.basics.email}`} className={clsx('text-secondary-400 dark:text-secondary-200', 'hover:text-orange-400')}>
                  {resume.basics.email}
                </a>
              </p>
              <p className={clsx('text-secondary-400 dark:text-secondary-200')}>
                {resume.basics.location.address}
              </p>
            </div>
          </Section>
        </header>

        {/* EXPERIENCE */}
        <Section className={clsx("experience")}>
          <div>
            <h1 className={clsx(resumeStyles.h1, "font-serif text-2xl mb-4 italic truncate text-ellipsis")}>Experience</h1>
          </div>

          <div className={clsx(resumeStyles.sectionContent, 'space-y-12')}>
            {resume.work.map((job) => {
              const startDate = new Date(job.startDate);
              const formattedStartDate = startDate.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' });
              const endDate = job.endDate ? new Date(job.endDate) : null;
              const formattedEndDate = endDate ? endDate.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }) : 'Present';
              return (
                <article key={`${job.name}-${job.position}`}>
                  {/* heading */}
                  <div className="mb-6">
                    {/* date ranges / badges */}
                    <p className="mb-2">
                      <span className={clsx(resumeStyles.tag, resumeStyles.tagDateRange, "date-tag mr-2")}>{formattedStartDate}{endDate && ` - ${formattedEndDate}`}</span>
                      {!endDate && <span className={clsx(resumeStyles.tag, resumeStyles.tagHighlight)}>Current Role</span>}
                    </p>
                    <h2 className={clsx(resumeStyles.h2, "font-extrabold space-y-4 text-4xl mb-0 dark:text-primary-200")}>{job.position}</h2>
                    <p className="font-serif text-2xl italic"><Link to={job.url} target="_blank" rel="noreferrer nofollow">{job.name}</Link></p>
                  </div>

                  {/* description */}
                  {job.summary && (
                    <div>
                      {/* TODO: break job.summary into separate paragraphs per break */}
                      {job.summary.split('\n').map((paragraph, i) => (
                        <p key={i} className="mb-4">{paragraph}</p>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </Section>

        {/* SKILLS */}
        <Section className="skills">
          <h1 className={clsx(resumeStyles.h1, "font-serif text-2xl mb-4 italic")}>Skills</h1>
          <div className={clsx(resumeStyles.sectionContent, "leading-loose")}>
            {resume.skills.map((skill) => (
              <span key={skill.name} className={clsx(resumeStyles.tag, "tracking-wide bg-secondary-300 dark:bg-secondary-500 mb-1 mr-2")}>{skill.name}</span>
            ))}
          </div>
        </Section>

        {/* EDUCATION */}
        <Section className={clsx("education")}>
          <h1 className={clsx(resumeStyles.h1, "font-serif text-2xl mb-4 italic")}>Education</h1>

          <div className={clsx(resumeStyles.sectionContent, "")}>
            {resume.education.map((school) => {
              if (!school.studyType) return null;

              const schoolStartDate = new Date(school.startDate).getFullYear();
              const schoolEndDate = school.endDate ? new Date(school.endDate).getFullYear() : 'Current';

              return (
                <div key={school.institution} className="school">
                  {/* degree */}
                  <p className={clsx(resumeStyles.tag, resumeStyles.tagDateRange)}>{schoolStartDate}{schoolEndDate && ` - ${schoolEndDate}`}</p>
                  <h2 className={clsx(resumeStyles.h2, "font-extrabold mb-4 font-sans text-4xl degree")}>{school.studyType}</h2>
                  {school.institution && <p className="institution">{school.institution}</p>}
                  {school.area && <p className="area">{school.area}</p>}
                </div>
              );
            })}
          </div>
        </Section>

      </div>
    </main>
  );
}

type SectionProps = { noDivider?: boolean } & HTMLProps<HTMLTableSectionElement>;
const Section = ({ children, className, noDivider = false, ...props }: SectionProps) => (
  <section
    {...props}
    className={clsx(resumeStyles.section, [
      className,
      {
        'pt-0': noDivider,
        'border-t': !noDivider,
        'border-t-secondary-200': !noDivider,
        'dark:border-t-secondary-500': !noDivider,
      }
    ])}>
    {children}
  </section>
);