import { Scene, Color, PlaneGeometry, MeshBasicMaterial, Mesh, GridHelper, Fog } from 'three';
import dat from 'dat.gui';
import BasicLights from '../lights/BasicLights';
import Car from '../objects/Car'; // Import the Car class

type UpdateChild = {
    update?: (timeStamp: number) => void;
};

class SeedScene extends Scene {
    state: {
        gui: dat.GUI;
        rotationSpeed: number;
        updateList: UpdateChild[];
    };

    constructor() {
        super();

        this.state = {
            gui: new dat.GUI(),
            rotationSpeed: 0,
            updateList: [],
        };

        this.background = new Color(0x7ec0ee);

        // Add fog to the scene
        this.fog = new Fog(0x7ec0ee, 10, 50); // Color, near distance, far distance

        const lights = new BasicLights();
        this.add(lights);

        // Add white plane at (0, 0, 0)
        const planeGeometry = new PlaneGeometry(100, 100); // Adjust the size as needed
        const planeMaterial = new MeshBasicMaterial({ color: 0xffffff });
        const planeMesh = new Mesh(planeGeometry, planeMaterial);

        // Adjust the position and rotation of the plane
        planeMesh.position.set(0, 0, 0);
        planeMesh.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
 
        this.add(planeMesh);

        const gridSize = 100; // Size of the grid
        const gridDivisions = 100; // Number of divisions in the grid

        const grid = new GridHelper(gridSize, gridDivisions);
        grid.position.set(0, 0, 0); // Adjust the position of the grid as needed

        this.add(grid); // Add the grid to the scene
    }

    addToUpdateList(object: UpdateChild): void {
        this.state.updateList.push(object);
    }

    update(timeStamp: number): void {
        const { updateList } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        for (const obj of updateList) {
            if (obj.update !== undefined) {
                obj.update(timeStamp);
            }
        }
    }
}

export default SeedScene;
