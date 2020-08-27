/**
 * Enables easy title card creation and animation.
 */
export class TitleCard {
    public domElement: HTMLDivElement;

    /**
     * Generate HTML elements to show the title card on screen.
     * 
     * After instantiation the title card will be visible in the center
     * of the screen.
     * 
     * @param imageUrl The URL of the image. Can be a local file.
     */
    public constructor(imageUrl: string) {
        // Make HTML element to display title card.
        // Create elements using jQuery.
        const parent = $(`<div class="container h-75 fixed-bottom" style="z-index: 10">`);
        const image = $(`<div class="h-75 w-100" style="background: no-repeat center/contain url('${imageUrl}')">`);

        // Add to the DOM.
        parent.append(image);
        $(document.body).append(parent);


        // Save reference.
        parent.hide();
        this.domElement = parent.get(0) as HTMLDivElement;
    }

    /**
     * Perform a common fade up, wait, and fade down animation.
     * 
     * The total running time of the animation is 6.2 seconds.
     */
    public animate() {
        const jqueryElement = $(this.domElement);
        jqueryElement.fadeIn("slow");
        setTimeout(() => { jqueryElement.fadeOut("slow"); }, 5000);
    }
}