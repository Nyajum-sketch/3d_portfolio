import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const gsap = window.gsap;

const canvas = document.getElementById('experience-canvas');
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const character = {
    instance: null,
    root: null,
    parts: [],
    colliders: [],
    moveDistance: 1.6,
    jumpHeight: 1,
    isMoving: false,
    moveDuration: 0.24
};

const bat = {
    root: null,
    mesh: null,
    meshes: [],
    basePosition: new THREE.Vector3(),
    baseRotationY: 0,
    baseMeshPositions: new Map(),
    baseMeshRotationsY: new Map(),
    bobAmplitude: 1.1,
    swayAmplitudeX: 0.45,
    swayAmplitudeZ: 0.32,
    turnAmplitude: 0.45
};

const cubeSwarmNames = new Set([
    'Cube073', 'Cube073_1',
    'Cube074', 'Cube074_1',
    'Cube047', 'Cube047_1',
    'Cube065', 'Cube065_1',
    'Cube069', 'Cube069_1',
    'Cube071', 'Cube071_1',
    'Cube070', 'Cube070_1'
]);
const cubeSwarm = {
    root: null,
    meshes: [],
    baseRootPosition: new THREE.Vector3(),
    baseRootRotationY: 0,
    baseMeshPositions: new Map(),
    baseMeshRotationsY: new Map(),
    bobAmplitude: 0.95,
    swayAmplitudeX: 0.65,
    swayAmplitudeZ: 0.45,
    turnAmplitude: 0.35
};

const clock = new THREE.Clock();

const characterRootName = 'hair003';

function isDescendantOf(object, ancestor) {
    let current = object.parent;
    while (current) {
        if (current === ancestor) {
            return true;
        }
        current = current.parent;
    }

    return false;
}

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
//shadows
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.20;


const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 5000);
camera.position.set(-205, 148, 308);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 0, 0);
controls.update();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const pointerScreen = { x: 0, y: 0 };
const isNonLaptopDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const resumeFile = './Resume_NYAJUM_TASO_UPDATE2.pdf';
const githubRepoUrl = 'https://github.com/Nyajum-sketch?tab=repositories';
const linkedinUrl = 'https://www.linkedin.com/in/nyajum-taso-b81b84346/';
const emailAddress = 'nyajumt222@gmail.com';

const characterSpeechParts = new Set([
    'Plane019_2',
    'Plane019_3',
    'Plane019_4',
    'Plane019_5',
    'Plane019_6',
    'Plane019_7',
    'Plane019_8',
    'Plane019_9'
]);

const characterSpeechLine = 'Relax, I only bite people I like… and you’re not making the list.';
const gravestoneSpeechLine = 'Wow. A gravestone on my lawn? What is this, a warning or a decoration?';
const tvSpeechLine = "I was hungry, so I sucked it's color.";
const gravestoneSpeechMeshName = '15973_Rounded_Rectangle_with_Patterns_Skull_and_Bones_v1';
const gravestoneSpeechMaterialName = 'tile_sorta';
const tvSpeechMaterialName = 'tv';
const tvSpeechMeshNames = new Set(['Tlevisao005_Cubo046_1', 'Tlevisao005_Cube046_1', 'Tlevisa']);

function isCharacterSpeechMesh(mesh) {
    return !!mesh && mesh.isMesh && characterSpeechParts.has(mesh.name);
}

function isGravestoneSpeechMesh(mesh) {
    if (!mesh || !mesh.isMesh || mesh.name !== gravestoneSpeechMeshName) {
        return false;
    }

    const material = mesh.material;
    if (Array.isArray(material)) {
        return material.some((mat) => mat && mat.name === gravestoneSpeechMaterialName);
    }

    return !material || material.name === gravestoneSpeechMaterialName;
}

function isTvSpeechMesh(mesh) {
    if (!mesh || !mesh.isMesh || !tvSpeechMeshNames.has(mesh.name)) {
        return false;
    }

    const material = mesh.material;
    if (Array.isArray(material)) {
        return material.some((mat) => mat && mat.name === tvSpeechMaterialName);
    }

    return !material || material.name === tvSpeechMaterialName;
}

function getSpeechLineForObject(object) {
    if (isGravestoneSpeechMesh(object)) {
        return gravestoneSpeechLine;
    }

    if (isTvSpeechMesh(object)) {
        return tvSpeechLine;
    }

    if (isCharacterSpeechMesh(object)) {
        return characterSpeechLine;
    }

    return null;
}

