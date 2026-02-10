# 📚 Index de la Documentation - Octopus Data & Privacy

**Dernière mise à jour** : 2024-12-04

Bienvenue ! Ce fichier vous guide vers la bonne documentation selon votre besoin.

---

## 🎯 Par où commencer ?

### Vous êtes nouveau sur le projet ?

➡️ **Commencez par :** [README.md](./README.md) (2 min)

Ensuite :
1. [GUIDE_DEMARRAGE.md](./GUIDE_DEMARRAGE.md) (15 min)
2. [DEPLOIEMENT.md](./DEPLOIEMENT.md) si vous voulez déployer

---

### Vous voulez déployer en production ?

➡️ **Consultez :**
1. [DEPLOIEMENT.md](./DEPLOIEMENT.md) - Guide complet de déploiement
2. [CHECKLIST_DEPLOIEMENT.md](./CHECKLIST_DEPLOIEMENT.md) - Checklist finale

---

### Vous cherchez à optimiser ou migrer ?

➡️ **Migration vers SQL ⭐ (Recommandé)** :
1. [MIGRATION_README.md](./MIGRATION_README.md) - **Commencez ici !** (15 min)
2. [GUIDE_MIGRATION_SQL.md](./GUIDE_MIGRATION_SQL.md) - Guide complet (1h)
3. [schema_base_donnees.md](./schema_base_donnees.md) - Architecture SQL
4. [exemples_requetes_sql.md](./exemples_requetes_sql.md) - Requêtes utiles

---

## 📂 Toute la documentation par catégorie

### 🚀 Démarrage & Général

| Fichier | Description | Priorité | Durée lecture |
|---------|-------------|----------|---------------|
| [README.md](./README.md) | Vue d'ensemble du projet | ⭐⭐⭐ | 2 min |
| [GUIDE_DEMARRAGE.md](./GUIDE_DEMARRAGE.md) | Guide utilisateur complet | ⭐⭐⭐ | 15 min |
| [QUICK_START.md](./QUICK_START.md) | Démarrage rapide | ⭐⭐ | 5 min |

---

### 🗄️ Base de données & Architecture

#### ⚠️ Note importante sur l'architecture

L'application supporte **deux architectures** :

| Architecture | Statut | Recommandation |
|-------------|--------|----------------|
| **KV Store** | ⚙️ Actuelle | Pour les projets existants |
| **PostgreSQL relationnel** | 🆕 Nouveau | ✅ **Recommandé pour tous** |

#### Documentation Architecture

| Fichier | Architecture | Description | Priorité |
|---------|-------------|-------------|----------|
| **Migration vers SQL** ||||
| [MIGRATION_README.md](./MIGRATION_README.md) | SQL | 🆕 Quick Start migration | ⭐⭐⭐ |
| [GUIDE_MIGRATION_SQL.md](./GUIDE_MIGRATION_SQL.md) | SQL | 🆕 Guide complet (5 phases) | ⭐⭐⭐ |
| [schema_base_donnees.md](./schema_base_donnees.md) | SQL | 🆕 Diagramme & architecture | ⭐⭐⭐ |
| [exemples_requetes_sql.md](./exemples_requetes_sql.md) | SQL | 🆕 50+ requêtes SQL | ⭐⭐ |
| **Optimisations** ||||
| [OPTIMISATIONS_PRODUCTION.md](./OPTIMISATIONS_PRODUCTION.md) | KV Store | Cache et performances | ⭐⭐ |

---

### 🚀 Déploiement & Configuration

| Fichier | Description | Priorité | Durée |
|---------|-------------|----------|-------|
| [DEPLOIEMENT.md](./DEPLOIEMENT.md) | Guide déploiement Vercel/Netlify | ⭐⭐⭐ | 20 min |
| [DEPLOIEMENT_RAPIDE.md](./DEPLOIEMENT_RAPIDE.md) | Version rapide | ⭐⭐ | 5 min |
| [CHECKLIST_DEPLOIEMENT.md](./CHECKLIST_DEPLOIEMENT.md) | Checklist avant prod | ⭐⭐⭐ | 10 min |
| [TEST_LOCAL.md](./TEST_LOCAL.md) | Tests en local | ⭐⭐ | 10 min |

---

### 📧 Module Phishing

