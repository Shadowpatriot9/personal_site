'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import logger from '@/lib/logger';
import Nav from '@/components/Nav';
import ProjectSearch from '@/components/ProjectSearch';
import ProjectGrid from '@/components/ProjectGrid';
import ContactForm from '@/components/ContactForm';
import type { Project } from '@/lib/projects';

function HomeClient({ initialProjects }: { initialProjects: Project[] }) {
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
      <Nav />

      <main className="main1" id="main-content" role="main">
        <section className="section1 reveal" id="about" aria-labelledby="about-heading">
          <h1 className="intro-name" id="about-heading">
            Grayden Scovil
          </h1>
          <p className="intro-tagline">
            I build software and hardware — home servers, operating systems, simulators, and the
            occasional overambitious hardware experiment. Based in Colorado.
          </p>
          <p className="intro-note">
            Some shipped, some archived, all mine. A few are below — reach out if you want to see
            more.
          </p>
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
          <ContactForm />
        </section>
      </main>

      <footer className="footer1" role="contentinfo">
        <div className="graphic1">
          <p>© {new Date().getFullYear()} Grayden Scovil</p>
        </div>
        <Link href="/admin" className="footer-admin">
          Admin
        </Link>
      </footer>
    </div>
  );
}

export default HomeClient;
