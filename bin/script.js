/////////////////////////////////////
// Splash Screen Fade-Out
/////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
    const splash = document.getElementById("splash-screen");
    setTimeout(() => {
        splash.style.opacity = 0; // Fade out
        splash.style.pointerEvents = "none"; // Disable interactions
    }, 500); // 3-second delay
});

/////////////////////////////////////
// Smooth Scroll for Navigation Link
/////////////////////////////////////

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault(); // Prevent default anchor behavior
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

/////////////////////////////////////
// Highlighitng
/////////////////////////////////////

window.addEventListener('scroll', () => {
    let sections = document.querySelectorAll('section');
    let headers = document.querySelectorAll('.section-header');
  
    // 30% of the viewport height
    let triggerPoint = window.innerHeight * 0.3;
  
    let leftmostSection = null;
  
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const header = headers[index];
  
      // Check if the section is in the 30% trigger range
      if (rect.top <= triggerPoint && rect.bottom > triggerPoint) {
        // Check for the leftmost section
        if (leftmostSection === null || rect.left < leftmostSection.getBoundingClientRect().left) {
          leftmostSection = section;
        }
      }
    });
  
    // Highlight the leftmost section
    if (leftmostSection) {
      const index = Array.from(sections).indexOf(leftmostSection);
      headers[index].classList.add('highlighted');
    }
  
    // Remove highlight from all headers
    sections.forEach((section, index) => {
      if (section !== leftmostSection) {
        headers[index].classList.remove('highlighted');
      }
    });
  });
  

/////////////////////////////////////