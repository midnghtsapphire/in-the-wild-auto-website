import { User } from "lucide-react";
import { BRANDING } from "@/lib/branding";
import { cn } from "@/lib/utils";

type LogoSize = "small" | "medium" | "large";

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
}

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
