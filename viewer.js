/**
 * IIIF Page Viewer - Main Module
 * 
 * A modular IIIF image viewer that supports both Presentation API (v2/v3) 
 * and Image API (v2/v3) standards. This main module coordinates between
 * data services, UI management, and message handling.
 * 
 * @author Assistant
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
     * Load and display a IIIF canvas
     * @param {string} canvasUrl - URL to the IIIF canvas or manifest containing the canvas
     */
    async loadCanvas(canvasUrl) {
        if (!canvasUrl) {
            console.warn("No canvas URL provided")
            this.uiManager.showError("No canvas URL provided")
            return
        }

        try {
            this.uiManager.showLoading("Loading canvas data...")
            
            const canvasData = await this.dataService.fetchCanvasData(canvasUrl)
            if (!canvasData) {
                throw new Error("No canvas data received")
            }

            const { imgUrl, annotations, imgWidth, imgHeight } = canvasData
            
            // Load the image first
            await this.uiManager.renderImage(imgUrl)
            
            // Then render annotations
            this.uiManager.renderAnnotations(annotations, imgWidth, imgHeight)
            
        } catch (error) {
            console.error("Error loading canvas:", error)
            this.uiManager.showError(`Failed to load canvas: ${error.message}`)
        }
    }

    /**
     * Load a specific canvas from a manifest
     * @param {string} manifestUrl - URL to the IIIF manifest
     * @param {string} canvasId - ID of the specific canvas within the manifest
     */
    async loadCanvasFromManifest(manifestUrl, canvasId) {
        const canvasUrl = canvasId ? `${manifestUrl}#${canvasId}` : manifestUrl
        await this.loadCanvas(canvasUrl)
    }

    /**
     * Initialize the page viewer
     */
    init() {
        // Check if canvas URL is provided via URL parameters or other means
        const urlParams = new URLSearchParams(window.location.search)
        const canvasUrl = urlParams.get('canvas')
        
        if (canvasUrl) {
            this.loadCanvas(canvasUrl)
        } else {
            this.uiManager.showLoading("Waiting for canvas URL from parent window...")
        }
    }
}

// Initialize the page viewer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const viewer = new PageViewer()
    viewer.init()
})

export { PageViewer }