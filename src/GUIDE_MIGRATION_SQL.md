# 📊 Guide de Migration - KV Store vers PostgreSQL

Guide complet pour migrer Octopus Data & Privacy vers une architecture relationnelle.

---

## 🎯 Pourquoi migrer ?

### ✅ Avantages de la base de données relationnelle

| Aspect | KV Store | PostgreSQL Relationnel |
|--------|----------|------------------------|
| **Performance** | ⭐⭐ Lent sur grandes données | ⭐⭐⭐⭐⭐ Rapide avec index |
| **Requêtes complexes** | ❌ Difficile (getByPrefix) | ✅ SQL puissant (JOIN, WHERE, etc.) |
| **Intégrité** | ❌ Aucune contrainte | ✅ Contraintes FK, CHECK |
| **Scalabilité** | ⭐⭐ Limitée | ⭐⭐⭐⭐⭐ Excellente |
| **Backup** | ⭐⭐ Manuel | ⭐⭐⭐⭐⭐ Automatique |
| **Transactions** | ❌ Non supportées | ✅ ACID complet |
| **Maintenance** | ⭐⭐ Complexe | ⭐⭐⭐⭐ Outils intégrés |

### 📈 Gains attendus

- **Performance** : 10-50x plus rapide sur les requêtes complexes
- **Intégrité** : Zéro risque d'incohérence (FK, contraintes)
- **Développement** : Code backend 50% plus simple
- **Monitoring** : Vue d'ensemble en temps réel
- **Backup** : Point-in-time recovery natif

---

## 📋 Prérequis

### 1. Environnement de développement/staging

⚠️ **NE JAMAIS migrer directement en production !**

Créez un projet Supabase de test :
```bash
1. Allez sur https://supabase.com
2. Créez un nouveau projet "octopus-staging"
3. Notez les credentials
```

### 2. Backup du KV Store actuel

```typescript
// Script de backup (à exécuter en premier)
import * as kv from './supabase/functions/server/kv_store.tsx';

async function backupKVStore() {
  const allKeys = [
    'admins',
    'client:',
    'legal_entity:',
    'user:',
    'user_email:',
    'traitement:',
    'demande:',
    'violation:',
    'phishing_template:',
    'phishing_campaign:',
    'phishing_recipient:',
  ];
  
  const backup: any = {};
  
  for (const key of allKeys) {
    if (key.endsWith(':')) {
      backup[key] = await kv.getByPrefix(key);
    } else {
      backup[key] = await kv.get(key);
    }
  }
  
  const filename = `backup_kv_${Date.now()}.json`;
  await Deno.writeTextFile(filename, JSON.stringify(backup, null, 2));
  console.log(`✅ Backup saved: ${filename}`);
}

backupKVStore();
```

### 3. Outils nécessaires

- **Supabase CLI** (optionnel) : https://supabase.com/docs/guides/cli
- **PostgreSQL client** : pgAdmin, DBeaver, ou psql
- **Deno** : Pour exécuter les scripts de migration

---

## 🚀 Étapes de migration

### Phase 1 : Préparation (30 min)

#### 1.1. Créer les tables SQL

```bash
# Option A : Via Supabase Dashboard
1. Allez sur https://supabase.com/dashboard/project/hnftylnikuxwtzxpmysf/editor
2. Créez une nouvelle requête SQL
3. Copiez le contenu de migration_sql_relationnel.sql
4. Exécutez la requête
5. Vérifiez que toutes les tables sont créées (onglet "Tables")
```

```bash
# Option B : Via psql (ligne de commande)
psql "postgresql://postgres:[PASSWORD]@db.hnftylnikuxwtzxpmysf.supabase.co:5432/postgres" \
  -f migration_sql_relationnel.sql
```

**Vérification** :
```sql
-- Lister toutes les tables créées
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Devrait retourner :
-- clients
-- legal_entities
-- users
-- system_admins
-- traitements
-- demandes
-- violations
-- phishing_templates
-- phishing_campaigns
-- phishing_recipients
-- history_logs
-- invitations
```

