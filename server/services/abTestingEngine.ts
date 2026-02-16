/**
 * A/B Testing Engine
 * Revolutionary feature: built-in A/B testing with automatic variant generation
 * Create, run, and analyze A/B tests directly in InTheWild
 */

import { invokeLLM } from "../_core/llm";

export interface ABTest {
  id: string;
  projectId: number;
  name: string;
  description: string;
  status: "draft" | "running" | "completed" | "paused";
  controlVariant: Variant;
  testVariants: Variant[];
  trafficAllocation: Record<string, number>; // variantId -> percentage
  startDate?: Date;
  endDate?: Date;
  minSampleSize: number;
  confidenceLevel: number; // 0.90, 0.95, 0.99
  results?: ABTestResults;
}

export interface Variant {
  id: string;
  name: string;
  description: string;
  htmlChanges: string;
  cssChanges: string;
  jsChanges: string;
  generatedPrompt?: string;
}

export interface ABTestResults {
  controlMetrics: VariantMetrics;
  testMetrics: Record<string, VariantMetrics>;
  winner?: string;
  confidence: number; // 0-1
  statisticalSignificance: boolean;
  recommendations: string[];
}

export interface VariantMetrics {
  visitors: number;
  conversions: number;
  conversionRate: number;
  avgSessionDuration: number;
  bounceRate: number;
  revenue?: number;
}

/**
 * Generate A/B test variants automatically
 */
