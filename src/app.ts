/**
 * app.ts
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
import SeedScene from './scenes/SeedScene';
import { ThirdPersonCamera } from './utils/ThirdPersonCamera';

// Initialize core ThreeJS components
let scene = new SeedScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });
let animationFrameId: number;
let isPaused = false;
let isGameOver = false;
let isGameStarted = false;
const pauseScreen = document.getElementById('pause');
const gameOverScreen = document.getElementById('game-over');

// Set up camera
camera.position.set(6, 3, -10);
camera.lookAt(new Vector3(0, 0, 0));

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = '0'; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Render loop
let thirdPersonCamera = new ThirdPersonCamera(camera, scene.getCar());

export function startGame() {
    if (!isGameStarted) {
        isGameStarted = true;
        animationFrameId = window.requestAnimationFrame(
            onAnimationFrameHandler
        );
    }
}

// Render loop
const onAnimationFrameHandler = (timeStamp: number) => {
    if (!isGameStarted) return;

    thirdPersonCamera.update(); // Update the camera position based on the car

    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);
    animationFrameId = window.requestAnimationFrame(onAnimationFrameHandler);
};
// animationFrameId = window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);

// Listen for the game over event
document.addEventListener('gameOver', () => {
    isGameOver = true;
    scene.state.isGameOver = true; // Set the flag in SeedScene state

    window.cancelAnimationFrame(animationFrameId);

    if (gameOverScreen) {
        gameOverScreen.style.display = 'block';

        // Update the final score text
        const finalScoreElement = document.getElementById('final-score');
        if (finalScoreElement) {
            finalScoreElement.textContent = scene
                .getCar()
                .raccoonScore.toString();
        }
    }
});

// Toggle pause functionality
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !isGameOver) {
        isPaused = !isPaused;
        if (isPaused) {
            window.cancelAnimationFrame(animationFrameId);
            if (pauseScreen) pauseScreen.style.display = 'block';
        } else {
            if (pauseScreen) pauseScreen.style.display = 'none';
            animationFrameId = window.requestAnimationFrame(
                onAnimationFrameHandler
            );
        }
    } else if (event.key === 'Enter' && isGameOver) {
        window.location.reload();
    }
});
