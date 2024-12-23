/////////////////////////////////////
// Animations 
/////////////////////////////////////

// Splash Screen Fade-Out
document.addEventListener("DOMContentLoaded", () => {
    const splash = document.getElementById("splash-screen");
    setTimeout(() => {
        splash.style.opacity = 0; 
        splash.style.pointerEvents = "none"; 
    }, 500); 
});

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

// Highlighter
window.addEventListener('scroll', () => {
    let sections = document.querySelectorAll('section');
    let headers = document.querySelectorAll('.section-header');
  
    let triggerPoint = window.innerHeight * 0.3;
    let leftmostSection = null;
  
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const header = headers[index];
  
      if (rect.top <= triggerPoint && rect.bottom > triggerPoint) {
        if (leftmostSection === null || rect.left < leftmostSection.getBoundingClientRect().left) {
          leftmostSection = section;
        }
      }
    });
  
    if (leftmostSection) {
      const index = Array.from(sections).indexOf(leftmostSection);
      headers[index].classList.add('highlighted');
    }
  
    sections.forEach((section, index) => {
      if (section !== leftmostSection) {
        headers[index].classList.remove('highlighted');
      }
    });
  });
  
/////////////////////////////////////
// Buttons
/////////////////////////////////////

// S9
document.getElementById('s9-btn').addEventListener('click', function () {
  const mainContent = document.getElementById('overlay');
  mainContent.classList.add('fade-out');
  setTimeout(() => {
    window.location.href = 'projects/s9/index.html';
  }, 500);
});

// NFI
document.getElementById('nfi-btn').addEventListener('click', function () {
  const mainContent = document.getElementById('overlay');
  mainContent.classList.add('fade-out');
  setTimeout(() => {
    window.location.href = 'projects/nfi/index.html';
  }, 500);
});

// Naton
document.getElementById('naton-btn').addEventListener('click', function () {
  const mainContent = document.getElementById('overlay');
  mainContent.classList.add('fade-out');
  setTimeout(() => {
    window.location.href = 'projects/naton/index.html';
  }, 500);
});

// Muse
document.getElementById('muse-btn').addEventListener('click', function () {
  const mainContent = document.getElementById('overlay');
  mainContent.classList.add('fade-out');
  setTimeout(() => {
    window.location.href = 'projects/muse/index.html';
  }, 500);
});

// EyeLearn
document.getElementById('el-btn').addEventListener('click', function () {
  const mainContent = document.getElementById('overlay');
  mainContent.classList.add('fade-out');
  setTimeout(() => {
    window.location.href = 'projects/eye-learn/index.html';
  }, 500);
});

/////////////////////////////////////