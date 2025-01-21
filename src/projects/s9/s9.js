// import React, { useEffect } from 'react';
import React from 'react';
// import { initializeAnimations } from '../../script';

function S9() {
  // useEffect(() => {
  //   if (document.readyState === 'complete' || document.readyState === 'interactive') {
  //     initializeAnimations();
  //   } else {
  //     document.addEventListener('DOMContentLoaded', initializeAnimations);
  //   }
  //   return () => {
  //     document.removeEventListener('DOMContentLoaded', initializeAnimations);
  //   };
  // }, []);
  return (
    <div>
        {/* Page Head */}
        {/* Encoding */}
        <meta charSet="UTF-8" name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Site Tab Title */}
        <title> S9 </title>
        {/* External Links */}
        <link rel="stylesheet" href="styles.css" />
        {/* Body */}
        {/* Fade Out Overlay */}
        <div className="overlay" id="overlay" />
        {/* Page Title */}
        <header id="header">
          <button id="gs-btn"> GS </button> 
        </header>
        {/* Main */}
        <main>
          <div className="container">
            {/* Top Grid */}
            <div className="grid-1">
              {/* Section | S9 */}
              <section id="title">
                <h1> S9 </h1>
              </section>
              {/* Section | Brief */}
              <section className="section" id="brief">
                <h3> Description: <p> (Date of origin: 10/2024) </p> </h3>
                This is some info about my home server. I mainly use it for redundancy to my PAN and in specific cases to allow
                more integration all around for files or other client to client connections reasons. Trying to develop it further
                to more an all around hosting platform idea for software development purposes but still working out the kinks 
                to optimize the development workflow on it to make it feasible. Anywho, feel free to check her out below. 😊
              </section>
            </div>
            {/* Mid Grid */}
            <div className="grid-2">
              {/* Section | Features */}
              <section className="section" id="features">
                <h3> Features: </h3>
                <li> Backup NAS File System (NAS via SAMBA, may switch to NFS) </li>
                <li> VM Hosting (Virtual Box w/specific OS imaged to preference) </li>
                <li> Site and Web Application Hosting (Docker and Apache) </li>
                <li> Accessible Anywhere (SSH and AnyDesk for RDP) </li>
                <li> Monitoring (HTOP, WireShark, Prometheus) </li>
              </section>
              {/* Section | Specs */}
              <section className="section" id="specs">
                <h3> Specifications: </h3>
                OS: Ubuntu Server w/GNOME Desktop <br />
                CPU: i7-13700K <br />
                RAM: 32GB DDR5 5600 <br />
                Storage: 1TB NVMe <br />
                Secret Name: Sally
              </section>
            </div>
            {/* Bot Grid */}
            <div className="grid-3">
              {/* Section | Monitor */}
              <section className="section" id="monitor">
                <h3> Monitoring Dashboard </h3> 
                <div id="status-container">
                  Status:
                  <div id="status-indicator"> </div> 
                </div>
                <p> 
                  Network Traffic:
                </p>
                <canvas id="myChart" />
              </section>
            </div>
          </div>
        </main>
        {/* Footer */}
        <footer> 
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

export default S9;