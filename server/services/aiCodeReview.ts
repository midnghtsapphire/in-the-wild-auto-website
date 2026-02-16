/**
 * AI Code Review Service
 * Revolutionary pre-deployment quality gate using GPT-4 level analysis
 * Analyzes generated code for quality, security, performance, and best practices
 */

import { invokeLLM } from "../_core/llm";

export interface CodeReviewResult {
  overallScore: number; // 0-100
  passed: boolean;
  qualityGrade: "A+" | "A" | "B" | "C" | "D" | "F";
  categories: {
    codeQuality: CategoryScore;
    security: CategoryScore;
    performance: CategoryScore;
    accessibility: CategoryScore;
    seo: CategoryScore;
    maintainability: CategoryScore;
  };
  criticalIssues: ReviewIssue[];
  suggestions: ReviewSuggestion[];
  autoFixAvailable: boolean;
  estimatedFixTime: string;
}

interface CategoryScore {
  score: number;
  grade: string;
  issues: string[];
  strengths: string[];
}

interface ReviewIssue {
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  location?: string;
  autoFixable: boolean;
}

interface ReviewSuggestion {
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  implementation: string;
}

/**
 * Perform comprehensive AI-powered code review
 */
export async function performAICodeReview(
  html: string,
  css: string,
  js: string
): Promise<CodeReviewResult> {
  const systemPrompt = `You are an expert code reviewer for InTheWild AI Website Generator.
Perform a comprehensive, professional code review of the generated website code.

Analyze these aspects:
1. Code Quality: Clean code, best practices, maintainability
2. Security: XSS vulnerabilities, injection risks, data validation
3. Performance: Load time, optimization, resource usage
4. Accessibility: WCAG 2.1 AA compliance, screen reader support
5. SEO: Meta tags, semantic HTML, performance metrics
6. Maintainability: Code organization, documentation, scalability

Provide a detailed review with:
- Overall quality score (0-100)
- Category-specific scores and grades
- Critical issues that MUST be fixed before deployment
- Actionable suggestions for improvement
- Auto-fix availability assessment

Be thorough but constructive. Focus on real issues, not nitpicks.`;

  const userPrompt = `Review this generated website code:

HTML (${html.length} chars):
\`\`\`html
${html.slice(0, 8000)}${html.length > 8000 ? "\n... (truncated)" : ""}
\`\`\`

CSS (${css.length} chars):
\`\`\`css
${css.slice(0, 3000)}${css.length > 3000 ? "\n... (truncated)" : ""}
\`\`\`

JavaScript (${js.length} chars):
\`\`\`javascript
${js.slice(0, 3000)}${js.length > 3000 ? "\n... (truncated)" : ""}
\`\`\`

Provide a comprehensive code review.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "code_review",
          strict: true,
          schema: {
            type: "object",
            properties: {
              overallScore: { type: "number", description: "Overall quality score 0-100" },
              qualityGrade: { type: "string", enum: ["A+", "A", "B", "C", "D", "F"] },
              categories: {
                type: "object",
                properties: {
                  codeQuality: { $ref: "#/$defs/categoryScore" },
                  security: { $ref: "#/$defs/categoryScore" },
                  performance: { $ref: "#/$defs/categoryScore" },
                  accessibility: { $ref: "#/$defs/categoryScore" },
                  seo: { $ref: "#/$defs/categoryScore" },
                  maintainability: { $ref: "#/$defs/categoryScore" },
                },
                required: ["codeQuality", "security", "performance", "accessibility", "seo", "maintainability"],
                additionalProperties: false,
              },
              criticalIssues: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                    category: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    location: { type: "string" },
                    autoFixable: { type: "boolean" },
                  },
                  required: ["severity", "category", "title", "description", "autoFixable"],
                  additionalProperties: false,
                },
              },
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    priority: { type: "string", enum: ["high", "medium", "low"] },
                    title: { type: "string" },
                    description: { type: "string" },
                    impact: { type: "string" },
                    implementation: { type: "string" },
                  },
                  required: ["priority", "title", "description", "impact", "implementation"],
                  additionalProperties: false,
                },
              },
              autoFixAvailable: { type: "boolean" },
              estimatedFixTime: { type: "string", description: "e.g., '5 minutes', '1 hour'" },
            },
            required: [
              "overallScore",
              "qualityGrade",
              "categories",
              "criticalIssues",
              "suggestions",
              "autoFixAvailable",
              "estimatedFixTime",
            ],
            additionalProperties: false,
            $defs: {
              categoryScore: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  grade: { type: "string" },
                  issues: { type: "array", items: { type: "string" } },
                  strengths: { type: "array", items: { type: "string" } },
                },
                required: ["score", "grade", "issues", "strengths"],
                additionalProperties: false,
              },
            },
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("Invalid AI response format");
    }

    const reviewData = JSON.parse(content) as CodeReviewResult;
    reviewData.passed = reviewData.overallScore >= 70 && reviewData.criticalIssues.filter(i => i.severity === "critical").length === 0;

    return reviewData;
  } catch (error: any) {
    console.error("[AI Code Review] Failed:", error);
    // Return fallback review
    return {
      overallScore: 50,
      passed: false,
      qualityGrade: "C",
      categories: {
        codeQuality: { score: 50, grade: "C", issues: ["AI review unavailable"], strengths: [] },
        security: { score: 50, grade: "C", issues: ["AI review unavailable"], strengths: [] },
        performance: { score: 50, grade: "C", issues: ["AI review unavailable"], strengths: [] },
        accessibility: { score: 50, grade: "C", issues: ["AI review unavailable"], strengths: [] },
        seo: { score: 50, grade: "C", issues: ["AI review unavailable"], strengths: [] },
        maintainability: { score: 50, grade: "C", issues: ["AI review unavailable"], strengths: [] },
      },
      criticalIssues: [
        {
          severity: "high",
          category: "system",
          title: "AI Code Review Failed",
          description: error.message || "Unable to perform AI code review",
          autoFixable: false,
        },
      ],
      suggestions: [],
      autoFixAvailable: false,
      estimatedFixTime: "N/A",
    };
  }
}

/**
 * Auto-fix common issues identified in code review
 */
export async function autoFixIssues(
  html: string,
  issues: ReviewIssue[]
): Promise<{ fixed: string; appliedFixes: string[] }> {
  const fixableIssues = issues.filter(i => i.autoFixable);
  if (fixableIssues.length === 0) {
    return { fixed: html, appliedFixes: [] };
  }

  const systemPrompt = `You are an expert code fixer for InTheWild.
Apply the specified fixes to the HTML code while preserving functionality and design.
Return ONLY the fixed HTML code, no explanations.`;

  const userPrompt = `Fix these issues in the HTML:

${fixableIssues.map((issue, i) => `${i + 1}. ${issue.title}: ${issue.description}`).join("\n")}

Original HTML:
\`\`\`html
${html}
\`\`\`

Return the fixed HTML code.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const fixedHtml = response.choices[0]?.message?.content as string || html;
    const appliedFixes = fixableIssues.map(i => i.title);

    return { fixed: fixedHtml, appliedFixes };
  } catch (error) {
    console.error("[Auto-fix] Failed:", error);
    return { fixed: html, appliedFixes: [] };
  }
}
