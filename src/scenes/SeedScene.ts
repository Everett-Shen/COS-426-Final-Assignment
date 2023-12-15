// @ts-nocheck
import { Scene, Color, Fog, AudioListener, AudioLoader, Audio } from 'three';
import dat from 'dat.gui';
import * as THREE from 'three';
import Raccoon from '../objects/Raccoon';
import BasicLights from '../lights/BasicLights';
import Student from '../objects/Student';
import Car from '../objects/Car';
import Grass from '../objects/grass';
import School from '../objects/School';
import musicSoundFile from '../sounds/music.mp3';
import deathSoundFile from '../sounds/death.mp3';
import racconDeathSoundFile from '../sounds/raccoonDeath.mp3';
import crashSoundFile from '../sounds/crash.mp3';
import squishSoundFile from '../sounds/squish.mp3';

type UpdateChild = {
    update?: (timeStamp: number) => void;
};
const RACCOON_COUNT = 10;
const STUDENT_COUNT = 10;
const MAP_WIDTH = 300;
const MIN_DIST = 50;

class SeedScene extends Scene {
    private car: Car;
    private grass: Grass;
    private school: School;

    state: {
        gui: dat.GUI;
        rotationSpeed: number;
        updateList: UpdateChild[];
        students: Student[];
        raccoons: Raccoon[];
        points: number;
        lastSpawnedTime: number;
        lastCollisionTime: number;
        isGameOver: boolean;
    };
    listener: AudioListener;
    deathSound!: Audio;
    raccoonDeathSound!: Audio;
    squishSound!: Audio;
    music!: Audio;
    crashSound!: Audio;

