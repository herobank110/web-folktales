import { GameEngine, EKeys } from "/folktales/include/factorygame/factorygame.js";
// import { FolkHubWorld } from "../maps/folkHubWorld.js";
// Normally the game would start with the hub world but for now just use changeling.
import { ChangelingWorld } from "../maps/changeling-1102.js";

export class FolkEngine extends GameEngine {
    constructor() {
        super();
        this._startingWorld = ChangelingWorld;
    }

    protected setupInputMappings() {
        // None of the movement keys are needed.
        // this.inputMappings.addActionMapping("MoveForward", EKeys.W);
        // this.inputMappings.addActionMapping("MoveBack", EKeys.S);
        // this.inputMappings.addActionMapping("MoveLeft", EKeys.A);
        // this.inputMappings.addActionMapping("MoveRight", EKeys.D);
        // this.inputMappings.addActionMapping("Interact", EKeys.E, EKeys.LeftMouseButton);

        this.inputMappings.addActionMapping("NextShot", EKeys.LeftMouseButton);
        this.inputMappings.addActionMapping("DebugTest", EKeys.B);
    }
}