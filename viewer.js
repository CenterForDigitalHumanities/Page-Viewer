/**
 * IIIF Page Viewer - Main Module
 * 
 * A modular IIIF image viewer that supports both Presentation API (v2/v3) 
 * and Image API (v2/v3) standards. This main module coordinates between
 * data services, UI management, and message handling.
 * 
 * @author Priyal Patel @mepripri
 * @author Patrick Cuba @cubap
 * @version 2.0.0
 */

import { IIIFDataService } from './iiif-data-service.js'
import { UIManager } from './ui-manager.js'
import { MessageHandler } from './message-handler.js'

/**
 * Main PageViewer class that coordinates IIIF data loading and UI updates
 */
class PageViewer {
    constructor(containerId = 'imageContainer') {
        this.dataService = new IIIFDataService()
        this.uiManager = new UIManager(containerId)
        this.messageHandler = new MessageHandler(this)
    }

    /**
     * Get the annotation ID based on the provided annotation reference
     * @param {Array} annotations - List of annotations on the canvas
     * @param {string|object} annotation - Annotation reference (ID string or object with ID)
     * @returns {number|null} Index of the annotation in the list or null if not found
     */
    getAnnotationId(annotations, annotation) {
        if (!annotation) return null

        if (typeof annotation === "string" && this.dataService.isValidUrl(annotation)) {
            const annotationId = annotations.findIndex(anno => anno.lineid === annotation)
            return annotationId !== -1 ? annotationId : null
        }

        if (typeof annotation === "object" && this.dataService.isValidJSON(annotation)) {
            const annotationId = annotations.findIndex(anno => anno.lineid === annotation.id)
            return annotationId !== -1 ? annotationId : null
        }

        return null
    }

    /**
     * Load and display a IIIF page
     * @param {string} pageId - ID of the IIIF page to load
     */
    async loadPage(canvas, manifest = null, annotationPage = null, annotation = null) {
        if (!canvas) {
            console.warn("No canvas provided")
            this.uiManager.showError("No canvas provided")
            return
        }

        try {
            this.uiManager.showLoading("Loading canvas data...")

            const canvasData = await this.dataService.fetchPageViewerData(canvas, manifest, annotationPage)
            if (!canvasData) {
                throw new Error("No canvas data received")
            }

            const { imgUrl, annotations, imgWidth, imgHeight } = canvasData

            this.uiManager.renderMagnifier()

            // Load the image first
            await this.uiManager.renderImage(imgUrl)
            
            // Then render annotations
            this.uiManager.renderAnnotations(annotations, imgWidth, imgHeight)

            if(typeof canvas === "object" && this.dataService.isValidJSON(canvas)) {
                canvas = canvas.id
            }

            if(manifest && (typeof manifest === "object" && this.dataService.isValidJSON(manifest))) {
                manifest = manifest.id
            }

            if(annotationPage && (typeof annotationPage === "object" && this.dataService.isValidJSON(annotationPage))) {
                annotationPage = annotationPage.id
            }

            let annotationId = this.getAnnotationId(annotations, annotation)

            if (annotationId !== null) {
                document.querySelector(`.overlayBox[data-lineid="${annotationId}"]`)?.classList.add('clicked')
                document.querySelector(`.overlayBox[data-lineid="${annotationId}"]`)?.setAttribute('aria-selected', 'true')
                history.replaceState(null, '', `?${manifest ? `manifest=${manifest}&` : ''}canvas=${canvas}${annotationPage ? `&annotationPage=${annotationPage}` : ''}${annotation ? `&annotation=${annotation}` : ''}`)
                return
            }

            if (annotations.length === 0) {
                history.replaceState(null, '', `?${manifest ? `manifest=${manifest}&` : ''}canvas=${canvas}`)
                return
            }

            history.replaceState(null, '', `?${manifest ? `manifest=${manifest}&` : ''}canvas=${canvas}${annotationPage ? `&annotationPage=${annotationPage}` : ''}${annotation ? `&annotation=${annotations[0].lineid}` : ''}`)
            document.querySelector(`.overlayBox[data-lineid="0"]`).classList.add('clicked')
            document.querySelector(`.overlayBox[data-lineid="0"]`).setAttribute('aria-selected', 'true')
            return

        } catch (error) {
            console.error("Error loading page:", error)
            this.uiManager.showError(`Failed to load page: ${error.message}`)
        }
    }

    /**
     * Initialize the page viewer
     */
    init() {
        // Check if page URL is provided via URL parameters or other means
        const urlParams = new URLSearchParams(window.location.search)
        const canvas = urlParams.get('canvas')
        const manifest = urlParams.get('manifest')
        const annotationPage = urlParams.get('annotationPage')
        const annotation = urlParams.get('annotation')

        if (!canvas) {
            this.uiManager.showLoading("Waiting for Canvas from parent window...")
            return
        }

        this.loadPage(canvas, manifest, annotationPage, annotation)
    }
}

// Initialize the page viewer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const viewer = new PageViewer()
    viewer.init()
})

export { PageViewer }
