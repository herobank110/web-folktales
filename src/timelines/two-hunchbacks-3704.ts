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
            hide("backdrop_forest2"),
            hide("backdrop_forest3"),
            hide("backdrop_forest4"),
            hide("backdrop_ground"),
            hide("elf1_pose_neutral"),
            hide("elf2_pose_neutral"),
            hide("elf3_pose_neutral"),
            hide("hunchback1_pose_neutral"),
            hide("hunchback2_pose_neutral"),
            hide("tree"),
        ]
    },
    // Shot 1 - LS of 2 brothers sat inside eating
    {
        keys: [
            {
                actorID: "camera",
                loc: new loc(34, 123, 166),
            },
            {
                actorID: "hunchback1_pose_neutral",
                loc: new loc(42),
                rot: new rot(0, -1),
                visible: true
            },
            {
                actorID: "hunchback2_pose_neutral",
                loc: new loc(-25, 0, 12),
                rot: new rot(0, 1.2),
                visible: true
            },
        ]
    },
    // Shot 2 - WA establishing shot of him walking in woods center frame, near a tall tree right frame
    {
        keys: [
            {
                actorID: "camera",
                loc: new loc(34, 127, -239),
            },
            {
                actorID: "hunchback1_pose_neutral",
                loc: new loc(-24, 0, -347),
                rot: new rot(0, 2)
            },
            {
                actorID: "tree",
                loc: new loc(113, 0, -364),
                visible: true
            },
            {
                actorID: "backdrop_forest",
                loc: new loc(44, 129, -400),
            },
            {
                actorID: "backdrop_forest2",
                loc: new loc(-156, 129, -400),
                visible: true
            },
            {
                actorID: "backdrop_forest3",
                loc: new loc(244, 129, -400),
                visible: true
            },
        ]
    },
    // Shot 3 - HA LS of the little old women in ring formation around tree
    {
        keys: [
            {
                actorID: "camera",
                loc: new loc(54, 127, -336),
                rot: new rot(-1)
            },
            {
                actorID: "hunchback1_pose_neutral",
                loc: new loc(82, 91, -358),
                rot: new rot(0, 2)
            },
            {
                actorID: "backdrop_ground",
                loc: new loc(0, 0, 100),
                rot: new rot(-Math.PI/2),
                visible: true
            },
            {
                actorID: "elf1_pose_neutral",
                loc: new loc(54, 0, -379),
                rot: new rot(0, -0.3),
                visible: true
            },
            {
                actorID: "elf2_pose_neutral",
                loc: new loc(56, 0, -359),
                rot: new rot(0, 0.5),
                visible: true
            },
            {
                actorID: "elf3_pose_neutral",
                loc: new loc(67, 0, -343),
                rot: new rot(0, 0.9),
                visible: true
            },
        ]
    },
];
