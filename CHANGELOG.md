# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Fixed
- ci: GitHubOrchestrator — remove duplicate pnpm `version` from pnpm/action-setup so it uses `packageManager` from package.json (fixes "Multiple versions of pnpm specified").

### Fixed (CI/CD and Types)
- ci: Pin `ubuntu-24.04` in `.github/workflows/deploy.yml` to avoid `ubuntu-latest` migration warnings.
- ci: Pin pnpm version 10 in `deploy.yml`.
- build: Fix type errors in `server/blueOceanRouters.ts` related to `ctx.user.id` stringification and `z.record()` validation of `envVars`.