#### 1.2. Configurer les variables d'environnement

Dans votre environnement de staging :
```bash
SUPABASE_URL=https://[staging-project-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[votre-service-role-key]
```

---

### Phase 2 : Migration des données (1-2h)

#### 2.1. Exécuter le script de migration

```bash
# Depuis le répertoire /supabase/functions/server/
deno run --allow-net --allow-env migration_donnees_kv_vers_sql.tsx
```

**Sortie attendue** :
```
====================================================
MIGRATION KV STORE → POSTGRESQL
====================================================

[MIGRATION] Starting clients migration...
[MIGRATION] Found 5 clients in KV store
[MIGRATION SUCCESS] Clients migrated (5 enregistrements)

[MIGRATION] Starting legal entities migration...
[MIGRATION] Found 12 legal entities in KV store
[MIGRATION SUCCESS] Legal entities migrated (12 enregistrements)

[MIGRATION] Starting users migration...
[MIGRATION] Found 28 users in KV store
[MIGRATION SUCCESS] Users migrated (28 enregistrements)

...

====================================================
MIGRATION COMPLETED SUCCESSFULLY
====================================================

Statistics:
- Clients: 5
- Legal Entities: 12
- Users: 28
- System Admins: 2
- Traitements: 45
- Demandes: 23
- Violations: 3
- Phishing Templates: 8
- Phishing Campaigns: 6
- Phishing Recipients: 142

Total duration: 12.34s

✅ Migration completed successfully
```

#### 2.2. Vérifier les données migrées

```sql
-- Compter les enregistrements dans chaque table
SELECT 
  'clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'legal_entities', COUNT(*) FROM legal_entities
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'system_admins', COUNT(*) FROM system_admins
UNION ALL
SELECT 'traitements', COUNT(*) FROM traitements
UNION ALL
SELECT 'demandes', COUNT(*) FROM demandes
UNION ALL
SELECT 'violations', COUNT(*) FROM violations
UNION ALL
SELECT 'phishing_templates', COUNT(*) FROM phishing_templates
UNION ALL
SELECT 'phishing_campaigns', COUNT(*) FROM phishing_campaigns
UNION ALL
SELECT 'phishing_recipients', COUNT(*) FROM phishing_recipients;
```

**Comparez avec le KV Store** :
- Les nombres doivent correspondre exactement
- Si différence, relancez la migration (upsert = idempotent)

---

### Phase 3 : Mise à jour du code backend (2-3h)

Il faut modifier toutes les fonctions qui utilisent `kv.get()`, `kv.set()`, etc. pour utiliser Supabase client.

#### 3.1. Créer un helper SQL

Créez `/supabase/functions/server/db_helper.tsx` :

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export const db = createClient(supabaseUrl, supabaseServiceKey);

// Helpers pour simplifier les requêtes

