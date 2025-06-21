/**
 * Base64 encoded logo for email templates
 * Creates a reliable image that works across all email clients
 */

// Simple SoapBox logo as base64 encoded PNG
export const SOAPBOX_EMAIL_LOGO_BASE64 = `data:image/svg+xml;base64,${Buffer.from(`
<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
  <circle cx="30" cy="30" r="27" fill="#7c3aed" stroke="#ffffff" stroke-width="6"/>
  <circle cx="30" cy="30" r="18" fill="#ffffff"/>
  <text x="30" y="38" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#7c3aed" text-anchor="middle">SB</text>
</svg>
`).toString('base64')}`;

// Password reset version with red background
export const SOAPBOX_EMAIL_LOGO_RED_BASE64 = `data:image/svg+xml;base64,${Buffer.from(`
<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
  <circle cx="30" cy="30" r="27" fill="#dc2626" stroke="#ffffff" stroke-width="6"/>
  <circle cx="30" cy="30" r="18" fill="#ffffff"/>
  <text x="30" y="38" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#dc2626" text-anchor="middle">SB</text>
</svg>
`).toString('base64')}`;