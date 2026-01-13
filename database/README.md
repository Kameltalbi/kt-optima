# BilvoxaERP - Database Schema

## Installation PostgreSQL

### 1. Créer la base de données

```bash
# Se connecter à PostgreSQL
psql postgres

# Créer la base de données
CREATE DATABASE bilvoxa_erp;

# Se connecter à la base de données
\c bilvoxa_erp;
```

### 2. Exécuter le script SQL

```bash
# Depuis le répertoire du projet
psql -U postgres -d bilvoxa_erp -f database/schema.sql
```

Ou depuis psql :

```sql
\i database/schema.sql
```

## Structure des tables

Le schéma contient **58 tables** organisées en modules :

### Core System (3 tables)
- companies
- users
- roles

### Authentification (8 tables)
- sessions
- refresh_tokens
- password_resets
- email_verifications
- login_attempts
- audit_logs
- user_permissions (optionnel)
- api_tokens (optionnel)

### Clients & Fournisseurs (2 tables)
- clients
- suppliers

### Produits & Services (2 tables)
- products
- services

### Ventes (4 tables)
- invoices
- invoice_items
- quotes
- payments

### Achats (6 tables)
- purchase_orders
- purchase_order_lines
- receptions
- reception_lines
- supplier_invoices
- supplier_invoice_items

### Stock (4 tables)
- warehouses
- stock_items
- stock_movements
- stock_alerts

### Finance (4 tables)
- accounts
- transactions
- payment_schedules
- reconciliations

### Comptabilité (5 tables)
- accounting_accounts
- accounting_entries
- accounting_entry_lines
- accounting_config
- vat_declarations

### Ressources Humaines (8 tables)
- hr_employees
- hr_contracts
- payrolls
- leaves
- leave_balances
- hr_documents
- evaluations
- evaluation_campaigns

### Projets (2 tables)
- projects
- project_expenses

### Documents & Notifications (2 tables)
- documents
- notifications

## Caractéristiques

- **UUID** comme identifiants primaires
- **Timestamps** automatiques (created_at, updated_at)
- **Triggers** pour mettre à jour updated_at automatiquement
- **Indexes** sur les colonnes fréquemment utilisées
- **Contraintes** de validation (CHECK, FOREIGN KEY)
- **Cascade** sur les suppressions appropriées
- **JSONB** pour les données flexibles (objectives, competencies, etc.)

## Connexion

```bash
# Variables d'environnement recommandées
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=bilvoxa_erp
export DB_USER=postgres
export DB_PASSWORD=your_password
```
