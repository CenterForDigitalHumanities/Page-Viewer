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
        let pageId

        switch (event.data.type) {
            case "SELECT_ANNOTATION":
                const annotations = document.querySelectorAll('.overlayBox')
                const index = event.data.lineId
                annotations.forEach((anno, i) => {
                    if (i !== index) {
                        anno.classList.remove('clicked')
                        anno.setAttribute('aria-selected', 'false')
                    }
                })
                const el = annotations[index]
                if (el) {
                    el.classList.add('clicked')
                    el.setAttribute('aria-selected', 'true')
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
                break
            case "ONLY_LOAD_PAGE":
                pageId = event.data.pageId
                this.pageViewer.loadPage(pageId)
                break
            case "LOAD_MANIFEST_PAGE":
                const { manifestUrl, annotationId } = event.data
                pageId = event.data.pageId
                this.pageViewer.loadPage(pageId, annotationId || null, manifestUrl)
                break
            default:
                console.warn("Unknown message type:", event.data.type)
        }
    }
}
