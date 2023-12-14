import { Group } from 'three';
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import SeedScene from '../scenes/SeedScene';

import MODEL from './Raccoon.glb?url';
import Student from './Student';
const EPS = 5;
class Raccoon extends Group {
    state: {
        gui: dat.GUI;
        animate: boolean;
        speed: number;
        direction: number;
        lastUpdatedTimestep: number;
        isDead: boolean;
        verticalVelocity: number;
    };
    mixer!: THREE.AnimationMixer;
    gltfModel!: GLTF;

    constructor(parent: SeedScene) {
        super();

        // Initialize state
        this.state = {
            gui: parent.state.gui,
            animate: true,
            speed: 0.08,
            direction: Math.random() * 2 * Math.PI,
            lastUpdatedTimestep: 0,
            isDead: false,
            verticalVelocity: 0, // Starting with no vertical movement
        };

        // this.position.y = 50; // Start falling from y = 50 units
        // console.log('Initial Y position set in constructor:', this.position.y);

        // Load GLTF model
        const loader = new GLTFLoader();

        this.name = 'raccoon';
        loader.load(MODEL, (gltf) => {
            this.gltfModel = gltf;
            this.mixer = new THREE.AnimationMixer(gltf.scene);
            this.mixer.clipAction(gltf.animations[6]).play(); // run
            gltf.scene.scale.set(0.05, 0.05, 0.05);
            this.add(gltf.scene);
        });
        // Add self to parent's update list
        parent.addToUpdateList(this);
    }
    updateDirection(direction: number): void {
        this.state.direction = direction;
    }

    findClosestStudent(): Student | null {
        let closestStudent = null;
        let minDistance = Infinity;

        // Use type assertion here
        if (this.parent instanceof SeedScene) {
            const parentScene = this.parent as SeedScene;

            for (let student of parentScene.state.students) {
                let distance = student.position.distanceTo(this.position);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestStudent = student;
                }
            }
        }

        return closestStudent;
    }

    // get the bounding box of the raccoon
    getBoundingBox(): THREE.Box3 {
        const boundingBox = new THREE.Box3();
        boundingBox.setFromObject(this);
        return boundingBox;
    }
    playDeathAnimation = () => {
        // TODO: play sound effect

        // Stop the current animation (running)
        if (this.mixer) {
            const currentAction = this.mixer.clipAction(
                this.gltfModel.animations[6]
            );
            currentAction.stop();
        }

        // Start the new animation (e.g., death animation)
        if (this.mixer && this.gltfModel.animations[0]) {
            const newAction = this.mixer.clipAction(
                this.gltfModel.animations[0]
            );
            newAction.play();
        }
        if (this.mixer) {
            this.mixer.update(0.04);
        }
    };

    handleCollision(): void {
        // Set the raccoon as dead
        if (this.state.isDead) {
            return;
        }

        this.state.isDead = true;
        this.playDeathAnimation();
    }

    update(timeStamp: number): void {
        if (this.state.animate && !this.state.isDead) {
            if (this.mixer) {
                this.mixer.update(0.04);
            }

            // Apply gravity
            const gravity = -9.8;
            const timeDelta = 0.1; // Convert timeStamp from ms to seconds
            this.state.verticalVelocity += gravity * timeDelta;

            // Update the y-position based on the vertical velocity
            this.position.y += this.state.verticalVelocity * timeDelta;

            // Check if raccoon has hit the ground
            const groundLevel = 0; // Assuming your ground is at y = 0
            if (this.position.y <= groundLevel) {
                this.position.y = groundLevel; // Place raccoon on the ground
                this.state.verticalVelocity = 0; // Stop falling
                // Trigger any landing effects or animations here
            }

            // update direction based on closest students
            if (timeStamp - this.state.lastUpdatedTimestep > 500) {
                this.state.lastUpdatedTimestep = timeStamp;
                let closestStudent = this.findClosestStudent();
                if (closestStudent) {
                    let direction = closestStudent?.position
                        .clone()
                        .sub(this.position);
                    let rotation = Math.atan2(direction.x, direction.z);
                    this.state.direction = rotation;
                    this.rotation.y = rotation;
                    let distance = closestStudent.position.distanceTo(
                        this.position
                    );
                    if (distance && distance < EPS) {
                        closestStudent.handleCollision();
                    }
                }
            }
            const deltaX = Math.sin(this.state.direction) * this.state.speed;
            const deltaZ = Math.cos(this.state.direction) * this.state.speed;

            this.position.x += deltaX;
            this.position.z += deltaZ;
        }
    }
}

export default Raccoon;
