import { World, Loc, GameplayStatics, Actor } from "/folktales/include/factorygame/factorygame.js";
import { PlayerAsCharacterPawn, PlayerController } from "../pawns.js";

export class FolkHubWorld extends World {
    beginPlay() {
        super.beginPlay();

        // Create the test environment for pawn possession and character movement.
        let pc = this.spawnActor(PlayerController, [0, 0]);
        let pl = this.spawnActor(PlayerAsCharacterPawn, [0, 0]);

        pc.possess(pl);
        pl.addMovementInput(new Loc(100, 100));

        // This is a nice one to have!
        function makeTick(tickFunction) {
            GameplayStatics.world.spawnActor(
                class extends Actor { tick(deltaTime) { tickFunction(deltaTime) } },
                [0, 0]
            );
        }

        let t = 0;
        makeTick(dt => (((t += dt) % .01) < dt) && $("body").text(`Velocity: ${pl.getCharacterMovement().velocity}`));
    }
}
