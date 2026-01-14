# Flux Métier ERP - Diagrammes et Exemples

## Vue d'ensemble des flux par plan

---

# PLAN 1 — CŒUR MÉTIER

## Flux 1 : Vente simple (sans stock, sans comptabilité)

```
┌─────────┐
│  Client │
└────┬────┘
     │
     ▼
┌──────────────┐
│ Créer Devis  │
│ (brouillon)  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Valider Devis│
│ → Facture    │
│ (brouillon)  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Valider      │
│ Facture      │
│ (validée)    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Encaisser    │
│ (partiel ou  │
│  total)      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Si payé =    │
│ montant TTC  │
│ → payee      │
└──────────────┘
```

**Règles** :
- ✅ Aucun stock vérifié
- ✅ Aucune écriture comptable
- ✅ Paiement optionnel
- ✅ Paiement partiel possible

---

## Flux 2 : Avoir client

```
┌──────────────┐
│ Facture      │
│ validée      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Créer Avoir  │
│ (facture     │
│  négative)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Valider Avoir│
│ → Réduit     │
│   solde      │
│   client     │
└──────────────┘
```

**Règles** :
- ✅ Un avoir réduit le solde client
- ✅ Peut être utilisé pour régler une facture

---

# PLAN 2 — BUSINESS

## Flux 3 : Vente avec produit stockable

```
┌─────────┐
│ Produit │
│ (stockable│
│ = true)  │
└────┬────┘
     │
     ▼
┌──────────────┐
│ Créer Facture │
│ avec produit  │
│ stockable     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Valider      │
│ Facture      │
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Mouvement    │  │ Facture      │
│ Stock        │  │ validée       │
│ (sortie)     │  │               │
└──────────────┘  └──────┬───────┘
                         │
                         ▼
                    ┌──────────────┐
                    │ Stock actuel  │
                    │ diminue      │
                    └──────────────┘
```

**Règles** :
- ✅ Si `produit.stockable = true` → Génère mouvement stock
- ✅ Si `produit.stockable = false` → Aucun mouvement stock
- ✅ Le stock peut être négatif (pas de blocage)

---

## Flux 4 : Vente avec produit non stockable

```
┌─────────┐
│ Produit │
│ (stockable│
│ = false) │
└────┬────┘
     │
     ▼
┌──────────────┐
│ Créer Facture │
│ avec produit  │
│ non stockable │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Valider      │
│ Facture      │
│ (validée)    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Aucun        │
│ mouvement    │
│ stock        │
└──────────────┘
```

**Règles** :
- ✅ Aucun mouvement de stock
- ✅ Facture validée normalement

---

## Flux 5 : Achat avec produit stockable

```
┌──────────────┐
│ Fournisseur  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Créer Facture│
│ Fournisseur  │
│ avec produit │
│ stockable    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Valider      │
│ Facture      │
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Mouvement    │  │ Facture      │
│ Stock        │  │ validée       │
│ (entrée)     │  │               │
└──────────────┘  └──────┬───────┘
                         │
                         ▼
                    ┌──────────────┐
                    │ Stock actuel │
                    │ augmente     │
                    └──────────────┘
```

**Règles** :
- ✅ Si `produit.stockable = true` → Génère mouvement stock
- ✅ Si `produit.stockable = false` → Aucun mouvement stock

---

## Flux 6 : Paiement fournisseur

```
┌──────────────┐
│ Facture      │
│ Fournisseur  │
│ (validée)    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Payer        │
│ (décaissement│
│  partiel ou  │
│  total)      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Mouvement    │
│ Trésorerie   │
│ (sortie)     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Si payé =    │
│ montant TTC  │
│ → payee      │
└──────────────┘
```

**Règles** :
- ✅ Génère un mouvement de trésorerie (sortie)
- ✅ Paiement partiel possible

---

# PLAN 3 — ERP COMPLET

