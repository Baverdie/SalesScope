# 📋 SalesScope - Roadmap & Next Steps

## ✅ Ce qui est FAIT (Semaine 1)

### Backend
- ✅ Architecture monorepo avec pnpm workspaces
- ✅ Configuration Fastify avec tous les plugins
- ✅ Schéma Prisma complet (Users, Organizations, Datasets, etc.)
- ✅ Système d'auth JWT ultra-sécurisé
  - Access tokens (15min) + Refresh tokens (7 jours)
  - Token rotation
  - Détection de replay attacks
  - Password validation stricte
  - Bcrypt hashing
- ✅ Middleware d'authentification et validation (Zod)
- ✅ Configuration Redis + Bull (job queue)
- ✅ Logger structuré avec Pino
- ✅ Rate limiting
- ✅ CORS + Helmet (sécurité)
- ✅ Docker Compose (PostgreSQL + Redis)
- ✅ Configuration pour tests (Jest)

### Frontend
- ✅ Next.js 15 avec App Router
- ✅ Tailwind CSS + shadcn/ui setup
- ✅ TanStack Query configuré
- ✅ API client avec fetch wrapper
- ✅ Page d'accueil
- ✅ Layout de base

### DevOps
- ✅ Makefile avec commandes utiles
- ✅ Documentation complète (README + QUICKSTART)
- ✅ Variables d'environnement

---

## 🔥 SEMAINE 2 : Data Pipeline (À FAIRE)

### Backend - Upload & Processing

#### 1. Module Upload (/api/uploads)
**Fichiers à créer** :
- `apps/api/src/modules/uploads/upload.service.ts`
- `apps/api/src/modules/uploads/upload.routes.ts`
- `apps/api/src/modules/uploads/upload.schema.ts`

**Fonctionnalités** :
- `POST /api/organizations/:orgId/uploads` - Upload CSV file
  - Validation du fichier (taille max, type mime)
  - Stockage temporaire
  - Création d'un job de processing
  - Retour immédiat avec status PENDING
- `GET /api/organizations/:orgId/uploads` - Liste des uploads
- `GET /api/organizations/:orgId/uploads/:id` - Détail d'un upload
- `DELETE /api/organizations/:orgId/uploads/:id` - Supprimer un upload

#### 2. CSV Parser Utility
**Fichier** : `apps/api/src/utils/csv-parser.ts`

**Fonctionnalités** :
- Parser CSV avec papaparse
- Détection automatique des colonnes :
  - Date (format ISO, DD/MM/YYYY, MM/DD/YYYY)
  - Price/Amount (nombres avec €, $, etc.)
  - Quantity (entiers)
  - Category/Product (strings)
- Validation des données avec Zod
- Nettoyage des données (trim, normalize, dedupe)
- Retour d'erreurs détaillées

#### 3. Background Jobs (Bull Queue)
**Fichiers** :
- `apps/api/src/jobs/processors/csv-processor.ts`
- `apps/api/src/jobs/processors/aggregation-processor.ts`
- `apps/api/src/jobs/queue.ts`

**Jobs à implémenter** :
1. **CSV Processing Job**
   - Parser le CSV
   - Valider les données
   - Insérer dans `DataRecord`
   - Mettre à jour `Dataset` (rowCount, columnCount, metadata)
   - Déclencher le job d'aggregation
   - Mettre à jour le statut de l'Upload

2. **Aggregation Job**
   - Calculer les aggregations :
     - Ventes par jour/mois/année
     - Top produits (par quantité, par CA)
     - Répartition par catégorie
     - KPIs (CA total, moyenne, médiane)
   - Stocker dans `DataAggregation`
   - Mettre en cache Redis

#### 4. Module Analytics (/api/analytics)
**Fichiers** :
- `apps/api/src/modules/analytics/analytics.service.ts`
- `apps/api/src/modules/analytics/analytics.routes.ts`
- `apps/api/src/modules/analytics/analytics.schema.ts`

