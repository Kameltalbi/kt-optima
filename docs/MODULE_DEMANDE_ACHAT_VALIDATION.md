# Module Demande d'Achat avec Validation Automatique par Paliers

## 📋 Vue d'ensemble

Ce module implémente un système de validation automatique des demandes d'achat basé sur des paliers de budget, entièrement paramétrable par organisation.

## 🎯 Fonctionnalités principales

1. **Paramétrage par organisation** : Configuration des paliers de budget et validateurs
2. **Validation automatique** : Calcul automatique du palier selon le montant
3. **Workflow séquentiel** : Validations séquentielles avec progression automatique
4. **Traçabilité complète** : Historique des validations avec commentaires

## 🗄️ Structure de la base de données

### Tables créées

1. **`budget_paliers`** : Paliers de budget avec montants min/max et nombre de validations
2. **`budget_palier_validateurs`** : Liste des validateurs par palier et niveau
3. **`purchase_request_settings`** : Paramètres de validation par organisation
4. **`purchase_request_validations`** : Validations effectuées sur les demandes

### Fonctions SQL

- **`get_budget_palier(company_id, montant)`** : Retourne le palier correspondant au montant
- **`generate_purchase_request_validations(demande_id)`** : Génère automatiquement les validations

## 🔧 Configuration

### 1. Paramètres généraux

Dans **Paramètres > Achats > Validation**, activez :
- ✅ Validation par paliers
- Montant maximum autorisé (optionnel)

### 2. Création des paliers

Pour chaque palier, définissez :
- **Montant minimum** (inclus)
- **Montant maximum** (inclus)
- **Nombre de validations** requises
- **Ordre** d'application

⚠️ **Règles importantes** :
- Les paliers ne doivent pas se chevaucher
- Les montants doivent être strictement croissants
- L'ordre détermine la priorité d'application

### 3. Configuration des validateurs

Pour chaque palier, ajoutez des validateurs par niveau :
- **Niveau de validation** : 1 = première, 2 = deuxième, etc.
- **Type** : Par rôle (ex: Manager, Finance) ou par utilisateur spécifique
- **Ordre** : Ordre de validation dans le niveau (pour remplaçants)

## 📝 Workflow de validation

### Soumission d'une demande

1. L'utilisateur crée une demande d'achat en **brouillon**
2. Il ajoute des lignes avec montants
3. Au clic sur **"Soumettre"** :
   - Calcul du montant total
   - Identification automatique du palier
   - Génération des validations selon le palier
   - Statut passe à **"En validation"**
   - Première validation assignée au premier validateur

### Processus de validation

1. **Notification** : Le validateur reçoit une notification
2. **Validation/Rejet** : Le validateur peut :
   - ✅ **Valider** : Déclenche la validation suivante
   - ❌ **Rejeter** : Arrête définitivement le workflow
3. **Progression automatique** :
   - Si validé → Validation suivante activée
   - Si toutes validées → Statut passe à **"Validée"**
   - Si rejeté → Statut passe à **"Rejetée"**

### Statuts possibles

- **Brouillon** : Demande non soumise
- **En validation** : En cours de validation
- **Validée** : Toutes les validations effectuées
- **Rejetée** : Une validation a été rejetée

## 🔄 Cas particuliers

### Modification du montant après soumission

Si le montant est modifié :
- ✅ **Brouillon** : Modification libre
- ⚠️ **En validation** : Réinitialisation du workflow
  - Retour au statut "Brouillon"
  - Suppression des validations existantes
  - Recalcul du palier
  - Nouvelle soumission requise

### Montant dépassant le palier maximum

Si le montant dépasse tous les paliers :
- Si `montant_max_autorise` est défini et dépassé :
  - ❌ Blocage de la soumission
  - Message : "Validation exceptionnelle requise"
- Sinon :
  - ⚠️ Avertissement mais soumission possible

## 💻 Utilisation dans le code

### Hook principal

```typescript
import { usePurchaseRequestValidation } from "@/hooks/use-purchase-request-validation";

const {
  settings,
  paliers,
  submitRequest,
  validateStep,
  recalculatePalier,
} = usePurchaseRequestValidation();
```

### Soumettre une demande

```typescript
const { success, palierId } = await submitRequest(demandeId, montantTotal);
```

### Valider/Rejeter une étape

```typescript
await validateStep(validationId, "valide", "Commentaire optionnel");
// ou
await validateStep(validationId, "rejete", "Raison du rejet");
```

### Recalculer le palier

```typescript
await recalculatePalier(demandeId, nouveauMontant);
```

## 📄 Pages disponibles

1. **`/achats/parametres-validation`** : Configuration des paliers et validateurs
2. **`/achats/validation-demandes`** : Interface de validation pour les validateurs

## 🔐 Sécurité

- **RLS activé** sur toutes les tables
- Les utilisateurs ne voient que les demandes de leur entreprise
- Les validateurs ne peuvent valider que leurs assignations
- Les admins peuvent gérer les paramètres de leur entreprise

## 📊 Exemple de flux

### Configuration

```
Palier 1: 0 - 10,000 MAD → 1 validation (Manager)
Palier 2: 10,001 - 50,000 MAD → 2 validations (Manager → Finance)
Palier 3: 50,001+ MAD → 3 validations (Manager → Finance → Direction)
```

### Flux de validation

```
Demande: 25,000 MAD
↓
Palier 2 identifié
↓
Validation 1: Manager (en attente)
↓ [Manager valide]
Validation 2: Finance (en attente)
↓ [Finance valide]
Statut: Validée ✅
```

## 🚀 Prochaines étapes

- [ ] Notifications par email
- [ ] Historique complet des validations
- [ ] Dashboard de suivi des validations
- [ ] Export des rapports de validation
- [ ] Validation par délégation
