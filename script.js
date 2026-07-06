// --- 1. CONFIGURACIÓN BASE DEL ESCENARIO ---
const scene = new THREE.Scene();

// Cámara con perspectiva para dar sensación de profundidad
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
// Posición inicial de la cámara para ver el sistema desde un ángulo elevado
camera.position.set(0, 30, 55);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// Habilitar sombras suaves
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controles para cambiar el ángulo con el mouse
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Efecto de inercia suave
controls.dampingFactor = 0.05;

// --- 2. ILUMINACIÓN NEÓN ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Luz puntual intensa color rosa neón en el centro para dar brillo
const neonPointLight = new THREE.PointLight(0xff0055, 3.5, 120);
neonPointLight.position.set(0, 8, 0);
neonPointLight.castShadow = true; // Proyectar sombras sutiles
scene.add(neonPointLight);

// --- 3. FONDO DE ESTRELLAS ---
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 2500;
const starPositions = new Float32Array(starsCount * 3);

for(let i = 0; i < starsCount * 3; i++) {
    starPositions[i] = (Math.random() - 0.5) * 300;
}
starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.35 });
const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

// --- 4. CORAZÓN CENTRAL 3D - CORRECCIÓN DEFINITIVA ---
function generateHeartGeometry() {
    const shape = new THREE.Shape();
    
    // Iniciamos en la hendidura superior central del corazón
    shape.moveTo(0, 1.2);
    
    // Lado izquierdo (Curvas hacia la punta inferior)
    shape.bezierCurveTo(-1, 2.5, -2.5, 2.5, -2.5, 1);
    shape.bezierCurveTo(-2.5, -0.5, -1.5, -1.5, 0, -2.7);
    
    // Lado derecho (Subiendo desde la punta hasta el centro de nuevo)
    shape.bezierCurveTo(1.5, -1.5, 2.5, -0.5, 2.5, 1);
    shape.bezierCurveTo(2.5, 2.5, 1, 2.5, 0, 1.2);

    // Configuración para darle volumen 3D y bordes biselados suaves
    const extrudeSettings = {
        depth: 0.6,          // Grosor del corazón
        bevelEnabled: true,  // Habilitar bordes biselados
        bevelSegments: 8,    // Alta densidad para máxima suavidad neón
        steps: 2,
        bevelSize: 0.15,     // Ancho del borde redondeado
        bevelThickness: 0.15 // Grosor del borde redondeado
    };

    const heartGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Centra el corazón en su propio eje de masa para que gire de forma equilibrada
    heartGeometry.center(); 

    return heartGeometry;
}

// Generamos la geometría usando la función corregida
const heartGeometry = generateHeartGeometry();

// Material Ultra Neón con auto-iluminación (Emissive) y suavidad para evitar bordes duros
const heartMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0055,
    emissive: 0xff0044, 
    emissiveIntensity: 1.8, // Brillo neón intenso
    roughness: 0.2,
    metalness: 0.1
});

const centralHeart = new THREE.Mesh(heartGeometry, heartMaterial);
centralHeart.scale.set(4, 4, 4); // Escalado para que tenga presencia en el centro
centralHeart.castShadow = true;
scene.add(centralHeart);

// --- 5. GRUPO DE ÓRBITA SINCRONIZADA ---
// Creamos un grupo maestro para todos los objetos en órbita
const globalOrbitGroup = new THREE.Group();
scene.add(globalOrbitGroup);

// Función auxiliar para crear texturas con textos de estilo Neón
function createTextTexture(text, colorHex, shadowHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)'; // Fondo transparente
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'Bold 36px Arial';
    
    // Efecto de resplandor neón en el texto 2D
    ctx.shadowColor = shadowHex;
    ctx.shadowBlur = 18;
    ctx.fillStyle = colorHex;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    return new THREE.CanvasTexture(canvas);
}

const texts = ["Te amo", "Juntos", "<3", "Siempre"];
const neonColors = [
    { color: "#ffffff", shadow: "#ff0055" }, // Rosa neón
    { color: "#ffffff", shadow: "#00f0ff" }, // Celeste neón
    { color: "#ffffff", shadow: "#bd00ff" }, // Violeta neón
    { color: "#ffffff", shadow: "#ffcc00" }  // Amarillo neón
];

