// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll reveal animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
});

// Dynamic scroll exit animation
const IgnoreClasses = ["section reveal scroll-element active", "section reveal scroll-element"];
const scrollElements = Array.from(document.querySelectorAll('.scroll-element')).filter(element => !IgnoreClasses.includes(element.className));
let ticking = false;
let elements = new Set();

function updateScrollElements() {
    const nav = document.querySelector("nav");
    const navHeight = nav.offsetHeight;
    const windowHeight = window.innerHeight;

    scrollElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top;
        const elementBottom = rect.bottom;
        const elementHeight = rect.height;

        // Only apply exit animations if element is mostly out of view
        // Check if element is exiting through top (more aggressive threshold)
        if (elementBottom > 0 && elementTop < navHeight - (elementHeight * 0.4)) {
            if (elements.has(element)) return;

            console.log("top: " + element.className);
            element.classList.add('exiting-top');
            elements.add(element);
        }
        // Check if element is exiting through bottom (more aggressive threshold)
        else if (elementTop < windowHeight && elementBottom > windowHeight + elementHeight * 0.6) {
            if (elements.has(element)) return;

            console.log("bottom: " + element.className);
            element.classList.add('exiting-bottom');
            elements.add(element);
        } else {
            element.classList.remove('exiting-top', 'exiting-bottom');
            elements.delete(element);
        }
    });

    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateScrollElements);
        ticking = true;
    }
}

// Add a small delay before starting scroll animations
setTimeout(() => {
    window.addEventListener('scroll', requestTick);
}, 2000);

// Add scroll effect to navigation
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 100) {
        nav.style.background = 'rgba(10, 10, 10, 0.95)';
    } else {
        nav.style.background = 'rgba(10, 10, 10, 0.8)';
    }
});