const speechBubble = document.createElement('div');
speechBubble.style.position = 'fixed';
speechBubble.style.left = '0';
speechBubble.style.top = '0';
speechBubble.style.transform = 'translate(-9999px, -9999px)';
speechBubble.style.maxWidth = '470px';
speechBubble.style.padding = '14px 22px 16px 22px';
speechBubble.style.borderRadius = '999px';
speechBubble.style.background = '#ffffff';
speechBubble.style.border = '4px solid #1f1f24';
speechBubble.style.color = '#c40000';
speechBubble.style.fontFamily = '"Henny Penny", system-ui';
speechBubble.style.fontWeight = '400';
speechBubble.style.fontStyle = 'normal';
speechBubble.style.fontSize = '18px';
speechBubble.style.lineHeight = '1.3';
speechBubble.style.boxShadow = '0 10px 24px rgba(0, 0, 0, 0.16)';
speechBubble.style.pointerEvents = 'none';
speechBubble.style.zIndex = '40';
speechBubble.style.display = 'none';

const speechBubbleText = document.createElement('div');
speechBubbleText.textContent = characterSpeechLine;
speechBubbleText.style.color = '#c70000';
speechBubbleText.style.textAlign = 'center';
speechBubbleText.style.whiteSpace = 'normal';
speechBubble.appendChild(speechBubbleText);

const speechBubbleTail = document.createElement('div');
speechBubbleTail.style.position = 'absolute';
speechBubbleTail.style.left = '20px';
speechBubbleTail.style.bottom = '-22px';
speechBubbleTail.style.width = '36px';
speechBubbleTail.style.height = '28px';
speechBubbleTail.style.background = '#ffffff';
speechBubbleTail.style.borderLeft = '4px solid #1f1f24';
speechBubbleTail.style.borderBottom = '4px solid #1f1f24';
speechBubbleTail.style.borderBottomLeftRadius = '42px';
speechBubbleTail.style.transform = 'skewX(-20deg) rotate(-20deg)';
speechBubble.appendChild(speechBubbleTail);

document.body.appendChild(speechBubble);

let speechBubbleHideTimeout = null;

function hideSpeechBubble() {
    speechBubble.style.display = 'none';
    speechBubble.style.transform = 'translate(-9999px, -9999px)';
}

function showSpeechBubbleAt(x, y, text, autoHideMs = 0) {
    speechBubbleText.textContent = text;
    speechBubble.style.display = 'block';
    speechBubble.style.transform = `translate(${x + 16}px, ${y - 14}px)`;

    if (speechBubbleHideTimeout) {
        window.clearTimeout(speechBubbleHideTimeout);
        speechBubbleHideTimeout = null;
    }

    if (autoHideMs > 0) {
        speechBubbleHideTimeout = window.setTimeout(() => {
            hideSpeechBubble();
        }, autoHideMs);
    }
}

const loadingOverlay = document.createElement('div');
loadingOverlay.style.position = 'fixed';
loadingOverlay.style.inset = '0';
loadingOverlay.style.display = 'flex';
loadingOverlay.style.alignItems = 'center';
loadingOverlay.style.justifyContent = 'center';
loadingOverlay.style.padding = '24px';
loadingOverlay.style.background = '#2b1140';
loadingOverlay.style.color = '#ffffff';
loadingOverlay.style.fontFamily = '"Henny Penny", system-ui';
loadingOverlay.style.fontSize = '30px';
loadingOverlay.style.lineHeight = '1.35';
loadingOverlay.style.textAlign = 'center';
loadingOverlay.style.zIndex = '90';
loadingOverlay.style.opacity = '1';
loadingOverlay.style.transition = 'opacity 260ms ease';
loadingOverlay.textContent = 'Creator: Nyajum. Elements are interactive and marcy can hop to move around. Stay creative.';
document.body.appendChild(loadingOverlay);

const backgroundMusic = new Audio('./remember_you_omnichrd.mp3');
backgroundMusic.loop = true;
backgroundMusic.preload = 'auto';
backgroundMusic.volume = 0.6;

let backgroundMusicStarted = false;
let backgroundMusicMuted = false;

