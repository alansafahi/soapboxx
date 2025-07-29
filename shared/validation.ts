import { z } from "zod";

// Phone number validation - supports various formats but requires proper length
const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/; // At least 10 digits for US format
export const phoneValidation = z.string()
  .refine((phone) => {
    if (!phone) return true; // Optional field
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, ''); // Remove formatting
    // Must be at least 10 digits for a valid phone number
    return phoneRegex.test(cleaned) && cleaned.length >= 10;
  }, {
    message: "Please enter a valid phone number (e.g., (555) 123-4567 or +1-555-123-4567)"
  });

// URL validation with user-friendly messages
export const urlValidation = z.string()
  .refine((url) => {
    if (!url) return true; // Optional field
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  }, {
    message: "Please enter a valid URL (e.g., https://example.com or example.com)"
  });

// Email validation
export const emailValidation = z.string()
  .email("Please enter a valid email address")
  .min(1, "Email is required");

// Year validation
export const yearValidation = z.string()
  .refine((year) => {
    if (!year) return true; // Optional field
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    return yearNum >= 1800 && yearNum <= currentYear + 1;
  }, {
    message: `Please enter a valid year between 1800 and ${new Date().getFullYear() + 1}`
  });

// ZIP code validation (US format)
export const zipCodeValidation = z.string()
  .refine((zip) => {
    if (!zip) return true; // Optional field
    return /^\d{5}(-\d{4})?$/.test(zip);
  }, {
    message: "Please enter a valid ZIP code (e.g., 12345 or 12345-6789)"
  });

// Social media URL validation with platform-specific checks
export const socialMediaValidation = {
  facebook: z.string().refine((url) => {
    if (!url) return true;
    return url.includes('facebook.com') || url.includes('fb.me');
  }, { message: "Please enter a valid Facebook URL" }),
  
  instagram: z.string().refine((url) => {
    if (!url) return true;
    return url.includes('instagram.com');
  }, { message: "Please enter a valid Instagram URL" }),
  
  twitter: z.string().refine((url) => {
    if (!url) return true;
    return url.includes('twitter.com') || url.includes('x.com');
  }, { message: "Please enter a valid Twitter/X URL" }),
  
  tiktok: z.string().refine((url) => {
    if (!url) return true;
    return url.includes('tiktok.com');
  }, { message: "Please enter a valid TikTok URL" }),
  
  youtube: z.string().refine((url) => {
    if (!url) return true;
    return url.includes('youtube.com') || url.includes('youtu.be');
  }, { message: "Please enter a valid YouTube URL" }),
  
  linkedin: z.string().refine((url) => {
    if (!url) return true;
    return url.includes('linkedin.com');
  }, { message: "Please enter a valid LinkedIn URL" })
};

// Community form validation schema
export const communityValidationSchema = z.object({
  name: z.string().min(2, "Community name must be at least 2 characters"),
  type: z.string().min(1, "Please select a community type"),
  denomination: z.string().min(1, "Please select a denomination"),
  address: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "Please enter a valid city"),
  state: z.string().length(2, "Please enter a valid 2-letter state code"),
  zipCode: zipCodeValidation,
  phone: phoneValidation,
  email: emailValidation,
  website: urlValidation,
  establishedYear: yearValidation,
  missionStatement: z.string().max(500, "Mission statement must be under 500 characters"),
  facebookUrl: socialMediaValidation.facebook,
  instagramUrl: socialMediaValidation.instagram,
  twitterUrl: socialMediaValidation.twitter,
  tiktokUrl: socialMediaValidation.tiktok,
  youtubeUrl: socialMediaValidation.youtube,
  linkedinUrl: socialMediaValidation.linkedin
});

export type CommunityValidation = z.infer<typeof communityValidationSchema>;