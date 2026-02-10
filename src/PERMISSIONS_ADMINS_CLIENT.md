# 🔐 Gestion des Permissions des Administrateurs Client

## ✅ Nouvelle Fonctionnalité (v1.0)

Depuis la version 1.0, les **Administrateurs Client** ont des **permissions modulables** ! 

Auparavant, tous les Admins Client avaient automatiquement accès à tous les modules RGPD. Maintenant, vous pouvez personnaliser leurs accès lors de la création ou modification.

---

## 🎯 Pourquoi cette évolution ?

### Cas d'usage typiques :

1. **Admin Client "Lecture seule"**
   - Un responsable qui veut consulter les données sans pouvoir modifier
   - Désactiver les modules de Traitements/Violations pour lecture seule

2. **Admin Client "Spécialisé Phishing"**
   - Un responsable sécurité qui ne gère que les campagnes de phishing
   - Activer uniquement le module "Tests de Phishing"

3. **Admin Client "RGPD uniquement"**
   - Un DPO externe qui ne gère que la conformité RGPD classique
   - Désactiver le module "Tests de Phishing"

4. **Admin Client "Complet"** (par défaut)
   - Accès à tous les modules : Registre, Droits, Violations, Phishing

---

## 🛠️ Comment modifier les permissions d'un Admin Client ?

### Étape 1 : Accéder au Panneau d'Administration

1. Connectez-vous en tant que **Super Admin Octopus**
2. Cliquez sur **"Panneau d'Administration"**
3. Allez dans l'onglet **"Administrateurs client"**

### Étape 2 : Créer un nouvel Admin Client

1. Cliquez sur **"Nouvel administrateur"**
2. Remplissez les informations (Client, Nom, Email, Mot de passe)
3. **Section "Permissions de l'administrateur"** :
   - ☑️ **Registre des Traitements** (gestion des activités de traitement)
   - ☑️ **Exercices de Droits** (demandes RGPD des personnes concernées)
   - ☑️ **Violations de Données** (incidents de sécurité)
   - ☑️ **Tests de Phishing** ⭐ NOUVEAU (campagnes de sensibilisation)
4. **Par défaut**, toutes les permissions sont cochées
5. **Décochez** celles que vous ne voulez pas activer
6. Cliquez sur **"Créer l'administrateur"**

### Étape 3 : Modifier un Admin Client existant

1. Dans la liste des admins, cliquez sur l'icône **Crayon** (Modifier)
2. Vous pouvez modifier :
   - Le **nom** de l'admin
   - Les **permissions** (cocher/décocher chaque module)
3. Les permissions cochées apparaissent comme badges sous le nom de l'admin
4. Cliquez sur **"Enregistrer"**

---

## 📋 Liste des Permissions

| Permission | Description | Par défaut | Peut être retirée |
|-----------|-------------|-----------|------------------|
| **Registre des Traitements** | Accès au module de gestion des activités de traitement RGPD | ✅ Activé | ✅ Oui |
| **Exercices de Droits** | Accès aux demandes d'exercice de droits (accès, rectification, effacement...) | ✅ Activé | ✅ Oui |
| **Violations de Données** | Accès au module de gestion des incidents de sécurité | ✅ Activé | ✅ Oui |
| **Tests de Phishing** | Accès au module de campagnes de phishing interne | ✅ Activé | ✅ Oui |
| **Gestion des Utilisateurs** | Gestion des utilisateurs de son organisation | ✅ Toujours actif | ❌ Non (réservé aux Admins) |

---

## ⚙️ Impact des modifications

### Retirer une permission

Lorsque vous **décochez** une permission pour un Admin Client :

1. **Effet immédiat** : L'onglet correspondant disparaît de son dashboard
2. **Tentative d'accès** : Si l'admin essaie d'accéder directement à la route, il recevra une erreur "Permission denied"
3. **Données existantes** : Les données restent intactes, seul l'accès est bloqué

### Réactiver une permission

Lorsque vous **recochez** une permission :

1. **Effet immédiat** : L'onglet réapparaît dans le dashboard
2. **Accès restauré** : L'admin retrouve l'accès à toutes les données du module
3. **Aucune perte de données** : Tout est restauré comme avant

