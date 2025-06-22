/**
 * Base64 encoded logo for email templates
 * Creates a reliable image that works across all email clients
 */

// Simple SoapBox logo as base64 encoded PNG
export const SOAPBOX_EMAIL_LOGO_BASE64 = `data:image/svg+xml;base64,${Buffer.from(`
<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
  <circle cx="30" cy="30" r="27" fill="#7c3aed" stroke="#ffffff" stroke-width="6"/>
  <circle cx="30" cy="30" r="18" fill="#ffffff"/>
  <path d="M30 15L21 20V25C21 29.5 24.5 33 30 35C35.5 33 39 29.5 39 25V20L30 15Z" fill="#7c3aed"/>
  <path d="M26 25L28 27L34 21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`).toString('base64')}`;

// Password reset version with red background
export const SOAPBOX_EMAIL_LOGO_RED_BASE64 = `data:image/svg+xml;base64,${Buffer.from(`
<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
  <circle cx="30" cy="30" r="27" fill="#dc2626" stroke="#ffffff" stroke-width="6"/>
  <circle cx="30" cy="30" r="18" fill="#ffffff"/>
  <path d="M30 15L21 20V25C21 29.5 24.5 33 30 35C35.5 33 39 29.5 39 25V20L30 15Z" fill="#dc2626"/>
  <path d="M26 25L28 27L34 21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`).toString('base64')}`;