const names = [
    { text: "Shubham Tarafder", font: "english" },
    { text: "शुभम तरफदार", font: "hindi" }
];

let currentNameIndex = 0;
const nameDisplay = document.getElementById('name-display');

// 1. Morphing Name Logic
async function morphTo(target) {
    const currentText = nameDisplay.innerText;
    const targetText = target.text;
    if (currentText === targetText) return;

    if (target.font === 'hindi') nameDisplay.classList.add('hindi');
    else nameDisplay.classList.remove('hindi');

    let result = currentText.split('');
    const maxLength = Math.max(currentText.length, targetText.length);
    for (let i = 0; i < maxLength; i++) {
        await new Promise(r => setTimeout(r, 40));
        if (i < targetText.length) result[i] = targetText[i];
        else { result.splice(i); break; }
        nameDisplay.innerText = result.join('');
    }
    nameDisplay.innerText = targetText;
}

setInterval(async () => {
    currentNameIndex = (currentNameIndex + 1) % names.length;
    await morphTo(names[currentNameIndex]);
}, 6000);

// -----------------------------------------------------------------------------
// 2. Interactive particle geometry showcase
// -----------------------------------------------------------------------------

let scene, camera, renderer, particleSystem, mouse;
const INTERACT_RADIUS = 7;
const SHAPE_HOLD_MS = 3800;
const SHAPE_TRANSITION_MS = 1100;
const shapeSequence = ['sphere', 'plane', 'cube', 'torus', 'cone', 'cylinder', 'icosphere'];
let currentShapeIndex = 0;
let shapeTimer = null;
let transitionTimer = null;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const count = window.matchMedia('(max-width: 700px)').matches ? 11000 : 20000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 70;
        positions[i3 + 1] = (Math.random() - 0.5) * 50;
        positions[i3 + 2] = (Math.random() - 0.5) * 35;
        targets[i3] = positions[i3];
        targets[i3 + 1] = positions[i3 + 1];
        targets[i3 + 2] = positions[i3 + 2];
        const shade = 0.45 + Math.random() * 0.5;
        colors[i3] = shade * 0.78;
        colors[i3 + 1] = shade * 0.9;
        colors[i3 + 2] = shade;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targets, 3));

    const material = new THREE.PointsMaterial({
        size: window.matchMedia('(max-width: 700px)').matches ? 0.045 : 0.035,
        vertexColors: true,
        transparent: true,
        opacity: 0.62,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    mouse = new THREE.Vector2(-10, -10);
    window.addEventListener('pointermove', event => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });
    window.addEventListener('pointerleave', () => mouse.set(-10, -10));

    morphToShape(shapeSequence[0], true);
    updateShapeLabel(shapeSequence[0]);
    scheduleNextShape();
}

function updateShapeLabel(shape) {
    const label = document.getElementById('shape-name');
    if (label) label.textContent = shape.toUpperCase();
}

