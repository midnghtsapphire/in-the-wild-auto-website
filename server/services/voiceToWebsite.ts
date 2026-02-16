/**
 * Voice-to-Website Service
 * Revolutionary feature: speak your website idea, get a fully functional site
 * Uses speech recognition + AI prompt enhancement
 */

import { transcribeAudio } from "../_core/voiceTranscription";
import { invokeLLM } from "../_core/llm";

export interface VoiceToWebsiteResult {
  transcription: string;
  enhancedPrompt: string;
  detectedIntent: {
    websiteType: string;
    targetAudience: string;
    keyFeatures: string[];
    colorScheme?: string;
    style?: string;
  };
  confidence: number;
}

/**
 * Convert voice input to enhanced website generation prompt
 */
export async function processVoiceInput(
  audioUrl: string,
  language: string = "en"
): Promise<VoiceToWebsiteResult> {
  // Step 1: Transcribe audio to text
  const transcriptionResult = await transcribeAudio({
    audioUrl,
    language,
    prompt: "Website description, features, design preferences",
  });

  // Handle transcription errors
  if ('error' in transcriptionResult) {
    throw new Error(`Transcription failed: ${transcriptionResult.error}`);
  }

  const transcription = transcriptionResult.text;

  // Step 2: Enhance the transcription into a detailed prompt
  const enhancedPrompt = await enhanceVoicePrompt(transcription);

  // Step 3: Extract intent and metadata
  const intent = await extractIntent(transcription);

  return {
    transcription,
    enhancedPrompt,
    detectedIntent: intent,
    confidence: calculateConfidence(transcription, intent),
  };
}

/**
 * Enhance raw voice transcription into a detailed website generation prompt
 */
async function enhanceVoicePrompt(transcription: string): Promise<string> {
  const systemPrompt = `You are an expert prompt engineer for InTheWild AI Website Generator.
Transform casual voice descriptions into detailed, actionable website generation prompts.

Your task:
1. Identify the core website purpose and type
2. Infer missing details (color scheme, layout, features) based on context
3. Add professional design specifications
4. Include modern web best practices
5. Expand vague descriptions into specific requirements

Output a comprehensive prompt that will generate a high-quality website.`;

  const userPrompt = `Transform this voice description into a detailed website generation prompt:

"${transcription}"

Create a comprehensive prompt that includes:
- Website type and purpose
- Target audience
- Key features and sections
- Design style and color scheme
- Layout preferences
- Interactive elements
- Any specific requirements mentioned`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return (response.choices[0]?.message?.content as string) || transcription;
}

/**
 * Extract structured intent from voice transcription
 */
async function extractIntent(transcription: string): Promise<{
  websiteType: string;
  targetAudience: string;
  keyFeatures: string[];
  colorScheme?: string;
  style?: string;
}> {
  const systemPrompt = `Extract structured information from website descriptions.
Identify: website type, target audience, features, colors, and style.`;

  const userPrompt = `Extract intent from: "${transcription}"`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "intent_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              websiteType: { type: "string", description: "e.g., portfolio, e-commerce, blog" },
              targetAudience: { type: "string", description: "who the site is for" },
              keyFeatures: { type: "array", items: { type: "string" } },
              colorScheme: { type: "string", description: "color preferences if mentioned" },
              style: { type: "string", description: "design style if mentioned" },
            },
            required: ["websiteType", "targetAudience", "keyFeatures"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content as string;
    return JSON.parse(content);
  } catch (error) {
    console.error("[Intent Extraction] Failed:", error);
    return {
      websiteType: "general",
      targetAudience: "general audience",
      keyFeatures: ["homepage", "contact form"],
    };
  }
}

/**
 * Calculate confidence score for voice input processing
 */
function calculateConfidence(transcription: string, intent: any): number {
  let confidence = 50; // Base confidence

  // Length check
  if (transcription.length > 50) confidence += 10;
  if (transcription.length > 150) confidence += 10;

  // Intent completeness
  if (intent.websiteType && intent.websiteType !== "general") confidence += 10;
  if (intent.keyFeatures && intent.keyFeatures.length > 2) confidence += 10;
  if (intent.colorScheme) confidence += 5;
  if (intent.style) confidence += 5;

  return Math.min(100, confidence);
}

/**
 * Generate example voice prompts for user guidance
 */
export function getVoicePromptExamples(): string[] {
  return [
    "I need a portfolio website for a photographer. It should have a dark theme with a gallery grid, an about page, and a contact form. Make it modern and minimalist.",
    "Create an e-commerce site for selling handmade jewelry. I want a clean, elegant design with product cards, a shopping cart, and a checkout page. Use soft pastel colors.",
    "Build a landing page for a SaaS product. It should have a hero section with a demo video, feature highlights, pricing tiers, and testimonials. Make it professional and trustworthy.",
    "I want a blog for travel stories. Include a featured posts section, category filters, and a newsletter signup. Use vibrant colors and large images.",
  ];
}
