import React from 'react';
import { Link } from 'react-router-dom';

import './../styles/styles_sub.css';
import styles1 from './../styles/styles_sub.css';

function S9() {
  return (
<div className={styles1.body2} id='body2'>
        {/* Header */}
        <header id="header">
          <Link to="/">
            <button id="gs-btn">GS</button>
          </Link>        
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
                <h3>Description: <p>(Date of origin: 10/2024)</p> </h3>
                
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
                  <li>Backup NAS File System (NAS via NFS)</li>
                  <li>VM Hosting (Virtual Box w/specific OS imaged to preference)</li>
                  <li>Accessible Anywhere (SSH and AnyDesk for RDP)</li>
                  <li>Monitoring (HTOP, WireShark, Prometheus)</li>
                  <li>Auto Config Script, Auto Install ISO for re-imaging purposes</li>
              </section>
              <section className="section" id="specs">
                <h3>Specifications:</h3>
                OS: Ubuntu Server w/GNOME Desktop
                <br /> CPU: i7-13700K 
                <br /> RAM: 32GB DDR5 5600
                <br /> Storage: 1TB NVMe
                <br /> Secret Name: Sally
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
          <p> © 2025 Grayden Scovil </p> 
          </div>
          {/* Love Note */}
          <div className="love-note">
            <p> 
              Made with 
              <svg version="{1.0}" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsxlink="http://www.w3.org/1999/xlink" width="23px" height="13px" viewBox="0 0 64 64" enablebackground="new 0 0 64 64" xmlspace="preserve" fill="#ffffff"><g id="SVGRepo_bgCarrier" strokewidth="{0}" /><g id="SVGRepo_tracerCarrier" strokelinecap="round" strokelinejoin="round" /><g id="SVGRepo_iconCarrier"> <path fill="#ffffff" d="M47.977,5.99c-4.416,0-8.414,1.792-11.308,4.686l-4.685,4.654l-4.686-4.654 C24.406,7.782,20.408,5.99,15.992,5.99C7.161,5.99,0,13.15,0,21.982c0,4.416,2.85,8.539,5.747,11.432l23.41,23.414 c1.562,1.562,4.092,1.562,5.653,0l23.349-23.352c2.896-2.893,5.81-7.078,5.81-11.494C63.969,13.15,56.808,5.99,47.977,5.99z" /> </g></svg>
            </p>
          </div>  
        </footer>
    </div>
  );
}

export default S9;



// /////////////////////////////////////
// // Animations 
// /////////////////////////////////////



// /////////////////////////////
// // Buttons
// /////////////////////////////

// // // GS
// // document.getElementById('gs-btn').addEventListener('click', function () {
// //     const mainContent = document.getElementById('overlay');
// //     mainContent.classList.add('fade-out');
// //     setTimeout(() => {
// //       window.location.href = '../../index.html';
// //     }, 500);
// //   });

// /////////////////////////////
// // Functions | Monitoring Dashboard
// /////////////////////////////

// // Status Indicator
// async function checkServerStatus() {
//   try {
//       const response = await fetch('https://107.2.138.206/status.json');
      
//       if (!response.ok) { throw new Error("Network response was not ok"); }

//       const data = await response.json();
//       const statusIndicator = document.getElementById('status-indicator');
  
//       if (data.status === 'online') { statusIndicator.textContent = '● Online';}
//       else { statusIndicator.textContent = '○ Offline'; }

//   } catch (error) {
//       document.getElementById('status-indicator').innerHTML = '○';
//       document.getElementById('status-indicator').classList.add('emoji');
//       document.getElementById('status-indicator').textContent = 'Error: Unable to reach server';
    
//   }
// }
// window.onload = checkServerStatus;

// // Chart
// const ctx = document.getElementById('myChart').getContext('2d');
//     const myChart = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: ['January', 'February', 'March', 'April', 'May'],
//             datasets: [{
//                 label: 'Monthly Sales',
//                 data: [12, 19, 3, 5, 2],
//                 backgroundColor: [
//                     'rgba(255, 99, 132, 0.2)',
//                     'rgba(54, 162, 235, 0.2)',
//                     'rgba(255, 206, 86, 0.2)',
//                     'rgba(75, 192, 192, 0.2)',
//                     'rgba(153, 102, 255, 0.2)'
//                 ],
//                 borderColor: [
//                     'rgba(255, 99, 132, 1)',
//                     'rgba(54, 162, 235, 1)',
//                     'rgba(255, 206, 86, 1)',
//                     'rgba(75, 192, 192, 1)',
//                     'rgba(153, 102, 255, 1)'
//                 ],
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             scales: {
//                 y: { beginAtZero: true }
//             }
//         }
//     });

// /////////////////////////////