function morphToShape(shape, immediate = false) {
    if (!particleSystem) return;
    const targets = particleSystem.geometry.attributes.targetPosition.array;
    const count = targets.length / 3;

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const u = Math.random();
        const v = Math.random();
        const a = u * Math.PI * 2;
        const z = v * 2 - 1;
        const radial = Math.sqrt(1 - z * z);

        if (shape === 'sphere' || shape === 'icosphere') {
            const radius = 9.5;
            targets[i3] = radius * radial * Math.cos(a);
            targets[i3 + 1] = radius * z;
            targets[i3 + 2] = radius * radial * Math.sin(a);
            if (shape === 'icosphere') {
                const bands = Math.sin(a * 5) * Math.cos(z * 9);
                targets[i3] *= 1 + bands * 0.025;
                targets[i3 + 2] *= 1 + bands * 0.025;
            }
        } else if (shape === 'cube') {
            const side = Math.floor(Math.random() * 6);
            const x = (u - 0.5) * 16;
            const y = (v - 0.5) * 16;
            const q = (Math.random() - 0.5) * 16;
            targets[i3] = side < 2 ? (side === 0 ? -8 : 8) : x;
            targets[i3 + 1] = side >= 2 && side < 4 ? (side === 2 ? -8 : 8) : y;
            targets[i3 + 2] = side >= 4 ? (side === 4 ? -8 : 8) : q;
        } else if (shape === 'plane') {
            targets[i3] = (u - 0.5) * 25;
            targets[i3 + 1] = (v - 0.5) * 16;
            targets[i3 + 2] = (Math.random() - 0.5) * 0.035;
        } else if (shape === 'torus') {
            const major = 7.2, minor = 2.6;
            const tube = Math.random() * Math.PI * 2;
            targets[i3] = (major + minor * Math.cos(tube)) * Math.cos(a);
            targets[i3 + 1] = (major + minor * Math.cos(tube)) * Math.sin(a);
            targets[i3 + 2] = minor * Math.sin(tube);
        } else if (shape === 'cylinder') {
            const angle = Math.random() * Math.PI * 2;
            const onCap = Math.random() < 0.18;
            const radius = onCap ? Math.sqrt(Math.random()) * 6.5 : 6.5;
            targets[i3] = radius * Math.cos(angle);
            targets[i3 + 1] = onCap ? (Math.random() < 0.5 ? -8 : 8) : (Math.random() - 0.5) * 16;
            targets[i3 + 2] = radius * Math.sin(angle);
        } else if (shape === 'cone') {
            const angle = Math.random() * Math.PI * 2;
            const height = (Math.random() - 0.5) * 17;
            const radius = (height + 8.5) / 17 * 7.5;
            targets[i3] = radius * Math.cos(angle);
            targets[i3 + 1] = height;
            targets[i3 + 2] = radius * Math.sin(angle);
        }
    }

    particleSystem.geometry.attributes.targetPosition.needsUpdate = true;
    if (immediate) {
        particleSystem.geometry.attributes.position.array.set(targets);
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }
}

function scheduleNextShape() {
    clearTimeout(shapeTimer);
    shapeTimer = setTimeout(() => {
        currentShapeIndex = (currentShapeIndex + 1) % shapeSequence.length;
        const nextShape = shapeSequence[currentShapeIndex];
        morphToShape(nextShape);
        updateShapeLabel(nextShape);
        scheduleNextShape();
    }, SHAPE_HOLD_MS + SHAPE_TRANSITION_MS);
}

function animate() {
    requestAnimationFrame(animate);
    if (!particleSystem) return;

    const positions = particleSystem.geometry.attributes.position.array;
    const targets = particleSystem.geometry.attributes.targetPosition.array;
    const pointer = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
    const direction = pointer.sub(camera.position).normalize();
    const distance = -camera.position.z / direction.z;
    const mousePoint = camera.position.clone().add(direction.multiplyScalar(distance));

    for (let i = 0; i < positions.length; i += 3) {
        const dx = mousePoint.x - positions[i];
        const dy = mousePoint.y - positions[i + 1];
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < INTERACT_RADIUS * INTERACT_RADIUS) {
            const force = (INTERACT_RADIUS - Math.sqrt(distanceSquared)) / INTERACT_RADIUS;
            positions[i] -= dx * force * 0.42;
            positions[i + 1] -= dy * force * 0.42;
        }
        positions[i] += (targets[i] - positions[i]) * 0.045;
        positions[i + 1] += (targets[i + 1] - positions[i + 1]) * 0.045;
        positions[i + 2] += (targets[i + 2] - positions[i + 2]) * 0.045;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.rotation.y += 0.0018;
    particleSystem.rotation.x += 0.00045;
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const obs = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
}), { threshold: 0.1 });
document.querySelectorAll('section').forEach(section => obs.observe(section));

init();
animate();

// -----------------------------------------------------------------------------
// 4. Real-Time Visitor Counter
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // using counterapi.dev to keep a real-time count without backend
    fetch('https://api.counterapi.dev/v1/shubham2243/portfolio/up')
        .then(response => response.json())
        .then(data => {
            const countDisplay = document.getElementById('visitor-count-text');
            if (countDisplay && data.count) {
                const formattedCount = new Intl.NumberFormat('en-US').format(data.count);
                countDisplay.innerHTML = `<span style="color: var(--text-color); font-weight: bold; font-family: var(--font-cli);">${formattedCount}</span> REAL-TIME VISITORS`;
            }
        })
        .catch(err => {
            console.error('Error fetching visitor count:', err);
            const countDisplay = document.getElementById('visitor-count-text');
            if (countDisplay) countDisplay.innerText = 'VISITOR COUNT UNAVAILABLE';
        });
});