## Flux 7 : Vente complète (avec comptabilité)

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     ▼
┌──────────────┐
│ Créer        │
│ Facture      │
│ (brouillon)  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Valider      │
│ Facture      │
│ (validée)    │
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Mouvement    │  │ Écriture     │
│ Stock        │  │ Comptable    │
│ (si stockable│  │ (auto)       │
│  = true)     │  │              │
└──────────────┘  └──────┬───────┘
                         │
                         ▼
                    ┌──────────────┐
                    │ Débit: Client│
                    │ Crédit: Ventes│
                    └──────────────┘
                         │
                         ▼
                    ┌──────────────┐
                    │ Encaisser    │
                    └──────┬───────┘
                           │
                           ├─────────────────┐
                           │                 │
                           ▼                 ▼
                    ┌──────────────┐  ┌──────────────┐
                    │ Mouvement    │  │ Écriture     │
                    │ Trésorerie   │  │ Comptable    │
                    │ (entrée)     │  │ (auto)       │
                    └──────────────┘  └──────┬───────┘
                                              │
                                              ▼
                                         ┌──────────────┐
                                         │ Débit: Banque │
                                         │ Crédit: Client│
                                         └──────────────┘
```

**Règles** :
- ✅ Génère écriture comptable automatiquement
- ✅ Génère mouvement trésorerie
- ✅ Génère mouvement stock (si applicable)

---

## Flux 8 : Salaire complet

```
┌─────────┐
│ Employé │
└────┬────┘
     │
     ▼
┌──────────────┐
│ Créer Fiche  │
│ de Paie      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Calculer     │
│ - Brut       │
│ - Cotisations│
│ - Net        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Valider      │
│ Fiche        │
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Mouvement    │  │ Écriture     │
│ Trésorerie   │  │ Comptable    │
│ (sortie)     │  │ (auto)       │
└──────────────┘  └──────┬───────┘
                         │
                         ▼
                    ┌──────────────┐
                    │ Débit: Salaires│
                    │ Crédit: Banque│
                    └──────────────┘
                         │
                         ▼
                    ┌──────────────┐
                    │ Marquer      │
                    │ comme payé   │
                    └──────────────┘
