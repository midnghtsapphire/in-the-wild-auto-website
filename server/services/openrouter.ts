/**
 * OpenRouter Parallel LLM Service
 * Sends prompts to 2 free uncensored models simultaneously via OpenRouter API.
 * Falls back to built-in LLM if OpenRouter key is not available.
 */

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Free uncensored models available on OpenRouter
export const FREE_MODELS = {
  model1: "nousresearch/hermes-3-llama-3.1-405b:free",
  model2: "mistralai/mistral-7b-instruct:free",
};

export const PREMIUM_MODELS = {
  model1: "anthropic/claude-3.5-sonnet",
  model2: "openai/gpt-4o",
  model3: "google/gemini-2.0-flash-exp:free",
};

export interface LLMResponse {
  model: string;
  content: string;
  tokensInput: number;
  tokensOutput: number;
  totalTokens: number;
  latencyMs: number;
  status: "completed" | "failed";
  error?: string;
}

export interface ParallelResult {
  responses: LLMResponse[];
  bestResponse: LLMResponse | null;
  totalTokens: number;
}

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not configured");
  return key;
}

async function callModel(model: string, systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
  const start = Date.now();
  try {
    const apiKey = getApiKey();
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://inthewild.app",
        "X-Title": "InTheWild AI Website Generator",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 16384,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - start;
    const content = data.choices?.[0]?.message?.content || "";
    const usage = data.usage || {};

    return {
      model,
      content,
      tokensInput: usage.prompt_tokens || 0,
      tokensOutput: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      latencyMs,
      status: "completed",
    };
  } catch (error: any) {
    return {
      model,
      content: "",
      tokensInput: 0,
      tokensOutput: 0,
      totalTokens: 0,
      latencyMs: Date.now() - start,
      status: "failed",
      error: error.message,
    };
  }
}

/**
 * Generate website code by sending to 2 models in parallel.
 * Automatically picks the best response based on code quality heuristics.
 */
export async function generateParallel(
  userPrompt: string,
  isPremium: boolean = false
): Promise<ParallelResult> {
  const models = isPremium
    ? [PREMIUM_MODELS.model1, PREMIUM_MODELS.model2]
    : [FREE_MODELS.model1, FREE_MODELS.model2];

  const systemPrompt = `You are InTheWild, an expert AI website generator. Generate a complete, functional, production-ready website based on the user's description.

REQUIREMENTS:
- Output a SINGLE self-contained HTML file with embedded CSS and JavaScript
- Use modern CSS (flexbox, grid, custom properties, gradients)
- Include responsive design (mobile-first)
- Add smooth animations and transitions
- Use semantic HTML5 elements
- Include proper meta tags for SEO
- Add accessibility attributes (aria-labels, alt text)
- Make it visually stunning with a professional color scheme
- Include interactive elements where appropriate
- Add a footer with "Built with InTheWild — AI Website Generator"

OUTPUT FORMAT:
Return ONLY the HTML code. Do not include markdown code fences or explanations.
Start with <!DOCTYPE html> and end with </html>.`;

  const results = await Promise.allSettled(
    models.map(model => callModel(model, systemPrompt, userPrompt))
  );

  const responses: LLMResponse[] = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      model: models[i],
      content: "",
      tokensInput: 0,
      tokensOutput: 0,
      totalTokens: 0,
      latencyMs: 0,
      status: "failed" as const,
      error: r.reason?.message || "Unknown error",
    };
  });

  // Pick best response using quality scoring
  const bestResponse = pickBest(responses);
  const totalTokens = responses.reduce((sum, r) => sum + r.totalTokens, 0);

  return { responses, bestResponse, totalTokens };
}

/**
 * Score and pick the best response from parallel model outputs
 */
function pickBest(responses: LLMResponse[]): LLMResponse | null {
  const completed = responses.filter(r => r.status === "completed" && r.content.length > 0);
  if (completed.length === 0) return null;
  if (completed.length === 1) return completed[0];

  // Score each response
  const scored = completed.map(r => ({
    response: r,
    score: scoreResponse(r.content),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0].response;
}

function scoreResponse(html: string): number {
  let score = 0;
  // Has valid HTML structure
  if (html.includes("<!DOCTYPE html>") || html.includes("<!doctype html>")) score += 10;
  if (html.includes("<html")) score += 5;
  if (html.includes("<head>")) score += 5;
  if (html.includes("<body")) score += 5;
  if (html.includes("</html>")) score += 5;
  // Has CSS
  if (html.includes("<style>") || html.includes("<style ")) score += 10;
  // Has responsive design
  if (html.includes("@media")) score += 10;
  if (html.includes("viewport")) score += 5;
  // Has JavaScript
  if (html.includes("<script>") || html.includes("<script ")) score += 5;
  // Has semantic elements
  if (html.includes("<header")) score += 3;
  if (html.includes("<nav")) score += 3;
  if (html.includes("<main")) score += 3;
  if (html.includes("<footer")) score += 3;
  // Has accessibility
  if (html.includes("aria-")) score += 5;
  if (html.includes("alt=")) score += 3;
  // Length bonus (more content = more complete)
  score += Math.min(html.length / 500, 20);
  // Has modern CSS features
  if (html.includes("flex")) score += 3;
  if (html.includes("grid")) score += 3;
  if (html.includes("var(--")) score += 3;
  if (html.includes("gradient")) score += 2;
  if (html.includes("transition")) score += 2;
  if (html.includes("animation")) score += 2;
  return score;
}

/**
 * List available models for the user's tier
 */
export function getAvailableModels(isPremium: boolean) {
  if (isPremium) {
    return {
      free: Object.entries(FREE_MODELS).map(([k, v]) => ({ id: k, model: v, tier: "free" })),
      premium: Object.entries(PREMIUM_MODELS).map(([k, v]) => ({ id: k, model: v, tier: "premium" })),
    };
  }
  return {
    free: Object.entries(FREE_MODELS).map(([k, v]) => ({ id: k, model: v, tier: "free" })),
    premium: [],
  };
}
