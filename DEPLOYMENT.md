# 🚀 SalesScope - Guide de Déploiement

## 📦 Prérequis

Avant de déployer, assure-toi d'avoir :
- ✅ Un compte GitHub avec le repo SalesScope
- ✅ Un compte Render (gratuit)
- ✅ Un compte Vercel (gratuit)
- ✅ Un compte Neon (PostgreSQL gratuit)
- ✅ Un compte Upstash (Redis gratuit)

---

## 🗄️ Étape 1 : Database (Neon PostgreSQL)

### 1.1 Créer la base de données

1. Va sur https://neon.tech
2. Clique sur "Sign up" (gratuit)
3. Créer un nouveau projet
   - Project name : `salesscope-prod`
   - Region : Choisis la plus proche (ex: Frankfurt pour EU)
4. Neon va créer automatiquement une database `neondb`

### 1.2 Récupérer la connection string

1. Dans le dashboard Neon, clique sur "Connection String"
2. Copie la string qui ressemble à :
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
3. **⚠️ Important** : Remplace `?sslmode=require` par `?sslmode=require&connection_limit=10`
   - Render free tier a des limites de connexions
   - Cette config évite les erreurs "too many clients"

### 1.3 Initialiser la database

**Option A : Depuis ton local**
```bash
# Dans apps/api/.env, remplace DATABASE_URL par la connection string Neon
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require&connection_limit=10"

# Lance les migrations
pnpm db:migrate
```

**Option B : Après deploy (recommandé)**
- On fera les migrations depuis Render directement

---

## 🔴 Étape 2 : Redis (Upstash)

### 2.1 Créer le database Redis

1. Va sur https://upstash.com
2. Sign up (gratuit)
3. Créer un nouveau database
   - Name : `salesscope-redis`
   - Type : Regional
   - Region : Choisis la même région que Neon
   - Primary location : Frankfurt (ou le plus proche)

### 2.2 Récupérer la connection string

1. Dans le dashboard de ton database
2. Scroll jusqu'à "REST API" ou "Redis"
3. Copie **REDIS_URL** qui ressemble à :
   ```
   redis://default:xxx@region.upstash.io:6379
   ```

---

## 🖥️ Étape 3 : Backend API (Render)

### 3.1 Créer le Web Service

1. Va sur https://render.com
2. Sign up / Login
3. Dashboard → "New +" → "Web Service"
4. Connect ton repository GitHub `salesscope`
5. Configure :

**Basic Settings :**
- **Name** : `salesscope-api`
- **Region** : Same as Neon/Upstash
- **Branch** : `main`
- **Root Directory** : `apps/api`
- **Runtime** : `Node`

**Build & Deploy :**
- **Build Command** :
  ```bash
  pnpm install && pnpm build
  ```
- **Start Command** :
  ```bash
  pnpm start
  ```

**Instance Type :**
- Choisis **Free** (512 MB RAM, spins down after 15min)

### 3.2 Environment Variables

Clique sur "Advanced" → "Add Environment Variable"

Ajoute toutes ces variables :

```bash
# Node
NODE_ENV=production

# Server
PORT=10000
HOST=0.0.0.0

# Database (copie depuis Neon)
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require&connection_limit=10

# Redis (copie depuis Upstash)
REDIS_URL=redis://default:xxx@region.upstash.io:6379

# JWT Secrets (GÉNÈRE DES VRAIS SECRETS !)
# Pour générer : node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_ACCESS_SECRET=ton-secret-access-tres-long-et-securise-32-chars-minimum
JWT_REFRESH_SECRET=ton-secret-refresh-different-tres-long-et-securise-32-chars-minimum
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_TIMEWINDOW=15m

# CORS (URL de ton frontend Vercel, on mettra à jour après)
CORS_ORIGIN=https://ton-app.vercel.app

# File Upload
MAX_FILE_SIZE=10485760
```

### 3.3 Deploy

1. Clique sur "Create Web Service"
2. Render va build et deploy automatiquement
3. Attends la fin du deploy (~5-10 min)

### 3.4 Migrations Prisma

**Important** : Il faut lancer les migrations après le premier deploy

1. Dans le dashboard Render, va sur ton service `salesscope-api`
2. Onglet "Shell" en haut
3. Lance :
   ```bash
   cd apps/api
   npx prisma migrate deploy
   ```

### 3.5 Tester l'API

1. Note l'URL de ton API : `https://salesscope-api.onrender.com`
2. Test le health check :
   ```bash
   curl https://salesscope-api.onrender.com/health
   ```
3. Tu devrais voir :
   ```json
   {
     "status": "ok",
     "services": {
       "database": "connected",
       "redis": "connected"
     }
   }
   ```

---

## 🌐 Étape 4 : Frontend (Vercel)

### 4.1 Importer le projet

1. Va sur https://vercel.com
2. Sign up / Login
3. Dashboard → "Add New..." → "Project"
4. Import ton repo GitHub `salesscope`
5. Configure :

**Project Settings :**
- **Framework Preset** : Next.js
- **Root Directory** : `apps/web`
- **Build Command** : `pnpm build`
- **Install Command** : `pnpm install`
- **Output Directory** : `.next`

### 4.2 Environment Variables

Ajoute cette variable :

```bash
NEXT_PUBLIC_API_URL=https://salesscope-api.onrender.com
```

**⚠️ Remplace** `salesscope-api` par le vrai nom de ton service Render !

### 4.3 Deploy

