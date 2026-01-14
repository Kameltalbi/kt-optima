# ERP MVP - Schéma de Base de Données

## Vue d'ensemble

Schéma de base de données PostgreSQL/Supabase pour un ERP modulaire MVP. Structure simple, claire et évolutive, orientée métier.

## Structure des modules

### 📊 Statistiques
- **Total de tables** : 18 tables principales
- **Total d'enums** : 7 enums
- **Total d'index** : ~60 index
- **Total de triggers** : 11 triggers (updated_at)

---

## 📦 MODULE CRM

### Table: `clients`
**Rôle** : Gère les clients et prospects du CRM

**Colonnes principales** :
- `code` : Code client unique (ex: CLI-001)
- `nom` : Nom du client
- `type` : 'prospect' ou 'client'
- `solde_actuel` : Solde calculé (factures - paiements)

**Relations** :
- → `factures_ventes` (1 client → N factures)
- → `mouvements_tresorerie` (paiements clients)

**Index** : company_id, type, code, nom

---

## 🏢 MODULE FOURNISSEURS

### Table: `fournisseurs`
**Rôle** : Gère les fournisseurs de l'entreprise

**Colonnes principales** :
- `code` : Code fournisseur unique (ex: FRN-001)
- `nom` : Nom du fournisseur
- `solde_actuel` : Solde calculé (factures - paiements)

**Relations** :
- → `factures_achats` (1 fournisseur → N factures)
- → `mouvements_tresorerie` (paiements fournisseurs)

**Index** : company_id, code, nom

---

## 📦 MODULE PRODUITS / SERVICES

### Table: `produits`
**Rôle** : Gère les produits et services (stockable ou non)

**Colonnes principales** :
- `code` : Code produit unique (ex: PRD-001)
- `nom` : Nom du produit/service
- `type` : 'produit' ou 'service'
- `stockable` : true = produit stockable, false = service
- `stock_actuel` : Stock calculé via mouvements
- `prix_achat` : Prix d'achat moyen
- `prix_vente` : Prix de vente

