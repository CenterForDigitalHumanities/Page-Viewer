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
     * Handle incoming messages from parent window
     * @param {MessageEvent} event - The message event
     */
    handleMessage(event) {
        if (!event.data?.type) return

        switch (event.data.type) {
            case "CANVAS_URL":
                if (event.data.canvasUrl) {
                    this.pageViewer.loadCanvas(event.data.canvasUrl)
                }
                break
            case "MANIFEST_CANVAS":
                if (event.data.manifestUrl) {
                    this.pageViewer.loadCanvasFromManifest(
                        event.data.manifestUrl, 
                        event.data.canvasId
                    )
                }
                break
            default:
                console.warn("Unknown message type:", event.data.type)
        }
    }
}
