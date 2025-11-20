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
        const { manifest = null, canvas, annotationPage = null, annotation = null } = event.data

        switch (event.data.type) {
            case "SELECT_ANNOTATION":
                const lineId = event.data.lineId.split('/').pop()
                document.querySelectorAll(`.overlayBox`).forEach(box => {
                    if (box.getAttribute('data-lineserverid') !== lineId) {
                        box.classList.remove('clicked')
                        box.setAttribute('aria-selected', 'false')
                    }
                })
                const el = document.querySelector(`.overlayBox[data-lineserverid="${lineId}"]`)
                if (el) {
                    el.classList.add('clicked')
                    el.setAttribute('aria-selected', 'true')
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
                break
            case "MANIFEST_CANVAS_ANNOTATIONPAGE_ANNOTATION":
            case "CANVAS_ANNOTATIONPAGE_ANNOTATION":
                this.pageViewer.loadPage(canvas, manifest, annotationPage, annotation)
                break
            case "MANIFEST_CANVAS_ANNOTATIONPAGE":
            case "CANVAS_ANNOTATIONPAGE":
                this.pageViewer.loadPage(canvas, manifest, annotationPage)
                break
            case "MANIFEST_CANVAS":
                this.pageViewer.loadPage(canvas, manifest)
                break
            case "CANVAS":
                this.pageViewer.loadPage(canvas)
                break
            default:
                console.warn("Unknown message type:", event.data.type)
        }
    }
}
