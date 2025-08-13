// app.js
// Das Hauptskript für die Website, das Scroll-Animationen und die Navigation verwaltet.

import { loadTimeline, loadAstronauts } from './data-loader.js';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

    // GSAP-Animation für den Titelbereich
    gsap.from("#title", {
        y: 50,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".header-container",
            start: "top center",
            end: "bottom center",
            toggleActions: "play reverse play reverse",
        }
    });

    // Warten, bis der Preloader die Daten geladen hat, bevor die Timeline animiert wird.
    // Dies stellt sicher, dass alle Elemente im DOM sind.
    document.addEventListener('preloaderHidden', () => {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            gsap.to(item, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 80%",
                    toggleClass: "is-active"
                }
            });
        });
    });
});
