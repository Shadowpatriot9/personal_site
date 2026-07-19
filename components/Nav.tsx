'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Slim translucent site nav. Wordmark links home; section links jump to the
 * home page anchors so they work from sub-pages too.
 *
 * On the home page the nav starts hidden so the intro ("Grayden Scovil") reads
 * on its own, then slides in once the intro section scrolls out of view. On
 * pages without an intro section (`#about`) it is visible immediately.
 */
interface NavProps {
  projectsLabel?: string;
  contactLabel?: string;
}

const Nav = ({ projectsLabel = 'Projects', contactLabel = 'Contact' }: NavProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const intro = document.getElementById('about');

    // No intro section (e.g. sub-pages) — keep the nav visible.
    if (!intro) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Reveal the nav once the intro section has scrolled out of view.
        setVisible(!entry.isIntersecting);
      },
      { rootMargin: '-10% 0px 0px 0px', threshold: 0 },
    );

    observer.observe(intro);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={`site-nav${visible ? ' site-nav--visible' : ''}`}
      aria-label="Primary"
      aria-hidden={!visible}
    >
      <div className="site-nav__inner">
        <Link href="/" className="site-nav__mark" aria-label="Home">
          GS
        </Link>

        <div className="site-nav__right">
          <Link href="/#projects" className="site-nav__link">
            {projectsLabel}
          </Link>
          <Link href="/#contact" className="site-nav__link">
            {contactLabel}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
