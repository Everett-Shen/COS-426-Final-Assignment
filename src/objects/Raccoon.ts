import { Group } from 'three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import TWEEN from 'three/examples/jsm/libs/tween.module.js';

import SeedScene from '../scenes/SeedScene';

import MODEL from './animated_raccoon.glb?url';

class Raccoon extends Group {
    state: {
        gui: dat.GUI;
        animate: boolean;
        clock: THREE.Clock;
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
            clock: new THREE.Clock(),
            speed: 0.1,
            direction: Math.random() * 2 * Math.PI,
        };

        // Load FBX model
        const loader = new GLTFLoader();

        this.name = 'myFBXObject';
        loader.load(MODEL, (gltf) => {
            this.mixer = new THREE.AnimationMixer(gltf.scene);
            this.mixer.clipAction(gltf.animations[6]).play(); // run
            // Play all animations
            // gltf.animations.forEach((clip) => {});
            gltf.scene.scale.set(0.05, 0.05, 0.05);
            this.add(gltf.scene);
        });

        // Add self to parent's update list
        parent.addToUpdateList(this);

        // Populate GUI
        this.state.gui.add(this.state, 'animate');
    }

    update(timeStamp: number): void {
        if (this.state.animate) {
            // Animation logic here
            // For example, simple rotation:
            // this.rotation.y += 0.01;
            if (this.mixer) {
                this.mixer.update(this.state.clock.getDelta());
            }
            this.position.z += this.state.speed;
            this.rotation.y = this.state.direction;
            const deltaX = Math.sin(this.state.direction) * this.state.speed;
            const deltaZ = Math.cos(this.state.direction) * this.state.speed;

            this.position.x += deltaX;
            this.position.z += deltaZ;
        }

        // Advance tween animations, if any exist
        TWEEN.update();
    }
}

export default Raccoon;
