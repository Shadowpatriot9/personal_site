'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import logger from '@/lib/logger';
import Nav from '@/components/Nav';
import ProjectSearch from '@/components/ProjectSearch';
import ProjectGrid from '@/components/ProjectGrid';
import ContactForm from '@/components/ContactForm';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import type { Project } from '@/lib/projects';
import type { SiteContent } from '@/lib/siteContent';

function HomeClient({
  initialProjects,
  content,
}: {
  initialProjects: Project[];
  content: SiteContent;
}) {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(initialProjects);

  useEffect(() => {
    logger.pageView('Homepage', { projectCount: initialProjects.length });
  }, [initialProjects.length]);

  const projectGridProps = useMemo(
    () => ({
      projects: filteredProjects,
      emptyMessage: 'Try adjusting your search or filters to find more projects.',
    }),
    [filteredProjects],
  );

  return (
    <div id="body1">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Nav />

      <main className="main1" id="main-content" role="main">
        <section className="section1 reveal" id="about" aria-labelledby="about-heading">
          <h1 className="intro-name" id="about-heading">
            {content.name}
          </h1>
          {content.tagline && <p className="intro-tagline">{content.tagline}</p>}
          {content.note && <p className="intro-note">{content.note}</p>}
        </section>

        <section
          className="section1 reveal"
          id="projects"
          aria-labelledby="projects-heading"
          style={{ animationDelay: '0.05s' }}
        >
          <h2 className="section-header" id="projects-heading">
            Projects
          </h2>

          <ProjectSearch
            projects={initialProjects}
            onFilteredResults={setFilteredProjects}
            className="projects-search"
          />

          <ProjectGrid {...projectGridProps} />
        </section>

        <section
          className="section1 reveal"
          id="contact"
          aria-labelledby="contact-heading"
          style={{ animationDelay: '0.1s' }}
        >
          <h2 className="section-header" id="contact-heading">
            Contact
          </h2>
          <ContactForm links={content.contactLinks} />
        </section>
      </main>

      <footer className="footer1" role="contentinfo">
        <div className="graphic1">
          <p>© {new Date().getFullYear()} {content.name}</p>
        </div>
        <div className="footer1__right">
          <Link href="/admin" className="footer-admin">
            Admin
          </Link>
          <ThemeSwitcher />
        </div>
      </footer>
    </div>
  );
}

export default HomeClient;
