# Prompt 9: Security & Anti-Abuse

## Overview
Comprehensive security including rate limiting, validation, and anti-abuse measures.

## Requirements

### Rate Limiting
- Multi-tier limits (IP, user, endpoint)
- Redis-backed sliding window
- Progressive penalties

### Input Validation
- Type validation (Joi/Zod)
- XSS prevention
- NoSQL injection prevention
- File upload security

### Content Security
- Virus scanning (ClamAV)
- NSFW detection (NudeNet)
- Profanity filtering
- PII detection

### CAPTCHA
- reCAPTCHA v3 integration
- Score-based verification
- Fallback to v2

See full prompt for security implementation.
