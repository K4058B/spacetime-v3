// preloader.js
// Diese neue Datei steuert das Ladeverhalten der Website.
// Sie wartet, bis alle wichtigen Daten und die 3D-Szenen bereit sind,
// bevor sie den Hauptinhalt anzeigt.

import { loadTimeline, loadAstronauts } from './data-loader.js';

document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('mainContent');

    // Erstellen von Promises für alle wichtigen Ladeaktionen
    const promises = [
        loadTimeline(),
        loadAstronauts(),
        new Promise(resolve => window.addEventListener('globeLoaded', resolve, { once: true })),
        new Promise(resolve => window.addEventListener('budgetsLoaded', resolve, { once: true })),
        // Sicherstellen, dass der Preloader mindestens 2 Sekunden sichtbar ist
        new Promise(resolve => setTimeout(resolve, 2000)) 
    ];

    // Warten, bis alle Promises erfüllt sind
    Promise.all(promises).then(() => {
        // Sanftes Ausblenden des Pre-Loaders
        gsap.to(preloader, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                preloader.style.display = 'none';
                mainContent.classList.remove('hidden');
                // Sanftes Einblenden des Hauptinhalts
                gsap.fromTo(mainContent, { opacity: 0 }, { opacity: 1, duration: 1 });
            }
        });
    });
});
