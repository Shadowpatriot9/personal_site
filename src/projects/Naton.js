import React from 'react';
import { Link } from 'react-router-dom';

import './../styles/styles_sub.css';
import styles1 from './../styles/styles_sub.css';

function Naton () {
  return (
<div className={styles1.body2} id='body2'>
  {/* Page Head */}
  {/* Encoding */}
  <meta charSet="UTF-8" name="viewport" content="width=device-width, initial-scale=1.0" />
  {/* Site Tab Title */}
  <title> Naton </title>
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
          <h1> Naton </h1>
        </section>
        {/* Section | Brief */}
        <section className="section" id="brief">
          <h3> Description: <p> (Date of origin: 05/2017) </p> </h3>
          <h4> ⚠ This project has been discontinued as of: 08/2017. ⚠ </h4>
          Naton will be remembered to me as the first project I started to pursue as an official effort. The idea
          was ambitious as the idea of the machine as a whole was to (with a base input of water) atomically
          convert the H20 molecule into a chosen element into a basic gemotric shape chosen to preference. The project was 
          briefly attempted during my summer break in between college semesters independently and was also my first introduction
          into being introduced to higher ups as although the main limitation to the project was a lack of education/knowledge, 
          I was able to get the design to a basic conceptual process and would reach out to academia professionally nationally
          to obtain their feedback and criticism. 
          <br />
          <br />
          Although most feedback was the same response of being impractical or flat out incorrect
          of a concept, I would say the main take away I had from the project was the ability to take a concept and break it down into
          several comepents and then create something to which I had to communicate with others to validate the concept on a technical level 
          (as well as learned some science, engineering concepts, learned some small skills like CAD and technical writing, etc...).
          Furthermore with the intent of the project to become a business, I used this social networking uhhh momemtum (in a word) to then reach 
          out to academia department heads ranging from business operations to exectutive leadership as well as other executive leaders 
          in my city and obtained a lot of advice and some words of widsom of how they viewed their roles in leadership and for some 
          would go through their backstories of creating their own business and how they achieved it.
        </section>
      </div>
      {/* Mid Grid */}
      <div className="grid-2">
        {/* Section | Background */}
        <section className="section" id="background">
          <h3> Background: </h3>
          Sooo, how did it get to this crazy idea. Well, it all started with a picture. I was on my laptop and was looking for a wallpaper
          and recently was on a sci-fi kick for my wallpaper and so I would Google a bunch of sci-fi landscapes and backgrounds to see what struck to me.
          As I scrolled through, I came across a picture (if I find it again, I'll post it here) where it was a perspective of a person on a hill overlooking
          a space station (all made in the future) off into the horizon. The space station though, was designed as a cube, but the scale is so large that the people next
          to it were the size of ants. I was intrigued by the size of the station that I started to think about how it would be built and more importantly, how 
          it could be built practically.
          <br />
          <br />
          After much thought, I came to an idea that we (as a species) needed a better way to obtain materials which led to an idea of creating a duplicator machine (yes, like in Star Trek lol).
          After briefly drafting it, I quickly noticed the scope of the project and narrowed it down to the concept of simply concerting a base element into another.
          Water was chosen as the ideal input primarily due to two reasons. 1. It's the most abundant resource on the planet and 2. It's a simple molecule to break down.
          Then once the idea was finalized, it was off to the races of concepts and designs. 😀
        </section>
        {/* Section | Concept */}
        <section className="section" id="concept">
          <h3> Concept: </h3>
          Core: 
          <li></li>
          Sub: 
          <li></li>
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

export default Naton;