---

## 🎓 Exemples de Configurations

### Configuration 1 : Admin Phishing Spécialisé

```
Nom : Sarah Martin (Responsable Sécurité)
Permissions :
  ☐ Registre des Traitements
  ☐ Exercices de Droits
  ☐ Violations de Données
  ☑️ Tests de Phishing ⭐
```

**Résultat** : Sarah ne voit que l'onglet "Tests de Phishing" et "Gestion des Utilisateurs"

---

### Configuration 2 : DPO Externe (sans Phishing)

```
Nom : Jean Dupont (DPO Externe)
Permissions :
  ☑️ Registre des Traitements
  ☑️ Exercices de Droits
  ☑️ Violations de Données
  ☐ Tests de Phishing
```

**Résultat** : Jean a accès à tout sauf au module Phishing (car c'est géré en interne)

---

### Configuration 3 : Admin Complet (par défaut)

```
Nom : Marie Dubois (Responsable Conformité)
Permissions :
  ☑️ Registre des Traitements
  ☑️ Exercices de Droits
  ☑️ Violations de Données
  ☑️ Tests de Phishing
```

**Résultat** : Marie a accès à tous les modules (configuration par défaut)

---

## 🔒 Sécurité et Bonnes Pratiques

### Principe du moindre privilège

Suivez le principe du **moindre privilège** :
- Ne donnez que les permissions **nécessaires** pour le rôle de chaque admin
- Révisez régulièrement les permissions accordées
- Désactivez immédiatement les accès en cas de départ ou changement de rôle

### Audit et traçabilité

- Toutes les modifications de permissions sont tracées (à venir dans v1.1)
- Les accès aux modules sont journalisés côté serveur
- En cas d'incident, vous pouvez revoir qui avait accès à quoi

### Recommandations

1. **Pour les DPO externes** : Désactiver le Phishing (souvent géré en interne)
2. **Pour les responsables sécurité** : Activer uniquement Phishing + Violations
3. **Pour les admins complets** : Tout activer (configuration par défaut)
4. **Pour les consultants temporaires** : N'activer que ce dont ils ont besoin

---

## 🐛 Dépannage

### ❌ "Je ne vois plus l'onglet Tests de Phishing"

**Cause** : Un Super Admin Octopus a désactivé votre permission Phishing

**Solution** : Contactez votre Super Admin pour réactiver la permission

---

### ❌ "Erreur 403 - Permission denied"

**Cause** : Vous essayez d'accéder à un module pour lequel vous n'avez pas la permission

**Solution** : 
1. Allez dans votre onglet **"Profil"**
2. Vérifiez vos permissions actives (badges affichés)
3. Contactez le Super Admin si vous avez besoin d'une permission supplémentaire

---

### ❌ "Je ne peux pas modifier les permissions d'un Admin Client"

**Cause** : Vous n'êtes pas Super Admin Octopus

**Solution** : Seuls les Super Admins peuvent modifier les permissions des Admins Client

---

## 📊 Tableau Récapitulatif des Rôles

| Rôle | Peut créer | Peut modifier | Permissions modifiables |
|------|-----------|---------------|------------------------|
| **Super Admin Octopus** | Admins Client | Admins Client | ✅ Oui (Registre, Droits, Violations, Phishing) |
| **Admin Client** | Utilisateurs Standard | Utilisateurs Standard | ✅ Oui (Registre, Droits, Violations, Phishing) |
| **Utilisateur Standard** | Personne | Personne | ❌ Non |

---

## 🎉 Changelog

### v1.0 (Décembre 2025)
- ✅ Ajout de la permission "Tests de Phishing"
- ✅ Permissions modulables pour les Admins Client
- ✅ Interface de création/modification avec checkboxes
- ✅ Badges de permissions dans les listes
- ✅ Vérification côté serveur (routes protégées)

### v1.1 (À venir)
- 📋 Historique des modifications de permissions
- 📧 Notifications par email lors de changements de permissions
- 📊 Rapport d'audit des accès par module

---

**Questions ou suggestions ?** Contactez le support Octopus Data & Privacy ! 🐙
