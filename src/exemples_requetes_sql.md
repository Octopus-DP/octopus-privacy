# 📊 Exemples de requêtes SQL - Octopus Data & Privacy

Collection de requêtes SQL utiles pour exploiter votre nouvelle base de données relationnelle.

---

## 🎯 Requêtes de base

### 1. Statistiques globales

```sql
-- Vue d'ensemble complète
SELECT 
  (SELECT COUNT(*) FROM clients) as total_clients,
  (SELECT COUNT(*) FROM users WHERE is_active = true) as active_users,
  (SELECT COUNT(*) FROM legal_entities WHERE is_active = true) as active_entities,
  (SELECT COUNT(*) FROM traitements WHERE status = 'active') as active_traitements,
  (SELECT COUNT(*) FROM demandes WHERE status IN ('pending', 'in_progress')) as pending_demandes,
  (SELECT COUNT(*) FROM violations WHERE status != 'closed') as open_violations,
  (SELECT COUNT(*) FROM phishing_campaigns WHERE status = 'running') as running_campaigns;
```

---

### 2. Détails d'un client

```sql
-- Toutes les infos d'un client avec compteurs
SELECT 
  c.*,
  COUNT(DISTINCT u.id) as user_count,
  COUNT(DISTINCT le.id) as entity_count,
  COUNT(DISTINCT t.id) as traitement_count,
  COUNT(DISTINCT d.id) as demande_count,
  COUNT(DISTINCT v.id) as violation_count
FROM clients c
LEFT JOIN users u ON c.id = u.client_id AND u.is_active = true
LEFT JOIN legal_entities le ON c.id = le.client_id AND le.is_active = true
LEFT JOIN traitements t ON c.id = t.client_id
LEFT JOIN demandes d ON c.id = d.client_id
LEFT JOIN violations v ON c.id = v.client_id
WHERE c.code = 'CLIENT001'  -- Remplacez par le code client
GROUP BY c.id;
```

---

## 👥 Requêtes Utilisateurs

### 1. Utilisateurs actifs par client

```sql
SELECT 
  c.name as client_name,
  COUNT(u.id) as active_users,
  STRING_AGG(u.email, ', ' ORDER BY u.email) as user_emails
FROM clients c
LEFT JOIN users u ON c.id = u.client_id AND u.is_active = true
GROUP BY c.id, c.name
ORDER BY active_users DESC;
```

---

### 2. Utilisateurs par rôle

```sql
SELECT 
  role,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM users
WHERE is_active = true
GROUP BY role
ORDER BY count DESC;
```

---

### 3. Dernières connexions

```sql
SELECT 
  u.email,
  u.name,
  c.name as client_name,
  u.role,
  u.last_login,
  EXTRACT(DAY FROM (CURRENT_TIMESTAMP - u.last_login)) as days_since_login
FROM users u
LEFT JOIN clients c ON u.client_id = c.id
WHERE u.is_active = true
  AND u.last_login IS NOT NULL
ORDER BY u.last_login DESC
LIMIT 20;
```

---

## 📋 Requêtes RGPD

### 1. Traitements par niveau de risque

```sql
SELECT 
  risk_level,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM traitements
WHERE status = 'active'
GROUP BY risk_level
ORDER BY 
  CASE risk_level
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END;
```

---

### 2. Traitements nécessitant une PIA

```sql
SELECT 
  t.name,
  c.name as client_name,
  le.name as entity_name,
  t.risk_level,
  t.pia_required,
  t.pia_completed,
  t.pia_date,
  CASE 
    WHEN t.pia_required AND NOT t.pia_completed THEN 'À faire'
    WHEN t.pia_required AND t.pia_completed THEN 'Complété'
    ELSE 'Non requis'
  END as pia_status
FROM traitements t
JOIN clients c ON t.client_id = c.id
LEFT JOIN legal_entities le ON t.entity_id = le.id
WHERE t.status = 'active'
  AND t.pia_required = true
ORDER BY t.pia_completed ASC, t.created_at DESC;
```

---

### 3. Demandes en retard