1. Clique sur "Deploy"
2. Vercel va build et deploy (~2-3 min)
3. Une fois fini, tu auras une URL : `https://ton-app.vercel.app`

### 4.4 Mettre à jour le CORS sur Render

**Important** : Maintenant que tu as l'URL Vercel, il faut l'ajouter au CORS

1. Retourne sur Render → `salesscope-api`
2. Onglet "Environment"
3. Modifie `CORS_ORIGIN` :
   ```bash
   CORS_ORIGIN=https://ton-app.vercel.app
   ```
4. Save → Le service va redémarrer automatiquement

---

## ✅ Étape 5 : Vérification

### 5.1 Test complet

1. **Frontend** : Ouvre `https://ton-app.vercel.app`
2. **Health API** : Ouvre `https://salesscope-api.onrender.com/health`
3. **Test register** :
   ```bash
   curl -X POST https://salesscope-api.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123!@#",
       "firstName": "John",
       "lastName": "Doe"
     }'
   ```

### 5.2 Problèmes courants

#### ❌ "Database connection error"
- Vérifie que `DATABASE_URL` est correct
- Check que les migrations sont faites (`npx prisma migrate deploy`)
- Neon peut prendre 1-2min pour "wake up" si inactif

#### ❌ "Redis connection error"
- Vérifie que `REDIS_URL` est correct
- Check que tu as bien copié l'URL complète avec le password

#### ❌ "CORS error" dans le browser
- Vérifie que `CORS_ORIGIN` sur Render match l'URL Vercel
- Attention aux trailing slash (avec ou sans `/` à la fin)

#### ❌ "Cold start" sur Render (premier appel lent)
- **Normal** : Render free tier "spin down" après 15min d'inactivité
- Le premier appel prend ~30-60 secondes
- Les appels suivants sont rapides
- Solution : Ajoute un disclaimer dans ton portfolio

---

## 🎨 Étape 6 : Custom Domain (Optionnel)

### 6.1 Acheter un domaine

Si tu veux un vrai domaine (ex: `salesscope.dev`) :
- Namecheap : ~10€/an
- OVH : ~12€/an
- Google Domains : ~12€/an

### 6.2 Configurer Vercel

1. Dans Vercel → Settings → Domains
2. Add domain : `salesscope.dev`
3. Vercel te donne des DNS records
4. Va sur ton registrar et ajoute les DNS records
5. Attends 1-24h pour la propagation

### 6.3 Configurer Render (optionnel)

Pour avoir une URL custom pour l'API :
1. Dans Render → Settings → Custom Domain
2. Add : `api.salesscope.dev`
3. Configure les DNS CNAME chez ton registrar

---

## 📊 Étape 7 : Monitoring

### 7.1 Render Dashboard

- **Logs** : Onglet "Logs" pour voir les erreurs
- **Metrics** : CPU, Memory, Response time
- **Events** : Deploys, restarts, etc.

### 7.2 Vercel Analytics

- Activer "Web Analytics" (gratuit)
- Voir les Core Web Vitals
- Monitoring des erreurs

### 7.3 Uptime Monitoring (Optionnel)

Pour éviter le cold start sur Render :
- UptimeRobot (gratuit) : Ping toutes les 5 min
- Cron-job.org : Idem
- **⚠️ Attention** : Render peut bloquer si trop de pings

---

## 🔄 CI/CD : Deploy Automatique

### 7.1 Setup (déjà configuré !)

Les deux services redéploient automatiquement sur `git push` :
- Vercel : Sur chaque push sur `main`
- Render : Sur chaque push sur `main`

### 7.2 Workflow

```bash
# Développe en local
git add .
git commit -m "feat: add dashboard"
git push origin main

# Automatic deploys triggered!
# Vercel : ~2 min
# Render : ~5 min
```

---

## 💰 Coûts (100% Gratuit)

| Service | Free Tier | Limitations |
|---------|-----------|-------------|
| **Neon** | ✅ Gratuit | 10 projets, auto-suspend après inactivité |
| **Upstash** | ✅ Gratuit | 10k commandes/jour |
| **Render** | ✅ Gratuit | 750h/mois, spin down après 15min |
| **Vercel** | ✅ Gratuit | 100GB bandwidth, unlimited sites |

**Total** : 0€/mois 🎉

---

## 🚀 Prochaines Étapes

1. ✅ Backend déployé
2. ✅ Frontend déployé
3. 🔥 Continue le développement (Semaine 2-4)
4. 📸 Prends des screenshots pour ton portfolio
5. 🎥 Enregistre une démo vidéo
6. 📝 Écris un case study technique

---

## 📞 Troubleshooting

### Logs Backend (Render)

```bash
# Dans le dashboard Render
Logs → Live Logs

# Ou avec Render CLI
render logs -s salesscope-api
```

### Logs Frontend (Vercel)

```bash
# Dans le dashboard Vercel
Deployment → View Function Logs

# Ou avec Vercel CLI
vercel logs
```

### Reset Database

```bash
# Shell Render
cd apps/api
npx prisma migrate reset --force
npx prisma migrate deploy
```

---

**Ton app est maintenant LIVE ! 🎉**

URLs à garder :
- Frontend : `https://ton-app.vercel.app`
- API : `https://salesscope-api.onrender.com`
- Health : `https://salesscope-api.onrender.com/health`

**Next** : Finis le développement (Semaines 2-4) et redéploie à chaque feature ! 🚀
