import * as THREE from 'https://esm.sh/three@0.149.0';
import { GLTFLoader } from 'https://esm.sh/three@0.149.0/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://esm.sh/three@0.149.0/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'https://esm.sh/three@0.149.0/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'https://esm.sh/three@0.149.0/examples/jsm/loaders/DRACOLoader.js';

const container = document.getElementById('threejs-canvas');
const circularMenu = document.getElementById('circularMenu');
const holdIndicator = document.getElementById('holdIndicator');
const holdProgress = document.querySelector('.hold-progress');
const thoughtCloud = document.getElementById('thoughtCloud');

if (!container) throw new Error("threejs-canvas not found");

// Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(0, 0.4, 3.2);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.minPolarAngle = Math.PI / 3;
controls.maxPolarAngle = Math.PI / 2 + 0.1;
controls.target.set(0, 0.0, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(2, 5, 3);
scene.add(dirLight);

// Loaders
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
gltfLoader.setDRACOLoader(dracoLoader);

const fbxLoader = new FBXLoader();

let mixer;
let model;
const actions = {};
let currentAction;
let currentActionName = 'idle';

// Collect all bone names from the model for remapping
let modelBoneNames = new Set();

function collectBoneNames(object) {
    object.traverse((child) => {
        if (child.isBone || child.isSkinnedMesh) {
            modelBoneNames.add(child.name);
        }
    });
}

/**
 * Remap FBX animation track names to match GLB model bone names.
 * Mixamo FBX files use "mixamorig" prefix (e.g. "mixamorigHips")
 * but the GLB model might use just "Hips" or different naming.
 * This function tries multiple strategies to make them match.
 */
function remapClipToModel(clip, model) {
    // Collect all node names in the model
    const nodeNames = new Set();
    model.traverse((node) => {
        nodeNames.add(node.name);
    });

    const newTracks = [];

    for (const track of clip.tracks) {
        // Track name format is "boneName.property"
        const dotIndex = track.name.lastIndexOf('.');
        const bonePart = track.name.substring(0, dotIndex);
        const propPart = track.name.substring(dotIndex); // e.g. ".position", ".quaternion", ".scale"

        // Clean up the bone path — could be "boneName" or "boneName[subpath]"
        const bracketIdx = bonePart.indexOf('[');
        const pureBone = bracketIdx >= 0 ? bonePart.substring(0, bracketIdx) : bonePart;

        let matchedBone = null;

        // Strategy 1: Direct match
        if (nodeNames.has(pureBone)) {
            matchedBone = pureBone;
        }

        // Strategy 2: Strip "mixamorig" prefix
        if (!matchedBone && pureBone.startsWith('mixamorig')) {
            const stripped = pureBone.replace(/^mixamorig:?/, '');
            if (nodeNames.has(stripped)) {
                matchedBone = stripped;
            }
        }

        // Strategy 3: Fuzzy match — find node whose name ends with the bone name (case-insensitive)
        if (!matchedBone) {
            const lowerBone = pureBone.toLowerCase().replace('mixamorig', '').replace(/^:/, '');
            for (const nodeName of nodeNames) {
                if (nodeName.toLowerCase() === lowerBone || nodeName.toLowerCase().endsWith(lowerBone)) {
                    matchedBone = nodeName;
                    break;
                }
            }
        }

        if (matchedBone) {
            const newTrackName = matchedBone + propPart;
            const newTrack = track.clone();
            newTrack.name = newTrackName;
            newTracks.push(newTrack);
        }
        // If no match found, skip this track (rather than breaking the model)
    }

    if (newTracks.length === 0) {
        // Fallback: return original clip if no remapping worked (might still work)
        return clip;
    }

    return new THREE.AnimationClip(clip.name, clip.duration, newTracks);
}

// Load GLB Model
gltfLoader.load('animations/developer.glb', (gltf) => {
    model = gltf.scene;
    model.position.set(0, -1.35, 0);
    scene.add(model);

    collectBoneNames(model);

    mixer = new THREE.AnimationMixer(model);

    // Load idle animation first (plays immediately)
    loadAnimation('idle', 'animations/idle.fbx', true);

    // Preload all other animations
    setTimeout(() => {
        loadAnimation('clap', 'animations/clapping.fbx');
        loadAnimation('salute', 'animations/salute.fbx');
        loadAnimation('victory', 'animations/victory.fbx');
    }, 500);

}, undefined, (error) => {
    console.error('Error loading GLB:', error);
});

function loadAnimation(name, path, playNow = false) {
    if (actions[name]) {
        if (playNow) playAction(name);
        return;
    }

    fbxLoader.load(path, (fbx) => {
        if (!mixer || !model) return;

        let clip = fbx.animations[0];
        if (!clip) return;

        // Remap track names to match our GLB model's bone names
        clip = remapClipToModel(clip, model);

        const action = mixer.clipAction(clip);
        actions[name] = action;

        if (playNow) playAction(name);
    }, undefined, (err) => {
        console.warn(`Failed to load animation "${name}":`, err);
    });
}

function playAction(name) {
    const action = actions[name];
    if (!action) return;

    if (currentAction && currentAction !== action) {
        currentAction.fadeOut(0.3);
    }

    action.reset().fadeIn(0.3).play();

    // idle loop continuously, others play once and return to idle
    if (name !== 'idle') {
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;

        const onFinished = (e) => {
            if (e.action === action) {
                mixer.removeEventListener('finished', onFinished);
                playAction('idle');
            }
        };
        mixer.addEventListener('finished', onFinished);
    } else {
        action.loop = THREE.LoopRepeat;
    }

    currentAction = action;
    currentActionName = name;
}

// Window resize
window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Render loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// --- Interactive Radial Menu Logic ---
let holdTimer;
let isHolding = false;
let isMenuOpen = false;

function handleHoldStart(e) {
    if (isMenuOpen) {
        if (!e.target.classList.contains('menu-item')) {
            closeMenu();
        }
        return;
    }
    isHolding = true;
    hideThought();

    // Show progress bar
    holdIndicator.classList.add('active');
    void holdProgress.offsetWidth;
    holdProgress.style.width = '100%';

    controls.enabled = false;

    holdTimer = setTimeout(() => {
        if (isHolding) {
            openMenu();
        }
    }, 600);
}

function handleHoldCancel() {
    isHolding = false;
    clearTimeout(holdTimer);

    if (!isMenuOpen) {
        controls.enabled = true;
        holdIndicator.classList.remove('active');
        holdProgress.style.transition = 'none';
        holdProgress.style.width = '0%';
        setTimeout(() => {
            holdProgress.style.transition = 'width 0.6s linear';
        }, 50);
    }
}

function openMenu() {
    isMenuOpen = true;
    circularMenu.classList.add('active');
    holdIndicator.classList.remove('active');
    holdProgress.style.transition = 'none';
    holdProgress.style.width = '0%';
    setTimeout(() => { holdProgress.style.transition = 'width 0.6s linear'; }, 50);
}

function closeMenu() {
    isMenuOpen = false;
    circularMenu.classList.remove('active');
    controls.enabled = true;
}

// Mouse / Touch events for container
container.addEventListener('mousedown', handleHoldStart);
container.addEventListener('touchstart', handleHoldStart, { passive: true });

window.addEventListener('mouseup', handleHoldCancel);
window.addEventListener('touchend', handleHoldCancel, { passive: true });

// Menu Items Click
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const actionName = item.getAttribute('data-action');
        if (actionName) {
            playAction(actionName);
            closeMenu();
        }
    });
});

let thoughtTimeout;
function hideThought() {
    if (thoughtCloud) {
        thoughtCloud.style.opacity = '0';
        clearTimeout(thoughtTimeout);
        thoughtTimeout = setTimeout(() => {
            thoughtCloud.style.opacity = '1';
        }, 3000);
    }
}


