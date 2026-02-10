# ⚡ Quick Start - Octopus Data & Privacy

## 🎯 En 5 minutes chrono !

### 1️⃣ Lancez l'application
- L'assistant de configuration s'ouvre automatiquement
- Entrez votre email : `votre.email@octopus.fr`
- Cliquez sur "Commencer"

### 2️⃣ Créez votre compte admin dans Supabase
```
Console Supabase > Authentication > Users > Add user
┌─────────────────────────────────────┐
│ Email: votre.email@octopus.fr       │
│ Password: ••••••••                  │
│ ✅ Auto Confirm User                │
└─────────────────────────────────────┘
```

### 3️⃣ Connectez-vous
- Email : `votre.email@octopus.fr`
- Password : Celui créé dans Supabase

### 4️⃣ Créez votre premier client
```
Admin > Clients > Nouveau client
┌─────────────────────────────────────┐
│ Nom: Entreprise XYZ SAS             │
│ Email: contact@entreprise-xyz.fr    │
└─────────────────────────────────────┘
```

### 5️⃣ Créez un utilisateur pour ce client
```
Admin > Utilisateurs > Nouvel utilisateur
┌─────────────────────────────────────┐
│ Client: Entreprise XYZ SAS          │
│ Nom: Jean Dupont                    │
│ Email: jean.dupont@xyz.fr           │
│ Password: ••••••••                  │
│                                     │
│ Permissions:                        │
│ ✅ Registre des traitements         │
│ ✅ Exercice des droits              │
│ ✅ Violations de données            │
└─────────────────────────────────────┘
```

## 🎊 C'est fait !

Votre client peut maintenant se connecter avec :
- Email : `jean.dupont@xyz.fr`
- Password : Le mot de passe défini

---

## 📱 Interface Admin vs Client

### Vue Administrateur
```
┌──────────────────────────────────────────┐
│  👤 Admin: votre.email@octopus.fr        │
├──────────────────────────────────────────┤
│  📋 Clients        👥 Utilisateurs        │
├──────────────────────────────────────────┤
│  • Créer des clients                     │
│  • Créer des utilisateurs                │
│  • Gérer les permissions                 │
│  • Modifier / Supprimer                  │
└──────────────────────────────────────────┘
```

### Vue Client
```
┌──────────────────────────────────────────┐
│  👤 Client: jean.dupont@xyz.fr           │
├──────────────────────────────────────────┤
│  📊 Registre    📝 Droits    ⚠️ Violations│
├──────────────────────────────────────────┤
│  Accès uniquement aux fonctionnalités    │
│  autorisées par l'administrateur         │
└──────────────────────────────────────────┘
```

---

## 🔑 Infos importantes

| Rôle | Email | Accès |
|------|-------|-------|
| **Admin** | Votre email configuré | Tout le système |
| **Client** | Email créé par admin | Selon permissions |

**Permissions disponibles :**
- ✅ Registre des traitements (Art. 30)
- ✅ Exercice des droits (Art. 15-22)
- ✅ Violations de données (Art. 33)

---

## ⚡ Commandes rapides

**Créer un client :**
`Admin > Clients > Nouveau client`

**Créer un utilisateur :**
`Admin > Utilisateurs > Nouvel utilisateur`

**Modifier les permissions :**
`Admin > Utilisateurs > Modifier (icône crayon)`

**Supprimer un élément :**
`Cliquez sur l'icône poubelle`

---

## 🎯 Prochaines étapes

1. ✅ Créez vos clients réels
2. ✅ Créez leurs utilisateurs
3. ✅ Configurez leurs permissions
4. ✅ Envoyez-leur leurs identifiants
5. ✅ Ils peuvent se connecter immédiatement !

**C'est tout ! Votre portail RGPD est opérationnel ! 🚀**
