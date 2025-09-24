/**
 * IIIF Page Viewer - Main JavaScript Module
 * Provides functionality for viewing IIIF canvases with annotation overlays
 */

/**
 * IIIF Data Service - Handles all IIIF-related data fetching and parsing
 */
class IIIFDataService {
    /**
     * Parse XYWH coordinate string into object
     * @param {string} target - XYWH coordinate string
     * @returns {Object} Parsed coordinates {x, y, w, h}
     */
    parseXYWH(target) {
        const xywh = target.replace("xywh=pixel:", "").split(",").map(Number);
        return { x: xywh[0], y: xywh[1], w: xywh[2], h: xywh[3] };
    }

    /**
     * Fetch and parse IIIF canvas data with annotations
     * @param {string} canvasUrl - URL to the IIIF canvas or manifest containing the canvas
     * @returns {Promise<Object|null>} Canvas data with image URL, annotations, and dimensions
     */
    async fetchCanvasData(canvasUrl) {
        try {
            const response = await fetch(canvasUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch data from URL: ${response.status}`);
            }

            const data = await response.json();
            
            // Check if this is manifest data that contains canvases
            if (this.isManifestData(data)) {
                return await this.extractCanvasFromManifest(data, canvasUrl);
            }
            
            // Check if this is direct canvas data with a target
            if (data.target) {
                return await this.processCanvasData(data);
            }
            
            // If we have items but no target, this might be a canvas without annotations
            if (data.items || data.images) {
                return await this.processDirectCanvasData(data);
            }
            
            throw new Error("Unrecognized data format - not a valid IIIF manifest or canvas");
            
        } catch (error) {
            console.error("Error fetching IIIF canvas data:", error);
            throw error;
        }
    }

    /**
     * Check if the data represents a IIIF manifest
     * @param {Object} data - The fetched JSON data
     * @returns {boolean} True if this appears to be manifest data
     */
    isManifestData(data) {
        // IIIF v3 manifest indicators
        if (data.type === "Manifest" || data["@type"] === "sc:Manifest") {
            return true;
        }
        
        // Check for sequences (IIIF v2) or items with canvases (IIIF v3)
        if (data.sequences || (data.items && Array.isArray(data.items))) {
            return true;
        }
        
        return false;
    }

    /**
     * Extract canvas data from a IIIF manifest
     * @param {Object} manifestData - The manifest data
     * @param {string} originalUrl - The original URL (may contain canvas fragment)
     * @returns {Promise<Object>} Canvas data
     */
    async extractCanvasFromManifest(manifestData, originalUrl) {
        let targetCanvas = null;
        
        // Check if URL contains a canvas fragment identifier
        const urlParts = originalUrl.split('#');
        const canvasId = urlParts.length > 1 ? urlParts[1] : null;
        
        // IIIF v3 format
        if (manifestData.items) {
            if (canvasId) {
                // Find specific canvas by ID
                targetCanvas = manifestData.items.find(item => 
                    item.id === canvasId || 
                    item.id.endsWith(`#${canvasId}`) ||
                    item.id.endsWith(`/${canvasId}`)
                );
            }
            if (!targetCanvas && manifestData.items.length > 0) {
                // Use first canvas if no specific ID
                targetCanvas = manifestData.items[0];
            }
        }
        // IIIF v2 format
        else if (manifestData.sequences && manifestData.sequences[0]?.canvases) {
            const canvases = manifestData.sequences[0].canvases;
            if (canvasId) {
                targetCanvas = canvases.find(canvas => 
                    canvas["@id"] === canvasId || 
                    canvas["@id"].endsWith(`#${canvasId}`) ||
                    canvas["@id"].endsWith(`/${canvasId}`)
                );
            }
            if (!targetCanvas && canvases.length > 0) {
                targetCanvas = canvases[0];
            }
        }
        
        if (!targetCanvas) {
            throw new Error("No canvas found in manifest");
        }
        
