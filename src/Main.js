import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logger from './utils/logger';
import ThemeSwitcher from './components/ThemeSwitcher';
import ProjectSearch, { publishedProjectsData } from './components/ProjectSearch';
import ProjectSearch from './components/ProjectSearch';
import ProjectGrid from './components/ProjectGrid';
import ContactForm from './components/ContactForm';
import MobileEnhancements from './components/MobileEnhancements';
import { useTheme } from './contexts/ThemeContext';
import { useProjects } from './contexts/ProjectsContext';

import styles from './styles/styles_page.css';
import './styles/styles_mobile.css';

export function initializeAnimations() {
  /////////////////////////////////////
  // Animations 
  /////////////////////////////////////

  // Splash Screen Fade-Out
  const splash = document.getElementById("splash-screen");
  setTimeout(() => {
    splash.style.opacity = 0;
    splash.style.pointerEvents = "none";
  }, 500);

  // Smooth Scroll for Navigation Link
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function Main() {
  const { theme } = useTheme();
  const [filteredProjects, setFilteredProjects] = useState(publishedProjectsData);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const { projects, loading: projectsLoading, error: projectsError, refresh: refreshProjects } = useProjects();
  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    setFilteredProjects(projects);
  }, [projects]);
  
  useEffect(() => {
    // Log page view
    logger.pageView('Homepage', {
      hasProjects: true,
      sections: ['about', 'contact', 'projects'],
      projectCount: publishedProjectsData.length
      projectCount: projects.length
    });
    
    // Log performance timing
    if (window.performance && window.performance.timing) {
      const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      if (loadTime > 0) {
        logger.performance('Page Load Time', loadTime, 'ms');
      }
    }
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      initializeAnimations();
    } else {
      document.addEventListener('DOMContentLoaded', initializeAnimations);
    }
    return () => {
      document.removeEventListener('DOMContentLoaded', initializeAnimations);
    };
  }, []);

  return (
    <div className={styles.body1} id='body1'>
      {/* Page Head - These meta tags should be in the HTML head, not here */}

      {/* Page Body */}
      {/* Home Splash Screen */}
      <div className="splash-screen" id="splash-screen" role="presentation" aria-hidden="true">
        <div className="splash-logo">
          Grayden Scovil
          <div id="splash-overlay"> </div>
        </div>
      </div>

      {/* Fade Out Overlay */}
      <div className="overlay1" id="overlay" role="presentation" aria-hidden="true" />

      {/* Page Title */}
      <header className="header1" role="banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <Link to="/admin" aria-label="Navigate to admin panel">
          <button 
            className="input" 
            id="input" 
            onClick={() => logger.interaction('click', 'admin-access', { destination: '/admin', source: 'homepage-header' })}
            aria-label="Grayden Scovil - Click to access admin panel"
            title="Admin Access"
          >
            <h1 id="main-title" aria-hidden="true"> GS </h1>
            <h1 id="full-name" aria-hidden="true"> Grayden Scovil </h1>
            <div className="full-name-cover" id="full-name-cover" aria-hidden="true"> </div>
          </button>
        </Link>
        
        {/* Theme Switcher */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          zIndex: 100 
        }}>
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main */}
      <main className="main1" id="main-content" role="main">
        {/* Home Grid */}
        <div className="grid-11">
          {/* About Section */}
          <section className="section1" id="about" aria-labelledby="about-heading">
            <h2 className="section-header" id="about-heading"> About </h2>
            <p>
              Welcome welcome.
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                height="20px" 
                viewBox="0 -900 900 900" 
                width="24px" 
                fill={theme.text} 
                style={{ verticalAlign: "middle" }}
                role="img"
                aria-label="Sound wave icon"
              >
                <path d="M260-280q-26 0-43-17t-17-43q0-25 17-42.5t43-17.5q25 0 42.5 17.5T320-340q0 26-17.5 43T260-280Zm0-280q-26 0-43-17t-17-43q0-25 17-42.5t43-17.5q25 0 42.5 17.5T320-620q0 26-17.5 43T260-560Zm140 120v-80h160v80H400Zm288 200-66-44q28-43 43-92.5T680-480q0-66-21.5-124T598-709l61-51q48 57 74.5 128.5T760-480q0 67-19 127.5T688-240Z" />
              </svg>
              <br />
              To keep it simple, I'm Grayden and I'm in Colorado.

              <br />
              <br />
              Feel free to check out my stuff below and click on the fancy stuff in the 'Contact' section
              if want to see more of me.
            </p>
          </section>
          {/* Contact Section */}
          <section className="section1" id="contact" aria-labelledby="contact-heading">
            <h2 className="section-header" id="contact-heading"> Contact </h2>
            <ContactForm />
          </section>
        </div>

        <div className="grid-21" style={{ width: '100%' }}>
          {/* Projects Section */}
          <section className="section1" id="projects" aria-labelledby="projects-heading" style={{ width: '100%' }}>
            <h2 className="section-header" id="projects-heading"> Projects </h2>
            
            {/* Search & Filter Component */}
            <ProjectSearch
              onFilteredResults={setFilteredProjects}
              onLoadingChange={setIsProjectLoading}
              className="projects-search"
            />

            {/* Dynamic Project Grid */}
            {isProjectLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: theme.textSecondary,
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                }}>
                  ⏳
                </div>
                <h3 style={{
                  color: theme.text,
                  marginBottom: '8px',
                }}>
                  Loading Projects
                </h3>
                <p>Fetching the latest list. Hang tight!</p>
              </div>
            ) : (
              <ProjectGrid
                projects={filteredProjects}
                emptyMessage="Try adjusting your search or filters to find more projects."
              />
            )}
            <ProjectGrid
              projects={filteredProjects}
              loading={projectsLoading}
              error={projectsError}
              onRetry={refreshProjects}
              emptyMessage="Try adjusting your search or filters to find more projects."
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer1" role="contentinfo">
        {/* Copyright */}
        <div className="graphic1">
          <p> © 2025 Grayden Scovil </p>
        </div>
        {/* Love Note */}
        <div className="love-note1">
          <p>
            Made with
            <svg 
              version="1.0" 
              id="Layer_1" 
              xmlns="http://www.w3.org/2000/svg" 
              xmlnsXlink="http://www.w3.org/1999/xlink" 
              width="23px" 
              height="13px" 
              viewBox="0 0 64 64" 
              enableBackground="new 0 0 64 64" 
              xmlSpace="preserve" 
              fill={theme.danger}
              role="img"
              aria-label="Heart icon"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth={0} />
              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
              <g id="SVGRepo_iconCarrier"> 
                <path fill={theme.danger} d="M47.977,5.99c-4.416,0-8.414,1.792-11.308,4.686l-4.685,4.654l-4.686-4.654 C24.406,7.782,20.408,5.99,15.992,5.99C7.161,5.99,0,13.15,0,21.982c0,4.416,2.85,8.539,5.747,11.432l23.41,23.414 c1.562,1.562,4.092,1.562,5.653,0l23.349-23.352c2.896-2.893,5.81-7.078,5.81-11.494C63.969,13.15,56.808,5.99,47.977,5.99z" /> 
              </g>
            </svg>
          </p>
        </div>
      </footer>

      {/* Mobile Enhancements */}
      <MobileEnhancements />
    </div>
  );
}

export default Main;

// For Button fade out actions for each project card
// // S9
// script.js
// document.getElementById('s9-btn').addEventListener('click', function () {
//   const mainContent = document.getElementById('overlay');
//   mainContent.classList.add('fade-out');
//   setTimeout(() => {
//   }, 500);
// });



//** placeholder for new function, its broken */
// // Splash Screen Check if Visited
// const splash = document.getElementById("splash-screen");
// const body = document.body;
// const lastVisit = localStorage.getItem('lastVisit');
// const now = new Date().getTime();
// const threeMinutes = 3 * 60 * 1000;

// if (lastVisit && (now - lastVisit) < threeMinutes) {
//     // Skip splash screen
//     splash.style.display = 'flex';
// }