export async function getClientById(clientId: string) {
  const { data, error } = await db
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getClientByCode(code: string) {
  const { data, error } = await db
    .from('clients')
    .select('*')
    .eq('code', code)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserByEmail(email: string) {
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

export async function getUserById(userId: string) {
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// ... ajoutez d'autres helpers selon vos besoins
```

#### 3.2. Exemple de refactoring

**Avant (KV Store)** :
```typescript
// Dans index.tsx
const userId = await kv.get(`user_email:${email}`);
if (!userId) return c.json({ error: 'User not found' }, 404);

const userData = await kv.get(`user:${userId}`);
if (!userData) return c.json({ error: 'User not found' }, 404);
```

**Après (SQL)** :
```typescript
import { getUserByEmail } from './db_helper.tsx';

const userData = await getUserByEmail(email);
if (!userData) return c.json({ error: 'User not found' }, 404);
```

**Avantages** :
- ✅ 1 seule requête au lieu de 2
- ✅ Plus simple et lisible
- ✅ Plus rapide (index sur email)

#### 3.3. Refactoring des principales routes

Voici les fichiers à modifier :

| Fichier | Routes à modifier | Difficulté |
|---------|-------------------|------------|
| `/supabase/functions/server/index.tsx` | Toutes (users, clients, etc.) | ⭐⭐⭐⭐ |
| `/supabase/functions/server/phishing.tsx` | Campagnes, templates, recipients | ⭐⭐⭐⭐ |
| Autres fichiers custom | Si existants | ⭐⭐⭐ |

**Estimation** : 2-3 heures pour tout refactorer

---

### Phase 4 : Tests (1-2h)

#### 4.1. Tests unitaires des endpoints

```bash
# Tester chaque endpoint avec curl ou Postman

# Exemple : GET user profile
curl -H "Authorization: Bearer [access_token]" \
  https://[staging-project-id].supabase.co/functions/v1/make-server-abb8d15d/profile

# Exemple : GET clients (admin)
curl -H "Authorization: Bearer [access_token]" \
  https://[staging-project-id].supabase.co/functions/v1/make-server-abb8d15d/clients

# Exemple : GET phishing campaigns
curl -H "Authorization: Bearer [access_token]" \
  https://[staging-project-id].supabase.co/functions/v1/make-server-abb8d15d/phishing/campaigns
```

#### 4.2. Tests frontend

1. Déployez le frontend sur staging
2. Connectez-vous avec un utilisateur test
3. Testez tous les modules :
   - ✅ Connexion / Déconnexion
   - ✅ Gestion des utilisateurs
   - ✅ Gestion des entités juridiques
   - ✅ Registre des traitements
   - ✅ Demandes d'exercice de droits
   - ✅ Violations de données
   - ✅ Campagnes de phishing
   - ✅ Analytics

#### 4.3. Tests de performance

```sql
-- Test 1 : Requête complexe (avant = lent, après = rapide)
EXPLAIN ANALYZE
SELECT 
  c.name as client_name,
  COUNT(DISTINCT u.id) as user_count,
  COUNT(DISTINCT t.id) as traitement_count,
  COUNT(DISTINCT d.id) as demande_count
FROM clients c
LEFT JOIN users u ON c.id = u.client_id
LEFT JOIN traitements t ON c.id = t.client_id
LEFT JOIN demandes d ON c.id = d.client_id
GROUP BY c.id, c.name;

-- Vérifier que l'exécution prend < 100ms
```

---

### Phase 5 : Mise en production (1h)

#### 5.1. Planifier la mise en production

**Choisir une fenêtre de maintenance** :
- Idéalement le weekend ou la nuit
- Durée estimée : 30 min à 1h
- Prévenir les utilisateurs 48h avant

#### 5.2. Procédure de mise en production

**Étape 1 : Backup complet**
```bash
# Backup du KV Store de prod
deno run backup_kv_prod.tsx

# Backup de la base SQL (si ancienne version)
pg_dump > backup_prod_$(date +%Y%m%d).sql
```

**Étape 2 : Activer mode maintenance**
```typescript
// Dans App.tsx, ajouter temporairement :
if (true) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Maintenance en cours</h1>
        <p>L'application sera de retour dans 30 minutes.</p>
      </div>
    </div>
  );
}
```

**Étape 3 : Déployer les migrations SQL**
```bash
# Sur le projet de production
psql "postgresql://postgres:[PASSWORD]@db.[prod-id].supabase.co:5432/postgres" \
  -f migration_sql_relationnel.sql
```

**Étape 4 : Migrer les données**
```bash
# Pointer vers la prod
export SUPABASE_URL=https://[prod-id].supabase.co
export SUPABASE_SERVICE_ROLE_KEY=[prod-service-key]

# Lancer la migration
deno run --allow-net --allow-env migration_donnees_kv_vers_sql.tsx
```

**Étape 5 : Déployer le nouveau code backend**
```bash
# Via Supabase CLI
supabase functions deploy make-server-abb8d15d

# Ou via Dashboard (upload zip)
```

**Étape 6 : Déployer le frontend**
```bash
# Selon votre méthode (Vercel, Netlify, etc.)
vercel --prod
# ou
netlify deploy --prod
```

**Étape 7 : Tests de fumée**
```bash
# Tester les endpoints critiques
curl https://[prod].supabase.co/functions/v1/make-server-abb8d15d/health
curl -H "Authorization: Bearer [token]" \
  https://[prod].supabase.co/functions/v1/make-server-abb8d15d/profile
```

**Étape 8 : Désactiver mode maintenance**
```typescript
// Retirer le code de maintenance dans App.tsx
// Redéployer le frontend
```

**Étape 9 : Monitoring**
- Surveiller les logs Supabase pendant 1h
- Vérifier les erreurs dans Sentry (si configuré)
- Demander aux utilisateurs de tester

---

## 🔄 Plan de rollback

Si problème critique en production :

### Rollback immédiat (< 5 min)

**Option A : Rollback code uniquement**
```bash
# Redéployer l'ancienne version du code (avec KV store)
git checkout [previous-commit]
supabase functions deploy make-server-abb8d15d
vercel --prod  # ou votre méthode de déploiement
```

**Option B : Rollback complet (données + code)**
```bash
# 1. Restaurer le backup KV
deno run restore_kv_backup.tsx backup_prod_[date].json

# 2. Rollback code (comme Option A)

# 3. DROP les nouvelles tables SQL (optionnel)
DROP TABLE IF EXISTS phishing_recipients CASCADE;
DROP TABLE IF EXISTS phishing_campaigns CASCADE;
DROP TABLE IF EXISTS phishing_templates CASCADE;
-- ... toutes les tables
```

---

## 📊 Monitoring post-migration

### Métriques à surveiller

**Performance** :
```sql
-- Temps de réponse moyen des requêtes
SELECT 
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Volumétrie** :
```sql
-- Taille des tables
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Index non utilisés** :
```sql
-- Identifier les index inutiles
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE '%_pkey';
```

---

## ✅ Checklist finale

### Avant migration
- [ ] Backup KV Store créé
- [ ] Environnement de staging prêt
- [ ] Tables SQL créées en staging
- [ ] Script de migration testé en staging
- [ ] Code backend refactoré et testé
- [ ] Tests frontend passés
- [ ] Plan de rollback documenté
- [ ] Utilisateurs prévenus de la maintenance

### Pendant migration
- [ ] Mode maintenance activé
- [ ] Backup prod créé
- [ ] Tables SQL créées en prod
- [ ] Données migrées
- [ ] Code backend déployé
- [ ] Frontend déployé
- [ ] Tests de fumée passés
- [ ] Mode maintenance désactivé

### Après migration
- [ ] Monitoring actif (1h minimum)
- [ ] Aucune erreur critique
- [ ] Performance OK (< 200ms par requête)
- [ ] Utilisateurs confirmés OK
- [ ] Documentation mise à jour
- [ ] Ancien code KV archivé (ne pas supprimer !)

---

## 🎓 Ressources

### Documentation
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [SQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

### Outils
- [pgAdmin](https://www.pgadmin.org/) - GUI PostgreSQL
- [DBeaver](https://dbeaver.io/) - Universal DB tool
- [Supabase CLI](https://supabase.com/docs/guides/cli)

---

## 💬 Support

En cas de problème :

1. **Vérifier les logs** : Supabase Dashboard → Logs
2. **Vérifier les erreurs** : Console navigateur (F12)
3. **Consulter ce guide** : Section "Problèmes courants"
4. **Rollback si critique** : Suivre le plan de rollback

---

## 📝 Notes importantes

⚠️ **À faire** :
- Garder le code KV store pendant 3-6 mois (backup)
- Documenter les changements d'API
- Former l'équipe à PostgreSQL

✅ **Bénéfices attendus** :
- Performance : **10-50x plus rapide**
- Maintenance : **2x plus simple**
- Évolutivité : **Illimitée**
- Fiabilité : **99.99% uptime**

🎉 **Bonne migration !**
