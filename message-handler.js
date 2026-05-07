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
            // TPEN standard message types
            case "TPEN_CONTEXT":
                // Receive context from parent (project, page, canvas, etc.)
                this.#handleTPENContext(event.data)
                break

            case "SELECT_ANNOTATION":
            case "NAVIGATE_TO_LINE":
            case "CURRENT_LINE_INDEX":
            case "RETURN_LINE_ID":
                // Standard navigation message - extract line ID and navigate
                this.#handleLineNavigation(event.data)
                break

            // Legacy/custom canvas loading message types (backward compatible)
            case "MANIFEST_CANVAS_ANNOTATIONPAGE_ANNOTATION":
            case "CANVAS_ANNOTATIONPAGE_ANNOTATION":
            case "MANIFEST_CANVAS_ANNOTATIONPAGE":
            case "CANVAS_ANNOTATIONPAGE":
            case "MANIFEST_CANVAS":
            case "CANVAS":
                this.pageViewer.loadPage(event.data.canvas, event.data.manifest, event.data.annotationPage, event.data.annotation)
                break

            case "REQUEST_TPEN_ID_TOKEN":
                // Page-Viewer doesn't need auth
                break
            default:
                console.warn("Unknown message type:", event.data.type)
        }
    }

    /**
     * Handle TPEN context message (informational - parent sharing context with viewer)
     * @param {Object} data - TPEN context data
     */
    #handleTPENContext(data) {
        // Store context if needed for future interactions
        // Page-Viewer can use this to maintain state alignment with parent
        if (data.canvas) {
            // If parent explicitly sends a canvas, ensure we're viewing it
            this.pageViewer.loadPage(data.canvas)
        }
    }

    /**
     * Handle line navigation from parent (SELECT_ANNOTATION, NAVIGATE_TO_LINE, etc.)
     * @param {Object} data - Message data with lineId/lineid/annotation field
     */
    #handleLineNavigation(data) {
        // Extract line ID from various possible field names
        const lineId = data.lineId ?? data.lineid ?? data.annotation

        if (!lineId) return

        // Dispatch event for UI components to respond to line selection
        // This allows other components (like transcription blocks) to update
        this.pageViewer.uiManager?.highlightLine?.(lineId)
    }
}
