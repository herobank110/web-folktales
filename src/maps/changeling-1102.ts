import { SoundMixer2D } from "../changeling-1102/audioPlayer.js";
import { ScreenCover } from "../changeling-1102/screenFade.js";
import { TitleCard } from "../changeling-1102/titleCard.js";
import { FolkWorldBase, makeTick } from "../core/world.js";
import { FBXLoader } from "/folktales/include/three/examples/jsm/loaders/FBXLoader.js";
import { Timeline, TimelinePoint } from "../changeling-1102/timeline.js";
import { GameplayStatics, EInputEvent } from "/folktales/include/factorygame/factorygame.js";
var THREE = window["THREE"];

/**
 * The world for shot by shot rendition of The Changeling.
 */
export class ChangelingWorld extends FolkWorldBase {
    /** Manages audio and dialogue playback, with subtitles. */
    audioMixer: SoundMixer2D;

    /** Time in seconds to fade up the screen at the start. */
    fadeUpDuration: number = 2;

    /** Whether to prevent the title card and splash screen. */
    readonly noLogo: boolean = true;

    /** Timeline for shots in the world. */
    private timeline: Timeline;

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
            const screenCover = this.spawnActor(ScreenCover, [0, 0]);
            // Start the fade up after a second of black.
            screenCover.setColor("#000000");
            screenCover.setOpacity(1);
            setTimeout(() => {
                screenCover.startAccumulatedFade("#000000", 1.0, "#000000", 0.0, this.fadeUpDuration);
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

        // Go to the initial position.
        this.timeline.nextPoint();

        // Bind clicks to maneuver the timeline.
        const onNextShot = () => { this.timeline.nextPoint(); };
        GameplayStatics.gameEngine.inputMappings.bindAction(
            "NextShot",
            EInputEvent.PRESSED,
            () => { onNextShot(); });

        // Also add touch support.
        document.body.addEventListener("touchend", () => { onNextShot(); });
    }

    /**
     * Add shots to the timeline object.
     * 
     * Must be valid.
     */
    private createShots() {
        // Add the camera made by the FolkWorldBase.
        this.timeline.actorMap.set("camera", this.camera);

        // TODO: Add other dynamic meshes also.

        // Add shots.
        this.timeline.points = [
            // initial position: shots A and B
            { keys: [{
                actorID: "camera",
                loc: new THREE.Vector3(0, 100, -150),
                rot: new THREE.Euler(0, Math.PI, 0)
            },
            // hide all the elf poses at the start
            // { actorID: "elf1_pose_a", visible: false },
            // { actorID: "elf2_pose_a", visible: false },
            // { actorID: "elf3_pose_a", visible: false },
            // { actorID: "elf1_pose_neutral", visible: false },
            // { actorID: "elf2_pose_neutral", visible: false },
            // { actorID: "elf3_pose_neutral", visible: false },
            { actorID: "elf1_pose_neutral", loc: new THREE.Vector3(0,0,0) },
            { actorID: "elf2_pose_neutral", loc: new THREE.Vector3(49,0,0) },
            { actorID: "elf3_pose_neutral", loc: new THREE.Vector3(90,0,0) },
            ]},

            // Shot 1 - 1
            // TODO: This shot has wrong location
            { keys: [{
                actorID: "camera",
                loc: new THREE.Vector3(61, 130, 630),
                rot: new THREE.Euler(-0.1, 6.8, 0.05)
            }]},
            // Shot 1 - 2
            { keys: [{
                actorID: "camera",
                loc: new THREE.Vector3(18, 95, 168),
                rot: new THREE.Euler(-0.2, 6.5, 0)
            }]},
            // Shot 1 - 3
            { keys: [{
                actorID: "camera",
                loc: new THREE.Vector3(-15, 48, 28),
                rot: new THREE.Euler(0, -1.3, 0)
            }]},
        ];

        if (this.noLogo) {
            // this actually means "editor mode".
            // create the camera positioner widgets.
            const set = () => {
                this.camera.position.set($("#lx").val() as number,$("#ly").val() as number,$("#lz").val() as number);
                this.camera.rotation.set($("#rx").val() as number,$("#ry").val() as number,$("#rz").val() as number);
            };
            $(document.body).append($(`<div class="fixed-top">`)
            .append(
                $(`<input id="lx" type="number">`).change(set),
                $(`<input id="ly" type="number">`).change(set),
                $(`<input id="lz" type="number">`).change(set),
                $(`<input id="rx" type="number">`).change(set),
                $(`<input id="ry" type="number">`).change(set),
                $(`<input id="rz" type="number">`).change(set)
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

        const onModelLoaded = (object) => {
            this.scene.add(object);
        };

        const onDynamicModelLoaded = (objectID: string, ...cloneIds: string[]) => {
            return (object: THREE.Object3D) => {
                // Add to the dynamic actors list.
                if (this.timeline === undefined){
                    throw new Error("timeline not defined before loading objects");
                }
                // TODO: Not sure if this will be the same lambda object for all calls.
                this.timeline.actorMap[objectID] = object;

                // Add to scene as per usual.
                onModelLoaded(object);

                // Assign clone IDs clones of the object.
                cloneIds.forEach((cloneId) => {
                    // Recursive clone - is this necessary?
                    // at least it's not downloading the mesh
                    const cloneObject = object.clone(true);
                    this.timeline.actorMap[cloneId] = cloneObject;
                });
            };
        };

        // The static environment inside. It doesn't get animated at any
        // point and requires only one mesh. Consider using glTF for faster
        // loading.
        fbxLoader.load("./content/sm_hovel_interior_static.fbx", onModelLoaded);

        // Load dynamic actors and add to the dynamic actors list.
        fbxLoader.load("./content/sm_cradle.fbx", onDynamicModelLoaded("cradle"));

        fbxLoader.load("./content/sm_elf_pose_a.fbx",
            onDynamicModelLoaded("elf1_pose_a", "elf2_pose_a", "elf3_pose_a"));
        fbxLoader.load("./content/sm_elf_pose_neutral.fbx",
            onDynamicModelLoaded("elf1_pose_neutral", "elf2_pose_neutral", "elf3_pose_neutral"));

        // Load audio for later usage.
        // const audioLoader = new THREE.AudioLoader();
        // audioLoader.load("./content/s_coralie_clement_short.mp3", (buffer) => {
        //     // Save a reference to the buffer when loaded.
        //     this.testingAudioCue = buffer;
        // });
    }

    /**
     * Called when the user clicks past the end of the timeline.
     */
    public onTimelineFinished() {
        throw new Error("timeline finished not implemented")
    }
}