// --- 6. ELEMENTOS EN ÓRBITA (SINCRONIZADOS Y LENTOS) ---
const numElements = 8;
const orbitRadius = 24; // Radio de órbita fijo para todos
const orbitElements = [];

// Creamos los elementos en órbita y los añadimos al GRUPO MAESTRO
for (let i = 0; i < numElements; i++) {
    let mesh;
    const angle = (i / numElements) * Math.PI * 2; // Distribución angular uniforme
    const colorPick = neonColors[i % neonColors.length];

    if (i % 2 === 0) {
        // Esfera brillante de color neón (Planeta)
        const sphereGeo = new THREE.SphereGeometry(1.6, 32, 32);
        const sphereMat = new THREE.MeshStandardMaterial({
            color: colorPick.shadow,
            emissive: colorPick.shadow,
            emissiveIntensity: 1.5,
            roughness: 0.05
        });
        mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.castShadow = true;
    } else {
        // Cartel flotante con texto neón
        const textIndex = Math.floor(i / 2) % texts.length;
        const textTexture = createTextTexture(texts[textIndex], colorPick.color, colorPick.shadow);
        const planeGeo = new THREE.PlaneGeometry(7.5, 1.8);
        // Usar DoubleSide para que se vea por detrás
        const planeMat = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true, side: THREE.DoubleSide });
        mesh = new THREE.Mesh(planeGeo, planeMat);
    }

    // Posicionamiento inicial en el plano circular (XZ)
    mesh.position.x = Math.cos(angle) * orbitRadius;
    mesh.position.z = Math.sin(angle) * orbitRadius;
    mesh.position.y = 0; // Todos a la misma altura

    globalOrbitGroup.add(mesh); // Añadir al grupo de órbita global
    orbitElements.push(mesh);
}

// --- 7. ANILLO DE POLVO ESTELAR NEÓN (INTERNO) ---
const ringGeometry = new THREE.BufferGeometry();
const ringCount = 500;
const ringPositions = new Float32Array(ringCount * 3);

for(let i = 0; i < ringCount; i++) {
    const rAngle = Math.random() * Math.PI * 2;
    const rRadius = 8 + Math.random() * 3.5;
    ringPositions[i*3] = Math.cos(rAngle) * rRadius;
    ringPositions[i*3+1] = (Math.random() - 0.5) * 0.6;
    ringPositions[i*3+2] = Math.sin(rAngle) * rRadius;
}
ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
const ringMaterial = new THREE.PointsMaterial({ color: 0xff0055, size: 0.38, transparent: true, opacity: 0.9 });
const particleRing = new THREE.Points(ringGeometry, ringMaterial);
scene.add(particleRing);

// --- 8. BUCLE DE ANIMACIÓN Y RENDERIZADO ---
let clock = new THREE.Clock();
// VELOCIDAD GLOBAL MUCHO MÁS LENTA
const rotationSpeed = 0.08; 

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Rotación suave del corazón central
    centralHeart.rotation.y = elapsedTime * 0.35;
    
    // Efecto latido / parpadeo neón sutil en el corazón central
    heartMaterial.emissiveIntensity = 1.4 + Math.sin(elapsedTime * 3.5) * 0.4;

    // Rotación lenta del anillo de partículas interno
    particleRing.rotation.y = -elapsedTime * 0.12;

    // --- ANIMACIÓN DE ÓRBITA SINCRONIZADA ---
    globalOrbitGroup.rotation.y = elapsedTime * rotationSpeed;

    // Para los carteles de texto, los hacemos mirar a la cámara (efecto Billboard)
    orbitElements.forEach(mesh => {
        if (mesh.geometry.type === "PlaneGeometry") {
            mesh.lookAt(camera.position);
        } else {
            // Rotación individual suave de los planetas/esferas
            mesh.rotation.y += 0.01;
        }
    });

    // Actualizar el control orbital del mouse
    controls.update();

    renderer.render(scene, camera);
}

animate();

// --- 9. AJUSTE DE PANTALLA (RESPONSIVE) ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
