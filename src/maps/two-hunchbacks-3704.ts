import { DialogueCue, SoundMixer2D } from "../changeling-1102/audioPlayer.js";
import { ScreenCover } from "../changeling-1102/screenFade.js";
import { TitleCard } from "../changeling-1102/titleCard.js";
import { FolkWorldBase, makeTick } from "../core/world.js";
import { FBXLoader } from "/folktales/include/three/examples/jsm/loaders/FBXLoader.js";
import { Timeline } from "../changeling-1102/timeline.js";
import { GameplayStatics, EInputEvent } from "/folktales/include/factorygame/factorygame.js";
import { getTimelineShots } from "../timelines/two-hunchbacks-3704.js";
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
        this.timeline.points = getTimelineShots(this);

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
        const textureLoader = new THREE.TextureLoader();

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

        // Creates an image plane with a texture.
        const t = (metadata: { w: number, h: number }, objectID: string, ...clonesIDs: string[]) => {
            return (texture: THREE.Texture, metadata_ = metadata, objectID_ = objectID, clonesIDs_ = clonesIDs) => {
                // Create an image plane with the forest texture.
                const geometry = new THREE.PlaneGeometry(metadata_.w, metadata_.h);
                const material = new THREE.MeshPhongMaterial({ map: texture });
                const plane = new THREE.Mesh(geometry, material);
                sm(objectID_, ...clonesIDs_)(plane);
            }
        };

        fbxLoader.load(
            "./content/sm_blockTree.fbx",
            sm("tree"));
        fbxLoader.load(
            "./content/sm_elf_pose_neutral.fbx",
            sm("elf1_pose_neutral", "elf2_pose_neutral", "elf3_pose_neutral"));
        fbxLoader.load(
            "./content/sm_hovel_interior_static.fbx",
            sm("hovel"));
        fbxLoader.load(
            "./content/sm_maleHunchback_pose_neutral.fbx",
            sm("hunchback1_pose_neutral", "hunchback2_pose_neutral"));
        textureLoader.load(
            "./content/t_forestBlur.jpg",
            t({ w: 200, h: 300 }, "backdrop_forest", "backdrop_forest2", "backdrop_forest3", "backdrop_forest4"));
        textureLoader.load(
            "./content/t_forestGround.jpg",
            t({ w: 1000, h: 1000 }, "backdrop_ground"));

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