const musicToggleButton = document.createElement('button');
musicToggleButton.type = 'button';
musicToggleButton.style.position = 'fixed';
musicToggleButton.style.right = '16px';
musicToggleButton.style.top = '16px';
musicToggleButton.style.padding = '10px 14px';
musicToggleButton.style.border = '2px solid #efe7ff';
musicToggleButton.style.borderRadius = '12px';
musicToggleButton.style.background = '#6a2bbf';
musicToggleButton.style.color = '#ffffff';
musicToggleButton.style.fontFamily = '"Henny Penny", system-ui';
musicToggleButton.style.fontSize = '14px';
musicToggleButton.style.cursor = 'pointer';
musicToggleButton.style.zIndex = '95';
musicToggleButton.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.22)';
document.body.appendChild(musicToggleButton);

function updateMusicToggleLabel() {
    musicToggleButton.textContent = backgroundMusicMuted ? 'Unmute Music' : 'Mute Music';
}

function ensureBackgroundMusicStarted() {
    if (backgroundMusicStarted) {
        return;
    }

    backgroundMusic.play()
        .then(() => {
            backgroundMusicStarted = true;
        })
        .catch(() => {
            // Autoplay may be blocked; playback will retry on first interaction.
        });
}

function toggleBackgroundMusicMute() {
    backgroundMusicMuted = !backgroundMusicMuted;
    backgroundMusic.muted = backgroundMusicMuted;
    updateMusicToggleLabel();

    if (!backgroundMusicMuted) {
        ensureBackgroundMusicStarted();
    }
}

musicToggleButton.addEventListener('click', (event) => {
    event.preventDefault();
    toggleBackgroundMusicMute();
});

window.addEventListener('pointerdown', ensureBackgroundMusicStarted, { once: true });
window.addEventListener('keydown', ensureBackgroundMusicStarted, { once: true });
window.addEventListener('touchstart', ensureBackgroundMusicStarted, { once: true });

updateMusicToggleLabel();
ensureBackgroundMusicStarted();

const loadingMinVisibleMs = 2800;
const loadingShownAt = performance.now();

function hideLoadingOverlay() {
    const elapsed = performance.now() - loadingShownAt;
    const waitMs = Math.max(0, loadingMinVisibleMs - elapsed);

    window.setTimeout(() => {
        loadingOverlay.style.opacity = '0';
        window.setTimeout(() => {
            if (loadingOverlay.parentElement) {
                loadingOverlay.remove();
            }
        }, 280);
    }, waitMs);
}

function updatePointerFromClient(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    pointerScreen.x = clientX;
    pointerScreen.y = clientY;
}

const resumeModal = document.getElementById('resume-modal');
const resumeFrame = document.getElementById('resume-frame');
const resumeClose = document.getElementById('resume-close');
const contactOverlay = document.getElementById('contact-overlay');
const contactCanvas = document.getElementById('contact-canvas');
const contactClose = document.getElementById('contact-close');

const contactRaycaster = new THREE.Raycaster();
const contactPointer = new THREE.Vector2();
const contactLoader = new GLTFLoader();
const contactClickables = [];
const contactItems = [];
const contactIconTargetSize = 1.35;
const contactLabelY = -0.55;

const contactScene = new THREE.Scene();
const contactCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
contactCamera.position.set(0, 0.85, 6);
contactCamera.lookAt(0, 0.45, 0);

let contactRenderer = null;
if (contactCanvas) {
    contactRenderer = new THREE.WebGLRenderer({ canvas: contactCanvas, alpha: true, antialias: true });
    contactRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

const contactAmbient = new THREE.AmbientLight(0xffffff, 0.9);
contactScene.add(contactAmbient);
const contactDirectional = new THREE.DirectionalLight(0xffffff, 1.5);
contactDirectional.position.set(3, 4, 5);
contactScene.add(contactDirectional);

function fitContactCanvas() {
    if (!contactCanvas || !contactRenderer) {
        return;
    }

    const rect = contactCanvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        return;
    }

    contactRenderer.setSize(rect.width, rect.height, false);
    contactCamera.aspect = rect.width / rect.height;
    contactCamera.updateProjectionMatrix();
}

function createLabelSprite(text) {
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 80;
    const ctx = labelCanvas.getContext('2d');
    if (!ctx) {
        return null;
    }

    ctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, labelCanvas.width / 2, labelCanvas.height / 2);

    const texture = new THREE.CanvasTexture(labelCanvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2.2, 0.7, 1);
    return sprite;
}

