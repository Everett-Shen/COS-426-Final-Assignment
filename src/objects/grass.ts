import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Object3D, Box3 } from 'three';

export default class Grass extends Object3D {

    constructor() {
        super();

        // Load the model
        const loader = new GLTFLoader();
        loader.load(
            'grass_3.glb',
            (glb) => {
                console.log('grass model loaded successfully');
                const model = glb.scene; // Access the scene from the GLTF
                model.scale.set(.25, .25, .25) // Adjust scale as needed
                model.rotation.y = Math.PI; // Adjust rotation as needed
                this.add(model); // Add the model to the School object
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