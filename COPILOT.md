# AI Development Guide for IIIF Page Viewer

This guide provides specific instructions for AI assistants (like GitHub Copilot, ChatGPT, Claude, etc.) working on the IIIF Page Viewer project.

## Project Overview

**Type**: JavaScript-based IIIF (International Image Interoperability Framework) viewer  
**Architecture**: Modular ES6 classes with no build dependencies  
**Primary Use**: Embedded iframe component for displaying IIIF images and annotations  
**Standards**: IIIF Presentation API v2/v3, IIIF Image API v2/v3  

## Quick Setup for AI Development

```bash
# Clone and serve locally
git clone https://github.com/CenterForDigitalHumanities/Page-Viewer.git
cd Page-Viewer
python3 -m http.server 8000
# Test at: http://localhost:8000?canvas=[IIIF_MANIFEST_URL]
```

## Architecture Pattern

The codebase follows a **modular class-based architecture**:

```javascript
PageViewer (orchestrator)
├── IIIFDataService (data fetching/parsing)
├── UIManager (rendering/user interaction)
└── MessageHandler (iframe communication)
```

### Key Design Principles
- **No build tools**: Pure ES6 modules, no transpilation
- **Iframe-first**: Designed for embedding in other applications
- **IIIF compliance**: Strict adherence to IIIF standards
- **Accessibility**: WCAG 2.1 AA compliance required
- **Error resilience**: Graceful degradation for failed requests

## Development Guidelines for AI

### Code Style Requirements

```javascript
// ✅ Preferred patterns
class ExampleClass {
    /**
     * JSDoc for all public methods
     * @param {string} param - Description
     * @returns {Promise<Object>} Description
     */
    async methodName(param) {
        try {
            // Handle errors gracefully
            const result = await this.someOperation(param)
            return result
        } catch (error) {
            console.error("Context-specific error message:", error)
            throw new Error("User-friendly error message")
        }
    }
}

// ✅ Error handling pattern
this.uiManager.showError("Failed to load canvas: " + error.message)

// ✅ Accessibility requirements
element.setAttribute('aria-label', 'Descriptive label')
element.setAttribute('role', 'appropriate-role')
```

### IIIF-Specific Implementation Notes

#### IIIF Manifest Parsing
```javascript
// Handle both v2 and v3 formats
const canvases = manifest['@type'] === 'sc:Manifest' 
    ? manifest.sequences?.[0]?.canvases || []  // v2
    : manifest.items || []                     // v3

// Coordinate parsing (XYWH format)
const coords = selector.value || selector['@value'] || selector
// Expected format: "xywh=x,y,w,h" or "x,y,w,h"
```

#### Image API Integration
```javascript
// Auto-detect IIIF Image API info.json
if (response.headers.get('content-type')?.includes('application/json')) {
    const info = await response.json()
    if (info['@context']?.includes('iiif.io')) {
        // Construct optimized image URL
        return `${baseUrl}/full/${width},${height}/0/default.jpg`
    }
}
```

### Testing Requirements

**Essential test scenarios for AI to verify**:
```bash
# Test with real IIIF content
http://localhost:8000?canvas=https://iiif.library.nulib.northwestern.edu/iiif/2/180682d0-4d51-0132-412f-0050569601ca-8/manifest.json

# Test iframe communication
parent.postMessage({type: "CANVAS_URL", canvasUrl: "..."}, "*")

# Test error handling
http://localhost:8000?canvas=https://invalid-url.com/manifest.json
```

### Common Patterns for AI to Follow

#### 1. Adding New Features
```javascript
// 1. Extend appropriate class
class UIManager {
    async newFeature(params) {
        // 2. Add loading state
        this.showLoading("Loading new feature...")
        
        try {
            // 3. Implement feature
            const result = await this.processFeature(params)
            
            // 4. Update UI
            this.updateDisplay(result)
            
        } catch (error) {
            // 5. Handle errors gracefully
            console.error("Feature error:", error)
            this.showError("Feature failed: " + error.message)
        }
    }
}
```

#### 2. IIIF Data Processing
```javascript
// Always handle both v2/v3 formats
function extractCanvasData(canvas) {
    const id = canvas['@id'] || canvas.id
    const images = canvas.images || canvas.items || []
    const annotations = canvas.otherContent || canvas.annotations || []
    
    // Extract with fallbacks
    return { id, images, annotations }
}
```

#### 3. UI Updates
```javascript
// Follow accessibility patterns
function createAnnotationElement(annotation) {
    const element = document.createElement('div')
    element.className = 'annotation-overlay'
    element.setAttribute('role', 'button')
    element.setAttribute('tabindex', '0')
    element.setAttribute('aria-label', `Annotation: ${annotation.label}`)
    
    // Add keyboard support
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            this.handleAnnotationClick(annotation)
        }
    })
    
    return element
}
```

## Debugging Tips for AI

### Console Debugging
```javascript
// Enable verbose logging
console.log("IIIF Data:", { manifest, canvas, annotations })
console.log("Image dimensions:", { width, height, aspectRatio })
console.log("Coordinate mapping:", { original, scaled, percentage })
```

### Common Issues and Solutions

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| Images not loading | CORS or invalid URL | Check network tab, verify IIIF Image API |
| Annotations misaligned | Coordinate calculation error | Verify XYWH parsing and aspect ratio |
| Parent communication fails | PostMessage syntax | Check message format and origin |
| Accessibility violations | Missing ARIA attributes | Add role, aria-label, tabindex |

## File Modification Guidelines

### High-change files (modify freely)
- `ui-manager.js` - UI features and styling
- `styles.css` - Visual improvements
- Documentation files

### Medium-change files (modify carefully)
- `iiif-data-service.js` - IIIF parsing logic
- `viewer.js` - Main orchestration
- `index.html` - Structure changes

### Low-change files (minimal changes only)
- `message-handler.js` - Core communication logic

## Quality Checklist for AI

Before submitting changes, verify:

- [ ] Code follows ES6 module patterns
- [ ] All public methods have JSDoc comments
- [ ] Error handling includes user-friendly messages
- [ ] IIIF v2 and v3 compatibility maintained
- [ ] Accessibility attributes present (aria-label, role, tabindex)
- [ ] Manual testing with real IIIF manifest
- [ ] Browser console shows no errors
- [ ] Responsive design works on mobile/desktop
- [ ] iframe communication tested if relevant

## Resources for AI Context

**IIIF Standards References**:
- [IIIF Presentation API](https://iiif.io/api/presentation/)
- [IIIF Image API](https://iiif.io/api/image/)

**Example IIIF Manifests for Testing**:
- Northwestern University: `https://iiif.library.nulib.northwestern.edu/iiif/2/[id]/manifest.json`
- Digital Public Library of America: Various manifests available
- Harvard Art Museums: IIIF-compliant collections

**Key Dependencies to Understand**:
- ES6 Modules (import/export)
- Fetch API for HTTP requests
- PostMessage API for iframe communication
- Canvas/Image manipulation for coordinate mapping

This guide should provide sufficient context for AI assistants to contribute effectively while maintaining code quality and IIIF compliance standards.