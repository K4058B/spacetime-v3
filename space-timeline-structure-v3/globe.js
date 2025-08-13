// globe.js
// Verwaltet die 3D-Kugel-Visualisierung und die Satellitendaten.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { fetchJson } from './data-loader.js';

const globeContainer = document.getElementById('globeContainer');
const globeCanvas = document.getElementById('globeCanvas');
const satelliteCountDisplay = document.getElementById('satelliteCount');
const countryLegend = document.getElementById('countryLegend');
const countryOverlay = document.getElementById('countryOverlay');
const toggle1980s = document.getElementById('toggle1980s');
const toggleToday = document.getElementById('toggleToday');

let scene, camera, renderer, controls;
let satellitesMesh, countryColors, countryData;
let currentDataSet = 'today';
let isDragging = false;

const globeRadius = 15;
const orbitRadii = {
    LEO: globeRadius + 1,
    MEO: globeRadius + 3,
    GEO: globeRadius + 5
};

const satelliteGeometry = new THREE.SphereGeometry(0.05, 8, 8);
const satelliteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

const setupScene = async () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0e12);

    camera = new THREE.PerspectiveCamera(45, globeContainer.clientWidth / globeContainer.clientHeight, 0.1, 1000);
    camera.position.z = 35;

    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: globeCanvas });
    renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;

    // Verbessertes visuelles Design mit einem leuchtenden Globus
    const earthTexture = new THREE.TextureLoader().load('assets/textures/earth.jpg');
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globeMesh);

    // Hinzufügen von Licht, um den Globus besser darzustellen
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    // Hinzufügen des Sternenhimmels
    const starfieldTexture = new THREE.TextureLoader().load('assets/textures/stars.jpg');
    const starfieldGeometry = new THREE.SphereGeometry(500, 32, 32);
    const starfieldMaterial = new THREE.MeshBasicMaterial({
        map: starfieldTexture,
        side: THREE.BackSide,
    });
    const starfield = new THREE.Mesh(starfieldGeometry, starfieldMaterial);
    scene.add(starfield);

    countryColors = await fetchJson('./data/country_colors.json');

    await updateSatelliteData(currentDataSet);
    createLegend();
    
    // Touch- und Mausevents für Rotation
    globeCanvas.addEventListener('mousedown', () => isDragging = true);
    globeCanvas.addEventListener('mouseup', () => isDragging = false);
    globeCanvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            // Logik für manuelle Rotation, falls gewünscht
        }
    });

    window.addEventListener('resize', onWindowResize, false);
    animate();

    // Signalisiert dem Preloader, dass der Globe bereit ist
    window.dispatchEvent(new Event('globeLoaded'));
};

const updateSatelliteData = async (dataset) => {
    const data = await fetchJson(`./data/satellites_${dataset}.json`);
    countryData = data.countries;
    const totalCount = data.total;
    satelliteCountDisplay.textContent = `${totalCount} Satelliten`;

    if (satellitesMesh) {
        scene.remove(satellitesMesh);
    }

    satellitesMesh = new THREE.InstancedMesh(satelliteGeometry, satelliteMaterial, totalCount);
    const dummy = new THREE.Object3D();

    let count = 0;
    countryData.forEach(country => {
        const countryCount = country.count;
        const color = new THREE.Color(countryColors[country.code]);
        
        for (let i = 0; i < countryCount; i++) {
            const orbit = getOrbit(country.orbits);
            const radius = orbitRadii[orbit];
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            dummy.position.setFromSphericalCoords(radius, phi, theta);
            dummy.updateMatrix();
            satellitesMesh.setMatrixAt(count, dummy.matrix);
            satellitesMesh.setColorAt(count, color);
            count++;
        }
    });

    scene.add(satellitesMesh);
    satellitesMesh.instanceMatrix.needsUpdate = true;
    satellitesMesh.instanceColor.needsUpdate = true;
};

const getOrbit = (orbits) => {
    const rand = Math.random();
    if (rand < orbits.LEO) return 'LEO';
    if (rand < orbits.LEO + orbits.MEO) return 'MEO';
    return 'GEO';
};

const createLegend = () => {
    countryLegend.innerHTML = '';
    const countries = countryData.map(c => c.name);
    countries.forEach(countryName => {
        const country = countryData.find(c => c.name === countryName);
        if (country) {
            const li = document.createElement('li');
            li.textContent = country.name;
            li.dataset.countryCode = country.code;
            li.style.color = countryColors[country.code];
            countryLegend.appendChild(li);

            li.addEventListener('mouseenter', () => highlightCountry(country.code));
            li.addEventListener('mouseleave', () => highlightCountry(null));
            li.addEventListener('click', () => showCountryDetails(country.code));
        }
    });
};

const highlightCountry = (countryCode) => {
    if (!satellitesMesh) return;
    let currentInstance = 0;

    countryData.forEach(country => {
        const countryColor = new THREE.Color(countryColors[country.code]);
        let targetColor = countryColor;
        if (countryCode && country.code !== countryCode) {
            targetColor.multiplyScalar(0.2); // Weniger intensive Farbe für nicht ausgewählte Länder
        }

        for (let i = 0; i < country.count; i++) {
            satellitesMesh.setColorAt(currentInstance + i, targetColor);
        }
        currentInstance += country.count;
    });

    satellitesMesh.instanceColor.needsUpdate = true;
};

const showCountryDetails = async (countryCode) => {
    const todayData = await fetchJson('./data/satellites_today.json');
    const eightiesData = await fetchJson('./data/satellites_1980s.json');

    const countryToday = todayData.countries.find(c => c.code === countryCode);
    const countryEighties = eightiesData.countries.find(c => c.code === countryCode);

    if (!countryToday || !countryEighties) return;

    const deltaCount = countryToday.count - countryEighties.count;
    const deltaPercent = ((deltaCount / countryEighties.count) * 100).toFixed(1);

    countryOverlay.innerHTML = `
        <h4>${countryToday.name}</h4>
        <p>Satelliten (1980er): <strong>${countryEighties.count}</strong></p>
        <p>Satelliten (Heute): <strong>${countryToday.count}</strong></p>
        <p>Wachstum: <strong>${deltaCount}</strong> (${deltaPercent}%)</p>
        <hr>
        <p>Orbit-Verteilung (Heute):</p>
        <div class="orbit-stats">
            <p>LEO: ${Math.round(countryToday.orbits.LEO * 100)}%</p>
            <p>MEO: ${Math.round(countryToday.orbits.MEO * 100)}%</p>
            <p>GEO: ${Math.round(countryToday.orbits.GEO * 100)}%</p>
        </div>
    `;
    countryOverlay.style.display = 'flex';

    setTimeout(() => {
        countryOverlay.style.display = 'none';
    }, 5000);
};

toggle1980s.addEventListener('click', () => {
    currentDataSet = '1980s';
    updateSatelliteData(currentDataSet);
    toggle1980s.classList.add('active');
    toggleToday.classList.remove('active');
});

toggleToday.addEventListener('click', () => {
    currentDataSet = 'today';
    updateSatelliteData(currentDataSet);
    toggleToday.classList.add('active');
    toggle1980s.classList.remove('active');
});

const onWindowResize = () => {
    camera.aspect = globeContainer.clientWidth / globeContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
};

const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
};

setupScene();
