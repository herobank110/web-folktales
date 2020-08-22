import { Actor, MathStat } from "/folktales/include/factorygame/factorygame.js";

/**
 * Allows the screen to be faded to a color.
 * 
 * Construct before/after the subtitles text viewer depending on
 * whether you want text shown or hidden by the screen cover.
 */
export class ScreenCover extends Actor {
    /** Div element covering the whole screen. */
    public domElement: HTMLDivElement;
    // Animation helpers
    private startColor: string;
    private startOpacity: number;
    private endColor: string;
    private endOpacity: number;
    private duration: number;
    private currentTime: number = -1.0;

    constructor() {
        super();

        // Component initialization can go in the constructor.

        // Create the fullscreen covering block.
        let el = $(`<div class="fixed-top h-100 w-100">`);

        // Set reference.
        this.domElement = el.get(0) as HTMLDivElement;

        // Transparent at start.
        this.setColor("#000");
        this.setOpacity(0);

        $(document.body).append(el);
    }

    /**
     * Sets the RGB color of the screen cover using hexadecimal string.
     * 
     * @warning The string must begin with "#".
     *
     * This may affect the opacity of the background-color, but not the
     * overall element opacity.
     */
    public setColor(inColor: string) {
        if (this.domElement !== undefined) {
            $(this.domElement).css({ "background-color": inColor });
        }
    }

    /** Sets the overall opacity of the screen cover. */
    public setOpacity(inOpacity: number) {
        if (this.domElement !== undefined) {
            $(this.domElement).css({ "opacity": inOpacity });
        }
    }

    /** Fade to the desired opacity over time. 
     *
     * Colors must be RGB hex strings starting with "#", and must have
     * two characters per component. Eg, "#RrGgBb"
     */
    public startAccumulatedFade(startColor: string, startOpacity: number, endColor: string, endOpacity: number, duration: number) {
        // Save animated properties.
        this.startColor = startColor;
        this.startOpacity = startOpacity;
        this.endColor = endColor;
        this.endOpacity = endOpacity;
        this.duration = duration;
        if (this.duration <= 0) {
            throw new RangeError("Animation cannot have negative or zero duration");
        }
        // Begin ticking for animation.
        this.currentTime = 0.0;
        this.primaryActorTick.tickEnabled = true;
    }

    /** Helper to fade the screen from transparent to white. */
    public fadeToWhite(duration: number) {
        this.startAccumulatedFade("#ffffff", 0, "#ffffff", 1, duration);
    }

    /** Helper to fade the screen from transparent to black. */
    public fadeToBlack(duration: number) {
        this.startAccumulatedFade("#000000", 0, "#000000", 1, duration);
    }

    /** Helper to fade from transparent to black to transparent. */
    public dipToBlack(duration: number) {
        this.startAccumulatedFade("#000000", 0, "#000000", 1, duration / 2);
        setTimeout(() => {
            this.startAccumulatedFade("#000000", 1, "#000000", 0, duration / 2);
        }, duration / 2 * 1000)
    }

    /** Helper to fade from transparent to white to transparent. */
    public dipToWhite(duration: number) {
        this.startAccumulatedFade("#ffffff", 0, "#ffffff", 1, duration / 2);
        setTimeout(() => {
            this.startAccumulatedFade("#ffffff", 1, "#ffffff", 0, duration / 2);
        }, duration / 2 * 1000)
    }

    public tick(deltaTime: number) {
        // Perform accumulated fade each frame.
        if (this.currentTime != -1) {
            // Still got some animating to do.
            this.currentTime += deltaTime;

            // Perform a simple linear interpolation.
            let bias = this.currentTime / this.duration;

            this.setColor(MathStat.lerp(this.startColor, this.endColor, bias));
            this.setOpacity(MathStat.lerp(this.startOpacity, this.endOpacity, bias));

            if (this.currentTime > this.duration) {
                // Stop the animation on future frames.
                this.currentTime = -1.0;
                this.primaryActorTick.tickEnabled = false;
            }
        }
    }
}