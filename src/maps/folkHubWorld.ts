import { Loc, GameplayStatics, EInputEvent } from "/folktales/include/factorygame/factorygame.js";
import { PlayerAsCharacterPawn, PlayerController } from "../pawns.js";
import { FolkWorldBase, makeTick } from "../core/world.js";
import { FBXLoader } from "/folktales/include/three/examples/jsm/loaders/FBXLoader.js";
import { ScreenCover } from "../changeling-1102/screenFade.js";
import { SoundMixer2D } from "../changeling-1102/audioPlayer.js";
var THREE = window["THREE"];

export class FolkHubWorld extends FolkWorldBase {
    testingAudioCue: AudioBuffer;
    audioMixer: SoundMixer2D;
    beginPlay() {
        super.beginPlay();

        // Create the test environment for pawn possession and character movement.
        let pc = this.spawnActor(PlayerController, [0, 0]);
        let pl = this.spawnActor(PlayerAsCharacterPawn, [0, 0, 0]);

        pc.possess(pl);

        let planeGeom = new THREE.PlaneGeometry(1000, 1000);
        let planeMat = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
        let plane = new THREE.Mesh(planeGeom, planeMat);
        plane.rotation.x = Math.PI / -2;
        plane.position.y -= 3;
        this.scene.add(plane);
        plane.receiveShadow = true;


        let dirLight = new THREE.DirectionalLight();
        dirLight.rotation.x = Math.PI / 2;
        this.scene.add(dirLight);

        let envLight = new THREE.AmbientLight(0xcccccc);
        this.scene.add(envLight);

        // FBX models, from left to right.
        let fbxLoader = new FBXLoader();
        let textureLoader = new THREE.TextureLoader();

        // 1m^3 cube, no textures, default phong material.
        fbxLoader.load("./content/sm_cube_1m.fbx", (object) => {
            this.scene.add(object);
        });

        // Cat model with texture baked into phong material.
        fbxLoader.load("./content/sm_cat_textured.fbx", (object) => {
            this.scene.add(object);
            object.position.x = 100;
        });

        // Cat model without texture.
        fbxLoader.load("./content/sm_cat_untextured.fbx", (object) => {
            this.scene.add(object);
            object.position.x = 150;
        });

        // Cat model without texture but texture loaded separately.
        fbxLoader.load("./content/sm_cat_untextured.fbx", (object) => {
            textureLoader.load("./content/t_cat_texture.png", (texture) => {
                this.scene.add(object);
                object.children.forEach((child) => {
                    // All objects in three inherit from Object, so you can't use
                    // `child.type instanceof THREE.Mesh` on them!
                    if (child.type == "Mesh") {
                        let meshChild = <THREE.Mesh>child;
                        // The child could have a "material", or "materials" array.
                        // In any case use an array, and then get first element.
                        let materials = meshChild.material instanceof Array ? meshChild.material : [meshChild.material];
                        if (materials[0].type == "MeshPhongMaterial") {
                            let baseMat = <THREE.MeshPhongMaterial>materials[0];
                            baseMat.setValues({ map: texture, emissive: 0x444444, color: 0x663322, specular: 1.0 });
                        }
                    }
                });
                object.position.x = 200;
            });

        });

        // Animated wall loading model.
        fbxLoader.load("./content/anim_rotateUp.fbx", (object) => {
            this.scene.add(object);
            object.position.x = 350;
            console.log(object);
            object.children.forEach((child) => {
            });
        });

        // Test the screen fade system.
        let screenCover = this.spawnActor(ScreenCover, [0, 0]);
        screenCover.dipToWhite(2);

        // Test the audio playback system.
        // Create the audio mixer in the world (2D non-spatial audio only.)
        this.audioMixer = this.spawnActor(SoundMixer2D, [0, 0]);

        // Load audio for later usage.
        let audioLoader = new THREE.AudioLoader();
        audioLoader.load("./content/s_coralie_clement_short.mp3", (buffer) => {
            // Save a reference to the buffer when loaded.
            this.testingAudioCue = buffer;
        });
        // Play the sound each time the debug key is pressed.
        GameplayStatics.gameEngine.inputMappings.bindAction(
            "DebugTest", EInputEvent.PRESSED,
            () => {
                if (this.testingAudioCue !== undefined) {
                    if (Math.random() > 0.5) {
                        // Play a regular audio cue.
                        this.audioMixer.playAudio(this.testingAudioCue);
                    } else {
                        // Play a dialogue cue.
                        // The dialogue cues would probably all be made in a static array.
                        this.audioMixer.playDialogue({
                            audioCue: this.testingAudioCue,
                            speechContent: "The speech in the sound goes here."
                        });
                    }
                }
            });
    }
}
