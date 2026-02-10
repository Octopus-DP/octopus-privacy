# 🗄️ Migration vers PostgreSQL - Octopus Data & Privacy

## 📦 Contenu de ce package de migration

Ce dossier contient tous les fichiers nécessaires pour migrer votre application du système KV Store actuel vers une base de données PostgreSQL relationnelle.

---

## 📄 Fichiers inclus

### 1. **migration_sql_relationnel.sql** (⭐ Principal)
```
Schéma SQL complet avec :
- 12 tables relationnelles
- Indexes optimisés
- Contraintes d'intégrité (FK, CHECK)
- Vues statistiques
- Triggers automatiques
- Fonctions utilitaires
```

**À exécuter en premier** dans Supabase SQL Editor

---

### 2. **migration_donnees_kv_vers_sql.tsx** (⭐ Principal)
```
Script Deno pour migrer les données :
- Lit toutes les données du KV store
- Les transforme au bon format
- Les insère dans PostgreSQL
- Affiche un rapport détaillé
```

**À exécuter après** avoir créé les tables

---

### 3. **GUIDE_MIGRATION_SQL.md** (📖 Documentation)
```
Guide complet étape par étape :
- Pourquoi migrer ? (avantages/inconvénients)
- Prérequis
- 5 phases de migration détaillées
- Plan de rollback
- Monitoring post-migration
- Checklist complète
```

**À lire avant de commencer**

---

### 4. **MIGRATION_README.md** (ce fichier)
```
Vue d'ensemble et démarrage rapide
```

---

## 🚀 Démarrage rapide (Quick Start)

### Étape 1 : Créer les tables (5 min)

```bash
# Option A : Via Supabase Dashboard
1. Ouvrez https://supabase.com/dashboard/project/[votre-project-id]/editor
2. Cliquez sur "New query"
3. Copiez-collez le contenu de migration_sql_relationnel.sql
4. Cliquez sur "Run"
5. Vérifiez que les tables sont créées dans l'onglet "Tables"
```

```bash
# Option B : Via psql (ligne de commande)
psql "postgresql://postgres:[PASSWORD]@db.[project-id].supabase.co:5432/postgres" \
  -f migration_sql_relationnel.sql
```

**✅ Vérification** : Vous devez voir 12 nouvelles tables dans Supabase

---

### Étape 2 : Migrer les données (10-30 min)

```bash
# Depuis le dossier racine de votre projet
cd /supabase/functions/server/

# Exécuter le script de migration
deno run --allow-net --allow-env migration_donnees_kv_vers_sql.tsx
```

