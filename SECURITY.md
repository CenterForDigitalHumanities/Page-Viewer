# Security Policy

## Supported Versions

We actively support the following versions of IIIF Page Viewer with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Security Considerations

### IIIF Content Security

The IIIF Page Viewer loads and displays external content from IIIF manifests and image services. Users should be aware of the following security considerations:

#### Content Source Validation
- **HTTPS Recommended**: Always use HTTPS URLs for IIIF manifests and images when possible
- **Trusted Sources**: Only load IIIF content from trusted cultural institutions and digital libraries
- **Content Validation**: The viewer performs basic validation of IIIF manifest structure but cannot guarantee the safety of all external content

#### Cross-Origin Resource Sharing (CORS)
- The viewer makes cross-origin requests to IIIF services
- Ensure your IIIF services properly configure CORS headers
- Be aware that loading IIIF content may expose your users' IP addresses to external services

#### iframe Embedding Security
- The viewer is designed to run in iframe contexts
- Parent pages should implement appropriate Content Security Policy (CSP) headers
- Use appropriate iframe sandboxing attributes when embedding:
  ```html
  <iframe src="page-viewer.html" 
          sandbox="allow-scripts allow-same-origin allow-forms"
          csp="default-src 'self' https:"></iframe>
  ```

### Data Privacy

#### Information Collected
- The viewer does not collect or store personal information
- No analytics or tracking are implemented by default
- Image requests to IIIF services may be logged by those services

#### PostMessage Communication
- The viewer uses `postMessage` API for iframe communication
- Messages are not encrypted and may be visible to parent pages
- Avoid sending sensitive information through these communications

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in IIIF Page Viewer, please follow these steps:

### How to Report

1. **Do not create a public GitHub issue** for security vulnerabilities
2. **Email**: Send details to the Center for Digital Humanities security team
3. **Include**: 
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Affected versions
   - Potential impact assessment
   - Suggested fix (if available)

### What to Expect

- **Initial Response**: Within 48 hours of receiving your report
- **Assessment**: We will assess the vulnerability within 5 business days
- **Updates**: Regular updates on our progress every 5 business days
- **Resolution**: Security fixes will be prioritized and released as soon as possible

### Disclosure Policy

- **Coordinated Disclosure**: We follow a coordinated disclosure process
- **Public Disclosure**: Vulnerabilities will be publicly disclosed after a fix is available
- **Timeline**: We aim to resolve critical vulnerabilities within 30 days
- **Recognition**: Security researchers will be credited (with permission) in our acknowledgments

## Security Best Practices for Users

### For Developers Integrating the Viewer

```html
<!-- Recommended iframe configuration -->
<iframe src="iiif-page-viewer.html"
        sandbox="allow-scripts allow-same-origin"
        referrerpolicy="no-referrer-when-downgrade"
        loading="lazy">
</iframe>
```

```javascript
// Validate IIIF URLs before loading
function isValidIIIFUrl(url) {
    try {
        const parsed = new URL(url)
        return parsed.protocol === 'https:' && 
               parsed.hostname.length > 0
    } catch {
        return false
    }
}

// Safe message handling
window.addEventListener('message', (event) => {
    // Always validate origin
    if (event.origin !== 'https://trusted-domain.com') {
        return
    }
    
    // Validate message structure
    if (event.data?.type === 'CANVAS_URL' && 
        isValidIIIFUrl(event.data.canvasUrl)) {
        // Process message
    }
})
```

### Content Security Policy (CSP) Recommendations

```http
Content-Security-Policy: 
    default-src 'self';
    img-src 'self' https: data:;
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    connect-src 'self' https:;
    frame-ancestors 'self' https://trusted-parent-domain.com;
```

### For IIIF Service Providers

- **CORS Configuration**: Properly configure CORS headers for cross-origin access
- **HTTPS**: Serve IIIF manifests and images over HTTPS
- **Rate Limiting**: Implement appropriate rate limiting to prevent abuse
- **Access Logs**: Monitor access logs for unusual patterns

## Known Security Limitations

### Client-Side Only
- All processing happens in the browser
- Cannot perform server-side validation of IIIF content
- Relies on browser security features

### External Dependencies
- The viewer loads external IIIF content that we cannot control
- Users should verify the trustworthiness of IIIF service providers
- No malware scanning of loaded images

### Browser Compatibility
- Security features depend on modern browser capabilities
- Older browsers may have additional vulnerabilities
- Users should keep browsers updated

## Security-Related Configuration

### Environment Variables / Configuration
This project does not use server-side configuration or environment variables that could expose sensitive information.

### Logging
- The viewer logs errors to browser console for debugging
- No sensitive information should be logged
- Production deployments should minimize console output

## Acknowledgments

We would like to thank the security researchers and community members who help make IIIF Page Viewer more secure through responsible disclosure.

## Additional Resources

- [OWASP JavaScript Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
- [IIIF Security Considerations](https://iiif.io/api/annex/notes/security/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [iframe Security Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#security)

---

*This security policy is reviewed and updated regularly. Last updated: [Current Date]*