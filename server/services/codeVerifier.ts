/**
 * Code Verification Engine
 * Performs syntax, security, and quality checks on generated HTML/CSS/JS
 */

export interface VerificationResult {
  score: number; // 0-100
  passed: boolean;
  issues: VerificationIssue[];
  recommendations: string[];
}

export interface VerificationIssue {
  severity: "critical" | "warning" | "info";
  category: "syntax" | "security" | "accessibility" | "performance" | "seo";
  message: string;
  line?: number;
}

/**
 * Verify generated code for quality, security, and completeness
 */
export async function verifyCode(html: string): Promise<VerificationResult> {
  const issues: VerificationIssue[] = [];
  const recommendations: string[] = [];

  // ─── Syntax Checks ───────────────────────────────────────
  if (!html.includes("<!DOCTYPE") && !html.includes("<!doctype")) {
    issues.push({
      severity: "critical",
      category: "syntax",
      message: "Missing DOCTYPE declaration",
    });
  }

  if (!html.includes("<html")) {
    issues.push({
      severity: "critical",
      category: "syntax",
      message: "Missing <html> tag",
    });
  }

  if (!html.includes("<head>")) {
    issues.push({
      severity: "critical",
      category: "syntax",
      message: "Missing <head> section",
    });
  }

  if (!html.includes("<body")) {
    issues.push({
      severity: "critical",
      category: "syntax",
      message: "Missing <body> tag",
    });
  }

  // Check for unclosed tags (basic)
  const openTags = (html.match(/<[a-z][a-z0-9]*[^>]*>/gi) || []).length;
  const closeTags = (html.match(/<\/[a-z][a-z0-9]*>/gi) || []).length;
  const selfClosingTags = (html.match(/<[a-z][a-z0-9]*[^>]*\/>/gi) || []).length;
  
  // Rough heuristic: should have similar number of open/close tags
  if (Math.abs(openTags - closeTags - selfClosingTags) > 5) {
    issues.push({
      severity: "warning",
      category: "syntax",
      message: "Possible unclosed HTML tags detected",
    });
  }

  // ─── Security Checks ─────────────────────────────────────
  // Check for dangerous patterns
  if (html.includes("eval(") || html.includes("Function(")) {
    issues.push({
      severity: "critical",
      category: "security",
      message: "Dangerous code execution detected (eval/Function)",
    });
  }

  if (html.includes("innerHTML") && html.includes("user")) {
    issues.push({
      severity: "warning",
      category: "security",
      message: "Potential XSS vulnerability: innerHTML with user input",
    });
  }

  if (html.includes("document.write")) {
    issues.push({
      severity: "warning",
      category: "security",
      message: "document.write() can cause security issues",
    });
  }

  // Check for external script sources (potential supply chain attack)
  const externalScripts = html.match(/<script[^>]+src=["']https?:\/\/[^"']+["']/gi) || [];
  if (externalScripts.length > 5) {
    issues.push({
      severity: "warning",
      category: "security",
      message: `${externalScripts.length} external scripts detected - verify all sources`,
    });
  }

  // ─── Accessibility Checks ────────────────────────────────
  const images = (html.match(/<img[^>]*>/gi) || []).length;
  const imagesWithAlt = (html.match(/<img[^>]*alt=/gi) || []).length;
  
  if (images > 0 && imagesWithAlt < images) {
    issues.push({
      severity: "warning",
      category: "accessibility",
      message: `${images - imagesWithAlt} images missing alt text`,
    });
  }

  if (!html.includes("lang=")) {
    issues.push({
      severity: "warning",
      category: "accessibility",
      message: "Missing lang attribute on <html> tag",
    });
  }

  const buttons = (html.match(/<button[^>]*>/gi) || []).length;
  const buttonsWithAria = (html.match(/<button[^>]*aria-label=/gi) || []).length;
  
  if (buttons > 3 && buttonsWithAria === 0) {
    recommendations.push("Consider adding aria-labels to buttons for screen readers");
  }

  // ─── SEO Checks ──────────────────────────────────────────
  if (!html.includes("<title>")) {
    issues.push({
      severity: "warning",
      category: "seo",
      message: "Missing <title> tag",
    });
  }

  if (!html.includes('name="description"')) {
    recommendations.push("Add meta description for better SEO");
  }

  if (!html.includes('name="viewport"')) {
    issues.push({
      severity: "warning",
      category: "seo",
      message: "Missing viewport meta tag (not mobile-friendly)",
    });
  }

  // ─── Performance Checks ──────────────────────────────────
  const inlineStyles = (html.match(/<style[^>]*>/gi) || []).length;
  if (inlineStyles > 3) {
    recommendations.push("Consider consolidating multiple <style> blocks");
  }

  const inlineScripts = (html.match(/<script[^>]*>/gi) || []).length;
  if (inlineScripts > 5) {
    recommendations.push("Consider consolidating multiple <script> blocks");
  }

  // Check file size
  const sizeKB = new Blob([html]).size / 1024;
  if (sizeKB > 500) {
    issues.push({
      severity: "warning",
      category: "performance",
      message: `Large file size (${Math.round(sizeKB)}KB) - consider optimization`,
    });
  }

  // ─── Quality Checks ──────────────────────────────────────
  // Check for responsive design
  if (!html.includes("@media")) {
    recommendations.push("Add media queries for responsive design");
  }

  // Check for modern CSS
  if (!html.includes("flex") && !html.includes("grid")) {
    recommendations.push("Consider using flexbox or grid for modern layouts");
  }

  // Check for semantic HTML
  const semanticTags = ["<header", "<nav", "<main", "<article", "<section", "<aside", "<footer"];
  const semanticCount = semanticTags.filter(tag => html.includes(tag)).length;
  
  if (semanticCount < 3) {
    recommendations.push("Use more semantic HTML5 elements for better structure");
  }

  // ─── Calculate Score ─────────────────────────────────────
  let score = 100;
  
  // Deduct points for issues
  issues.forEach(issue => {
    if (issue.severity === "critical") score -= 15;
    else if (issue.severity === "warning") score -= 5;
    else score -= 2;
  });

  // Bonus points for good practices
  if (html.includes("aria-")) score += 5;
  if (html.includes("@media")) score += 5;
  if (html.includes("flex") || html.includes("grid")) score += 5;
  if (semanticCount >= 4) score += 5;
  if (html.includes('charset="UTF-8"')) score += 3;
  if (html.includes("transition") || html.includes("animation")) score += 3;

  score = Math.max(0, Math.min(100, score));
  const passed = score >= 70 && !issues.some(i => i.severity === "critical");

  return {
    score,
    passed,
    issues,
    recommendations,
  };
}

/**
 * Extract code sections from generated HTML
 */
export function extractCodeSections(html: string): {
  html: string;
  css: string;
  js: string;
} {
  // Extract CSS
  const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  const css = styleMatches
    .map(match => match.replace(/<\/?style[^>]*>/gi, ""))
    .join("\n\n");

  // Extract JS
  const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  const js = scriptMatches
    .filter(match => !match.includes("src=")) // Only inline scripts
    .map(match => match.replace(/<\/?script[^>]*>/gi, ""))
    .join("\n\n");

  return { html, css, js };
}

/**
 * Sanitize HTML to remove dangerous patterns
 */
export function sanitizeHtml(html: string): string {
  let sanitized = html;
  
  // Remove eval and Function calls
  sanitized = sanitized.replace(/eval\s*\(/g, "/* REMOVED: eval( */");
  sanitized = sanitized.replace(/Function\s*\(/g, "/* REMOVED: Function( */");
  
  // Remove document.write
  sanitized = sanitized.replace(/document\.write\s*\(/g, "/* REMOVED: document.write( */");
  
  return sanitized;
}
