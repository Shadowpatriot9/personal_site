import React,{ useEffect } from 'react';
import { Link } from 'react-router-dom';

import './styles/styles_page.css';
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
              <Link to="/input">
                <button className="input" id="input">
                  <h1 id="main-title"> GS</h1>
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
                  <svg width="23px" height="17px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="#000000">
                    <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                    <g id="SVGRepo_iconCarrier"> {/* Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools */} <title>ic_fluent_emoji_24_filled</title> <desc>Created with Sketch.</desc> <g id="🔍-Product-Icons" stroke="none" strokeWidth={1} fill="none" fillRule="evenodd"> <g id="ic_fluent_emoji_24_filled" fill="#212121" fillRule="nonzero"> <path d="M12.0000002,1.99896738 C17.523704,1.99896738 22.0015507,6.47681407 22.0015507,12.0005179 C22.0015507,17.5242217 17.523704,22.0020684 12.0000002,22.0020684 C6.47629639,22.0020684 1.99844971,17.5242217 1.99844971,12.0005179 C1.99844971,6.47681407 6.47629639,1.99896738 12.0000002,1.99896738 Z M8.46174078,14.7838355 C8.20539113,14.4584777 7.73382403,14.4025354 7.40846617,14.6588851 C7.08310832,14.9152347 7.02716611,15.3868018 7.28351576,15.7121597 C8.41411759,17.1471146 10.1373487,18.0020843 11.9999849,18.0020843 C13.8601276,18.0020843 15.5813083,17.1494133 16.7120717,15.717715 C16.9688032,15.3926584 16.9134148,14.9210259 16.5883582,14.6642944 C16.2633016,14.4075628 15.7916692,14.4629512 15.5349376,14.7880078 C14.6856803,15.8632816 13.396209,16.5020843 11.9999849,16.5020843 C10.6018926,16.5020843 9.31087697,15.8615555 8.46174078,14.7838355 Z M9.00044779,8.75115873 C8.3104845,8.75115873 7.75115873,9.3104845 7.75115873,10.0004478 C7.75115873,10.6904111 8.3104845,11.2497368 9.00044779,11.2497368 C9.69041108,11.2497368 10.2497368,10.6904111 10.2497368,10.0004478 C10.2497368,9.3104845 9.69041108,8.75115873 9.00044779,8.75115873 Z M15.0004478,8.75115873 C14.3104845,8.75115873 13.7511587,9.3104845 13.7511587,10.0004478 C13.7511587,10.6904111 14.3104845,11.2497368 15.0004478,11.2497368 C15.6904111,11.2497368 16.2497368,10.6904111 16.2497368,10.0004478 C16.2497368,9.3104845 15.6904111,8.75115873 15.0004478,8.75115873 Z" id="🎨-Color"> </path> </g> </g> </g>
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
                    <button className="card1" id="s9ql-btn">
                      <h3> S_im </h3> 
                      <p> Shadow Simulator </p>
                    </button> 
                  </Link>

                  {/* Project Card | sOS */}
                  <Link to="/projects/sos">
                    <button className="card1" id="sos-btn">
                      <h3> sOS </h3> 
                      <p> Shadow Operating System </p>
                    </button>
                  </Link>

                  {/* Project Card | S9 */}
                  <Link to="/projects/s9">
                    <button className="card1" id="s9-btn">
                        <h3>S9</h3>
                        <p> Shadow Home Server</p>
                    </button>
                  </Link>

                  {/* Project Card | NFI */}
                  <Link to="/projects/NFI">
                    <button className="card1" id="nfi-btn">
                      <h3> NFI </h3> 
                      <p> Rocket Propulsion System </p>
                    </button>
                  </Link>

                  {/* Project Card | Muse */}
                  <Link to="/projects/Muse">
                    <button className="card1" id="muse-btn">
                      <h3> Muse </h3> 
                      <p> Automated Audio Equalizer </p>
                    </button> 
                  </Link>

                  {/* Project Card | EyeLearn */}
                  <Link to="/projects/EL">
                    <button className="card1" id="el-btn">
                      <h3> EyeLearn </h3> 
                      <p> Academia AR/VR Headset </p>
                    </button>
                  </Link>

                  {/* Project Card | Naton */}
                  <Link to="/projects/Naton">
                    <button className="card1" id="naton-btn">
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
    

