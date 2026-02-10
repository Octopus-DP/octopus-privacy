# 🚀 Optimisations de Production - Octopus Data & Privacy

Ce document décrit les optimisations implémentées pour préparer l'application au passage en production.

## 📋 Table des matières

1. [Cache serveur](#cache-serveur)
2. [Archivage automatique](#archivage-automatique)
3. [Structure de données optimisée](#structure-de-données-optimisée)
4. [Monitoring & Administration](#monitoring--administration)
5. [Guide de maintenance](#guide-de-maintenance)

---

## 🎯 Cache Serveur

### Implémentation

**Fichier:** `/supabase/functions/server/cache.tsx`

Un système de cache en mémoire avec gestion automatique du TTL (Time To Live).

### Fonctionnalités

✅ **Cache intelligent par type de données :**
- Clients : 10 minutes (rarement modifiés)
- Utilisateurs : 5 minutes
- Données RGPD (traitements, demandes, violations) : 2 minutes
- Listes : 1 minute

✅ **Invalidation automatique :**
- Lors des modifications (create, update, delete)
- Nettoyage automatique toutes les 5 minutes
- Invalidation par préfixe pour supprimer les caches liés

✅ **Statistiques en temps réel :**
- Nombre d'entrées en cache
- Hits / Misses
- Taux de succès (hit rate)

### Utilisation

```typescript
import { cache, TTL, CacheKeys } from './cache.tsx';

// Récupérer du cache
const cached = cache.get(CacheKeys.client(clientId));
if (cached) {
  return cached;
}

// Stocker dans le cache
const data = await kv.get(`client:${clientId}`);
cache.set(CacheKeys.client(clientId), data, TTL.CLIENT);

// Invalider le cache
cache.invalidate(CacheKeys.client(clientId));
cache.invalidateByPrefix('traitements:list:');
```

### Accès Admin

Dashboard Admin → Onglet "Paramètres" → Section "Cache Serveur"

**Actions disponibles :**
- Consulter les statistiques du cache
- Vider le cache manuellement

---

## 📦 Archivage Automatique

### Implémentation

**Fichier:** `/supabase/functions/server/archiver.tsx`

Système d'archivage de l'historique ancien (> 2 ans) dans Supabase Storage.

### Fonctionnalités

✅ **Archivage par année :**
- Structure : `module/clientId/année/history.json`
- Bucket privé : `make-abb8d15d-archives`
- Format JSON pour faciliter la récupération

✅ **Optimisation de la base de données :**
- Suppression automatique du KV store après archivage réussi
- Réduit la taille de la table principale
- Améliore les performances des requêtes

✅ **Sécurité :**
- Archives chiffrées par Supabase
- Accès uniquement via API avec authentification admin
- Historique jamais perdu, juste déplacé

### Politique d'archivage

**Seuil :** Historique > 2 ans

**Modules concernés :**
- `traitement_history`
- `demande_history`
- `violation_history`

### Utilisation

**Archivage manuel (recommandé 1x/an) :**

```bash
# Via l'interface admin
Dashboard Admin → Paramètres → "Archiver maintenant"

# Ou via API
POST /admin/archive/all
Headers: Authorization: Bearer {adminToken}
```

**Archivage automatique (CRON recommandé) :**

```javascript
// Exemple de tâche CRON (à configurer dans votre infrastructure)
// Chaque 1er janvier à 2h du matin
0 2 1 1 * curl -X POST \
  https://{projectId}.supabase.co/functions/v1/make-server-abb8d15d/admin/archive/all \
  -H "Authorization: Bearer {adminToken}"
```

### Récupération des archives

```bash
# Lister les années archivées
GET /admin/archive/{module}/{clientId}/years

# Récupérer une archive spécifique
GET /admin/archive/{module}/{clientId}/{year}
```

---

## 📊 Structure de Données Optimisée

### Convention de nommage des clés

```
# Données principales
client:{clientId}
user:{userId}
user_email:{email}

# Données RGPD
traitement:{clientId}:{traitementId}
demande:{clientId}:{demandeId}
violation:{clientId}:{violationId}

# Historique (actif, < 2 ans)
traitement_history:{clientId}:{traitementId}:{timestamp}
demande_history:{clientId}:{demandeId}:{timestamp}
violation_history:{clientId}:{violationId}:{timestamp}

# Entités juridiques
legal_entity:{entityId}
```

### Avantages de cette structure

✅ **Récupération efficace par préfixe :**
```javascript
// Tous les traitements d'un client
await kv.getByPrefix(`traitement:${clientId}:`);
```

✅ **Isolation naturelle par client :**
- Pas de requêtes cross-client
- Sécurité renforcée

✅ **Scalabilité :**
- Jusqu'à ~500k entrées sans problème
- Compatible avec PostgreSQL indexing

---

## 🖥️ Monitoring & Administration

### Dashboard Admin

**Accès :** Dashboard Admin → Onglet "Paramètres"

#### Section 1 : Cache Serveur

**Métriques affichées :**
- Taille du cache (nombre d'entrées)
- Hits (requêtes servies par le cache)
- Misses (requêtes manquées)
- Hit Rate (taux de succès)

**Objectif :** Hit Rate > 70%

**Actions :**
- Vider le cache (en cas de données obsolètes)
- Consulter les statistiques

#### Section 2 : Archivage

**Métriques affichées :**
- Nombre de fichiers archivés
- Espace utilisé (MB)
- Dernière exécution

**Actions :**
- Archiver maintenant (manuel)
- Consulter les résultats d'archivage
- Statistiques par module

---

## 🔧 Guide de Maintenance

### Tâches Quotidiennes

✅ **Automatiques (aucune action requise) :**
- Nettoyage du cache (toutes les 5 min)
- Invalidation cache lors des modifications

### Tâches Mensuelles

⚠️ **Recommandées :**
- Vérifier les statistiques du cache (hit rate)
- Surveiller l'espace disque (KV store et Storage)

### Tâches Annuelles

🔴 **Obligatoires :**
- Archiver l'historique ancien (1x/an minimum)
- Vérifier l'intégrité des archives

### Commandes utiles

```bash
# Statistiques du cache
GET /admin/cache/stats

# Vider le cache
POST /admin/cache/clear

# Archiver tout l'historique ancien
POST /admin/archive/all

# Archiver un client spécifique
POST /admin/archive/{clientId}

# Statistiques des archives
GET /admin/archive/stats
```

---

## 📈 Limites & Recommandations

### Limites actuelles (KV Store)

| Métrique | Limite | Recommandation |
|----------|--------|----------------|
| Entrées totales | ~500k | Migrer si > 200k |
| Taille par entrée | 4MB | OK pour données RGPD |
| Requêtes/seconde | ~1000 | OK pour < 1000 users |
| Hit Rate cache | > 70% | Optimal |

### Signaux d'alerte

🚨 **Migrer vers tables SQL si :**
- Plus de 200 clients actifs
- Plus de 100k entrées par module
- Hit rate < 50% sur 1 mois
- Temps de réponse > 500ms régulièrement
- Besoin de requêtes complexes (JOIN, GROUP BY)

### Migration progressive

Si nécessaire, voici le plan de migration recommandé :

1. **Phase 1 :** Créer tables SQL pour clients/users
2. **Phase 2 :** Migrer les métadonnées (garder contenu en JSONB)
3. **Phase 3 :** Ajouter index et optimiser les requêtes
4. **Phase 4 :** Migrer le contenu si nécessaire

---

## 🎯 Performances attendues

### Avec cache activé

| Opération | Temps moyen | Objectif |
|-----------|-------------|----------|
| Liste traitements | < 50ms | < 100ms |
| Création traitement | < 200ms | < 500ms |
| Historique | < 100ms | < 200ms |
| Dashboard client | < 300ms | < 500ms |

### Sans cache (cold start)

| Opération | Temps moyen | Objectif |
|-----------|-------------|----------|
| Liste traitements | < 200ms | < 500ms |
| Création traitement | < 300ms | < 1s |
| Historique | < 300ms | < 500ms |

---

## 📞 Support

Pour toute question sur les optimisations :

1. Consulter ce document
2. Vérifier les logs serveur (Supabase Dashboard → Edge Functions)
3. Tester avec les routes de monitoring (`/admin/cache/stats`, `/admin/archive/stats`)

---

## 📝 Changelog

### Version 1.0 (Novembre 2024)

✅ **Ajouté :**
- Cache serveur en mémoire avec TTL
- Archivage automatique dans Storage
- Dashboard admin pour monitoring
- Routes API admin pour cache et archives
- Documentation complète

🔄 **À venir :**
- Pagination frontend (actuellement backend ready)
- Métriques de performance temps réel
- Alertes automatiques sur seuils
- Export des statistiques en CSV

---

**Dernière mise à jour :** Novembre 2024  
**Auteur :** Équipe Octopus Data & Privacy
