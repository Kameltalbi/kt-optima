# Prochaines Étapes - Dashboards ERP KTOptima

## ✅ Ce qui a été fait

1. ✅ **Migration créée** : Ajout du champ `plan` dans la table `companies`
2. ✅ **Hook `use-plan.ts`** : Détermine le plan et les fonctionnalités disponibles
3. ✅ **Widgets Core** : KPIs, Graphique Facturé/Encaissé, Ventes, CRM
4. ✅ **Widgets Business** : Achats, Produits, Stock (conditionnel)
5. ✅ **Widgets Enterprise** : Comptabilité, RH, Parc, Trésorerie avancée
6. ✅ **Dashboard modulaire** : Affichage conditionnel selon le plan
7. ✅ **Sélecteur de période** : Mois/Trimestre/Année

## 🧪 Tests à effectuer

### 1. Vérifier le dashboard Core (par défaut)
- Aller sur `/dashboard`
- Vérifier que les 4 KPIs s'affichent
- Vérifier le graphique Facturé vs Encaissé
- Vérifier les widgets Ventes et CRM

### 2. Tester avec différents plans

Pour tester les différents plans, vous pouvez modifier directement dans Supabase :

```sql
-- Tester le plan Business
UPDATE companies SET plan = 'business' WHERE id = 'VOTRE_COMPANY_ID';

-- Tester le plan Enterprise
UPDATE companies SET plan = 'enterprise' WHERE id = 'VOTRE_COMPANY_ID';

-- Revenir au plan Core
UPDATE companies SET plan = 'core' WHERE id = 'VOTRE_COMPANY_ID';
```

Puis rafraîchir la page dashboard pour voir les widgets supplémentaires apparaître.

## 🔧 Améliorations possibles

### Option 1 : Ajouter un sélecteur de plan dans les paramètres
Permettre de changer le plan depuis l'interface (utile pour les tests et la démo).

### Option 2 : Intégrer les données réelles
- Remplacer les mock data dans `BusinessWidgets.tsx` et `EnterpriseWidgets.tsx`
- Créer les hooks manquants :
  - `use-achats.ts` pour les achats
  - `use-produits.ts` pour les produits
  - `use-stock.ts` pour le stock
  - `use-comptabilite.ts` pour la comptabilité
  - `use-rh.ts` pour les RH
  - `use-parc.ts` pour le parc

### Option 3 : Améliorer l'affichage du nom du client
Actuellement, les factures affichent `Client #{id}`. Il faudrait :
- Faire un JOIN avec la table `clients` dans le hook `use-factures-ventes.ts`
- Ou charger les clients séparément et faire un mapping

### Option 4 : Ajouter des tooltips pédagogiques
Expliquer chaque KPI avec un tooltip pour aider les utilisateurs à comprendre.

## 📝 Notes importantes

- **Plan par défaut** : Toutes les entreprises ont le plan `'core'` par défaut
- **Données mock** : Les widgets Business et Enterprise utilisent des données mock pour l'instant
- **Performance** : Les widgets chargent leurs données indépendamment (bon pour la performance)

## 🚀 Pour tester maintenant

1. **Vérifier que la migration est appliquée** :
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'companies' AND column_name = 'plan';
   ```

2. **Vérifier le plan actuel** :
   ```sql
   SELECT id, name, plan FROM companies;
   ```

3. **Tester le dashboard** :
   - Aller sur `/dashboard`
   - Vérifier que tout s'affiche correctement
   - Changer le plan dans la base de données et rafraîchir

## 🎯 Prochaine étape recommandée

**Ajouter un sélecteur de plan dans les paramètres** pour faciliter les tests et permettre de changer de plan depuis l'interface.
