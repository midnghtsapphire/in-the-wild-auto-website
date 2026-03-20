/**
 * Centralized branding constants for Reese-Reviews
 * All brand identity (name, colors, logo) managed here
 */

export const BRANDING = {
  // App Identity
  APP_NAME: "Reese-Reviews",
  TAGLINE: "Professional Reviews & Content",
  DESCRIPTION: "Expert reviews and curated content",

  // Colors - Steel/Neutral Theme
  COLORS: {
    // Primary steel/gray palette
    PRIMARY: "#64748B", // slate-500
    PRIMARY_DARK: "#475569", // slate-600
    PRIMARY_LIGHT: "#94A3B8", // slate-400
    
    // Accent
    ACCENT: "#0F172A", // slate-900
    ACCENT_LIGHT: "#1E293B", // slate-800
    
    // Background
    BG_PRIMARY: "#F8FAFC", // slate-50
    BG_SECONDARY: "#F1F5F9", // slate-100
    BG_DARK: "#0F172A", // slate-900
    
    // Text
    TEXT_PRIMARY: "#0F172A", // slate-900
    TEXT_SECONDARY: "#64748B", // slate-500
    TEXT_LIGHT: "#CBD5E1", // slate-300
    TEXT_ON_DARK: "#F8FAFC", // slate-50
    
    // Border
    BORDER: "#E2E8F0", // slate-200
    BORDER_DARK: "#334155", // slate-700
  },

  // Logo Configuration
  LOGO: {
    // Placeholder icon - will be replaced with actual logo
    ICON: "User", // lucide-react icon name
    SIZE: {
      SMALL: "w-8 h-8",
      MEDIUM: "w-10 h-10",
      LARGE: "w-16 h-16",
    },
    // Logo background - simple steel
    BG_CLASS: "bg-slate-600",
    // Icon color
    ICON_CLASS: "text-slate-50",
  },

  // Typography
  FONT: {
    HEADING: "font-bold tracking-tight",
    BODY: "font-normal",
    MONO: "font-mono",
  },
} as const;

// Helper function to get logo placeholder
export function getLogoPlaceholder(size: keyof typeof BRANDING.LOGO.SIZE = "MEDIUM") {
  return {
    size: BRANDING.LOGO.SIZE[size],
    bgClass: BRANDING.LOGO.BG_CLASS,
    iconClass: BRANDING.LOGO.ICON_CLASS,
    iconName: BRANDING.LOGO.ICON,
  };
}
