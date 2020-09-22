import { TwoHunchbacksWorld } from "../maps/two-hunchbacks-3704.js";
import { TimelinePoint } from "../changeling-1102/timeline.js";
import { TitleCard } from "../changeling-1102/titleCard.js";
var THREE = window["THREE"];

// Helpers
const loc = THREE.Vector3;
const rot = THREE.Euler;
const hide = (actorID: string) => ({ actorID, visible: false });
const show = (actorID: string) => ({ actorID, visible: true });

const dialogue = (world: TwoHunchbacksWorld, dID: string, autoHide: boolean = true) => ({
    onVisit: (w_ = world, d_ = dID, a_ = autoHide) => 
        w_.audioMixer.playDialogue(w_.getTimeline().dialogueCues.get(d_), a_)
});

export const getTimelineShots = (world: TwoHunchbacksWorld): TimelinePoint[] => [
    // initial position: shots A and B
    {
        keys: [
            dialogue(world, "info_headphones", true),
            {
                actorID: "camera",
                loc: new loc(0, 100, 200),
                onVisit: () => {
                    // This must be reached by user interaction to play.
                    const cue2 = world.getTimeline().audioCues.get("ambient_forest");
                    const player = world.audioMixer.playAudio(cue2, 5.5);
                    player.setLoop(true);
                    world.ambientSound = player;
                }
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
            hide("maleTwoHumps_pose_walk"),
            hide("tree"),
        ]
    },
    // Shot 1 - LS of 2 brothers sat inside eating
    {
        keys: [
            dialogue(world, "dlg_shot1", false),
            {
                actorID: "camera",
                loc: new loc(34, 123, 166),
                onVisit: () => {
                    const cue2 = world.getTimeline().audioCues.get("bgm_primary");
                    const player = world.audioMixer.playAudio(cue2, 0.2);
                    player.setLoop(true);
                    world.backgroundMusic = player;
                }
            },
            {
                actorID: "hunchback1_pose_neutral",
                loc: new loc(42),
                rot: new rot(0, -1),
                visible: true
            },
            {
                actorID: "hunchback2_pose_neutral",
                loc: new loc(-30, 0, 12),
                rot: new rot(0, 1.2),
                visible: true
            },
        ]
    },
    // Shot 2 - WA establishing shot of him walking in woods center frame, near a tall tree right frame
    {
        keys: [
            dialogue(world, "dlg_shot2", false),
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
            dialogue(world, "dlg_shot3", false),
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
                rot: new rot(-Math.PI / 2),
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
    // Shot 4 - HA closer LS as the women look up the tree
    {
        keys: [
            dialogue(world, "dlg_shot4", false),
            {
                actorID: "camera",
                loc: new loc(59, 83, -326),
                rot: new rot(-0.9)
            },
            // TODO Add look up poses for old women
        ]
    },
    // Shot 5 - MS of him scared, tree branches behind
    {
        keys: [
            dialogue(world, "dlg_shot5", false),
            {
                actorID: "camera",
                loc: new loc(88, 183, -290),
                rot: new rot()
            },
            {
                // TODO Replace with tree hug pose
                actorID: "hunchback1_pose_neutral",
                loc: new loc(67, 59, -335),
                rot: new rot(-0.2, 2)
            },
        ]
    },
    // Shot 6 - LS of him sat on rock with little old women standing on shoulders and rock, sawing
    {
        keys: [
            dialogue(world, "dlg_shot6", false),
            {
                actorID: "camera",
                loc: new loc(-61, 55, -254),
                rot: new rot(0, -0.3)
            },
            {
                // TODO Replace with sat at rock pose (or sat on ground)
                actorID: "hunchback1_pose_neutral",
                loc: new loc(-136, -18, -398),
                rot: new rot(1.2, 0.2, -1)
            },
            {
                actorID: "elf1_pose_neutral",
                loc: new loc(-33, 21, -347),
                rot: new rot(0.3, -0.3)
            },
            {
                actorID: "elf2_pose_neutral",
                loc: new loc(-26, 29, -320),
                rot: new rot(0, 3)
            },
            {
                actorID: "elf3_pose_neutral",
                loc: new loc(0, 0, -331),
                rot: new rot(0, 5)
            },
        ]
    },
    // Shot 7 - reverse #1 LS of returned brother energetic stretch in front of doorway, other brother sat at table
    {
        keys: [
            dialogue(world, "dlg_shot7", false),
            {
                actorID: "camera",
                loc: new loc(98, 140, 50),
                rot: new rot(0, 1.2)
            },
            {
                actorID: "hunchback1_pose_neutral",
                loc: new loc(42, 0, -26),
                rot: new rot(0, -1)
            },
            {
                actorID: "hunchback2_pose_neutral",
                loc: new loc(-25, 0, 12),
                rot: new rot(0, 1.2)
            },
            hide("elf1_pose_neutral"),
            hide("elf2_pose_neutral"),
            hide("elf3_pose_neutral"),
        ]
    },
    // Shot 8 - LS man atop tree, pleased, shouting
    {
        keys: [
            dialogue(world, "dlg_shot8", false),
            {
                actorID: "camera",
                loc: new loc(88, 204, -290),
                rot: new rot(-0.2)
            },
            {
                // TODO Replace with wave down
                actorID: "hunchback2_pose_neutral",
                loc: new loc(92, 54, -384),
                rot: new rot(-0.3, 0.9, 0.4)
            },
        ]
    },
    // Shot 9 - MS LA of little old woman on the ground looking up tree at man holding tree
    {
        keys: [
            dialogue(world, "dlg_shot9", false),
            {
                actorID: "camera",
                loc: new loc(24, 15, -290),
                rot: new rot(0.7)
            },
            {
                // TODO: Replace with tree hug pose
                actorID: "hunchback2_pose_neutral",
                loc: new loc(92, 155, -384),
                rot: new rot(-0.3, 0.9, 0.4)
            },
            {
                actorID: "elf1_pose_neutral",
                loc: new loc(23, 0, -347),
                rot: new rot(0, 1),
                visible: true
            },
            {
                actorID: "elf2_pose_neutral",
                loc: new loc(30, 0, -320),
                rot: new rot(0, 2.2),
                visible: true
            },
            {
                actorID: "elf3_pose_neutral",
                loc: new loc(12, 0, -333),
                rot: new rot(0, 2),
                visible: true
            },
        ]
    },
    // Shot 10 - MS profile hunchback with back and chest humps, walking home
    {
        keys: [
            dialogue(world, "dlg_shot10", false),
            {
                actorID: "camera",
                loc: new loc(62, 128, -245),
                rot: new rot(0, 0.2)
            },
            {
                actorID: "maleTwoHumps_pose_walk",
                loc: new loc(57, 0, -328),
                rot: new rot(0, -1.5),
                visible: true
            },
            hide("hunchback2_pose_neutral")
        ]
    },
];
