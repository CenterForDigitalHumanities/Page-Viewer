import { IIIFDataService } from './iiif-data-service.js'

/**
 * UI Manager - Handles all user interface operations
 * Manages DOM manipulation, event handling, and user interactions
 * 
 * @author Priyal Patel @mepripri
 * @author Patrick Cuba @cubap
 */
export class UIManager {
    constructor(containerId = 'imageContainer') {
        this.container = document.getElementById(containerId)
        this.currentAnnotations = []
        this.eventHandlers = new Map()
        this.dataService = new IIIFDataService() // For coordinate parsing
    }

    /**
     * Display error message to user
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="error-message" role="alert">
                <strong>Error:</strong> ${message}
            </div>
        `
        this.container.style.backgroundImage = "none"
    }

    /**
     * Display loading state
     * @param {string} message - Loading message
     */
    showLoading(message = "Loading canvas data...") {
        this.container.innerHTML = `
            <div class="loading" role="status" aria-live="polite">
                ${message}
            </div>
        `
    }

    /**
     * Render the main image
     * @param {string} imgUrl - URL of the image to display
     * @returns {Promise<HTMLImageElement>} Promise that resolves when image loads
     */
    renderImage(imgUrl) {
        return new Promise((resolve, reject) => {
            this.container.innerHTML = `
                <img id="canvasImage" src="${imgUrl}" alt="IIIF Canvas Image" />
            `
            this.container.style.backgroundImage = "none"
            
            const img = document.getElementById("canvasImage")
            img.onload = () => resolve(img)
            img.onerror = () => reject(new Error("Failed to load image"))
        })
    }

    /**
     * Create and render annotation overlays
     * @param {Array} annotations - Array of annotation objects
     * @param {number} imgWidth - Original image width
     * @param {number} imgHeight - Original image height
     */
    renderAnnotations(annotations, imgWidth, imgHeight) {
        this.currentAnnotations = annotations
        
        annotations.forEach((anno, index) => {
            if (!anno.target) return

            const { x, y, w, h } = this.dataService.parseXYWH(anno.target)
            
            // Calculate percentages for responsive positioning
            const left = (x / imgWidth) * 100
            const top = (y / imgHeight) * 100
            const width = (w / imgWidth) * 100
            const height = (h / imgHeight) * 100

            const box = this.createAnnotationBox(anno, index, left, top, width, height)
            this.container.appendChild(box)
        })
    }

    /**
     * Create an individual annotation overlay box
     * @param {Object} anno - Annotation data
     * @param {number} index - Annotation index
     * @param {number} left - Left position percentage
     * @param {number} top - Top position percentage
     * @param {number} width - Width percentage
     * @param {number} height - Height percentage
     * @returns {HTMLElement} The created overlay box element
     */
    createAnnotationBox(anno, index, left, top, width, height) {
        const box = document.createElement("div")
        box.className = "overlayBox"
        box.style.left = `${left}%`
        box.style.top = `${top}%`
        box.style.width = `${width}%`
        box.style.height = `${height}%`
        box.title = anno.text || "Annotation"
        box.dataset.lineserverid = anno.lineid.split('/').pop()
        box.dataset.lineid = index
        
        // Add accessibility attributes
        box.setAttribute('role', 'button')
        box.setAttribute('tabindex', '0')
        box.setAttribute('aria-label', `Annotation ${index + 1}: ${anno.text || 'No text available'}`)

        // Add event listeners
        this.attachAnnotationEvents(box, anno, index)

        return box
    }

    /**
     * Attach event listeners to annotation box
     * @param {HTMLElement} box - The annotation box element
     * @param {Object} anno - Annotation data
     * @param {number} index - Annotation index
     */
    attachAnnotationEvents(box, anno, index) {
        // Mouse enter - show tooltip
        box.addEventListener("mouseenter", () => {
            this.showTooltip(box, anno.text)
        })

        // Mouse leave - hide tooltip
        box.addEventListener("mouseleave", () => {
            this.hideTooltip(box)
        })

        // Click handler
        const clickHandler = () => {
            this.selectAnnotation(box, anno.lineid, index)
        }

        box.addEventListener("click", clickHandler)
        
        // Keyboard support
        box.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                clickHandler()
            }
        })
    }

    /**
     * Show tooltip for annotation
     * @param {HTMLElement} box - The annotation box
     * @param {string} text - Tooltip text
     */
    showTooltip(box, text) {
        if (!text || box.querySelector(".tooltip")) return
        
        const tooltip = document.createElement("div")
        tooltip.className = "tooltip"
        tooltip.textContent = text
        tooltip.setAttribute('role', 'tooltip')
        box.appendChild(tooltip)
    }

    /**
     * Hide tooltip for annotation
     * @param {HTMLElement} box - The annotation box
     */
    hideTooltip(box) {
        const tooltip = box.querySelector(".tooltip")
        tooltip?.remove()
    }

    /**
     * Select an annotation and notify parent window
     * @param {HTMLElement} box - The clicked annotation box
     * @param {string} lineid - Line ID
     * @param {number} index - Line index
     */
    selectAnnotation(box, lineid, index) {
        // Remove previous selection
        document.querySelectorAll('.overlayBox.clicked').forEach(el => {
            el.classList.remove('clicked')
            el.setAttribute('aria-selected', 'false')
        })
        
        // Add selection to current box
        box.classList.add('clicked')
        box.setAttribute('aria-selected', 'true')
        const urlParams = new URLSearchParams(window.location.search)
        let canvas = urlParams.get('canvas')
        let manifest = urlParams.get('manifest')
        let annotationPage = urlParams.get('annotationPage')
        if(typeof canvas !== "string" && this.dataService.isValidUrl(canvas)) {
            canvas = canvas.id
        }
        if(typeof manifest !== "string" && this.dataService.isValidUrl(manifest)) {
            manifest = manifest.id
        }
        if(typeof annotationPage !== "string" && this.dataService.isValidUrl(annotationPage)) {
            annotationPage = annotationPage.id
        }

        history.replaceState(null, '', `?${manifest ? `manifest=${manifest}&` : ''}canvas=${canvas}${annotationPage ? `&annotationPage=${annotationPage}` : ''}${lineid ? `&annotation=${lineid}` : ''}`)

        
        // Notify parent window
        window.parent?.postMessage({
            type: "RETURN_LINE_ID",
            lineid,
            lineIndex: index
        }, "*")
    }

    /**
     * Clear all content and reset container
     */
    clear() {
        this.container.innerHTML = ""
        this.currentAnnotations = []
    }
}
