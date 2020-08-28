import { EngineObject, Loc } from "/folktales/include/factorygame/factorygame.js";
var THREE = window["THREE"];

/**
 * Allows a camera to be orbited using input controls.
 * 
 * This must be hooked into the input system manually.
 */
export class OrbitCameraComponent extends EngineObject {
    /** The parent of the camera who receives our rotation. */
    private effector: THREE.Object3D;

    /** Camera being controlled. */
    private camera: THREE.Camera;

    public setCamera(new_camera: THREE.Camera) {
        // Save reference to the camera.
        this.camera = new_camera;

        // Wrap the camera with a scene component to adjust rotation.
        this.effector = new THREE.Object3D();
        this.camera.parent.add(this.effector);
        this.effector.add(this.camera);
    }

    /**
     * Add positional screen coordinates.
     */
    public addCoordinates(){}

    /**
     * Register a 2d positional offset.
     * 
     * @param movement Direction and amount to move.
     */
    public add2dInput(amount: Loc) {
        this.addYawInput(amount.x);
        this.addPitchInput(amount.y);
    }

    /**
     * Move the camera controls yaw.
     * 
     * @param amount Amount to move.
     */
    public addYawInput(amount: number) {
        if (this.effector !== undefined) {
            this.effector.rotateX(amount);
        }
    }

    /**
     * Move the camera controls pitch.
     * 
     * @param amount Amount to move.
     */
    public addPitchInput(amount: number) {
        if (this.effector !== undefined) {
            this.effector.rotateY(amount);
        }
    }
}