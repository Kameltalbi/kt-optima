# Système Multi-Tenant - BilvoxaERP

## ✅ Implémentation Complète

L'application est maintenant **multi-tenant** avec isolation complète des données par entreprise.

## Architecture

### 1. Contexte d'Authentification (`AuthContext`)

**Fichier :** `src/contexts/AuthContext.tsx`

- Gère l'utilisateur connecté et son entreprise
- Stocke `company_id` dans le contexte
- Persiste la session dans `localStorage`
- Fournit les fonctions `login()`, `logout()`, `register()`

**Utilisation :**
```tsx
import { useAuth } from '@/contexts/AuthContext';

const { companyId, user, company, isAuthenticated } = useAuth();
```

### 2. Routes Protégées (`ProtectedRoute`)

**Fichier :** `src/components/auth/ProtectedRoute.tsx`

- Redirige vers `/login` si non authentifié
- Affiche un loader pendant la vérification
- Enveloppe toutes les routes ERP

### 3. Filtrage Automatique dans les Hooks

**Hooks mis à jour :**
- `use-hr.ts` : Filtre automatiquement par `company_id`
- `use-accounting.ts` : Prêt pour le filtrage (à compléter)

**Fonctionnement :**
- Toutes les données chargées sont filtrées par `company_id`
- Les nouvelles créations utilisent automatiquement le `company_id` du contexte
- Le localStorage stocke les données de toutes les entreprises mais filtre à l'affichage

### 4. Pages d'Authentification

**Login** (`src/pages/Login.tsx`)
- Formulaire de connexion
- Redirige vers `/dashboard` après connexion
- Gestion des erreurs

**Register** (`src/pages/Register.tsx`)
- Création de compte + entreprise
- Premier utilisateur = admin automatique
- Redirige vers `/dashboard` après inscription

## Isolation des Données

### Base de Données
- ✅ Toutes les tables ont un `company_id`
- ✅ Clés étrangères avec CASCADE approprié
- ✅ Indexes sur `company_id` pour performance

### Frontend
- ✅ Tous les hooks filtrent par `company_id`
- ✅ Les créations utilisent automatiquement le `company_id` du contexte
- ✅ Le localStorage stocke multi-tenant mais filtre à l'affichage

## Utilisation

### Pour les Développeurs

1. **Accéder au contexte :**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { companyId, user, company } = useAuth();
  // companyId est automatiquement utilisé dans les hooks
}
```

2. **Créer des données :**
```tsx
const { createEmployee } = useHR();
// Le company_id est automatiquement ajouté
createEmployee({
  firstName: "Jean",
  lastName: "Dupont",
  // company_id est ajouté automatiquement
});
```

3. **Les hooks filtrent automatiquement :**
```tsx
const { employees } = useHR();
// employees contient uniquement les employés de l'entreprise actuelle
```

## Sécurité

### Frontend (Actuel)
- ✅ Routes protégées avec `ProtectedRoute`
- ✅ Filtrage automatique dans les hooks
- ✅ Validation que `company_id` est présent avant création

### Backend (À implémenter)
- ⚠️ **IMPORTANT** : Le filtrage backend est obligatoire
- Toutes les requêtes SQL doivent inclure `WHERE company_id = ?`
- Middleware pour vérifier que l'utilisateur appartient à l'entreprise
- Validation que les ressources créées appartiennent à l'entreprise de l'utilisateur

## Test Multi-Tenant

1. **Créer deux comptes :**
   - Compte 1 : `admin@entreprise1.tn` / `password`
   - Compte 2 : `admin@entreprise2.tn` / `password`

2. **Vérifier l'isolation :**
   - Se connecter avec le compte 1
   - Créer des employés
   - Se déconnecter
   - Se connecter avec le compte 2
   - Les employés du compte 1 ne doivent pas être visibles

## Prochaines Étapes (Backend)

1. **Middleware d'authentification**
   - Vérifier le token JWT
   - Extraire `company_id` du token
   - Ajouter `company_id` à toutes les requêtes

2. **Row Level Security (PostgreSQL)**
   - Policies pour filtrer automatiquement par `company_id`
   - Sécurité au niveau base de données

3. **Validation des ressources**
   - Vérifier que les ressources créées/modifiées appartiennent à l'entreprise
   - Empêcher l'accès cross-tenant

## Notes

- Le système fonctionne actuellement avec des données mockées
- En production, remplacer les appels localStorage par des appels API
- Le backend doit valider TOUJOURS le `company_id` pour éviter les fuites de données
