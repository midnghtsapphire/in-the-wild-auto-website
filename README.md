# InTheWild - Full-Stack AI Website Generator

**Tagline:** "Full-Stack From Soup To Nuts - Everything"

InTheWild is a lean, fast AI website generator that builds **complete full-stack applications** — not just landing pages. Unlike Lovable (which only generates frontends), InTheWild generates real backends, real databases, and handles instant deployment.

## The Lovable Killer

**Lovable's Weakness:** It builds pretty landing pages but the backend never actually gets built.

**InTheWild's Strength:** We build the complete stack in minutes:
- ✅ React frontend with components
- ✅ Express.js backend with routes, controllers, middleware
- ✅ Database schema, migrations, and models
- ✅ Authentication & authorization
- ✅ Error handling & validation
- ✅ Docker deployment ready
- ✅ GitHub repo with all code

## Features

### Core Differentiator: Full-Stack Generation
- **Real Backends:** Express.js routes, controllers, middleware — actual working code, not templates
- **Real Databases:** Schema generation, migrations, models — complete data layer
- **Instant Deploy:** Live in minutes with hosting, database, and environment config

### AI-Powered Generation
- **Parallel LLM Processing:** Sends prompts to 2 free uncensored LLM models via OpenRouter
- **Auto-Verification:** Syntax and security checks on generated code
- **Smart Code Generation:** Understands features, data models, and user flows

### User Management
- **Authentication:** Email/password + Google OAuth via built-in auth system
- **Token Tracking:** Visual analytics and quota management per user
- **Project Management:** My Projects dashboard with preview, edit, deploy

### Billing & Tiers
- **Free Tier:** 50,000 tokens/month, 2 free LLM models, basic generation
- **Pro Tier:** 500,000 tokens/month, premium models, advanced features, custom domains
- **Business Tier:** 5M tokens/month, unlimited API calls, dedicated support, SLA
- **Stripe Integration:** Test and live mode support with seamless switching

## Quick Start

### Prerequisites
- Node.js 22+
- MySQL 8.0+
- OpenRouter API key

### Installation

```bash
# Clone the repository
git clone https://github.com/MIDNGHTSAPPHIRE/in-the-wild.git
cd in-the-wild

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

See `.env.example` for the complete list. Key variables:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/inthewild

# OpenRouter (for LLM generation)
OPENROUTER_API_KEY=your_openrouter_api_key

# Stripe (test/live modes)
STRIPE_MODE=test
STRIPE_TEST_SECRET_KEY=sk_test_...
STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...
STRIPE_LIVE_SECRET_KEY=sk_live_...
STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_...

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

## Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using Docker Only

```bash
# Build image
docker build -t inthewild .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://... \
  -e OPENROUTER_API_KEY=... \
  inthewild
```

## Architecture

### Frontend
- **Framework:** React 19 + TypeScript
- **Routing:** Wouter (lightweight)
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **State:** tRPC + React Query
- **Theme:** Purple/green gradient, dark mode

### Backend
- **Framework:** Express 4 + tRPC 11
- **Database:** MySQL 8.0 with Drizzle ORM
- **Auth:** Custom OAuth integration
- **LLM:** OpenRouter API (parallel processing)
- **Payments:** Stripe (test/live modes)

### Full-Stack Generator
- **Frontend Generation:** React components, routing, state management
- **Backend Generation:** Express routes, controllers, middleware, error handling
- **Database Generation:** Schema, migrations, models, relationships
- **Deployment:** Docker config, environment setup, hosting integration

## Development

### Project Structure

```
client/              # React frontend
  src/
    pages/           # Page components
    components/      # Reusable UI components
    lib/             # tRPC client
server/              # Express backend
  services/          # Business logic (LLM, generation, deployment)
  routers.ts         # tRPC API routes
  db.ts              # Database queries
drizzle/             # Database schema & migrations
shared/              # Shared types & constants
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch
```

### Code Quality

```bash
# Type checking
pnpm check

# Format code
pnpm format
```

## API Documentation

### Generation API

**Generate Full-Stack App**
```typescript
trpc.generation.generate.useMutation({
  prompt: "A todo app with user auth and categories",
  projectName: "my-todo-app"
})
```

**Get Project**
```typescript
trpc.generation.getProject.useQuery({ projectId: 123 })
```

**List Projects**
```typescript
trpc.generation.listProjects.useQuery()
```

**Deploy Project**
```typescript
trpc.generation.deploy.useMutation({ projectId: 123 })
```

### Billing API

**Get Usage**
```typescript
trpc.billing.getUsage.useQuery()
```

**Get Plans**
```typescript
trpc.billing.getPlans.useQuery()
```

**Create Checkout**
```typescript
trpc.billing.createCheckout.useMutation({ planId: "pro" })
```

## Deployment

### Production Checklist

- [ ] Set `STRIPE_MODE=live` for production
- [ ] Configure production database
- [ ] Set secure `JWT_SECRET`
- [ ] Configure OpenRouter API key
- [ ] Set up Stripe live keys
- [ ] Configure custom domain
- [ ] Enable SSL/TLS
- [ ] Set up monitoring & logging

### Hosting Options

InTheWild can be deployed to:
- **Docker:** Any container platform (AWS ECS, Google Cloud Run, Azure Container Instances)
- **VPS:** DigitalOcean, Linode, Vultr
- **Platform:** Railway, Render, Fly.io
- **Self-hosted:** Any server with Docker support

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For issues and questions:
- GitHub Issues: https://github.com/MIDNGHTSAPPHIRE/in-the-wild/issues
- Email: support@inthewild.dev

---

**Built with OpenRouter • Powered by uncensored LLMs**
