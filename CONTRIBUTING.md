# Contributing to IIIF Page Viewer

Thank you for your interest in contributing to the IIIF Page Viewer! This project is maintained by the Center for Digital Humanities and welcomes contributions from the community.

## Getting Started

### Prerequisites

- A modern web browser with ES6+ support
- Basic knowledge of HTML, CSS, and JavaScript
- Understanding of IIIF (International Image Interoperability Framework) is helpful but not required

### Local Development Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Page-Viewer.git
   cd Page-Viewer
   ```

2. **Start a Local Development Server**
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Node.js (if you have it installed)
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in Browser**
   Navigate to `http://localhost:8000` to view the application.

4. **Test with IIIF Content**
   You can test the viewer by adding a canvas parameter:
   ```
   http://localhost:8000?canvas=https://example.com/iiif/manifest.json
   ```

## Project Structure

```
Page-Viewer/
├── index.html              # Main HTML file
├── viewer.js              # Main orchestrator class
├── iiif-data-service.js   # IIIF data fetching and parsing
├── ui-manager.js          # UI operations and rendering
├── message-handler.js     # Parent window communication
├── styles.css             # Styling
└── README.md              # Project documentation
```

## How to Contribute

### Reporting Issues

- Use the GitHub issue tracker to report bugs or request features
- Check existing issues before creating a new one
- Provide detailed information including:
  - Browser and version
  - Steps to reproduce the issue
  - Expected vs. actual behavior
  - IIIF manifest URLs (if relevant)

### Making Changes

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the existing code style and patterns
   - Write clear, descriptive commit messages
   - Test your changes across different browsers

3. **Test Thoroughly**
   - Test with various IIIF manifests (v2 and v3)
   - Verify accessibility features work
   - Check responsive design on different screen sizes
   - Test iframe communication functionality

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add descriptive commit message"
   ```

5. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Standards

### JavaScript Style Guide

- Use ES6+ modules and modern JavaScript features
- Use consistent indentation (2 spaces)
- Include JSDoc comments for public methods
- Use descriptive variable and function names
- Handle errors gracefully with user-friendly messages

### CSS Guidelines

- Use semantic class names
- Follow mobile-first responsive design
- Maintain accessibility standards (WCAG 2.1 AA)
- Use CSS custom properties for theming when appropriate

### HTML Standards

- Use semantic HTML5 elements
- Include proper ARIA labels and roles
- Ensure keyboard navigation works
- Test with screen readers

## Testing Guidelines

### Manual Testing Checklist

- [ ] Loads IIIF v2 and v3 manifests correctly
- [ ] Displays images and annotations properly
- [ ] Responsive design works on mobile and desktop
- [ ] Keyboard navigation functions correctly
- [ ] Screen reader compatibility
- [ ] Error handling displays appropriate messages
- [ ] iframe communication works with parent windows

### Browser Compatibility

Test your changes in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Types of Contributions Welcome

### Bug Fixes
- Fix rendering issues
- Improve error handling
- Resolve browser compatibility problems

### Features
- IIIF standard compliance improvements
- Accessibility enhancements
- Performance optimizations
- New annotation features

### Documentation
- Code comments and JSDoc
- Usage examples
- API documentation
- Tutorial content

### Design Improvements
- UI/UX enhancements
- Responsive design improvements
- Accessibility improvements

## IIIF-Specific Considerations

### IIIF Standards Support
- Ensure compatibility with both IIIF Presentation API v2 and v3
- Support IIIF Image API v2 and v3
- Follow IIIF best practices for coordinate parsing (XYWH format)

### Testing with Real IIIF Content
Test your changes with manifests from:
- Digital libraries and museums
- IIIF community examples
- Various IIIF service providers

## Communication

- **GitHub Issues**: For bug reports and feature requests
- **Pull Requests**: For code contributions
- **Discussions**: For questions and general discussion

## Recognition

Contributors will be acknowledged in:
- Git commit history
- README.md contributors section (if we add one)
- Release notes for significant contributions

## Questions?

If you have questions about contributing, please:
1. Check the existing documentation
2. Search closed issues for similar questions
3. Open a new issue with the "question" label

We appreciate your interest in making IIIF Page Viewer better for everyone!