    getRandomPosition(
        existingObjects: { position: THREE.Vector3 }[],
        minDistance: number
    ) {
        let position!: THREE.Vector3;
        let tooClose;
        do {
            position = new THREE.Vector3(
                Math.random() * MAP_WIDTH - MAP_WIDTH / 2,
                0,
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
            MIN_DIST
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
            lastSpawnedTime: 0,
            lastCollisionTime: 0,
            isGameOver: false,
        };
        this.listener = new AudioListener();

        this.background = new Color(0x7ec0ee);

        this.car = new Car();
        this.add(this.car);
        this.addToUpdateList(this.car);
        this.car.position.copy(new THREE.Vector3(0, 0, 150));

        this.grass = new Grass();
        this.add(this.grass);

        this.school = new School();
        this.add(this.school);

        // Add fog to the scene
        this.fog = new Fog(0x7ec0ee, 75, 125); // Color, near distance, far distance

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

        // death sound
        const audioLoader = new AudioLoader();
        audioLoader.load(deathSoundFile, (buffer) => {
            this.deathSound = buffer;
        });

        // raccoon death sound
        audioLoader.load(racconDeathSoundFile, (buffer) => {
            this.raccoonDeathSound = buffer;
        });

        // squish sound
        audioLoader.load(squishSoundFile, (buffer) => {
            this.squishSound = buffer;
        });
        // crash sound
        audioLoader.load(crashSoundFile, (buffer) => {
            this.crashSound = buffer;
        });

        // load music
        this.music = new Audio(this.listener);
        audioLoader.load(musicSoundFile, (buffer) => {
            this.music.setBuffer(buffer);
            this.music.setLoop(true);
            this.music.play();
        });
    }

    playDeathSound(position: THREE.Vector3, raccoon = false) {
        let distance = this.car.position.distanceTo(position);

        if (raccoon) {
            let raccoonDeathSound = new Audio(this.listener);
            raccoonDeathSound.setBuffer(this.raccoonDeathSound);
            raccoonDeathSound.setVolume(
                Math.max(0.1 / (distance / MAP_WIDTH), 1)
            );
            let squishSound = new Audio(this.listener);
            squishSound.setBuffer(this.squishSound);
            squishSound.setVolume(Math.max(0.1 / (distance / MAP_WIDTH), 1));
            raccoonDeathSound.play();
            squishSound.play();
        } else {
            let deathSound = new Audio(this.listener);
            deathSound.setBuffer(this.deathSound);
            deathSound.setVolume(Math.max(0.03 / (distance / MAP_WIDTH), 0.2));
            deathSound.play();
        }
    }

    addToUpdateList(object: UpdateChild): void {
        this.state.updateList.push(object);
    }

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
    intersectsBuilding(thing) {
        const schoolBoundingBoxes = this.school.getBoundingBoxes();
        const intersections = schoolBoundingBoxes.filter((box) =>
            thing.intersectsBox(box)
        );
        return intersections.length > 0;
    }

    update(timeStamp: number): void {
        if (this.state.isGameOver) {
            return; // Skip the update loop if the game is over
        }
        const { updateList, raccoons, students } = this.state;
        const carBoundingBox = this.car.getBoundingBox();
        const schoolBoundingBoxes = this.school.getBoundingBoxes();
        const schoolBoundingBox = this.school.getBoundingBox();
        const grassBoundingBox = this.grass.getBoundingBox();

        // avoid updating too often

        // raccoon collisions
        raccoons.forEach((raccoon) => {
            const raccoonBoundingBox = raccoon.getBoundingBox();
            if (
                !raccoon.state.isDead &&
                carBoundingBox.intersectsBox(raccoonBoundingBox)
            ) {
                raccoon.handleCollision();
                this.car.incrementRaccoonScore();
            } else if (raccoonBoundingBox.intersectsBox(schoolBoundingBox)) {
                const intersectionBox = new THREE.Box3()
                    .copy(raccoonBoundingBox)
                    .intersect(schoolBoundingBox);

                const distanceX = intersectionBox.max.x - intersectionBox.min.x;
                const distanceZ = intersectionBox.max.z - intersectionBox.min.z;

                raccoon.position.x -= distanceX;
                raccoon.position.z -= distanceZ;
            } else if (!raccoonBoundingBox.intersectsBox(grassBoundingBox)) {
                let distanceX = 0;
                let distanceZ = 0;

                if (raccoonBoundingBox.min.x < grassBoundingBox.min.x) {
                    distanceX =
                        raccoonBoundingBox.min.x - grassBoundingBox.min.x;
                } else if (raccoonBoundingBox.max.x > grassBoundingBox.max.x) {
                    distanceX =
                        raccoonBoundingBox.max.x - grassBoundingBox.max.x;
                }

                if (raccoonBoundingBox.min.z < grassBoundingBox.min.z) {
                    distanceZ =
                        raccoonBoundingBox.min.z - grassBoundingBox.min.z;
                } else if (raccoonBoundingBox.max.z > grassBoundingBox.max.z) {
                    distanceZ =
                        raccoonBoundingBox.max.z - grassBoundingBox.max.z;
                }

                raccoon.position.x -= distanceX;
                raccoon.position.z -= distanceZ;
            }
        });
        // student collisions
        students.forEach((student) => {
            const studentBoundingBox = student.getBoundingBox();
            if (
                !student.state.isDead &&
                studentBoundingBox.intersectsBox(carBoundingBox)
            ) {
                student.handleCollision(true);
            } else if (studentBoundingBox.intersectsBox(schoolBoundingBox)) {
                const intersectionBox = new THREE.Box3()
                    .copy(studentBoundingBox)
                    .intersect(schoolBoundingBox);

                const distanceX = intersectionBox.max.x - intersectionBox.min.x;
                const distanceZ = intersectionBox.max.z - intersectionBox.min.z;

                student.position.x -= distanceX;
                student.position.z -= distanceZ;
            } else if (!studentBoundingBox.intersectsBox(grassBoundingBox)) {
                let distanceX = 0;
                let distanceZ = 0;

                if (studentBoundingBox.min.x < grassBoundingBox.min.x) {
                    distanceX =
                        studentBoundingBox.min.x - grassBoundingBox.min.x;
                } else if (studentBoundingBox.max.x > grassBoundingBox.max.x) {
                    distanceX =
                        studentBoundingBox.max.x - grassBoundingBox.max.x;
                }

                if (studentBoundingBox.min.z < grassBoundingBox.min.z) {
                    distanceZ =
                        studentBoundingBox.min.z - grassBoundingBox.min.z;
                } else if (studentBoundingBox.max.z > grassBoundingBox.max.z) {
                    distanceZ =
                        studentBoundingBox.max.z - grassBoundingBox.max.z;
                }

                student.position.x -= distanceX;
                student.position.z -= distanceZ;
            }
        });

        // car collisions
        // building collisions
        if (this.intersectsBuilding(carBoundingBox)) {
            this.car.reverseVelocity();
        } // wall collisions
        else if (!carBoundingBox.intersectsBox(grassBoundingBox)) {
            let distanceX = 0;
            let distanceZ = 0;

            if (carBoundingBox.min.x < grassBoundingBox.min.x) {
                distanceX = carBoundingBox.min.x - grassBoundingBox.min.x;
            } else if (carBoundingBox.max.x > grassBoundingBox.max.x) {
                distanceX = carBoundingBox.max.x - grassBoundingBox.max.x;
            }

            if (carBoundingBox.min.z < grassBoundingBox.min.z) {
                distanceZ = carBoundingBox.min.z - grassBoundingBox.min.z;
            } else if (carBoundingBox.max.z > grassBoundingBox.max.z) {
                distanceZ = carBoundingBox.max.z - grassBoundingBox.max.z;
            }

            this.car.position.x -= distanceX;
            this.car.position.z -= distanceZ;
        }

        for (const obj of updateList) {
            if (obj.update !== undefined) {
                obj.update(timeStamp);
            }
        }

        // spawn raccoons and students
        if (timeStamp - this.state.lastSpawnedTime > 5000) {
            this.state.lastSpawnedTime = timeStamp;
            this.addRaccoon();
            this.addStudent();
        }
    }
}

export default SeedScene;
