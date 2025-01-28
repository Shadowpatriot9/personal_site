import React from 'react';
import { Link } from 'react-router-dom';

import './../styles/styles_sub.css';
import styles1 from './../styles/styles_sub.css';

function Sim() {
  return (
<div className={styles1.body2} id='body2'>
  {/* Page Head */}
  {/* Encoding */}
  <meta charSet="UTF-8" name="viewport" content="width=device-width, initial-scale=1.0" />
  {/* Site Tab Title */}
  <title> S_Im </title>
  {/* External Links */}
  <link rel="stylesheet" href="styles.css" />
  {/* Body */}
  {/* Fade Out Overlay */}
  <div className="overlay" id="overlay" />
  {/* Page Title */}
{/* Header */}
<header id="header">
<Link to="/">
  <button id="gs-btn">GS</button>
</Link>        
</header>
  {/* Main */}
  <main>
    <div className="container">
      {/* Top Grid */}
      <div className="grid-1">
        {/* Section | S9 */}
        <section id="title">
          <h1> S_Im </h1>
        </section>
        {/* Section | Brief */}
        <section className="section" id="brief">
          <h3> Description: <p> (Date of origin: 12/2024) </p> </h3>
          WIP, see link below <br />
          <a href="https://github.com/Shadowpatriot9/S_im"> Link </a>
        </section>
      </div>
    </div>
  </main>
  {/* Footer */}
  <footer> 
    {/* Copyright */}
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

export default Sim;