```sql
SELECT 
  d.id,
  d.requester_name,
  d.email,
  d.request_type,
  c.name as client_name,
  d.date_received,
  d.deadline,
  EXTRACT(DAY FROM (CURRENT_TIMESTAMP - d.deadline)) as days_overdue,
  d.status,
  d.assigned_to
FROM demandes d
JOIN clients c ON d.client_id = c.id
WHERE d.status IN ('pending', 'in_progress')
  AND d.deadline < CURRENT_TIMESTAMP
ORDER BY days_overdue DESC;
```

---

### 4. Violations critiques

```sql
SELECT 
  v.title,
  v.date_detected,
  v.severity,
  c.name as client_name,
  v.cnil_notified,
  v.individuals_notified,
  v.status,
  EXTRACT(DAY FROM (CURRENT_TIMESTAMP - v.date_detected)) as days_since_detection
FROM violations v
JOIN clients c ON v.client_id = c.id
WHERE v.severity IN ('high', 'critical')
  AND v.status != 'closed'
ORDER BY v.date_detected DESC;
```

---

## 🎣 Requêtes Phishing

### 1. Statistiques des campagnes

```sql
SELECT 
  pc.name as campaign_name,
  c.name as client_name,
  pc.status,
  COUNT(pr.id) as total_recipients,
  COUNT(CASE WHEN pr.opened THEN 1 END) as opened,
  COUNT(CASE WHEN pr.clicked THEN 1 END) as clicked,
  COUNT(CASE WHEN pr.submitted THEN 1 END) as submitted,
  COUNT(CASE WHEN pr.reported THEN 1 END) as reported,
  ROUND(100.0 * COUNT(CASE WHEN pr.opened THEN 1 END) / NULLIF(COUNT(pr.id), 0), 2) as open_rate,
  ROUND(100.0 * COUNT(CASE WHEN pr.clicked THEN 1 END) / NULLIF(COUNT(pr.id), 0), 2) as click_rate,
  ROUND(100.0 * COUNT(CASE WHEN pr.reported THEN 1 END) / NULLIF(COUNT(pr.id), 0), 2) as report_rate
FROM phishing_campaigns pc
JOIN clients c ON pc.client_id = c.id
LEFT JOIN phishing_recipients pr ON pc.id = pr.campaign_id
WHERE pc.status IN ('running', 'completed')
GROUP BY pc.id, pc.name, c.name, pc.status
ORDER BY pc.created_at DESC;
```

---

### 2. Top 10 des utilisateurs vulnérables

```sql
-- Utilisateurs qui cliquent le plus souvent
SELECT 
  pr.email,
  pr.name,
  COUNT(DISTINCT pr.campaign_id) as campaigns_participated,
  COUNT(CASE WHEN pr.clicked THEN 1 END) as times_clicked,
  COUNT(CASE WHEN pr.submitted THEN 1 END) as times_submitted,
  COUNT(CASE WHEN pr.reported THEN 1 END) as times_reported,
  ROUND(100.0 * COUNT(CASE WHEN pr.clicked THEN 1 END) / NULLIF(COUNT(*), 0), 2) as click_rate
FROM phishing_recipients pr
GROUP BY pr.email, pr.name
HAVING COUNT(*) >= 3  -- Au moins 3 campagnes
ORDER BY click_rate DESC, times_clicked DESC
LIMIT 10;
```

---

### 3. Top 10 des utilisateurs vigilants

```sql
-- Utilisateurs qui signalent le plus
SELECT 
  pr.email,
  pr.name,
  COUNT(DISTINCT pr.campaign_id) as campaigns_participated,
  COUNT(CASE WHEN pr.reported THEN 1 END) as times_reported,
  COUNT(CASE WHEN pr.clicked THEN 1 END) as times_clicked,
  ROUND(100.0 * COUNT(CASE WHEN pr.reported THEN 1 END) / NULLIF(COUNT(*), 0), 2) as report_rate
FROM phishing_recipients pr
GROUP BY pr.email, pr.name
HAVING COUNT(*) >= 3
ORDER BY report_rate DESC, times_reported DESC
LIMIT 10;
```

---

### 4. Efficacité des templates

