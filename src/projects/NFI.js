import React from 'react';
import { Link } from 'react-router-dom';

import './../styles/styles_sub.css';
import styles1 from './../styles/styles_sub.css';

function NFI() {
  return (
<div className={styles1.body2} id='body2'>
        {/* Page Head */}
        {/* Encoding */}
        <meta charSet="UTF-8" name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Site Tab Title */}
        <title> NFI </title>
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
                <h1> NFI </h1>
                </section>
                {/* Section | Brief */}
                <section className="section" id="brief">
                <h3> Description: <p> (Date of origin: 10/2020) </p> </h3>
                <h4> ⚠ This project has been discontinued as of: 05/2021. ⚠ <br /> </h4>
                NFI was a project that I started in October of 2020. The goal of the project was to design and
                create a rocket propulsion system aimed to achieve a more efficient way of travel for a 2nd-stage rocket launch vehicle
                to acomplish a long distance journey in an optimial time (e.g. journey to Jupiter). The project itself went no more past the 
                conceptual phase in design as the main limitation to the project was a lack of education/knowledge in developing 
                this system indepently as intended. However, I'm showcasing this incomplete archived project here because 
                during my exploration in developing this system allowed for a lot of self reflection and reignited my 
                interest in engineering to which led to my personal transition of moving to a different location and pursue higher 
                education further in an engineering discipline with the application of aerospace.
                </section>
            </div>
            <div className="grid-2">
                {/* Section | Background */}
                <section className="section" id="background">
                <h3> Background: </h3>
                The design of the system had a few core and sub systems apart from the generic main compents of a traditional/basic propulsion system.
                As I debated and went several iterations of what the influence or main direction to the design would become, the main influence 
                of the concept revolved around the idea of reigniting an old idea and apply it with modern capabilities. 
                <br /> 
                <br />
                More specifically, it revolved around this idea called the "Bussard Ramjet" (<a href="https://en.wikipedia.org/wiki/Bussard_ramjet">Link</a>) 
                that was introduced in 1960 by a pyhsicist named Robert Bussard. The idea was to (in theory) collect hydrogen gas in space during travel and 
                use it as a fuel source for a rocket propulsion system simtaneously in transit 
                by deploying a large magnetic field to collect the gas as the launch vehicle continued. The idea was never implemented due to the lack of 
                technology as well as our limited data of space in general, but the idea was continiously revisted 
                over the years with each revisition having a complication of implementation 
                primarily due to the lack of technology.
                <br />
                <br />
                </section>
                {/* Section | Concept */}
                <section className="section" id="concept">
                <h3> Concept: </h3>
                Core: 
                <li> </li>
                <br />
                Sub: 
                <li> </li>
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

export default NFI;