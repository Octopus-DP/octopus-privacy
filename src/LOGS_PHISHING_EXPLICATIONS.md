# 📊 Comprendre les logs du module Phishing

## 🎯 Objectif

Ce document explique comment **lire et interpréter les logs** générés par le système d'envoi d'emails de phishing. Ces logs sont essentiels pour diagnostiquer les problèmes d'envoi.

---

## 🔍 Comment accéder aux logs ?

### Dans le navigateur (Chrome, Firefox, Edge, Safari)

1. **Ouvrir la console développeur**
   - Windows/Linux : `F12` ou `Ctrl + Shift + I`
   - Mac : `Cmd + Option + I`

2. **Aller dans l'onglet "Console"**

3. **Lancer une campagne** et observer les logs en temps réel

---

## 📝 Anatomie d'un log réussi

Voici à quoi ressemblent les logs lorsque **tout fonctionne correctement** :

```
[CAMPAIGN] Launching campaign: CMP_1234567890_abc123
[PHISHING] Preparing to send emails for campaign CMP_1234567890_abc123
[PHISHING] Campaign sendMode: immediate, status: running
[PHISHING] Template found: Mise à jour urgente de sécurité
[PHISHING] Found 3 recipients for campaign CMP_1234567890_abc123
[PHISHING] Recipients: [
  {id: "RCP_1234567890_xyz", email: "john.doe@example.com"},
  {id: "RCP_1234567891_abc", email: "jane.smith@example.com"},
  {id: "RCP_1234567892_def", email: "bob.martin@example.com"}
]
[PHISHING] Base URL: https://xxxxxxxx.supabase.co
[PHISHING] Mailjet credentials - API Key: true, Secret: true
[PHISHING] Starting email batch send...

[PHISHING EMAIL] Preparing email for john.doe@example.com (ID: RCP_1234567890_xyz)
[PHISHING EMAIL] Email prepared - Subject: "🔒 Mise à jour urgente de sécurité"
[PHISHING EMAIL] Sender: Service IT <noreply@votredomaine.com>
[PHISHING EMAIL] Recipient: John Doe <john.doe@example.com>
[MAILJET] Checking credentials...
[MAILJET] Credentials OK
[MAILJET] Sending email via Mailjet API...
[MAILJET] From: Service IT <noreply@votredomaine.com>
[MAILJET] To: John Doe <john.doe@example.com>
[MAILJET] Subject: 🔒 Mise à jour urgente de sécurité
[MAILJET] Response status: 200
[MAILJET] API response: {
  "Messages": [{
    "Status": "success",
    "To": [{
      "Email": "john.doe@example.com",
      "MessageID": 123456789012345
    }]
  }]
}
[MAILJET] ✅ Email sent successfully!
[PHISHING EMAIL] Mailjet result for john.doe@example.com: SUCCESS
✓ Email sent to john.doe@example.com

[PHISHING EMAIL] Preparing email for jane.smith@example.com (ID: RCP_1234567891_abc)
...

[CAMPAIGN] Launch response: {
  success: true,
  message: "Campaign launched and emails are being sent",
  campaign: {...}
}
[PHISHING] Campaign CMP_1234567890_abc123: Sent 3 emails, 0 failed
```

### 🎉 Interprétation

| Log | Signification |
|-----|--------------|
| `[CAMPAIGN] Launching campaign` | Le frontend a envoyé la requête de lancement |
| `[PHISHING] Preparing to send emails` | Le backend a reçu la requête et commence le traitement |
| `[PHISHING] Found 3 recipients` | 3 destinataires ont été trouvés dans la base de données |
| `[MAILJET] Credentials OK` | Les identifiants Mailjet sont valides |
| `[MAILJET] Response status: 200` | Mailjet a accepté l'email |
| `[MAILJET] ✅ Email sent successfully!` | L'email a été mis en file d'attente d'envoi |
| `Sent 3 emails, 0 failed` | Résumé final : 3 succès, 0 échec |

---

## ❌ Logs d'erreur et solutions

### Erreur 1 : Aucun destinataire

```
[PHISHING] Found 0 recipients for campaign CMP_1234567890_abc123
[PHISHING] No recipients found for campaign CMP_1234567890_abc123
[PHISHING] Skipping email sending - status: running, sendMode: immediate
```

**Cause** : Aucun destinataire n'a été ajouté à la campagne.

