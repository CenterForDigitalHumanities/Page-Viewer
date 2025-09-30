/**
 * IIIF Data Service - Handles all IIIF-related data fetching and parsing
 * Supports IIIF Presentation API v2/v3 and IIIF Image API v2/v3
 * 
 * @author Priyal Patel @mepripri
 * @author Patrick Cuba @cubap
 */
export class IIIFDataService {
    /**
     * Parse XYWH coordinate string into object
     * @param {string} target - XYWH coordinate string
     * @returns {Object} Parsed coordinates {x, y, w, h}
     */
    parseXYWH(target) {
        const xywh = target.replace("xywh=pixel:", "").split(",").map(Number)
        return { x: xywh[0], y: xywh[1], w: xywh[2], h: xywh[3] }
    }

    /**
     * Validate if a string is a well-formed URL
     * @param {string} str - String to validate
     * @returns {boolean} True if valid URL, false otherwise
     */
    isValidUrl(str) {
        try {
            new URL(str)
            return true
        } catch (e) {
            return false
        }
    }

    isValidJSON(input) {
        try {
            const json = (typeof input === "string") ? JSON.parse(input) : JSON.parse(JSON.stringify(input))
            return true
        }
        catch (e) {
            return false
        }
    }

    /**
     * Fetch canvas data from URL or return if already an object
     * @param {string|Object} canvas - Canvas URL or object
     * @returns {Promise<Object>} Canvas data
     */
    async getSpecificTypeData(type) {
        if (!type) {
            throw new Error("No canvas/manifest/annotationPage/annotation provided")
        }

        let typeData = null
        if (typeof type === "string" && this.isValidUrl(type)) {
            const response = await fetch(type)
            if (!response.ok) {
                throw new Error(`Failed to fetch canvas/manifest/annotationPage/annotation data from URL: ${response.status}`)
            }
            typeData = await response.json()
        } else if (typeof type === "object" && this.isValidJSON(type)) {
            typeData = type
        } else {
            throw new Error("Invalid canvas/manifest/annotationPage/annotation format")
        }
        return typeData
    }
    /**
     * Fetch and parse IIIF canvas data with annotations
     * @param {string|Object} canvas - Canvas URL or object
     * @param {string|Object} manifest - Manifest URL or object (optional)
     * @param {string|Object} annotationPage - Annotation Page URL or object (optional)
     * @returns 
     */
    async fetchPageViewerData(canvas, manifest, annotationPage) {
        try {
            const canvasData = await this.getSpecificTypeData(canvas)
            const manifestData = manifest ? await this.getSpecificTypeData(manifest) : null
            const annotationPageData = annotationPage ? await this.getSpecificTypeData(annotationPage) : null

            if (manifestData) {
                if (annotationPageData) {
                    return await this.extractCanvasFromManifest(manifestData, canvasData, annotationPageData)
                } else {
                    return await this.extractCanvasFromManifest(manifestData, canvasData, { items: [] })
                }
            } else if (canvasData) {
                if (annotationPageData) {
                    return await this.processDirectCanvasData(canvasData, annotationPageData)
                } else if (canvasData.items && canvasData.items.length > 0 && canvasData.items[0].target) {
                    return await this.processPageData(canvasData)
                } else {
                    return await this.processDirectCanvasData(canvasData, { items: [] })
                }
            } else {
                throw new Error("Unsupported IIIF data structure")
            }

        } catch (error) {
            console.error("Error fetching IIIF data:", error)
            throw error
        }
    }

     /**
     * Extract canvas data from a IIIF manifest
     * @param {Object} manifestData - The manifest data
     * @param {Object} canvasData - The canvas data or reference
     * @param {Object} annotationPageData - Annotation page data (if any)
     * @returns {Promise<Object>} Processed canvas data
     */
    async extractCanvasFromManifest(manifestData, canvasData, annotationPageData) {
        let targetCanvas = null
        let canvasID = canvasData.id || canvasData["@id"]

        // IIIF v3 format
        if (manifestData.items) {
            // Find specific canvas by ID
            targetCanvas = manifestData.items.find(item => item.id === canvasID || item["@id"] === canvasID)
            targetCanvas ??= manifestData.items[0]
        }
        // IIIF v2 format
        else if (manifestData.sequences?.[0]?.canvases) {
            const canvases = manifestData.sequences[0].canvases
            targetCanvas = canvases.find(canvas => canvas["@id"] === canvasID)
            targetCanvas ??= canvases[0]
        }

        if (!targetCanvas) {
            throw new Error("No canvas found in manifest")
        }

        return await this.processDirectCanvasData(targetCanvas, annotationPageData)
    }

     /**
     * Process direct canvas data (from manifest or direct canvas)
     * @param {Object} canvasData - The canvas data
     * @param {Object} annotationPageData - Annotation page data (if any)
     * @returns {Promise<Object>} Processed canvas data
     */
    async processDirectCanvasData(canvasData, annotationPageData) {
        const canvasInfo = await this.extractImageInfo(canvasData)
        let annotations = []

        // IIIF v3 annotations
        if (annotationPageData.items) {
            annotations = await Promise.all(
                annotationPageData.items.map(async (anno) => {
                    return {
                        target: anno?.target?.selector?.value ?? anno?.target,
                        text: anno?.body?.value ?? "",
                        lineid: anno?.id,
                    }
                })
            ).then((results) => results.flat())
        }

        return { ...canvasInfo, annotations }
    }

