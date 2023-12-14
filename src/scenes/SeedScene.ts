import { Scene, Color, Fog, AudioListener, Audio, AudioLoader } from 'three';
import dat from 'dat.gui';
import * as THREE from 'three';
import Raccoon from '../objects/Raccoon';
import BasicLights from '../lights/BasicLights';
import Student from '../objects/Student';
import Car from '../objects/Car'; // Import the Car class
import School from '../objects/School';

type UpdateChild = {
    update?: (timeStamp: number) => void;
};
const RACCOON_COUNT = 10;
const STUDENT_COUNT = 10;
const MAP_WIDTH = 500;

class SeedScene extends Scene {
    private car: Car; //  property for the car
    private school: School; // property for the school

    state: {
        gui: dat.GUI;
        rotationSpeed: number;
        updateList: UpdateChild[];
        students: Student[];
        raccoons: Raccoon[];
        points: number;
        lastRaccoonSpawnedTime: number;
        lastStudentSpawnedTime: number;
    };
    listener: AudioListener;
    deathSound!: Audio;
    raccoonDeathSound!: Audio;
    squishSound!: Audio;
    music!: Audio;

    getRandomPosition(
        existingObjects: { position: THREE.Vector3 }[],
        minDistance: number
    ) {
        let position!: THREE.Vector3;
        let tooClose;
        do {
            position = new THREE.Vector3(
                Math.random() * MAP_WIDTH - MAP_WIDTH / 2,
                0, // Assuming y is up and you want to spawn objects on the ground
                Math.random() * MAP_WIDTH - MAP_WIDTH / 2
            );

            tooClose = existingObjects.some(
                (obj) => obj.position.distanceTo(position) < minDistance
            );
        } while (tooClose);

        return position;
    }

    addRaccoon() {
        let newRaccoon = new Raccoon(this);
        let randomPosition = this.getRandomPosition(
            this.state.students,
            MAP_WIDTH * 0.1
        ); // 10 is the minimum distance
        newRaccoon.position.copy(randomPosition);
        newRaccoon.position.y = 10;
        this.add(newRaccoon);
        this.state.raccoons.push(newRaccoon);
        this.updateLiveRaccoons();
    }

    addStudent() {
        let newStudent = new Student(this);
        let randomPosition = this.getRandomPosition(
            [...this.state.students, ...this.state.raccoons],
            10
        );
        newStudent.position.copy(randomPosition);
        this.add(newStudent);
        this.state.students.push(newStudent);
        this.updateLiveStudents();
    }

    constructor() {
        super();

        this.state = {
            gui: new dat.GUI(),
            rotationSpeed: 0,
            updateList: [],
            students: [],
            raccoons: [],
            points: 0,
            lastRaccoonSpawnedTime: 0,
            lastStudentSpawnedTime: 0,
        };
        this.listener = new AudioListener();

        this.background = new Color(0x7ec0ee);

        // Initialize the car
        this.car = new Car();
        this.add(this.car); // Add the car to the scene
        this.addToUpdateList(this.car); // Add the car to the update list

        // initialize the school
        this.school = new School();
        this.add(this.school);

        // Add fog to the scene
        this.fog = new Fog(0x7ec0ee, 100, 500); // Color, near distance, far distance

        const lights = new BasicLights();
        this.add(lights);

        // Adding raccoons
        for (let i = 0; i < RACCOON_COUNT; i++) {
            this.addRaccoon();
        }

        // Adding students
        for (let i = 0; i < STUDENT_COUNT; i++) {
            this.addStudent();
        }

        // Load and play the death sound
        const audioLoader = new AudioLoader();
        this.deathSound = new Audio(this.listener);
        audioLoader.load('src/sounds/death.mp3', (buffer) => {
            this.deathSound.setBuffer(buffer);
        });

        // raccoon death sound
        this.raccoonDeathSound = new Audio(this.listener);
        audioLoader.load('src/sounds/raccoonDeath.mp3', (buffer) => {
            this.raccoonDeathSound.setBuffer(buffer);
        });

        // squish sound
        this.squishSound = new Audio(this.listener);
        audioLoader.load('src/sounds/squish.mp3', (buffer) => {
            this.squishSound.setBuffer(buffer);
        });

        // load music
        this.music = new Audio(this.listener);
        audioLoader.load('src/sounds/music.mp3', (buffer) => {
            this.music.setBuffer(buffer);
            this.music.setLoop(true);
            this.music.play();
        });
    }

