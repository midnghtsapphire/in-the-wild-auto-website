# Reese-Reviews - Professional Content & Social Media Platform

**Tagline:** "Professional Reviews & Content"

Reese-Reviews is a unified platform for creating professional reviews and managing social media content across multiple platforms. Built with a clean, professional steel/neutral design aesthetic.

## Features

### Content Creation & Management
- Professional review writing interface
- Multi-platform publishing (Facebook, LinkedIn, Instagram, TikTok)
- Content scheduling and automation
- Marketing budget management

### Social Media Integration
- **Facebook** - Automated posting with engagement tracking
- **LinkedIn** - Professional content distribution
- **Instagram** - Visual content management
- **TikTok** - Short-form video content integration

### Analytics & Performance
- Engagement tracking across all platforms
- Reach and impression analytics
- Budget spend monitoring
- Performance reporting

### Brand Management
- Logo management and customization
- Consistent branding across all platforms
- Professional steel/neutral design theme

## Quick Start

### Prerequisites
- Node.js 22+
- MySQL 8.0+

### Installation

```bash
# Clone the repository
git clone https://github.com/MIDNGHTSAPPHIRE/reese-reviews.git
cd reese-reviews

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
DATABASE_URL=mysql://user:password@localhost:3306/reesereviews

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
docker build -t reese-reviews .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://... \
  reese-reviews
```

## Architecture

### Frontend
- **Framework:** React 19 + TypeScript
- **Routing:** Wouter (lightweight)
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **State:** tRPC + React Query
- **Theme:** Steel/neutral palette, dark mode support

### Backend
- **Framework:** Express 4 + tRPC 11
- **Database:** MySQL 8.0 with Drizzle ORM
- **Auth:** Custom OAuth integration

## Development

### Project Structure

```
client/              # React frontend
  src/
    pages/           # Page components
    components/      # Reusable UI components
    lib/             # Utilities and tRPC client
server/              # Express backend
  services/          # Business logic
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

## Deployment

### Production Checklist

- [ ] Configure production database
- [ ] Set secure `JWT_SECRET`
- [ ] Configure custom domain
- [ ] Enable SSL/TLS
- [ ] Set up monitoring & logging

### Hosting Options

Reese-Reviews can be deployed to:
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
- GitHub Issues: https://github.com/MIDNGHTSAPPHIRE/reese-reviews/issues

---

**Built for professional content creators**
