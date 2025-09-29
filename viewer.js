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
     * Load and display a IIIF page
     * @param {string} pageId - ID of the IIIF page to load
     */
    async loadPage(canvas, manifest, annotationPage, annotation = null) {
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

            // Load the image first
            await this.uiManager.renderImage(imgUrl)
            
            // Then render annotations
            this.uiManager.renderAnnotations(annotations, imgWidth, imgHeight)

            const idx = annotations.findIndex(anno => anno.lineid === annotation)
            const annotationId = idx !== -1 ? idx : null
            if(typeof canvas !== "string" && this.dataService.isValidUrl(canvas)) {
                canvas = canvas.id
            }
            if(typeof manifest !== "string" && this.dataService.isValidUrl(manifest)) {
                manifest = manifest.id
            }
            if(typeof annotationPage !== "string" && this.dataService.isValidUrl(annotationPage)) {
                annotationPage = annotationPage.id
            }

            if (annotationId !== null) {
                document.querySelector(`.overlayBox[data-lineid="${annotationId}"]`).classList.add('clicked')
                document.querySelector(`.overlayBox[data-lineid="${annotationId}"]`).setAttribute('aria-selected', 'true')
                history.replaceState(null, '', `?${manifest ? `manifest=${manifest}&` : ''}canvas=${canvas}${annotationPage ? `&annotationPage=${annotationPage}` : ''}${annotation ? `&annotation=${annotation}` : ''}`)
            } else {
                if (annotations.length === 0) {
                    history.replaceState(null, '', `?${manifest ? `manifest=${manifest}&` : ''}canvas=${canvas}`)
                }
                else {
                    history.replaceState(null, '', `?${manifest ? `manifest=${manifest}&` : ''}canvas=${canvas}${annotationPage ? `&annotationPage=${annotationPage}` : ''}${annotation ? `&annotation=${annotations[0].lineid}` : ''}`)
                    document.querySelector(`.overlayBox[data-lineid="0"]`).classList.add('clicked')
                    document.querySelector(`.overlayBox[data-lineid="0"]`).setAttribute('aria-selected', 'true')
                }
            }

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

        if (manifest && canvas && annotationPage && annotation) {
            this.loadPage(canvas, manifest, annotationPage, annotation)
        } else if (manifest && canvas && annotationPage) {
            this.loadPage(canvas, manifest, annotationPage)
        } else if (manifest && canvas) {
            this.loadPage(canvas, manifest)
        } else if (canvas) {
            this.loadPage(canvas)
        } else if (canvas && annotationPage) {
            this.loadPage(canvas, null, annotationPage)
        } else if (canvas && annotationPage && annotation) {
            this.loadPage(canvas, null, annotationPage, annotation)
        } else {
            this.uiManager.showLoading("Waiting for manifest URL or page URL from parent window...")
        }
    }
}

// Initialize the page viewer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const viewer = new PageViewer()
    viewer.init()
})

export { PageViewer }
