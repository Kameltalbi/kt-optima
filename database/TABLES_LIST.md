# Liste des Tables Créées - BilvoxaERP

## Total : 48 tables

### CORE SYSTEM (3 tables)
1. ✅ companies
2. ✅ roles
3. ✅ users

### AUTHENTICATION (6 tables)
4. ✅ sessions
5. ✅ refresh_tokens
6. ✅ password_resets
7. ✅ email_verifications
8. ✅ login_attempts
9. ✅ audit_logs

### CLIENTS & FOURNISSEURS (2 tables)
10. ✅ clients
11. ✅ suppliers

### PRODUITS & SERVICES (2 tables)
12. ✅ products
13. ✅ services

### VENTES (4 tables)
14. ✅ invoices
15. ✅ invoice_items
16. ✅ quotes
17. ✅ payments

### ACHATS (6 tables)
18. ✅ purchase_orders
19. ✅ purchase_order_lines
20. ✅ receptions
21. ✅ reception_lines
22. ✅ supplier_invoices
23. ✅ supplier_invoice_items

### STOCK (4 tables)
24. ✅ warehouses
25. ✅ stock_items
26. ✅ stock_movements
27. ✅ stock_alerts

### FINANCE (4 tables)
28. ✅ accounts
29. ✅ transactions
30. ✅ payment_schedules
31. ✅ reconciliations

### COMPTABILITÉ (5 tables)
32. ✅ accounting_accounts
33. ✅ accounting_entries
34. ✅ accounting_entry_lines
35. ✅ accounting_config
36. ✅ vat_declarations

### RESSOURCES HUMAINES (8 tables)
37. ✅ hr_employees
38. ✅ hr_contracts
39. ✅ payrolls
40. ✅ leaves
41. ✅ leave_balances
42. ✅ hr_documents
43. ✅ evaluations
44. ✅ evaluation_campaigns

### PROJETS (2 tables)
45. ✅ projects
46. ✅ project_expenses

### DOCUMENTS & NOTIFICATIONS (2 tables)
47. ✅ documents
48. ✅ notifications

## Caractéristiques

- ✅ UUID comme identifiants primaires
- ✅ Timestamps automatiques (created_at, updated_at)
- ✅ Triggers pour updated_at
- ✅ Indexes sur colonnes fréquentes
- ✅ Contraintes CHECK pour validation
- ✅ Clés étrangères avec CASCADE approprié
- ✅ JSONB pour données flexibles (objectives, competencies, etc.)

## Commandes utiles

```bash
# Se connecter à la base
psql -d bilvoxa_erp

# Lister toutes les tables
\dt

# Voir la structure d'une table
\d table_name

# Compter les tables
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
```