**Solution** :
1. Vérifier que vous avez bien complété l'étape 3 du wizard
2. Vérifier que les emails sont valides
3. Essayer de créer une nouvelle campagne et ajouter des destinataires

---

### Erreur 2 : Identifiants Mailjet manquants

```
[PHISHING] Mailjet credentials - API Key: false, Secret: false
[MAILJET] Checking credentials...
[MAILJET] Mailjet API credentials not configured
[PHISHING EMAIL] Mailjet result for test@example.com: FAILED
[PHISHING EMAIL] Error details: Mailjet API credentials not configured
✗ Failed to send to test@example.com: Mailjet API credentials not configured
[PHISHING] Campaign CMP_...: Sent 0 emails, 1 failed
```

**Cause** : Les variables d'environnement `MAILJET_API_KEY` et `MAILJET_SECRET_KEY` ne sont pas définies.

**Solution** :
1. Créer un compte Mailjet sur https://www.mailjet.com
2. Récupérer vos clés API : Account Settings → REST API
3. Ajouter les secrets dans Supabase :
   - Dashboard → Settings → Edge Functions → Secrets
   - Ajouter `MAILJET_API_KEY` et `MAILJET_SECRET_KEY`

---

### Erreur 3 : Identifiants Mailjet invalides

```
[MAILJET] Response status: 401
[MAILJET] API error response: 401 {"ErrorMessage": "Unauthorized"}
[MAILJET] ❌ Email sending failed: Mailjet API error: 401 - Unauthorized
```

**Cause** : Les clés API Mailjet sont incorrectes ou ont été révoquées.

**Solution** :
1. Vérifier vos identifiants sur https://app.mailjet.com
2. Régénérer de nouvelles clés si nécessaire
3. Mettre à jour les secrets dans Supabase

---

### Erreur 4 : Email expéditeur non vérifié

```
[MAILJET] Response status: 400
[MAILJET] API error response: 400 {
  "Messages": [{
    "Status": "error",
    "Errors": [{
      "ErrorCode": "mj-0013",
      "ErrorMessage": "Sender email address is not verified"
    }]
  }]
}
[MAILJET] ❌ Email sending failed: Sender email address is not verified
```

**Cause** : L'email expéditeur (défini dans le template) n'est pas vérifié dans Mailjet.

**Solution** :
1. Aller sur https://app.mailjet.com
2. Account Settings → Sender Addresses & Domains
3. Ajouter l'email expéditeur (ex : `noreply@votredomaine.com`)
4. Confirmer via le lien reçu par email
5. Relancer la campagne

---

### Erreur 5 : Domaine non vérifié

```
[MAILJET] Response status: 400
[MAILJET] API error response: 400 {
  "Messages": [{
    "Status": "error",
    "Errors": [{
      "ErrorCode": "mj-0015",
      "ErrorMessage": "Sender domain is not verified"
    }]
  }]
}
```

**Cause** : Le domaine de l'email expéditeur n'est pas vérifié dans Mailjet.

**Solution** :
1. Vérifier le domaine complet dans Mailjet (Account Settings → Sender Addresses & Domains)
2. Ajouter les enregistrements DNS (SPF, DKIM, DMARC)
3. **OU** utiliser un email avec un domaine déjà vérifié

---

### Erreur 6 : Template introuvable

```
[PHISHING] Template phishing_template:TPL_1234567890_abc not found for campaign CMP_...
```

**Cause** : Le template associé à la campagne a été supprimé.

**Solution** :
1. Créer un nouveau template
2. Créer une nouvelle campagne avec ce template

---

### Erreur 7 : Campagne programmée (pas d'envoi immédiat)

```
[PHISHING] Skipping email sending - status: scheduled, sendMode: immediate
```

**Cause** : La date de début de la campagne est dans le futur.

**Solution** :
1. Éditer la campagne
2. Mettre la date de début à **maintenant** ou dans le passé
3. Relancer

---

### Erreur 8 : Rate limiting Mailjet

```
[MAILJET] Response status: 429
[MAILJET] API error response: 429 Too Many Requests
```

**Cause** : Vous avez dépassé le quota d'envoi Mailjet (6000 emails/mois en gratuit).

**Solution** :
1. Attendre le mois prochain
2. **OU** passer à un plan payant Mailjet
3. **OU** espacer les envois

---

## 🎓 Exemples de scénarios complets

### Scénario 1 : Tout fonctionne ✅