export async function generateABTestVariants(
  html: string,
  testType: "headline" | "cta" | "layout" | "colors" | "images" | "copy",
  numberOfVariants: number = 2
): Promise<Variant[]> {
  const systemPrompt = `You are an expert A/B testing specialist for InTheWild.
Generate high-performing A/B test variants for websites.

For each variant:
1. Make focused, testable changes
2. Keep changes isolated to one element
3. Base changes on conversion optimization best practices
4. Provide clear descriptions of what changed and why
5. Ensure variants maintain design consistency

Test Type: ${testType}
Generate ${numberOfVariants} variants plus the control.`;

  const userPrompt = `Generate A/B test variants for this website:

Test Type: ${testType}
Number of Variants: ${numberOfVariants}

HTML:
\`\`\`html
${html.slice(0, 8000)}
\`\`\`

Create ${numberOfVariants} distinct variants with different approaches to ${testType}.
Each variant should have a clear hypothesis about why it will perform better.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ab_test_variants",
          strict: true,
          schema: {
            type: "object",
            properties: {
              variants: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    htmlChanges: { type: "string" },
                    cssChanges: { type: "string" },
                    jsChanges: { type: "string" },
                    generatedPrompt: { type: "string" },
                  },
                  required: ["name", "description", "htmlChanges", "cssChanges", "jsChanges"],
                  additionalProperties: false,
                },
              },
            },
            required: ["variants"],
            additionalProperties: false,
          },
        },
      },
    });

    const data = JSON.parse(response.choices[0]?.message?.content as string);

    return data.variants.map((v: any, i: number) => ({
      id: `variant-${i}`,
      name: v.name,
      description: v.description,
      htmlChanges: v.htmlChanges,
      cssChanges: v.cssChanges,
      jsChanges: v.jsChanges,
      generatedPrompt: v.generatedPrompt,
    }));
  } catch (error) {
    console.error("[AB Test Generation] Failed:", error);
    return [];
  }
}

/**
 * Calculate statistical significance of A/B test results
 */
export function calculateStatisticalSignificance(
  controlMetrics: VariantMetrics,
  testMetrics: VariantMetrics,
  confidenceLevel: number = 0.95
): {
  significant: boolean;
  confidence: number;
  pValue: number;
  zScore: number;
} {
  // Chi-square test for conversion rates
  const controlConversions = controlMetrics.conversions;
  const controlVisitors = controlMetrics.visitors;
  const testConversions = testMetrics.conversions;
  const testVisitors = testMetrics.visitors;

  const controlRate = controlConversions / controlVisitors;
  const testRate = testConversions / testVisitors;
  const pooledRate = (controlConversions + testConversions) / (controlVisitors + testVisitors);

  const se = Math.sqrt(pooledRate * (1 - pooledRate) * (1 / controlVisitors + 1 / testVisitors));
  const zScore = (testRate - controlRate) / se;

  // Convert z-score to p-value (two-tailed)
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

  // Determine confidence level
  const significanceThreshold = 1 - confidenceLevel;
  const significant = pValue < significanceThreshold;
  const confidence = Math.max(0, 1 - pValue);

  return { significant, confidence, pValue, zScore };
}

/**
 * Normal CDF approximation
 */
function normalCDF(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * z);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Calculate required sample size for A/B test
 */
export function calculateRequiredSampleSize(
  baselineConversionRate: number,
  minimumDetectableEffect: number = 0.1,
  confidenceLevel: number = 0.95,
  statisticalPower: number = 0.8
): number {
  // Using simplified formula for sample size calculation
  const zAlpha = getZScore(1 - confidenceLevel / 2);
  const zBeta = getZScore(statisticalPower);

  const p1 = baselineConversionRate;
  const p2 = baselineConversionRate * (1 + minimumDetectableEffect);
  const pBar = (p1 + p2) / 2;

  const n = Math.pow(zAlpha + zBeta, 2) * (2 * pBar * (1 - pBar)) / Math.pow(p2 - p1, 2);

  return Math.ceil(n);
}

function getZScore(confidence: number): number {
  // Approximate z-score from confidence level
  const zScores: Record<number, number> = {
    0.84: 1.0,
    0.90: 1.28,
    0.95: 1.96,
    0.975: 2.24,
    0.99: 2.58,
  };

  for (const [conf, z] of Object.entries(zScores)) {
    if (confidence <= parseFloat(conf)) return z;
  }

  return 2.58; // Default to 99% confidence
}

/**
 * Analyze A/B test results and provide recommendations
 */
export function analyzeABTestResults(test: ABTest): ABTestResults {
  if (!test.results) {
    throw new Error("No results available for analysis");
  }

  const controlMetrics = test.results.controlMetrics;
  const testMetricsArray = Object.entries(test.results.testMetrics);

  const recommendations: string[] = [];
  let winner: string | undefined;
  let bestPerformance = controlMetrics.conversionRate;

  // Find best performing variant
  for (const [variantId, metrics] of testMetricsArray) {
    if (metrics.conversionRate > bestPerformance) {
      bestPerformance = metrics.conversionRate;
      winner = variantId;
    }
  }

  // Generate recommendations
  if (winner) {
    const improvementPercent = ((bestPerformance - controlMetrics.conversionRate) / controlMetrics.conversionRate * 100).toFixed(2);
    recommendations.push(`Deploy ${winner} - it outperformed the control by ${improvementPercent}%`);
  } else {
    recommendations.push("No significant winner detected. Consider running the test longer.");
  }

  recommendations.push("Monitor performance after deployment");
  recommendations.push("Consider running follow-up tests on other elements");

  return {
    controlMetrics,
    testMetrics: test.results.testMetrics,
    winner,
    confidence: test.results.confidence,
    statisticalSignificance: test.results.statisticalSignificance,
    recommendations,
  };
}

/**
 * Generate A/B test report
 */
export function generateABTestReport(test: ABTest): string {
  if (!test.results) return "No results available";

  const results = test.results;
  const controlRate = results.controlMetrics.conversionRate;

  return `
# A/B Test Report: ${test.name}

## Test Overview
- **Description**: ${test.description}
- **Status**: ${test.status}
- **Confidence Level**: ${(test.confidenceLevel * 100).toFixed(0)}%
- **Statistical Significance**: ${results.statisticalSignificance ? "Yes" : "No"}

## Results

### Control Variant
- Visitors: ${results.controlMetrics.visitors.toLocaleString()}
- Conversions: ${results.controlMetrics.conversions}
- Conversion Rate: ${(controlRate * 100).toFixed(2)}%
- Avg Session Duration: ${results.controlMetrics.avgSessionDuration}s
- Bounce Rate: ${(results.controlMetrics.bounceRate * 100).toFixed(2)}%

### Test Variants
${Object.entries(results.testMetrics)
  .map(([variantId, metrics]) => {
    const improvement = ((metrics.conversionRate - controlRate) / controlRate * 100).toFixed(2);
    return `
#### ${variantId}
- Visitors: ${metrics.visitors.toLocaleString()}
- Conversions: ${metrics.conversions}
- Conversion Rate: ${(metrics.conversionRate * 100).toFixed(2)}%
- Improvement: ${improvement}%
- Avg Session Duration: ${metrics.avgSessionDuration}s
- Bounce Rate: ${(metrics.bounceRate * 100).toFixed(2)}%
`;
  })
  .join("\n")}

## Winner: ${results.winner || "No significant winner"}

## Recommendations
${results.recommendations.map(r => `- ${r}`).join("\n")}

---
Generated by InTheWild A/B Testing Engine
`;
}
