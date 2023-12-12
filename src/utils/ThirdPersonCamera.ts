import { Vector3, Camera, Object3D, Quaternion } from 'three';

export class ThirdPersonCamera {
    private camera: Camera;
    private target: Object3D;
    private idealOffset: Vector3;
    private currentOffset: Vector3;
    private currentLookat: Vector3;
    private smoothSpeed: number = 0.1;

    constructor(camera: Camera, target: Object3D, offset: Vector3) {
        this.camera = camera;
        this.target = target;
        this.idealOffset = offset;
        this.currentOffset = new Vector3();
        this.currentLookat = new Vector3();
    }

    private calculateIdealOffset(): Vector3 {
        // Calculate the ideal offset using the target's rotation
        const idealOffset = new Vector3(0, 8, 5);
        idealOffset.applyQuaternion(this.target.quaternion);
        idealOffset.add(this.target.position);
        return idealOffset;
    }

    private calculateIdealLookat(): Vector3 {
        // Calculate the ideal look-at position also considering the target rotation
        const idealLookat = new Vector3(0, 1, -10);
        idealLookat.applyQuaternion(this.target.quaternion);
        idealLookat.add(this.target.position);
        return idealLookat;
    }

    public update(timeElapsed: number): void {
        // Calculate the ideal positions
        const idealOffset = this.calculateIdealOffset();
        const idealLookat = this.calculateIdealLookat();

        // Interpolate the current positions towards the ideal positions
        this.currentOffset.lerp(idealOffset, this.smoothSpeed);
        this.currentLookat.lerp(idealLookat, this.smoothSpeed);

        // Update the camera's position and look-at
        this.camera.position.copy(this.currentOffset);
        this.camera.lookAt(this.currentLookat);
    }
}
