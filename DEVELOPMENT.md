# Development Guide

This guide provides detailed instructions for setting up a development environment and contributing to the IIIF Page Viewer project.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/CenterForDigitalHumanities/Page-Viewer.git
cd Page-Viewer

# Start development server
python3 -m http.server 8000

# Open in browser
# http://localhost:8000?canvas=https://example.com/iiif/manifest.json
```

## Development Environment Setup

### Prerequisites

#### Required
- **Modern Web Browser**: Chrome 88+, Firefox 78+, Safari 14+, or Edge 88+
- **HTTP Server**: Any local server (Python, Node.js, PHP, etc.)
- **Git**: For version control
- **Text Editor/IDE**: VS Code, WebStorm, or similar with JavaScript support

#### Recommended
- **Browser Developer Tools**: Familiar with debugging JavaScript
- **IIIF Knowledge**: Basic understanding of IIIF standards (helpful but not required)

### Local Server Options

#### Python (Recommended)
```bash
# Python 3
python3 -m http.server 8000

# Python 2 (if needed)
python -m SimpleHTTPServer 8000
```

#### Node.js
```bash
# Install serve globally
npm install -g serve

# Serve current directory
serve -p 8000
```

#### PHP
```bash
php -S localhost:8000
```

#### Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Project Architecture

### File Structure
```
Page-Viewer/
├── index.html              # Main HTML entry point
├── viewer.js              # Main orchestrator class
├── iiif-data-service.js   # IIIF data handling
├── ui-manager.js          # UI rendering and interactions
├── message-handler.js     # Parent window communication
├── styles.css             # All styling
├── README.md              # Project overview
├── CONTRIBUTING.md        # Contribution guidelines
├── COPILOT.md            # AI development guide
├── DEVELOPMENT.md         # This file
└── .github/               # GitHub templates and workflows
```

### Module Dependencies
```
PageViewer (main orchestrator)
├── IIIFDataService (data layer)
├── UIManager (presentation layer)
└── MessageHandler (communication layer)
```

## Development Workflow

### 1. Setting Up Your Branch

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Or bug fix branch
git checkout -b fix/issue-description
```

### 2. Development Process

#### File Watching Setup
For automatic reload during development:

```bash
# Using nodemon (if you have Node.js)
npm install -g nodemon
nodemon --exec "echo 'Files changed, refresh browser'" --watch . --ext js,html,css

# Manual approach: refresh browser after changes
```

#### Testing Changes
1. **Manual Testing**: Test functionality in browser
2. **Cross-Browser Testing**: Test in different browsers
3. **IIIF Testing**: Test with various IIIF manifests
4. **Accessibility Testing**: Use screen reader, keyboard navigation

### 3. Code Quality

#### JavaScript Standards
- Use ES6+ features (classes, modules, async/await)
- Follow consistent indentation (2 spaces)
- Use descriptive variable and function names
- Include JSDoc comments for public methods
- Handle errors gracefully

#### Example Code Structure
```javascript
/**
 * Example class following project patterns
 */
class ExampleClass {
    constructor(options = {}) {
        this.option = options.option || 'default'
    }

    /**
     * Example method with JSDoc
     * @param {string} param - Description of parameter
     * @returns {Promise<Object>} Description of return value
     */
    async exampleMethod(param) {
        try {
            // Implementation here
            const result = await this.processData(param)
            return result
        } catch (error) {
            console.error('Example method error:', error)
            throw new Error(`Failed to process: ${error.message}`)
        }
    }
}
```

## Testing

### Manual Testing Checklist

#### Basic Functionality
- [ ] Page loads without errors
- [ ] IIIF manifest loads correctly
- [ ] Images display properly
- [ ] Annotations render correctly
- [ ] Error messages display appropriately

#### IIIF Compatibility
- [ ] IIIF Presentation API v2 manifests work
- [ ] IIIF Presentation API v3 manifests work
- [ ] IIIF Image API integration functions
- [ ] Various manifest structures supported
- [ ] Canvas selection works (fragment identifiers)

#### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest) 
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

#### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces content properly
- [ ] Focus indicators are visible
- [ ] ARIA labels are appropriate
- [ ] Color contrast meets standards

#### iframe Integration
- [ ] Loads correctly in iframe
- [ ] PostMessage communication works
- [ ] URL parameters handled properly
- [ ] Parent window receives events

### Test IIIF Manifests

#### Basic Testing
```
# Simple IIIF v3 manifest
https://iiif.io/api/presentation/3.0/example/fixtures/001/manifest.json

# IIIF v2 manifest with annotations
https://iiif.library.nulib.northwestern.edu/iiif/2/180682d0-4d51-0132-412f-0050569601ca-8/manifest.json
```

#### Advanced Testing
Test with manifests from various institutions:
- Harvard Art Museums
- Digital Public Library of America
- Europeana
- Bodleian Libraries
- Stanford Libraries

### Performance Testing

#### Network Conditions
- Test with slow connections
- Test with failed network requests
- Test with large image files
- Test with many annotations

#### Browser Performance
- Check memory usage
- Monitor for memory leaks
- Test with DevTools throttling

## Debugging

### Browser Developer Tools

#### Console Debugging
```javascript
// Add temporary debugging
console.log('IIIF Data:', manifest)
console.log('Canvas dimensions:', { width, height })
console.log('Annotation coordinates:', coordinates)
```

#### Network Debugging
- Monitor Network tab for failed requests
- Check CORS issues
- Verify IIIF manifest structure
- Test Image API responses

#### Common Issues and Solutions

| Issue | Symptoms | Solution |
|-------|----------|-----------|
| CORS errors | Network failures, console errors | Check IIIF service CORS headers |
| Images not loading | Broken image icons | Verify image URLs and IIIF Image API |
| Annotations misaligned | Overlays in wrong positions | Check coordinate parsing and scaling |
| iframe communication fails | No parent window messages | Verify PostMessage syntax and origins |

### Debugging Workflow
1. **Reproduce the issue** in development environment
2. **Check browser console** for errors
3. **Inspect network requests** for failures
4. **Test with known-good IIIF manifests**
5. **Isolate the problem** to specific component
6. **Create minimal test case**
7. **Fix and verify** solution

## Code Style and Standards

### ESLint Configuration (Optional)
If you want to add linting:

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "never"]
  }
}
```

### CSS Standards
- Use semantic class names
- Follow BEM methodology where appropriate
- Mobile-first responsive design
- Accessibility-compliant colors and contrast

### HTML Standards
- Use semantic HTML5 elements
- Include proper ARIA attributes
- Ensure keyboard accessibility
- Validate markup when possible

## Deployment

### Production Considerations
- Minify JavaScript and CSS for production
- Test with production IIIF services
- Verify HTTPS compatibility
- Test iframe embedding scenarios

### Static Site Deployment
This project can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Any web server

## Advanced Development

### Adding New Features

#### 1. Plan the Feature
- Review IIIF specifications
- Design the API/interface
- Consider backward compatibility
- Plan testing approach

#### 2. Implement
- Follow existing patterns
- Add appropriate error handling
- Include JSDoc documentation
- Test thoroughly

#### 3. Integration
- Update main classes as needed
- Ensure proper module imports
- Test iframe communication impact
- Verify accessibility

### Extending IIIF Support

#### Adding New IIIF Properties
1. Update `IIIFDataService` parsing
2. Modify `UIManager` rendering
3. Test with real manifests
4. Update documentation

#### Performance Optimization
- Profile JavaScript execution
- Optimize image loading
- Cache IIIF data appropriately
- Minimize DOM manipulations

## Getting Help

### Resources
- **IIIF Documentation**: https://iiif.io/api/
- **MDN Web Docs**: https://developer.mozilla.org/
- **Accessibility Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

### Community
- Open GitHub issues for questions
- Check existing documentation
- Join IIIF community discussions

### Code Review Process
1. Create pull request with detailed description
2. Wait for maintainer review
3. Address feedback promptly
4. Test changes after feedback
5. Merge when approved

This development guide should provide everything you need to contribute effectively to the IIIF Page Viewer project!