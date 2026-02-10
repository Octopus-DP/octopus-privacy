# 🚀 Guide de Démarrage - Octopus Data & Privacy

> 📚 **Navigation** : Ce guide fait partie de la documentation complète. Consultez l'[INDEX](./DOCUMENTATION_INDEX.md) pour naviguer facilement.

> ⚠️ **Architecture** : Ce guide décrit l'utilisation générale de l'application. Pour l'architecture technique actuelle (KV Store ou SQL), consultez [schema_base_donnees.md](./schema_base_donnees.md)

## Vue d'ensemble

Vous venez de créer une application complète de gestion RGPD avec :
- ✅ Un portail client sécurisé
- ✅ Un espace administrateur pour gérer vos clients
- ✅ Un système d'authentification Supabase
- ✅ Des permissions granulaires par fonctionnalité

---

## 📋 Processus de Configuration (Première utilisation)

### Étape 1️⃣ : Accéder à l'application

Au premier lancement, l'application détectera automatiquement qu'aucun administrateur n'est configuré et affichera **l'assistant de configuration**.

### Étape 2️⃣ : Entrer votre email administrateur

1. Dans l'écran de bienvenue, entrez **votre email professionnel**
   - Exemple : `admin@octopus-data-privacy.fr`
2. Cliquez sur **"Commencer la configuration"**
3. Un guide interactif s'ouvrira automatiquement

### Étape 3️⃣ : Créer votre compte dans Supabase

Le guide vous accompagnera pas à pas. Voici les actions à effectuer :

1. **Ouvrir la console Supabase**
   - Allez sur https://supabase.com
   - Connectez-vous à votre compte
   - Sélectionnez votre projet

2. **Créer l'utilisateur administrateur**
   - Menu gauche → **Authentication** → **Users**
   - Cliquez sur **"Add user"** → **"Create new user"**
   - Remplissez :
     - **Email** : L'email que vous venez d'entrer (IMPORTANT !)
     - **Password** : Choisissez un mot de passe fort (min. 6 caractères)
     - **Auto Confirm User** : ✅ COCHEZ cette case
   - Cliquez sur **"Create user"**

3. **Revenir à l'application**
   - Fermez le guide
   - Vous serez redirigé vers la page de connexion

---

## 🔐 Première Connexion

### Se connecter en tant qu'administrateur

1. Sur la page de connexion, entrez :
   - **Email** : Votre email administrateur
   - **Mot de passe** : Le mot de passe créé dans Supabase
2. Cliquez sur **"Se connecter"**
3. Vous accédez maintenant à l'**espace administrateur** ! 🎉

---

## 👥 Gestion des Clients et Utilisateurs

### Créer votre premier client

1. Dans l'espace admin, allez dans l'onglet **"Clients"**
2. Cliquez sur **"Nouveau client"**
3. Remplissez les informations :
   - **Nom de l'entreprise** (obligatoire)
   - **Email de contact** (obligatoire)
   - **Téléphone** (optionnel)
   - **Adresse** (optionnel)
4. Cliquez sur **"Créer le client"**

### Créer un utilisateur pour ce client

1. Allez dans l'onglet **"Utilisateurs"**
2. Cliquez sur **"Nouvel utilisateur"**
3. Remplissez les informations :
   - **Client** : Sélectionnez le client créé précédemment
   - **Nom complet** : Nom de l'utilisateur
   - **Email** : Email de connexion de l'utilisateur
   - **Mot de passe** : Mot de passe initial
4. **Définissez les permissions** (cochez selon les besoins) :
   - ✅ **Registre des traitements** (Article 30 RGPD)
   - ✅ **Exercice des droits** (Articles 15-22 RGPD)
   - ✅ **Violations de données** (Article 33 RGPD)
5. Cliquez sur **"Créer l'utilisateur"**

---

## 🎯 Utilisation Quotidienne

### En tant qu'administrateur

**Vous pouvez :**
- ✅ Créer, modifier et supprimer des clients
- ✅ Créer, modifier et supprimer des utilisateurs
- ✅ Gérer les permissions de chaque utilisateur
- ✅ Filtrer les utilisateurs par client

