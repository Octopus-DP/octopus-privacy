# 🗺️ Schéma de la Base de Données - Octopus Data & Privacy

Diagramme complet de la structure relationnelle PostgreSQL.

---

## 📊 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                         OCTOPUS DATABASE                             │
│                                                                      │
│  12 Tables | 50+ Index | Views | Triggers | Constraints             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture des tables

### Niveau 1 : Tables Racines (sans dépendances)

```
┌──────────────────────────────────┐
│         SYSTEM_ADMINS            │
│ ================================ │
│ 📧 email (PK)                    │
│ 📅 created_at                    │
└──────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                          CLIENTS                              │
│ ============================================================= │
│ 🔑 id (PK)                                                    │
│ 🏷️  code (UNIQUE)                                             │
│ 📝 name, contact_name, contact_email, contact_phone          │
│ 📍 address, siren, siret                                     │
│ 📊 status (active|inactive|suspended)                        │
│ 💰 subscription_plan, subscription_start_date, end_date      │
│ 👥 max_users                                                 │
│ ⚙️  features (JSONB)                                          │
│ 📅 created_at, updated_at, created_by                        │
└──────────────────────────────────────────────────────────────┘
```

---

### Niveau 2 : Tables dépendantes de CLIENTS

```
┌─────────────────────────────────────────────────────────────┐
│                      LEGAL_ENTITIES                          │
│ =========================================================== │
│ 🔑 id (PK)                                                  │
│ 🔗 client_id (FK → clients.id) CASCADE                     │
│ 🏷️  client_code                                             │
│ 📝 name, legal_form                                         │
│ 🏢 siren, siret, address, city, postal_code, country       │
│ 👤 dpo_name, dpo_email, dpo_phone                          │
│ 👤 representative_name, representative_email                │
│ ✅ is_active                                                │
│ 📅 created_at, updated_at, created_by                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          │
          ┌───────────────┴────────────────┐
          │                                │
┌─────────▼─────────────────┐   ┌──────────▼────────────────┐
│        USERS              │   │   PHISHING_TEMPLATES      │
│ ========================= │   │ ========================= │
│ 🔑 id (PK)                │   │ 🔑 id (PK)                │
│ 📧 email (UNIQUE)         │   │ 🏷️  client_code            │
│ 📝 name                   │   │ 📝 name, category         │
│ 👤 role (enum)            │   │ 📧 sender_name/email      │
│ 🔗 client_id (FK)         │   │ 📄 subject, html_content  │
│ 🏷️  client_code           │   │ 📄 text_content           │
│ ✅ is_active              │   │ 🌍 is_global              │
│ 🔐 permissions (JSONB)    │   │ ✅ is_active              │
│ 🕐 last_login             │   │ 📅 created_at, updated_at │
│ 🔑 password_change_req.   │   └───────────────────────────┘
│ 📅 created_at, updated_at │
└───────────────────────────┘
```

---

### Niveau 3 : Tables métier (RGPD)

```
┌─────────────────────────────────────────────────────────────┐
│                       TRAITEMENTS                            │
│ ============================================================ │
│ 🔑 id (PK)                                                   │
│ 🔗 client_id (FK → clients.id) CASCADE                      │
│ 🏷️  client_code                                              │
│ 🔗 entity_id (FK → legal_entities.id) SET NULL             │
│ 📝 name, description, purpose                               │
│ ⚖️  legal_basis                                              │
│ 📊 data_categories[], data_subjects[]                       │
│ ⚠️  sensitive_data (boolean)                                 │
│ 👤 responsible_person, responsible_email                    │
│ 🕐 retention_period, security_measures                      │
│ 🌍 has_transfers, transfer_countries[], transfer_guarantees│
│ 🚨 risk_level (low|medium|high)                             │
│ 📋 pia_required, pia_completed, pia_date                    │
│ 📊 status (active|archived|suspended)                       │
│ 🔢 version                                                  │
│ 📅 created_at, updated_at, created_by, updated_by          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         DEMANDES                             │
│ ============================================================ │
│ 🔑 id (PK)                                                   │
│ 🔗 client_id (FK → clients.id) CASCADE                      │
│ 🏷️  client_code                                              │
│ 🔗 entity_id (FK → legal_entities.id) SET NULL             │
│ 👤 requester_name, email, phone                             │
│ 📝 request_type (access|rectification|erasure|...)          │
│ 📄 description, response                                    │
│ 📅 date_received, deadline, date_completed                  │
│ 📊 status (pending|in_progress|completed|rejected)          │
│ 👤 assigned_to                                              │
│ ✅ identity_verified, verification_method                    │
│ 🚨 priority (low|normal|high|urgent)                        │
│ 📅 created_at, updated_at, created_by, updated_by          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       VIOLATIONS                             │
│ ============================================================ │
│ 🔑 id (PK)                                                   │
│ 🔗 client_id (FK → clients.id) CASCADE                      │
│ 🏷️  client_code                                              │
│ 🔗 entity_id (FK → legal_entities.id) SET NULL             │
│ 📝 title, description                                       │
│ 📅 date_detected, date_occurred                             │
│ 🚨 violation_type, severity                                 │
│ 📊 data_categories[], number_affected                       │
│ ⚠️  sensitive_data_involved                                  │
│ 📄 impact_description, consequences                         │
│ 🛠️  immediate/corrective/preventive_measures                │
│ 🇫🇷 cnil_notified, cnil_notification_date, cnil_reference  │
│ 📧 individuals_notified, individuals_notification_date      │
│ 📊 status (open|investigating|mitigated|resolved|closed)    │
│ 📅 created_at, updated_at, created_by, updated_by          │
└─────────────────────────────────────────────────────────────┘
```

