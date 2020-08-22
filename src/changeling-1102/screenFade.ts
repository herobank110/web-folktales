/**
 * Allows the screen to be faded to a color.
 */
export class ScreenFade {
    domElement: HTMLElement;

    constructor() {
        // Create the fullscreen covering block.
        let el = $(`<div class="fixed-top h-100 w-100"`);

        // Transparent at start.
        this.setColor("#000");
        this.setOpacity(0);

        // Set reference.
        this.domElement = el.get(0);
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
}