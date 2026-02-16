/**
 * AI-Powered Accessibility Auto-Fixer
 * Revolutionary feature: automatic WCAG 2.1 AA compliance
 * Scans and fixes accessibility issues in generated websites
 */

import { invokeLLM } from "../_core/llm";

export interface AccessibilityAuditResult {
  score: number; // 0-100
  wcagLevel: "A" | "AA" | "AAA" | "None";
  issues: AccessibilityIssue[];
  autoFixable: number;
  manualReviewRequired: number;
}

export interface AccessibilityIssue {
  id: string;
  severity: "critical" | "serious" | "moderate" | "minor";
  wcagCriteria: string;
  title: string;
  description: string;
  affectedElements: string;
  autoFixable: boolean;
  suggestion: string;
}

export interface AccessibilityFixResult {
  fixedHtml: string;
  appliedFixes: {
    issueId: string;
    title: string;
    description: string;
  }[];
  remainingIssues: AccessibilityIssue[];
  wcagScore: number;
}

/**
 * Audit HTML for accessibility issues
 */
export async function auditAccessibility(html: string): Promise<AccessibilityAuditResult> {
  const systemPrompt = `You are an expert accessibility auditor for InTheWild.
Analyze HTML for WCAG 2.1 AA compliance issues.

Check for:
1. Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
2. Missing alt text on images
3. Proper heading hierarchy (h1-h6)
4. Form labels and ARIA attributes
5. Keyboard navigation support
6. Focus indicators
7. Semantic HTML usage
8. Language declaration
9. Skip links
10. Video/audio captions

Provide detailed findings with WCAG criteria references.`;

  const userPrompt = `Audit this HTML for accessibility compliance:

\`\`\`html
${html.slice(0, 10000)}${html.length > 10000 ? "\n... (truncated)" : ""}
\`\`\`

Identify all WCAG 2.1 AA compliance issues and rate their severity.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "accessibility_audit",
          strict: true,
          schema: {
            type: "object",
            properties: {
              score: { type: "number", description: "0-100 score" },
              wcagLevel: { type: "string", enum: ["A", "AA", "AAA", "None"] },
              issues: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    severity: { type: "string", enum: ["critical", "serious", "moderate", "minor"] },
                    wcagCriteria: { type: "string", description: "e.g., 1.4.3 Contrast (Minimum)" },
                    title: { type: "string" },
                    description: { type: "string" },
                    affectedElements: { type: "string" },
                    autoFixable: { type: "boolean" },
                    suggestion: { type: "string" },
                  },
                  required: ["id", "severity", "wcagCriteria", "title", "description", "affectedElements", "autoFixable", "suggestion"],
                  additionalProperties: false,
                },
              },
            },
            required: ["score", "wcagLevel", "issues"],
            additionalProperties: false,
          },
        },
      },
    });

    const auditData = JSON.parse(response.choices[0]?.message?.content as string);
    const autoFixable = auditData.issues.filter((i: any) => i.autoFixable).length;
    const manualReviewRequired = auditData.issues.filter((i: any) => !i.autoFixable).length;

    return {
      ...auditData,
      autoFixable,
      manualReviewRequired,
    };
  } catch (error) {
    console.error("[Accessibility Audit] Failed:", error);
    return {
      score: 50,
      wcagLevel: "None",
      issues: [
        {
          id: "error",
          severity: "critical",
          wcagCriteria: "N/A",
          title: "Audit failed",
          description: "Unable to perform accessibility audit",
          affectedElements: "All",
          autoFixable: false,
          suggestion: "Try again later",
        },
      ],
      autoFixable: 0,
      manualReviewRequired: 1,
    };
  }
}

/**
 * Auto-fix accessibility issues
 */
export async function autoFixAccessibility(
  html: string,
  issues: AccessibilityIssue[]
): Promise<AccessibilityFixResult> {
  const fixableIssues = issues.filter(i => i.autoFixable);

  if (fixableIssues.length === 0) {
    return {
      fixedHtml: html,
      appliedFixes: [],
      remainingIssues: issues,
      wcagScore: 0,
    };
  }

  const systemPrompt = `You are an expert accessibility fixer for InTheWild.
Apply automated fixes to make HTML WCAG 2.1 AA compliant.

Common fixes:
1. Add alt text to images
2. Add aria-labels to buttons
3. Fix heading hierarchy
4. Add form labels
5. Improve color contrast
6. Add skip links
7. Add focus indicators
8. Use semantic HTML

Return the fixed HTML that maintains functionality and design.`;

  const userPrompt = `Fix these accessibility issues:

Issues to fix (${fixableIssues.length}):
${fixableIssues.map((i, idx) => `${idx + 1}. ${i.title} (${i.wcagCriteria}): ${i.suggestion}`).join("\n")}

Original HTML:
\`\`\`html
${html.slice(0, 8000)}
\`\`\`

Apply all fixes and return the corrected HTML.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const fixedHtml = (response.choices[0]?.message?.content as string) || html;

    // Re-audit to get new score
    const newAudit = await auditAccessibility(fixedHtml);

    return {
      fixedHtml,
      appliedFixes: fixableIssues.map(i => ({
        issueId: i.id,
        title: i.title,
        description: i.description,
      })),
      remainingIssues: newAudit.issues,
      wcagScore: newAudit.score,
    };
  } catch (error) {
    console.error("[Accessibility Fix] Failed:", error);
    return {
      fixedHtml: html,
      appliedFixes: [],
      remainingIssues: issues,
      wcagScore: 0,
    };
  }
}

/**
 * Generate accessibility report
 */
export function generateAccessibilityReport(audit: AccessibilityAuditResult): string {
  const criticalCount = audit.issues.filter(i => i.severity === "critical").length;
  const seriousCount = audit.issues.filter(i => i.severity === "serious").length;
  const moderateCount = audit.issues.filter(i => i.severity === "moderate").length;
  const minorCount = audit.issues.filter(i => i.severity === "minor").length;

  return `
# Accessibility Audit Report

## Overall Score: ${audit.score}/100
## WCAG Level: ${audit.wcagLevel}

## Issue Summary
- Critical: ${criticalCount}
- Serious: ${seriousCount}
- Moderate: ${moderateCount}
- Minor: ${minorCount}

## Auto-Fixable Issues: ${audit.autoFixable}
## Manual Review Required: ${audit.manualReviewRequired}

## Detailed Issues
${audit.issues
  .map(
    issue => `
### ${issue.title}
- **Severity**: ${issue.severity}
- **WCAG Criteria**: ${issue.wcagCriteria}
- **Description**: ${issue.description}
- **Affected Elements**: ${issue.affectedElements}
- **Auto-Fixable**: ${issue.autoFixable ? "Yes" : "No"}
- **Suggestion**: ${issue.suggestion}
`
  )
  .join("\n")}
`;
}

/**
 * Add common accessibility enhancements
 */
export function addAccessibilityEnhancements(html: string): string {
  let enhanced = html;

  // Add language attribute if missing
  if (!enhanced.includes('lang="')) {
    enhanced = enhanced.replace(/<html[^>]*>/i, match => match.replace(">", ' lang="en">'));
  }

  // Add skip to main link if missing
  if (!enhanced.includes("skip")) {
    const skipLink = `<a href="#main" class="sr-only">Skip to main content</a>`;
    enhanced = enhanced.replace(/<body[^>]*>/i, match => match + skipLink);
  }

  // Add main landmark if missing
  if (!enhanced.includes("<main")) {
    enhanced = enhanced.replace(/<\/body>/i, "</main>\n</body>");
    enhanced = enhanced.replace(/<body[^>]*>/i, match => match + "\n<main id=\"main\">");
  }

  // Add screen reader only CSS if missing
  if (!enhanced.includes("sr-only")) {
    const srOnlyCSS = `
    <style>
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    </style>
    `;
    enhanced = enhanced.replace(/<\/head>/i, srOnlyCSS + "\n</head>");
  }

  return enhanced;
}
