# Déploiement de la Base de Données - BilvoxaERP

## État Actuel

- ✅ **Schéma SQL** : 52 tables définies dans `database/schema.sql`
- ❌ **Base de données** : Non déployée (locale uniquement)
- ❌ **Backend/API** : Non créé
- ⚠️ **Frontend** : Utilise `localStorage` (données simulées)

## Options de Déploiement

### Option 1 : Supabase (Recommandé - Gratuit)

**Avantages :**
- Gratuit jusqu'à 500 MB
- PostgreSQL géré
- API REST automatique
- Authentification intégrée
- Dashboard en ligne

**Étapes :**

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer les credentials :
   - Project URL
   - API Key (anon/public)
   - Database Password
4. Exécuter le schéma SQL dans l'éditeur SQL de Supabase :
   ```sql
   -- Copier le contenu de database/schema.sql
   ```

**Configuration :**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

---

### Option 2 : Neon (PostgreSQL Serverless)

**Avantages :**
- Gratuit jusqu'à 512 MB
- PostgreSQL serverless
- Auto-scaling
- Branches de base de données

**Étapes :**

1. Créer un compte sur [neon.tech](https://neon.tech)
2. Créer un projet
3. Récupérer la connection string
4. Exécuter le schéma SQL via l'éditeur SQL

**Configuration :**
```env
DATABASE_URL=postgresql://user:password@host/dbname
```

---

### Option 3 : Railway (Simple & Rapide)

**Avantages :**
- Gratuit jusqu'à 5$/mois
- Déploiement en 1 clic
- PostgreSQL pré-configuré

**Étapes :**

1. Créer un compte sur [railway.app](https://railway.app)
2. Créer un nouveau projet
3. Ajouter PostgreSQL
4. Exécuter le schéma SQL via Railway CLI ou dashboard

---

### Option 4 : Render (Gratuit 90 jours)

**Avantages :**
- Gratuit pendant 90 jours
- PostgreSQL géré
- Simple à configurer

**Étapes :**

1. Créer un compte sur [render.com](https://render.com)
2. Créer une base PostgreSQL
3. Exécuter le schéma SQL

---

## Configuration Backend Requise

Pour connecter le frontend à PostgreSQL, il faut créer un backend API.

### Architecture Recommandée

```
Frontend (React) 
    ↓ HTTP/HTTPS
Backend API (Node.js/Express ou Python/FastAPI)
    ↓ PostgreSQL Driver
Base de données PostgreSQL (Supabase/Neon/etc.)
```

### Stack Backend Suggérée

**Option A : Node.js + Express + Prisma**
- TypeScript
- Prisma ORM
- Express.js
- JWT pour l'authentification

**Option B : Python + FastAPI + SQLAlchemy**
- FastAPI
- SQLAlchemy ORM
- Pydantic pour la validation
- JWT pour l'authentification

---

## Prochaines Étapes

1. **Choisir un hébergeur PostgreSQL** (Supabase recommandé)
2. **Créer la base de données** et exécuter `database/schema.sql`
3. **Créer le backend API** pour remplacer `localStorage`
4. **Mettre à jour le frontend** pour utiliser l'API au lieu de `localStorage`
5. **Configurer l'authentification** multi-tenant

---

## Variables d'Environnement

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=production
```

---

## Migration depuis localStorage

Une fois le backend créé, il faudra :

1. Créer des scripts de migration pour transférer les données de `localStorage` vers PostgreSQL
2. Mettre à jour tous les hooks (`use-crm.ts`, `use-hr.ts`, etc.) pour utiliser l'API
3. Tester la migration avec des données de test

---

## Support

Pour toute question sur le déploiement, consulter :
- Documentation Supabase : https://supabase.com/docs
- Documentation Neon : https://neon.tech/docs
- Schéma SQL : `database/schema.sql`