**Accès :**
- URL : Votre URL d'application
- Connexion : Avec votre email administrateur

### En tant qu'utilisateur client

**Vos clients peuvent :**
- ✅ Se connecter avec leur email et mot de passe
- ✅ Accéder uniquement aux fonctionnalités autorisées
- ✅ Consulter leur Registre des traitements
- ✅ Gérer les exercices de droits
- ✅ Suivre les violations de données

**Accès :**
- URL : Votre URL d'application
- Connexion : Avec l'email et mot de passe que vous leur avez créé

---

## 🔧 Gestion des Permissions

Chaque utilisateur peut avoir accès à une ou plusieurs fonctionnalités :

| Permission | Description | Article RGPD |
|------------|-------------|--------------|
| **Registre des traitements** | Cartographie des traitements de données | Article 30 |
| **Exercice des droits** | Gestion des demandes (accès, rectification, etc.) | Articles 15-22 |
| **Violations de données** | Suivi des incidents de sécurité | Article 33 |

Pour modifier les permissions :
1. Onglet **Utilisateurs**
2. Cliquez sur **"Modifier"** sur un utilisateur
3. Activez/désactivez les permissions
4. Cliquez sur **"Enregistrer"**

---

## 📊 Architecture du Système

> ℹ️ **Note** : L'application supporte deux architectures de base de données :
> - **KV Store** : Architecture simple actuelle
> - **PostgreSQL relationnel** : Architecture recommandée ([Migrer maintenant →](./MIGRATION_README.md))

### Architecture générale (applicable aux deux systèmes)

```
┌─────────────────────────────────────┐
│     Application React/Tailwind      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Supabase Backend (Hono)        │
│  - Authentification JWT             │
│  - API REST sécurisée               │
│  - Vérification des rôles           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Base de données PostgreSQL      │
│  Pour l'architecture détaillée :    │
│  → schema_base_donnees.md           │
└─────────────────────────────────────┘
```

**Pour comprendre l'architecture complète** : Consultez [schema_base_donnees.md](./schema_base_donnees.md)

---

## 🛡️ Sécurité

- ✅ **Authentification Supabase** : Tokens JWT sécurisés
- ✅ **Vérification des rôles** : Routes protégées côté serveur
- ✅ **Permissions granulaires** : Contrôle d'accès par fonctionnalité
- ✅ **Sessions persistantes** : Reconnexion automatique
- ✅ **Isolation des données** : Chaque client ne voit que ses données

---

## ❓ FAQ

**Q : Puis-je avoir plusieurs administrateurs ?**
R : Actuellement, le système supporte un seul email admin. Pour en ajouter d'autres, vous devrez modifier la liste dans la base de données.

**Q : Un utilisateur peut-il appartenir à plusieurs clients ?**
R : Non, chaque utilisateur est lié à un seul client.

**Q : Comment réinitialiser le mot de passe d'un utilisateur ?**
R : Vous devez le supprimer puis le recréer avec un nouveau mot de passe, ou utiliser la console Supabase pour modifier le mot de passe.

**Q : Les données sont-elles vraiment sécurisées ?**
R : L'application utilise Supabase avec authentification JWT et routes protégées. Pour la production, assurez-vous de mettre en place des mesures de sécurité supplémentaires (HTTPS, politiques RLS, etc.).

**Q : Puis-je personnaliser les fonctionnalités RGPD ?**
R : Oui ! Le code est entièrement modifiable. Vous pouvez ajouter d'autres permissions ou fonctionnalités selon vos besoins.

---

## 🎉 Vous êtes prêt !

Votre portail client RGPD est maintenant opérationnel. Commencez par créer vos premiers clients et utilisateurs !

**Besoin d'aide ?**
- Consultez le code dans `/components` pour comprendre le fonctionnement
- Vérifiez les routes API dans `/supabase/functions/server/index.tsx`
- Testez d'abord avec un client de démonstration

**Bonne utilisation ! 🚀**