# Architecture Dashboard ERP KTOptima - Par Plan

## 🎯 Principe Fondamental

> **"Si un widget n'aide pas à décider, il n'a rien à faire sur le dashboard."**

KTOptima est "l'ERP qui va à l'essentiel". Le dashboard doit permettre à un dirigeant de comprendre sa situation en **moins de 5 secondes**.

---

## 📊 Structure Modulaire

### Plan Core (Base - Obligatoire)
**Question métier :** "Est-ce que je vends et est-ce que j'encaisse ?"

#### Widgets Core :
1. **KPIs Principaux** (4 cards)
   - Chiffre d'affaires du mois/trimestre/année
   - Montant encaissé
   - Factures impayées
   - Solde de trésorerie actuel

2. **Graphique Principal**
   - Courbe Facturé vs Encaissé (mensuel)
   - Permet de voir l'écart entre facturation et encaissement

3. **Bloc Ventes**
   - Dernières factures (5 dernières)
   - Statut (brouillon / validée / payée)

4. **Bloc CRM**
   - Nouveaux clients (30 derniers jours)
   - Clients actifs
   - Top clients (par montant)

**Contraintes UX :**
- ❌ Pas de stock
- ❌ Pas de TVA visible
- ❌ Pas de jargon comptable
- ✅ Données lisibles immédiatement

---

### Plan Business (Core + Achats + Produits + Stocks)
**Question métier :** "Mon activité est-elle structurée et rentable ?"

#### Widgets ajoutés :

5. **Achats**
   - Achats du mois
   - Factures fournisseurs à payer

6. **Produits / Services**
   - Top produits / services vendus
   - Marge simple (vente – achat)

7. **Stock** (uniquement si activé)
   - Valeur du stock
   - Alertes stock bas
   - Derniers mouvements

**Contraintes UX :**
- Le stock ne s'affiche QUE si activé
- Les services n'affichent jamais de stock
- Les marges sont indicatives, non comptables

---

### Plan Enterprise (Core + Business + Comptabilité + RH + Parc)
**Question métier :** "Mon entreprise est-elle saine financièrement et bien pilotée ?"

#### Widgets ajoutés :

8. **Comptabilité**
   - Résultat estimé
   - TVA collectée / déductible
   - Charges principales

9. **RH**
   - Effectif
   - Masse salariale
   - Salaires à payer

10. **Gestion de parc**
    - Valeur des actifs
    - Échéances (leasing, entretien)

11. **Trésorerie avancée**
    - Prévision de trésorerie
    - Échéances à venir

**Contraintes UX :**
- La comptabilité reste lisible (non technique)
- Les chiffres avancés restent secondaires au cash
- Aucun écran surchargé

---

## 🎨 Composants Transverses

### Sélecteur de période
- **Mois** : Vue mensuelle (6 derniers mois)
- **Trimestre** : Vue trimestrielle (6 derniers trimestres)
- **Année** : Vue annuelle (12 derniers mois)

### États vides
- Messages clairs et pédagogiques
- Pas de jargon technique
- Suggestions d'actions

### Tooltips pédagogiques
- Explications simples des indicateurs
- Aide contextuelle

### Responsive
- Desktop : Layout en grille optimisé
- Mobile : Stack vertical avec priorité aux KPIs

---

## 📁 Structure des Fichiers

```
src/
├── hooks/
│   └── use-plan.ts                    # Hook pour déterminer le plan
├── components/
│   └── dashboard/
│       ├── PeriodSelector.tsx         # Sélecteur de période
│       ├── StatCard.tsx               # Carte de statistique (existant)
│       ├── CoreKPIs.tsx               # KPIs Core (4 cards)
│       ├── FactureEncaissementChart.tsx # Graphique Facturé vs Encaissé
│       ├── CoreVentesWidget.tsx       # Widget ventes Core
│       ├── CoreCRMWidget.tsx          # Widget CRM Core
│       ├── BusinessWidgets.tsx         # Widgets Business
│       └── EnterpriseWidgets.tsx      # Widgets Enterprise
└── pages/
    └── Dashboard.tsx                  # Dashboard principal (modulaire)
```

