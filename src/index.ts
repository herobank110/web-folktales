import { GameEngine, GameplayUtilities, GameplayStatics, Loc, Actor } from "/folktales/include/factorygame/factorygame.js";
import { PlayerAsCharacterPawn, PlayerController } from "./pawns.js";

// Create the test environment for pawn possession and character movement.
GameplayUtilities.createGameEngine(GameEngine);
let pc = GameplayStatics.world.spawnActor(PlayerController, [0, 0]);
let pl = GameplayStatics.world.spawnActor(PlayerAsCharacterPawn, [0, 0]);


pc.possess(pl);
pl.addMovementInput(new Loc(10, 10));


function quickTick(tickFunction) {
    GameplayStatics.world.spawnActor(
        class extends Actor { tick(deltaTime) { tickFunction(deltaTime) } },
        [0, 0]
    );
}

quickTick(dt => $("body").text(`Velocity: ${pl.getCharacterMovement().velocity}`));
