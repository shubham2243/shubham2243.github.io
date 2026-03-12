const names = [
    { text: "Shubham Tarafder", font: "english" },
    { text: "शुभम तरफदार", font: "hindi" }
];

let currentNameIndex = 0;
const nameDisplay = document.getElementById('name-display');
const cliInput = document.getElementById('cli-input');
const cliHistory = document.getElementById('cli-history');

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
// 2. Advanced Research Chatbot (Grounded in Resume)
// -----------------------------------------------------------------------------

const KB = {
    "research": "My research spans medical image analysis and 3D reconstruction. Notable work includes developing novel resizing frameworks for oral cancer images, AI-powered segmentation of histopathological OSCC images, and 2D to 3D generation of Assamese cultural artifacts.",
    "education": "I'm pursuing a B.Tech in CSE at Assam Don Bosco University (2022-2026), maintaining a strong CGPA of 8.66. I've also clearing the GATE examination with a focus on CV and Graphics.",
    "experience": "I've served as a Machine Learning Co-Lead at GDSC ADBU, Research Intern at IASST and the Biomedical Intelligence Unit, and Project Trainee at HDFC Bank developing a Mutual Fund Redemption Optimizer.",
    "projects": "I'm currently working on '2D to 3D Generation of Assamese Cultural Artifacts' and 'Editable 3D Reconstruction for Interior Spaces' using Gaussian Splatting and VGGT-X.",
    "publications": "I have several papers accepted or communicated, including work on smartphone-captured intraoral images for CVIP 2025 and YOLO-based segmentation for ICADT 2025.",
    "skills": "Technically, I'm proficient in Python, C, WebGL, CUDA, and Taichi Lang. I use frameworks like PyTorch, PyTorch3D, TensorFlow, and OpenCV for deep learning and 3D tasks.",
    "awards": "I am an IndiaAI Fellowship awardee and have won first place in several AI exhibitions, web design contests, and science quizzes.",
    "who": "I am Shubham Tarafder, an IndiaAI Fellow and researcher focused on bridging Computer Vision and 3D scene representation.",
    "identity": "I speak English, Hindi, Bengali, and Assamese fluently, and I'm based in Guwahati, Assam.",
    "contact": "You can connect with me via LinkedIn, GitHub, or email at starafder20043@gmail.com."
};

function addLog(text, type = 'bot') {
    const line = document.createElement('div');
    line.className = `cli-line ${type}-msg`;
    line.innerText = text;
    cliHistory.appendChild(line);
    cliHistory.scrollTop = cliHistory.scrollHeight;
}

function processCommand(cmd) {
    const input = cmd.toLowerCase().trim();
    if (input === 'cls' || input === 'clear') {
        cliHistory.innerHTML = '<div class="cli-line bot-msg">Ask me about my research or generate 3D volumes.</div>';
        return;
    }

    addLog(`> ${cmd}`, 'user');

    // Navigation & Redirection
    if (input === 'connect') {
        window.location.href = '#contact';
        addLog("Navigating to connection gateway...");
        return;
    }
    if (input === 'git' || input === 'github') {
        addLog("Redirecting to GitHub profile...");
        setTimeout(() => window.open('https://github.com/shubham2243', '_blank'), 1000);
        return;
    }
    if (input === 'linkedin') {
        addLog("Redirecting to LinkedIn profile...");
        setTimeout(() => window.open('https://www.linkedin.com/in/shubhamtarafder/', '_blank'), 1000);
        return;
    }

    // Credentials
    if (input === 'cred' || input === 'credentials') {
        addLog("Email: starafder20043@gmail.com");
        addLog("ORCID iD: 0009-0001-5505-5725");
        return;
    }

    // Help
    if (input === 'help' || input === '-h') {
        addLog("Available Commands:");
        addLog(" - generate [cube/sphere/torus/cylinder/cone/plane]");
        addLog(" - reset : Revert particles to cloud state");
        addLog(" - cls/clear : Clear terminal history");
        addLog(" - help/-h : Show this list");
        addLog(" - connect : Scroll to contact section");
        addLog(" - github/git : Open GitHub profile");
        addLog(" - linkedin : Open LinkedIn profile");
        addLog(" - cred/credentials : Show contact IDs");
        addLog(" - ask about [research/skills/experience/awards]");
        return;
    }

    // Geometric Commands
    if (input.includes('generate')) {
        const shapes = ['cube', 'sphere', 'torus', 'cylinder', 'cone', 'plane'];
        let matched = false;
        shapes.forEach(s => {
            if (input.includes(s)) {
                morphToShape(s);
                addLog(`Spatial kernel mapping: ${s.toUpperCase()} structure reconstructed successfully.`);
                matched = true;
            }
        });
        if (!matched) addLog("Unknown topology. Try: help");
        return;
    }

    if (input === 'reset') {
        morphToShape('cloud');
        addLog("Stochastic redistribution complete. Particles reset to cloud state.");
        return;
    }

    // Conversational Logic
    let responseFound = false;
    for (const [key, val] of Object.entries(KB)) {
        if (input.includes(key)) {
            addLog(val);
            responseFound = true;
            break;
        }
    }

    if (!responseFound) {
        if (input.includes('hi') || input.includes('hello')) {
            addLog("Hello. I am the Research Assistant. Ask me about Shubham's background or 3D visualizations.");
        } else {
            addLog("Query recognized but no specific data mapping found. Type 'help' for available commands.");
        }
    }
}

cliInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value) {
        processCommand(e.target.value);
        e.target.value = '';
    }
});

// -----------------------------------------------------------------------------
// 3. Three.js Visualization Engine
// -----------------------------------------------------------------------------

let scene, camera, renderer, particleSystem, mouse;
let INTERACT_RADIUS = 7;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const pc = 20000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(pc * 3);
    const col = new Float32Array(pc * 3);
    const tp = new Float32Array(pc * 3);

    for (let i = 0; i < pc; i++) {
        const i3 = i * 3;
        pos[i3] = (Math.random() - 0.5) * 100;
        pos[i3 + 1] = (Math.random() - 0.5) * 100;
        pos[i3 + 2] = (Math.random() - 0.5) * 60 - 30;
        tp[i3] = pos[i3]; tp[i3 + 1] = pos[i3 + 1]; tp[i3 + 2] = pos[i3 + 2];
        const l = 0.4 + Math.random() * 0.5;
        col[i3] = col[i3 + 1] = col[i3 + 2] = l;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('targetPosition', new THREE.BufferAttribute(tp, 3));

    const mat = new THREE.PointsMaterial({ size: 3, vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
    particleSystem = new THREE.Points(geo, mat);
    scene.add(particleSystem);

    mouse = new THREE.Vector2(-10, -10);
    window.addEventListener('mousemove', e => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
}

function morphToShape(shape) {
    const tp = particleSystem.geometry.attributes.targetPosition.array;
    const count = tp.length / 3;

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        if (shape === 'cube') {
            tp[i3] = (Math.random() - 0.5) * 15;
            tp[i3 + 1] = (Math.random() - 0.5) * 15;
            tp[i3 + 2] = (Math.random() - 0.5) * 15;
        } else if (shape === 'sphere') {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;
            const r = 10;
            tp[i3] = r * Math.cos(theta) * Math.sin(phi);
            tp[i3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            tp[i3 + 2] = r * Math.cos(phi);
        } else if (shape === 'torus') {
            const R = 9, r = 3;
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI * 2;
            tp[i3] = (R + r * Math.cos(theta)) * Math.cos(phi);
            tp[i3 + 1] = (R + r * Math.cos(theta)) * Math.sin(phi);
            tp[i3 + 2] = r * Math.sin(theta);
        } else if (shape === 'cylinder') {
            const r = 7, h = 16;
            const theta = Math.random() * Math.PI * 2;
            tp[i3] = r * Math.cos(theta);
            tp[i3 + 1] = (Math.random() - 0.5) * h;
            tp[i3 + 2] = r * Math.sin(theta);
        } else if (shape === 'cone') {
            const r = 8, h = 18;
            const theta = Math.random() * Math.PI * 2;
            const y = Math.random() * h;
            const curR = r * (1 - y / h);
            tp[i3] = curR * Math.cos(theta);
            tp[i3 + 1] = y - h / 2;
            tp[i3 + 2] = curR * Math.sin(theta);
        } else if (shape === 'plane') {
            tp[i3] = (Math.random() - 0.5) * 30;
            tp[i3 + 1] = (Math.random() - 0.5) * 30;
            tp[i3 + 2] = 0;
        } else {
            tp[i3] = (Math.random() - 0.5) * 100;
            tp[i3 + 1] = (Math.random() - 0.5) * 100;
            tp[i3 + 2] = (Math.random() - 0.5) * 60 - 30;
        }
    }
    particleSystem.geometry.attributes.targetPosition.needsUpdate = true;
}

function animate() {
    requestAnimationFrame(animate);
    const p = particleSystem.geometry.attributes.position.array;
    const tp = particleSystem.geometry.attributes.targetPosition.array;

    const vec = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    const mP = camera.position.clone().add(dir.multiplyScalar(dist));

    for (let i = 0; i < p.length; i += 3) {
        const dx = mP.x - p[i], dy = mP.y - p[i + 1], ds = dx * dx + dy * dy;
        if (ds < INTERACT_RADIUS * INTERACT_RADIUS) {
            const f = (INTERACT_RADIUS - Math.sqrt(ds)) / INTERACT_RADIUS;
            p[i] -= dx * f * 0.45;
            p[i + 1] -= dy * f * 0.45;
        }
        p[i] += (tp[i] - p[i]) * 0.055;
        p[i + 1] += (tp[i + 1] - p[i + 1]) * 0.055;
        p[i + 2] += (tp[i + 2] - p[i + 2]) * 0.055;
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.rotation.y += 0.0004;
    renderer.render(scene, camera);
}

const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.1 });
document.querySelectorAll('section').forEach(s => obs.observe(s));
init(); animate();

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
