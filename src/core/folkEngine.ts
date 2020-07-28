import { GameEngine } from "/folktales/include/factorygame/factorygame.js";
import { FolkHubWorld } from "../maps/folkHubWorld.js";

export class FolkEngine extends GameEngine {
    constructor() {
        super();
        this._startingWorld = FolkHubWorld;
    }
}