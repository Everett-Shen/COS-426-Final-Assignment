import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Object3D, Vector3, Euler } from 'three';
import InputHandler from '../utils/InputHandler'; // Import the InputHandler class

export default class Car extends Object3D {
    private velocity: Vector3;
    private acceleration: number;
    private deceleration: number;
    private maxSpeed: number;
    private rotationSpeed: number;
    private inputHandler: InputHandler; // An instance of InputHandler

    private isAccelerating: boolean = false;
    private isDecelerating: boolean = false;

    constructor() {
        super();
        this.velocity = new Vector3();
        this.acceleration = 0.01;
        this.deceleration = 0.01;
        this.maxSpeed = 0.5;
        this.rotationSpeed = 0.02;
        this.inputHandler = new InputHandler();

        // Load the model
        const loader = new GLTFLoader();
        loader.load(
            'golf_cart.gltf',
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

    public update(): void {
        this.isAccelerating = this.inputHandler.isKeyPressed('ArrowUp');
        this.isDecelerating = this.inputHandler.isKeyPressed('ArrowDown');

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
        this.applyFriction(); // Apply friction to gradually slow down the car

        // Apply velocity and direction to update position and rotation
        this.applyMovement();
    }

    // Movement methods
    private accelerate(): void {
        if (this.velocity.z < 0) {
            this.velocity.z += this.acceleration * 1.5;
        }
        // If the car is not already at max speed, increase the speed
        if (this.velocity.z > -this.maxSpeed) {
            this.velocity.z += this.acceleration; // Increase speed by reducing the z-value (moving forward)
            // Clamp the velocity to not exceed the max speed
            this.velocity.z = Math.max(this.velocity.z, -this.maxSpeed);
        }
    }
    private decelerate(): void {
        if (this.velocity.z > 0) {
            this.velocity.z -= this.deceleration * 1.5;
        }
        // Check if the car is stationary and should start moving backwards
        if (this.velocity.z == 0) {
            this.velocity.z -= this.deceleration; // Start moving backward
        } else if (this.velocity.z < this.maxSpeed / 2) {
            // Limit reverse speed to half of max speed
            this.velocity.z -= this.deceleration; // Continue increasing speed backwards
        }
    }

    private turnLeft(): void {
        // Check the direction of movement to determine turning direction
        if (this.velocity.z !== 0) {
            const turnDirection =
                this.velocity.z > 0 ? this.rotationSpeed : -this.rotationSpeed;
            this.rotateY(turnDirection);
        }
    }

    private turnRight(): void {
        // Check the direction of movement to determine turning direction
        if (this.velocity.z !== 0) {
            const turnDirection =
                this.velocity.z > 0 ? -this.rotationSpeed : this.rotationSpeed;
            this.rotateY(turnDirection);
        }
    }

    private applyFriction(): void {
        if (!this.isAccelerating && !this.isDecelerating) {
            if (this.velocity.z < 0) {
                this.velocity.z += this.deceleration;
            } else if (this.velocity.z > 0) {
                this.velocity.z -= this.deceleration;
            }
        }
    }

    // Modify the applyMovement method to apply the velocity in the direction the car is facing
    private applyMovement(): void {
        // Update velocity based on acceleration or deceleration
        this.velocity.clampLength(0, this.maxSpeed);

        // Update the velocity vector to be in the direction the car is facing
        const directionVector = new Vector3(0, 0, this.velocity.z < 0 ? 1 : -1);
        directionVector.applyQuaternion(this.quaternion);

        // Apply the updated velocity vector to the car's position
        this.position.add(
            directionVector.multiplyScalar(this.velocity.length())
        );
    }
}
