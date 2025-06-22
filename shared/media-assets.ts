/**
 * Centralized Media Assets Repository for SoapBox Super App
 * Single source of truth for all logos, icons, and media assets
 */

// SoapBox Logo Assets
export const SOAPBOX_LOGOS = {
  // Main application logo (circular design with cross)
  PRIMARY: '/assets/soapbox-logo-new.png',
  // Legacy logo (keeping for backward compatibility)
  LEGACY: '/assets/soapbox-logo.jpeg',
  // Email-optimized logo (professional circular SB design)
  EMAIL_CIRCULAR: 'Professional circular "SB" logo with purple gradient',
  // Email template HTML for SoapBox logo (professional shield design)
  EMAIL_HTML: `<div style="width: 60px; height: 60px; background: linear-gradient(135deg, #5B2C6F 0%, #A855F7 100%); border-radius: 12px; margin: 0 auto; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));">
      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="#ffffff" stroke-width="1.5" fill="rgba(255,255,255,0.9)"/>
      <path d="M9 12L11 14L15 10" stroke="#5B2C6F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
  </div>`
} as const;

// Brand Colors
export const BRAND_COLORS = {
  PRIMARY_PURPLE: '#7c3aed',
  SECONDARY_PURPLE: '#5A2671',
  DARK_PURPLE: '#4A1F5A',
  LIGHT_PURPLE: '#9333ea',
  WHITE: '#ffffff',
  BLACK: '#000000'
} as const;

// Email Template Assets
export const EMAIL_ASSETS = {
  LOGO_WIDTH: 60,
  LOGO_HEIGHT: 60,
  HEADER_BACKGROUND: BRAND_COLORS.PRIMARY_PURPLE,
  BUTTON_BACKGROUND: BRAND_COLORS.PRIMARY_PURPLE,
  TEXT_COLOR: BRAND_COLORS.BLACK
} as const;

// App Branding
export const APP_BRANDING = {
  NAME: 'SoapBox Super App',
  TAGLINE: 'Faith Community Platform',
  DESCRIPTION: 'Your comprehensive spiritual wellness and community platform'
} as const;

/**
 * Gets the appropriate logo for different contexts
 */
export function getLogo(context: 'app' | 'email' | 'landing' = 'app'): string {
  switch (context) {
    case 'email':
      return SOAPBOX_LOGOS.EMAIL_BASE64;
    case 'landing':
    case 'app':
    default:
      return SOAPBOX_LOGOS.PRIMARY;
  }
}

/**
 * Gets brand-consistent styling for email components
 */
export function getEmailStyles() {
  return {
    headerBackground: EMAIL_ASSETS.HEADER_BACKGROUND,
    logoWidth: EMAIL_ASSETS.LOGO_WIDTH,
    logoHeight: EMAIL_ASSETS.LOGO_HEIGHT,
    buttonBackground: EMAIL_ASSETS.BUTTON_BACKGROUND,
    textColor: EMAIL_ASSETS.TEXT_COLOR,
    brandName: APP_BRANDING.NAME,
    tagline: APP_BRANDING.TAGLINE
  };
}