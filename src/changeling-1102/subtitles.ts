import { EngineObject } from "/folktales/include/factorygame/factorygame.js";

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
    public onTextChanged: (inText: string) => void;
}

/**
 * Displays text at the bottom of the screen in a box.
 * 
 * Only one viewer should ever be created as their text will overlap
 * and there is currently no way to remove the text box.
 */
export class HtmlTextViewer {

    public constructor() {
        // Make the element in the DOM.
        let parent = $(`<div class="subtitle-box container fixed-bottom text-center mb-5 py-1">`)
            .css({ "color": "white", "background-color": "#222e" });
        let el = $(`<span class="subtitle-box__text ">`)

        // Attach to body.
        parent.append(el);
        $(document.body).append(parent);

        // Save for future reference.
        this.domElement = parent.get(0);

        this.setText("");
        this.setFont({ "font-family": "Arial", "font-size": "14px" })
    }

    /** Sets the displayed text. Can be marked up using HTML. */
    public setText(inText: string): void {
        if (this.domElement !== undefined) {
            if (inText == "") {
                // Apply a non blocking space to preserve box height if
                // subtitles empty, or we could hide the box.
                inText = "&nbsp;";
                $(this.domElement).fadeOut();
            } else {
                $(this.domElement).fadeIn();
            }

            // Apply to the span inside the div.
            $(this.domElement).children("span").html(inText);
        }
    }

    /**
     * Set the CSS styling of the text.
     * 
     * Common properties could include:
     * { "font-family": "serif", "font-size": "" }
    */
    public setFont(styleObject: { "font-family"?: string, "font-size"?: string }) {
        if (this.domElement !== undefined) {
            // Apply to the span inside the div.
            $(this.domElement).children("span").css(styleObject);
        }
    }

    /** Span element that is used for displaying the text. */
    public readonly domElement: HTMLSpanElement;
}

/**
 * SubtitleManager and HtmlTextViewer as a gameplay component.
 */
export class SubtitleComponent extends EngineObject {
    /** Use for setting text. */
    public subtitleManager: SubtitleManager;
    /** Use for visual configuration. */
    public textViewer: HtmlTextViewer;

    constructor() {
        super();
        this.subtitleManager = new SubtitleManager();
        this.textViewer = new HtmlTextViewer();
        // Set a sensible default font.
        this.textViewer.setFont({ "font-family": "Roboto", "font-size": "18px" });
        // Update the visible subtitles when the subtitles changed.
        this.subtitleManager.onTextChanged = (text) => { this.textViewer.setText(text); };
    }
}