**Endpoints** :
- `GET /api/organizations/:orgId/datasets/:id/analytics` - Récupérer les stats
  - Query params : `type` (daily_sales, top_products, etc.)
  - Query params : `startDate`, `endDate`, `category`
  - Cache Redis avec TTL
- `GET /api/organizations/:orgId/datasets/:id/records` - Pagination des données brutes
  - Query params : `page`, `limit`, `filters`

#### 5. Module Organizations (/api/organizations)
**Fichiers** :
- `apps/api/src/modules/organizations/organization.service.ts`
- `apps/api/src/modules/organizations/organization.routes.ts`
- `apps/api/src/modules/organizations/organization.schema.ts`

**Endpoints** :
- `POST /api/organizations` - Créer une organization
- `GET /api/organizations` - Liste des orgs de l'user
- `GET /api/organizations/:id` - Détail d'une org
- `PATCH /api/organizations/:id` - Modifier une org
- `DELETE /api/organizations/:id` - Supprimer une org
- `POST /api/organizations/:id/invite` - Inviter un membre
- `GET /api/organizations/:id/members` - Liste des membres

### Frontend - Upload & Dashboard V1

#### 1. Auth Pages
**Fichiers** :
- `apps/web/src/app/auth/login/page.tsx`
- `apps/web/src/app/auth/register/page.tsx`
- `apps/web/src/components/auth/LoginForm.tsx`
- `apps/web/src/components/auth/RegisterForm.tsx`

#### 2. Dashboard Layout
**Fichiers** :
- `apps/web/src/app/dashboard/layout.tsx`
- `apps/web/src/components/layout/Sidebar.tsx`
- `apps/web/src/components/layout/Header.tsx`
- `apps/web/src/components/layout/UserMenu.tsx`

#### 3. Upload Feature
**Fichiers** :
- `apps/web/src/app/dashboard/upload/page.tsx`
- `apps/web/src/components/dashboard/UploadZone.tsx`
- `apps/web/src/components/dashboard/UploadProgress.tsx`
- `apps/web/src/hooks/useUpload.ts`

**Fonctionnalités** :
- Drag & drop CSV upload
- Preview des données
- Validation côté client
- Progress bar
- Gestion des erreurs

#### 4. Datasets List
**Fichiers** :
- `apps/web/src/app/dashboard/datasets/page.tsx`
- `apps/web/src/components/dashboard/DatasetCard.tsx`
- `apps/web/src/components/dashboard/DatasetList.tsx`

### Tests
- Tests unitaires pour les parsers
- Tests d'intégration pour les jobs
- Tests des endpoints avec supertest

---

## 📊 SEMAINE 3 : Dashboard Interactif

### Backend - Export & Sharing

#### 1. Module Exports (/api/exports)
**Fichiers** :
- `apps/api/src/modules/exports/export.service.ts`
- `apps/api/src/modules/exports/export.routes.ts`

**Fonctionnalités** :
- Génération de PDF avec puppeteer
- Export CSV des données filtrées
- Génération de liens publics

#### 2. Shared Dashboards
**Endpoints** :
- `POST /api/organizations/:orgId/datasets/:id/share` - Créer un lien public
- `GET /public/dashboards/:token` - Voir un dashboard public
- `DELETE /api/shared/:id` - Révoquer un lien

### Frontend - Visualizations

#### 1. Analytics Dashboard
**Fichiers** :
- `apps/web/src/app/dashboard/datasets/[id]/page.tsx`
- `apps/web/src/components/dashboard/AnalyticsDashboard.tsx`
- `apps/web/src/components/dashboard/charts/*`

**Charts à implémenter** :
- Line Chart : Evolution du CA
- Bar Chart : Top produits
- Pie Chart : Répartition par catégorie
- KPI Cards : CA total, moyenne, nombre de ventes

#### 2. Filtres Avancés
**Fichiers** :
- `apps/web/src/components/dashboard/Filters.tsx`
- `apps/web/src/components/dashboard/DateRangePicker.tsx`
- `apps/web/src/hooks/useFilters.ts`

**Fonctionnalités** :
- Date range picker
- Filtres par catégorie
- Filtres par produit
- Synchronisation entre charts (drill-down)

