// @ts-nocheck

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

        this.state = {
            gui: parent.state.gui,
            animate: true,
            speed: 0.08,
            direction: Math.random() * 2 * Math.PI,
            lastUpdatedTimestep: 0,
            isDead: false,
            verticalVelocity: 0, // Starting with no vertical movement
        };

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
    removeSelf(): void {
        if (this.parent.state.raccoons) {
            this.parent.state.raccoons = this.parent.state.raccoons.filter(
                (raccoon) => raccoon !== this
            );
        }
    }

    findClosestStudent(): Student | null {
        let closestStudent = null;
        let minDistance = Infinity;

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

    getBoundingBox(): THREE.Box3 {
        const boundingBox = new THREE.Box3();
        boundingBox.setFromObject(this);
        return boundingBox;
    }
    playDeathAnimation = () => {
        // Stop the current animation (running)
        if (this.mixer) {
            const currentAction = this.mixer.clipAction(
                this.gltfModel.animations[6]
            );
            currentAction.stop();
        }

        if (this.mixer && this.gltfModel.animations[0]) {
            const newAction = this.mixer.clipAction(
                this.gltfModel.animations[0]
            );
            newAction.play();
        }
        if (this.mixer) {
            this.mixer.update(0.04);
        }
        this.parent.playDeathSound(this.position, true);
    };

    handleCollision(): void {
        if (!this.state.isDead) {
            this.state.isDead = true;
            this.playDeathAnimation();
            // No need to update score here, as it's handled by the Car class
        }

        this.state.isDead = true;
        this.playDeathAnimation();
        this.removeSelf();
        this.parent.updateLiveRaccoons();
    }

    update(timeStamp: number): void {
        if (this.state.animate && !this.state.isDead) {
            if (this.mixer) {
                this.mixer.update(0.04);
            }

            // Apply gravity
            const gravity = -1;
            const timeDelta = 0.1;
            this.state.verticalVelocity += gravity * timeDelta;

            // Update the y-position based on the vertical velocity
            this.position.y += this.state.verticalVelocity * timeDelta;

            // Check if raccoon has hit the ground
            const groundLevel = 0;
            if (this.position.y <= groundLevel) {
                this.position.y = groundLevel;
                this.state.verticalVelocity = 0; // Stop falling
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
