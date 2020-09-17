import { DialogueCue, SoundMixer2D } from "../changeling-1102/audioPlayer.js";
import { ScreenCover } from "../changeling-1102/screenFade.js";
import { TitleCard } from "../changeling-1102/titleCard.js";
import { FolkWorldBase, makeTick } from "../core/world.js";
import { FBXLoader } from "/folktales/include/three/examples/jsm/loaders/FBXLoader.js";
import { Timeline } from "../changeling-1102/timeline.js";
import { GameplayStatics, EInputEvent } from "/folktales/include/factorygame/factorygame.js";
var THREE = window["THREE"];

/**
 * The world for shot by shot rendition of The Two Hunchbacks.
 */
export class TwoHunchbacksWorld extends FolkWorldBase {
    /** Manages audio and dialogue playback, with subtitles. */
    audioMixer: SoundMixer2D;

    /** Time in seconds to fade up the screen at the start. */
    fadeUpDuration: number = 2;

    /** Whether to prevent the title card and splash screen. */
    readonly noLogo: boolean = true;

    /** Timeline for shots in the world. */
    private timeline: Timeline;

    /** Cover for the screen fades and dips. */
    private screenCover: ScreenCover;

    public beginPlay() {
        super.beginPlay();

        // Load all content (latent action!)
        this.downloadContent();

        // Create the scene lights.
        const dirLight = new THREE.DirectionalLight();
        dirLight.rotation.x = Math.PI / 2;
        this.scene.add(dirLight);

        const envLight = new THREE.AmbientLight(0xcccccc);
        this.scene.add(envLight);

        if (!this.noLogo) {
            // Create the screen cover and make it black initially.
            this.screenCover = this.spawnActor(ScreenCover, [0, 0]);
            // Start the fade up after a second of black.
            this.screenCover.setColor("#000000");
            this.screenCover.setOpacity(1);
            setTimeout(() => {
                this.screenCover.startAccumulatedFade("#000000", 1.0, "#000000", 0.0, this.fadeUpDuration);
            }, 1000);

            // Test the title card system. (after the fade in)
            setTimeout(() => {
                const titleCard = new TitleCard("./content/t_changeling1102_titleCard.png");
                titleCard.animate();
            }, this.fadeUpDuration * 1000 + 2000);
        }

        // Create the audio mixer in the world (2D non-spatial audio only.)
        this.audioMixer = this.spawnActor(SoundMixer2D, [0, 0]);

        // Create the timeline and add story points in shots.
        this.timeline = new Timeline();
        this.createShots();
        this.timeline.onFinished = this.onTimelineFinished;

        // Bind clicks to maneuver the timeline.
        let isFirstClick = true;
        const onNextShot = () => {
            this.timeline.nextPoint();
            if (isFirstClick) {
                // Perform dip to white on first click.
                isFirstClick = false;
                if (!this.noLogo) {
                    this.screenCover.dipToWhite(1000);
                }
            }
        };
        GameplayStatics.gameEngine.inputMappings.bindAction(
            "NextShot",
            EInputEvent.PRESSED,
            () => { onNextShot(); });

        // Also add touch support.
        document.body.addEventListener("touchend", () => { onNextShot(); });

        // Go to the initial position.
        // TODO: make this a start button
        setTimeout(() => { this.timeline.nextPoint(); }, 500);
    }

