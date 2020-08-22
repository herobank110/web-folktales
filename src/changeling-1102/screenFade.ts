/**
 * Allows the screen to be faded to a color.
 * 
 * Construct before/after the subtitles text viewer depending on
 * whether you want text shown or hidden by the screen cover.
 */
export class ScreenCover {
    domElement: HTMLDivElement;

    constructor() {
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
}