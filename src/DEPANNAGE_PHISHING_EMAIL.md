# 🔍 Dépannage : Les emails de phishing ne sont pas reçus

## ✅ Vérifications de base

J'ai ajouté des **logs détaillés** pour diagnostiquer le problème. Voici les étapes à suivre :

---

## 📋 Étape 1 : Vérifier les logs du serveur

### Comment accéder aux logs ?

1. **Ouvrir la console du navigateur** (F12)
2. Aller dans l'onglet **"Console"**
3. **Lancer la campagne** (bouton "Play" sur la campagne en draft)
4. Observer les logs qui s'affichent

### Logs attendus (si tout fonctionne) :

```
[PHISHING] Preparing to send emails for campaign CMP_...
[PHISHING] Campaign sendMode: immediate, status: running
[PHISHING] Template found: Mise à jour urgente
[PHISHING] Found 1 recipients for campaign CMP_...
[PHISHING] Recipients: [{id: "RCP_...", email: "test@example.com"}]
[PHISHING] Base URL: https://xxxx.supabase.co
[PHISHING] Mailjet credentials - API Key: true, Secret: true
[PHISHING] Starting email batch send...
[PHISHING EMAIL] Preparing email for test@example.com (ID: RCP_...)
[PHISHING EMAIL] Email prepared - Subject: "Mise à jour urgente de sécurité"
[PHISHING EMAIL] Sender: Service IT <noreply@phishing-test.local>
[PHISHING EMAIL] Recipient: John Doe <test@example.com>
[MAILJET] Checking credentials...
[MAILJET] Credentials OK
[MAILJET] Sending email via Mailjet API...
[MAILJET] From: Service IT <noreply@phishing-test.local>
[MAILJET] To: John Doe <test@example.com>
[MAILJET] Subject: Mise à jour urgente de sécurité
[MAILJET] Response status: 200
[MAILJET] API response: { ... }
[MAILJET] ✅ Email sent successfully!
[PHISHING EMAIL] Mailjet result for test@example.com: SUCCESS
[PHISHING] Campaign CMP_...: Sent 1 emails, 0 failed
```

---

## 🔴 Problèmes fréquents et solutions

### Problème 1 : `[PHISHING] Found 0 recipients`

**Cause** : Aucun destinataire n'a été ajouté à la campagne

**Solution** :
1. Vérifier que vous avez bien ajouté des destinataires à l'étape 3 du wizard
2. Vérifier que les emails sont valides
3. Essayer de créer une nouvelle campagne avec des destinataires

---

### Problème 2 : `[PHISHING] Mailjet credentials - API Key: false, Secret: false`

**Cause** : Les identifiants Mailjet ne sont pas configurés

**Solution** :
1. Aller dans **Supabase Dashboard** → Votre projet
2. **Settings** → **Edge Functions** → **Secrets**
3. Vérifier que `MAILJET_API_KEY` et `MAILJET_SECRET_KEY` sont bien renseignés
4. Si absent, les ajouter via l'interface ou la CLI

```bash
supabase secrets set MAILJET_API_KEY=votre_api_key
supabase secrets set MAILJET_SECRET_KEY=votre_secret_key
```

---

### Problème 3 : Email expéditeur contient des variables

```
[MAILJET] API error response: 400 {
  "ErrorMessage": "\"it-security@{{company_domain}}\" is an invalid email address."
}
```

**Cause** : L'email expéditeur dans le template contient des variables non remplacées comme `{{company_domain}}`.

**Solution** :
1. Aller dans **Templates** de phishing
2. Éditer le template concerné
3. Dans "Email expéditeur", remplacer `it-security@{{company_domain}}` par un email **réel et vérifié**
4. Par exemple : `noreply@votredomaine.com` ou `security@votreentreprise.fr`
5. Vérifier cet email dans Mailjet (voir Problème 5)
6. Sauvegarder le template