```sql
SELECT 
  pt.name as template_name,
  pt.category,
  COUNT(DISTINCT pc.id) as times_used,
  AVG(
    (SELECT COUNT(CASE WHEN pr.clicked THEN 1 END)::float / NULLIF(COUNT(pr.id), 0) * 100
     FROM phishing_recipients pr
     WHERE pr.campaign_id = pc.id)
  ) as avg_click_rate,
  AVG(
    (SELECT COUNT(CASE WHEN pr.reported THEN 1 END)::float / NULLIF(COUNT(pr.id), 0) * 100
     FROM phishing_recipients pr
     WHERE pr.campaign_id = pc.id)
  ) as avg_report_rate
FROM phishing_templates pt
LEFT JOIN phishing_campaigns pc ON pt.id = pc.template_id
WHERE pc.status IN ('completed', 'running')
GROUP BY pt.id, pt.name, pt.category
HAVING COUNT(DISTINCT pc.id) > 0
ORDER BY avg_click_rate DESC;
```

---

## 📊 Requêtes Analytics

### 1. Évolution mensuelle des demandes

```sql
SELECT 
  TO_CHAR(date_received, 'YYYY-MM') as month,
  COUNT(*) as total_demandes,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status IN ('pending', 'in_progress') THEN 1 END) as pending,
  ROUND(AVG(EXTRACT(DAY FROM (date_completed - date_received))), 2) as avg_resolution_days
FROM demandes
WHERE date_received >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY TO_CHAR(date_received, 'YYYY-MM')
ORDER BY month DESC;
```

---

### 2. Répartition des demandes par type

```sql
SELECT 
  request_type,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage,
  ROUND(AVG(EXTRACT(DAY FROM (COALESCE(date_completed, CURRENT_TIMESTAMP) - date_received))), 2) as avg_days
FROM demandes
WHERE date_received >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY request_type
ORDER BY count DESC;
```

---

### 3. Activité par client (dernier mois)

```sql
SELECT 
  c.name as client_name,
  COUNT(DISTINCT CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '1 month' THEN t.id END) as new_traitements,
  COUNT(DISTINCT CASE WHEN d.date_received >= CURRENT_DATE - INTERVAL '1 month' THEN d.id END) as new_demandes,
  COUNT(DISTINCT CASE WHEN v.date_detected >= CURRENT_DATE - INTERVAL '1 month' THEN v.id END) as new_violations,
  COUNT(DISTINCT CASE WHEN pc.created_at >= CURRENT_DATE - INTERVAL '1 month' THEN pc.id END) as new_campaigns
FROM clients c
LEFT JOIN traitements t ON c.id = t.client_id
LEFT JOIN demandes d ON c.id = d.client_id
LEFT JOIN violations v ON c.id = v.client_id
LEFT JOIN phishing_campaigns pc ON c.id = pc.client_id
WHERE c.status = 'active'
GROUP BY c.id, c.name
ORDER BY (
  COALESCE(COUNT(DISTINCT CASE WHEN t.created_at >= CURRENT_DATE - INTERVAL '1 month' THEN t.id END), 0) +
  COALESCE(COUNT(DISTINCT CASE WHEN d.date_received >= CURRENT_DATE - INTERVAL '1 month' THEN d.id END), 0) +
  COALESCE(COUNT(DISTINCT CASE WHEN v.date_detected >= CURRENT_DATE - INTERVAL '1 month' THEN v.id END), 0) +
  COALESCE(COUNT(DISTINCT CASE WHEN pc.created_at >= CURRENT_DATE - INTERVAL '1 month' THEN pc.id END), 0)
) DESC;
```

---

## 🔍 Requêtes de monitoring

### 1. Taille des tables

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

### 2. Index inutilisés

```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

### 3. Requêtes les plus lentes

```sql
-- Nécessite pg_stat_statements activé
SELECT 
  LEFT(query, 100) as query_start,
  calls,
  ROUND(total_exec_time::numeric, 2) as total_time_ms,
  ROUND(mean_exec_time::numeric, 2) as avg_time_ms,
  ROUND(max_exec_time::numeric, 2) as max_time_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 🛠️ Requêtes de maintenance

### 1. Vacuum et Analyze