    playDeathSound(position: THREE.Vector3, raccoon = false) {
        let distance = this.car.position.distanceTo(position);

        if (raccoon) {
            this.raccoonDeathSound.setVolume(
                Math.max(0.1 / (distance / MAP_WIDTH), 1)
            );
            this.squishSound.setVolume(
                Math.max(0.1 / (distance / MAP_WIDTH), 1)
            );
            this.raccoonDeathSound.play();
            this.squishSound.play();
        } else {
            this.deathSound.setVolume(
                Math.max(0.03 / (distance / MAP_WIDTH), 0.2)
            );
            this.deathSound.play();
        }
    }

    addToUpdateList(object: UpdateChild): void {
        this.state.updateList.push(object);
    }

    // Getter for the car object
    getCar() {
        return this.car;
    }

    updateLiveStudents(): void {
        const scoreElement = document.getElementById('live-students');
        if (scoreElement) {
            scoreElement.textContent = `Live Students: ${this.state.students.length}`;
        }
    }

    updateLiveRaccoons(): void {
        const scoreElement = document.getElementById('live-raccoons');
        if (scoreElement) {
            scoreElement.textContent = `Live Raccoons: ${this.state.raccoons.length}`;
        }
    }

    update(timeStamp: number): void {
        const { updateList, raccoons, students } = this.state;
        const carBoundingBox = this.car.getBoundingBox(); // Correctly access the car property
        const schoolBoundingBox = this.school.getBoundingBox();

        raccoons.forEach((raccoon) => {
            if (
                !raccoon.state.isDead &&
                carBoundingBox.intersectsBox(raccoon.getBoundingBox())
            ) {
                raccoon.handleCollision();
                this.car.incrementRaccoonScore();
            }
        });

        students.forEach((student) => {
            if (
                !student.state.isDead &&
                carBoundingBox.intersectsBox(student.getBoundingBox())
            ) {
                student.handleCollision();
            }
        });

        if (!carBoundingBox.intersectsBox(schoolBoundingBox)) {
            // Calculate the distance between the car and the box
            let distanceX = 0;
            let distanceY = 0;

            if (carBoundingBox.min.x < schoolBoundingBox.min.x + 10) {
                distanceX = carBoundingBox.min.x - schoolBoundingBox.min.x;
            } else if (carBoundingBox.max.x > schoolBoundingBox.max.x - 10) {
                distanceX = carBoundingBox.max.x - schoolBoundingBox.max.x;
            }

            if (carBoundingBox.min.y < schoolBoundingBox.min.y + 10) {
                distanceY = carBoundingBox.min.y - schoolBoundingBox.min.y;
            } else if (carBoundingBox.max.y > schoolBoundingBox.max.y - 10) {
                distanceY = carBoundingBox.max.y - schoolBoundingBox.max.y;
            }

            // Move the car back by the calculated distances
            this.car.position.x -= distanceX;
            this.car.position.y -= distanceY;

            this.car.setVelocityZero();
        }

        for (const obj of updateList) {
            if (obj.update !== undefined) {
                obj.update(timeStamp);
            }
        }

        // spawn raccoons and students
        if (timeStamp - this.state.lastRaccoonSpawnedTime > 5000) {
            this.state.lastRaccoonSpawnedTime = timeStamp;
            this.addRaccoon();
        }
        if (timeStamp - this.state.lastStudentSpawnedTime > 5000) {
            this.state.lastStudentSpawnedTime = timeStamp;
            this.addStudent();
        }
    }
}

export default SeedScene;