    /**
     * Process page data that has annotation references
     * @param {Object} data - Page data with target reference
     * @returns {Promise<Object>} Processed page data
     */
    async processPageData(data) {
        const target = await fetch(data.target)
        
        if (!target.ok) {
            throw new Error(`Failed to fetch target data: ${target.status}`)
        }

        const targetData = await target.json()
        const canvasInfo = await this.extractImageInfo(targetData)

        if (data.items.length === 0) {
            return { ...canvasInfo, annotations: [] }
        }
        
        // Fetch annotation data
        const annotations = await Promise.all(
            data.items.map(async (anno) => {
                try {
                    const line = await fetch(anno.id)
                    if (!line.ok) return null
                    
                    const lineData = await line.json()
                    return {
                        target: lineData?.target?.selector?.value ?? lineData?.target,
                        text: lineData?.body?.value ?? "",
                        lineid: lineData?.id
                    }
                } catch (error) {
                    console.warn(`Failed to fetch annotation ${anno.id}:`, error)
                    return null
                }
            })
        )

        const validAnnotations = annotations.filter(anno => anno !== null)
        
        return { ...canvasInfo, annotations: validAnnotations }
    }

    /**
     * Extract image information from canvas data
     * @param {Object} canvasData - Canvas data
     * @returns {Promise<Object>} Image URL, width, and height
     */
    async extractImageInfo(canvasData) {
        // Support both IIIF v2 and v3 formats
        const imgUrl = canvasData?.items?.[0]?.items?.[0]?.body?.id ?? 
                       canvasData?.images?.[0]?.resource?.["@id"] ??
                       canvasData?.images?.[0]?.resource?.id
                      
        const imgWidth = canvasData?.width
        const imgHeight = canvasData?.height

        if (!imgUrl || !imgWidth || !imgHeight) {
            throw new Error("Missing required image data in IIIF canvas")
        }

        // Check if the image URL points to an info.json (IIIF Image API)
        const processedImageUrl = await this.processIIIFImageUrl(imgUrl, imgWidth, imgHeight)

        return { imgUrl: processedImageUrl, imgWidth, imgHeight }
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
            const response = await fetch(imgUrl)
            
            if (!response.ok) {
                // If fetch fails, return original URL (might be a direct image)
                return imgUrl
            }

            const contentType = response.headers.get('content-type')
            
            // Check if response is JSON (indicating info.json)
            if (contentType?.includes('application/json') || contentType?.includes('application/ld+json')) {
                const infoData = await response.json()
                
                // Validate this is a IIIF Image API info.json
                if (this.isIIIFImageInfo(infoData)) {
                    return this.constructIIIFImageUrl(infoData, maxWidth, maxHeight)
                }
            }
            
            // If it's not JSON or not a valid info.json, return original URL
            return imgUrl
            
        } catch (error) {
            console.warn('Error processing IIIF image URL:', error)
            // Fallback to original URL if processing fails
            return imgUrl
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
        )
    }

    /**
     * Construct a IIIF Image API URL from info.json data
     * @param {Object} infoData - IIIF Image API info.json data
     * @param {number} maxWidth - Maximum width constraint
     * @param {number} maxHeight - Maximum height constraint
     * @returns {string} Constructed IIIF Image URL
     */
    constructIIIFImageUrl(infoData, maxWidth, maxHeight) {
        const baseUrl = infoData["@id"] || infoData.id
        const imageWidth = infoData.width
        const imageHeight = infoData.height
        
        if (!baseUrl) {
            throw new Error("No base URL found in IIIF Image API info")
        }

        // Calculate optimal size while maintaining aspect ratio
        const aspectRatio = imageWidth / imageHeight
        let targetWidth = Math.min(maxWidth, imageWidth)
        let targetHeight = Math.min(maxHeight, imageHeight)
        
        // Adjust to maintain aspect ratio
        if (targetWidth / aspectRatio > targetHeight) {
            targetWidth = Math.floor(targetHeight * aspectRatio)
        } else {
            targetHeight = Math.floor(targetWidth / aspectRatio)
        }

        // Check supported sizes and profiles for optimal parameters
        const sizeParam = this.getBestSizeParameter(infoData, targetWidth, targetHeight)
        
        // Construct IIIF Image API URL: {baseUrl}/{region}/{size}/{rotation}/{quality}.{format}
        // Using full region, calculated size, no rotation, default quality, jpg format
        const imageUrl = `${baseUrl}/full/${sizeParam}/0/default.jpg`
        return imageUrl
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
            ) ?? infoData.sizes[infoData.sizes.length - 1] // fallback to largest
            
            if (availableSize) {
                return `${availableSize.width},${availableSize.height}`
            }
        }
        
        // Check profile/compliance for size restrictions
        const maxSize = this.getMaxAllowedSize(infoData)
        if (maxSize) {
            targetWidth = Math.min(targetWidth, maxSize.width)
            targetHeight = Math.min(targetHeight, maxSize.height)
        }
        
        // Use width,height format for explicit sizing
        return `${targetWidth},${targetHeight}`
    }

    /**
     * Get maximum allowed size from IIIF Image API profile
     * @param {Object} infoData - IIIF Image API info.json data
     * @returns {Object|null} Maximum size object or null
     */
    getMaxAllowedSize(infoData) {
        if (!infoData.profile || !Array.isArray(infoData.profile)) return null
        
        for (const profileItem of infoData.profile) {
            if (typeof profileItem === 'object' && profileItem.maxWidth && profileItem.maxHeight) {
                return {
                    width: profileItem.maxWidth,
                    height: profileItem.maxHeight
                }
            }
        }
        return null
    }
}
