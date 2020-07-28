import { World, Actor, GameplayStatics, ETickGroup } from "/folktales/include/factorygame/factorygame.js";
var THREE = window["THREE"];

class RenderManager extends Actor {
    constructor() {
        super();
        this.primaryActorTick.tickGroup = ETickGroup.ENGINE;
    }
    tick(deltaTime: number): void {
        let world = GameplayStatics.world as FolkWorldBase;
        world.renderer.render(world.scene, world.camera);
    }
}

export class FolkWorldBase extends World {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;

    beginPlay() {
        super.beginPlay();

        // Create the render manager.
        this.spawnActor(RenderManager, [0, 0]);

        // Create the THREE.JS scene.
        // TODO: Integrate with game engine's tkObj instead of window.
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();

        // Resize to fit whole window always.
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        window.onresize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        };

        // Attach canvas to window.
        document.body.appendChild(this.renderer.domElement);
    }
}

/** Bind a loose function to be ticked. */
export function makeTick(tickFunction: (number) => void) {
    return GameplayStatics.world.spawnActor(
        class extends Actor { tick(deltaTime) { tickFunction(deltaTime) } },
        [0, 0]
    );
}