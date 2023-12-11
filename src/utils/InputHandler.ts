export default class InputHandler {
    private keys: { [key: string]: boolean };

    constructor() {
        // Initialize all keys' state as not pressed
        this.keys = {};

        // Event listeners for key down and key up events
        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
        document.addEventListener('keyup', this.onKeyUp.bind(this), false);
    }

    // When a key is pressed down, set its state as true (pressed)
    private onKeyDown(event: KeyboardEvent): void {
        this.keys[event.code] = true;
    }

    // When a key is released, set its state as false (not pressed)
    private onKeyUp(event: KeyboardEvent): void {
        this.keys[event.code] = false;
    }

    // Method to check if a specific key is pressed
    public isKeyPressed(keyCode: string): boolean {
        return this.keys[keyCode] === true;
    }

    // Method to update the car's state based on the keys pressed
    // This would be called from the game loop or car's update method
    public update(car: any): void {
        if (this.isKeyPressed('ArrowUp')) {
            // Increase the car's forward velocity
            car.accelerate();
        }
        if (this.isKeyPressed('ArrowDown')) {
            // Decrease the car's forward velocity or reverse
            car.decelerate();
        }
        if (this.isKeyPressed('ArrowLeft')) {
            // Turn the car left
            car.turnLeft();
        }
        if (this.isKeyPressed('ArrowRight')) {
            // Turn the car right
            car.turnRight();
        }
    }
}
