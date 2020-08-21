/**
 * Displays audio subtitles on screen.
 */
export class SubtitleManager {

    public setText(inText: string) {
        this.currentText = inText;
        if (this.onTextChanged !== undefined) {
            this.onTextChanged(inText);
        }
    }

    private currentText: string = "";
    public onTextChanged: (inText: string) => void = void (0);
}

export class HtmlTextViewer {

    public constructor() {
        // Make the element in the DOM.
        const el = $(`<span class="subtitle-viewer">`)
            .css({ "display": "block", "max-width": "80vw", "min-width": "200px" });
        // Attach to body.
        $(document.body).append(el);

        // Save for future reference.
        this.domElement = el.get(0);
    }

    /** Span element that is used for displaying the text. */
    public readonly domElement: HTMLSpanElement;
}