**Sortie attendue** :
```
====================================================
MIGRATION KV STORE → POSTGRESQL
====================================================

[MIGRATION] Starting clients migration...
[MIGRATION SUCCESS] Clients migrated (5 enregistrements)

[MIGRATION] Starting users migration...
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

**✅ Vérification** : Comptez les enregistrements dans chaque table

```sql
SELECT 
  'clients' as table_name, COUNT(*) FROM clients
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'traitements', COUNT(*) FROM traitements;
-- etc.
```

---

### Étape 3 : Refactorer le code backend (2-3h)

**À faire** :
1. Remplacer tous les `kv.get()` par des requêtes SQL
2. Remplacer tous les `kv.set()` par des `INSERT/UPDATE` SQL
3. Remplacer tous les `kv.getByPrefix()` par des `SELECT` SQL
4. Tester chaque endpoint

**Exemple de refactoring** :

**Avant** :
```typescript
const userId = await kv.get(`user_email:${email}`);
const userData = await kv.get(`user:${userId}`);
```

**Après** :
```typescript
const { data: userData } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single();
```

---

## 🎯 À qui s'adresse cette migration ?

### ✅ Vous devez migrer si :

- Vous avez **plus de 100 utilisateurs** ou **1000+ traitements**
- Vos requêtes `getByPrefix()` sont **lentes** (> 2 secondes)
- Vous avez besoin de **rapports complexes** (statistiques, analytics)
- Vous voulez une **intégrité des données** garantie
- Vous préparez une **mise à l'échelle** (scaling)

### ⏸️ Vous pouvez attendre si :

- Vous avez **moins de 10 clients** et **< 50 utilisateurs**
- Les performances actuelles sont **acceptables**
- Vous n'avez **pas le temps** de faire la migration maintenant

---

## 📊 Schéma de la base de données

### Tables principales

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTS (entreprises)                 │
├─────────────────────────────────────────────────────────┤
│ id, code, name, contact, subscription, features, ...    │
└──────────────────────────┬──────────────────────────────┘
                           │
        ┌──────────────────┴────────────────┬─────────────┐
        │                                   │             │
┌───────▼──────────┐        ┌──────────────▼────┐  ┌─────▼────────┐
│ LEGAL_ENTITIES   │        │      USERS        │  │  TRAITEMENTS │
├──────────────────┤        ├───────────────────┤  ├──────────────┤
│ client_id (FK)   │        │ client_id (FK)    │  │ client_id FK │
│ name, siren, ... │        │ email, role, ...  │  │ entity_id FK │
└──────────────────┘        └───────────────────┘  │ name, ...    │
                                                    └──────────────┘

        ┌─────────────────────┬───────────────────┐
        │                     │                   │
┌───────▼────────┐   ┌────────▼────────┐  ┌──────▼──────────────┐
│   DEMANDES     │   │   VIOLATIONS    │  │ PHISHING_CAMPAIGNS  │
├────────────────┤   ├─────────────────┤  ├─────────────────────┤
│ client_id (FK) │   │ client_id (FK)  │  │ client_id (FK)      │
│ entity_id (FK) │   │ entity_id (FK)  │  │ template_id (FK)    │
│ email, type,.. │   │ severity, ...   │  │ status, stats, ...  │
└────────────────┘   └─────────────────┘  └──────────┬──────────┘
                                                       │
                                          ┌────────────▼──────────┐
                                          │ PHISHING_RECIPIENTS   │
                                          ├───────────────────────┤
                                          │ campaign_id (FK)      │
                                          │ email, opened, ...    │
                                          └───────────────────────┘
```

**Légende** :
- `(FK)` = Clé étrangère (Foreign Key)
- Les relations assurent l'intégrité référentielle

---

## 🔑 Avantages clés de la migration

### 1. Performance ⚡

**Avant (KV Store)** :
```typescript
// Récupérer tous les traitements d'un client
const allTraitements = await kv.getByPrefix('traitement:'); // 5 secondes
const clientTraitements = allTraitements.filter(t => t.clientCode === 'CLIENT001');
```

**Après (SQL)** :
```sql
-- Même requête en SQL
SELECT * FROM traitements WHERE client_code = 'CLIENT001'; -- 50ms
```

**Gain : 100x plus rapide** 🚀

---

### 2. Requêtes complexes 🔍

**Avant (KV Store)** :
```typescript
// Statistiques client : IMPOSSIBLE directement
// Il faut récupérer TOUTES les données et filtrer en mémoire
const allClients = await kv.getByPrefix('client:');
const allUsers = await kv.getByPrefix('user:');
const allTraitements = await kv.getByPrefix('traitement:');
// ... puis filtrer et compter manuellement (lent et complexe)
```

**Après (SQL)** :
```sql
-- Statistiques en 1 seule requête
SELECT 
  c.name,
  COUNT(DISTINCT u.id) as users,
  COUNT(DISTINCT t.id) as traitements
FROM clients c
LEFT JOIN users u ON c.id = u.client_id
LEFT JOIN traitements t ON c.id = t.client_id
GROUP BY c.id, c.name;
```

**Gain : Code 10x plus simple** ✨

---

### 3. Intégrité garantie 🔒

**Avant (KV Store)** :
```typescript
// Rien n'empêche les incohérences
await kv.del(`client:${clientId}`); // Client supprimé
// Mais ses utilisateurs existent toujours ! ❌
// Ses traitements existent toujours ! ❌
```

**Après (SQL)** :
```sql
-- CASCADE automatique
DELETE FROM clients WHERE id = 'client123';
-- → Tous les users du client sont supprimés automatiquement ✅
-- → Tous les traitements du client sont supprimés automatiquement ✅
```