function createFallbackContactItem(label, color, xPosition, onClickUrl) {
    const holder = new THREE.Group();
    holder.position.set(xPosition, 0, 0);

    const badge = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 1.25, 0.25),
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.45, metalness: 0.05 })
    );
    badge.position.y = 0.625;
    badge.userData.url = onClickUrl;
    holder.add(badge);
    contactClickables.push(badge);

    const labelSprite = createLabelSprite(label);
    if (labelSprite) {
        labelSprite.position.set(0, contactLabelY, 0);
        holder.add(labelSprite);
    }

    contactScene.add(holder);
    contactItems.push(holder);
}

function createContactItem(path, xPosition, onClickUrl, fallbackLabel, fallbackColor) {
    contactLoader.load(
        path,
        (gltf) => {
            const holder = new THREE.Group();
            const model = gltf.scene;
            holder.add(model);

            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scale = contactIconTargetSize / maxDim;
            model.scale.setScalar(scale);

            const scaledBox = new THREE.Box3().setFromObject(model);
            const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
            model.position.sub(scaledCenter);

            const centeredBox = new THREE.Box3().setFromObject(model);
            model.position.y -= centeredBox.min.y;

            holder.position.set(xPosition, 0, 0);
            holder.userData.url = onClickUrl;

            model.traverse((child) => {
                if (child.isMesh) {
                    child.userData.url = onClickUrl;
                    contactClickables.push(child);
                }
            });

            const labelSprite = createLabelSprite(fallbackLabel);
            if (labelSprite) {
                labelSprite.position.set(0, contactLabelY, 0);
                holder.add(labelSprite);
            }

            contactScene.add(holder);
            contactItems.push(holder);
        },
        undefined,
        (error) => {
            console.error('Contact model load failed:', path, error);
            console.warn('Using fallback contact badge for', path, 'because required GLTF dependencies are missing.');
            createFallbackContactItem(fallbackLabel, fallbackColor, xPosition, onClickUrl);
        }
    );
}

if (contactCanvas) {
    createContactItem('./assets/contact/email/scene.gltf', -2.4, `mailto:${emailAddress}`, 'Email', 0xc44146);
    createContactItem('./assets/contact/github/scene.gltf', 0, githubRepoUrl, 'GitHub', 0x2e2e2e);
    createContactItem('./assets/contact/linkedin/scene.gltf', 2.4, linkedinUrl, 'LinkedIn', 0x1679b8);
}

function onPointerMove(event) {
    updatePointerFromClient(event.clientX, event.clientY);
}

window.addEventListener('pointermove', onPointerMove);

function onContactPointerMove(event) {
    if (!contactCanvas) {
        return;
    }

    const rect = contactCanvas.getBoundingClientRect();
    contactPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    contactPointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

if (contactCanvas) {
    contactCanvas.addEventListener('pointermove', onContactPointerMove);
}

function addMobileArrowControls() {
    if (!isNonLaptopDevice) {
        return;
    }

    const controlsWrap = document.createElement('div');
    controlsWrap.style.position = 'fixed';
    controlsWrap.style.right = '16px';
    controlsWrap.style.bottom = '16px';
    controlsWrap.style.zIndex = '60';
    controlsWrap.style.display = 'grid';
    controlsWrap.style.gridTemplateColumns = '56px 56px 56px';
    controlsWrap.style.gridTemplateRows = '56px 56px 56px';
    controlsWrap.style.gap = '8px';
    controlsWrap.style.userSelect = 'none';

    const createArrow = (label, col, row, delta) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.style.gridColumn = String(col);
        button.style.gridRow = String(row);
        button.style.width = '56px';
        button.style.height = '56px';
        button.style.border = '2px solid #ffffff';
        button.style.borderRadius = '14px';
        button.style.background = 'rgba(15, 10, 25, 0.72)';
        button.style.color = '#ffffff';
        button.style.fontSize = '22px';
        button.style.fontWeight = '700';
        button.style.cursor = 'pointer';

        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            animateCharacterMove(delta.clone());
        });

        controlsWrap.appendChild(button);
    };

    createArrow('↑', 2, 1, new THREE.Vector3(0, 0, -character.moveDistance));
    createArrow('←', 1, 2, new THREE.Vector3(-character.moveDistance, 0, 0));
    createArrow('↓', 2, 2, new THREE.Vector3(0, 0, character.moveDistance));
    createArrow('→', 3, 2, new THREE.Vector3(character.moveDistance, 0, 0));

    document.body.appendChild(controlsWrap);
}

addMobileArrowControls();

const raycastTargets = {
    Cube036: 'Material.012',
    Cube034: 'Material.012',
    Cube035: 'Material.012',
    Plane019_2: 'Material.005',
    Tlevisao005_Cubo046_1: 'tv'
};