---

### Niveau 4 : Tables Phishing

```
┌──────────────────────────────────────────────────────────────┐
│                    PHISHING_CAMPAIGNS                         │
│ ============================================================= │
│ 🔑 id (PK)                                                    │
│ 🔗 client_id (FK → clients.id) CASCADE                       │
│ 🏷️  client_code, client_name                                  │
│ 📝 name, description, objective                              │
│ 🔗 entity_id (FK → legal_entities.id) SET NULL              │
│ 📧 responsible_email                                          │
│ 🔗 template_id (FK → phishing_templates.id) SET NULL        │
│ 🔗 landing_page_id                                           │
│ 📅 start_date, end_date                                      │
│ ⚙️  send_mode (immediate|scheduled|gradual)                   │
│ 📊 tracking (JSONB): opens, clicks, submissions, reports     │
│ 🔒 privacy (JSONB): granularity, anonymize                   │
│ 🎓 auto_sensitization (JSONB)                                │
│ 📊 status (draft|scheduled|running|completed|stopped)        │
│ 🔢 recipient_count                                           │
│ 📅 created_at, updated_at, created_by                        │
│ 🚀 launched_at, launched_by                                  │
│ 🛑 stopped_at, stopped_by                                    │
└──────────────────────────────────────────────────────────────┘
                          │
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                  PHISHING_RECIPIENTS                          │
│ ============================================================= │
│ 🔑 id (PK)                                                    │
│ 🔗 campaign_id (FK → phishing_campaigns.id) CASCADE         │
│ 📧 email, name                                               │
│ 🏢 department, site                                          │
│ 👁️  opened, opened_at                                        │
│ 🖱️  clicked, clicked_at                                      │
│ 📝 submitted, submitted_at                                   │
│ 🚨 reported, reported_at                                     │
│ 📊 status (pending|sent|opened|clicked|submitted|reported)   │
│ 📅 created_at, email_sent_at                                 │
│ ❌ email_error                                               │
└──────────────────────────────────────────────────────────────┘
```

---

### Niveau 5 : Tables d'audit

```
┌──────────────────────────────────────────────────────────────┐
│                      HISTORY_LOGS                             │
│ ============================================================= │
│ 🔑 id (SERIAL PK)                                             │
│ 🏷️  module (traitements|demandes|violations|...)              │
│ 🔗 item_id                                                   │
│ 🏷️  client_code                                               │
│ 📝 action (created|updated|deleted|status_changed)           │
│ 📊 changes (JSONB)                                           │
│ 👤 performed_by, performed_at                                │
│ 🌐 ip_address, user_agent                                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      INVITATIONS                              │
│ ============================================================= │
│ 🔑 id (PK)                                                    │
│ 📧 email                                                      │
│ 🔗 client_id (FK → clients.id) CASCADE                       │
│ 🏷️  client_code                                               │
│ 👤 role                                                       │
│ 🔐 permissions (JSONB)                                        │
│ 👤 invited_by, invited_at                                    │
│ 📅 expires_at, accepted_at                                   │
│ 📊 status (pending|accepted|expired|cancelled)               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔗 Relations et Contraintes

### Clés étrangères (Foreign Keys)

```
CLIENTS (1) ──→ (N) LEGAL_ENTITIES [CASCADE DELETE]
CLIENTS (1) ──→ (N) USERS [CASCADE DELETE]
CLIENTS (1) ──→ (N) TRAITEMENTS [CASCADE DELETE]
CLIENTS (1) ──→ (N) DEMANDES [CASCADE DELETE]
CLIENTS (1) ──→ (N) VIOLATIONS [CASCADE DELETE]
CLIENTS (1) ──→ (N) PHISHING_CAMPAIGNS [CASCADE DELETE]
CLIENTS (1) ──→ (N) INVITATIONS [CASCADE DELETE]

