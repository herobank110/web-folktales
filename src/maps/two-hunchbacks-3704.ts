import { DialogueCue, SoundMixer2D } from "../changeling-1102/audioPlayer.js";
import { ScreenCover } from "../changeling-1102/screenFade.js";
import { TitleCard } from "../changeling-1102/titleCard.js";
import { FolkWorldBase, makeTick } from "../core/world.js";
import { FBXLoader } from "/folktales/include/three/examples/jsm/loaders/FBXLoader.js";
import { Timeline } from "../changeling-1102/timeline.js";
import { GameplayStatics, EInputEvent, MathStat } from "/folktales/include/factorygame/factorygame.js";
import { getTimelineShots } from "../timelines/two-hunchbacks-3704.js";
import { visitFunctionBody } from "typescript";
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
    readonly noLogo: boolean = false;

    /** Timeline for shots in the world. */
    private timeline: Timeline;

    /** Cover for the screen fades and dips. */
    private screenCover: ScreenCover;

    private loadedAssetCount: number = 0;
    private readonly totalAssetCount: number = 24;
    private hasGameStarted: boolean = false;
    private isGameOver: boolean = false;

    public backgroundMusic: THREE.Audio;
    public ambientSound: THREE.Audio;
    private bgmLerpTime: number;

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

        // Create the screen cover and make it black initially.
        this.screenCover = this.spawnActor(ScreenCover, [0, 0]);

        // Create the audio mixer in the world (2D non-spatial audio only.)
        this.audioMixer = this.spawnActor(SoundMixer2D, [0, 0]);

        // Create the timeline and add story points in shots.
        this.timeline = new Timeline();
        this.createShots();
        this.timeline.onFinished = () => this.onTimelineFinished();

        // Bind clicks to maneuver the timeline.
        let isFirstClick = true;
        const onNextShot = () => {
            if (this.isFinishedLoading()) {
                if (isFirstClick && !this.noLogo) {
                    // Perform dip to white on first click.
                    isFirstClick = false;
                    this.beginGameForReal();
                } else {
                    this.timeline.nextPoint();
                }
            }
        };
        GameplayStatics.gameEngine.inputMappings.bindAction(
            "NextShot",
            EInputEvent.PRESSED,
            () => { onNextShot(); });
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
     */
    private downloadContent() {
        const sm = (objectID: string, ...cloneIDs: string[]) => {
            return (object: THREE.Object3D, objectID_ = objectID, cloneIds_ = cloneIDs) => {
                this.onAnyAssetLoaded();
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
                this.onAnyAssetLoaded();
                this.timeline.audioCues.set(objectID_, audio);
                clonesID_.forEach((cloneID) => {
                    this.timeline.audioCues.set(cloneID, audio);
                });
            };
        };

        const d = (metadata: { speechContent: string }, objectID: string, ...clonesIDs: string[]) => {
            return (audio: AudioBuffer, objectID_ = objectID, metadata_ = metadata, clonesID_ = clonesIDs) => {
                this.onAnyAssetLoaded();
                const cueData: DialogueCue = {
                    audioCue: audio,
                    speechContent: metadata_.speechContent
                };
                this.timeline.dialogueCues.set(objectID_, cueData);
                clonesID_.forEach((cloneID) => {
                    this.timeline.dialogueCues.set(cloneID, cueData);
                });
            };
        };

        // Creates an image plane with a texture.
        const t = (metadata: { w: number, h: number }, objectID: string, ...clonesIDs: string[]) => {
            return (texture: THREE.Texture, metadata_ = metadata, objectID_ = objectID, clonesIDs_ = clonesIDs) => {
                this.onAnyAssetLoaded();
                // Create an image plane with the forest texture.
                const geometry = new THREE.PlaneGeometry(metadata_.w, metadata_.h);
                const material = new THREE.MeshPhongMaterial({ map: texture });
                const plane = new THREE.Mesh(geometry, material);
                sm(objectID_, ...clonesIDs_)(plane);
            }
        };

        const cacheOnly = (loaded: any) => {
            this.onAnyAssetLoaded();
        }

        const fbxLoader = new FBXLoader();
        const textureLoader = new THREE.TextureLoader();
        const audioLoader = new THREE.AudioLoader();

        audioLoader.load(
            "./content/s_accordion_andrew_huang.mp3",
            s("bgm_primary"));
        audioLoader.load(
            "./content/s_ambient_forest.mp3",
            s("ambient_forest"));
        audioLoader.load(
            "./content/s_info_headphones.mp3",
            d({ speechContent: "Headphones for best experience" },
                "info_headphones"));
        audioLoader.load(
            "./content/s_silence.mp3",
            d({ speechContent: "There were two hunchbacks who were brothers. The younger hunchback said, “I’m going out and make a fortune.”" },
                "dlg_shot1"));
        audioLoader.load(
            "./content/s_silence.mp3",
            d({ speechContent: "He set out on foot. After walking for miles and miles he lost his way in the woods. “What will I do now? What if assassins appeared … I’d better climb this tree.”" },
                "dlg_shot2"));
        audioLoader.load(
            "./content/s_silence.mp3",
            d({ speechContent: "Once he was up the tree he heard a noise. “There they are, help!” Instead of assassins, out of a hole in the ground climbed a little old woman, then another and another, followed by a whole line of little old women, one right behind the other, who all danced around the tree singing: “Saturday and Sunday! Saturday and Sunday!” Round and round they went, singing over and over: “Saturday and Sunday!” From his perch in the treetop, the hunchback sang: “And Monday!”" },
                "dlg_shot3"));
        audioLoader.load(
            "./content/s_silence.mp3",
            d({ speechContent: "The little old women became dead silent, looked up, and one of them said, “Oh, the good soul has given us that lovely line! We never would have thought of it by ourselves!” Overjoyed, they resumed their dance around the tree, singing all the while: “Saturday, Sunday And Monday! Saturday, Sunday, And Monday!”" },
                "dlg_shot4"));
        audioLoader.load(
            "./content/s_silence.mp3",
            d({ speechContent: "After a few rounds they spied the hunchback up in the tree. He trembled for his life. “For goodness’ sakes, little old souls, don’t kill me. That line just slipped out. I meant no harm, I swear.” “Well come down and let us reward you. Ask any favor at all, and we will grant it.”" },
                "dlg_shot5"));
        audioLoader.load(
            "./content/s_silence.mp3",
            d({ speechContent: "The hunchback came down the tree. “Go on, ask!” “I'm a poor man, what do you expect me to ask? What I'd really like would be for this hump to come off my back, since the boys all tease me about it.” “All right, the hump will be removed.” The old women took a butter saw, sawed off the hump, and rubbed his back with salve, so that it was now sound and scarless. The hump they hung on the tree." },
                "dlg_shot6"));
        audioLoader.load(
            "./content/s_silence.mp3",
            d({ speechContent: "The hunchback who was no longer a hunchback went home, and nobody recognized him. “It can’t be you!” said his brother. “It most certainly is me. See how handsome I’ve become?” “How did you do it?” “Just listen.” He told him about the tree, the little old women, and their song. “I’m going to them, too,” announced the brother." },
                "dlg_shot7"));
        audioLoader.load(
            "./content/s_silence.mp3",
            d({ speechContent: "So he set out, entered the same woods, and climbed the same tree. At the same time as last, here came the little old women out of their hole singing: “Saturday, Sunday, And Monday! Saturday, Sunday, And Monday!” From the tree the hunchback sang: “And Tuesday!” The old women began singing: “Saturday, Sunday, And Monday! And Tuesday!”" },
                "dlg_shot8"));
        audioLoader.load(
            "./content/s_silence.mp3",
            d({ speechContent: "But the song no longer suited them, its rhythm had been marred. They looked up, furious. “Who is this criminal, this assassin? We were singing so well and he had to come along and ruin everything! Now we’ve lost our song!” They finally saw him up in the tree. “Come down, come down!” “I will not!” said the hunchback, scared to death. “You will kill me!” “No we won't, come on down!”" },
                "dlg_shot9"));
        audioLoader.load(
            "./content/s_silence.mp3",
            d({ speechContent: "The hunchback came down, and the little old women grabbed his brother's hump hanging on a tree limb and stuck it on his chest. “That’s the punishment you deserve!” So the poor hunchback went home with two humps instead of one." },
                "dlg_shot10"));
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
        fbxLoader.load(
            "./content/sm_maleTwoHumps_pose_walk.fbx",
            sm("maleTwoHumps_pose_walk"));
        textureLoader.load(
            "./content/t_3704_credits.png",
            cacheOnly);
        textureLoader.load(
            "./content/t_forestBlur.jpg",
            t({ w: 200, h: 300 }, "backdrop_forest", "backdrop_forest2", "backdrop_forest3", "backdrop_forest4"));
        textureLoader.load(
            "./content/t_forestGround.jpg",
            t({ w: 1000, h: 1000 }, "backdrop_ground"));
        textureLoader.load(
            "./content/t_twoHunchbacks3704_titleCard.png",
            cacheOnly);

    }

    private beginGameForReal() {
        if (!this.noLogo) {
            // Get rid of the loading screen.
            $("#loading").slideUp(500)
            setTimeout(() => $("#loading").remove(), 490);

            // Start the fade up after a second of black.
            this.screenCover.setColor("#000000");
            this.screenCover.setOpacity(1);
            setTimeout(() => {
                this.screenCover.startAccumulatedFade("#000000", 1.0, "#000000", 0.0, this.fadeUpDuration);
            }, 1000);

            // Test the title card system. (after the fade in)
            setTimeout(() => {
                const titleCard = new TitleCard("./content/t_twoHunchbacks3704_titleCard.png");
                titleCard.animate();
            }, this.fadeUpDuration * 1000 + 2000);
        }

        // Go to the initial position.
        this.hasGameStarted = true;
        this.timeline.nextPoint();
    }

    private onAnyAssetLoaded() {
        this.loadedAssetCount++;
        console.log(`loaded ${this.loadedAssetCount} assets`);

        function setProgress(jqProg: JQuery, valPercent: Readonly<number>) {
            // Only adjust to increase the progress!
            if (parseInt(jqProg.attr("aria-valuenow")) < valPercent * 100) {
                jqProg.css("width", `${valPercent * 100}%`)
                    .attr("aria-valuenow", valPercent * 100);
            }
        }
        const bar = $("#loading-progress .progress-bar");

        if (this.isFinishedLoading()) {
            // Finalize the loading bar progress.
            setProgress(bar, 1);

            // Hide the loading screen when fully loaded.
            function isTouchEnabled() {
                return ('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0) ||
                    (navigator.msMaxTouchPoints > 0);
            }

            $("#start-game").find(".device-play-verb").text(
                isTouchEnabled() ? "Tap" : "Click"
            );
            $("#loading-progress").fadeOut(500);
            setTimeout(() => $("#start-game").fadeIn(), 500);
        } else {
            // Update the progress bar percentage.
            setProgress(bar, this.loadedAssetCount / this.totalAssetCount);
        }
    }

    private isFinishedLoading() {
        return this.loadedAssetCount >= this.totalAssetCount;
    }

    /**
     * Called when the user clicks past the end of the timeline.
     */
    public onTimelineFinished() {
        if (this.isGameOver) {
            return;
        }

        this.isGameOver = true;

        // Stop playing any dialogue.
        this.audioMixer.playDialogue({ speechContent: "", audioCue: null });
        // Make the bgm louder and the ambience silent in 1 second.
        this.bgmLerpTime = 0;
        makeTick((deltaTime) => {
            // This is not the most efficient way to do this!
            this.bgmLerpTime += deltaTime;
            const bias = this.bgmLerpTime / 1;
            if (bias <= 1) {
                this.backgroundMusic?.setVolume(MathStat.lerp(0.2, 0.6, bias));
                this.ambientSound?.setVolume(MathStat.lerp(5.5, 0, (1 - bias)));
            } else {
                if (this.ambientSound?.isPlaying){
                    this.ambientSound?.stop();
                }
            }
        });

        // Load the credits image.
        // TODO: add rolling credits component.
        const imageUrl = "./content/t_3704_credits.png";
        const creditsCover = $("<div>").attr("id", "abcd").addClass("text-center bg-dark text-light d-flex fixed-bottom align-items-center justify-content-center")
            .css({ width: "100vw", height: "100vh", "z-index": "9999!important" }).append(
                $("<div>")
                    .css({ width: "100vw", height: "100vh" })
                    .css("background", `no-repeat center/contain url('${imageUrl}')`));
        $(document.body).append(creditsCover);
        // Slide the credits up from the bottom of the screen (because fixed-bottom).
        creditsCover.hide();
        setTimeout(() => creditsCover.slideDown(1000), 10);
    }

    public getTimeline() { return this.timeline; }
}
