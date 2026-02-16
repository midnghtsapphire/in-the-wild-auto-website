/**
 * Template DNA Mixer
 * Revolutionary feature: combine features from multiple templates to create unique hybrids
 * Extract "DNA" (features, styles, components) and intelligently merge them
 */

import { invokeLLM } from "../_core/llm";

export interface TemplateDNA {
  templateId: number;
  templateName: string;
  features: DNAFeature[];
  styleGenes: StyleGene[];
  componentGenes: ComponentGene[];
}

export interface DNAFeature {
  id: string;
  name: string;
  description: string;
  code: string;
  category: "layout" | "component" | "interaction" | "animation" | "utility";
}

export interface StyleGene {
  id: string;
  name: string;
  cssCode: string;
  colorScheme?: string[];
  typography?: string;
}

export interface ComponentGene {
  id: string;
  name: string;
  htmlCode: string;
  cssCode: string;
  jsCode?: string;
}

export interface MixResult {
  mixedHtml: string;
  mixedCss: string;
  mixedJs: string;
  inheritedFeatures: {
    templateId: number;
    templateName: string;
    features: string[];
  }[];
  conflicts: {
    type: string;
    description: string;
    resolution: string;
  }[];
}

/**
 * Extract DNA from a template (features, styles, components)
 */
