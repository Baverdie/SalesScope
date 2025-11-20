# 🚀 SalesScope - Quick Start Guide

## What You Have

Un projet **SalesScope** complet avec :

### ✅ Backend (apps/api/)
- Serveur Fastify ultra-sécurisé
- Auth JWT avec refresh token rotation
- Multi-tenant avec Organizations
- Prisma ORM + PostgreSQL
- Redis pour caching
- Structure modulaire (auth, datasets, analytics, exports)
- Logging structuré avec Pino
- Rate limiting + Security headers

### ✅ Frontend (apps/web/)
- Next.js 15 avec App Router
- TanStack Query pour state management
- Tailwind CSS + design system
- Landing page stylée
- Structure prête pour les dashboards

### ✅ Infrastructure
- Docker Compose (PostgreSQL + Redis local)
- Monorepo avec pnpm workspaces
- Types TypeScript partagés
- Makefile avec commandes pratiques

## 🎯 Next Steps (Ce qu'il reste à coder)

### 1. Modules Backend (Semaine 2-3)
```
apps/api/src/modules/
├── datasets/           # À FAIRE
│   ├── dataset.routes.ts
│   ├── dataset.service.ts
│   └── dataset.schema.ts
├── analytics/          # À FAIRE
│   ├── analytics.routes.ts
│   └── analytics.service.ts
└── exports/            # À FAIRE
    ├── exports.routes.ts
    └── exports.service.ts
```

### 2. Job Queue (Semaine 2)
```
apps/api/src/jobs/      # À FAIRE
├── process-csv.job.ts
├── calculate-aggregations.job.ts
└── generate-pdf.job.ts
```

### 3. Frontend Pages (Semaine 3)
```
apps/web/src/app/
├── (auth)/             # À FAIRE
│   ├── login/
│   └── register/
└── (dashboard)/        # À FAIRE
    ├── dashboard/
    ├── datasets/
    └── analytics/
```

### 4. Components React (Semaine 3)
```
apps/web/src/components/
├── charts/             # À FAIRE
│   ├── LineChart.tsx
│   ├── BarChart.tsx
│   └── PieChart.tsx
├── dashboard/          # À FAIRE
│   ├── StatCard.tsx
│   ├── FilterPanel.tsx
│   └── DataTable.tsx
└── upload/             # À FAIRE
    └── CSVUploader.tsx
```

## 🏁 Pour démarrer maintenant

### Installation

```bash
# 1. Installer pnpm (si pas déjà fait)
npm install -g pnpm

# 2. Installer les dépendances
cd salesscope
pnpm install

# 3. Démarrer Docker (PostgreSQL + Redis)
pnpm docker:up

# 4. Attendre 5 secondes que PostgreSQL démarre...

# 5. Générer le client Prisma
cd apps/api
pnpm db:generate

# 6. Lancer les migrations
pnpm db:migrate

# 7. Retour à la racine et démarrer tout
cd ../..
pnpm dev
```

### URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📋 Ordre de développement recommandé

### Phase 1 - Tester la base (maintenant)
1. ✅ Démarrer les serveurs
2. ✅ Tester le health check backend
3. ✅ Voir la landing page frontend

### Phase 2 - Auth complet (Jour 1-2)
1. Créer pages login/register frontend
2. Tester l'inscription d'un user
3. Tester la connexion
4. Gérer le token dans le frontend (localStorage ou state)

### Phase 3 - Upload CSV (Jour 3-5)
1. Créer endpoint POST /api/datasets/upload
2. Parser CSV avec papaparse
3. Valider les colonnes
4. Sauvegarder en DB
5. Créer UI d'upload avec drag & drop
6. Background job pour processing

### Phase 4 - Analytics (Jour 6-10)
1. Endpoint GET /api/analytics/:datasetId
2. Calcul des aggregations (ventes par jour/mois)
3. Cache Redis
4. Filtres (date range, catégories)
5. Charts frontend (Recharts)
6. Dashboard interactif

### Phase 5 - Export PDF (Jour 11-13)
1. Générer PDF avec react-pdf ou puppeteer
2. Endpoint POST /api/exports/generate
3. Background job
4. Bouton export dans le frontend

### Phase 6 - Polish & Deploy (Jour 14-21)
1. Tests (Jest + Playwright)
2. CI/CD (GitHub Actions)
3. Deploy backend sur Render
4. Deploy frontend sur Vercel
5. README avec screenshots
6. Video demo (optional)

## 🔥 Commands utiles

```bash
# Dev
make dev              # Tout démarrer
make dev-api          # Backend seulement
make dev-web          # Frontend seulement

# Database
make db-migrate       # Migrations
make db-seed          # Données de test
make db-studio        # Prisma Studio UI

# Docker
make docker-up        # Démarrer PostgreSQL + Redis
make docker-down      # Arrêter
make docker-logs      # Voir les logs

# Tests
pnpm test            # Tous les tests
pnpm test:watch      # Watch mode

# Build
pnpm build           # Build production
```

## 🤔 Besoin d'aide ?

Si tu bloques sur une étape :
1. Check les logs : `make docker-logs` ou `pnpm dev`
2. Vérifie les .env (API et Web)
3. Restart Docker : `make docker-down && make docker-up`
4. Check que le port 3001 et 3000 sont libres

## 📝 Notes importantes

- **Pas de hot reload Prisma** : Si tu modifies le schema, faut relancer `pnpm db:migrate`
- **CORS** : Le backend accepte uniquement http://localhost:3000 en dev
- **Cookies** : Les refresh tokens sont en httpOnly cookies (secure)
- **Redis** : Utilisé pour cache + job queue (Bull)

Voilà mec, t'as tout ce qu'il faut pour attaquer ! Le squelette est solide, maintenant faut remplir les features 💪

Let's code ! 🚀
