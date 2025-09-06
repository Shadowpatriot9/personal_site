import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logger from './utils/logger';

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
  useEffect(() => {
    // Log page view
    logger.pageView('Homepage', {
      hasProjects: true,
      sections: ['about', 'contact', 'projects'],
      projectCount: 7
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
      {/* Page Head */}
      {/* Encoding */}
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Site Tab Title */}
      <title> GS </title>

      {/* Page Body */}
      {/* Home Splash Screen */}
      <div className="splash-screen" id="splash-screen">
        <div className="splash-logo">
          Grayden Scovil
          <div id="splash-overlay"> </div>
        </div>
      </div>

      {/* Fade Out Overlay */}
      <div className="overlay1" id="overlay" />

      {/* Page Title */}
      <header className="header1">
        <Link to="/admin">
          <button className="input" id="input" onClick={() => logger.interaction('click', 'admin-access', { destination: '/admin', source: 'homepage-header' })}>
            <h1 id="main-title"> GS </h1>
            <h1 id="full-name"> Grayden Scovil </h1>
            <div class="full-name-cover" id="full-name-cover"> </div>
          </button>
        </Link>
      </header>

      {/* Main */}
      <main className="main1" id="main1">
        {/* Home Grid */}
        <div className="grid-11">
          {/* About Section */}
          <section className="section1" id="about">
            <h1 className="section-header" id="about"> About </h1>
            <p>
              Welcome welcome.
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -900 900 900" width="24px" fill="#000000" style={{ verticalAlign: "middle" }}>
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
          <section className="section1" id="contact">
            <h1 className="section-header" id="contact"> Contact </h1>
            <div className="contact-info">
              <p> Email: gscovil9@gmail.com </p>
              <p> LinkedIn: <a href="https://www.linkedin.com/in/gscovil/" target="_blank"> linkedin.com/in/gscovil </a></p>
              <p> GitHub: <a href="https://github.com/Shadowpatriot9" target="_blank"> github.com/Shadowpatriot9 </a>
              </p></div>
          </section>
        </div>

        <div className="grid-21">
          {/* Projects Section */}
          <section className="section1" id="projects">
            <h1 className="section-header" id="projects"> Projects </h1>
            <div className="projects-grid">

              {/* Project Card | S_Im */}
              <Link to="/projects/sim">
                <button className="card1" id="s9ql-btn" onClick={() => logger.interaction('click', 'project-card', { project: 'S_im', destination: '/projects/sim' })}>
                  <h3> S_im </h3>
                  <p> Shadow Simulator </p>
                </button>
              </Link>

              {/* Project Card | sOS */}
              <Link to="/projects/sos">
                <button className="card1" id="sos-btn" onClick={() => logger.interaction('click', 'project-card', { project: 'sOS', destination: '/projects/sos' })}>
                  <h3> sOS </h3>
                  <p> Shadow Operating System </p>
                </button>
              </Link>

              {/* Project Card | S9 */}
              <Link to="/projects/s9">
                <button className="card1" id="s9-btn" onClick={() => logger.interaction('click', 'project-card', { project: 'S9', destination: '/projects/s9' })}>
                  <h3>S9</h3>
                  <p> Shadow Home Server</p>
                </button>
              </Link>

              {/* Project Card | NFI */}
              <Link to="/projects/NFI">
                <button className="card1" id="nfi-btn" onClick={() => logger.interaction('click', 'project-card', { project: 'NFI', destination: '/projects/NFI' })}>
                  <h3> NFI </h3>
                  <p> Rocket Propulsion System </p>
                </button>
              </Link>

              {/* Project Card | Muse */}
              <Link to="/projects/Muse">
                <button className="card1" id="muse-btn" onClick={() => logger.interaction('click', 'project-card', { project: 'Muse', destination: '/projects/Muse' })}>
                  <h3> Muse </h3>
                  <p> Automated Audio Equalizer </p>
                </button>
              </Link>

              {/* Project Card | EyeLearn */}
              <Link to="/projects/EL">
                <button className="card1" id="el-btn" onClick={() => logger.interaction('click', 'project-card', { project: 'EyeLearn', destination: '/projects/EL' })}>
                  <h3> EyeLearn </h3>
                  <p> Academia AR/VR Headset </p>
                </button>
              </Link>

              {/* Project Card | Naton */}
              <Link to="/projects/Naton">
                <button className="card1" id="naton-btn" onClick={() => logger.interaction('click', 'project-card', { project: 'Naton', destination: '/projects/Naton' })}>
                  <h3> Naton </h3>
                  <p> Element Converter </p>
                </button>
              </Link>

              {/* *** Project Card Template *** */}
              {/* Project Card | **
                  <Link to="/projects/***">
                    <button className="card" id="***-btn">
                        <h3>***</h3>
                        <p>****</p>
                    </button>
                  </Link> */}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer1">
        {/* Copyright */}
        <div className="graphic1">
          <p> © 2025 Grayden Scovil </p>
        </div>
        {/* Love Note */}
        <div className="love-note1">
          <p>
            Made with
            <svg version={1.0} id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="23px" height="13px" viewBox="0 0 64 64" enableBackground="new 0 0 64 64" xmlSpace="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth={0} /><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" /><g id="SVGRepo_iconCarrier"> <path fill="#231F20" d="M47.977,5.99c-4.416,0-8.414,1.792-11.308,4.686l-4.685,4.654l-4.686-4.654 C24.406,7.782,20.408,5.99,15.992,5.99C7.161,5.99,0,13.15,0,21.982c0,4.416,2.85,8.539,5.747,11.432l23.41,23.414 c1.562,1.562,4.092,1.562,5.653,0l23.349-23.352c2.896-2.893,5.81-7.078,5.81-11.494C63.969,13.15,56.808,5.99,47.977,5.99z" /> </g></svg>
          </p>
        </div>
      </footer>

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


