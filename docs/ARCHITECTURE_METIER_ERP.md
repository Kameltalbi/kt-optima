# Architecture Métier ERP Modulaire - 3 Plans

## Vue d'ensemble

ERP SaaS modulaire avec 3 plans progressifs :
- **Plan 1 - Cœur Métier** : Obligatoire, fonctionne seul
- **Plan 2 - Business** : Ajoute Achats, Produits, Stocks (optionnel)
- **Plan 3 - ERP Complet** : Ajoute Comptabilité, RH, Gestion de parc

**Principe fondamental** : Le cœur métier (Plan 1) doit toujours fonctionner, même si les autres modules sont désactivés.

---

# PLAN 1 — CŒUR MÉTIER (OBLIGATOIRE)

## Définition métier

Le cœur minimal universel de l'ERP. **Doit fonctionner SEUL, sans aucun autre module.**

### Modules inclus

#### 1. CRM
**Rôle** : Gérer les clients et prospects

**Fonctionnalités** :
- ✅ Liste des clients et prospects
- ✅ Fiche client complète (coordonnées, historique)
- ✅ Historique des ventes par client
- ✅ Recherche et filtres clients
- ✅ Statut client (prospect → client)

**Données** :
- Clients/Prospects (nom, coordonnées, notes)
- Historique des factures liées
- Solde client (calculé : factures - paiements)

**Règles métier** :
- Un prospect devient client dès la première facture validée
- Le solde client = somme des factures non payées
- Un client peut avoir un solde négatif (avoir)

---

#### 2. Ventes
**Rôle** : Gérer les ventes (devis, factures, avoirs)

**Fonctionnalités** :
- ✅ Créer un devis
- ✅ Transformer un devis en facture
- ✅ Créer une facture directement
- ✅ Créer un avoir client
- ✅ Éditer/Annuler une facture (si non payée)
- ✅ Imprimer facture/devis
- ✅ Historique des factures

**Statuts des factures** :
- `brouillon` : Facture en cours de création
- `validee` : Facture validée, en attente de paiement
- `payee` : Facture entièrement payée
- `annulee` : Facture annulée (ne compte pas dans les soldes)

**Données** :
- Factures (numéro, date, client, montant HT/TTC, statut)
- Lignes de facture (description, quantité, prix unitaire, TVA)
- Avoirs clients (factures négatives)

