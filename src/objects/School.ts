// @ts-nocheck

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Object3D, Box3 } from 'three';
import * as THREE from 'three';

export default class School extends Object3D {
    constructor() {
        super();

        // Load the model
        const loader = new GLTFLoader();
        loader.load(
            'School_v2.glb',
            (glb) => {
                console.log('School model loaded successfully');
                const model = glb.scene; // Access the scene from the GLTF
                model.scale.set(1.5, 1.5, 1.5); // Adjust scale as needed
                model.position.x -= 50;
                model.position.y += 3;
                model.rotation.y = Math.PI; // Adjust rotation as needed
                this.add(model); // Add the model to the School object
                this.toJSON;
            },
            undefined,
            (error) => {
                console.error('Error loading school model:', error);
            }
        );
    }

    // get the bounding box of the school
    getBoundingBox(): Box3 {
        const boundingBox = new Box3();
        boundingBox.setFromObject(this);
        return boundingBox;
    }
}