**Note importante** : Les variables sont automatiquement remplacées dans le contenu de l'email, mais l'email expéditeur doit être une adresse fixe et vérifiée.

---

### Problème 4 : `[MAILJET] API error response: 401 Unauthorized`

**Cause** : Les identifiants Mailjet sont incorrects

**Solution** :
1. Vérifier vos identifiants Mailjet sur https://app.mailjet.com
2. **Account Settings** → **Master API Key & Sub-account API Key**
3. Copier les bonnes clés
4. Mettre à jour les secrets dans Supabase

---

### Problème 5 : `[MAILJET] API error response: 400 Bad Request`

**Autres causes possibles** :

#### A) Email expéditeur non vérifié

**Erreur** : `"Sender email address is not verified"`

**Solution** :
1. Aller sur https://app.mailjet.com
2. **Account Settings** → **Sender Addresses & Domains**
3. Ajouter et vérifier l'email expéditeur utilisé dans votre template
4. **OU** modifier le template pour utiliser un email vérifié

#### B) Domaine non vérifié

**Erreur** : `"Sender domain is not verified"`

**Solution** :
1. Vérifier le domaine complet dans Mailjet
2. Ajouter les enregistrements DNS requis (SPF, DKIM, DMARC)
3. **OU** utiliser un email avec domaine déjà vérifié

---

### Problème 5 : `[PHISHING] Skipping email sending - status: scheduled`

**Cause** : La date de début de campagne est dans le futur

**Solution** :
1. Éditer la campagne
2. Mettre la date de début à **maintenant** ou dans le passé
3. Relancer la campagne

---

### Problème 6 : `[PHISHING] Template not found`

**Cause** : Le template associé à la campagne a été supprimé

**Solution** :
1. Créer un nouveau template
2. Créer une nouvelle campagne avec ce template

---

### Problème 7 : Email envoyé mais pas reçu

**Causes possibles** :

#### A) Email dans les spams

**Solution** :
1. Vérifier le dossier **Spam/Courrier indésirable**
2. Ajouter l'expéditeur à la liste blanche
3. Vérifier la configuration SPF/DKIM/DMARC dans Mailjet

#### B) Email bloqué par le serveur mail

**Solution** :
1. Vérifier les **logs Mailjet** : https://app.mailjet.com/stats
2. Chercher l'email dans **Statistics** → **Email Sent**
3. Regarder le statut : "Delivered", "Bounced", "Blocked"
4. Si "Bounced" : l'email est invalide ou le serveur mail le refuse

#### C) Serveur mail du destinataire bloque les emails

**Solution** :
1. Si l'email est professionnel, le firewall d'entreprise peut bloquer
2. Essayer avec un email personnel (Gmail, Outlook, etc.)
3. Contacter l'admin IT pour autoriser les emails de Mailjet

---

## 🧪 Test de diagnostic complet

### 1. Créer une campagne de test minimale

```
Étape 1 : Informations
- Nom : "Test Diagnostic Email"
- Description : "Test"
- Client : [Votre client]
- Date début : Maintenant
- Mode envoi : Immédiat

Étape 2 : Template
- Sélectionner un template existant

Étape 3 : Destinataires
- Ajouter VOTRE email personnel (Gmail, Outlook, etc.)
- NOM : Test User
- EMAIL : votre-email@gmail.com

Étape 4 : Configuration
- Tracking : Activé
- Landing page : Aucune

Étape 5 : Révision
- Lancer la campagne
```

### 2. Observer les logs

Ouvrir la console (F12) et noter tous les messages qui apparaissent

### 3. Vérifier Mailjet Dashboard

1. Aller sur https://app.mailjet.com/stats
2. Regarder **Statistics** → **Email Sent**
3. Filtrer par date : Aujourd'hui
4. Chercher l'email envoyé
5. Regarder le statut et les détails

---

## 📊 Tableau de diagnostic