function isTargetHit(hit) {
    const mesh = hit.object;
    if (!mesh.isMesh) {
        return false;
    }

    const expectedMaterial = raycastTargets[mesh.name];
    if (!expectedMaterial) {
        return false;
    }

    const material = mesh.material;
    if (Array.isArray(material)) {
        return material.some((mat) => mat && mat.name === expectedMaterial);
    }

    return material && material.name === expectedMaterial;
}

function isResumeTargetHit(hit) {
    const mesh = hit.object;
    if (!mesh || !mesh.isMesh || mesh.name !== 'Cube036') {
        return false;
    }

    const material = mesh.material;
    if (Array.isArray(material)) {
        return material.some((mat) => mat && mat.name === 'Material.012');
    }

    return material && material.name === 'Material.012';
}

function isGithubTargetHit(hit) {
    const mesh = hit.object;
    if (!mesh || !mesh.isMesh || mesh.name !== 'Cube034') {
        return false;
    }

    const material = mesh.material;
    if (Array.isArray(material)) {
        return material.some((mat) => mat && mat.name === 'Material.012');
    }

    return material && material.name === 'Material.012';
}

function isContactMenuTargetHit(hit) {
    const mesh = hit.object;
    if (!mesh || !mesh.isMesh || mesh.name !== 'Cube035') {
        return false;
    }

    const material = mesh.material;
    if (Array.isArray(material)) {
        return material.some((mat) => mat && mat.name === 'Material.012');
    }

    return material && material.name === 'Material.012';
}

function collectCharacterAndColliders(root) {
    const colliders = [];
    const characterRoot = root.getObjectByName(characterRootName) || null;

    root.traverse((child) => {
        if (!child.isMesh) {
            return;
        }

        const isCharacterMesh = characterRoot
            ? characterRoot !== child && isDescendantOf(child, characterRoot)
            : ['Plane019_2', 'Plane019_3', 'Plane019_4', 'Plane019_5', 'Plane019_6', 'Plane019_7', 'Plane019_8', 'Plane019_9'].includes(child.name);

        if (isCharacterMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            character.parts.push(child);
            return;
        }

        if (!child.name.startsWith('Plane019')) {
            colliders.push(child);
        }
    });

    character.parts.sort((left, right) => left.name.localeCompare(right.name));
    character.instance = character.parts[0] || null;
    character.root = characterRoot || null;
    character.colliders = colliders;

    if (!character.parts.length) {
        console.warn('Character parts were not found. Expected meshes inside hair003 or Plane019_* names.');
    }
}

function isBatEyeMesh(mesh) {
    if (!mesh || !mesh.isMesh) {
        return false;
    }

    if (!['Cube075', 'Cube075_1'].includes(mesh.name)) {
        return false;
    }

    const material = mesh.material;
    if (Array.isArray(material)) {
        return material.some((mat) => mat && ['bat_eye', 'bateye.002'].includes(mat.name));
    }

    return !material || ['bat_eye', 'bateye.002'].includes(material.name);
}

function isCubeSwarmMesh(mesh) {
    if (!mesh || !mesh.isMesh || !cubeSwarmNames.has(mesh.name)) {
        return false;
    }

    const material = mesh.material;
    if (Array.isArray(material)) {
        return material.some((mat) => mat && ['bat_eye', 'bat_eye.002', 'bateye.002'].includes(mat.name));
    }

    return !material || ['bat_eye', 'bat_eye.002', 'bateye.002'].includes(material.name);
}

function findDirectSharedParent(meshes) {
    if (!meshes.length) {
        return null;
    }

    const candidate = meshes[0].parent || null;
    if (!candidate) {
        return null;
    }

    return meshes.every((mesh) => mesh.parent === candidate) ? candidate : null;
}

function isCharacterMovementBlocked(delta) {
    if (!character.root) {
        return true;
    }

    const currentBox = new THREE.Box3().setFromObject(character.root);
    const proposedBox = currentBox.clone().translate(delta);

    for (const collider of character.colliders) {
        if (!collider || !collider.isMesh) {
            continue;
        }

        const colliderBox = new THREE.Box3().setFromObject(collider);
        if (!Number.isFinite(colliderBox.min.x) || !Number.isFinite(colliderBox.max.x)) {
            continue;
        }

        const intersectsNow = currentBox.intersectsBox(colliderBox);
        const intersectsAfterMove = proposedBox.intersectsBox(colliderBox);

        // Allow existing overlaps (e.g. standing on terrain), block only newly created collisions.
        if (!intersectsNow && intersectsAfterMove) {
            return true;
        }
    }

    return false;
}

