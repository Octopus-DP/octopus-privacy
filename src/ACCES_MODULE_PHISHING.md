# 🎣 Accès au Module de Tests de Phishing

## ✅ Configuration Complète

Le module **Tests de Phishing** est maintenant entièrement intégré et accessible via le ClientDashboard !

---

## 🔐 Qui peut accéder au module ?

### 1️⃣ **Administrateurs Client** (role: `client_admin`)
- ⚙️ Accès selon la permission `phishing` définie lors de la création
- ✅ Par défaut, la permission est **activée** lors de la création
- ✅ Peuvent créer, lancer et gérer les campagnes
- 🔧 **IMPORTANT** : Un Super Admin Octopus peut modifier les permissions d'un Admin Client (y compris désactiver le module Phishing)

### 2️⃣ **Utilisateurs Standard** (role: `user`)
- ⚙️ Accès conditionnel selon les permissions
- ✅ Doivent avoir `permissions.phishing = true`
- 👤 Les permissions sont définies par l'Admin Client lors de la création

---

## 📍 Comment accéder au module ?

### Interface Utilisateur

1. **Connexion au portail client** : https://votredomaine.com
2. **Tableau de bord** : Une fois connecté, vous voyez les onglets
3. **Onglet "Tests de Phishing"** 🐟 : Cliquez sur cet onglet dans la navigation principale

### Visibilité de l'onglet

L'onglet **"Tests de Phishing"** n'apparaît que si :
- ✅ Vous êtes un Administrateur Client (`client_admin`), OU
- ✅ Vous êtes un Utilisateur avec `permissions.phishing = true`

Si vous ne voyez pas l'onglet, contactez votre Administrateur Client pour qu'il vous donne les permissions.

---

## 🛠️ Comment donner/retirer les permissions Phishing ?

### Pour les Admins Client (gérer les Utilisateurs Standard)

1. Allez dans l'onglet **"Gestion des Utilisateurs"**
2. Cliquez sur **"Nouvel Utilisateur"** ou **"Modifier"** un utilisateur existant
3. Dans la section **"Accès aux Registres"** :
   - ☑️ Cochez **"Phishing"** pour donner l'accès
   - ☐ Décochez pour retirer l'accès
4. Sauvegardez

### Pour les Super Admins Octopus (gérer les Admins Client)

1. Allez dans le **Panneau d'Administration**
2. Section **"Gestion des Administrateurs Client"**
3. Lors de la **création** d'un Admin Client :
   - ✅ Les 4 permissions sont cochées **par défaut** (Registre, Droits, Violations, **Phishing**)
   - ⚙️ Vous pouvez décocher celles que vous ne voulez pas activer
4. Pour **modifier** un Admin Client existant :
   - Cliquez sur l'icône **Crayon** (Modifier)
   - La section **"Permissions de l'administrateur"** vous permet de cocher/décocher chaque module
   - Sauvegardez les modifications

### ⚠️ Cas particulier : Retirer l'accès Phishing à un Admin Client

Si un Admin Client abuse du module de Phishing ou n'en a plus besoin :
1. Super Admin → Panneau d'Administration
2. Modifier l'Admin Client concerné
3. **Décocher** la permission "Tests de Phishing"
4. Sauvegarder → L'onglet disparaît immédiatement du dashboard de l'Admin Client

---

## 🎯 Fonctionnalités du Module

Une fois dans le module, vous avez accès à :

### 📊 **Tableau de bord principal**
- Vue d'ensemble des campagnes actives
- Statistiques globales
- Campagnes récentes

### 🚀 **Création de campagnes** (Wizard 4 étapes)
1. **Informations générales** : Nom, description, objectif
2. **Destinataires** : Import CSV ou ajout manuel
3. **Modèle d'e-mail** : Sélection du template de phishing
4. **Planification** : Date, mode d'envoi, tracking, RGPD

### 📧 **Gestion des templates**
- Bibliothèque de templates par défaut
- Catégories : IT, Finance, RH, Livraison
- Personnalisation des expéditeurs

### 📈 **Analytics et rapports**
- Taux d'ouverture, de clics, de soumissions
- Statistiques par département
- Export des résultats
- Conformité RGPD

### ⚙️ **Détail des campagnes**
- Suivi en temps réel
- Liste des destinataires et leurs statuts
- Timeline des événements

---

## 🔍 Dépannage

### ❌ **Je ne vois pas l'onglet "Tests de Phishing"**

**Causes possibles** :
1. Vous n'avez pas la permission `phishing`
2. Vous êtes un Utilisateur Standard sans cette permission

**Solution** :
- Contactez votre Administrateur Client
- Demandez l'activation de la permission "Phishing"

### ❌ **Erreur "Permission denied - Phishing access required"**

**Cause** : Vous essayez d'accéder à une fonctionnalité sans permission

**Solution** :
- Vérifiez vos permissions dans l'onglet "Profil"
- Contactez votre Administrateur Client

### ❌ **L'onglet apparaît mais les données ne chargent pas**

**Causes possibles** :
1. Problème de connexion au backend
2. Token d'authentification expiré

**Solution** :
- Déconnectez-vous et reconnectez-vous
- Videz le cache du navigateur
- Si le problème persiste, contactez le support technique

---

## 📚 Structure des Permissions

```javascript
// Administrateur Client (configurable depuis v1.0)
{
  role: 'client_admin',
  permissions: {
    registre: true,     // ⚙️ Configurable (défaut: activé)
    droits: true,       // ⚙️ Configurable (défaut: activé)
    violations: true,   // ⚙️ Configurable (défaut: activé)
    phishing: true,     // ⚙️ Configurable (défaut: activé) ⭐ NOUVEAU
    users: true         // ✅ Toujours actif (gestion des users)
  }
}

// Utilisateur Standard (configurable)
{
  role: 'user',
  permissions: {
    registre: true,     // ⚙️ Configurable (défaut: activé)
    droits: true,       // ⚙️ Configurable (défaut: activé)
    violations: true,   // ⚙️ Configurable (défaut: activé)
    phishing: true,     // ⚙️ Configurable (défaut: activé) ⭐ NOUVEAU
  }
}
```

### 🔑 Notes importantes

1. **Par défaut**, toutes les permissions sont activées lors de la création
2. Les **Super Admins Octopus** peuvent modifier les permissions des **Admins Client**
3. Les **Admins Client** peuvent modifier les permissions des **Utilisateurs Standard**
4. La permission **`users`** est réservée aux Admins Client et ne peut pas être retirée

---

## 🎓 Formation et Support

### Documentation complète
- **Configuration Mailjet** : `/PHISHING_SETUP.md`
- **Guide utilisateur** : Dans l'application (onglet "Aide")

### Support technique
- 📧 Email : support@octopusdataprivacy.com
- 📞 Téléphone : [Votre numéro]
- 💬 Chat : Dans l'application (coin inférieur droit)

---

## ✨ Nouveautés et Mises à jour

### Version 1.0 (Décembre 2025)
- ✅ Module Phishing complet
- ✅ 12 templates par défaut
- ✅ Wizard de création 4 étapes
- ✅ Analytics en temps réel
- ✅ Conformité RGPD intégrée
- ✅ Intégration Mailjet pour l'envoi d'emails
- ✅ Système de permissions granulaires

---

**Bonne utilisation du module Tests de Phishing !** 🎣
