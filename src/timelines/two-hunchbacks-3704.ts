import { TwoHunchbacksWorld } from "../maps/two-hunchbacks-3704";
import { TimelinePoint } from "../changeling-1102/timeline";
var THREE = window["THREE"];

// Helpers
const loc = THREE.Vector3;
const rot = THREE.Euler;
const hide = (actorID: string) => ({ actorID, visible: false });
const show = (actorID: string) => ({ actorID, visible: true });

export const getTimelineShots = (world: TwoHunchbacksWorld): TimelinePoint[] => [
    // initial position: shots A and B
    {
        keys: [
            {
                actorID: "camera",
                loc: new loc(0, 100, 200),
                onVisit: () => { console.log("the first shot has begun!") }
            },
            {
                actorID: "backdrop_forest",
                loc: new loc(44, 99, -260)
            },
            // hide the actors that come in later
            hide("tree"),
            hide("elf1_pose_neutral"),
            hide("elf2_pose_neutral"),
            hide("elf3_pose_neutral"),
        ]
    },
    // Shot 1 - LS of 2 brothers sat inside eating
    {
        keys: [
            {
                actorID: "camera",
                loc: new loc(),
                rot: new rot()
            },
        ]
    }
];