| Symptôme | Log observé | Cause probable | Solution |
|---------|-------------|----------------|----------|
| Aucun log | (rien) | Campagne pas lancée | Cliquer sur le bouton "Play" |
| 0 destinataires | `Found 0 recipients` | Pas de destinataires | Ajouter des destinataires |
| Credentials false | `Mailjet credentials - API Key: false` | Secrets manquants | Configurer les secrets Mailjet |
| 401 Unauthorized | `API error response: 401` | Mauvais identifiants | Vérifier les clés Mailjet |
| Sender not verified | `Sender email address is not verified` | Email non vérifié | Vérifier l'email expéditeur dans Mailjet |
| Email sent mais pas reçu | `✅ Email sent successfully!` | Spam ou blocage | Vérifier spam + logs Mailjet |

---

## 🔧 Configuration Mailjet recommandée

### 1. Créer un compte Mailjet

Si vous n'avez pas encore de compte :
1. Aller sur https://www.mailjet.com
2. Créer un compte gratuit (6000 emails/mois)
3. Confirmer votre email

### 2. Vérifier un email expéditeur

1. **Account Settings** → **Sender Addresses & Domains**
2. **Add a sender address**
3. Entrer un email valide (exemple : `phishing@votredomaine.com`)
4. Confirmer via le lien envoyé par email

### 3. (Optionnel) Vérifier un domaine complet

Pour une meilleure délivrabilité :
1. **Account Settings** → **Sender Addresses & Domains**
2. **Add a domain**
3. Suivre les instructions pour ajouter les enregistrements DNS :
   - **SPF** : `v=spf1 include:spf.mailjet.com ~all`
   - **DKIM** : Clés fournies par Mailjet
   - **DMARC** : `v=DMARC1; p=none; rua=mailto:postmaster@votredomaine.com`

### 4. Récupérer les clés API

1. **Account Settings** → **REST API**
2. **Master API Key Management**
3. Copier :
   - **API Key** (clé publique)
   - **Secret Key** (clé secrète)

### 5. Configurer dans Supabase

```bash
supabase secrets set MAILJET_API_KEY=votre_api_key_ici
supabase secrets set MAILJET_SECRET_KEY=votre_secret_key_ici
```

Ou via l'interface Supabase Dashboard.

---

## 📞 Support

### Logs utiles à fournir

Si le problème persiste, copier tous les logs de la console :
1. Ouvrir la console (F12)
2. Lancer la campagne
3. Copier tous les logs (Ctrl+A puis Ctrl+C dans la console)
4. Les envoyer au support avec :
   - Le nom de la campagne
   - L'email destinataire
   - La capture d'écran de l'erreur

### Informations à vérifier

- [ ] Les secrets Mailjet sont bien configurés
- [ ] L'email expéditeur est vérifié dans Mailjet
- [ ] La campagne a bien des destinataires
- [ ] La date de début est dans le passé ou maintenant
- [ ] Le template existe et est complet
- [ ] Le mode d'envoi est "immediate"

---

## 🎯 Checklist finale

Avant de lancer une campagne de phishing, vérifier :

### Configuration Mailjet
- [ ] Compte Mailjet créé et activé
- [ ] Email expéditeur vérifié
- [ ] (Optionnel) Domaine vérifié avec SPF/DKIM
- [ ] Clés API récupérées
- [ ] Secrets configurés dans Supabase

### Configuration Campagne
- [ ] Template créé avec email expéditeur vérifié
- [ ] Destinataires ajoutés avec emails valides
- [ ] Date de début = maintenant ou passé
- [ ] Mode envoi = immediate
- [ ] Tracking activé

### Test
- [ ] Campagne de test lancée avec votre email
- [ ] Logs observés dans la console
- [ ] Email reçu (vérifier spam)
- [ ] Liens de tracking fonctionnent
- [ ] Landing page s'affiche correctement

---

**Si tout est vert mais l'email n'arrive toujours pas, le problème vient probablement du serveur mail du destinataire qui bloque les emails.** Essayer avec un email Gmail ou Outlook personnel pour confirmer.