| Fichier | Description | Priorité | Durée |
|---------|-------------|----------|-------|
| [ACCES_MODULE_PHISHING.md](./ACCES_MODULE_PHISHING.md) | Accéder au module | ⭐⭐⭐ | 5 min |
| [PHISHING_SETUP.md](./PHISHING_SETUP.md) | Configuration complète | ⭐⭐⭐ | 15 min |
| [CONFIGURATION_MAILJET.md](./CONFIGURATION_MAILJET.md) | Config emails Mailjet | ⭐⭐⭐ | 10 min |
| [VARIABLES_TEMPLATES_PHISHING.md](./VARIABLES_TEMPLATES_PHISHING.md) | Variables disponibles | ⭐⭐ | 5 min |
| [PhishingEmailHelp](./components/PhishingEmailHelp.tsx) | Aide intégrée (composant) | ⭐ | - |

---

### 🔧 Dépannage & Debug

| Fichier | Description | Quand l'utiliser | Priorité |
|---------|-------------|------------------|----------|
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Problèmes généraux | Erreur générale | ⭐⭐⭐ |
| [DEPANNAGE_PHISHING_EMAIL.md](./DEPANNAGE_PHISHING_EMAIL.md) | Emails non reçus | Problème phishing | ⭐⭐⭐ |
| [DIAGNOSTIC_PHISHING.md](./DIAGNOSTIC_PHISHING.md) | Diagnostic complet phishing | Debug approfondi | ⭐⭐ |
| [FIX_PHISHING_RAPIDE.md](./FIX_PHISHING_RAPIDE.md) | Correctifs rapides phishing | Fix urgent | ⭐⭐ |
| [LOGS_PHISHING_EXPLICATIONS.md](./LOGS_PHISHING_EXPLICATIONS.md) | Comprendre les logs | Analyse logs | ⭐⭐ |

---

### 👥 Gestion Utilisateurs & Permissions

| Fichier | Description | Priorité | Durée |
|---------|-------------|----------|-------|
| [PERMISSIONS_ADMINS_CLIENT.md](./PERMISSIONS_ADMINS_CLIENT.md) | Système de permissions | ⭐⭐⭐ | 10 min |
| [GUIDE_DEMARRAGE.md](./GUIDE_DEMARRAGE.md#gestion-des-permissions) | Section permissions | ⭐⭐ | 5 min |

---

### 📝 Historique & Releases

| Fichier | Description | Priorité | Durée |
|---------|-------------|----------|-------|
| [NOUVELLES_FONCTIONNALITES.md](./NOUVELLES_FONCTIONNALITES.md) | Changelog des nouveautés | ⭐⭐ | 5 min |
| [CORRECTIONS_APPLIQUEES.md](./CORRECTIONS_APPLIQUEES.md) | Correctifs appliqués | ⭐ | 3 min |

---

### 🛠️ Technique & Développement

| Fichier | Description | Audience | Priorité |
|---------|-------------|----------|----------|
| [EXPORT_FIGMA.md](./EXPORT_FIGMA.md) | Export depuis Figma | Designers | ⭐ |
| [Attributions.md](./Attributions.md) | Licences et crédits | Légal | ⭐ |

---

## 🗺️ Parcours recommandés

### Pour un nouvel utilisateur

```
1. README.md                     (2 min)
2. GUIDE_DEMARRAGE.md           (15 min)
3. Configuration Supabase        (10 min)
4. Premier client & utilisateur  (5 min)
```

**Total : ~30 minutes** ⏱️

---

### Pour un administrateur qui déploie

```
1. README.md                     (2 min)
2. DEPLOIEMENT.md               (20 min)
3. CONFIGURATION_MAILJET.md     (10 min)
4. CHECKLIST_DEPLOIEMENT.md     (10 min)
5. Tests en production           (30 min)
```

**Total : ~1h15** ⏱️

---

### Pour migrer vers SQL

```
1. MIGRATION_README.md           (15 min)  ← Quick Start
2. GUIDE_MIGRATION_SQL.md        (1h)      ← Guide complet
3. Créer tables SQL              (5 min)
4. Migrer données                (30 min)
5. Refactorer backend            (2-3h)
6. Tests                         (1h)
```

**Total : ~4-6 heures** ⏱️

---

### Pour configurer le phishing

```
1. ACCES_MODULE_PHISHING.md      (5 min)
2. CONFIGURATION_MAILJET.md      (10 min)
3. PHISHING_SETUP.md            (15 min)
4. Créer première campagne       (10 min)
5. VARIABLES_TEMPLATES_PHISHING  (5 min)
```

**Total : ~45 minutes** ⏱️

---

## 🔍 Recherche rapide

### "Je cherche à..."

| Objectif | Fichier(s) à consulter |
|----------|------------------------|
| **Installer le projet** | [README.md](./README.md) → [GUIDE_DEMARRAGE.md](./GUIDE_DEMARRAGE.md) |
| **Déployer en production** | [DEPLOIEMENT.md](./DEPLOIEMENT.md) |
| **Configurer les emails** | [CONFIGURATION_MAILJET.md](./CONFIGURATION_MAILJET.md) |
| **Créer une campagne phishing** | [PHISHING_SETUP.md](./PHISHING_SETUP.md) |
| **Résoudre un bug** | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) |
| **Migrer vers SQL** | [MIGRATION_README.md](./MIGRATION_README.md) ⭐ |
| **Comprendre l'architecture** | [schema_base_donnees.md](./schema_base_donnees.md) |
| **Optimiser les performances** | [OPTIMISATIONS_PRODUCTION.md](./OPTIMISATIONS_PRODUCTION.md) |
| **Gérer les permissions** | [PERMISSIONS_ADMINS_CLIENT.md](./PERMISSIONS_ADMINS_CLIENT.md) |

