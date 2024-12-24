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