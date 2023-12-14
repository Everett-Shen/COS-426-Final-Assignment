import {
    Scene,
    Color,
    PlaneGeometry,
    MeshBasicMaterial,
    Mesh,
    GridHelper,
    Fog,
} from 'three';
import dat from 'dat.gui';
import * as THREE from 'three';
import Raccoon from '../objects/Raccoon';
import BasicLights from '../lights/BasicLights';
import Student from '../objects/Student';
import Car from '../objects/Car'; // Import the Car class

type UpdateChild = {
    update?: (timeStamp: number) => void;
};
const RACCOON_COUNT = 3;
const STUDENT_COUNT = 3;
const MAP_WIDTH = 50;

class SeedScene extends Scene {
    private car: Car; //  property for the car

    state: {
        gui: dat.GUI;
        rotationSpeed: number;
        updateList: UpdateChild[];
        students: Student[];
        raccoons: Raccoon[];
    };

    getRandomPosition(
        existingObjects: { position: THREE.Vector3 }[],
        minDistance: number
    ) {
        let position!: THREE.Vector3;
        let tooClose;
        do {
            position = new THREE.Vector3(
                Math.random() * MAP_WIDTH,
                0, // Assuming y is up and you want to spawn objects on the ground
                Math.random() * MAP_WIDTH
            );

            tooClose = existingObjects.some(
                (obj) => obj.position.distanceTo(position) < minDistance
            );
        } while (tooClose);

        return position;
    }

    constructor() {
        super();

        this.state = {
            gui: new dat.GUI(),
            rotationSpeed: 0,
            updateList: [],
            students: [],
            raccoons: [],
        };

        this.background = new Color(0x7ec0ee);

        // Initialize the car
        this.car = new Car();
        this.add(this.car); // Add the car to the scene
        this.addToUpdateList(this.car); // Add the car to the update list

        // Add fog to the scene
        this.fog = new Fog(0x7ec0ee, 10, 50); // Color, near distance, far distance

        const lights = new BasicLights();
        this.add(lights);

        // Adding raccoons
        for (let i = 0; i < RACCOON_COUNT; i++) {
            let newRaccoon = new Raccoon(this);
            let randomPosition = this.getRandomPosition(
                this.state.students,
                10
            ); // 10 is the minimum distance
            newRaccoon.position.copy(randomPosition);
            newRaccoon.position.y = 10;
            this.add(newRaccoon);
            this.state.raccoons.push(newRaccoon);
        }

        // Adding students
        for (let i = 0; i < STUDENT_COUNT; i++) {
            let newStudent = new Student(this);
            let randomPosition = this.getRandomPosition(
                [...this.state.students, ...this.state.raccoons],
                10
            );
            newStudent.position.copy(randomPosition);
            this.add(newStudent);
            this.state.students.push(newStudent);
        }
        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
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

    // Getter for the car object
    getCar() {
        return this.car;
    }
    update(timeStamp: number): void {
        const { updateList, raccoons, students } = this.state;
        const carBoundingBox = this.car.getBoundingBox(); // Correctly access the car property

        raccoons.forEach((raccoon) => {
            if (carBoundingBox.intersectsBox(raccoon.getBoundingBox())) {
                raccoon.handleCollision();
            }
        });

        students.forEach((student) => {
            if (carBoundingBox.intersectsBox(student.getBoundingBox())) {
                student.handleCollision();
            }
        });

        for (const obj of updateList) {
            if (obj.update !== undefined) {
                obj.update(timeStamp);
            }
        }
    }
}

export default SeedScene;
