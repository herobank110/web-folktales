import { Loc } from "/folktales/include/factorygame/factorygame.js";
import { PlayerAsCharacterPawn, PlayerController } from "../pawns.js";
import { FolkWorldBase, makeTick } from "../core/world.js";
var THREE = window["THREE"];

export class FolkHubWorld extends FolkWorldBase {
    beginPlay() {
        super.beginPlay();

        // Create the test environment for pawn possession and character movement.
        let pc = this.spawnActor(PlayerController, [0, 0]);
        let pl = this.spawnActor(PlayerAsCharacterPawn, [0, 0, 0]);

        pc.possess(pl);

        let geometry = new THREE.BoxGeometry(10, 10, 10);
        let material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        let cube = new THREE.Mesh(geometry, material);
        cube.position.y = 5;
        this.scene.add(cube);

        let planeGeom = new THREE.PlaneGeometry(1000, 1000);
        let planeMat = new THREE.MeshPhongMaterial({color: 0xeeeeee});
        let plane = new THREE.Mesh(planeGeom, planeMat);
        plane.rotation.x = Math.PI / -2;
        plane.position.y -= 3;
        this.scene.add(plane);
        plane.receiveShadow = true;


        let dirLight = new THREE.DirectionalLight();
        dirLight.rotation.x = Math.PI / 2;
        this.scene.add(dirLight);

        let envLight = new THREE.AmbientLight(0xcccccc);
        this.scene.add(envLight);

        // TODO: import FBX model

        makeTick(dt => { cube.rotateY(Math.PI / 2 * dt); });
    }
}
