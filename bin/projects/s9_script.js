window.addEventListener("load", () => {
    setTimeout(() => {
        // Add 'loaded' class to header and #graphic after page has fully loaded
        const header = document.querySelector('header');
        const body = document.querySelector('body');
        const graphic = document.querySelector('#graphic');
        header.classList.add('loaded'); // Changes header background
        graphic.classList.add('loaded'); // Changes link color
        body.classList.add('loaded'); // Changes link color

    }); // Small delay to trigger the transition
});