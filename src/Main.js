import React from 'react';
import { Link } from 'react-router-dom';

import './styles/styles_page.css';
import './styles/styles_projects.css';
import './styles/styles_mobile.css';

import { useEffect } from 'react';

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
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      initializeAnimations();
    } else {
      document.addEventListener('DOMContentLoaded', initializeAnimations);
    }
    return () => {
      document.removeEventListener('DOMContentLoaded', initializeAnimations);
    };
  },[]);

  return (
        <div>
          {/* Page Head */}
            {/* Encoding */}
              <meta charSet="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            {/* Site Tab Title */}
            <title> GS </title>           
            
            {/* External Links */}
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
              <link href="https://fonts.googleapis.com/css2?family=Afacad+Flux:wght@100..1000&display=swap" rel="stylesheet" />

              <link rel="stylesheet" href="./styles/styles_page.css" />
              <link rel="stylesheet" href="./styles/styles_mobile.css" />
              <link rel="stylesheet" href="./styles/styles_projects.css" />

          {/* Page Body */}
            {/* Home Splash Screen */}
            <div className="splash-screen" id="splash-screen"> 
              <div className="splash-logo">
                Grayden Scovil
                <div id="splash-overlay"> </div>
              </div> 
            </div>

            {/* Fade Out Overlay */}
            <div className="overlay" id="overlay" />

            {/* Page Title */}
            <header className="header"> 
              <Link to="/input">
                <button className="input" id="input">
                  <h1 id="main-title"> GS</h1>
                  <h1 id="full-name"> Grayden Scovil </h1>
                  <div class="full-name-cover" id="full-name-cover"> </div>
                </button>
              </Link>
            </header>

          {/* Main */}
          <main> 
            {/* Home Grid */}
            <div className="grid-1">
              {/* About Section */}
              <section className="section" id="about"> 
                <h1 className="section-header" id="about"> About </h1> 
                <p>
                  Welcome welcome. 😁 <br />
                  To keep it simple, I'm Grayden and I'm in Colorado. 
                  <br /> 
                  <br />
                  Feel free to check out my stuff below and click on the fancy stuff in the 'Contact' section 
                  if want to see more of me.
                </p> 
              </section>
              {/* Contact Section */}
              <section className="section" id="contact"> 
                <h1 className="section-header" id="contact"> Contact </h1> 
                <div className="contact-info">
                  <p> Email: gscovil9@gmail.com </p> 
                  <p> LinkedIn: <a href="https://www.linkedin.com/in/gscovil/" target="_blank"> linkedin.com/in/gscovil </a></p> 
                  <p> GitHub: <a href="https://github.com/Shadowpatriot9" target="_blank"> github.com/Shadowpatriot9 </a> 
                  </p></div>
              </section>
            </div>

            <div className="grid-2">
              {/* Projects Section */}
              <section className="section" id="projects"> 
                <h1 className="section-header" id="projects"> Projects </h1> 
                <div className="projects-grid">

                  {/* Project Card | S_Im */}
                  <Link to="/projects/sim">
                    <button className="card" id="s9ql-btn">
                      <h3> S_Im </h3> 
                      <p> Shadow Simulator (tbd) </p>
                    </button> 
                  </Link>

                  {/* Project Card | sOS */}
                  <Link to="/projects/sos">
                    <button className="card" id="sos-btn">
                      <h3> sOS </h3> 
                      <p> Shadow Operating System </p>
                    </button>
                  </Link>

                  {/* Project Card | S9 */}
                  <Link to="/projects/s9">
                    <button className="card" id="s9-btn">
                        <h3>S9</h3>
                        <p>Shadow Home Server</p>
                    </button>
                  </Link>

                  {/* Project Card | NFI */}
                  <Link to="/projects/NFI">
                    <button className="card" id="nfi-btn">
                      <h3> NFI </h3> 
                      <p> (old, incomplete) <br /> Rocket Propulsion System </p>
                    </button>
                  </Link>

                  {/* Project Card | Muse */}
                  <Link to="/projects/Muse">
                    <button className="card" id="muse-btn">
                      <h3> Muse </h3> 
                      <p> (old, incomplete) <br /> Automated Audio Equalizer </p>
                    </button> 
                  </Link>

                  {/* Project Card | EyeLearn */}
                  <Link to="/projects/EL">
                    <button className="card" id="el-btn">
                      <h3> EyeLearn </h3> 
                      <p> (old, incomplete) <br /> Academia AR/VR Headset </p>
                    </button>
                  </Link>

                  {/* Project Card | Naton */}
                  <Link to="/projects/Naton">
                    <button className="card" id="naton-btn">
                      <h3> Naton </h3> 
                      <p> (old, incomplete) <br /> Element Converter </p>
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
          <footer className="footer"> 
            {/* Copyright */}
            <div className="graphic">
              <p> © 2024 Grayden Scovil </p> 
            </div>
            {/* Love Note */}
            <div className="love-note">
              <p> Made with ♥ </p>
            </div>        
          </footer>

        </div>
  );
}
  
export default Main;

// For Button fade out actions for each project card
// // S9
// document.getElementById('s9-btn').addEventListener('click', function () {
//     const mainContent = document.getElementById('overlay');
//     mainContent.classList.add('fade-out');
//     setTimeout(() => {
//     }, 500);
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
    