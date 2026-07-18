'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import logger from '@/lib/logger';
import Nav from '@/components/Nav';
import ThemeSwitcher from '@/components/ThemeSwitcher';

interface SubPageProps {
  slug: string;
  pageTitle: string;
  pageDescription?: string;
  logData?: Record<string, unknown>;
  children: React.ReactNode;
}

/**
 * Shared shell for project sub-pages: nav, content column, footer.
 * Children provide the grid-1/grid-2/grid-3 content sections.
 */
const SubPage = ({ slug, pageTitle, pageDescription, logData = {}, children }: SubPageProps) => {
  useEffect(() => {
    logger.pageView(`${pageTitle} Project Page`, {
      project: slug,
      projectType: pageDescription,
      ...logData,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <div className="subpage" id="body2">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Nav />

      <main role="main" id="main-content">
        <div className="container">{children}</div>
      </main>

      <footer role="contentinfo">
        <div className="graphic">
          <p>© {new Date().getFullYear()} Grayden Scovil</p>
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
};

export default SubPage;
