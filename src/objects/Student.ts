import { Group } from 'three';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import SeedScene, { assignRandomPosition } from '../scenes/SeedScene';

import MODEL from './test.glb?url';
import DYING_MODEL from './remy_dying.fbx?url';

class Student extends Group {
    state: {
        gui: dat.GUI;
        animate: boolean;
        speed: number;
        direction: number;
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

        assignRandomPosition(this.position);

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
        // TODO: play sound effect

        // Stop the current animation (running)
        if (this.mixer) {
            const currentAction = this.mixer.clipAction(
                this.gltfModel.animations[1]
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
            this.mixer.update(0.1);
        }
    };
    handleCollision(): void {
        // Set the raccoon as dead
        this.state.isDead = true;
        this.playDeathAnimation();
        // Here, you can also trigger any animations or actions for the student
        // For example, stopping movement, playing a death animation, etc
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
    }
}

export default Student;
