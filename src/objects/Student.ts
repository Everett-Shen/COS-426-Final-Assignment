import { Group } from 'three';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

import SeedScene from '../scenes/SeedScene';

import MODEL from './bryce.fbx?url';

class Student extends Group {
    state: {
        gui: dat.GUI;
        animate: boolean;
        speed: number;
        direction: number;
        isDead: boolean;
    };
    mixer!: THREE.AnimationMixer;

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

        // Load FBX model
        const loader = new FBXLoader();

        this.name = 'student';
        loader.load(MODEL, (fbx) => {
            this.mixer = new THREE.AnimationMixer(fbx);

            this.mixer.clipAction(fbx.animations[1]).play();
            fbx.scale.set(0.01, 0.01, 0.01);
            this.add(fbx);
        });

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    // get the bounding box of the raccoon
    getBoundingBox(): THREE.Box3 {
        const boundingBox = new THREE.Box3().setFromObject(this);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        size.multiplyScalar(0.9); // Scale down by 20%
        boundingBox.expandByVector(size.negate().multiplyScalar(0.5));
        return boundingBox;
    }

    handleCollision(): void {
        // Set the raccoon as dead
        this.state.isDead = true;

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
