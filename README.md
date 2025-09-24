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
- **IIIF Image API Support**: Automatically detects and handles info.json responses

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

### IIIF Image API Support

The viewer automatically detects when image URLs point to IIIF Image API info.json files and constructs optimized image URLs:

- **Automatic Detection**: Checks if image URLs return JSON with IIIF Image API info
- **Size Optimization**: Calculates optimal image dimensions while maintaining aspect ratio
- **Profile Compliance**: Respects size limitations from IIIF Image API profiles
- **Fallback Handling**: Falls back to original URLs if IIIF Image API processing fails

Example flow:

1. Canvas references image: `https://example.com/iiif/image123`
2. Viewer detects this returns info.json with IIIF Image API data
3. Constructs optimized URL: `https://example.com/iiif/image123/full/800,600/0/default.jpg`

## Browser Support

- Modern browsers with ES6+ support
- Fetch API support required
- PostMessage API for iframe communication

## IIIF Compatibility

- **IIIF Presentation API** v2.x and v3.x
- **IIIF Image API** v2.x and v3.x (automatic info.json handling)
- Supports standard XYWH coordinate selectors
- Automatic image URL construction from IIIF Image API info.json responses

## Contributing

We welcome contributions from the community! This project is maintained by the [Center for Digital Humanities](https://digitalhumanities.wustl.edu/) at Washington University in St. Louis.

### Quick Start for Contributors

1. **Fork and clone** the repository
2. **Set up development environment**: See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed instructions
3. **Read the contribution guidelines**: [CONTRIBUTING.md](CONTRIBUTING.md)
4. **Check out the AI development guide**: [COPILOT.md](COPILOT.md) for AI assistants

### Ways to Contribute

- 🐛 **Report bugs** using our [issue templates](.github/ISSUE_TEMPLATE/)
- 💡 **Suggest features** for IIIF functionality improvements
- 📝 **Improve documentation** and examples
- 🔧 **Submit code** for bug fixes and new features
- 🧪 **Test with IIIF manifests** from various institutions
- ♿ **Enhance accessibility** features

### Development

The modular architecture makes it easy to:

- **Extend functionality**: Add new classes or methods
- **Modify styling**: Edit `styles.css` for visual changes
- **Add message types**: Extend `MessageHandler` for new communication patterns
- **Customize UI**: Modify `UIManager` for different interaction patterns

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development instructions.

## Community and Support

- 📋 **Issues**: Report bugs and request features via [GitHub Issues](https://github.com/CenterForDigitalHumanities/Page-Viewer/issues)
- 💬 **Discussions**: Join conversations in [GitHub Discussions](https://github.com/CenterForDigitalHumanities/Page-Viewer/discussions)
- 🏛️ **Institution**: [Center for Digital Humanities](https://digitalhumanities.wustl.edu/)
- 🌐 **IIIF Community**: Connect with the broader [IIIF community](https://iiif.io/community/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **IIIF Community**: For developing and maintaining the IIIF standards
- **Contributors**: All developers who have contributed to this project
- **Digital Humanities Community**: For supporting open source tools for cultural heritage
