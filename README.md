# 📊 SalesScope

> Multi-tenant Business Intelligence SaaS for e-commerce analytics

SalesScope is a production-ready dashboard application that allows businesses to upload their sales data (CSV format) and gain actionable insights through interactive visualizations, advanced filtering, and exportable reports.

## ✨ Features

### Core Functionality
- 📤 **CSV Upload & Processing** - Import sales data with automatic column detection and validation
- 📈 **Interactive Dashboards** - Real-time charts with drill-down capabilities
- 🔍 **Advanced Filtering** - Filter by date ranges, categories, products, and more
- 📄 **PDF Export** - Generate professional reports with branding
- 🔗 **Shareable Links** - Create public links with expiration for external sharing

### Technical Highlights
- 🏢 **Multi-tenant Architecture** - Complete organization management with role-based access
- 🔐 **Secure Authentication** - JWT with refresh token rotation and httpOnly cookies
- ⚡ **Performance Optimized** - Redis caching, background job processing, aggregated queries
- 🧪 **Production Ready** - Comprehensive testing, structured logging, CI/CD pipeline
- 📊 **Scalable Design** - Async processing, optimistic updates, lazy loading

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Fastify 5
- **Database**: PostgreSQL (Prisma ORM)
- **Caching**: Redis (Upstash)
- **Queue**: Bull
- **Auth**: JWT with bcrypt
- **Validation**: Zod
- **Logging**: Pino

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **State Management**: TanStack Query v5
- **Charts**: Recharts
- **Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod

### DevOps
- **Deployment**: Render (backend) + Vercel (frontend)
- **CI/CD**: GitHub Actions
- **Testing**: Jest (unit/integration) + Playwright (E2E)
- **Containerization**: Docker Compose (local dev)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd salesscope
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Start local database & Redis**
```bash
pnpm docker:up
```

4. **Setup environment variables**
```bash
# Backend
cd apps/api
cp .env.example .env
# Edit .env with your configuration

# Frontend  
cd ../web
cp .env.example .env
# Edit .env with your configuration
```

5. **Run database migrations**
```bash
pnpm db:migrate
```

6. **Start development servers**
```bash
# From root, start both frontend and backend
pnpm dev

# Or start individually
pnpm dev:api   # Backend on http://localhost:3001
pnpm dev:web   # Frontend on http://localhost:3000
```

7. **Open your browser**
```
http://localhost:3000
```

## 📁 Project Structure

```
salesscope/
├── apps/
│   ├── api/                    # Backend Fastify API
│   │   ├── src/
│   │   │   ├── modules/        # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── organizations/
│   │   │   │   ├── datasets/
│   │   │   │   ├── analytics/
│   │   │   │   └── exports/
│   │   │   ├── middleware/     # Custom middleware
│   │   │   ├── utils/          # Utilities
│   │   │   ├── jobs/           # Background jobs
│   │   │   └── server.ts       # Main server
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema
│   │   └── tests/              # Backend tests
│   │
│   └── web/                    # Frontend Next.js
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── components/     # React components
│       │   ├── lib/            # Utilities & config
│       │   └── hooks/          # Custom hooks
│       └── tests/              # Frontend tests
│
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── config/                 # Shared configuration
│   └── utils/                  # Shared utilities
│
├── docker-compose.yml          # Local PostgreSQL + Redis
├── pnpm-workspace.yaml         # Monorepo config
└── package.json                # Root package.json
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start all apps in dev mode
pnpm dev:api          # Start backend only
pnpm dev:web          # Start frontend only

# Build
pnpm build            # Build all apps
pnpm build:api        # Build backend only
pnpm build:web        # Build frontend only

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode

# Database
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with demo data
pnpm db:studio        # Open Prisma Studio

# Docker
pnpm docker:up        # Start PostgreSQL + Redis
pnpm docker:down      # Stop containers
pnpm docker:logs      # View container logs
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with cost factor 12
- **JWT Tokens**: Separate access (15min) and refresh (7 days) tokens
- **Token Rotation**: Refresh tokens are rotated on use
- **Token Revocation**: Refresh tokens stored in DB for revocation
- **httpOnly Cookies**: Refresh tokens stored securely
- **CORS**: Strict origin validation
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Security Headers**: Helmet.js for HTTP headers
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Protection**: Prisma parameterized queries

## 📊 Database Schema

Key entities:
- **User**: User accounts with secure password storage
- **Organization**: Multi-tenant organizations
- **OrganizationMember**: User-organization relationships with roles
- **RefreshToken**: Revocable refresh tokens
- **Dataset**: Uploaded CSV files metadata
- **SalesData**: Parsed sales records

## 🚀 Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `pnpm install && pnpm build:api`
4. Set start command: `cd apps/api && pnpm start`
5. Add environment variables (see `.env.example`)
6. Add PostgreSQL database (Render add-on or external)
7. Add Redis instance (Upstash recommended)

### Frontend (Vercel)
1. Import project to Vercel
2. Set root directory to `apps/web`
3. Framework preset: Next.js
4. Add environment variables
5. Deploy

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

## 📝 License

MIT

## 👨‍💻 Author

**Bastien**
- Portfolio: [Your Portfolio URL]
- GitHub: [@yourusername]
- LinkedIn: [Your LinkedIn]

---

## 🎯 Project Goals

This project was built as a portfolio piece to demonstrate:
- Full-stack development skills (Node.js + React)
- Production-ready architecture and best practices
- Multi-tenant SaaS patterns
- Advanced authentication & security
- Performance optimization techniques
- Testing strategies
- DevOps and deployment skills

Built with ❤️ using modern web technologies.