        // Process the canvas data directly
        return await this.processDirectCanvasData(targetCanvas);
    }

    /**
     * Process canvas data that has annotation references
     * @param {Object} data - Canvas data with target reference
     * @returns {Promise<Object>} Processed canvas data
     */
    async processCanvasData(data) {
        const target = await fetch(data.target);
        
        if (!target.ok) {
            throw new Error(`Failed to fetch target data: ${target.status}`);
        }

        const targetData = await target.json();
        const canvasInfo = await this.extractImageInfo(targetData);
        
        // Fetch annotation data
        const annotations = await Promise.all(
            data.items.map(async (anno) => {
                try {
                    const line = await fetch(anno.id);
                    if (!line.ok) return null;
                    
                    const lineData = await line.json();
                    return {
                        target: lineData?.target?.selector?.value ?? lineData?.target,
                        text: lineData?.body?.value ?? "",
                        lineid: lineData?.id?.split("/")?.pop()
                    };
                } catch (error) {
                    console.warn(`Failed to fetch annotation ${anno.id}:`, error);
                    return null;
                }
            })
        );

        const validAnnotations = annotations.filter(anno => anno !== null);
        
        return { ...canvasInfo, annotations: validAnnotations };
    }

    /**
     * Process direct canvas data (from manifest or direct canvas)
     * @param {Object} canvasData - Direct canvas data
     * @returns {Promise<Object>} Processed canvas data
     */
    async processDirectCanvasData(canvasData) {
        const canvasInfo = await this.extractImageInfo(canvasData);
        
        // Look for annotations in the canvas
        let annotations = [];
        
        // IIIF v3 annotations
        if (canvasData.annotations) {
            // This would require additional processing for annotation pages
            console.log("Canvas has annotations - additional processing may be needed");
        }
        
        // For now, return with empty annotations if no annotation target is found
        return { ...canvasInfo, annotations };
    }

    /**
     * Extract image information from canvas data
     * @param {Object} canvasData - Canvas data
     * @returns {Object} Image URL, width, and height
     */
    async extractImageInfo(canvasData) {
        // Support both IIIF v2 and v3 formats
        let imgUrl = canvasData?.items?.[0]?.items?.[0]?.body?.id ?? 
                     canvasData?.images?.[0]?.resource?.["@id"] ??
                     canvasData?.images?.[0]?.resource?.id;
                      
        const imgWidth = canvasData?.width;
        const imgHeight = canvasData?.height;

        if (!imgUrl || !imgWidth || !imgHeight) {
            throw new Error("Missing required image data in IIIF canvas");
        }

        // Check if the image URL points to an info.json (IIIF Image API)
        const processedImageUrl = await this.processIIIFImageUrl(imgUrl, imgWidth, imgHeight);

        return { imgUrl: processedImageUrl, imgWidth, imgHeight };
    }

    /**
     * Process IIIF Image URL and handle info.json responses
     * @param {string} imgUrl - Original image URL
     * @param {number} maxWidth - Maximum width from canvas
     * @param {number} maxHeight - Maximum height from canvas
     * @returns {Promise<string>} Processed image URL
     */
    async processIIIFImageUrl(imgUrl, maxWidth, maxHeight) {
        try {
            // First, try to fetch the URL to see if it returns info.json
            const response = await fetch(imgUrl);
            
            if (!response.ok) {
                // If fetch fails, return original URL (might be a direct image)
                return imgUrl;
            }

            const contentType = response.headers.get('content-type');
            
            // Check if response is JSON (indicating info.json)
            if (contentType && contentType.includes('application/json')) {
                const infoData = await response.json();
                
                // Validate this is a IIIF Image API info.json
                if (this.isIIIFImageInfo(infoData)) {
                    return this.constructIIIFImageUrl(infoData, maxWidth, maxHeight);
                }
            }
            
            // If it's not JSON or not a valid info.json, return original URL
            return imgUrl;
            
        } catch (error) {
            console.warn('Error processing IIIF image URL:', error);
            // Fallback to original URL if processing fails
            return imgUrl;
        }
    }

    /**
     * Check if the data is a valid IIIF Image API info.json
     * @param {Object} data - JSON data to validate
     * @returns {boolean} True if valid IIIF Image API info
     */
    isIIIFImageInfo(data) {
        // Check for IIIF Image API v2 or v3 indicators
        return (
            // IIIF Image API v3
            (data.type === "ImageService3" || data["@type"] === "ImageService3") ||
            // IIIF Image API v2
            (data["@context"] && (
                data["@context"].includes("iiif.io/api/image/2") ||
                data["@context"].includes("iiif.io/api/image/3")
            )) ||
            // Basic validation - has required properties
            (data.width && data.height && data["@id"])
        );
    }

    /**
     * Construct a IIIF Image API URL from info.json data
     * @param {Object} infoData - IIIF Image API info.json data
     * @param {number} maxWidth - Maximum width constraint
     * @param {number} maxHeight - Maximum height constraint
     * @returns {string} Constructed IIIF Image URL
     */
    constructIIIFImageUrl(infoData, maxWidth, maxHeight) {
        const baseUrl = infoData["@id"] || infoData.id;
        const imageWidth = infoData.width;
        const imageHeight = infoData.height;
        
        if (!baseUrl) {
            throw new Error("No base URL found in IIIF Image API info");
        }

        // Calculate optimal size while maintaining aspect ratio
        const aspectRatio = imageWidth / imageHeight;
        let targetWidth = Math.min(maxWidth, imageWidth);
        let targetHeight = Math.min(maxHeight, imageHeight);
        
        // Adjust to maintain aspect ratio
        if (targetWidth / aspectRatio > targetHeight) {
            targetWidth = Math.floor(targetHeight * aspectRatio);
        } else {
            targetHeight = Math.floor(targetWidth / aspectRatio);
        }

        // Check supported sizes and profiles for optimal parameters
        const sizeParam = this.getBestSizeParameter(infoData, targetWidth, targetHeight);
        
        // Construct IIIF Image API URL: {baseUrl}/{region}/{size}/{rotation}/{quality}.{format}
        // Using full region, calculated size, no rotation, default quality, jpg format
        const imageUrl = `${baseUrl}/full/${sizeParam}/0/default.jpg`;
        
        console.log(`Constructed IIIF Image URL: ${imageUrl}`);
        return imageUrl;
    }

    /**
     * Determine the best size parameter for IIIF Image API URL
     * @param {Object} infoData - IIIF Image API info.json data
     * @param {number} targetWidth - Target width
     * @param {number} targetHeight - Target height
     * @returns {string} Size parameter for IIIF URL
     */
    getBestSizeParameter(infoData, targetWidth, targetHeight) {
        // Check if specific sizes are available
        if (infoData.sizes && Array.isArray(infoData.sizes)) {
            // Find the closest available size
            const availableSize = infoData.sizes.find(size => 
                size.width >= targetWidth && size.height >= targetHeight
            ) || infoData.sizes[infoData.sizes.length - 1]; // fallback to largest
            
            if (availableSize) {
                return `${availableSize.width},${availableSize.height}`;
            }
        }
        
        // Check profile/compliance for size restrictions
        const maxSize = this.getMaxAllowedSize(infoData);
        if (maxSize) {
            targetWidth = Math.min(targetWidth, maxSize.width);
            targetHeight = Math.min(targetHeight, maxSize.height);
        }
        
        // Use width,height format for explicit sizing
        return `${targetWidth},${targetHeight}`;
    }

    /**
     * Get maximum allowed size from IIIF Image API profile
     * @param {Object} infoData - IIIF Image API info.json data
     * @returns {Object|null} Maximum size object or null
     */
    getMaxAllowedSize(infoData) {
        if (infoData.profile && Array.isArray(infoData.profile)) {
            for (const profileItem of infoData.profile) {
                if (typeof profileItem === 'object' && profileItem.maxWidth && profileItem.maxHeight) {
                    return {
                        width: profileItem.maxWidth,
                        height: profileItem.maxHeight
                    };
                }
            }
        }
        return null;
    }
}

