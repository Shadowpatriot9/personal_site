'use client';

import React from 'react';
import Link from 'next/link';
import ThemeSwitcher from '@/components/ThemeSwitcher';

/**
 * Slim translucent site nav. Wordmark links home; section links jump to the
 * home page anchors so they work from sub-pages too.
 */
const Nav = () => {
  return (
    <nav className="site-nav" aria-label="Primary">
      <div className="site-nav__inner">
        <Link href="/" className="site-nav__mark" aria-label="Home">
          GS
        </Link>

        <div className="site-nav__right">
          <Link href="/#projects" className="site-nav__link">
            Projects
          </Link>
          <Link href="/#contact" className="site-nav__link">
            Contact
          </Link>
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Nav;