```

**Règles** :
- ✅ Génère mouvement trésorerie (sortie)
- ✅ Génère écriture comptable (charges de personnel)

---

## Flux 9 : Acquisition d'actif

```
┌──────────────┐
│ Acquérir     │
│ Actif        │
│ (véhicule,   │
│  matériel)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Créer Fiche  │
│ Actif        │
│ - Valeur     │
│ - Durée      │
│   amortissement│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Écriture     │
│ Comptable    │
│ (auto)       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Débit:       │
│ Immobilisation│
│ Crédit:      │
│ Banque       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Calculer     │
│ Amortissements│
│ (mensuel)    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Écritures    │
│ Amortissement│
│ (auto)       │
└──────────────┘
```

**Règles** :
- ✅ Génère écriture comptable (immobilisation)
- ✅ Amortissements calculés automatiquement
- ✅ Pas de mouvement de stock (c'est une immobilisation)

---

# MATRICE DES INTERACTIONS

## Quels modules génèrent quoi ?

| Événement | Génère Mouvement Stock | Génère Mouvement Trésorerie | Génère Écriture Comptable |
|-----------|----------------------|----------------------------|---------------------------|
| **Facture vente validée** | ✅ (si stockable) | ❌ | ✅ (Plan 3) |
| **Facture achat validée** | ✅ (si stockable) | ❌ | ✅ (Plan 3) |
| **Encaissement client** | ❌ | ✅ (entrée) | ✅ (Plan 3) |
| **Décaissement fournisseur** | ❌ | ✅ (sortie) | ✅ (Plan 3) |
| **Salaire payé** | ❌ | ✅ (sortie) | ✅ (Plan 3) |
| **Actif acquis** | ❌ | ❌ | ✅ (Plan 3) |
| **Amortissement** | ❌ | ❌ | ✅ (Plan 3) |

---

# RÈGLES DE PRIORITÉ

## Ordre d'exécution des actions

### Lors de la validation d'une facture de vente

1. **Vérifier les règles métier** (montants, client, etc.)
2. **Générer mouvement stock** (si produit.stockable = true)
3. **Mettre à jour statut facture** (validée)
4. **Générer écriture comptable** (si Plan 3)
5. **Mettre à jour solde client**

### Lors d'un encaissement

1. **Vérifier que la facture est validée**
2. **Créer mouvement trésorerie** (entrée)
3. **Mettre à jour montant_paye** sur la facture
4. **Générer écriture comptable** (si Plan 3)
5. **Si montant_paye = montant_ttc → Statut: payee**

---

# CAS LIMITES ET EXCEPTIONS

## Cas 1 : Facturer un produit avec stock = 0

**Comportement** :
- ✅ La facture est créée et validée
- ✅ Si produit.stockable = true → Mouvement stock (sortie) → Stock devient négatif
- ⚠️ Alerte affichée (stock négatif) mais pas de blocage

**Règle** : Le stock est passif, il n'empêche jamais une vente.

---

## Cas 2 : Payer une facture partiellement

**Comportement** :
- ✅ Créer un encaissement (montant partiel)
- ✅ Mettre à jour montant_paye sur la facture
- ✅ Statut reste "validée" (pas "payee")
- ✅ Plusieurs encaissements possibles pour une facture

**Règle** : Le paiement partiel est toujours autorisé.

---

## Cas 3 : Produit stockable mais stock désactivé

**Comportement** :
- ✅ Si `produit.stockable = false` → Aucun mouvement stock
- ✅ La facture est validée normalement
- ✅ Le module Stocks reste accessible mais vide pour ce produit

**Règle** : Le stock est optionnel même pour un produit qui pourrait être stockable.

---

## Cas 4 : Facture validée puis annulée

**Comportement** :
- ✅ Créer un avoir (facture négative)
- ✅ Réduire le solde client
- ✅ Si produit.stockable = true → Générer mouvement stock (entrée) pour annuler la sortie
- ✅ Si Plan 3 → Générer écriture comptable inverse

**Règle** : On n'annule jamais une facture, on crée un avoir.

---

# EXEMPLES CONCRETS

## Exemple 1 : Petite entreprise de services (Plan 1)

**Scénario** : Consultant qui facture des prestations

1. Créer client "Entreprise ABC"
2. Créer facture "FV-2024-001" pour 1000 DT (prestation)
3. Valider la facture
4. Encaisser 1000 DT (chèque)
5. Facture → Statut: payee

**Modules utilisés** : CRM, Ventes, Trésorerie

---

## Exemple 2 : Commerce avec stock (Plan 2)

**Scénario** : Boutique qui vend des produits

1. Créer produit "Ordinateur" (stockable = true, stock = 5)
2. Créer facture "FV-2024-001" pour 2000 DT (2 ordinateurs)
3. Valider la facture
   - Génère mouvement stock (sortie: -2)
   - Stock actuel → 3
4. Encaisser 2000 DT
5. Facture → Statut: payee

**Modules utilisés** : CRM, Ventes, Produits, Stocks, Trésorerie

---

## Exemple 3 : Entreprise structurée (Plan 3)

**Scénario** : Entreprise avec salariés et comptabilité

1. Créer fiche de paie pour employé "Ahmed" (2000 DT brut)
2. Calculer salaire net (1500 DT après cotisations)
3. Valider fiche de paie
   - Génère mouvement trésorerie (sortie: 1500 DT)
   - Génère écriture comptable (Débit: Salaires 2000, Crédit: Banque 1500, Crédit: Cotisations 500)
4. Payer le salaire
5. Fiche de paie → Statut: payee

**Modules utilisés** : RH, Trésorerie, Comptabilité

---

# CONCLUSION

## Principes de flux respectés

1. ✅ **Flux linéaires** : Chaque action a un ordre logique
2. ✅ **Pas de blocage** : Les modules passifs n'empêchent jamais une opération
3. ✅ **Automatisation progressive** : Plus on monte de plan, plus c'est automatique
4. ✅ **Traçabilité** : Chaque action génère des traces (mouvements, écritures)

---

**Document créé le** : 2024-01-15  
**Version** : 1.0
