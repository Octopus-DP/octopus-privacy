# 📝 Variables dans les Templates de Phishing

## 🎯 Qu'est-ce qu'une variable ?

Les **variables** permettent de personnaliser automatiquement le contenu des emails de phishing pour chaque destinataire. Elles sont encadrées par des doubles accolades : `{{nom_variable}}`

**Exemple** :
```
Bonjour {{Prénom}},

Votre entreprise {{Nom_entreprise}} nécessite une action urgente.
```

Devient pour Jean Dupont chez Octopus Data & Privacy :
```
Bonjour Jean,

Votre entreprise Octopus Data & Privacy nécessite une action urgente.
```

---

## ✅ Variables disponibles

### Variables personnelles (du destinataire)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `{{Prénom}}` | Prénom du destinataire | Jean |
| `{{Nom}}` | Nom de famille du destinataire | Dupont |
| `{{Nom_entreprise}}` | Nom de l'entreprise cliente | Octopus Data & Privacy |
| `{{company_domain}}` | Domaine email du destinataire | octopus-dp.fr |

### Variables automatiques

| Variable | Description | Exemple |
|----------|-------------|---------|
| `{{CEO_Name}}` | Nom du CEO (par défaut : "Direction") | Direction |
| `{{random_number}}` | Nombre aléatoire 4 chiffres | 7382 |
| `{{random_id}}` | ID aléatoire 6 caractères | A8F3D2 |
| `{{random_amount}}` | Montant aléatoire | 1,245.50 € |

---

## 📍 Où utiliser les variables ?

### ✅ Vous POUVEZ utiliser les variables dans :

1. **Le sujet de l'email**
   ```
   🔒 {{Prénom}}, action requise pour {{Nom_entreprise}}
   ```

2. **Le contenu HTML de l'email**
   ```html
   <p>Bonjour {{Prénom}} {{Nom}},</p>
   <p>Un document important pour {{Nom_entreprise}} vous attend.</p>
   ```

3. **Le contenu texte de l'email**
   ```
   Bonjour {{Prénom}},
   
   Cliquez sur le lien ci-dessous.
   ```

4. **Le nom de l'expéditeur**
   ```
   Service IT {{Nom_entreprise}}
   Direction de {{Nom_entreprise}}
   ```

### ⚠️ ATTENTION : Email expéditeur

**L'email expéditeur NE DOIT PAS contenir de variables dynamiques** car il doit être vérifié dans Mailjet.

#### ❌ INCORRECT
```
Email expéditeur : it-security@{{company_domain}}
Email expéditeur : noreply@{{Nom_entreprise}}.com
```

**Pourquoi ?** Mailjet exige que l'email expéditeur soit vérifié à l'avance. Or, une variable change pour chaque destinataire, donc elle ne peut pas être pré-vérifiée.

#### ✅ CORRECT
```
Email expéditeur : noreply@octopus-dp.fr
Email expéditeur : security@votredomaine.com
Email expéditeur : it-support@example.com
```

**Important** : L'email expéditeur doit :
1. Être une adresse **fixe** (pas de variables)
2. Être **vérifié dans Mailjet** (Account Settings → Sender Addresses)
3. Être une adresse **valide** que vous contrôlez

---

## 🔧 Comment les variables sont remplacées

### Automatiquement pour chaque destinataire

Quand vous ajoutez un destinataire avec :
- **Email** : `jean.dupont@octopus-dp.fr`
- **Nom** : `Jean Dupont`

Le système remplace automatiquement :
- `{{Prénom}}` → `Jean`
- `{{Nom}}` → `Dupont`
- `{{company_domain}}` → `octopus-dp.fr`
- `{{Nom_entreprise}}` → Nom du client configuré dans la campagne

### Valeurs par défaut

Si une donnée manque, le système utilise des valeurs par défaut :
- Pas de nom ? `{{Prénom}}` → `Collaborateur`
- Pas d'entreprise ? `{{Nom_entreprise}}` → `Votre entreprise`

---

## 🎓 Exemples de templates

### Exemple 1 : Email simple

**Template** :
```
De : Service IT <noreply@octopus-dp.fr>
Sujet : Action requise pour {{Prénom}}

Bonjour {{Prénom}},

Un document important pour {{Nom_entreprise}} nécessite votre attention.

Cliquez ici pour y accéder : [LIEN_TRACKING]

Cordialement,
Service IT
```

**Résultat pour Jean Dupont** :
```
De : Service IT <noreply@octopus-dp.fr>
Sujet : Action requise pour Jean

Bonjour Jean,

Un document important pour Octopus Data & Privacy nécessite votre attention.

Cliquez ici pour y accéder : [LIEN_TRACKING]

Cordialement,
Service IT
```

---

### Exemple 2 : Email de phishing réaliste