LEGAL_ENTITIES (1) ──→ (N) TRAITEMENTS [SET NULL]
LEGAL_ENTITIES (1) ──→ (N) DEMANDES [SET NULL]
LEGAL_ENTITIES (1) ──→ (N) VIOLATIONS [SET NULL]
LEGAL_ENTITIES (1) ──→ (N) PHISHING_CAMPAIGNS [SET NULL]

PHISHING_TEMPLATES (1) ──→ (N) PHISHING_CAMPAIGNS [SET NULL]

PHISHING_CAMPAIGNS (1) ──→ (N) PHISHING_RECIPIENTS [CASCADE DELETE]
```

**Légende** :
- `[CASCADE DELETE]` : Suppression en cascade (si client supprimé → tout supprimé)
- `[SET NULL]` : Mise à NULL (si entity supprimée → entity_id = NULL)

---

## 📑 Index pour performances

### Index principaux

| Table | Index | Colonnes | Usage |
|-------|-------|----------|-------|
| **clients** | idx_clients_code | code | Recherche par code |
| **clients** | idx_clients_status | status | Filtrage actifs |
| **users** | idx_users_email | email | Authentification |
| **users** | idx_users_client_id | client_id | Jointure client |
| **traitements** | idx_traitements_client_code | client_code | Filtrage client |
| **traitements** | idx_traitements_risk_level | risk_level | Filtrage risque |
| **demandes** | idx_demandes_status | status | Filtrage statut |
| **demandes** | idx_demandes_deadline | deadline | Tri échéances |
| **violations** | idx_violations_severity | severity | Filtrage gravité |
| **phishing_campaigns** | idx_phishing_campaigns_status | status | Filtrage statut |
| **phishing_recipients** | idx_phishing_recipients_campaign_id | campaign_id | Jointure campagne |

### Index composites

| Table | Index | Colonnes | Usage |
|-------|-------|----------|-------|
| **phishing_recipients** | idx_recipients_campaign_stats | campaign_id, opened, clicked, submitted, reported | Stats rapides |

---

## 🎨 Vues (Views)

### 1. client_statistics

```sql
SELECT 
  c.id, c.code, c.name, c.status,
  COUNT(DISTINCT u.id) as user_count,
  COUNT(DISTINCT le.id) as entity_count,
  COUNT(DISTINCT t.id) as traitement_count,
  COUNT(DISTINCT d.id) as demande_count,
  COUNT(DISTINCT v.id) as violation_count,
  COUNT(DISTINCT pc.id) as campaign_count
FROM clients c
LEFT JOIN users u ON c.id = u.client_id
LEFT JOIN legal_entities le ON c.id = le.client_id
LEFT JOIN traitements t ON c.id = t.client_id
LEFT JOIN demandes d ON c.id = d.client_id
LEFT JOIN violations v ON c.id = v.client_id
LEFT JOIN phishing_campaigns pc ON c.id = pc.client_id
GROUP BY c.id;
```

**Usage** : Dashboard admin, vue d'ensemble clients

---

### 2. phishing_campaign_statistics

```sql
SELECT 
  pc.id, pc.name, pc.client_code, pc.status,
  COUNT(pr.id) as total_recipients,
  COUNT(CASE WHEN pr.opened THEN 1 END) as opened_count,
  COUNT(CASE WHEN pr.clicked THEN 1 END) as clicked_count,
  ROUND(100.0 * COUNT(CASE WHEN pr.opened THEN 1 END) / NULLIF(COUNT(pr.id), 0), 2) as open_rate,
  ROUND(100.0 * COUNT(CASE WHEN pr.clicked THEN 1 END) / NULLIF(COUNT(pr.id), 0), 2) as click_rate
