/**
 * Full-Stack Code Generator
 * The core differentiator: generates complete, working applications
 * Frontend + Backend + Database + Deployment ready
 */

import { invokeLLM } from "../_core/llm";
import { generateParallel } from "./openrouter";

export interface FullStackGenerationResult {
  success: boolean;
  projectId: number;
  projectName: string;
  frontend: {
    html: string;
    css: string;
    js: string;
  };
  backend: {
    expressRoutes: string;
    models: string;
    controllers: string;
    middleware: string;
  };
  database: {
    schema: string;
    migrations: string;
  };
  config: {
    packageJson: string;
    env: string;
    dockerfile: string;
  };
  deploymentUrl?: string;
  estimatedDeployTime: string;
}

/**
 * Generate a complete full-stack application from a prompt
 * This is the core magic: frontend + backend + database in one go
 */
export async function generateFullStack(
  prompt: string,
  isPremium: boolean = false
): Promise<FullStackGenerationResult> {
  const startTime = Date.now();

  // Step 1: Generate frontend using parallel LLM
  const frontendResult = await generateParallel(prompt, isPremium);
  if (!frontendResult.bestResponse) {
    throw new Error("Failed to generate frontend");
  }

  const frontendHtml = frontendResult.bestResponse.content;

  // Step 2: Generate backend code
  const backendCode = await generateBackendCode(prompt, frontendHtml);

  // Step 3: Generate database schema
  const databaseCode = await generateDatabaseSchema(prompt, backendCode.models);

  // Step 4: Generate configuration files
  const config = await generateConfigFiles(prompt, backendCode, databaseCode);

  const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);

  return {
    success: true,
    projectId: 0, // Will be set by caller
    projectName: extractProjectName(prompt),
    frontend: {
      html: frontendHtml,
      css: extractCSS(frontendHtml),
      js: extractJS(frontendHtml),
    },
    backend: backendCode,
    database: databaseCode,
    config,
    estimatedDeployTime: `${Math.max(2, Math.ceil(elapsedSeconds / 10))} minutes`,
  };
}

/**
 * Generate Express.js backend code with routes, models, and controllers
 */
async function generateBackendCode(
  userPrompt: string,
  frontendHtml: string
): Promise<{
  expressRoutes: string;
  models: string;
  controllers: string;
  middleware: string;
}> {
  const systemPrompt = `You are an expert backend developer for InTheWild.
Generate production-ready Express.js backend code.

Your task:
1. Analyze the frontend to understand required API endpoints
2. Generate Express routes with proper error handling
3. Generate data models/schemas
4. Generate controllers with business logic
5. Generate middleware (auth, validation, error handling)
6. Use async/await, proper error handling, input validation
7. Include JSDoc comments

Output complete, working code ready for deployment.`;

  const userPromptText = `Generate a complete Express.js backend for this application:

User Description: ${userPrompt}

Frontend HTML (${frontendHtml.length} chars):
\`\`\`html
${frontendHtml.slice(0, 5000)}
\`\`\`

Generate:
1. Express routes (with proper HTTP methods and error handling)
2. Data models (define what data the app needs)
3. Controllers (business logic for each route)
4. Middleware (authentication, validation, error handling)

Make it production-ready with proper error handling and validation.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPromptText },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "backend_code",
          strict: true,
          schema: {
            type: "object",
            properties: {
              expressRoutes: { type: "string", description: "Express routes (routes.ts)" },
              models: { type: "string", description: "Data models/schemas" },
              controllers: { type: "string", description: "Controllers with business logic" },
              middleware: { type: "string", description: "Middleware functions" },
            },
            required: ["expressRoutes", "models", "controllers", "middleware"],
            additionalProperties: false,
          },
        },
      },
    });

    return JSON.parse(response.choices[0]?.message?.content as string);
  } catch (error) {
    console.error("[Backend Generation] Failed:", error);
    return {
      expressRoutes: generateDefaultRoutes(),
      models: generateDefaultModels(),
      controllers: generateDefaultControllers(),
      middleware: generateDefaultMiddleware(),
    };
  }
}

/**
 * Generate database schema and migrations
 */
async function generateDatabaseSchema(
  userPrompt: string,
  models: string
): Promise<{ schema: string; migrations: string }> {
  const systemPrompt = `You are an expert database designer for InTheWild.
Generate MySQL/Drizzle ORM schema and migrations.

Your task:
1. Analyze the models to design database tables
2. Generate Drizzle ORM schema (schema.ts)
3. Generate migration SQL
4. Include proper indexes, foreign keys, constraints
5. Use best practices for data types and relationships`;

  const userPromptText = `Generate database schema for this backend:

User Description: ${userPrompt}

Models:
\`\`\`typescript
${models.slice(0, 3000)}
\`\`\`

Generate:
1. Drizzle ORM schema (schema.ts) with all tables
2. Migration SQL for creating tables`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPromptText },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "database_schema",
          strict: true,
          schema: {
            type: "object",
            properties: {
              schema: { type: "string", description: "Drizzle ORM schema" },
              migrations: { type: "string", description: "Migration SQL" },
            },
            required: ["schema", "migrations"],
            additionalProperties: false,
          },
        },
      },
    });

    return JSON.parse(response.choices[0]?.message?.content as string);
  } catch (error) {
    console.error("[Database Schema Generation] Failed:", error);
    return {
      schema: generateDefaultSchema(),
      migrations: generateDefaultMigrations(),
    };
  }
}

