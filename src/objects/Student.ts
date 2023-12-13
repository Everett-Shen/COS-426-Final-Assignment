import { Group } from 'three';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

import SeedScene, { assignRandomPosition } from '../scenes/SeedScene';

import MODEL from './bryce.fbx?url';

class Student extends Group {
    state: {
        gui: dat.GUI;
        animate: boolean;
        speed: number;
        direction: number;
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

        assignRandomPosition(this.position);

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    update(): void {
        if (this.state.animate) {
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
