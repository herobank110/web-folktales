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

        // Create the screen cover and make it black initially.
        const screenCover = this.spawnActor(ScreenCover, [0, 0]);
        // Start the fade up after a second of black.
        screenCover.setColor("#000000");
        screenCover.setOpacity(1);
        setTimeout(() => {
            screenCover.startAccumulatedFade("#000000", 1.0, "#000000", 0.0, this.fadeUpDuration);
        }, 1000);

        // Create the audio mixer in the world (2D non-spatial audio only.)
        this.audioMixer = this.spawnActor(SoundMixer2D, [0, 0]);

        // Test the title card system. (after the fade in)
        setTimeout(() => {
            const titleCard = new TitleCard("https://th.bing.com/th/id/OIP.w_f-Z3fiVUyUe3m_rg2DJgHaFj?pid=Api&rs=1");
            titleCard.animate();
        }, this.fadeUpDuration * 1000 + 2000);


        // Move the camera to the initial position.
        this.camera.position.y = 100;
        this.camera.position.z = 300;
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

        // The static environment inside. It doesn't get animated at any
        // point and requires only one mesh. Consider using glTF for faster
        // loading.
        fbxLoader.load("./content/sm_hovel_interior_static.fbx", (object) => {
            this.scene.add(object);
        });

        // Load audio for later usage.
        // const audioLoader = new THREE.AudioLoader();
        // audioLoader.load("./content/s_coralie_clement_short.mp3", (buffer) => {
        //     // Save a reference to the buffer when loaded.
        //     this.testingAudioCue = buffer;
        // });
    }
}
