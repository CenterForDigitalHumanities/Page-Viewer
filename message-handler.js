/**
 * Message Handler - Manages communication with parent window
 * Handles postMessage API communication for iframe integration
 * 
 * @author Priyal Patel @mepripri
 * @author Patrick Cuba @cubap
 */
export class MessageHandler {
    constructor(pageViewer) {
        this.pageViewer = pageViewer
        this.setupMessageListener()
    }

    /**
     * Set up message listener for parent window communication
     */
    setupMessageListener() {
        window.addEventListener("message", (event) => {
            this.handleMessage(event)
        })
    }

    /**
     * Handle incoming messages from parent window. Page-Viewer accepts the
     * lean TPEN_CONTEXT boot payload (canvas/manifest/annotationPage URIs +
     * currentLineId) and UPDATE_CURRENT_LINE deltas. Auth is not used.
     * @param {MessageEvent} event - The message event
     */
    handleMessage(event) {
        if (!event.data?.type) return

        switch (event.data.type) {
            case "TPEN_CONTEXT":
                this.#handleTPENContext(event.data)
                break

            case "UPDATE_CURRENT_LINE":
                this.#handleLineNavigation(event.data.currentLineId)
                break

            default:
                break
        }
    }

    /**
     * Handle TPEN context message. Loads the active canvas; the current line
     * (if any) rides along on `loadPage`, which highlights the matching
     * overlay box once annotations have rendered.
     * @param {Object} data - TPEN context data
     */
    #handleTPENContext(data) {
        if (!data.canvas) return
        this.pageViewer.loadPage(data.canvas, data.manifest, data.annotationPage, data.currentLineId)
    }

    /**
     * Highlight the active line on the canvas overlay.
     * @param {string|null} currentLineId - Full line IRI or null
     */
    #handleLineNavigation(currentLineId) {
        if (!currentLineId) return
        this.pageViewer.uiManager?.highlightAnnotation?.(currentLineId)
    }
}