**Gain : Zéro incohérence** 🛡️

---

## 📈 Roadmap suggérée

### Phase 1 : Staging (Semaine 1)
- [ ] Jour 1 : Créer les tables en staging
- [ ] Jour 2 : Migrer les données en staging
- [ ] Jour 3-4 : Refactorer le code backend
- [ ] Jour 5 : Tests complets en staging

### Phase 2 : Validation (Semaine 2)
- [ ] Tests de performance
- [ ] Tests de charge
- [ ] Validation utilisateurs beta
- [ ] Documentation

### Phase 3 : Production (Weekend)
- [ ] Vendredi soir : Backup complet
- [ ] Samedi matin : Migration prod
- [ ] Samedi après-midi : Tests et monitoring
- [ ] Dimanche : Buffer pour résoudre les problèmes

---

## ⚠️ Points d'attention

### Avant de commencer

1. **Backup obligatoire** : Ne JAMAIS migrer sans backup
2. **Environnement de test** : Toujours tester en staging d'abord
3. **Plan de rollback** : Avoir un plan B en cas de problème
4. **Fenêtre de maintenance** : Prévoir 1-2h de downtime

### Pendant la migration

1. **Mode maintenance** : Activer le mode maintenance pendant la migration
2. **Logs actifs** : Surveiller les logs en temps réel
3. **Tests de fumée** : Tester les fonctionnalités critiques immédiatement

### Après la migration

1. **Monitoring 24/7** : Surveiller pendant 24-48h minimum
2. **Ne pas supprimer le KV** : Garder le backup KV pendant 3-6 mois
3. **Documentation** : Documenter les changements pour l'équipe

---

## 🆘 Besoin d'aide ?

### Documentation complète
📖 Consultez **GUIDE_MIGRATION_SQL.md** pour le guide détaillé

### Problèmes courants

**Problème 1 : "relation does not exist"**
```
Solution : Les tables n'ont pas été créées
→ Exécutez migration_sql_relationnel.sql
```

**Problème 2 : "duplicate key value violates unique constraint"**
```
Solution : Données déjà migrées
→ C'est normal si vous relancez la migration (upsert)
```

**Problème 3 : "permission denied for table"**
```
Solution : Utilisez la SERVICE_ROLE_KEY, pas l'ANON_KEY
```

**Problème 4 : Migration très lente (> 5 min)**
```
Solution : Beaucoup de données
→ C'est normal, laissez le script se terminer
```

---

## ✅ Checklist rapide

### Avant de commencer
- [ ] J'ai lu le GUIDE_MIGRATION_SQL.md
- [ ] J'ai un backup du KV Store
- [ ] J'ai un environnement de staging
- [ ] J'ai 4-6 heures devant moi

### Migration
- [ ] Tables SQL créées ✅
- [ ] Données migrées ✅
- [ ] Code backend refactoré ✅
- [ ] Tests passés ✅
- [ ] Monitoring actif ✅

### Production
- [ ] Backup prod fait ✅
- [ ] Utilisateurs prévenus ✅
- [ ] Migration prod réussie ✅
- [ ] Tests de fumée OK ✅
- [ ] Mode maintenance désactivé ✅

---

## 🎉 Conclusion

Cette migration est une **étape importante** pour la scalabilité et la performance de votre application.

**Bénéfices attendus** :
- ⚡ **10-50x plus rapide** sur les requêtes complexes
- 🔒 **Intégrité garantie** des données
- 🚀 **Scalabilité illimitée**
- 🛠️ **Maintenance simplifiée**
- 📊 **Analytics puissants**

**Temps estimé** :
- Préparation : 1h
- Migration données : 30 min
- Refactoring code : 2-3h
- Tests : 1-2h
- **Total : 4-6h**

Bon courage ! 💪

---

## 📞 Support

Pour toute question, consultez :
1. **GUIDE_MIGRATION_SQL.md** (guide complet)
2. **Documentation Supabase** : https://supabase.com/docs
3. **PostgreSQL docs** : https://www.postgresql.org/docs/

---

**Version** : 1.0  
**Date** : 2024-12-04  
**Auteur** : Assistant AI - Octopus Data & Privacy