---

## ⚠️ Notes importantes

### Architecture en transition

> ⚠️ **Important** : L'application utilise actuellement une architecture **KV Store**.  
> Une migration vers **PostgreSQL relationnel** est disponible et **fortement recommandée**.
> 
> **Pour migrer** : Consultez [MIGRATION_README.md](./MIGRATION_README.md)

---

### Documentation obsolète après migration SQL

Après la migration vers SQL, ces fichiers nécessiteront une mise à jour :

- ⚠️ [README.md](./README.md) - Ligne 22 (mention KV Store)
- ⚠️ [GUIDE_DEMARRAGE.md](./GUIDE_DEMARRAGE.md) - Section architecture
- ⚠️ [OPTIMISATIONS_PRODUCTION.md](./OPTIMISATIONS_PRODUCTION.md) - Exemples KV

**Détails :** Voir [AUDIT_DOCUMENTATION.md](./AUDIT_DOCUMENTATION.md)

---

## 📊 Statistiques de la documentation

| Métrique | Valeur |
|----------|--------|
| **Fichiers totaux** | 23 fichiers MD |
| **Pages totales** | ~150 pages |
| **Temps lecture complet** | ~4-5 heures |
| **Guides principaux** | 6 |
| **Guides techniques** | 8 |
| **Guides dépannage** | 5 |
| **Guides migration** | 4 (nouveaux) |

---

## 🆘 Aide

### Documentation manquante ?

Si vous cherchez une information qui n'est pas dans l'index :

1. **Recherche globale** : Utilisez Ctrl+Shift+F dans votre éditeur
2. **Consultez le code** : Les composants sont souvent documentés
3. **Supabase Dashboard** : Pour la configuration base de données
4. **Audit de doc** : [AUDIT_DOCUMENTATION.md](./AUDIT_DOCUMENTATION.md)

---

### Documentation à améliorer ?

**Contribuez** en :
1. Signalant les erreurs ou imprécisions
2. Proposant des améliorations
3. Ajoutant des exemples

---

## 🔄 Mise à jour de cet index

Cet index est maintenu manuellement. Après chaque :
- ✅ Ajout de documentation
- ✅ Migration majeure (ex: SQL)
- ✅ Changement d'architecture

Pensez à mettre à jour :
1. La liste des fichiers
2. Les parcours recommandés
3. La section "Recherche rapide"

---

## 📞 Support

Pour toute question :
1. Consultez d'abord cet index
2. Recherchez dans [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. Vérifiez les logs de l'application
4. Consultez la documentation Supabase

---

**Bonne documentation ! 📚**

---

**Dernière révision** : 2024-12-04  
**Version** : 1.0  
**Maintenu par** : Octopus Data & Privacy