/**
 * UI Manager - Handles all user interface operations
 */
class UIManager {
    constructor(containerId = 'imageContainer') {
        this.container = document.getElementById(containerId);
        this.currentAnnotations = [];
        this.eventHandlers = new Map();
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
        `;
        this.container.style.backgroundImage = "none";
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
        `;
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
            `;
            this.container.style.backgroundImage = "none";
            
            const img = document.getElementById("canvasImage");
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("Failed to load image"));
        });
    }

    /**
     * Create and render annotation overlays
     * @param {Array} annotations - Array of annotation objects
     * @param {number} imgWidth - Original image width
     * @param {number} imgHeight - Original image height
     */
    renderAnnotations(annotations, imgWidth, imgHeight) {
        this.currentAnnotations = annotations;
        
        annotations.forEach((anno, index) => {
            if (!anno.target) return;

            const { x, y, w, h } = new IIIFDataService().parseXYWH(anno.target);
            
            // Calculate percentages for responsive positioning
            const left = (x / imgWidth) * 100;
            const top = (y / imgHeight) * 100;
            const width = (w / imgWidth) * 100;
            const height = (h / imgHeight) * 100;

            const box = this.createAnnotationBox(anno, index, left, top, width, height);
            this.container.appendChild(box);
        });
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
        const box = document.createElement("div");
        box.className = "overlayBox";
        box.style.left = `${left}%`;
        box.style.top = `${top}%`;
        box.style.width = `${width}%`;
        box.style.height = `${height}%`;
        box.title = anno.text || "Annotation";
        box.dataset.lineserverid = anno.lineid;
        box.dataset.lineid = index;
        
        // Add accessibility attributes
        box.setAttribute('role', 'button');
        box.setAttribute('tabindex', '0');
        box.setAttribute('aria-label', `Annotation ${index + 1}: ${anno.text || 'No text available'}`);

        // Add event listeners
        this.attachAnnotationEvents(box, anno, index);

        return box;
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
            this.showTooltip(box, anno.text);
        });

        // Mouse leave - hide tooltip
        box.addEventListener("mouseleave", () => {
            this.hideTooltip(box);
        });

        // Click handler
        const clickHandler = () => {
            this.selectAnnotation(box, anno.lineid, index);
        };

        box.addEventListener("click", clickHandler);
        
        // Keyboard support
        box.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                clickHandler();
            }
        });
    }

    /**
     * Show tooltip for annotation
     * @param {HTMLElement} box - The annotation box
     * @param {string} text - Tooltip text
     */
    showTooltip(box, text) {
        if (!text || box.querySelector(".tooltip")) return;
        
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.textContent = text;
        tooltip.setAttribute('role', 'tooltip');
        box.appendChild(tooltip);
    }

    /**
     * Hide tooltip for annotation
     * @param {HTMLElement} box - The annotation box
     */
    hideTooltip(box) {
        const tooltip = box.querySelector(".tooltip");
        if (tooltip) {
            tooltip.remove();
        }
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
            el.classList.remove('clicked');
            el.setAttribute('aria-selected', 'false');
        });
        
        // Add selection to current box
        box.classList.add('clicked');
        box.setAttribute('aria-selected', 'true');
        
        // Notify parent window
        if (window.parent) {
            window.parent.postMessage({
                type: "RETURN_LINE_ID",
                lineid: lineid,
                lineIndex: index
            }, "*");
        }
    }

    /**
     * Clear all content and reset container
     */
    clear() {
        this.container.innerHTML = "";
        this.currentAnnotations = [];
    }
}

/**
 * Message Handler - Manages communication with parent window
 */
class MessageHandler {
    constructor(pageViewer) {
        this.pageViewer = pageViewer;
        this.setupMessageListener();
    }

    /**
     * Set up message listener for parent window communication
     */
    setupMessageListener() {
        window.addEventListener("message", (event) => {
            this.handleMessage(event);
        });
    }

    /**
     * Handle incoming messages from parent window
     * @param {MessageEvent} event - The message event
     */
    handleMessage(event) {
        if (!event.data?.type) return;

        switch (event.data.type) {
            case "CANVAS_URL":
                if (event.data.canvasUrl) {
                    this.pageViewer.loadCanvas(event.data.canvasUrl);
                }
                break;
            case "MANIFEST_CANVAS":
                if (event.data.manifestUrl) {
                    this.pageViewer.loadCanvasFromManifest(
                        event.data.manifestUrl, 
                        event.data.canvasId
                    );
                }
                break;
            default:
                console.warn("Unknown message type:", event.data.type);
        }
    }
}

/**
 * Main Page Viewer Class - Orchestrates all components
 */
class PageViewer {
    constructor(containerId = 'imageContainer') {
        this.dataService = new IIIFDataService();
        this.uiManager = new UIManager(containerId);
        this.messageHandler = new MessageHandler(this);
    }

    /**
     * Load and display a IIIF canvas
     * @param {string} canvasUrl - URL to the IIIF canvas or manifest containing the canvas
     */
    async loadCanvas(canvasUrl) {
        if (!canvasUrl) {
            console.warn("No canvas URL provided");
            this.uiManager.showError("No canvas URL provided");
            return;
        }

        try {
            this.uiManager.showLoading("Loading canvas data...");
            
            const canvasData = await this.dataService.fetchCanvasData(canvasUrl);
            if (!canvasData) {
                throw new Error("No canvas data received");
            }

            const { imgUrl, annotations, imgWidth, imgHeight } = canvasData;
            
            // Load the image first
            await this.uiManager.renderImage(imgUrl);
            
            // Then render annotations
            this.uiManager.renderAnnotations(annotations, imgWidth, imgHeight);
            
        } catch (error) {
            console.error("Error loading canvas:", error);
            this.uiManager.showError(`Failed to load canvas: ${error.message}`);
        }
    }

    /**
     * Load a specific canvas from a manifest
     * @param {string} manifestUrl - URL to the IIIF manifest
     * @param {string} canvasId - ID of the specific canvas within the manifest
     */
    async loadCanvasFromManifest(manifestUrl, canvasId) {
        const canvasUrl = canvasId ? `${manifestUrl}#${canvasId}` : manifestUrl;
        await this.loadCanvas(canvasUrl);
    }

    /**
     * Initialize the page viewer
     */
    init() {
        // Check if canvas URL is provided via URL parameters or other means
        const urlParams = new URLSearchParams(window.location.search);
        const canvasUrl = urlParams.get('canvas');
        
        if (canvasUrl) {
            this.loadCanvas(canvasUrl);
        } else {
            this.uiManager.showLoading("Waiting for canvas URL from parent window...");
        }
    }
}

// Initialize the page viewer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const viewer = new PageViewer();
    viewer.init();
});