FROM phishing_campaigns pc
LEFT JOIN phishing_recipients pr ON pc.id = pr.campaign_id
GROUP BY pc.id;
```

**Usage** : Analytics phishing

---

### 3. demandes_overdue

```sql
SELECT 
  d.*,
  c.name as client_name,
  le.name as entity_name,
  EXTRACT(DAY FROM (CURRENT_TIMESTAMP - d.deadline)) as days_overdue
FROM demandes d
JOIN clients c ON d.client_id = c.id
LEFT JOIN legal_entities le ON d.entity_id = le.id
WHERE d.status IN ('pending', 'in_progress')
  AND d.deadline < CURRENT_TIMESTAMP
ORDER BY d.deadline ASC;
```

**Usage** : Alertes demandes en retard

---

## ⚙️ Triggers automatiques

### 1. update_updated_at_column()

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Appliqué sur** : Toutes les tables avec `updated_at`

**Effet** : Met à jour automatiquement `updated_at` lors d'un UPDATE

---

### 2. log_history()

```sql
CREATE OR REPLACE FUNCTION log_history()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO history_logs (module, item_id, action, changes)
        VALUES (TG_TABLE_NAME, NEW.id, 'created', row_to_json(NEW));
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO history_logs (module, item_id, action, changes)
        VALUES (TG_TABLE_NAME, NEW.id, 'updated', 
                jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Optionnel** : Pour audit automatique de toutes les modifications

---

## 📊 Statistiques de taille (estimées)

| Table | Volume attendu | Taille estimée |
|-------|----------------|----------------|
| clients | 10-100 | < 1 MB |
| legal_entities | 50-500 | < 1 MB |
| users | 100-1,000 | < 1 MB |
| traitements | 500-5,000 | 1-10 MB |
| demandes | 200-2,000 | 1-5 MB |
| violations | 10-100 | < 1 MB |
| phishing_templates | 20-100 | < 1 MB |
| phishing_campaigns | 50-500 | < 1 MB |
| phishing_recipients | 5,000-50,000 | 5-50 MB |
| history_logs | 10,000-100,000 | 10-100 MB |

**Total estimé** : **20-200 MB** pour une PME moyenne

**Note** : PostgreSQL gère facilement des bases jusqu'à **1 TB+**

---

## 🔐 Sécurité et RLS (Row Level Security)

### Politique de sécurité (optionnelle)

```sql
-- Activer RLS
ALTER TABLE traitements ENABLE ROW LEVEL SECURITY;

-- Politique : les users ne voient que leur client
CREATE POLICY client_isolation ON traitements
FOR ALL
USING (client_code = current_setting('app.current_client_code'));

-- À appliquer dans votre application :
SET app.current_client_code = 'CLIENT001';
SELECT * FROM traitements;  -- Ne voit que CLIENT001
```

**Avantage** : Sécurité au niveau base de données (même si bug dans le code)

---

## 📈 Monitoring et Maintenance

### Requêtes de monitoring

```sql
-- Taille totale de la base
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Tables les plus volumineuses
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Nombre d'enregistrements par table
SELECT 
  'clients' as table, COUNT(*) FROM clients
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'traitements', COUNT(*) FROM traitements;
```

---

## 🎓 Best Practices

### 1. Toujours utiliser les index

❌ **Lent** :
```sql
SELECT * FROM traitements WHERE name LIKE '%test%';  -- Full scan
```

✅ **Rapide** :
```sql
SELECT * FROM traitements WHERE client_code = 'CLIENT001';  -- Index
```

---

### 2. Limiter les SELECT *

❌ **Éviter** :
```sql
SELECT * FROM traitements;  -- Récupère toutes les colonnes
```

✅ **Préférer** :
```sql
SELECT id, name, status, created_at FROM traitements;  -- Colonnes nécessaires
```

---

### 3. Utiliser les transactions

```sql
BEGIN;
  INSERT INTO clients (...) VALUES (...);
  INSERT INTO legal_entities (...) VALUES (...);
COMMIT;  -- Atomique : tout ou rien
```

---

## 📞 Support

Pour plus d'informations :
- **Migration** : Voir [GUIDE_MIGRATION_SQL.md](./GUIDE_MIGRATION_SQL.md)
- **Requêtes** : Voir [exemples_requetes_sql.md](./exemples_requetes_sql.md)
- **Supabase** : https://supabase.com/docs/guides/database

---

**Version** : 1.0  
**Dernière mise à jour** : 2024-12-04