    /**
     * Add shots to the timeline object.
     * 
     * Must be valid.
     */
    private createShots() {
        // Add the camera made by the FolkWorldBase.
        this.timeline.actorMap.set("camera", this.camera);

        // Add shots.
        const vec = THREE.Vector3;
        const rot = THREE.Euler;
        const hide = (actorID: string) => ({ actorID, visible: false });
        const show = (actorID: string) => ({ actorID, visible: true });
        this.timeline.points = [
            // initial position: shots A and B
            {
                keys: [
                    { actorID: "camera", loc: new vec(0, 100, -150), rot: new rot(0, Math.PI) },
                    { actorID: "cradle", loc: new vec(43, 0, 83), rot: new rot(0, -1) },
                    { actorID: "baby", loc: new vec(22, 13, 86), rot: new rot(-1.2, 0.01, -1.4) },
                    // hide the actors that come in later
                    hide("elf1_pose_a"),
                    hide("elf2_pose_a"),
                    hide("elf3_pose_a"),
                    hide("elf1_pose_neutral"),
                    hide("elf2_pose_neutral"),
                    hide("elf3_pose_neutral"),
                    hide("mother_pose_neutral"),
                    hide("neighbor_pose_neutral"),
                    hide("mother_pose_kneel"),
                    hide("elf_hand"),
                    hide("changeling"),
                    hide("egg_whole"),
                    hide("egg_shell1"),
                    hide("egg_shell2"),
                ]
            },
            // Shot 1 - 1 - LS establish mise en scene
            {
                keys: [{
                    actorID: "camera",
                    loc: new vec(61, 130, 230),
                    rot: new rot(-0.1, 6.8, 0.05)
                },
                { actorID: "elf1_pose_neutral", loc: new vec() },
                { actorID: "elf2_pose_neutral", loc: new vec(49) },
                { actorID: "elf3_pose_neutral", loc: new vec(-49) },]
            },
            // Shot 1 - 2
            {
                keys: [{
                    actorID: "camera",
                    loc: new vec(18, 95, 168),
                    rot: new rot(-0.2, 6.5)
                }]
            },
            // Shot 1 - 3 - MCU HA looking at baby over crib
            {
                keys: [
                    {
                        actorID: "camera",
                        loc: new vec(43, 41, 113),
                        rot: new rot(-0.6)
                    },
                    {
                        actorID: "elf_hand",
                        loc: new vec(26, 31, 71),
                        rot: new rot(0, -0.6, 0.5),
                        visible: true
                    }
                ]
            },
            // Shot 2 - 1 - LS top down of baby
            // {
            //     keys: [
            //         {
            //             actorID: "camera",
            //             loc: new vec(47, 145, 79),
            //             rot: new rot(-1.6)
            //         },
            //         {
            //             actorID: "elf1_pose_neutral",
            //             loc: new vec(13, 0, 52),
            //             rot: new rot(0, 0.6),
            //             visible: true
            //         },
            //         {
            //             actorID: "elf2_pose_a",
            //             loc: new vec(-5, 0, 44),
            //             rot: new rot(0, 1.2),
            //             visible: true
            //         },
            //         {
            //             actorID: "elf3_pose_neutral",
            //             loc: new vec(-23, 0, 51),
            //             rot: new rot(0, 2.4),
            //             visible: true
            //         },
            //         hide("elf_hand"),
            //     ]
            // },
            // Shot 2 - 2 - MS elves climbing into cot
            {
                keys: [
                    {
                        actorID: "camera",
                        loc: new vec(21, 55, 96),
                        rot: new rot(-1)
                    },
                    {
                        actorID: "elf1_pose_neutral",
                        loc: new vec(16.4, 19, 56),
                        rot: new rot(0.7, 0.5)
                    },
                    {
                        actorID: "elf2_pose_a",
                        loc: new vec(7, -6, 67),
                        rot: new rot(0, 1.2)
                    },
                    {
                        actorID: "elf3_pose_neutral",
                        loc: new vec(19, -3, 44),
                        rot: new rot(0.7, 0.3)
                    },
                    hide("elf_hand")
                ]
            },
            // Shot 3 - 1 - LS pull out changeling in crib
            {
                keys: [
                    {
                        actorID: "camera",
                        loc: new vec(36, 64, 113),
                        rot: new rot(-0.9)
                    },
                    {
                        actorID: "changeling",
                        loc: new vec(26, 9, 105),
                        rot: new rot(-1.4, 0, -0.8),
                        visible: true
                    },
                    {
                        actorID: "elf_hand",
                        loc: new vec(30, 32, 66),
                        rot: new rot(0, -1.8, 0.8),
                        visible: true
                    },
                    {
                        actorID: "elf2_pose_a",
                        loc: new vec(25, 32, 70),
                        rot: new rot(1.5, -0.2, -0.6)
                    }
                ]
            },
            // Shot 4 - 1 - LS low angle of mother enter room
            {
                keys: [
                    {
                        actorID: "camera",
                        loc: new vec(36, 30, 112),
                        rot: new rot(0.2)
                    },
                    {
                        actorID: "mother_pose_neutral",
                        loc: new vec(-7, 0, -182),
                        rot: new rot(0, 0.2),
                        visible: true
                    },
                    hide("elf1_pose_neutral"),
                    hide("elf2_pose_a"),
                    hide("elf3_pose_neutral"),
                    hide("elf_hand")
                ]
            },
            // Shot 5 - 1 - MS neighbor answering door
            {
                keys: [
                    {
                        actorID: "camera",
                        loc: new vec(-1, 131, -157),
                        rot: new rot(0, -0.5)
                    },
                    {
                        actorID: "mother_pose_neutral",
                        loc: new vec(47, 0, -244),
                        rot: new rot(0, -0.2)
                    },
                    {
                        actorID: "neighbor_pose_neutral",
                        loc: new vec(62, 0, -205),
                        rot: new rot(0, 3),
                        visible: true
                    },
                ]
            },
            // Shot 6 - OS neighbor giving instructions
            {
                keys: [
                    {
                        actorID: "camera",
                        loc: new vec(36, 137, -178),
                        rot: new rot(0, 0.1)
                    }
                ]
            },
            // Shot 7 - Wide fireplace with items
            {
                keys: [
                    {
                        actorID: "camera",
                        loc: new vec(90, 81, -64),
                        rot: new rot(0, 2)
                    },
                    {
                        actorID: "egg_whole",
                        loc: new vec(82, 79.2, -48),
                        visible: true
                    },
                ]
            },
            // Shot 8 - OS neighbor looking at mother
            {
                keys: [
                    {
                        actorID: "camera",
                        loc: new vec(99, 139, -178),
                        rot: new rot(0, 0.1)
                    },
                    {
                        actorID: "mother_pose_neutral",
                        loc: new vec(56, 0, -244),
                        rot: new rot(0, 0.4)
                    },
                    {
                        actorID: "neighbor_pose_neutral",
                        loc: new vec(62, 0, -203),
                        rot: new rot(0, 3.3)
                    }
                ]
            },
            // Shot 9 - Establishing Ex wide of hovel
            {
                keys: [
                    {
                        actorID: "camera",
                        loc: new vec(5, 48, -1),
                        rot: new rot(0, 1.7)
                    },
                    {
                        // TODO export correct poses from maya to avoid lowering mother
                        actorID: "mother_pose_kneel",
                        loc: new vec(-35, -85, 36),
                        rot: new rot(0, -1.6)
                    },
                    hide("neighbor_pose_neutral"),
                    hide("mother_pose_neutral"),
                ]
            },
            // Shot 10 (SKIP)
            // Shot 11 (SKIP)
            // Shot 12 - CU changeling in front of mother looking at fire
            // TODO: find shot positions
            {
                keys: [
                    {
                        actorID: "camera",
                        loc: new vec(),
                        rot: new rot()
                    },
                    {
                        actorID: "mother_pose_kneel",
                        loc: new vec(),
                        rot: new rot()
                    },
                    {
                        actorID: "changeling",
                        loc: new vec(),
                        rot: new rot()
                    }
                ]
            }
        ];

        if (this.noLogo) {
            // this actually means "editor mode".
            // create the camera positioner widgets.
            // Save values in inputs into current values.
            const save = () => {
                const obj = this.timeline.actorMap.get($("#tt").val());
                obj.position.set($("#lx").val() as number, $("#ly").val() as number, $("#lz").val() as number);
                obj.rotation.set($("#rx").val() as number, $("#ry").val() as number, $("#rz").val() as number);
                obj.visible = $("#vz").prop("checked");
            };
            // Load current values into inputs.
            const load = () => {
                const obj = this.timeline.actorMap.get($("#tt").val());
                if (obj) {
                    $("#lx").val(obj.position.x || "");
                    $("#ly").val(obj.position.y || "");
                    $("#lz").val(obj.position.z || "");
                    $("#rx").val(obj.rotation.x || "");
                    $("#ry").val(obj.rotation.y || "");
                    $("#rz").val(obj.rotation.z || "");
                    $("#vz").prop("checked", obj.visible);
                }
            }
            $(document.body).append($(`<div class="fixed-top">`)
                .append(
                    $(`<input id="tt">`).change(load).val("camera"),
                    $(`<input id="lx" type="number">`).change(save),
                    $(`<input id="ly" type="number">`).change(save),
                    $(`<input id="lz" type="number">`).change(save),
                    $(`<input id="rx" type="number">`).change(save),
                    $(`<input id="ry" type="number">`).change(save),
                    $(`<input id="rz" type="number">`).change(save),
                    $(`<input id="vz" type="checkbox">`).change(save)
                ));
        }
    }


