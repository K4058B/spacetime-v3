// budgets.js
// Diese Datei erstellt die 3D-Visualisierung der Raumfahrtbudgets.

import * as THREE from 'three';
import { fetchJson } from './data-loader.js';

const budgetsCanvas = document.getElementById('budgetsCanvas');
const countryList = document.getElementById('countryList');

let scene, camera, renderer, budgetData;
let planetMesh;
const planetMaterial = new THREE.MeshStandardMaterial({ color: 0x5da8ff, roughness: 0.8, metalness: 0.2 });

const setupBudgetScene = async () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, budgetsCanvas.clientWidth / budgetsCanvas.clientHeight, 0.1, 1000);
    camera.position.z = 30;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(budgetsCanvas.clientWidth, budgetsCanvas.clientHeight);
    budgetsCanvas.appendChild(renderer.domElement);

    // Hinzufügen von Licht für eine professionellere 3D-Szene
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const planetGeometry = new THREE.SphereGeometry(1, 32, 32);
    planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    scene.add(planetMesh);

    budgetData = await fetchJson('./data/budgets.json');
    createBudgetList();
    
    window.addEventListener('resize', onBudgetResize, false);
    animateBudgets();

    // Signalisiert dem Preloader, dass die Budgets geladen sind
    window.dispatchEvent(new Event('budgetsLoaded'));
};

const createBudgetList = () => {
    countryList.innerHTML = '';
    const maxBudget = Math.max(...budgetData.map(d => d.budget));

    budgetData.forEach(data => {
        const li = document.createElement('li');
        li.textContent = `${data.country}: ${data.budget.toFixed(1)} Mrd. €`;
        li.dataset.budget = data.budget;

        li.addEventListener('mouseenter', () => {
            const budget = parseFloat(li.dataset.budget);
            // Skalierung des Planeten basierend auf dem Budget
            const radius = 1 + (budget / maxBudget) * 5; 
            gsap.to(planetMesh.scale, { x: radius, y: radius, z: radius, duration: 1.5, ease: "elastic.out(1, 0.3)" });
            
            planetMaterial.color.set(0x5DA8FF);
        });

        li.addEventListener('mouseleave', () => {
            // Rückkehr zur Originalgröße
            gsap.to(planetMesh.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "power2.inOut" });
            planetMaterial.color.set(0x5da8ff);
        });

        countryList.appendChild(li);
    });
};

const onBudgetResize = () => {
    camera.aspect = budgetsCanvas.clientWidth / budgetsCanvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(budgetsCanvas.clientWidth, budgetsCanvas.clientHeight);
};

const animateBudgets = () => {
    requestAnimationFrame(animateBudgets);
    planetMesh.rotation.y += 0.005;
    renderer.render(scene, camera);
};

setupBudgetScene();