```sql
-- Analyser toutes les tables
ANALYZE;

-- Vacuum complet (à faire hors production)
VACUUM FULL ANALYZE;

-- Voir les tables qui ont besoin de vacuum
SELECT 
  schemaname,
  relname,
  n_dead_tup,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

---

### 2. Reconstruire les index

```sql
-- Si nécessaire (après grosse modification de données)
REINDEX TABLE traitements;
REINDEX TABLE demandes;
REINDEX TABLE phishing_recipients;
```

---

## 🎨 Requêtes personnalisées

### 1. Dashboard client personnalisé

```sql
-- Vue complète pour un client spécifique
WITH client_data AS (
  SELECT * FROM clients WHERE code = 'CLIENT001'
),
stats AS (
  SELECT 
    (SELECT COUNT(*) FROM traitements WHERE client_code = (SELECT code FROM client_data)) as traitements,
    (SELECT COUNT(*) FROM traitements WHERE client_code = (SELECT code FROM client_data) AND risk_level = 'high') as high_risk_traitements,
    (SELECT COUNT(*) FROM demandes WHERE client_code = (SELECT code FROM client_data) AND status IN ('pending', 'in_progress')) as pending_demandes,
    (SELECT COUNT(*) FROM violations WHERE client_code = (SELECT code FROM client_data) AND status != 'closed') as open_violations
)
SELECT 
  c.*,
  s.*
FROM client_data c, stats s;
```

---

### 2. Export CSV (pour rapports)

```sql
-- Copier le résultat dans un fichier CSV
COPY (
  SELECT 
    t.name,
    c.name as client,
    le.name as entity,
    t.risk_level,
    t.created_at
  FROM traitements t
  JOIN clients c ON t.client_id = c.id
  LEFT JOIN legal_entities le ON t.entity_id = le.id
  WHERE t.status = 'active'
) TO '/tmp/traitements_export.csv' WITH CSV HEADER;
```

---

## 💡 Tips & Astuces

### 1. Utiliser les CTE (Common Table Expressions)

```sql
-- Plus lisible que des subqueries
WITH active_campaigns AS (
  SELECT * FROM phishing_campaigns WHERE status = 'running'
),
campaign_stats AS (
  SELECT 
    campaign_id,
    COUNT(*) as total,
    COUNT(CASE WHEN clicked THEN 1 END) as clicks
  FROM phishing_recipients
  WHERE campaign_id IN (SELECT id FROM active_campaigns)
  GROUP BY campaign_id
)
SELECT 
  ac.name,
  cs.total,
  cs.clicks,
  ROUND(100.0 * cs.clicks / cs.total, 2) as click_rate
FROM active_campaigns ac
JOIN campaign_stats cs ON ac.id = cs.campaign_id;
```

---

### 2. Utiliser EXPLAIN pour optimiser

```sql
-- Voir le plan d'exécution d'une requête
EXPLAIN ANALYZE
SELECT * FROM traitements WHERE client_code = 'CLIENT001';

-- Si lent, ajouter un index :
CREATE INDEX idx_traitements_client_code ON traitements(client_code);
```

---

### 3. Créer des vues pour les requêtes fréquentes

```sql
-- Vue pour les statistiques clients
CREATE OR REPLACE VIEW v_client_stats AS
SELECT 
  c.id,
  c.code,
  c.name,
  COUNT(DISTINCT u.id) as users,
  COUNT(DISTINCT t.id) as traitements,
  COUNT(DISTINCT d.id) as demandes,
  COUNT(DISTINCT v.id) as violations
FROM clients c
LEFT JOIN users u ON c.id = u.client_id
LEFT JOIN traitements t ON c.id = t.client_id
LEFT JOIN demandes d ON c.id = d.client_id
LEFT JOIN violations v ON c.id = v.client_id
GROUP BY c.id, c.code, c.name;

-- Utilisation :
SELECT * FROM v_client_stats WHERE code = 'CLIENT001';
```

---

## 📚 Ressources

- **PostgreSQL Documentation** : https://www.postgresql.org/docs/
- **Supabase SQL Editor** : https://supabase.com/docs/guides/database/overview
- **SQL Tutorial** : https://www.w3schools.com/sql/

---

**Bon querying ! 🚀**
