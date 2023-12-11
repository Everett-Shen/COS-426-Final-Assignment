import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Object3D, Vector3, Euler } from 'three';
import InputHandler from '../utils/InputHandler'; // Import the InputHandler class

export default class Car extends Object3D {
    private velocity: Vector3;
    private acceleration: number;
    private deceleration: number;
    private maxSpeed: number;
    private rotationSpeed: number;
    private direction: Euler;
    private inputHandler: InputHandler; // An instance of InputHandler

    constructor() {
        super();
        this.velocity = new Vector3();
        this.direction = new Euler();
        this.acceleration = 0.02;
        this.deceleration = 0.04;
        this.maxSpeed = 0.2;
        this.rotationSpeed = 0.03;
        this.inputHandler = new InputHandler(); // Initialize the InputHandler

        // Load the model
        const loader = new GLTFLoader();
        loader.load(
            'golf-cart.gltf', // Make sure this path is correct
            (gltf) => {
                console.log('Car model loaded successfully');
                const model = gltf.scene; // Access the scene from the GLTF
                model.scale.set(0.18, 0.18, 0.18); // Adjust scale as needed
                model.rotation.y = Math.PI; // Adjust rotation as needed
                this.add(model); // Add the model to the Car object
            },
            undefined,
            (error) => {
                console.error('Error loading car model:', error);
            }
        );
    }

    public update(timeStamp: number): void {
        // Handle user input
        if (this.inputHandler.isKeyPressed('ArrowUp')) {
            this.accelerate();
        }
        if (this.inputHandler.isKeyPressed('ArrowDown')) {
            this.decelerate();
        }
        if (this.inputHandler.isKeyPressed('ArrowLeft')) {
            this.turnLeft();
        }
        if (this.inputHandler.isKeyPressed('ArrowRight')) {
            this.turnRight();
        }

        // Apply velocity and direction to update position and rotation
        this.applyMovement();
    }

    // Movement methods
    private accelerate(): void {
        if (this.velocity.length() < this.maxSpeed) {
            this.velocity.z -= this.acceleration; // assuming the car moves along the z-axis
        }
    }
    private decelerate(): void {
        if (this.velocity.length() > 0) {
            this.velocity.z += this.deceleration;
        }
    }
    private turnLeft(): void {
        this.direction.y += this.rotationSpeed;
    }
    private turnRight(): void {
        this.direction.y -= this.rotationSpeed;
    }

    // Apply the movement and rotation based on the velocity and direction
    private applyMovement(): void {
        // Update velocity based on acceleration or deceleration
        this.velocity.clampLength(0, this.maxSpeed);

        // Apply friction to slow down the car if not accelerating or decelerating
        if (Math.abs(this.velocity.z) < this.deceleration) {
            this.velocity.z = 0;
        }

        // Update the car's position
        this.position.add(this.velocity);

        // Update the car's rotation
        this.rotation.copy(this.direction);

        // Reset the direction after applying rotation
        this.direction.set(0, 0, 0);
    }
}
