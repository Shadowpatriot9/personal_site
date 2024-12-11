// Splash Screen Fade-Out
document.addEventListener("DOMContentLoaded", () => {
    const splash = document.getElementById("splash-screen");
    setTimeout(() => {
        splash.style.opacity = 0; // Fade out
        splash.style.pointerEvents = "none"; // Disable interactions
    }, 500); // 3-second delay
});

// Smooth Scroll for Navigation Links
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

// Interactive Project Cards
const projectCards = document.querySelectorAll('.card');
projectCards.forEach(card => {
    card.addEventListener('click', () => {
        alert(`You clicked on ${card.querySelector('h3').innerText}`);
    });
});
