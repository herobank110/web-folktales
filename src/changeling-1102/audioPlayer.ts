import { Actor, GameplayUtilities } from "/folktales/include/factorygame/factorygame.js";
import { SubtitleManager, SubtitleComponent } from "./subtitles.js";
var THREE = window["THREE"];


export interface DialogueCue {
    /** Audio buffer to play. */
    audioCue: AudioBuffer;

    /**
     * What is uttered in the dialogue for use in subtitling.
     * 
     * May contain HTML mark up.
     */
    speechContent: string;

    /** Volume to play audio at. Default is 1.0. */
    volume?: number;
}

/** Plays sounds and updates subtitles. */
class DialoguePlayer {
    public audio: THREE.Audio;
    public subtitle: SubtitleManager;

    public constructor(listener: THREE.AudioListener) {
        // Create the audio once so it doesn't have to be remade.
        // Only one dialogue should play at a time (if it is to be subtitled!)
        this.audio = new THREE.Audio(listener);
    }

    public play(cue: DialogueCue) {
        // Play the audio in the active Audio object.
        this.audio.setBuffer(cue.audioCue);
        this.audio.setLoop(false);
        this.audio.setVolume(cue.volume || 1.0);
        this.audio.play();

        // Show the subtitles too.
        this.subtitle.setText(cue.speechContent);

        // Remove the subtitle after the delay.
        // It will actually just empty the box rather than hide it.
        // Time must be converted to milliseconds, plus a half second delay.
        let delay = cue.audioCue.duration * 1000 + 500;
        setTimeout(() => { this.subtitle.setText(""); }, delay);
    }
}

// TODO: This should be an actor to use the SubtitleComponent properly!
export class SoundMixer2D {
    /** Listens to playing audio(s). Only 1 active per game session. */
    private listener: THREE.AudioListener;

    /** Plays back dialogue. */
    private dialoguePlayer: DialoguePlayer;

    constructor() {
        // Create the global (2D) audio listener.
        // In a non-2D sound mixer, you would attach the listener to the camera
        // (or other microphone source.)
        this.listener = new THREE.AudioListener();

        // Only one dialogue player needs to exist for all instances of
        // dialogue since only one is active at a time.
        this.dialoguePlayer = new DialoguePlayer(this.listener);
    }

    /**
     * Plays a audio. Asynchronously.
     * 
     * @param cue Audio to play. Must already have been loaded by
     * THREE.AudioLoader or some other means.
     * @param volume Volume to play at. Will probably remove this.
     * @return The newly created audio object for further manipulation.
     */
    public playAudio(cue: AudioBuffer, volume: number = 1.0): THREE.Audio {
        let sound = new THREE.Audio(this.listener);
        sound.setBuffer(cue);
        sound.setLoop(true);
        sound.setVolume(volume);
        sound.play();
        return sound;
    }

    /**
     * Same as `playAudio` but subtitles are displayed too.
     * 
     * The previous dialogue is stopped and replaced, if any.
     * 
     * @param cue Dialogue cue to play.
     * @return The playing audio clip. It is the same object for all
     * invocations.
     */
    public playDialogue(cue: DialogueCue): THREE.Audio {
        this.dialoguePlayer.play(cue);
        // Not sure why this is returned, but sure!
        return this.dialoguePlayer.audio;
    }
}