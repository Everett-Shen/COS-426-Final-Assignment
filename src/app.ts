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
const pauseScreen = document.getElementById('pause');

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

// Render loop
const onAnimationFrameHandler = (timeStamp: number) => {
    thirdPersonCamera.update(); // Update the camera position based on the car

    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);
    animationFrameId = window.requestAnimationFrame(onAnimationFrameHandler);
};
animationFrameId = window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);

// Function to reset the game
function resetGame() {}

// Listen for the game over event
document.addEventListener('gameOver', () => {
    // Stop the animation loop
    window.cancelAnimationFrame(animationFrameId);

    // Display the game over screen
    const gameOverScreen = document.getElementById('game-over');
    if (gameOverScreen) {
        gameOverScreen.style.display = 'block'; // Show the game over screen

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
    if (event.key === 'Escape') {
        isPaused = !isPaused;
        if (isPaused) {
            // Pause the game
            window.cancelAnimationFrame(animationFrameId);
            // Display the game pause screen
            if (pauseScreen) pauseScreen.style.display = 'block'; // Show the pause screen
        } else {
            // Resume the game
            if (pauseScreen) pauseScreen.style.display = 'none'; // Hide the pause screen
            animationFrameId = window.requestAnimationFrame(
                onAnimationFrameHandler
            );
        }
    } else if (event.key === 'Enter') {
        // Check if the game over screen is currently shown
        const gameOverScreen = document.getElementById('game-over');
        if (gameOverScreen && gameOverScreen.style.display === 'block') {
            gameOverScreen.style.display = 'none'; // Hide the game over screen
            resetGame(); // Reset the game
        }
    }
});
