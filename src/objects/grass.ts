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
                const model = glb.scene;
                model.scale.set(0.25, 0.25, 0.25);
                model.rotation.y = Math.PI;
                this.add(model);
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
