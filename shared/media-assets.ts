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
  // Email template HTML for SoapBox logo
  EMAIL_HTML: `<div style="width: 60px; height: 60px; background: linear-gradient(135deg, #5B2C6F 0%, #A855F7 100%); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255,255,255,0.3);">
    <div style="width: 40px; height: 40px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
      <span style="font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; font-size: 18px; color: #5B2C6F; letter-spacing: -1px;">SB</span>
    </div>
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