export async function extractTemplateDNA(
  templateId: number,
  templateName: string,
  html: string,
  css: string,
  js: string
): Promise<TemplateDNA> {
  const systemPrompt = `You are a code analysis expert for InTheWild Template DNA system.
Extract reusable features, style patterns, and components from website code.

Identify:
1. Distinct features (navigation, hero sections, forms, etc.)
2. Style genes (color schemes, typography, spacing systems)
3. Component genes (reusable UI elements with their HTML/CSS/JS)

Each extracted element should be modular and reusable.`;

  const userPrompt = `Extract DNA from this template:

Template: ${templateName}

HTML (${html.length} chars):
\`\`\`html
${html.slice(0, 5000)}
\`\`\`

CSS (${css.length} chars):
\`\`\`css
${css.slice(0, 3000)}
\`\`\`

Extract all reusable features, styles, and components.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "template_dna",
          strict: true,
          schema: {
            type: "object",
            properties: {
              features: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string" },
                    code: { type: "string" },
                    category: { type: "string", enum: ["layout", "component", "interaction", "animation", "utility"] },
                  },
                  required: ["id", "name", "description", "code", "category"],
                  additionalProperties: false,
                },
              },
              styleGenes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    cssCode: { type: "string" },
                    colorScheme: { type: "array", items: { type: "string" } },
                    typography: { type: "string" },
                  },
                  required: ["id", "name", "cssCode"],
                  additionalProperties: false,
                },
              },
              componentGenes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    htmlCode: { type: "string" },
                    cssCode: { type: "string" },
                    jsCode: { type: "string" },
                  },
                  required: ["id", "name", "htmlCode", "cssCode"],
                  additionalProperties: false,
                },
              },
            },
            required: ["features", "styleGenes", "componentGenes"],
            additionalProperties: false,
          },
        },
      },
    });

    const dnaData = JSON.parse(response.choices[0]?.message?.content as string);
    return {
      templateId,
      templateName,
      ...dnaData,
    };
  } catch (error) {
    console.error("[DNA Extraction] Failed:", error);
    return {
      templateId,
      templateName,
      features: [],
      styleGenes: [],
      componentGenes: [],
    };
  }
}

/**
 * Mix DNA from multiple templates to create a hybrid
 */
export async function mixTemplateDNA(
  dnaList: TemplateDNA[],
  selectedFeatures: { templateId: number; featureIds: string[] }[],
  mixingStrategy: "balanced" | "dominant" | "custom" = "balanced"
): Promise<MixResult> {
  if (dnaList.length === 0) {
    throw new Error("No templates provided for mixing");
  }

  // Collect all selected features
  const selectedDNA: {
    features: DNAFeature[];
    styles: StyleGene[];
    components: ComponentGene[];
    sources: Map<string, { templateId: number; templateName: string }>;
  } = {
    features: [],
    styles: [],
    components: [],
    sources: new Map(),
  };

  for (const selection of selectedFeatures) {
    const dna = dnaList.find(d => d.templateId === selection.templateId);
    if (!dna) continue;

    for (const featureId of selection.featureIds) {
      const feature = dna.features.find(f => f.id === featureId);
      if (feature) {
        selectedDNA.features.push(feature);
        selectedDNA.sources.set(feature.id, {
          templateId: dna.templateId,
          templateName: dna.templateName,
        });
      }

      const style = dna.styleGenes.find(s => s.id === featureId);
      if (style) {
        selectedDNA.styles.push(style);
      }

      const component = dna.componentGenes.find(c => c.id === featureId);
      if (component) {
        selectedDNA.components.push(component);
      }
    }
  }

  // Use AI to intelligently merge the selected DNA
  const mixedCode = await performIntelligentMix(selectedDNA, mixingStrategy);

  // Track inherited features
  const inheritedFeatures = Array.from(
    selectedDNA.sources.values().reduce((acc, source) => {
      if (!acc.has(source.templateId)) {
        acc.set(source.templateId, {
          templateId: source.templateId,
          templateName: source.templateName,
          features: [],
        });
      }
      return acc;
    }, new Map<number, { templateId: number; templateName: string; features: string[] }>())
  ).map(([_, value]) => value);

  selectedDNA.features.forEach(f => {
    const source = selectedDNA.sources.get(f.id);
    if (source) {
      const inherited = inheritedFeatures.find(i => i.templateId === source.templateId);
      if (inherited) inherited.features.push(f.name);
    }
  });

  return {
    mixedHtml: mixedCode.html,
    mixedCss: mixedCode.css,
    mixedJs: mixedCode.js,
    inheritedFeatures,
    conflicts: mixedCode.conflicts,
  };
}

/**
 * Perform intelligent AI-powered mixing of template DNA
 */
async function performIntelligentMix(
  selectedDNA: {
    features: DNAFeature[];
    styles: StyleGene[];
    components: ComponentGene[];
  },
  strategy: string
): Promise<{ html: string; css: string; js: string; conflicts: any[] }> {
  const systemPrompt = `You are an expert code synthesizer for InTheWild Template DNA Mixer.
Intelligently merge features from multiple templates into a cohesive, functional website.

Your task:
1. Combine HTML structures without conflicts
2. Merge CSS styles harmoniously (resolve color/font conflicts)
3. Integrate JavaScript without naming collisions
4. Ensure the result is production-ready and visually coherent
5. Detect and resolve conflicts (report them)

Strategy: ${strategy}
- balanced: Equal weight to all sources
- dominant: Prioritize first template's style
- custom: Intelligent best-of-breed selection`;

  const userPrompt = `Mix these template features:

Features (${selectedDNA.features.length}):
${selectedDNA.features.map(f => `- ${f.name} (${f.category}): ${f.description}`).join("\n")}

Style Genes (${selectedDNA.styles.length}):
${selectedDNA.styles.map(s => `- ${s.name}`).join("\n")}

Component Genes (${selectedDNA.components.length}):
${selectedDNA.components.map(c => `- ${c.name}`).join("\n")}

Generate a complete, cohesive website that intelligently combines all these elements.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "mixed_template",
          strict: true,
          schema: {
            type: "object",
            properties: {
              html: { type: "string" },
              css: { type: "string" },
              js: { type: "string" },
              conflicts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    description: { type: "string" },
                    resolution: { type: "string" },
                  },
                  required: ["type", "description", "resolution"],
                  additionalProperties: false,
                },
              },
            },
            required: ["html", "css", "js", "conflicts"],
            additionalProperties: false,
          },
        },
      },
    });

    return JSON.parse(response.choices[0]?.message?.content as string);
  } catch (error) {
    console.error("[DNA Mixing] Failed:", error);
    return {
      html: "<html><body><h1>Mixing failed</h1></body></html>",
      css: "",
      js: "",
      conflicts: [{ type: "error", description: "DNA mixing failed", resolution: "Manual intervention required" }],
    };
  }
}

/**
 * Preview available features from a template for selection
 */
export function getSelectableFeatures(dna: TemplateDNA): {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "feature" | "style" | "component";
}[] {
  const selectable: any[] = [];

  dna.features.forEach(f => {
    selectable.push({
      id: f.id,
      name: f.name,
      description: f.description,
      category: f.category,
      type: "feature",
    });
  });

  dna.styleGenes.forEach(s => {
    selectable.push({
      id: s.id,
      name: s.name,
      description: `Style: ${s.name}`,
      category: "style",
      type: "style",
    });
  });

  dna.componentGenes.forEach(c => {
    selectable.push({
      id: c.id,
      name: c.name,
      description: `Component: ${c.name}`,
      category: "component",
      type: "component",
    });
  });

  return selectable;
}
