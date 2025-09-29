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
    async loadPage(pageId, annotationId = null, manifestUrl = null) {
        if (!pageId) {
            console.warn("No page ID provided")
            this.uiManager.showError("No page ID provided")
            return
        }

        try {
            this.uiManager.showLoading("Loading page data...")

            const pageData = await this.dataService.fetchPageData(pageId, manifestUrl)
            if (!pageData) {
                throw new Error("No page data received")
            }

            const { imgUrl, annotations, imgWidth, imgHeight } = pageData

            // Load the image first
            await this.uiManager.renderImage(imgUrl)
            
            // Then render annotations
            this.uiManager.renderAnnotations(annotations, imgWidth, imgHeight)

            if (annotationId !== null) {
                document.querySelector(`.overlayBox[data-lineid="${annotationId}"]`).classList.add('clicked')
                document.querySelector(`.overlayBox[data-lineid="${annotationId}"]`).setAttribute('aria-selected', 'true')
                history.replaceState(null, '', `?${manifestUrl ? `manifestUrl=${manifestUrl}&` : ''}pageId=${pageId}&annotationId=${annotationId}`)
            } else {
                if (annotations.length === 0) {
                    history.replaceState(null, '', `?${manifestUrl ? `manifestUrl=${manifestUrl}&` : ''}pageId=${pageId}`)
                }
                else {
                    history.replaceState(null, '', `?${manifestUrl ? `manifestUrl=${manifestUrl}&` : ''}pageId=${pageId}&annotationId=0`)
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
        const manifestUrl = urlParams.get('manifestUrl')
        const pageId = urlParams.get('pageId')
        const annotationId = urlParams.get('annotationId')

        if (manifestUrl && pageId) {
            this.loadPage(pageId, annotationId, manifestUrl)
        } else if (pageId) {
            this.loadPage(pageId, annotationId)
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
