import { SoundMixer2D } from "../changeling-1102/audioPlayer.js";
import { ScreenCover } from "../changeling-1102/screenFade.js";
import { TitleCard } from "../changeling-1102/titleCard.js";
import { FolkWorldBase, makeTick } from "../core/world.js";
import { FBXLoader } from "/folktales/include/three/examples/jsm/loaders/FBXLoader.js";
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
    readonly noLogo: boolean = false;

    beginPlay() {
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

        // Move the camera to the initial position.
        this.camera.position.y = 100;
        this.camera.position.z = -150;
        this.camera.rotation.y = Math.PI;
    }

    /**
     * Downloads and places content in the scene.
     * 
     * This will only ever be called once, on begin play.
     * TODO: Add progress bar when each thing is loaded.
     */
    private downloadContent() {
        const fbxLoader = new FBXLoader();

        const onModelLoaded = (object)  => {
            this.scene.add(object);
        };

        const onDynamicModelLoaded = (objectID: string) => {
            return (object) => {
                // TODO: Add to the dynamic actors list.
                // Add to scene as per usual.
                onModelLoaded(object);
            }
        };

        // The static environment inside. It doesn't get animated at any
        // point and requires only one mesh. Consider using glTF for faster
        // loading.
        fbxLoader.load("./content/sm_hovel_interior_static.fbx", onModelLoaded);

        // Load dynamic actors and add to the dynamic actors list.
        fbxLoader.load("./content/sm_cradle.fbx", (object) => {
            onDynamicModelLoaded("cradle")(object);
            makeTick((dt) => { object.rotateY(Math.PI * dt * 0.2); });
        });

        // Load audio for later usage.
        // const audioLoader = new THREE.AudioLoader();
        // audioLoader.load("./content/s_coralie_clement_short.mp3", (buffer) => {
        //     // Save a reference to the buffer when loaded.
        //     this.testingAudioCue = buffer;
        // });
    }
}
