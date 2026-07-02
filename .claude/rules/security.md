---
name: security
description: Security best practices and vulnerability prevention
globs:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.sol"
---

# Security Rules

## Input Validation
- Validate ALL user inputs at system boundaries
- Use schema validation (zod, joi) for complex inputs
- Sanitize HTML content before rendering
- Validate file uploads (type, size, content)

## Authentication
- Never store passwords in plain text
- Use secure session management
- Implement proper CSRF protection
- Use HttpOnly, Secure, SameSite cookies

## Data Protection
- Never log sensitive data (passwords, tokens, PII)
- Use environment variables for secrets
- Never commit secrets to version control
- Encrypt sensitive data at rest and in transit

## API Security
- Rate limiting on all endpoints
- Proper CORS configuration
- Input size limits
- Authentication on all non-public endpoints
- Authorization checks for resource access

## SQL/NoSQL Injection
- Use parameterized queries
- Never concatenate user input into queries
- Use ORM query builders

## XSS Prevention
- Escape output by default
- Use Content Security Policy headers
- Validate URLs before redirect
- Sanitize rich text content

## Dependencies
- Keep dependencies updated
- Audit for known vulnerabilities
- Use lockfiles
- Review new dependencies before adding