**Template** :
```
De : Direction <direction@octopus-dp.fr>
Sujet : 🔒 Mise à jour de sécurité urgente - {{Nom_entreprise}}

Bonjour {{Prénom}} {{Nom}},

Dans le cadre de notre politique de sécurité, nous mettons à jour les accès de tous les collaborateurs de {{Nom_entreprise}}.

Votre code de vérification : {{random_id}}

Veuillez valider votre compte en cliquant sur le lien ci-dessous avant le {{date_limite}} :

[LIEN_TRACKING]

Si vous ne validez pas, votre accès sera suspendu.

Cordialement,
Équipe Sécurité
{{Nom_entreprise}}
```

**Résultat** :
```
De : Direction <direction@octopus-dp.fr>
Sujet : 🔒 Mise à jour de sécurité urgente - Octopus Data & Privacy

Bonjour Jean Dupont,

Dans le cadre de notre politique de sécurité, nous mettons à jour les accès de tous les collaborateurs de Octopus Data & Privacy.

Votre code de vérification : A8F3D2

Veuillez valider votre compte en cliquant sur le lien ci-dessous avant le {{date_limite}} :

[LIEN_TRACKING]

Si vous ne validez pas, votre accès sera suspendu.

Cordialement,
Équipe Sécurité
Octopus Data & Privacy
```

---

## 🐛 Dépannage

### Problème : Variables non remplacées dans l'email reçu

**Symptôme** : Le destinataire reçoit `Bonjour {{Prénom}},` au lieu de `Bonjour Jean,`

**Causes possibles** :
1. Le nom du destinataire n'a pas été renseigné lors de l'ajout
2. La syntaxe de la variable est incorrecte (espaces, majuscules)
3. Le nom de la variable n'existe pas

**Solutions** :
1. Vérifier que le destinataire a bien un nom dans la campagne
2. Utiliser exactement la syntaxe : `{{Prénom}}` (avec majuscule, pas d'espace)
3. Utiliser uniquement les variables de la liste ci-dessus

---

### Problème : Email expéditeur avec variables refuse d'envoyer

**Symptôme** :
```
[MAILJET] "it-security@{{company_domain}}" is an invalid email address
```

**Cause** : L'email expéditeur contient une variable `{{company_domain}}`

**Solution** :
1. Éditer le template
2. Remplacer l'email expéditeur par une adresse fixe
3. Exemple : `it-security@octopus-dp.fr` ou `noreply@votredomaine.com`
4. Vérifier cette adresse dans Mailjet

**Important** : L'email expéditeur ne supporte PAS les variables pour des raisons de sécurité Mailjet.

---

## 💡 Bonnes pratiques

### ✅ Faire

1. **Utiliser les variables pour personnaliser** le contenu
   ```
   Bonjour {{Prénom}}, votre compte chez {{Nom_entreprise}}
   ```

2. **Tester avec des données réelles**
   - Créer une campagne de test avec votre propre email
   - Vérifier que les variables sont bien remplacées

3. **Prévoir des valeurs par défaut**
   - Le système gère automatiquement les cas où les données manquent

4. **Utiliser un email expéditeur fixe et vérifié**
   ```
   Email expéditeur : noreply@octopus-dp.fr ✅
   ```

### ❌ Éviter

1. **Variables dans l'email expéditeur**
   ```
   Email expéditeur : it@{{company_domain}} ❌
   ```

2. **Syntaxe incorrecte**
   ```
   {{ Prénom }}  ❌ (espaces)
   {{prenom}}    ❌ (minuscule)
   {{ Prénom}}   ❌ (espace avant)
   ```

3. **Variables inexistantes**
   ```
   {{Téléphone}}  ❌ (non supporté)
   {{Poste}}      ❌ (non supporté)
   ```

---

## 📚 Variables spéciales

### Variables de tracking (automatiques)

Ces variables sont ajoutées automatiquement par le système, **vous n'avez pas besoin de les ajouter** :

- **Pixel de tracking** : Ajouté automatiquement en fin d'email HTML
- **Lien de tracking** : Ajouté automatiquement sur les liens cliquables
- **ID du destinataire** : Géré en interne pour le tracking

---

## 🔐 Sécurité et RGPD

### Données personnelles

Les variables utilisent les données des destinataires. Assurez-vous que :
1. Les destinataires ont été informés du test de phishing (cadre formation)
2. Les données sont stockées de manière sécurisée (Supabase chiffré)
3. Les emails de test sont supprimés après la campagne

### Conformité

- Les tests de phishing sont conformes RGPD dans un cadre de **formation**
- Les données ne sont jamais partagées avec des tiers
- Les statistiques sont anonymisées après la campagne

---

## 📖 Résumé

| Élément | Supporte les variables ? | Exemple |
|---------|-------------------------|---------|
| **Sujet** | ✅ Oui | `Action requise pour {{Prénom}}` |
| **Contenu HTML** | ✅ Oui | `<p>Bonjour {{Prénom}},</p>` |
| **Contenu texte** | ✅ Oui | `Bonjour {{Prénom}},` |
| **Nom expéditeur** | ✅ Oui | `Service IT {{Nom_entreprise}}` |
| **Email expéditeur** | ❌ **NON** | `noreply@octopus-dp.fr` (fixe) |

---

**Besoin d'ajouter une nouvelle variable ?** Contactez l'équipe technique pour étendre la liste des variables disponibles.
