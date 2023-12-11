import dat from 'dat.gui';
import { Scene, Color } from 'three';
import * as THREE from 'three';
import Raccoon from '../objects/Raccoon';
import Land from '../objects/Land';
import BasicLights from '../lights/BasicLights';
import Student from '../objects/Student';
import Car from '../objects/Car'; // Import the Car class

// Define an object type which describes each object in the update list
type UpdateChild = {
    // Each object *might* contain an update function
    update?: (timeStamp: number) => void;
};
const RACCOON_COUNT = 3;
const STUDENT_COUNT = 3
const MAP_WIDTH = 20

export const getRandomPosition: () => THREE.Vector3 = () => {
    return new THREE.Vector3(Math.random() * MAP_WIDTH, 0,Math.random() * MAP_WIDTH)
}

export const assignRandomPosition = (v:THREE.Vector3) => {
    const position = getRandomPosition()
    v.x = position.x
    v.y = position.y
    v.z = position.z
}

class SeedScene extends Scene {
    private car: Car; //  property for the car
    // Define the type of the state field
    state: {
        gui: dat.GUI;
        rotationSpeed: number;
        updateList: UpdateChild[];
        students: Student[];
        raccoons: Raccoon[];
    };

    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new dat.GUI(), // Create GUI for scene
            rotationSpeed: 0,
            updateList: [],
            students: [],
            raccoons: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const land = new Land();

        // Initialize the car
        this.car = new Car();
        this.add(this.car); // Add the car to the scene
        this.addToUpdateList(this.car); // Add the car to the update list

        // const flower = new Flower(this);
        const lights = new BasicLights();
        this.add(lights);

        // add raccoons
        for (let i = 0; i < RACCOON_COUNT; i++) {
            let newRaccoon = new Raccoon(this)
            this.add(newRaccoon);
            this.state.raccoons.push(newRaccoon)
        }

        // add students
        for (let i = 0; i < STUDENT_COUNT; i++) {
            let newStudent = new Student(this)
            this.add(newStudent);
            this.state.students.push(newStudent)
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
