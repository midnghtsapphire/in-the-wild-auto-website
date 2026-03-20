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
import { Zap } from "lucide-react";

interface LogoProps {
  /** Visual scale of the logo mark. Defaults to "md". */
  size?: "xs" | "sm" | "md" | "lg";
  /** Whether to show the wordmark beside the icon. Defaults to true. */
  showText?: boolean;
  className?: string;
}

const SIZES = {
  xs: { box: "w-7 h-7",  icon: "w-4 h-4", text: "text-lg" },
  sm: { box: "w-8 h-8",  icon: "w-4 h-4", text: "text-xl" },
  md: { box: "w-10 h-10", icon: "w-6 h-6", text: "text-2xl" },
  lg: { box: "w-14 h-14", icon: "w-8 h-8", text: "text-3xl" },
} as const;

// ─── Brand tokens ─────────────────────────────────────────────────────────────
// Change these two lines to retheme the entire app:
const ICON_GRADIENT = "from-purple-500 to-green-500";
const TEXT_GRADIENT = "from-purple-400 to-green-400";
const APP_NAME = "InTheWild";

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const s = SIZES[size];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${s.box} bg-gradient-to-br ${ICON_GRADIENT} rounded-lg flex items-center justify-center flex-shrink-0`}
      >
        <Zap className={`${s.icon} text-white`} />
      </div>
      {showText && (
        <span
          className={`${s.text} font-bold bg-gradient-to-r ${TEXT_GRADIENT} bg-clip-text text-transparent`}
        >
          {APP_NAME}
        </span>
      )}
    </div>
  );
}