    /**
     * Downloads and places content in the scene.
     * 
     * This will only ever be called once, on begin play.
     * TODO: Add progress bar when each thing is loaded.
     */
    private downloadContent() {
        const fbxLoader = new FBXLoader();

        const sm = (objectID: string, ...cloneIDs: string[]) => {
            return (object: THREE.Object3D, objectID_ = objectID, cloneIds_ = cloneIDs) => {
                // Add to the dynamic actors list.
                if (this.timeline === undefined) {
                    throw new Error("timeline not defined before loading objects");
                }
                // TODO: Not sure if this will be the same lambda object for all calls.
                this.timeline.actorMap.set(objectID_, object);

                // Add to scene as per usual.
                this.scene.add(object);

                // Assign clone IDs clones of the object.
                cloneIds_.forEach((cloneId) => {
                    // Recursive clone - is this necessary?
                    // at least it's not downloading the mesh
                    const cloneObject = object.clone(true);
                    this.timeline.actorMap.set(cloneId, cloneObject);

                    // Ensure the object is in the scene!
                    this.scene.add(cloneObject);
                });
            };
        };

        const s = (objectID: string, ...clonesIDs: string[]) => {
            return (audio: AudioBuffer, objectID_ = objectID, clonesID_ = clonesIDs) => {
                this.timeline.audioCues.set(objectID_, audio);
                clonesID_.forEach((cloneID) => {
                    this.timeline.audioCues.set(cloneID, audio);
                });
            };
        }

        const d = (metadata: DialogueCue, objectID: string, ...clonesIDs: string[]) => {
            return (audio: AudioBuffer, objectID_ = objectID, metadata_ = metadata, clonesID_ = clonesIDs) => {
                metadata_.audioCue = audio;
                this.timeline.dialogueCues.set(objectID_, metadata);
                clonesID_.forEach((cloneID) => {
                    this.timeline.dialogueCues.set(cloneID, metadata);
                });
            };
        }

        fbxLoader.load("./content/sm_blockTree.fbx", sm("tree"));
        fbxLoader.load("./content/sm_elf_pose_neutral.fbx", sm("elf1_pose_neutral", "elf2_pose_neutral", "elf3_pose_neutral"));
        fbxLoader.load("./content/sm_hovel_interior_static.fbx", sm("hovel"));
        fbxLoader.load("./content/sm_maleHunchback_pose_neutral.fbx", sm("hunchback1_pose_neutral", "hunchback2_pose_neutral"));

        // Load audio for later usage.
        // const audioLoader = new THREE.AudioLoader();
    }

    /**
     * Called when the user clicks past the end of the timeline.
     */
    public onTimelineFinished() {
        throw new Error("timeline finished not implemented")
    }
}