```
[CAMPAIGN] Launching campaign: CMP_123
[PHISHING] Preparing to send emails for campaign CMP_123
[PHISHING] Found 1 recipients
[MAILJET] Credentials OK
[MAILJET] Response status: 200
[MAILJET] ✅ Email sent successfully!
[PHISHING] Campaign CMP_123: Sent 1 emails, 0 failed
```

**Action** : Rien à faire ! Vérifier la boîte mail du destinataire (et le spam).

---

### Scénario 2 : Pas de destinataires ❌

```
[CAMPAIGN] Launching campaign: CMP_123
[PHISHING] Found 0 recipients for campaign CMP_123
[PHISHING] Skipping email sending
```

**Action** : Ajouter des destinataires à la campagne.

---

### Scénario 3 : Mailjet non configuré ❌

```
[PHISHING] Mailjet credentials - API Key: false, Secret: false
[MAILJET] Mailjet API credentials not configured
[PHISHING] Campaign CMP_123: Sent 0 emails, 1 failed
```

**Action** : Configurer les identifiants Mailjet dans Supabase.

---

### Scénario 4 : Email expéditeur non vérifié ❌

```
[MAILJET] Response status: 400
[MAILJET] ❌ Email sending failed: Sender email address is not verified
[PHISHING] Campaign CMP_123: Sent 0 emails, 1 failed
```

**Action** : Vérifier l'email expéditeur dans Mailjet.

---

## 🔧 Commandes utiles pour déboguer

### Vérifier les secrets Supabase (CLI)

```bash
supabase secrets list
```

### Voir les logs du serveur Supabase

```bash
supabase functions logs make-server-abb8d15d
```

### Tester l'API Mailjet manuellement

```bash
curl -X POST \
  https://api.mailjet.com/v3.1/send \
  -H 'Content-Type: application/json' \
  -u 'API_KEY:SECRET_KEY' \
  -d '{
    "Messages": [{
      "From": {"Email": "test@example.com", "Name": "Test"},
      "To": [{"Email": "recipient@example.com", "Name": "Recipient"}],
      "Subject": "Test",
      "TextPart": "Test message"
    }]
  }'
```

---

## 📊 Dashboard Mailjet

Pour suivre l'envoi des emails en temps réel :

1. Aller sur https://app.mailjet.com/stats
2. **Statistics** → **Email Sent**
3. Filtrer par date : Aujourd'hui
4. Chercher les emails de phishing par CustomID : `phishing_CMP_...`

### Statuts Mailjet

| Statut | Signification |
|--------|--------------|
| **Queued** | Email en file d'attente |
| **Sent** | Email envoyé au serveur mail du destinataire |
| **Delivered** | Email reçu par le destinataire |
| **Opened** | Email ouvert par le destinataire |
| **Clicked** | Lien cliqué dans l'email |
| **Bounced** | Email refusé (adresse invalide ou serveur bloque) |
| **Blocked** | Email bloqué par Mailjet (spam, contenu non conforme) |
| **Spam** | Marqué comme spam par le destinataire |

---

## 🎯 Checklist de diagnostic

Utilisez cette checklist pour identifier rapidement le problème :

- [ ] **Console ouverte** : La console du navigateur est ouverte (F12)
- [ ] **Logs visibles** : Des logs apparaissent lors du lancement
- [ ] **Destinataires trouvés** : `[PHISHING] Found X recipients` avec X > 0
- [ ] **Mailjet configuré** : `Mailjet credentials - API Key: true, Secret: true`
- [ ] **Statut 200** : `[MAILJET] Response status: 200`
- [ ] **Email sent** : `[MAILJET] ✅ Email sent successfully!`
- [ ] **Résumé positif** : `Sent X emails, 0 failed`

Si tous les points sont verts mais l'email n'arrive pas :
- Vérifier le dossier **Spam**
- Vérifier le statut dans **Mailjet Dashboard**
- Essayer avec un email personnel (Gmail, Outlook)

---

## 📚 Ressources

- [Documentation Mailjet API](https://dev.mailjet.com/)
- [Centre d'aide Mailjet](https://help.mailjet.com/)
- [Statuts d'envoi Mailjet](https://dev.mailjet.com/email/guides/send-api-v31/#status-and-error-codes)
- [Vérification domaine SPF/DKIM](https://www.mailjet.com/feature/email-authentication/)

---

**Besoin d'aide supplémentaire ?** Copiez tous les logs de la console et envoyez-les au support technique avec le contexte de votre campagne.
