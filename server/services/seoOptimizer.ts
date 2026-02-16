/**
 * Auto-SEO Optimizer Service
 * Revolutionary feature: one-click SEO optimization
 * Automatically improves meta tags, schema.org, performance, and search rankings
 */

import { invokeLLM } from "../_core/llm";

export interface SEOOptimizationResult {
  originalScore: number;
  optimizedScore: number;
  improvements: SEOImprovement[];
  optimizedHtml: string;
  recommendations: SEORecommendation[];
  estimatedTrafficIncrease: number; // percentage
}

export interface SEOImprovement {
  category: string;
  before: string;
  after: string;
  impact: "high" | "medium" | "low";
  explanation: string;
}

export interface SEORecommendation {
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  implementation: string;
}

/**
 * Analyze and optimize HTML for SEO
 */
export async function optimizeForSEO(
  html: string,
  websiteTitle?: string,
  websiteDescription?: string
): Promise<SEOOptimizationResult> {
  // Step 1: Calculate initial SEO score
  const originalScore = calculateSEOScore(html);

  // Step 2: AI-powered optimization
  const optimizationResult = await performAIOptimization(html, websiteTitle, websiteDescription);

  // Step 3: Calculate new score
  const optimizedScore = calculateSEOScore(optimizationResult.optimizedHtml);

  return {
    originalScore,
    optimizedScore,
    improvements: optimizationResult.improvements,
    optimizedHtml: optimizationResult.optimizedHtml,
    recommendations: optimizationResult.recommendations,
    estimatedTrafficIncrease: Math.min(((optimizedScore - originalScore) / originalScore) * 100, 150),
  };
}

/**
 * Calculate SEO score based on on-page factors
 */
function calculateSEOScore(html: string): number {
  let score = 50; // Base score

  // Title tag
  if (html.includes("<title>")) score += 10;
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1].length > 30 && titleMatch[1].length < 60) score += 5;

  // Meta description
  if (html.includes('name="description"')) score += 10;
  const descMatch = html.match(/name="description"\s+content="([^"]+)"/i);
  if (descMatch && descMatch[1].length > 120 && descMatch[1].length < 160) score += 5;

  // Viewport meta tag
  if (html.includes('name="viewport"')) score += 5;

  // Headings
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  if (h1Count === 1) score += 5;
  if ((html.match(/<h[2-6][^>]*>/gi) || []).length > 2) score += 5;

  // Images with alt text
  const images = (html.match(/<img[^>]*>/gi) || []).length;
  const imagesWithAlt = (html.match(/<img[^>]*alt=/gi) || []).length;
  if (images > 0 && imagesWithAlt === images) score += 10;
  else if (images > 0 && imagesWithAlt > 0) score += 5;

  // Semantic HTML
  const semanticTags = ["<header", "<nav", "<main", "<article", "<section", "<footer"];
  const semanticCount = semanticTags.filter(tag => html.includes(tag)).length;
  score += Math.min(semanticCount * 2, 10);

  // Schema.org markup
  if (html.includes("schema.org") || html.includes("@context")) score += 10;

  // Mobile responsiveness
  if (html.includes("@media")) score += 5;

  // Performance signals
  if (html.includes("async") || html.includes("defer")) score += 3;

  // Open Graph tags
  if (html.includes('property="og:')) score += 5;

  // Twitter Card tags
  if (html.includes('name="twitter:')) score += 3;

  // Canonical tag
  if (html.includes('rel="canonical"')) score += 3;

  // Internal links
  if ((html.match(/<a[^>]*href="\/[^"]*"/gi) || []).length > 2) score += 5;

  return Math.min(100, score);
}

/**
 * Perform AI-powered SEO optimization
 */
async function performAIOptimization(
  html: string,
  websiteTitle?: string,
  websiteDescription?: string
): Promise<{
  optimizedHtml: string;
  improvements: SEOImprovement[];
  recommendations: SEORecommendation[];
}> {
  const systemPrompt = `You are an expert SEO specialist for InTheWild.
Optimize HTML for search engine rankings and user engagement.

Your task:
1. Enhance meta tags (title, description, keywords)
2. Add schema.org structured data
3. Improve heading hierarchy
4. Add Open Graph and Twitter Card tags
5. Optimize images with proper alt text
6. Improve internal linking
7. Add performance optimization hints
8. Ensure mobile-first approach

Return the optimized HTML and list all improvements made.`;

  const userPrompt = `Optimize this HTML for SEO:

Website Title: ${websiteTitle || "Not provided"}
Website Description: ${websiteDescription || "Not provided"}

HTML (${html.length} chars):
\`\`\`html
${html.slice(0, 8000)}${html.length > 8000 ? "\n... (truncated)" : ""}
\`\`\`

Provide:
1. Optimized HTML with all SEO improvements
2. List of specific improvements made
3. Recommendations for further optimization`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "seo_optimization",
          strict: true,
          schema: {
            type: "object",
            properties: {
              optimizedHtml: { type: "string" },
              improvements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    before: { type: "string" },
                    after: { type: "string" },
                    impact: { type: "string", enum: ["high", "medium", "low"] },
                    explanation: { type: "string" },
                  },
                  required: ["category", "before", "after", "impact", "explanation"],
                  additionalProperties: false,
                },
              },
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                    title: { type: "string" },
                    description: { type: "string" },
                    implementation: { type: "string" },
                  },
                  required: ["priority", "title", "description", "implementation"],
                  additionalProperties: false,
                },
              },
            },
            required: ["optimizedHtml", "improvements", "recommendations"],
            additionalProperties: false,
          },
        },
      },
    });

    return JSON.parse(response.choices[0]?.message?.content as string);
  } catch (error) {
    console.error("[SEO Optimization] Failed:", error);
    return {
      optimizedHtml: html,
      improvements: [],
      recommendations: [{ priority: "high", title: "SEO optimization failed", description: "Unable to optimize", implementation: "Try again later" }],
    };
  }
}

/**
 * Generate SEO-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate meta description from content
 */
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  const text = content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Generate Open Graph tags
 */
export function generateOpenGraphTags(
  title: string,
  description: string,
  imageUrl?: string,
  url?: string
): string {
  const tags = [
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:type" content="website" />`,
  ];

  if (imageUrl) {
    tags.push(`<meta property="og:image" content="${escapeHtml(imageUrl)}" />`);
  }

  if (url) {
    tags.push(`<meta property="og:url" content="${escapeHtml(url)}" />`);
  }

  return tags.join("\n");
}

/**
 * Generate Twitter Card tags
 */
export function generateTwitterCardTags(
  title: string,
  description: string,
  imageUrl?: string
): string {
  const tags = [
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  ];

  if (imageUrl) {
    tags.push(`<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`);
  }

  return tags.join("\n");
}

/**
 * Generate schema.org structured data
 */
export function generateSchemaOrgMarkup(
  type: "Organization" | "LocalBusiness" | "Product" | "Article",
  data: Record<string, any>
): string {
  const schema = {
    "@context": "https://schema.org/",
    "@type": type,
    ...data,
  };

  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
