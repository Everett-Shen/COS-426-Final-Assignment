// @ts-nocheck

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Object3D, Box3, Box3Helper, Color } from 'three';
import * as THREE from 'three';

export default class School extends Object3D {
    boundingBoxes;
    boundingBox;
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

        // Create a new bounding box that will represent the combined bounding box
        const boundingBox1 = new Box3(
            new THREE.Vector3(-10, 0, -30),
            new THREE.Vector3(37, 60, 30)
        );

        const boundingBox2 = new Box3(
            new THREE.Vector3(30, 0, -8),
            new THREE.Vector3(60, 60, 8)
        );

        const boundingBox3 = new Box3(
            new THREE.Vector3(-40, 0, -13),
            new THREE.Vector3(-10, 60, 13)
        );

        const boundingBox4 = new Box3(
            new THREE.Vector3(-65, 0, -6),
            new THREE.Vector3(-35, 60, 6)
        );
        // Assuming you have an array of bounding boxes
        let boundingBoxes = [
            boundingBox1,
            boundingBox2,
            boundingBox3,
            boundingBox4,
        ]; // Replace with your actual bounding boxes

        this.boundingBoxes = boundingBoxes;
    }
    // boundingBoxes is union of smaller boxes and more accurate. BoundingBox is larger, less accurate but faster intersection
    // get the bounding box of the school
    getBoundingBoxes(): Box3 {
        // Iterate over each bounding box

        return this.boundingBoxes;
    }
    getBoundingBox(): Box3 {
        const boundingBox = new Box3();
        boundingBox.setFromObject(this);
        return boundingBox;
    }
}
