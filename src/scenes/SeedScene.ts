import dat from 'dat.gui';
import { Scene, Color } from 'three';
import * as THREE from 'three';

import Raccoon from '../objects/Raccoon';
import BasicLights from '../lights/BasicLights';
import Car from '../objects/Car'; // Import the Car class

// Define an object type which describes each object in the update list
type UpdateChild = {
    // Each object *might* contain an update function
    update?: (timeStamp: number) => void;
};
const RACCOON_COUNT = 5;
class SeedScene extends Scene {
    private car: Car; //  property for the car
    // Define the type of the state field
    state: {
        gui: dat.GUI;
        rotationSpeed: number;
        updateList: UpdateChild[];
    };

    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new dat.GUI(), // Create GUI for scene
            rotationSpeed: 0,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // // Road (Ground Plane)
        // const roadGeometry = new THREE.PlaneGeometry(100, 10); // Size of the road
        // const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Dark grey
        // const road = new THREE.Mesh(roadGeometry, roadMaterial);
        // road.rotation.x = -Math.PI / 2; // Rotate the plane to be flat on the ground
        // road.position.set(0, 0, 0); // Set position as needed
        // this.add(road);

        // // Environment (Simple Buildings)
        // for (let i = 0; i < 10; i++) {
        //     const buildingGeometry = new THREE.BoxGeometry(5, 10, 5); // Size of the building
        //     const buildingMaterial = new THREE.MeshLambertMaterial({
        //         color: 0x808080,
        //     }); // Building color
        //     const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        //     building.position.set(i * 10 - 50, 5, -10); // Position buildings along one side of the road
        //     this.add(building);
        // }

        // Initialize the car
        this.car = new Car();
        this.add(this.car); // Add the car to the scene
        this.addToUpdateList(this.car); // Add the car to the update list

        // const flower = new Flower(this);
        const lights = new BasicLights();
        this.add(lights);

        // add raccoons
        for (let i = 0; i < RACCOON_COUNT; i++) {
            this.add(new Raccoon(this));
        }
        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object: UpdateChild): void {
        this.state.updateList.push(object);
    }

    update(timeStamp: number): void {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            if (obj.update !== undefined) {
                obj.update(timeStamp);
            }
        }
    }
}

export default SeedScene;
