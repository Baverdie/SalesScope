# 📚 SalesScope - Index des Ressources

Bienvenue dans SalesScope ! Voici tous les fichiers et ressources disponibles.

---

## 📖 Documentation

### Guides Principaux

1. **[README.md](./README.md)** - Documentation complète du projet
   - Vue d'ensemble
   - Architecture
   - Tech stack
   - Features roadmap
   - API documentation

2. **[QUICKSTART.md](./QUICKSTART.md)** - Démarrage rapide (5 minutes)
   - Installation
   - Configuration
   - Lancer le projet
   - Tester l'API
   - Commandes utiles
   - Dépannage

3. **[WHAT_WE_BUILT.md](./WHAT_WE_BUILT.md)** - Récapitulatif Semaine 1
   - Statistiques du code
   - Fichiers créés
   - Features implémentées
   - Qualité du code
   - État d'avancement

4. **[ROADMAP.md](./ROADMAP.md)** - Feuille de route détaillée
   - Semaine 1 (DONE) ✅
   - Semaine 2 (Upload & Processing) 📋
   - Semaine 3 (Dashboard) 📋
   - Semaine 4 (Production) 📋
   - Liste complète des fichiers à créer

5. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guide de déploiement
   - Neon (PostgreSQL)
   - Upstash (Redis)
   - Render (Backend)
   - Vercel (Frontend)
   - Custom domain
   - CI/CD

6. **[TESTING.md](./TESTING.md)** - Guide des tests
   - Tests unitaires (Jest)
   - Tests d'intégration
   - Tests E2E (Playwright)
   - Exemples de code
   - Best practices

---

## 🗂️ Structure du Projet

```
salesscope/
├── apps/
│   ├── api/                    # Backend Fastify
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema
│   │   ├── src/
│   │   │   ├── config/         # Configuration
│   │   │   ├── middleware/     # Auth, validation
│   │   │   ├── modules/        # Business logic
│   │   │   │   └── auth/       # ✅ Auth module (DONE)
│   │   │   ├── utils/          # Utilities
│   │   │   └── server.ts       # Main server
│   │   ├── .env                # Environment variables
│   │   ├── .env.example        # Environment template
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                    # Frontend Next.js
│       ├── src/
│       │   ├── app/            # Next.js App Router
│       │   ├── components/     # React components
│       │   ├── lib/            # API client, utils
│       │   └── hooks/          # Custom hooks
│       ├── .env.local          # Environment variables
│       ├── .env.local.example  # Environment template
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                   # Shared packages
│   ├── types/                  # Shared TypeScript types (à créer)
│   └── config/                 # Shared config (à créer)
│
├── docker-compose.yml          # Local PostgreSQL + Redis
├── Makefile                    # Commandes utiles
├── package.json                # Root package
├── pnpm-workspace.yaml         # Workspace config
└── tsconfig.json               # TypeScript config
```

---

## 🔑 Fichiers Importants

### Configuration

- `package.json` (root) - Scripts et dépendances globales
- `pnpm-workspace.yaml` - Configuration monorepo
- `tsconfig.json` - TypeScript config partagée
- `docker-compose.yml` - Services locaux (PostgreSQL + Redis)
- `Makefile` - Commandes shell pratiques

### Backend (`apps/api/`)

**Configuration :**
- `src/config/env.ts` - Validation des variables d'env
- `src/config/prisma.ts` - Prisma client
- `src/config/redis.ts` - Redis client + helpers
- `src/config/logger.ts` - Pino logger

**Middleware :**
- `src/middleware/auth.ts` - JWT authentication
- `src/middleware/validation.ts` - Zod validation

**Utils :**
- `src/utils/password.ts` - Bcrypt + validation
- `src/utils/token.ts` - JWT refresh tokens

**Modules :**
- `src/modules/auth/auth.service.ts` - Auth business logic
- `src/modules/auth/auth.routes.ts` - Auth HTTP routes
- `src/modules/auth/auth.schema.ts` - Validation schemas

**Database :**
- `prisma/schema.prisma` - Database schema complet

### Frontend (`apps/web/`)

**Pages :**
- `src/app/layout.tsx` - Layout racine
- `src/app/page.tsx` - Page d'accueil
- `src/app/providers.tsx` - TanStack Query provider

**API :**
- `src/lib/api/client.ts` - API client avec auth

**Styles :**
- `src/app/globals.css` - Styles globaux + variables CSS

---

## 🚀 Commandes Rapides

### Installation & Setup

```bash
# Installation
pnpm install

# Setup complet (install + docker + migrations)
make setup
```

### Développement

```bash
# Lancer tout (API + Web)
make dev

# Lancer API uniquement
make dev-api

# Lancer Web uniquement
make dev-web
```

