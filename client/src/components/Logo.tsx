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
      )}
    </div>
  );
}
