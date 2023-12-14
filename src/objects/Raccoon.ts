import { Group } from 'three';
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import SeedScene, { assignRandomPosition } from '../scenes/SeedScene';

import MODEL from './Raccoon.glb?url';

class Raccoon extends Group {
    state: {
        gui: dat.GUI;
        animate: boolean;
        // clock: THREE.Clock;
        speed: number;
        direction: number;
        lastUpdatedTimestep: number;
        isDead: boolean;
    };
    mixer!: THREE.AnimationMixer;
    gltfModel: GLTF;
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
        assignRandomPosition(this.position);
        // Add self to parent's update list
        parent.addToUpdateList(this);
    }
    updateDirection(direction: number): void {
        this.state.direction = direction;
    }

    findClosestStudent(): THREE.Group | null {
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
        this.state.isDead = true;
        this.playDeathAnimation();
    }

    update(timeStamp: number): void {
        if (this.state.animate && !this.state.isDead) {
            if (this.mixer) {
                this.mixer.update(0.04);
            }

            // update direction based on closest students
            if (timeStamp - this.state.lastUpdatedTimestep > 1000) {
                this.state.lastUpdatedTimestep = timeStamp;
                let closestStudent = this.findClosestStudent();
                if (closestStudent) {
                    let direction = closestStudent?.position
                        .clone()
                        .sub(this.position);
                    let rotation = Math.atan2(direction.x, direction.z);
                    this.state.direction = rotation;
                    this.rotation.y = rotation;
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
