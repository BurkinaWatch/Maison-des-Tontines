# Maison des Tontines

Modern tontine management platform built with React Native, Next.js, and a shared monorepo architecture.

## Architecture

```
maison-des-tontines/
├── apps/
│   ├── mobile/          # React Native (Expo) app
│   └── web/             # Next.js web app
├── packages/
│   ├── shared/          # Shared types, constants, utilities
│   ├── ui/              # Shared UI component library
│   ├── eslint-config/   # Shared ESLint configurations
│   └── typescript-config/ # Shared TypeScript configurations
└── prisma/              # Database schema and migrations
```

## Tech Stack

- **Frontend**: React Native (Expo), Next.js, React
- **Backend**: tRPC (or REST), Prisma ORM
- **Database**: PostgreSQL
- **Infrastructure**: Docker, Turborepo, pnpm workspaces
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 14
- Docker & Docker Compose

### Installation

```bash
# Install dependencies
pnpm install

# Start PostgreSQL
pnpm docker:up

# Set up environment variables
cp .env.example .env

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed
```

### Development

```bash
# Start all apps
pnpm dev

# Start specific app
pnpm --filter mobile dev
pnpm --filter web dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages and apps |
| `pnpm test` | Run all tests |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm docker:up` | Start PostgreSQL with Docker |
| `pnpm docker:down` | Stop PostgreSQL |
| `pnpm clean` | Clean build artifacts and dependencies |

## Domain

A **tontine** is a rotating savings and credit association common in West Africa. Members contribute a fixed amount regularly, and the collected sum is given to one member per cycle on a rotating basis.

### Key Concepts

- **Tontine**: The savings group with rules, members, and cycles
- **Cycle**: A single rotation period where one member receives the pot
- **Contribution**: Individual payments made during a cycle
- **Member**: A user participating in a tontine
- **Role**: Admin, Treasurer, or Member within a tontine

## Contributing

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Please ensure your commit messages follow this format.

## License

Private - All rights reserved