/**
 * Generate configuration files (package.json, .env, Dockerfile)
 */
async function generateConfigFiles(
  userPrompt: string,
  backend: any,
  database: any
): Promise<{
  packageJson: string;
  env: string;
  dockerfile: string;
}> {
  const packageJson = {
    name: extractProjectName(userPrompt).toLowerCase().replace(/\s+/g, "-"),
    version: "1.0.0",
    description: userPrompt.slice(0, 100),
    main: "dist/index.js",
    scripts: {
      dev: "tsx watch server/index.ts",
      build: "tsc && esbuild server/index.ts --bundle --platform=node --outdir=dist",
      start: "node dist/index.js",
      "db:push": "drizzle-kit generate && drizzle-kit migrate",
    },
    dependencies: {
      express: "^4.21.0",
      "drizzle-orm": "^0.44.0",
      mysql2: "^3.15.0",
      cors: "^2.8.5",
      "dotenv": "^17.0.0",
      zod: "^4.0.0",
    },
    devDependencies: {
      typescript: "^5.9.0",
      tsx: "^4.19.0",
      "@types/express": "^4.17.0",
      "@types/node": "^24.0.0",
      "drizzle-kit": "^0.31.0",
      esbuild: "^0.25.0",
    },
  };

  const env = `DATABASE_URL="mysql://user:password@localhost:3306/app_db"
NODE_ENV="development"
PORT=3000`;

  const dockerfile = `FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm run db:push
EXPOSE 3000
CMD ["npm", "start"]`;

  return {
    packageJson: JSON.stringify(packageJson, null, 2),
    env,
    dockerfile,
  };
}

// ─── Helper Functions ───────────────────────────────────────────

function extractProjectName(prompt: string): string {
  const match = prompt.match(/(?:for|called|named|app|website|site)[\s:]+([a-zA-Z0-9\s]+)/i);
  if (match) return match[1].trim().split(/[,\.]/).shift() || "MyApp";
  return "MyApp";
}

function extractCSS(html: string): string {
  const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  return styleMatches.map(match => match.replace(/<\/?style[^>]*>/gi, "")).join("\n\n");
}

function extractJS(html: string): string {
  const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  return scriptMatches.filter(match => !match.includes("src=")).map(match => match.replace(/<\/?script[^>]*>/gi, "")).join("\n\n");
}

function generateDefaultRoutes(): string {
  return `import express from 'express';
const router = express.Router();

// GET /api/health - Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// GET /api/items - List items
router.get('/items', async (req, res) => {
  try {
    // TODO: Implement database query
    res.json({ items: [] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/items - Create item
router.post('/items', async (req, res) => {
  try {
    // TODO: Implement item creation
    res.status(201).json({ id: 1, ...req.body });
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

export default router;`;
}

function generateDefaultModels(): string {
  return `// Data Models
export interface Item {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}`;
}

function generateDefaultControllers(): string {
  return `// Controllers
export async function getItems(req, res) {
  try {
    // TODO: Query database
    res.json({ items: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createItem(req, res) {
  try {
    const { name, description } = req.body;
    // TODO: Validate and save to database
    res.status(201).json({ id: 1, name, description });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}`;
}

function generateDefaultMiddleware(): string {
  return `// Middleware
export function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
}

export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid request' });
    }
  };
}`;
}

function generateDefaultSchema(): string {
  return `import { int, varchar, timestamp, mysqlTable } from 'drizzle-orm/mysql-core';

export const items = mysqlTable('items', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow(),
});

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('createdAt').defaultNow(),
});`;
}

function generateDefaultMigrations(): string {
  return `CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(1000),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
}