function animateCharacterMove(delta) {
    if (!character.root || character.isMoving) {
        return;
    }

    if (isCharacterMovementBlocked(delta)) {
        return;
    }

    character.isMoving = true;
    const moveDuration = character.moveDuration;

    const start = character.root.position.clone();
    const end = start.clone().add(delta);
    const peakY = start.y + character.jumpHeight;

    if (gsap) {
        gsap.timeline()
            .to(character.root.position, {
                x: end.x,
                z: end.z,
                duration: moveDuration,
                ease: 'power2.out'
            })
            .to(character.root.position, {
                y: peakY,
                duration: moveDuration / 2,
                ease: 'power2.out'
            }, 0)
            .to(character.root.position, {
                y: start.y,
                duration: moveDuration / 2,
                ease: 'power2.in'
            }, moveDuration / 2);
    } else {
        character.root.position.copy(end);
    }

    window.setTimeout(() => {
        character.isMoving = false;
    }, moveDuration * 1000);
}

function handleCharacterKeydown(event) {
    if ((resumeModal && resumeModal.classList.contains('open')) || (contactOverlay && contactOverlay.classList.contains('open'))) {
        return;
    }

    if (event.repeat) {
        return;
    }

    const key = event.key.toLowerCase();
    const delta = new THREE.Vector3();

    if (key === 'arrowup' || key === 'w') {
        delta.z = -character.moveDistance;
    } else if (key === 'arrowdown' || key === 's') {
        delta.z = character.moveDistance;
    } else if (key === 'arrowleft' || key === 'a') {
        delta.x = -character.moveDistance;
    } else if (key === 'arrowright' || key === 'd') {
        delta.x = character.moveDistance;
    } else {
        return;
    }

    event.preventDefault();
    animateCharacterMove(delta);
}

window.addEventListener('keydown', handleCharacterKeydown);

function openResumeModal() {
    if (!resumeModal || !resumeFrame) {
        return;
    }

    // Always set src from attribute check so blank/default iframe URLs do not block loading.
    if (resumeFrame.getAttribute('src') !== resumeFile) {
        resumeFrame.setAttribute('src', resumeFile);
    }

    resumeModal.classList.add('open');
    resumeModal.setAttribute('aria-hidden', 'false');
}

function closeResumeModal() {
    if (!resumeModal) {
        return;
    }

    resumeModal.classList.remove('open');
    resumeModal.setAttribute('aria-hidden', 'true');
}

function openContactOverlay() {
    if (!contactOverlay || !contactRenderer) {
        return;
    }

    contactOverlay.classList.add('open');
    contactOverlay.setAttribute('aria-hidden', 'false');
    fitContactCanvas();
}

function closeContactOverlay() {
    if (!contactOverlay || !contactRenderer) {
        return;
    }

    contactOverlay.classList.remove('open');
    contactOverlay.setAttribute('aria-hidden', 'true');
}

window.addEventListener('click', (event) => {
    if ((resumeModal && resumeModal.classList.contains('open')) || (contactOverlay && contactOverlay.classList.contains('open'))) {
        return;
    }

    updatePointerFromClient(event.clientX, event.clientY);
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (isNonLaptopDevice) {
        const tapSpeechHit = intersects.find((hit) => hit.object && getSpeechLineForObject(hit.object));
        if (tapSpeechHit) {
            showSpeechBubbleAt(pointerScreen.x, pointerScreen.y, getSpeechLineForObject(tapSpeechHit.object), 2600);
            return;
        }
    }

    const contactMenuHit = intersects.find((hit) => isContactMenuTargetHit(hit));
    const githubHit = intersects.find((hit) => isGithubTargetHit(hit));
    const resumeHit = intersects.find((hit) => isResumeTargetHit(hit));

    if (contactMenuHit) {
        openContactOverlay();
        return;
    }

    if (githubHit) {
        window.open(githubRepoUrl, '_blank', 'noopener,noreferrer');
        return;
    }

    if (resumeHit) {
        openResumeModal();
    }
});

if (resumeClose) {
    resumeClose.addEventListener('click', closeResumeModal);
}

if (contactClose) {
    contactClose.addEventListener('click', closeContactOverlay);
}

if (resumeModal) {
    resumeModal.addEventListener('click', (event) => {
        if (event.target === resumeModal) {
            closeResumeModal();
        }
    });
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeResumeModal();
        closeContactOverlay();
    }
});

