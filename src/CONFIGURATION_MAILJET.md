# Configuration Mailjet pour l'envoi d'emails

## 📧 Présentation

Le système d'invitations utilisateur utilise **Mailjet** pour envoyer des emails automatiques aux nouveaux utilisateurs créés dans le portail.

## 🔑 Étape 1 : Obtenir vos clés API Mailjet

1. **Créer un compte Mailjet** (si vous n'en avez pas déjà un)
   - Allez sur [https://www.mailjet.com](https://www.mailjet.com)
   - Créez un compte gratuit ou connectez-vous

2. **Générer vos clés API**
   - Connectez-vous à votre compte Mailjet
   - Allez dans **Account Settings** > **API Key Management**
   - Vous y trouverez deux clés :
     - **API Key** (Clé API)
     - **Secret Key** (Clé secrète)
   - Copiez ces deux clés

## 🔐 Étape 2 : Configurer les variables d'environnement dans Supabase

Vous devez ajouter **deux variables d'environnement** dans votre projet Supabase :

1. **Accéder aux Edge Functions Secrets**
   - Allez sur votre projet Supabase
   - Cliquez sur **Edge Functions** dans le menu
   - Cliquez sur **Manage secrets**

2. **Ajouter les deux secrets suivants :**

   ```
   MAILJET_API_KEY=votre_api_key_ici
   MAILJET_SECRET_KEY=votre_secret_key_ici
   ```

## ✉️ Étape 3 : Vérifier votre adresse email d'expédition

⚠️ **Important** : Mailjet nécessite que vous vérifiiez l'adresse email que vous utilisez pour envoyer des emails.

1. **Dans le code actuel**, l'adresse d'expédition est :
   ```
   noreply@octopus-dp.fr
   ```

2. **Pour vérifier votre domaine dans Mailjet :**
   - Allez dans **Account Settings** > **Sender Domains & Addresses**
   - Ajoutez votre domaine `octopus-dp.fr`
   - Suivez les instructions pour vérifier le domaine (ajout d'enregistrements DNS)
   - OU ajoutez simplement l'adresse email `noreply@octopus-dp.fr` et validez-la par le lien envoyé

3. **Modification de l'adresse d'expédition (si nécessaire) :**
   - Si vous souhaitez utiliser une autre adresse email, vous devrez modifier le fichier `/supabase/functions/server/index.tsx`
   - Cherchez : `From: { Email: "noreply@octopus-dp.fr" }`
   - Remplacez par votre adresse vérifiée

## 🌐 Étape 4 : Configurer l'URL de l'application

Ajoutez également cette variable d'environnement pour que le lien dans l'email fonctionne :

```
APP_URL=https://votre-domaine.com
```

Remplacez par l'URL réelle de votre application.

## ✅ Étape 5 : Tester l'envoi

Une fois configuré :

1. Créez un utilisateur dans le panneau d'administration
2. Sélectionnez-le et cliquez sur **"Envoyer invitation(s)"**
3. Vérifiez dans les logs de Supabase Edge Functions :
   - Si tout est OK : `Email sent successfully to user@example.com`
   - Si erreur : le message d'erreur de Mailjet sera affiché

## 🔍 Vérification dans les logs

Pour voir si les emails sont envoyés :

1. Allez dans **Edge Functions** > **Logs**
2. Cherchez les messages :
   - ✅ `Email sent successfully to ...`
   - ❌ `Failed to send email to ...`
   - ⚠️ `MAILJET_API_KEY or MAILJET_SECRET_KEY not configured`

## 📊 Limites du plan gratuit Mailjet

- **6 000 emails/mois** (200 emails/jour)
- Parfait pour un portail client avec un nombre modéré d'utilisateurs

## 🎨 Personnalisation de l'email

Le template d'email est dans `/supabase/functions/server/index.tsx` à la ligne de la route `/admin/send-invitations`.

Vous pouvez personnaliser :
- Le **design HTML** (couleurs, logo, etc.)
- Le **texte** du message
- L'**objet** de l'email
- Le **nom de l'expéditeur**

## 🆘 Résolution de problèmes

### L'email n'est pas envoyé
1. Vérifiez que les deux clés API sont bien configurées
2. Vérifiez que l'adresse d'expédition est vérifiée dans Mailjet
3. Consultez les logs Edge Functions pour voir l'erreur exacte

### L'email arrive en spam
1. Vérifiez votre domaine dans Mailjet (SPF, DKIM, DMARC)
2. Utilisez un domaine professionnel vérifié
3. Évitez les mots comme "gratuit", "urgent" dans l'objet

### Erreur "Provider not enabled"
- Vérifiez que les clés API sont correctes
- Vérifiez qu'elles sont bien dans les secrets Supabase

---

**Besoin d'aide ?** Consultez la documentation Mailjet : [https://dev.mailjet.com/](https://dev.mailjet.com/)