### Base de données

```bash
# Lancer PostgreSQL + Redis
make docker-up

# Arrêter les containers
make docker-down

# Créer/mettre à jour les tables
make db-migrate

# Ouvrir Prisma Studio (UI pour voir la DB)
make db-studio
```

### Tests

```bash
# Tous les tests
make test

# Tests API
make test-api

# Tests Web
make test-web
```

### Nettoyage

```bash
# Supprimer node_modules + build
make clean
```

---

## 🌐 URLs Locales

Après `make dev` :

- **Frontend** : http://localhost:3000
- **API** : http://localhost:4000
- **Health Check** : http://localhost:4000/health
- **Prisma Studio** : http://localhost:5555 (après `make db-studio`)

---

## 🔐 Authentification

### Endpoints disponibles

```
POST /api/auth/register      # Créer un compte
POST /api/auth/login         # Se connecter
POST /api/auth/refresh       # Rafraîchir les tokens
POST /api/auth/logout        # Se déconnecter
POST /api/auth/logout-all    # Se déconnecter de tous les appareils
GET  /api/auth/me            # Profil utilisateur
```

### Exemple curl

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'

# Get profile (avec le token reçu)
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📦 Dépendances Principales

### Backend

- **Fastify** - Framework web rapide
- **Prisma** - ORM moderne
- **Redis (ioredis)** - Cache & queue
- **Bull** - Background jobs
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Validation
- **Pino** - Logging

### Frontend

- **Next.js 15** - React framework
- **TanStack Query** - Server state
- **Tailwind CSS** - Styling
- **shadcn/ui** - Components
- **Recharts** - Charts
- **Zod** - Validation

---

## 🎯 Prochaines Étapes

### À faire en Semaine 2

Voir **[ROADMAP.md](./ROADMAP.md)** pour la liste détaillée, mais en résumé :

1. **Module Upload** - Upload de fichiers CSV
2. **CSV Parser** - Parsing et validation
3. **Background Jobs** - Processing async avec Bull
4. **Module Analytics** - Endpoints pour les stats
5. **Module Organizations** - CRUD organizations
6. **Frontend Auth** - Pages login/register
7. **Dashboard Layout** - Sidebar, header
8. **Upload UI** - Drag & drop component

---

## 🆘 Besoin d'Aide ?

### Documentation à consulter

1. **Installation** → QUICKSTART.md
2. **Architecture** → README.md
3. **Prochaines étapes** → ROADMAP.md
4. **Déploiement** → DEPLOYMENT.md
5. **Tests** → TESTING.md
6. **Résumé Semaine 1** → WHAT_WE_BUILT.md

### Dépannage Commun

**Port déjà utilisé :**
```bash
# Trouver le process
lsof -i :4000

# Le tuer
kill -9 <PID>
```

**PostgreSQL ne démarre pas :**
```bash
# Check les logs
docker-compose logs postgres

# Redémarrer
docker-compose restart postgres
```

**Erreur Prisma :**
```bash
# Regénérer le client
cd apps/api
npx prisma generate

# Recréer la DB
npx prisma migrate reset
```

---

## 🎨 Ressources Externes

### Documentation Officielle

- **Fastify** : https://fastify.dev
- **Prisma** : https://prisma.io/docs
- **Next.js** : https://nextjs.org/docs
- **TanStack Query** : https://tanstack.com/query
- **Tailwind CSS** : https://tailwindcss.com
- **shadcn/ui** : https://ui.shadcn.com
- **Recharts** : https://recharts.org

### Hébergement

- **Render** : https://render.com/docs
- **Vercel** : https://vercel.com/docs
- **Neon** : https://neon.tech/docs
- **Upstash** : https://upstash.com/docs

---

## 📊 État du Projet

### ✅ Semaine 1 (100%)
- Architecture monorepo
- Backend API complet
- Auth ultra-sécurisé
- Database schema
- Frontend base
- Documentation

### 🔥 Semaine 2 (0%)
À coder : Upload, Processing, Dashboard layout

### 📅 Semaine 3 (0%)
À coder : Charts, Filtres, Export

### 🚀 Semaine 4 (0%)
À coder : Tests, Deploy, Production

---

## 🎉 Conclusion

Tu as maintenant :
- ✅ Un projet fullstack professionnel
- ✅ Une architecture scalable
- ✅ Une sécurité de niveau enterprise
- ✅ Une documentation complète
- ✅ Un plan de route clair

**Next** : Commence la Semaine 2 ! 🚀

Ouvre **ROADMAP.md** et commence à coder les features de la semaine 2.

**Good luck! 💪**
