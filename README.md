# IIIF Page Viewer

A lightweight IIIF (International Image Interoperability Framework) image viewing tool designed for inclusion as an iframe element in other documents. This viewer displays IIIF canvases with interactive annotation overlays.

## JavaScript Architecture

The JavaScript is organized into four main classes:

### `IIIFDataService`

- Handles all IIIF-related data fetching and parsing
- Supports both IIIF v2 and v3 manifest formats
- Manages coordinate parsing (XYWH format)
- Includes error handling for failed requests

### `UIManager`

- Manages all user interface operations
- Handles image rendering and annotation overlay creation
- Manages tooltips, selection states, and user interactions
- Includes accessibility features (ARIA labels, keyboard navigation)

### `MessageHandler`

- Manages communication with parent windows via postMessage API
- Handles incoming canvas URL requests
- Extensible for additional message types

### `PageViewer`

- Main orchestrator class that coordinates all components
- Provides the public API for loading canvases
- Manages application lifecycle and initialization

## Features

- **Responsive Design**: Scales properly within iframe containers
- **Accessibility**: Full keyboard navigation and screen reader support
- **Error Handling**: Graceful degradation with user-friendly error messages
- **Loading States**: Visual feedback during data fetching
- **Interactive Annotations**: Clickable overlays with hover tooltips
- **Parent Communication**: Sends annotation selection events to parent window

## Usage

### As an iframe

```html
<iframe src="view-full-page-iframe.html" width="800" height="600"></iframe>
```

### Communication with Parent Window

The viewer supports multiple ways to load IIIF content via messages from the parent window:

#### Direct Canvas URL

```javascript
// Send direct canvas URL to iframe
iframe.contentWindow.postMessage({
    type: "CANVAS_URL",
    canvasUrl: "https://example.com/path/to/canvas/data"
}, "*");
```

#### Manifest with Canvas Reference

```javascript
// Send manifest URL with canvas fragment identifier
iframe.contentWindow.postMessage({
    type: "CANVAS_URL",
    canvasUrl: "https://example.com/manifest.json#canvas-id"
}, "*");

// Or use separate manifest and canvas ID
iframe.contentWindow.postMessage({
    type: "MANIFEST_CANVAS",
    manifestUrl: "https://example.com/manifest.json",
    canvasId: "canvas-id"  // Optional - uses first canvas if omitted
}, "*");
```

#### Listen for Events

```javascript
// Listen for annotation selection events
window.addEventListener("message", (event) => {
    if (event.data.type === "RETURN_LINE_ID") {
        console.log("Selected annotation:", event.data.lineid, event.data.lineIndex);
    }
});
```

### Direct Canvas Loading

You can also load a canvas directly via URL parameter:

```text
view-full-page-iframe.html?canvas=https://example.com/path/to/canvas/manifest
```

The canvas parameter supports:

- Direct canvas data URLs
- Manifest URLs (uses first canvas)
- Manifest URLs with fragment identifiers: `manifest.json#canvas-id`

## Browser Support

- Modern browsers with ES6+ support
- Fetch API support required
- PostMessage API for iframe communication

## IIIF Compatibility

- IIIF Presentation API v2.x
- IIIF Presentation API v3.x
- Supports standard XYWH coordinate selectors

## Development

The modular architecture makes it easy to:

- **Extend functionality**: Add new classes or methods
- **Modify styling**: Edit `styles.css` for visual changes
- **Add message types**: Extend `MessageHandler` for new communication patterns
- **Customize UI**: Modify `UIManager` for different interaction patterns
