/**
 * Competitor Analysis Service
 * Revolutionary feature: paste a competitor's URL, get an AI-generated better version
 * Scrapes, analyzes, and generates an improved website
 */

import { invokeLLM } from "../_core/llm";

export interface CompetitorAnalysisResult {
  originalUrl: string;
  analysis: {
    strengths: string[];
    weaknesses: string[];
    missingFeatures: string[];
    designIssues: string[];
    performanceIssues: string[];
    seoIssues: string[];
  };
  improvements: {
    category: string;
    suggestion: string;
    impact: "high" | "medium" | "low";
  }[];
  generatedPrompt: string;
  estimatedImprovement: number; // percentage
}

/**
 * Analyze a competitor's website and generate improvement recommendations
 */
export async function analyzeCompetitor(url: string): Promise<CompetitorAnalysisResult> {
  // Step 1: Scrape the competitor's website
  const scrapedContent = await scrapeWebsite(url);

  // Step 2: AI analysis of the competitor's site
  const analysis = await performAIAnalysis(url, scrapedContent);

  // Step 3: Generate improvement prompt
  const generatedPrompt = await generateImprovementPrompt(analysis, scrapedContent);

  return {
    originalUrl: url,
    analysis: analysis.analysis,
    improvements: analysis.improvements,
    generatedPrompt,
    estimatedImprovement: analysis.estimatedImprovement,
  };
}

/**
 * Scrape website content (HTML, text, metadata)
 */
async function scrapeWebsite(url: string): Promise<{
  html: string;
  text: string;
  title: string;
  meta: Record<string, string>;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; InTheWild/1.0; +https://inthewild.app)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();

    // Extract text content (remove tags)
    const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000); // Limit text length

    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : "";

    // Extract meta tags
    const meta: Record<string, string> = {};
    const metaRegex = /<meta[^>]+name=["']([^"']+)["'][^>]+content=["']([^"']+)["']/gi;
    let metaMatch;
    while ((metaMatch = metaRegex.exec(html)) !== null) {
      meta[metaMatch[1]] = metaMatch[2];
    }

    return { html: html.slice(0, 10000), text, title, meta };
  } catch (error: any) {
    console.error("[Scraper] Failed:", error);
    return {
      html: "",
      text: "",
      title: "",
      meta: {},
    };
  }
}

/**
 * Perform AI-powered analysis of competitor's website
 */
async function performAIAnalysis(
  url: string,
  content: { html: string; text: string; title: string; meta: Record<string, string> }
): Promise<{
  analysis: CompetitorAnalysisResult["analysis"];
  improvements: CompetitorAnalysisResult["improvements"];
  estimatedImprovement: number;
}> {
  const systemPrompt = `You are an expert website analyst for InTheWild.
Analyze competitor websites and identify opportunities for improvement.

Focus on:
1. Design quality and user experience
2. Missing features and functionality
3. Performance and technical issues
4. SEO optimization gaps
5. Accessibility problems
6. Content quality and messaging

Provide actionable insights that will help generate a superior version.`;

  const userPrompt = `Analyze this competitor website and identify improvement opportunities:

URL: ${url}
Title: ${content.title}
Meta Description: ${content.meta.description || "N/A"}

Content Preview:
${content.text.slice(0, 2000)}

HTML Structure Preview:
${content.html.slice(0, 1500)}

Provide a comprehensive analysis with strengths, weaknesses, and specific improvement recommendations.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "competitor_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              analysis: {
                type: "object",
                properties: {
                  strengths: { type: "array", items: { type: "string" } },
                  weaknesses: { type: "array", items: { type: "string" } },
                  missingFeatures: { type: "array", items: { type: "string" } },
                  designIssues: { type: "array", items: { type: "string" } },
                  performanceIssues: { type: "array", items: { type: "string" } },
                  seoIssues: { type: "array", items: { type: "string" } },
                },
                required: ["strengths", "weaknesses", "missingFeatures", "designIssues", "performanceIssues", "seoIssues"],
                additionalProperties: false,
              },
              improvements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    suggestion: { type: "string" },
                    impact: { type: "string", enum: ["high", "medium", "low"] },
                  },
                  required: ["category", "suggestion", "impact"],
                  additionalProperties: false,
                },
              },
              estimatedImprovement: { type: "number", description: "percentage improvement 0-100" },
            },
            required: ["analysis", "improvements", "estimatedImprovement"],
            additionalProperties: false,
          },
        },
      },
    });

    const result = JSON.parse(response.choices[0]?.message?.content as string);
    return result;
  } catch (error) {
    console.error("[AI Analysis] Failed:", error);
    return {
      analysis: {
        strengths: ["Unable to analyze"],
        weaknesses: ["Analysis failed"],
        missingFeatures: [],
        designIssues: [],
        performanceIssues: [],
        seoIssues: [],
      },
      improvements: [],
      estimatedImprovement: 0,
    };
  }
}

/**
 * Generate an improved website prompt based on competitor analysis
 */
async function generateImprovementPrompt(
  analysis: any,
  content: { title: string; text: string }
): Promise<string> {
  const systemPrompt = `You are a prompt engineer for InTheWild.
Generate a detailed website creation prompt that improves upon a competitor's site.

Include:
- All the good aspects from the original
- Fixes for identified weaknesses
- Additional features that were missing
- Modern design improvements
- Better UX and accessibility
- Enhanced performance and SEO`;

  const userPrompt = `Create an improved website prompt based on this analysis:

Original Title: ${content.title}
Strengths: ${analysis.analysis.strengths.join(", ")}
Weaknesses: ${analysis.analysis.weaknesses.join(", ")}
Missing Features: ${analysis.analysis.missingFeatures.join(", ")}
Design Issues: ${analysis.analysis.designIssues.join(", ")}

Generate a comprehensive prompt that will create a superior version of this website.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return (response.choices[0]?.message?.content as string) || "Create an improved website";
}

/**
 * Generate a better version of a competitor's website
 */
export async function generateBetterVersion(
  analysisResult: CompetitorAnalysisResult
): Promise<string> {
  // This would call the main website generation service with the improved prompt
  return analysisResult.generatedPrompt;
}
