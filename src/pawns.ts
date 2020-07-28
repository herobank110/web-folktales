import { Actor, EngineObject, Loc, GameplayUtilities, MathStat } from "/folktales/include/factorygame/factorygame.js";
var THREE: typeof import("three") = window["three"];

/**
 * Base class for actors that can be possessed by a player controller.
 */
class Pawn extends Actor {
    /**
     * Called when a controller begins possession of this pawn.
     * 
     * @param player Controller that just started possession of this
     * pawn.
     */
    onPossessed(player: Controller): void { }

    /**
     * Called when a controller ends possession of this pawn. 
     * 
     * @param player Controller that previously held possession of this
     * pawn.
     */
    onUnPossessed(player: Controller): void { }

    /**
     * Returns whether this pawn can be possess by a Controller.
     * 
     * @param player Controller that would possess this pawn.
     * @returns Whether the controller is allowed to take possession ofs
     * this pawn.
     */
    public canBePossessed(player: Controller): boolean {
        return true;
    }

    public tick(deltaTime: number): void { }
}

/**
 * Types of movement that are allowed by CharacterMovementComponent.
 */
export enum EMovementMode {
    /** Movement is disabled. Input is ignored. */
    None = 0,
    /** The typical movement mode. */
    Walking = 1,
    /** Movement in a body of water. */
    Swimming = 2,
    /** Any other special movement mode. */
    Custom = 3
}

/**
 * Enables humanoid movement for characters.
 */
class CharacterMovementComponent extends EngineObject {
    /** Movement speed input multiplier when swimming. */
    public swimmingMovementScale: number = 0.8;

    /** Actor to apply movement to. */
    public targetActor: Actor = null;

    /** Friction coefficient when walking on land. */
    public walkingFriction: number = 0.6;

    /** Friction coefficient when swimming. */
    public swimmingFriction: number = 0.8;

    /** Scale of gravity. 1 means normal downward gravity. */
    public gravityScale: number = 1.0;

    /** Whether the player is currently falling or safely on ground. */
    public isFalling: boolean = false;

    /** Speed at which the player will be considered to be perfectly still. */
    zeroVelocityThreshold: number = 1.0;

    /** Returns the current velocity. */
    public get velocity() { return this._velocity; }

    /** Speed at which the actor is moving */
    private _velocity: Loc = new Loc(0, 0);

    /** Mode of movement. If None, movement is disabled. */
    private movementMode: EMovementMode = EMovementMode.Walking;

    /**
     * Add movement to be applied this frame.
     * 
     * @param direction Direction to move in.
     * @param rate Multiplier for movement. Typically this is joystick pitch.
     */
    public addMovementInput(direction: Loc, rate: number): void {
        switch (this.movementMode) {
            case EMovementMode.None: /* Ignore input. */ break;
            case EMovementMode.Swimming:
                // Slower movement if swimming, but still able to move.
                rate *= this.swimmingMovementScale;
            case EMovementMode.Walking:
                // Apply change to velocity. Will impact the position at the next tick.
                this._velocity.addScaledVector(direction, rate);
                break;
            case EMovementMode.Custom: /* Let others deal with custom movement. */ break;
        }
    }

    /** Clear velocity but still allow movement input. */
    public stopMovementImmediately(): void {
        this._velocity.set(0, 0, 0);
    }

    /**
     * Sets the movement mode.
     * @param newMode New mode to use. If EMovementMode.None, input is
     * ignored but current velocity will be maintained.
     */
    public setMovementMode(newMode: EMovementMode): void {
        this.movementMode = newMode;
    }

