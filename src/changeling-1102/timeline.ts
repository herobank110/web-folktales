var THREE = window["THREE"];

/** Animatedly properties for an actor. */
export interface ActorKeyframe {
    /** Key in actorMap to apply values to. */
    readonly actorID: string;
    /** Location in world space. */
    readonly loc?: THREE.Vector3;
    /** Rotation in radians. */
    readonly rot?: THREE.Euler;
    /** Whether the object should be visible. */
    readonly visible?: boolean;
}

/** Point on a timeline containing actor states. */
export interface TimelinePoint {
    /** Actor states to update at this point. */
    keys: Array<ActorKeyframe>;
}

/** Timeline for controlling actors. */
export class Timeline {
    /** Points in the timeline. */
    public points: Array<TimelinePoint> = [];

    /** Set of actors which `points` refer to by ID. */
    public actorMap = new Map<string, THREE.Object3D>();

    /** Called when the timeline is finished. */
    public onFinished: () => void;

    /** Current point in the timeline. */
    private timelineIndex: number = -1;

    /*
     * Proceed to the next point.
     * 
     * If finished, onFinished will be called.
     */
    public nextPoint() {
        this.timelineIndex++;
        if (this.timelineIndex < this.points.length) {
            // valid point
            const tp = this.points[this.timelineIndex];
            tp.keys.forEach((keyframe) => {
                const actor = this.actorMap.get(keyframe.actorID);
                if (actor !== undefined) {
                    if (keyframe.loc !== undefined) { actor.position.copy(keyframe.loc); }
                    if (keyframe.rot !== undefined) { actor.rotation.copy(keyframe.rot); }
                    if (keyframe.visible !== undefined) { actor.visible = keyframe.visible; }
                }
            });
        } else {
            // game over
            // Counteract the increment above.
            this.timelineIndex--;
            if (this.onFinished !== undefined) { this.onFinished(); }
        }
    }
}