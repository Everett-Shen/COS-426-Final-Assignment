import { Group, Audio } from 'three';
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import SeedScene from '../scenes/SeedScene';

import MODEL from './test.glb?url';

class Student extends Group {
    state: {
        gui: dat.GUI;
        animate: boolean;
        speed: number;
        direction: number;
        isDead: boolean;
    };
    mixer!: THREE.AnimationMixer;
    gltfModel!: GLTF;
    deathSound!: Audio;

    constructor(parent: SeedScene) {
        super();

        // Initialize state
        this.state = {
            gui: parent.state.gui,
            animate: true,
            speed: 0.02,
            direction: Math.random() * 2 * Math.PI,
            isDead: false,
        };

        const loader = new GLTFLoader();

        this.name = 'student';
        loader.load(MODEL, (gltf) => {
            this.gltfModel = gltf;
            this.mixer = new THREE.AnimationMixer(gltf.scene);

            this.mixer.clipAction(gltf.animations[1]).play();
            gltf.scene.scale.set(1.5, 1.5, 1.5);
            this.add(gltf.scene);
        });

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    // get the bounding box of the raccoon
    getBoundingBox(): THREE.Box3 {
        const boundingBox = new THREE.Box3();
        boundingBox.setFromObject(this);
        return boundingBox;
    }

    playDeathAnimation = () => {
        // Stop the current animation
        if (this.mixer) {
            const currentAction = this.mixer.clipAction(
                this.gltfModel.animations[1]
            );
            currentAction.stop();
        }

        // Play the death animation once
        if (this.mixer && this.gltfModel.animations[0]) {
            const deathAction = this.mixer.clipAction(
                this.gltfModel.animations[0]
            );
            deathAction.setLoop(THREE.LoopOnce, 1);
            deathAction.clampWhenFinished = true;
            deathAction.play();
        }
        this.parent.playDeathSound(this.position);
    };
    removeSelf(): void {
        // Check if the parent's state.students array exists and contains this instance
        if (this.parent.state.students) {
            // Filter out this instance from the parent's state.students array
            this.parent.state.students = this.parent.state.students.filter(
                (student) => student !== this
            );
        }
    }
    handleCollision(car = false): void {
        if (this.state.isDead) {
            return;
        }
        this.state.isDead = true;

        this.parent.car.incrementStudentScore();
        if (car) {
            this.parent.crashSound.play();
        }
        this.playDeathAnimation();
        this.removeSelf();
        this.parent.updateLiveStudents();
    }

    update(): void {
        if (this.state.animate && !this.state.isDead) {
            if (this.mixer) {
                this.mixer.update(0.02);
            }
            this.rotation.y = this.state.direction;
            const deltaX = Math.sin(this.state.direction) * this.state.speed;
            const deltaZ = Math.cos(this.state.direction) * this.state.speed;

            this.position.x += deltaX;
            this.position.z += deltaZ;
        }
        if (this.state.isDead) {
            if (this.mixer) {
                this.mixer.update(0.02);
            }
            return;
        }
    }
}

export default Student;
