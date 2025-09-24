# Changelog

All notable changes to the IIIF Page Viewer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive contribution guidelines (CONTRIBUTING.md)
- AI development guide (COPILOT.md) 
- Community code of conduct (CODE_OF_CONDUCT.md)
- Security policy and reporting guidelines (SECURITY.md)
- GitHub issue templates for bugs, features, and IIIF compatibility
- Pull request template with comprehensive checklists
- Development guide (DEVELOPMENT.md)
- Project metadata in package.json
- Proper .gitignore file

### Changed
- Enhanced project documentation structure for open source contribution

## [2.0.0] - 2024-XX-XX

### Added
- Modular JavaScript architecture with ES6 classes
- Support for both IIIF Presentation API v2 and v3
- Automatic IIIF Image API detection and optimization
- Full accessibility support (WCAG 2.1 AA compliance)
- Interactive annotation overlays with tooltips
- Responsive design for various screen sizes
- Parent window communication via PostMessage API
- Error handling with user-friendly messages
- Loading states and visual feedback
- Keyboard navigation support

### Features
- **IIIFDataService**: Handles IIIF data fetching and parsing
- **UIManager**: Manages user interface and rendering
- **MessageHandler**: Manages parent window communication
- **PageViewer**: Main orchestrator class

### Browser Support
- Modern browsers with ES6+ support
- Fetch API support required
- PostMessage API for iframe communication

### IIIF Compatibility
- IIIF Presentation API v2.x and v3.x
- IIIF Image API v2.x and v3.x (automatic info.json handling)
- Standard XYWH coordinate selectors
- Automatic image URL construction from IIIF Image API

## [1.x.x] - Previous Versions

### Note
Version 1.x.x represents earlier iterations of the project. 
For detailed history of changes prior to v2.0.0, please refer to the git commit history.

---

## Types of Changes

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes

## Version Guidelines

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version changes for incompatible API changes
- **MINOR** version changes for backwards-compatible functionality additions
- **PATCH** version changes for backwards-compatible bug fixes

## IIIF Standard Updates

When IIIF specifications are updated, we will:

- Assess compatibility impact
- Update implementation as needed
- Maintain backward compatibility when possible
- Document any breaking changes clearly

## Contributing to the Changelog

- All notable changes should be documented here
- Keep entries brief but descriptive
- Link to relevant issues/PRs when applicable
- Group changes by type (Added, Changed, Fixed, etc.)
- Follow the established format and style