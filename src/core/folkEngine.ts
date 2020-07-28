import { GameEngine, EKeys } from "/folktales/include/factorygame/factorygame.js";
import { FolkHubWorld } from "../maps/folkHubWorld.js";

export class FolkEngine extends GameEngine {
    constructor() {
        super();
        this._startingWorld = FolkHubWorld;
    }

    protected setupInputMappings() {
        this.inputMappings.addActionMapping("MoveForward", EKeys.W);
        this.inputMappings.addActionMapping("MoveBack", EKeys.S);
        this.inputMappings.addActionMapping("MoveLeft", EKeys.A);
        this.inputMappings.addActionMapping("MoveRight", EKeys.D);
        this.inputMappings.addActionMapping("Interact", EKeys.E, EKeys.LeftMouseButton);
    }
}