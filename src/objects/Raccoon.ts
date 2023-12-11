import { Group } from 'three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import SeedScene from '../scenes/SeedScene';

import MODEL from './animated_raccoon.glb?url';

class Raccoon extends Group {
    state: {
        gui: dat.GUI;
        animate: boolean;
        // clock: THREE.Clock;
        speed: number;
        direction: number;
    };
    mixer: THREE.AnimationMixer;
    constructor(parent: SeedScene) {
        super();

        // Initialize state
        this.state = {
            gui: parent.state.gui,
            animate: true,
            speed: 0.1,
            direction: Math.random() * 2 * Math.PI,
        };

        // Load FBX model
        const loader = new GLTFLoader();

        this.name = 'raccoon';
        loader.load(MODEL, (gltf) => {
            this.mixer = new THREE.AnimationMixer(gltf.scene);
            this.mixer.clipAction(gltf.animations[6]).play(); // run
            gltf.scene.scale.set(0.05, 0.05, 0.05);
            this.add(gltf.scene);
        });

        // Add self to parent's update list
        parent.addToUpdateList(this);

    }

    update(timeStamp: number): void {
        if (this.state.animate) {
            if (this.mixer) {
                this.mixer.update(0.08);
            }
            this.rotation.y = this.state.direction;
            const deltaX = Math.sin(this.state.direction) * this.state.speed;
            const deltaZ = Math.cos(this.state.direction) * this.state.speed;

            this.position.x += deltaX;
            this.position.z += deltaZ;
        }

    }
}

export default Raccoon;
