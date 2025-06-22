/**
 * Base64 encoded logo for email templates
 * Creates a reliable image that works across all email clients
 */

// Professional shield logo as base64 encoded SVG (no SB initials)
export const SOAPBOX_EMAIL_LOGO_BASE64 = `data:image/svg+xml;base64,${Buffer.from(`
<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#5B2C6F;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#A855F7;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.15)"/>
    </filter>
  </defs>
  <rect x="6" y="6" width="48" height="48" rx="10" ry="10" fill="url(#grad1)" stroke="rgba(255,255,255,0.2)" stroke-width="2" filter="url(#shadow)"/>
  <path d="M30 15L21 20V25C21 29.5 24.5 33 30 35C35.5 33 39 29.5 39 25V20L30 15Z" stroke="#ffffff" stroke-width="1.5" fill="rgba(255,255,255,0.9)"/>
  <path d="M26 25L28 27L34 21" stroke="#5B2C6F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>
`).toString('base64')}`;

// Password reset version with red gradient background (no SB initials)
export const SOAPBOX_EMAIL_LOGO_RED_BASE64 = `data:image/svg+xml;base64,${Buffer.from(`
<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ef4444;stop-opacity:1" />
    </linearGradient>
    <filter id="redShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.15)"/>
    </filter>
  </defs>
  <rect x="6" y="6" width="48" height="48" rx="10" ry="10" fill="url(#redGrad)" stroke="rgba(255,255,255,0.2)" stroke-width="2" filter="url(#redShadow)"/>
  <path d="M30 15L21 20V25C21 29.5 24.5 33 30 35C35.5 33 39 29.5 39 25V20L30 15Z" stroke="#ffffff" stroke-width="1.5" fill="rgba(255,255,255,0.9)"/>
  <path d="M26 25L28 27L34 21" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>
`).toString('base64')}`;