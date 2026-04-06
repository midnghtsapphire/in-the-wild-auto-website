/**
 * Logo — single source of truth for the InTheWild brand mark.
 *
 * To rename the app or swap the icon, change this file only.
 *
 * Sizes:
 *   xs  — 28 px icon box, used in mobile/compact contexts
 *   sm  — 32 px icon box, used in inner-page headers (Billing, ProjectDetail)
 *   md  — 40 px icon box, default for primary nav headers
 *   lg  — 56 px icon box, used on hero/splash sections
 */

interface LogoProps {
  /** Visual scale of the logo mark. Defaults to "md". */
  size?: "xs" | "sm" | "md" | "lg";
  /** Whether to show the wordmark beside the icon. Defaults to true. */
import { User } from "lucide-react";
import { BRANDING } from "@/lib/branding";
import { cn } from "@/lib/utils";

type LogoSize = "small" | "medium" | "large";

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
}

const SIZES = {
  xs: { box: "w-7 h-7",   text: "text-lg" },
  sm: { box: "w-8 h-8",   text: "text-xl" },
  md: { box: "w-10 h-10", text: "text-2xl" },
  lg: { box: "w-14 h-14", text: "text-3xl" },
} as const;

// ─── Brand tokens ─────────────────────────────────────────────────────────────
// Change these lines to retheme the entire app:
const ICON_GRADIENT = "from-purple-500 to-green-500";
const TEXT_GRADIENT = "from-purple-400 to-green-400";
const APP_NAME = "InTheWild";

/**
 * ITW Mark — custom logo icon.
 *
 * Anatomy (24 × 24 viewBox):
 *   • Geometric "W" letterform rendered as a single stroke path
 *   • Three filled circle nodes at the W's upper tips (top-left, centre peak,
 *     top-right) — a circuit-board "pad" motif that doubles as a git-branch
 *     fork, fitting for an AI code-generator
 *   • Valleys are left open (rounded stroke caps) to keep the mark light
 *     and legible even at the smallest size (28 px box)
 */
/**
 * ITWMark — the custom logo icon SVG.
 *
 * Renders the geometric W letterform with three circuit-node circles at its
 * upper tips (top-left, centre peak, top-right). Designed to sit inside the
 * gradient container box — use `className` to fill the box:
 *
 *   <ITWMark className="w-full h-full" />
 *
 * The mark has no background fill of its own; the parent box provides colour.
 * All strokes and fills are white so the mark works on any coloured background.
 */
function ITWMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className}`}
      aria-hidden="true"
    >
      {/*
       * W stroke
       * Tips  : (2, 4)  and  (22, 4)   — top-left / top-right
       * Peak  : (12, 11)               — centre peak
       * Valleys : (7, 20) and (17, 20) — bottom valleys
       */}
      <path
        d="M2 4 L7 20 L12 11 L17 20 L22 4"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Circuit nodes at the three upper connection points */}
      <circle cx="2"  cy="4"  r="2.2" fill="white" />
      <circle cx="22" cy="4"  r="2.2" fill="white" />
      <circle cx="12" cy="11" r="2.2" fill="white" />
    </svg>
  );
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const s = SIZES[size];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${s.box} bg-gradient-to-br ${ICON_GRADIENT} rounded-lg flex items-center justify-center flex-shrink-0 p-1.5`}
      >
        <ITWMark className="w-full h-full" />
      </div>
      {showText && (
        <span
          className={`${s.text} font-bold bg-gradient-to-r ${TEXT_GRADIENT} bg-clip-text text-transparent`}
        >
          {APP_NAME}
        </span>
/**
 * Logo Component - Centralized branding logo
 * Currently using placeholder icon - can be replaced with actual image
 * 
 * To update logo:
 * 1. Add image to /client/public/logo.svg or logo.png
 * 2. Update this component to use <img src="/logo.svg" /> instead of icon
 * 3. Or update BRANDING.LOGO.ICON in @/lib/branding.ts to change icon
 */
export function Logo({ size = "medium", showText = true, className }: LogoProps) {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-10 h-10",
    large: "w-16 h-16",
  };

  const textSizeClasses = {
    small: "text-lg",
    medium: "text-2xl",
    large: "text-4xl",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo Icon/Image Placeholder */}
      <div
        className={cn(
          sizeClasses[size],
          "bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0"
        )}
      >
        <User className={cn(size === "small" ? "w-4 h-4" : size === "medium" ? "w-6 h-6" : "w-10 h-10", "text-slate-50")} />
      </div>

      {/* Logo Text */}
      {showText && (
        <h1 className={cn(textSizeClasses[size], "font-bold text-slate-900 dark:text-slate-50")}>
          {BRANDING.APP_NAME}
        </h1>
      )}
    </div>
  );
}

/**
 * Logo placeholder for content management
 * Shows instructions for updating the logo
 */
export function LogoPlaceholder() {
  return (
    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
          <User className="w-12 h-12 text-slate-400" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
            Logo Placeholder
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Upload your logo image here
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            Recommended: 500x500px, PNG or SVG format
          </p>
        </div>
      </div>
    </div>
  );
}