if (contactOverlay) {
    contactOverlay.addEventListener('click', (event) => {
        if (event.target === contactOverlay) {
            closeContactOverlay();
        }
    });
}

if (contactCanvas) {
    contactCanvas.addEventListener('click', (event) => {
        event.stopPropagation();
        contactRaycaster.setFromCamera(contactPointer, contactCamera);
        const hits = contactRaycaster.intersectObjects(contactClickables, true);
        const firstHit = hits[0];

        if (!firstHit || !firstHit.object || !firstHit.object.userData.url) {
            return;
        }

        const targetUrl = firstHit.object.userData.url;
        if (targetUrl.startsWith('mailto:')) {
            window.location.href = targetUrl;
            return;
        }

        window.open(targetUrl, '_blank', 'noopener,noreferrer');
    });
}

const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x3a3a3a, 0.55);
scene.add(hemiLight);

// const camera = new.THREE.OrthographicCamera(
//     -aspect * 50,
//     aspect * 50,
//     50,
//     -50,
//     1,
//     1000
// );

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.6);
directionalLight.position.set(60, 120, 80);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -250;
directionalLight.shadow.camera.right = 250;
directionalLight.shadow.camera.top = 250;
directionalLight.shadow.camera.bottom = -250;
scene.add(directionalLight);

const loader = new GLTFLoader();
loader.load(
    './scene_model.glb',
    function (gltf) {
        gltf.scene.traverse(child=>{
            if(child.isMesh){
                child.castShadow = true;
                child.receiveShadow = true;
            }
            console.log(child);
        });

        const model = gltf.scene;
        collectCharacterAndColliders(model);

        model.traverse((child) => {
            if (isBatEyeMesh(child)) {
                bat.meshes.push(child);
                if (!bat.mesh) {
                    bat.mesh = child;
                }
            }

            if (isCubeSwarmMesh(child)) {
                cubeSwarm.meshes.push(child);
            }
        });

        const batRootCandidate = model.getObjectByName('Cube003') || findDirectSharedParent(bat.meshes);
        if (batRootCandidate && batRootCandidate !== model) {
            bat.root = batRootCandidate;
            bat.basePosition.copy(batRootCandidate.position);
            bat.baseRotationY = batRootCandidate.rotation.y;
        }

        for (const mesh of bat.meshes) {
            bat.baseMeshPositions.set(mesh, mesh.position.clone());
            bat.baseMeshRotationsY.set(mesh, mesh.rotation.y);
        }

        if (!bat.root && bat.mesh) {
            bat.basePosition.copy(bat.mesh.position);
            bat.baseRotationY = bat.mesh.rotation.y;
        }

        const cubeSwarmRootCandidate = findDirectSharedParent(cubeSwarm.meshes);
        if (cubeSwarmRootCandidate && cubeSwarmRootCandidate !== model) {
            cubeSwarm.root = cubeSwarmRootCandidate;
            cubeSwarm.baseRootPosition.copy(cubeSwarmRootCandidate.position);
            cubeSwarm.baseRootRotationY = cubeSwarmRootCandidate.rotation.y;
        }

        for (const mesh of cubeSwarm.meshes) {
            cubeSwarm.baseMeshPositions.set(mesh, mesh.position.clone());
            cubeSwarm.baseMeshRotationsY.set(mesh, mesh.rotation.y);
        }

        scene.add(model);
        console.log('Model loaded:', model.name || 'scene_model.glb');
        hideLoadingOverlay();
    },
    undefined,
    function (error) {
        console.error('GLB load failed:', error);
        hideLoadingOverlay();
    }
);

function handleResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    const aspect = sizes.width / sizes.height;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    fitContactCanvas();
}
window.addEventListener('resize', handleResize);