    public tickComponent(deltaTime: number): void {
        if (this.targetActor === null
            || (this.movementMode != EMovementMode.Walking
                && this.movementMode != EMovementMode.Swimming)) {
            // Only walking and swimming are allowed.
            return;
        }

        // Apply change to position.
        let pos = new Loc(this.targetActor.location);
        pos.addScaledVector(this.velocity, deltaTime);
        this.targetActor.location = pos;

        // Change velocity based on acceleration factors.
        if (this.isFalling) {
            // Go downwards in velocity due to gravity.
            this._velocity.y += -9.8 * this.gravityScale * deltaTime;
        } else {
            // Reduce movement due to friction.
            let friction = 1.0;
            switch (this.movementMode) {
                case EMovementMode.Walking: friction = this.walkingFriction; break;
                case EMovementMode.Swimming: friction = this.swimmingFriction; break;
            }
            // If friction coefficient is 1, it means FULL friction (no sliding).
            // At 0 it means 0 friction (perfect ice sliding).
            // TODO: Consider surface angle and gravity scale when applying friction.
            let deceleration = this.velocity.clone();
            deceleration.multiplyScalar(friction);
            this.velocity.addScaledVector(deceleration, -1 * deltaTime);
        }

        // Clamp velocity to zero if near.
        if (this.velocity.length() < this.zeroVelocityThreshold) {
            this.velocity.set(0, 0, 0);
        }

        // TODO: test collision.
    }
}

/**
 * Puppeteer of a pawn in the game. Shouldn't be used directly.
 * 
 * @see PlayerController @see AIController
 */
class Controller extends Actor {
    /** Pawn that is currently being possessed. */
    public possessedPawn: Pawn = null;

    constructor() {
        super();
        // Disable ticking for fun.
        this.primaryActorTick.canEverTick = false;
    }

    /**
     * Attempt to take possession of a pawn.
     * 
     * @param pawn The pawn to take possession of.
     * @returns Whether the pawn was successfully possessed.
     */
    public possess(pawn: Pawn): boolean {
        // Attempt to possess the new pawn. If not, we shouldn't try to
        // to un-possess the current pawn!
        if (pawn.canBePossessed(this)) {
            // Try to un-possess the current pawn.
            this.unPossess();
            if (this.possessedPawn !== null) {
                // Couldn't un-possess the current pawn.
                return false;
            }

            // Notify pawn of its possession.
            this.possessedPawn = pawn;
            pawn.onPossessed(this);
        }

        // Pawn doesn't want to be possessed.
        return false;
    }

    /**
     * Release possession of the current pawn, if any.
     * 
     * @returns Whether a pawn was un-possessed by this function. If no
     * pawn was previously possessed, "false" is returned.
     */
    public unPossess(): boolean {
        if (this.possessedPawn !== null) {
            // Clear reference and officially stop possession.
            this.possessedPawn.onUnPossessed(this);
            this.possessedPawn = null;
            return true;
        }
        // No pawn was previously possessed.
        return false;
    }
}

/**
 * Represents a human player in the game.
 */
export class PlayerController extends Controller {

}

/**
 * Base class for humanoid characters.
 */
class Character extends Pawn {
    /** Movement component for this player */
    private characterMovement: CharacterMovementComponent;

    /** Returns character movement component. */
    public getCharacterMovement() { return this.characterMovement; }

    public constructor() {
        super();

        // Create components.
        this.characterMovement = GameplayUtilities.createEngineObject(CharacterMovementComponent);
        this.characterMovement.targetActor = this;
    }

    public tick(deltaTime: number): void {
        super.tick(deltaTime);
        // Tick the movement component to apply movement.
        this.characterMovement.tickComponent(deltaTime);
    }

    /**
     * Add movement to the character.
     * 
     * @param direction Direction to move in.
     * @param rate Multiplier for movement. Typically this is joystick pitch.
     */
    public addMovementInput(direction: Loc, rate: number = 1.0): void {
        if (this.characterMovement !== null) {
            this.characterMovement.addMovementInput(direction, rate);
        }
    }
}

/**
 * Pawn class for the player in the hub world between missions.
 */
export class PlayerAsCharacterPawn extends Character {
}
