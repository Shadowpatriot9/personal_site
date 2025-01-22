import React from 'react';
import { Link } from 'react-router-dom';
// import "./projects/**/** .css"; name of css file

function sOS () {
  return (
    <div>
    {/* Page Head */}
    {/* Encoding */}
    <meta charSet="UTF-8" name="viewport" content="width=device-width, initial-scale=1.0" />
    {/* Site Tab Title */}
    <title> sOS </title>
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
            <h1> sOS </h1>
            </section>
            {/* Section | Brief */}
            <section className="section" id="brief">
            <h3> Description: <p> (Date of origin: 12/2024) </p> </h3>
            WIP, see link below <br />
            <a href="https://github.com/Shadowpatriot9/sOS"> Link </a>
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

export default sOS;