---

## 🔄 Logique d'Affichage

### Détermination du plan
```typescript
const { plan, features } = usePlan();
// plan: "core" | "business" | "enterprise"
// features: { crm, ventes, achats, stocks, ... }
```

### Affichage conditionnel
```typescript
{isCore && <CoreWidgets />}
{isBusiness && <BusinessWidgets />}
{isEnterprise && <EnterpriseWidgets />}
```

### Stock conditionnel
```typescript
{features.stocks && <StockWidget />}
```

---

## ✅ Règles d'Affichage

### Ordre d'affichage recommandé :
1. **KPIs principaux** (toujours en haut)
2. **Graphique principal** (Facturé vs Encaissé)
3. **Blocs Core** (Ventes + CRM côte à côte)
4. **Widgets Business** (si plan Business+)
5. **Widgets Enterprise** (si plan Enterprise)

### Règles conditionnelles :
- ✅ Le stock ne s'affiche QUE si `features.stocks === true`
- ✅ Les services n'affichent jamais de stock
- ✅ La comptabilité n'apparaît qu'en Enterprise
- ✅ Les marges sont indicatives (non comptables)

---

## 🎯 Bonnes Pratiques UX ERP

### ✅ DO (À faire)
- **Prioriser le CASH** : Le solde de trésorerie est toujours visible
- **Simplicité** : Un indicateur = une décision
- **Lisibilité immédiate** : Compréhension en < 5 secondes
- **États vides clairs** : Messages pédagogiques
- **Responsive** : Mobile-first

### ❌ DON'T (À éviter)
- **Jargon comptable** : Pas de "Bilan", "Compte de résultat"
- **Surcharge visuelle** : Maximum 4 KPIs en haut
- **Données techniques** : Pas de détails comptables inutiles
- **Widgets inutiles** : Si ça n'aide pas à décider, on ne l'affiche pas
- **Complexité** : Pas de graphiques 3D ou animations excessives

---

## 🔮 Évolutions Futures

### Phase 1 (Actuel)
- ✅ Structure modulaire par plan
- ✅ Widgets Core fonctionnels
- ✅ Widgets Business/Enterprise (mock data)

### Phase 2 (À venir)
- [ ] Intégration données réelles (Supabase)
- [ ] Hooks pour Business (achats, produits)
- [ ] Hooks pour Enterprise (comptabilité, RH, parc)
- [ ] Prévisions de trésorerie avancées

### Phase 3 (Futur)
- [ ] Personnalisation des widgets
- [ ] Alertes intelligentes
- [ ] Comparaisons périodiques
- [ ] Export PDF/Excel

---

## 📝 Notes Techniques

### Hook use-plan.ts
Détermine le plan de l'entreprise. Pour l'instant, utilise une valeur par défaut.
**TODO :** Ajouter un champ `plan` dans la table `companies`.

### Format des données
- **Monnaie** : Utilise `formatCurrency()` avec la devise de l'entreprise
- **Dates** : Format français (DD MMM YYYY)
- **Pourcentages** : Arrondis à l'entier

### Performance
- Les widgets chargent leurs données indépendamment
- Utilisation de `useMemo` pour les calculs
- États de chargement (skeleton) pour chaque widget

---

## 🎨 Design Tokens

### Couleurs par type
- **Primary** : Vert logo (#669f41) - CA, trésorerie
- **Success** : Vert - Encaissements, résultats positifs
- **Warning** : Orange - Alertes, factures impayées
- **Sand** : Beige - Informations neutres
- **Secondary** : Bleu foncé logo - Comptabilité

### Espacements
- Gap entre widgets : `gap-6` (24px)
- Padding cards : `p-6` (24px)
- Margin sections : `mb-8` (32px)

---

**Dernière mise à jour :** 2025-01-14
