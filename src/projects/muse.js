import React from 'react';
import { Link } from 'react-router-dom';

import './../styles/styles_sub.css';
import styles1 from './../styles/styles_sub.css';

function Muse() {
  return (
<div className={styles1.body2} id='body2'>
  {/* Page Head */}
  {/* Encoding */}
  <meta charSet="UTF-8" name="viewport" content="width=device-width, initial-scale=1.0" />
  {/* Site Tab Title */}
  <title> Muse </title>
  {/* External Links */}
  {/* <link rel="stylesheet" href="styles.css" /> */}
  {/* Body */}
  {/* Fade Out Overlay */}
  <div className="overlay" id="overlay" />
  {/* Page Title */}
  
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
          <h1> Muse </h1>
        </section>
        {/* Section | Brief */}
        <section className="section" id="brief">
          <h3> Description: <p> (Date of origin: 03/2018) </p> </h3>
          <h4> ⚠ This project has been discontinued as of: 05/2019. ⚠ </h4>
          Out of all my other projects I attempted to complete, Muse was probably the closest one I got to something actually tangible.
          The idea for Muse (inspired by the Greek mythical god of music 😀) was primarily to be a device where a novice song writer would be able to 
          use it as an audio interface to both record and save their music, but also to be completely automated with automated audio production editing tools built in
          as well. That way the user would only need to worry about one thing which was the creative process of making a song and let the device take care of all the 
          technicals of audio production to be able to deploy it on a mmusic hosting platform and have it sound professionally processed.
          <br />
          <br />
          I took this project back an intial concept phase and was going through making valid electrical circuit schematics and device design drafts (to know what it would 
          look like physically) and took it as far as just trying to built just a simple speaker using off the shelf components with a basic volume and equalizer ability. 
          Unfortunately, that is where the story ends on it for the moment as I would pick up the project for about a month when I started it, then dropped it, then picked it
          up for about a week or two a whole year later, then dropped it again. I dont see it as a drawback though, as I still had my takeaways from it and was focused on other
          things at the time and just kind of moved forward in my life but it was still a fun little project and the only one where I tried to make a two-foot tall wooden speaker box
          in my one bedroom apartment with a jigsaw....I'm sure my neighbors loved me for that one. 😅
        </section>
      </div>
      <div className="grid-2">
        {/* Section | Background */}
        <section className="section" id="background">
          <h3> Background: </h3>
          Background time...So around this time I was really into music. I recently had completed a college elective on audio production, I was learning to 
          appreciate music and already had a strong interest in music composition and would occasionally write a little song on my keyboard or guitar.
          I think the inspiration from it came from when I was doodling with my guitar that I kind of ran into a mental block because I was thinking about
          all the small steps of like trying to setup my mics and audio stuff that I would just get lazy and not want to record my song because of it.
          And that's pretty much it....just being lazy, think of a robot and boom; million dollar idea. 😂
        </section>
        {/* Section | Concept */}
        <section className="section" id="concept">
          <h3> Concept: </h3>
          Core: 
          <li> </li>
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

export default Muse;
