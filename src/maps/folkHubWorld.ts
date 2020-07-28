import { Loc } from "/folktales/include/factorygame/factorygame.js";
import { PlayerAsCharacterPawn, PlayerController } from "../pawns.js";
import { FolkWorldBase, makeTick } from "../core/world.js";
var THREE = window["THREE"];

export class FolkHubWorld extends FolkWorldBase {
    beginPlay() {
        super.beginPlay();

        // Create the test environment for pawn possession and character movement.
        let pc = this.spawnActor(PlayerController, [0, 0]);
        let pl = this.spawnActor(PlayerAsCharacterPawn, [0, 0]);

        pc.possess(pl);
        pl.addMovementInput(new Loc(100, 100));

        var geometry = new THREE.BoxGeometry();
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        var cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
        this.camera.position.z = 5;

        makeTick(dt => { cube.rotateY(Math.PI / 2 * dt); });
    }
}
