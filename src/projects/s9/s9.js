import React, { useEffect } from 'react';
// import { initializeAnimations } from './script';
// import './projects/s9/styles.css';

const S9 = () => {
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
      {/* Header */}
      <header id="header">
        <button id="gs-btn">GS</button>
      </header>

      {/* Main Content */}
      <main>
        <div className="container">
          {/* Top Grid */}
          <div className="grid-1">
            <section id="title">
              <h1>S9</h1>
            </section>
            <section className="section" id="brief">
              <h3>Description:</h3>
              <p>(Date of origin: 10/2024)</p>
              <p>
                This is some info about my home server. I mainly use it for redundancy to my PAN and in specific cases to allow
                more integration all around for files or other client-to-client connections. Trying to develop it further as
                an all-around hosting platform idea for software development purposes, but still working out the kinks
                to optimize the development workflow on it. Feel free to check her out below. 😊
              </p>
            </section>
          </div>

          {/* Mid Grid */}
          <div className="grid-2">
            <section className="section" id="features">
              <h3>Features:</h3>
              <ul>
                <li>Backup NAS File System (NAS via NFS)</li>
                <li>VM Hosting (Virtual Box w/specific OS imaged to preference)</li>
                <li>Accessible Anywhere (SSH and AnyDesk for RDP)</li>
                <li>Monitoring (HTOP, WireShark, Prometheus)</li>
                <li>Auto Config Script, Auto Install ISO for re-imaging purposes</li>
              </ul>
            </section>
            <section className="section" id="specs">
              <h3>Specifications:</h3>
              <p>OS: Ubuntu Server w/GNOME Desktop</p>
              <p>CPU: i7-13700K</p>
              <p>RAM: 32GB DDR5 5600</p>
              <p>Storage: 1TB NVMe</p>
              <p>Secret Name: Sally</p>
            </section>
          </div>

          {/* Bot Grid */}
          <div className="grid-3">
            <section className="section" id="monitor">
              <h3>Monitoring Dashboard</h3>
              <div id="status-container">
                <p>Status:</p>
                <div id="status-indicator"></div>
              </div>
              <p>Network Traffic:</p>
              <canvas id="myChart"></canvas>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <div className="graphic">
          <p>© 2024 Grayden Scovil</p>
        </div>
        <div className="love-note">
          <p>Made with ♥</p>
        </div>
      </footer>
    </div>
  );
};

export default S9;