**Règles métier fondamentales** :
- ✅ Une facture peut exister sans paiement
- ✅ Un paiement peut être partiel (plusieurs paiements pour une facture)
- ✅ Le montant restant = montant TTC - montant payé
- ✅ Une facture validée ne peut plus être modifiée (créer un avoir si erreur)
- ✅ Un avoir réduit le solde client
- ✅ Aucune notion de stock (on vend ce qu'on veut)
- ✅ Aucune écriture comptable obligatoire

**Flux métier principal** :
```
1. Créer un devis (brouillon)
   ↓
2. Valider le devis → Transforme en facture (statut: brouillon)
   ↓
3. Valider la facture → Statut: validée
   ↓
4. Encaisser (paiement partiel ou total)
   ↓
5. Si montant payé = montant TTC → Statut: payee
```

**Contraintes à ne jamais casser** :
- ❌ Ne jamais rendre le paiement obligatoire pour valider une facture
- ❌ Ne jamais bloquer la création de facture si stock = 0
- ❌ Ne jamais forcer une écriture comptable
- ❌ Ne jamais casser le flux facture → encaissement

---

#### 3. Trésorerie
**Rôle** : Suivre les encaissements et la trésorerie

**Fonctionnalités** :
- ✅ Encaisser une facture (paiement total ou partiel)
- ✅ Voir les factures payées / impayées
- ✅ Voir les soldes clients
- ✅ Historique des encaissements
- ✅ Suivi simple de trésorerie (encaissements du jour/mois)

**Données** :
- Encaissements (date, montant, facture liée, moyen de paiement)
- Soldes clients (calculé)
- Factures payées / impayées (filtre)

**Règles métier** :
- ✅ Un encaissement est toujours lié à une facture
- ✅ Un encaissement peut être partiel (plusieurs encaissements pour une facture)
- ✅ Le cash réel prime sur les calculs (si encaissé, c'est encaissé)
- ✅ Pas de notion de compte bancaire (simple suivi)
- ✅ Pas de décaissements (réservé au Plan 2+)

**Flux métier** :
```
1. Facture validée (statut: validée)
   ↓
2. Encaisser (montant partiel ou total)
   ↓
3. Mise à jour montant_paye sur la facture
   ↓
4. Si montant_paye = montant_ttc → Statut: payee
```

---

## Invariants du cœur métier

**Ces règles doivent TOUJOURS être respectées, même avec les autres plans activés** :

1. ✅ **Le cœur fonctionne seul** : CRM + Ventes + Trésorerie sans dépendance externe
2. ✅ **Facture sans stock** : On peut facturer n'importe quoi, même si stock = 0
3. ✅ **Paiement optionnel** : Une facture peut exister sans paiement
4. ✅ **Paiement partiel** : Plusieurs paiements possibles pour une facture
5. ✅ **Cash réel** : Si encaissé, c'est encaissé (pas de notion de compte bancaire complexe)
6. ✅ **Pas de comptabilité obligatoire** : Le cœur ne génère pas d'écritures comptables
7. ✅ **Pas de stock obligatoire** : Le cœur ne vérifie jamais le stock

---

## Fonctionnalités visibles Plan 1

### Interface utilisateur

**Menu principal** :
- 📋 CRM
  - Clients
  - Prospects
  - Fiche client
- 💰 Ventes
  - Devis
  - Factures
  - Avoirs clients
- 💳 Trésorerie
  - Encaissements
  - Factures payées / impayées
  - Soldes clients

**Tableau de bord** :
- Nombre de clients
- Factures du mois
- Montant encaissé du mois
- Factures impayées (montant total)

---

# PLAN 2 — BUSINESS

## Définition métier

Plan destiné aux entreprises structurées qui gèrent fournisseurs, achats et produits.

### Modules ajoutés AU CŒUR (sans le casser)

#### 4. Achats
**Rôle** : Gérer les achats et fournisseurs

**Fonctionnalités** :
- ✅ Liste des fournisseurs
- ✅ Fiche fournisseur
- ✅ Créer une facture fournisseur
- ✅ Créer un avoir fournisseur
- ✅ Historique des achats
- ✅ Suivi des factures à payer

**Données** :
- Fournisseurs (nom, coordonnées, notes)
- Factures fournisseurs (numéro, date, montant, statut)
- Lignes de facture fournisseur
- Avoirs fournisseurs

**Règles métier** :
- ✅ Une facture fournisseur peut exister sans paiement
- ✅ Un paiement peut être partiel
- ✅ Le solde fournisseur = somme des factures non payées
- ✅ Aucune écriture comptable obligatoire
- ✅ Le stock n'est impacté QUE si produit.stockable = true

**Flux métier** :
```
1. Créer une facture fournisseur
   ↓
2. Valider la facture
   ↓
3. Si produit.stockable = true → Génère mouvement_stock (entrée)
   ↓
4. Payer la facture (décaissement)
   ↓
5. Si montant_paye = montant_ttc → Statut: payee
```

---

#### 5. Produits / Services
**Rôle** : Gérer les produits et services

**Fonctionnalités** :
- ✅ Liste des produits et services
- ✅ Créer un produit (stockable ou non)
- ✅ Créer un service
- ✅ Prix d'achat / prix de vente
- ✅ Catégories de produits
- ✅ Recherche produits

**Données** :
- Produits (nom, prix achat, prix vente, stockable, stock actuel)
- Services (nom, prix vente)
- Catégories

**Règles métier** :
- ✅ Un produit peut être stockable ou non
- ✅ Un service n'est jamais stockable
- ✅ Le stock n'est calculé QUE si produit.stockable = true
- ✅ Un produit peut être vendu même si stock = 0 (pas de blocage)
- ✅ Le prix d'achat est optionnel (pour services)

**Activation conditionnelle** :
- Si `produit.stockable = false` → Aucun mouvement de stock
- Si `produit.stockable = true` → Mouvements de stock activés

---

#### 6. Stocks (OPTIONNEL PAR PRODUIT)
**Rôle** : Suivre les stocks des produits stockables

**Fonctionnalités** :
- ✅ Voir le stock actuel par produit
- ✅ Mouvements de stock (automatiques)
- ✅ Ajustements de stock (manuel)
- ✅ Alertes stock minimum
- ✅ Historique des mouvements

**Données** :
- Mouvements de stock (entrée/sortie, quantité, date, référence)
- Stock actuel (calculé)

**Règles métier spécifiques** :
- ✅ **Le stock est un module passif** : Il ne bloque jamais une vente
- ✅ **Activation conditionnelle** : Le stock n'est déclenché QUE si `produit.stockable = true`
- ✅ **Une société peut utiliser le Plan Business SANS stock** : Si tous les produits ont `stockable = false`
- ✅ **Les achats de services n'impactent jamais le stock**
- ✅ **Le stock est calculé automatiquement** : `stock_actuel = SUM(entrées) - SUM(sorties)`

**Flux vente avec stock** :
```
1. Créer une facture de vente avec produit stockable
   ↓
2. Valider la facture
   ↓
3. Génère automatiquement mouvement_stock (sortie)
   ↓
4. Stock actuel diminue
   ↓
5. Si stock < stock_minimum → Alerte (mais pas de blocage)
```

**Flux vente sans stock** :
```
1. Créer une facture de vente avec produit non stockable OU service
   ↓
2. Valider la facture
   ↓
3. Aucun mouvement de stock
   ↓
4. Facture validée normalement
```

**Flux achat avec stock** :
```
1. Créer une facture fournisseur avec produit stockable
   ↓
2. Valider la facture
   ↓
3. Génère automatiquement mouvement_stock (entrée)
   ↓
4. Stock actuel augmente
```

**Flux achat sans stock** :
```
1. Créer une facture fournisseur avec produit non stockable OU service
   ↓
2. Valider la facture
   ↓
3. Aucun mouvement de stock
   ↓
4. Facture validée normalement
```

---

## Règles d'activation conditionnelle Plan 2

### Module Stocks

**Activation** :
- ✅ Le module Stocks est **toujours disponible** dans l'interface
- ✅ Mais il ne génère des mouvements **QUE si** `produit.stockable = true`

**Désactivation** :
- Si tous les produits ont `stockable = false` → Le module Stocks est vide mais accessible
- L'utilisateur peut toujours voir le module, mais il n'y aura pas de mouvements

**Règle métier clé** :
> Le stock est un **module passif** : Il enregistre les mouvements mais ne bloque jamais une opération.

---

## Extensions métier par rapport au Plan 1

### Ventes (étendu)
- ✅ Possibilité de sélectionner un produit dans les lignes de facture
- ✅ Si produit.stockable = true → Génère mouvement_stock (sortie)
- ✅ Si produit.stockable = false → Aucun mouvement de stock
- ✅ Le cœur reste inchangé : on peut toujours facturer sans produit

### Trésorerie (étendu)
- ✅ Ajout des décaissements (paiements fournisseurs)
- ✅ Suivi des factures fournisseurs à payer
- ✅ Soldes fournisseurs

---

## Fonctionnalités visibles Plan 2

### Interface utilisateur

**Menu principal** (ajout au Plan 1) :
- 🛒 Achats
  - Fournisseurs
  - Factures fournisseurs
  - Avoirs fournisseurs
- 📦 Produits
  - Produits
  - Services
  - Catégories
- 📊 Stocks
  - Stock actuel
  - Mouvements de stock
  - Ajustements
  - Alertes

**Tableau de bord** (ajout) :
- Produits en stock faible
- Factures fournisseurs à payer
- Montant décaissé du mois

---

# PLAN 3 — ERP COMPLET

## Définition métier

Plan destiné aux entreprises organisées ou en croissance, avec besoin de structuration financière et interne.

### Modules ajoutés

#### 7. Comptabilité
**Rôle** : Gérer la comptabilité avec écritures automatiques

**Fonctionnalités** :
- ✅ Écritures comptables automatiques (générées par les événements)
- ✅ Journaux comptables (Ventes, Achats, Banque, OD)
- ✅ Plan comptable (lecture)
- ✅ TVA (calcul et déclaration)
- ✅ Balance comptable
- ✅ Grand livre
- ✅ Saisie manuelle d'écritures (optionnel)

**Données** :
- Écritures comptables (numéro, date, journal, libellé)
- Lignes d'écriture (compte, débit, crédit)
- Plan comptable (lecture seule au début)

**Règles métier avancées** :
- ✅ **La comptabilité consomme les événements** : Elle ne modifie jamais les modules sources
- ✅ **Écritures automatiques** : Générées par factures, paiements, salaires
- ✅ **Lecture seule au début** : Pas de saisie manuelle obligatoire
- ✅ **Équilibre obligatoire** : Débit = Crédit (vérifié automatiquement)
- ✅ **Pas de modification rétroactive** : Une écriture validée ne peut plus être modifiée

**Flux métier** :
```
1. Événement métier (facture validée, paiement, salaire payé)
   ↓
2. Génère automatiquement une écriture_comptable
   ↓
3. Écriture équilibrée (débit = crédit)
   ↓
4. Écriture validée automatiquement
   ↓
5. Visible dans les journaux et balances
```

**Événements qui génèrent des écritures** :
- ✅ Facture de vente validée → Écriture (Débit: Client, Crédit: Ventes)
- ✅ Facture d'achat validée → Écriture (Débit: Achats, Crédit: Fournisseur)
- ✅ Encaissement client → Écriture (Débit: Banque, Crédit: Client)
- ✅ Décaissement fournisseur → Écriture (Débit: Fournisseur, Crédit: Banque)
- ✅ Salaire payé → Écriture (Débit: Salaires, Crédit: Banque)
- ✅ Actif acquis → Écriture (Débit: Immobilisation, Crédit: Banque)

**Règle métier clé** :
> La comptabilité est un **module consommateur** : Elle lit les événements mais ne les modifie jamais.

---

#### 8. RH
**Rôle** : Gérer les ressources humaines

**Fonctionnalités** :
- ✅ Liste des employés
- ✅ Fiche employé
- ✅ Fiches de paie
- ✅ Avances sur salaire
- ✅ Notes de frais
- ✅ Historique des salaires

**Données** :
- Employés (nom, poste, salaire de base)
- Salaires (période, brut, net, cotisations)
- Avances (montant, date, remboursement)
- Notes de frais (montant, date, justificatif)

**Règles métier** :
- ✅ **RH génère des charges** : Salaires → Écriture comptable (charges de personnel)
- ✅ **RH génère des sorties de trésorerie** : Salaires → Mouvement trésorerie (sortie)
- ✅ **Pas de modification des autres modules** : RH ne modifie que ses propres données
- ✅ **Calcul automatique** : Cotisations, salaire net calculés automatiquement

**Flux métier** :
```
1. Créer une fiche de paie
   ↓
2. Calculer salaire brut, cotisations, net
   ↓
3. Valider la fiche de paie
   ↓
4. Génère mouvement_tresorerie (sortie)
   ↓
5. Génère ecriture_comptable (Débit: Salaires, Crédit: Banque)
   ↓
6. Marquer comme payé
```

---

#### 9. Gestion de parc
**Rôle** : Gérer les actifs de l'entreprise (véhicules, matériel, immobilier)

**Fonctionnalités** :
- ✅ Liste des actifs
- ✅ Fiche actif (véhicule, matériel, immobilier)
- ✅ Affectations aux employés
- ✅ Amortissements
- ✅ Historique des affectations

**Données** :
- Actifs (type, valeur acquisition, durée amortissement)
- Affectations (actif → employé, dates)
- Amortissements (calculés)

**Règles métier** :
- ✅ **Le parc génère des immobilisations** : Actif acquis → Écriture comptable (immobilisation)
- ✅ **Pas de stock** : Les actifs ne sont pas du stock, ce sont des immobilisations
- ✅ **Amortissements** : Calculés automatiquement selon durée
- ✅ **Affectations** : Un actif peut être affecté à un employé

**Flux métier** :
```
1. Acquérir un actif
   ↓
2. Créer fiche actif (valeur, durée amortissement)
   ↓
3. Génère ecriture_comptable (Débit: Immobilisation, Crédit: Banque)
   ↓
4. Affecter à un employé (optionnel)
   ↓
5. Calculer amortissements mensuels
   ↓
6. Génère écritures d'amortissement (Débit: Amortissement, Crédit: Immobilisation)
```

---

## Interactions entre modules Plan 3

### Flux complets

**Vente complète** :
```
1. Créer facture de vente (Plan 1)
   ↓
2. Si produit.stockable = true → Mouvement stock (Plan 2)
   ↓
3. Valider facture
   ↓
4. Génère écriture comptable (Plan 3)
   ↓
5. Encaisser
   ↓
6. Génère mouvement trésorerie (Plan 1)
   ↓
7. Génère écriture comptable encaissement (Plan 3)
```

**Achat complet** :
```
1. Créer facture fournisseur (Plan 2)
   ↓
2. Si produit.stockable = true → Mouvement stock (Plan 2)
   ↓
3. Valider facture
   ↓
4. Génère écriture comptable (Plan 3)
   ↓
5. Payer facture
   ↓
6. Génère mouvement trésorerie (Plan 2)
   ↓
7. Génère écriture comptable paiement (Plan 3)
```

**Salaire complet** :
```
1. Créer fiche de paie (Plan 3 - RH)
   ↓
2. Calculer salaire net
   ↓
3. Valider fiche de paie
   ↓
4. Génère mouvement trésorerie (sortie) (Plan 1)
   ↓
5. Génère écriture comptable (Plan 3)
   ↓
6. Marquer comme payé
```

---

## Ce qui est automatique vs manuel Plan 3

### Automatique
- ✅ Écritures comptables (générées par événements)
- ✅ Mouvements de stock (générés par factures)
- ✅ Mouvements de trésorerie (générés par paiements)
- ✅ Calculs de salaires (brut, net, cotisations)
- ✅ Amortissements (calculés mensuellement)

### Manuel (optionnel)
- ✅ Saisie manuelle d'écritures comptables
- ✅ Ajustements de stock
- ✅ Ajustements de trésorerie
- ✅ Notes de frais
- ✅ Affectations d'actifs

---

## Ce qui reste optionnel même en ERP Complet

- ✅ **Stock** : Même en Plan 3, le stock reste optionnel (si tous produits.stockable = false)
- ✅ **Saisie manuelle comptable** : Pas obligatoire, tout est automatique
- ✅ **Amortissements** : Calculés automatiquement, mais peuvent être désactivés par actif
- ✅ **Affectations d'actifs** : Optionnel, un actif peut exister sans affectation

---

## Fonctionnalités visibles Plan 3

### Interface utilisateur

**Menu principal** (ajout au Plan 2) :
- 📚 Comptabilité
  - Écritures comptables
  - Journaux
  - Plan comptable
  - Balance
  - Grand livre
  - TVA
- 👥 RH
  - Employés
  - Fiches de paie
  - Avances
  - Notes de frais
- 🚗 Parc
  - Actifs
  - Affectations
  - Amortissements

**Tableau de bord** (ajout) :
- Écritures du mois
- Salaires du mois
- Actifs en amortissement

---

# DÉPENDANCES ENTRE MODULES

## Matrice de dépendances

| Module | Dépend de | Utilisé par | Peut fonctionner seul ? |
|--------|-----------|-------------|------------------------|
| **CRM** | Aucun | Ventes, Trésorerie | ✅ Oui |
| **Ventes** | CRM | Trésorerie, Stocks, Comptabilité | ❌ Non (dépend CRM) |
| **Trésorerie** | Ventes | Comptabilité | ❌ Non (dépend Ventes) |
| **Achats** | Aucun | Stocks, Trésorerie, Comptabilité | ✅ Oui |
| **Produits** | Aucun | Ventes, Achats, Stocks | ✅ Oui |
| **Stocks** | Produits | Ventes, Achats | ❌ Non (dépend Produits) |
| **Comptabilité** | Tous | Aucun | ✅ Oui (lecture seule) |
| **RH** | Aucun | Trésorerie, Comptabilité | ✅ Oui |
| **Parc** | Aucun | Comptabilité | ✅ Oui |

## Règles de dépendance

### Dépendances fortes (bloquantes)
- ❌ Ventes → CRM (obligatoire)
- ❌ Trésorerie → Ventes (obligatoire)
- ❌ Stocks → Produits (obligatoire)

### Dépendances faibles (optionnelles)
- ⚠️ Ventes → Produits (optionnel, peut facturer sans produit)
- ⚠️ Ventes → Stocks (optionnel, si produit.stockable = false)
- ⚠️ Achats → Stocks (optionnel, si produit.stockable = false)
- ⚠️ Comptabilité → Tous (optionnel, génère des écritures mais ne bloque pas)

### Modules indépendants
- ✅ CRM (fonctionne seul)
- ✅ Achats (fonctionne seul)
- ✅ Produits (fonctionne seul)
- ✅ RH (fonctionne seul)
- ✅ Parc (fonctionne seul)

---

# INVARIANTS DU CŒUR MÉTIER

## Règles absolues (jamais cassables)

1. ✅ **Le cœur fonctionne seul** : CRM + Ventes + Trésorerie sans dépendance externe
2. ✅ **Facture sans stock** : On peut facturer n'importe quoi, même si stock = 0
3. ✅ **Paiement optionnel** : Une facture peut exister sans paiement
4. ✅ **Paiement partiel** : Plusieurs paiements possibles pour une facture
5. ✅ **Cash réel** : Si encaissé, c'est encaissé
6. ✅ **Pas de comptabilité obligatoire** : Le cœur ne génère pas d'écritures comptables
7. ✅ **Pas de stock obligatoire** : Le cœur ne vérifie jamais le stock
8. ✅ **Pas de modification rétroactive** : Une facture validée ne peut plus être modifiée
9. ✅ **Modules passifs** : Stocks et Comptabilité enregistrent mais ne bloquent jamais

---

# SYNTHÈSE COMPARATIVE

## Plan 1 vs Plan 2 vs Plan 3

| Fonctionnalité | Plan 1 | Plan 2 | Plan 3 |
|----------------|--------|--------|--------|
| **CRM** | ✅ | ✅ | ✅ |
| **Ventes** | ✅ | ✅ | ✅ |
| **Trésorerie (encaissements)** | ✅ | ✅ | ✅ |
| **Achats** | ❌ | ✅ | ✅ |
| **Produits/Services** | ❌ | ✅ | ✅ |
| **Stocks** | ❌ | ✅ (optionnel) | ✅ (optionnel) |
| **Trésorerie (décaissements)** | ❌ | ✅ | ✅ |
| **Comptabilité** | ❌ | ❌ | ✅ |
| **RH** | ❌ | ❌ | ✅ |
| **Gestion de parc** | ❌ | ❌ | ✅ |

## Règles métier par plan

| Règle | Plan 1 | Plan 2 | Plan 3 |
|-------|--------|--------|--------|
| Facture sans stock | ✅ | ✅ | ✅ |
| Paiement optionnel | ✅ | ✅ | ✅ |
| Paiement partiel | ✅ | ✅ | ✅ |
| Stock optionnel | N/A | ✅ | ✅ |
| Écritures comptables | ❌ | ❌ | ✅ (auto) |
| Décaissements | ❌ | ✅ | ✅ |
| Salaires | ❌ | ❌ | ✅ |
| Amortissements | ❌ | ❌ | ✅ |

## Complexité par plan

| Aspect | Plan 1 | Plan 2 | Plan 3 |
|--------|--------|--------|--------|
| **Complexité métier** | Faible | Moyenne | Élevée |
| **Nombre de modules** | 3 | 6 | 9 |
| **Dépendances** | Minimales | Moyennes | Nombreuses |
| **Automatisations** | Aucune | Stock | Stock + Comptabilité + RH |
| **Courbe d'apprentissage** | Faible | Moyenne | Élevée |

---

# RÈGLES D'ACTIVATION DES MODULES

## Activation par plan

### Plan 1 (Cœur)
- ✅ CRM : Toujours actif
- ✅ Ventes : Toujours actif
- ✅ Trésorerie (encaissements) : Toujours actif

### Plan 2 (Business)
- ✅ Tous les modules du Plan 1
- ✅ Achats : Actif
- ✅ Produits : Actif
- ✅ Stocks : Actif (mais optionnel par produit)

### Plan 3 (ERP Complet)
- ✅ Tous les modules du Plan 2
- ✅ Comptabilité : Actif
- ✅ RH : Actif
- ✅ Parc : Actif

## Activation conditionnelle

### Stocks
- **Condition** : `produit.stockable = true`
- **Comportement** : Si false, aucun mouvement de stock mais module accessible

### Comptabilité
- **Condition** : Plan 3 activé
- **Comportement** : Génère des écritures automatiquement, mais ne bloque jamais une opération

---

# CONCLUSION

## Principes architecturaux respectés

1. ✅ **Modularité** : Chaque module est indépendant
2. ✅ **Progressivité** : Plans qui s'ajoutent sans casser le précédent
3. ✅ **Lisibilité métier** : Chaque module a un rôle clair
4. ✅ **Activation conditionnelle** : Modules activables/désactivables
5. ✅ **Pas de dépendance bloquante** : Le cœur fonctionne toujours

## Points clés à retenir

- 🎯 **Le cœur est sacré** : Il doit toujours fonctionner, même si les autres modules sont désactivés
- 🎯 **Le stock est passif** : Il enregistre mais ne bloque jamais
- 🎯 **La comptabilité consomme** : Elle lit les événements mais ne les modifie jamais
- 🎯 **Tout est optionnel sauf le cœur** : Même en Plan 3, certains modules restent optionnels

---

**Document créé le** : 2024-01-15  
**Version** : 1.0  
**Auteur** : Architecture ERP Modulaire
