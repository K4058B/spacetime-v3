// data-loader.js
// Diese Datei stellt Hilfsfunktionen zum Laden von JSON-Daten bereit.
// Sie wurde beibehalten, da sie bereits gut strukturiert ist.

/**
 * Lädt eine JSON-Datei von der angegebenen URL.
 * @param {string} url - Der Pfad zur JSON-Datei.
 * @returns {Promise<any>} - Ein Promise, das die geparsten JSON-Daten enthält.
 */
export async function fetchJson(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to load JSON file:", error);
    }
}

/**
 * Lädt Satellitendaten und füllt die linke Timeline.
 */
export async function loadTimeline() {
    const data = await fetchJson('./data/satellites_timeline.json');
    const container = document.getElementById('satelliteTimeline');
    
    // Sicherstellen, dass der Container leer ist, bevor neue Elemente hinzugefügt werden
    container.innerHTML = ''; 
    
    data.forEach(yearGroup => {
        const yearItem = document.createElement('div');
        yearItem.classList.add('timeline-year');
        yearItem.innerHTML = `<span class="year-label">${yearGroup.year}</span>`;
        container.appendChild(yearItem);
        yearGroup.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('timeline-item');
            itemDiv.innerHTML = `<h3>${item.name} (${item.agency})</h3><p>${item.desc}</p>`;
            container.appendChild(itemDiv);
        });
    });
}

/**
 * Lädt Astronautendaten und füllt die rechte Timeline.
 */
export async function loadAstronauts() {
    const data = await fetchJson('./data/astronauts.json');
    const container = document.getElementById('astronautTimeline');

    // Sicherstellen, dass der Container leer ist, bevor neue Elemente hinzugefügt werden
    container.innerHTML = ''; 

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('timeline-item');
        itemDiv.innerHTML = `<h3>${item.name}</h3><p>${item.agency} (${item.year})</p>`;
        container.appendChild(itemDiv);
    });
}