function animate() {
    controls.update();
    const time = clock.getElapsedTime();

    if (bat.root) {
        bat.root.position.x = bat.basePosition.x + Math.sin(time * 1.8) * bat.swayAmplitudeX;
        bat.root.position.y = bat.basePosition.y + Math.sin(time * 3.8) * bat.bobAmplitude;
        bat.root.position.z = bat.basePosition.z + Math.cos(time * 2.2) * bat.swayAmplitudeZ;
        bat.root.rotation.y = bat.baseRotationY + Math.sin(time * 2.0) * bat.turnAmplitude;
    } else {
        bat.meshes.forEach((mesh) => {
            const basePos = bat.baseMeshPositions.get(mesh);
            const baseRotY = bat.baseMeshRotationsY.get(mesh);
            if (!basePos || baseRotY === undefined) {
                return;
            }

            mesh.position.x = basePos.x + Math.sin(time * 1.8) * bat.swayAmplitudeX;
            mesh.position.y = basePos.y + Math.sin(time * 3.8) * bat.bobAmplitude;
            mesh.position.z = basePos.z + Math.cos(time * 2.2) * bat.swayAmplitudeZ;
            mesh.rotation.y = baseRotY + Math.sin(time * 2.0) * bat.turnAmplitude;
        });
    }

    if (cubeSwarm.root) {
        cubeSwarm.root.position.x = cubeSwarm.baseRootPosition.x + Math.sin(time * 2.0) * cubeSwarm.swayAmplitudeX;
        cubeSwarm.root.position.y = cubeSwarm.baseRootPosition.y + Math.sin(time * 3.3) * cubeSwarm.bobAmplitude;
        cubeSwarm.root.position.z = cubeSwarm.baseRootPosition.z + Math.cos(time * 2.6) * cubeSwarm.swayAmplitudeZ;
        cubeSwarm.root.rotation.y = cubeSwarm.baseRootRotationY + Math.sin(time * 1.9) * cubeSwarm.turnAmplitude;
    } else {
        cubeSwarm.meshes.forEach((mesh, index) => {
            const basePos = cubeSwarm.baseMeshPositions.get(mesh);
            const baseRotY = cubeSwarm.baseMeshRotationsY.get(mesh);
            if (!basePos || baseRotY === undefined) {
                return;
            }

            const phase = index * 0.45;
            mesh.position.x = basePos.x + Math.sin(time * 2.0 + phase) * cubeSwarm.swayAmplitudeX;
            mesh.position.y = basePos.y + Math.sin(time * 3.3 + phase) * cubeSwarm.bobAmplitude;
            mesh.position.z = basePos.z + Math.cos(time * 2.6 + phase) * cubeSwarm.swayAmplitudeZ;
            mesh.rotation.y = baseRotY + Math.sin(time * 1.9 + phase) * cubeSwarm.turnAmplitude;
        });
    }

    raycaster.setFromCamera(pointer, camera);
    const allIntersects = raycaster.intersectObjects(scene.children, true);
    const intersects = allIntersects.filter((hit) => isTargetHit(hit));
    canvas.style.cursor = intersects.length > 0 ? 'pointer' : 'default';

    const isOverlayOpen = (resumeModal && resumeModal.classList.contains('open')) || (contactOverlay && contactOverlay.classList.contains('open'));
    const hoverSpeechHit = allIntersects.find((hit) => hit.object && getSpeechLineForObject(hit.object));
    if (!isNonLaptopDevice && !isOverlayOpen && hoverSpeechHit) {
        showSpeechBubbleAt(pointerScreen.x, pointerScreen.y, getSpeechLineForObject(hoverSpeechHit.object));
    } else {
        hideSpeechBubble();
    }

    renderer.render(scene, camera);

    if (contactOverlay && contactOverlay.classList.contains('open')) {
        contactRaycaster.setFromCamera(contactPointer, contactCamera);
        const contactHits = contactRaycaster.intersectObjects(contactClickables, true);
        if (contactCanvas) {
            contactCanvas.style.cursor = contactHits.length > 0 ? 'pointer' : 'default';
        }
        if (contactRenderer) {
            contactRenderer.render(contactScene, contactCamera);
        }
    }
}
renderer.setAnimationLoop(animate);
//music

const music = document.getElementById("bg-music");
const toggle = document.getElementById("music-toggle");
const soundIcon = document.getElementById("icon-sound");
const muteIcon = document.getElementById("icon-mute");

// safety checks
if (music) {
  music.volume = 0.4;
  music.muted = true;

  music.play().catch(() => {
    console.log("Autoplay blocked until interaction");
  });
}

function updateIcons() {
  if (!soundIcon || !muteIcon) return;

  if (music.muted) {
    soundIcon.style.display = "none";
    muteIcon.style.display = "block";
  } else {
    soundIcon.style.display = "block";
    muteIcon.style.display = "none";
  }
}

// initial state
updateIcons();

if (toggle && music) {
  toggle.addEventListener("click", () => {
    music.muted = !music.muted;

    if (!music.muted) {
      music.play();
    }

    updateIcons();
  });
}
//