**Relations** :
- → `facture_vente_lignes` (1 produit → N lignes de vente)
- → `facture_achat_lignes` (1 produit → N lignes d'achat)
- → `mouvements_stock` (1 produit → N mouvements)

**Index** : company_id, code, type, stockable, categorie

---

## 💰 MODULE VENTES

### Table: `factures_ventes`
**Rôle** : Factures de vente

**Colonnes principales** :
- `numero` : Numéro de facture unique (ex: FV-2024-001)
- `date_facture` : Date de la facture
- `client_id` : Référence au client
- `statut` : 'brouillon', 'validee', 'annulee', 'payee'
- `montant_ht`, `montant_tva`, `montant_ttc` : Montants
- `montant_paye`, `montant_restant` : Suivi paiement

**Relations** :
- ← `clients` (N factures → 1 client)
- → `facture_vente_lignes` (1 facture → N lignes)
- → `mouvements_stock` (génère des sorties de stock)
- → `ecritures_comptables` (génère une écriture)

**Index** : company_id, client_id, numero, date_facture, statut

### Table: `facture_vente_lignes`
**Rôle** : Lignes de détail d'une facture de vente

**Colonnes principales** :
- `facture_vente_id` : Référence à la facture
- `produit_id` : Référence au produit
- `quantite` : Quantité vendue
- `prix_unitaire` : Prix unitaire HT
- `montant_ht`, `montant_tva`, `montant_ttc` : Montants calculés

**Relations** :
- ← `factures_ventes` (N lignes → 1 facture)
- ← `produits` (N lignes → 1 produit)

**Index** : facture_vente_id, produit_id

---

## 🛒 MODULE ACHATS

### Table: `factures_achats`
**Rôle** : Factures d'achat (factures fournisseurs)

**Colonnes principales** :
- `numero` : Numéro de facture fournisseur (unique)
- `numero_interne` : Numéro interne (ex: FA-2024-001)
- `date_facture` : Date de la facture
- `fournisseur_id` : Référence au fournisseur
- `statut` : 'brouillon', 'validee', 'annulee', 'payee'
- `montant_ht`, `montant_tva`, `montant_ttc` : Montants
- `montant_paye`, `montant_restant` : Suivi paiement

**Relations** :
- ← `fournisseurs` (N factures → 1 fournisseur)
- → `facture_achat_lignes` (1 facture → N lignes)
- → `mouvements_stock` (génère des entrées de stock)
- → `ecritures_comptables` (génère une écriture)

**Index** : company_id, fournisseur_id, numero, date_facture, statut

### Table: `facture_achat_lignes`
**Rôle** : Lignes de détail d'une facture d'achat

**Colonnes principales** :
- `facture_achat_id` : Référence à la facture
- `produit_id` : Référence au produit
- `quantite` : Quantité achetée
- `prix_unitaire` : Prix unitaire HT
- `montant_ht`, `montant_tva`, `montant_ttc` : Montants calculés

**Relations** :
- ← `factures_achats` (N lignes → 1 facture)
- ← `produits` (N lignes → 1 produit)

**Index** : facture_achat_id, produit_id

---

## 📊 MODULE STOCKS

### Table: `mouvements_stock`
**Rôle** : Mouvements de stock (entrées/sorties uniquement)

**Colonnes principales** :
- `produit_id` : Référence au produit
- `type` : 'entree' ou 'sortie'
- `quantite` : Quantité (toujours positive)
- `date_mouvement` : Date du mouvement
- `reference_type` : Type de référence ('facture_vente', 'facture_achat', 'ajustement')
- `reference_id` : ID de la référence

**Relations** :
- ← `produits` (N mouvements → 1 produit)
- ← `factures_ventes` (via reference_type/reference_id)
- ← `factures_achats` (via reference_type/reference_id)

**Index** : company_id, produit_id, type, date_mouvement, reference

**Note** : Le stock actuel est calculé côté application : `SUM(entrees) - SUM(sorties)`

---

## 📚 MODULE COMPTABILITÉ

### Table: `ecritures_comptables`
**Rôle** : Écritures comptables (journal)

**Colonnes principales** :
- `numero` : Numéro d'écriture (ex: EC-2024-001)
- `date_ecriture` : Date de l'écriture
- `journal` : Journal comptable ('Ventes', 'Achats', 'Banque', 'OD')
- `libelle` : Libellé de l'écriture
- `total_debit` : Total débit (vérification équilibre)
- `total_credit` : Total crédit (vérification équilibre)
- `validee` : true si équilibrée (débit = crédit)
- `reference_type` : Type de référence ('facture_vente', 'facture_achat', 'paiement', 'salaire')
- `reference_id` : ID de la référence

**Relations** :
- → `ecriture_lignes` (1 écriture → N lignes)
- ← `factures_ventes` (via reference_type/reference_id)
- ← `factures_achats` (via reference_type/reference_id)
- ← `mouvements_tresorerie` (via reference_type/reference_id)
- ← `salaires` (via reference_type/reference_id)

**Index** : company_id, numero, date_ecriture, journal, reference

**Contrainte métier** : `total_debit` doit toujours égaler `total_credit` (vérifié côté application)

### Table: `ecriture_lignes`
**Rôle** : Lignes d'écriture comptable (débit/crédit)

**Colonnes principales** :
- `ecriture_id` : Référence à l'écriture
- `compte_comptable` : Numéro de compte (ex: '411000', '701000', '512000')
- `libelle` : Libellé de la ligne
- `type` : 'debit' ou 'credit'
- `montant` : Montant (toujours positif)

**Relations** :
- ← `ecritures_comptables` (N lignes → 1 écriture)

**Index** : ecriture_id, compte_comptable, type

**Note** : Le plan comptable n'est pas dans ce schéma MVP (à ajouter si nécessaire)

---

## 💳 MODULE TRÉSORERIE

### Table: `comptes_tresorerie`
**Rôle** : Comptes de trésorerie (banque, caisse)

**Colonnes principales** :
- `code` : Code compte (ex: BANQ-001, CAISSE-001)
- `nom` : Nom du compte
- `type` : 'banque' ou 'caisse'
- `numero_compte` : Numéro de compte bancaire
- `iban` : IBAN
- `solde_initial` : Solde à l'ouverture
- `solde_actuel` : Solde calculé via mouvements

**Relations** :
- → `mouvements_tresorerie` (1 compte → N mouvements)
- → `salaires` (compte utilisé pour paiement)

**Index** : company_id, code, type

### Table: `mouvements_tresorerie`
**Rôle** : Mouvements de trésorerie (entrées/sorties)

**Colonnes principales** :
- `compte_tresorerie_id` : Référence au compte
- `type` : 'entree' ou 'sortie'
- `date_mouvement` : Date du mouvement
- `montant` : Montant (toujours positif)
- `libelle` : Libellé du mouvement
- `reference_type` : Type de référence ('paiement_client', 'paiement_fournisseur', 'salaire', 'virement')
- `reference_id` : ID de la référence
- `moyen_paiement` : 'cheque', 'virement', 'especes', 'carte'
- `numero_piece` : Numéro de chèque, virement, etc.

**Relations** :
- ← `comptes_tresorerie` (N mouvements → 1 compte)
- → `ecritures_comptables` (génère une écriture)

**Index** : company_id, compte_tresorerie_id, type, date_mouvement, reference

---

## 👥 MODULE RH

### Table: `employes`
**Rôle** : Employés de l'entreprise

**Colonnes principales** :
- `code` : Code employé (ex: EMP-001)
- `nom`, `prenom` : Nom et prénom
- `date_embauche` : Date d'embauche
- `date_depart` : Date de départ (NULL si actif)
- `poste` : Poste occupé
- `salaire_base` : Salaire de base

**Relations** :
- → `salaires` (1 employé → N fiches de paie)
- → `parc_affectations` (1 employé → N affectations)

**Index** : company_id, code, actif

### Table: `salaires`
**Rôle** : Fiches de paie / salaires

**Colonnes principales** :
- `numero` : Numéro de fiche de paie (ex: SAL-2024-001)
- `employe_id` : Référence à l'employé
- `periode_debut`, `periode_fin` : Période de paie
- `date_paiement` : Date de paiement
- `salaire_brut` : Salaire brut
- `cotisations_salariales` : Cotisations salariales
- `cotisations_patronales` : Cotisations patronales
- `salaire_net` : Salaire net (brut - cotisations salariales)
- `net_a_payer` : Net à payer
- `compte_tresorerie_id` : Compte utilisé pour le paiement
- `paye` : Si le salaire a été payé

**Relations** :
- ← `employes` (N salaires → 1 employé)
- ← `comptes_tresorerie` (N salaires → 1 compte)
- → `mouvements_tresorerie` (génère un mouvement sortie)
- → `ecritures_comptables` (génère une écriture)

**Index** : company_id, employe_id, numero, periode, date_paiement

---

## 🚗 MODULE GESTION DE PARC

### Table: `parc_actifs`
**Rôle** : Actifs du parc (véhicules, matériel, immobilier)

**Colonnes principales** :
- `code` : Code actif (ex: VEH-001, MAT-001)
- `nom` : Nom de l'actif
- `type` : 'vehicule', 'materiel', 'immobilier', 'autre'
- `marque`, `modele` : Marque et modèle
- `immatriculation` : Immatriculation (pour véhicules)
- `date_acquisition` : Date d'acquisition
- `valeur_acquisition` : Valeur d'acquisition
- `valeur_residuelle` : Valeur résiduelle (pour amortissement)
- `duree_amortissement` : Durée d'amortissement en mois
- `valeur_comptable` : Valeur comptable actuelle

**Relations** :
- → `parc_affectations` (1 actif → N affectations)
- → `ecritures_comptables` (génère une écriture d'immobilisation)

**Index** : company_id, code, type, actif

### Table: `parc_affectations`
**Rôle** : Affectations d'actifs aux employés

**Colonnes principales** :
- `actif_id` : Référence à l'actif
- `employe_id` : Référence à l'employé (NULL si non affecté)
- `date_debut` : Date de début d'affectation
- `date_fin` : Date de fin (NULL si toujours actif)
- `statut` : 'active' ou 'terminee'

**Relations** :
- ← `parc_actifs` (N affectations → 1 actif)
- ← `employes` (N affectations → 1 employé)

**Index** : company_id, actif_id, employe_id, statut

---

## 🔗 Relations métier importantes

### 1. Facture de vente validée génère :
- ✅ Des `mouvements_stock` (type='sortie') si produits stockables
- ✅ Une `ecriture_comptable` avec `ecriture_lignes` (débit client, crédit vente)

### 2. Facture d'achat validée génère :
- ✅ Des `mouvements_stock` (type='entree') si produits stockables
- ✅ Une `ecriture_comptable` avec `ecriture_lignes` (débit achat, crédit fournisseur)

### 3. Paiement (mouvement_tresorerie) génère :
- ✅ Une `ecriture_comptable` avec `ecriture_lignes` (débit/crédit selon type)

### 4. Salaire payé génère :
- ✅ Un `mouvement_tresorerie` (type='sortie')
- ✅ Une `ecriture_comptable` avec `ecriture_lignes` (débit salaires, crédit banque)

### 5. Actif acquis génère :
- ✅ Une `ecriture_comptable` (immobilisation : débit immobilisation, crédit banque)

---

## 📊 Calculs automatiques (à faire côté application)

### Stock actuel
```sql
SELECT 
    produit_id,
    SUM(CASE WHEN type = 'entree' THEN quantite ELSE -quantite END) as stock_actuel
FROM mouvements_stock
GROUP BY produit_id;
```

### Solde client
```sql
SELECT 
    client_id,
    SUM(montant_restant) as solde_actuel
FROM factures_ventes
WHERE statut = 'validee'
GROUP BY client_id;
```

### Solde fournisseur
```sql
SELECT 
    fournisseur_id,
    SUM(montant_restant) as solde_actuel
FROM factures_achats
WHERE statut = 'validee'
GROUP BY fournisseur_id;
```

### Solde trésorerie
```sql
SELECT 
    compte_tresorerie_id,
    solde_initial + 
    SUM(CASE WHEN type = 'entree' THEN montant ELSE -montant END) as solde_actuel
FROM comptes_tresorerie c
LEFT JOIN mouvements_tresorerie m ON c.id = m.compte_tresorerie_id
GROUP BY compte_tresorerie_id, solde_initial;
```

### Total débit/crédit d'une écriture
```sql
SELECT 
    ecriture_id,
    SUM(CASE WHEN type = 'debit' THEN montant ELSE 0 END) as total_debit,
    SUM(CASE WHEN type = 'credit' THEN montant ELSE 0 END) as total_credit
FROM ecriture_lignes
GROUP BY ecriture_id;
```

---

## ⚠️ Contraintes métier (à vérifier côté application)

1. **Écriture comptable équilibrée** : `total_debit` doit toujours égaler `total_credit`
2. **Montants cohérents** : Les montants dans les lignes de facture doivent être cohérents
3. **Mouvements stock** : Ne créer des `mouvements_stock` que pour des produits `stockable=true`
4. **Références** : Les `reference_type` et `reference_id` doivent pointer vers des entités valides

---

## 🔐 Compatibilité Supabase

- ✅ Toutes les tables ont `company_id` pour le multi-tenant (RLS)
- ✅ `created_by` peut utiliser `auth.uid()` pour l'utilisateur connecté
- ✅ Les UUID sont compatibles avec Supabase Auth
- ✅ Les timestamps sont en `TIMESTAMP WITH TIME ZONE`
- ✅ Les triggers `updated_at` sont automatiques

---

## 🚀 Évolutivité

- ✅ Prêt pour multi-société (company_id déjà présent)
- ✅ Références génériques (reference_type, reference_id) pour extension facile
- ✅ Enums extensibles si nécessaire
- ✅ Structure modulaire par métier

---

## 📝 Notes d'implémentation

1. **Plan comptable** : Non inclus dans le MVP, à ajouter si nécessaire
2. **Dépôts/Entrepôts** : Simple champ texte dans `mouvements_stock` pour le MVP
3. **Multi-devises** : Non inclus dans le MVP (tous les montants en TND)
4. **Historique** : Les suppressions sont logiques (actif=false) plutôt que physiques

---

## 🎯 Prochaines étapes possibles

1. Ajouter le plan comptable (table `plan_comptable`)
2. Ajouter les dépôts/entrepôts (table `depots`)
3. Ajouter la gestion multi-devises
4. Ajouter l'historique des modifications (audit trail)
5. Ajouter les templates de documents
6. Ajouter les notifications/alertes