#### 3. UI Components (shadcn/ui)
**Composants à ajouter** :
- Button, Input, Label
- Select, Dropdown
- Card, Dialog
- Toast (notifications)
- Skeleton (loading states)

### Performance
- React.memo sur les charts
- Lazy loading des composants lourds
- Debounce sur les filtres
- Virtual scrolling pour les grandes listes

---

## 🚀 SEMAINE 4 : Production Ready

### Testing

#### 1. Backend Tests
- Tests unitaires (services, utils) → 70% coverage
- Tests d'intégration (API endpoints)
- Tests des jobs (Bull queue)

#### 2. Frontend Tests
- Tests E2E avec Playwright
  - Parcours complet : Register → Login → Upload → View Dashboard
  - Test des filtres
  - Test de l'export

#### 3. CI/CD
**Fichier** : `.github/workflows/ci.yml`
- Lint + Format check
- Tests backend
- Tests frontend
- Build check
- Deploy automatique sur merge to main

### Deploy

#### 1. Backend sur Render
- Create Web Service
- Configure environment variables
- Setup PostgreSQL (Neon)
- Setup Redis (Upstash)
- Health checks

#### 2. Frontend sur Vercel
- Import repo
- Configure root directory
- Add environment variables
- Auto-deploy on push

#### 3. Monitoring
- Structured logging avec Pino
- Error tracking (Sentry optionnel)
- Performance monitoring

### Documentation

#### 1. API Documentation
- Swagger/OpenAPI spec
- Postman collection
- Examples et use cases

#### 2. Developer Guide
- Architecture diagrams
- Database schema visual
- Setup guide détaillé
- Troubleshooting

#### 3. Portfolio Assets
- Screenshots haute qualité
- Demo video (GIF/MP4)
- Technical blog post
- Case study write-up

---

## 🎯 Features Bonus (Si temps)

### Nice to Have
- [ ] Dark mode toggle
- [ ] Multi-language support (i18n)
- [ ] Email notifications
- [ ] Scheduled reports
- [ ] Custom chart builder
- [ ] Annotations sur les charts
- [ ] Collaborative comments
- [ ] Webhook system
- [ ] API rate limiting per org
- [ ] Audit logs

### Optimizations
- [ ] Database indexing review
- [ ] Query optimization
- [ ] Redis caching strategy refinement
- [ ] Frontend bundle size optimization
- [ ] Image optimization

---

## 📦 Package Types à créer

**Fichier** : `packages/types/src/index.ts`

Types partagés entre backend et frontend :
```typescript
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Dataset {
  id: string;
  name: string;
  rowCount: number;
  // etc.
}

// Analytics types
export type AggregationType = 'DAILY_SALES' | 'MONTHLY_SALES' | 'TOP_PRODUCTS' | 'CATEGORY_BREAKDOWN';

export interface Analytics {
  type: AggregationType;
  data: any;
  createdAt: string;
}
```

---

## 🔧 Configuration à compléter

### ESLint
**Fichier** : `.eslintrc.js` (racine)
- Règles partagées
- Import order
- Unused vars

### Prettier
**Fichier** : `.prettierrc`
- Format rules
- Ignore patterns

### GitHub
**Fichier** : `.github/FUNDING.yml` (optionnel)
- Sponsor links

---

## 📝 Notes Importantes

### Priorités
1. **Fonctionnel > Parfait** : Fais marcher chaque feature avant de peaufiner
2. **Tests sur le critique** : Focus tests sur l'auth, upload, et jobs
3. **Deploy tôt** : Deploy dès la semaine 2 pour éviter les surprises

### Pièges à éviter
- ❌ Ne pas overengineer les charts
- ❌ Ne pas passer trop de temps sur le design
- ❌ Ne pas oublier les loading states
- ❌ Ne pas négliger les erreurs utilisateur

### Points d'attention
- ✅ Bien gérer les états d'erreur
- ✅ Loading states partout
- ✅ Validation côté client ET serveur
- ✅ Messages d'erreur clairs
- ✅ UX fluide même avec latence

---

**Let's build this! 🚀**
