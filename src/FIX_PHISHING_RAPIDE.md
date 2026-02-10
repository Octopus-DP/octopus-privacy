# 🚑 Fix rapide - Module Phishing

Guide ultra-rapide pour résoudre les problèmes du module de phishing.

---

## 🎯 Problème : Les emails ne partent pas

### Solution en 3 étapes :

**1. Vérifier les clés Mailjet**

```bash
# Allez dans Supabase Dashboard
https://supabase.com/dashboard/project/hnftylnikuxwtzxpmysf/settings/edge-functions

# Variables à vérifier :
MAILJET_API_KEY=votre_cle_api
MAILJET_SECRET_KEY=votre_cle_secrete
```

**2. Vérifier les logs**

```bash
# Logs Supabase
https://supabase.com/dashboard/project/hnftylnikuxwtzxpmysf/logs/edge-functions

# Cherchez :
[MAILJET] Credentials OK          ← Doit être présent
[MAILJET] ✅ Email sent successfully!  ← Doit apparaître après envoi
```

**3. Tester avec votre email**

- Créez une campagne avec VOTRE email
- Lancez-la
- Vérifiez votre boîte (y compris spam)

---

## 🎯 Problème : Le tracking ne fonctionne pas

### Solution en 2 étapes :

**1. Vérifier l'URL dans l'email**

- Ouvrez un email de test
- Clic droit sur l'image → Copier l'adresse
- Doit ressembler à :
  ```
  https://hnftylnikuxwtzxpmysf.supabase.co/functions/v1/make-server-abb8d15d/phishing/track/open/CAMP_xxx/RCP_xxx
  ```

**2. Tester l'endpoint directement**

Ouvrez cette URL dans votre navigateur :
```
https://hnftylnikuxwtzxpmysf.supabase.co/functions/v1/make-server-abb8d15d/phishing/track/open/test/test
```

✅ **Attendu** : Image vide (pixel transparent)  
❌ **Erreur** : 404/500 → Edge Functions pas déployées

---

## 🎯 Problème : Erreur 401 sur le tracking

### Solution immédiate :

⚠️ **Ce bug a été corrigé dans le code actuel.**

Les endpoints de tracking sont **publics** (pas d'auth).

**Si vous avez encore l'erreur** :
- Redéployez les Edge Functions
- Ou contactez-moi pour vérifier le code

---

## 🎯 Problème : "Template not found"

### Solution :

**1. Vérifier les templates**

Allez dans **Phishing** → **Templates**

Si aucun template :
- Les templates par défaut n'ont pas été créés
- Créez un template manuellement

**2. Créer un template de test**

```
Nom : Test Simple
Sujet : Test de sécurité
Expéditeur : Service IT <it@votredomaine.com>
Contenu HTML :
---
<p>Bonjour {{Prénom}},</p>
<p>Veuillez vérifier votre compte en cliquant <a href="{{tracking_link}}">ici</a>.</p>
<p>Cordialement,<br>L'équipe IT</p>
---
```

---

## 🎯 Problème : Campagne ne se lance pas

### Checklist rapide :

- [ ] Template sélectionné existe
- [ ] Au moins 1 destinataire ajouté
- [ ] Entité juridique sélectionnée
- [ ] Vous avez la permission `phishing`

**Erreur dans la console (F12) ?**
- Copiez l'erreur
- Regardez dans les logs Supabase

---

## 🛠️ Commandes de diagnostic rapide

### 1. Vérifier si les Edge Functions sont up

```bash
curl https://hnftylnikuxwtzxpmysf.supabase.co/functions/v1/make-server-abb8d15d/phishing/track/open/test/test
```

✅ Attendu : Image GIF (données binaires)

### 2. Vérifier les templates

Dans la console du navigateur (F12) :

```javascript
// Sur la page Phishing
console.log('Templates disponibles :', /* voir dans le state */);
```

### 3. Vérifier une campagne

Dans les logs Supabase, cherchez :

```
[PHISHING] Preparing to send emails for campaign CAMP_xxx
[PHISHING] Found X recipients for campaign CAMP_xxx
[MAILJET] Sending email via Mailjet API...
```

---

## 📋 Checklist de vérification complète

Cochez au fur et à mesure :

### Configuration de base
- [ ] Mailjet API Key configurée
- [ ] Mailjet Secret Key configurée
- [ ] Edge Functions déployées et actives
- [ ] Au moins 1 template de phishing créé

### Test d'envoi
- [ ] Campagne créée avec mon email
- [ ] Campagne lancée sans erreur
- [ ] Email reçu dans ma boîte
- [ ] Email pas dans les spams

### Test de tracking
- [ ] J'ai ouvert l'email
- [ ] Compteur "Ouvertures" a augmenté
- [ ] J'ai cliqué sur le lien
- [ ] Compteur "Clics" a augmenté
- [ ] Page de sensibilisation affichée

### Logs
- [ ] Logs backend : pas d'erreur `[MAILJET]`
- [ ] Logs backend : `[TRACK OPEN]` visible lors de l'ouverture
- [ ] Logs backend : `[TRACK CLICK]` visible lors du clic
- [ ] Logs frontend : pas d'erreur 401/403/500

---

## 🆘 SOS - Rien ne fonctionne ?

**Procédure de debug complète** :

1. **Logs Supabase** :
   ```
   https://supabase.com/dashboard/project/hnftylnikuxwtzxpmysf/logs/edge-functions
   ```
   - Filtrez les 100 derniers logs
   - Cherchez les `[ERROR]` ou erreurs

2. **Console navigateur** (F12) :
   - Onglet **Console** : cherchez les erreurs rouges
   - Onglet **Network** : cherchez les requêtes HTTP en erreur (rouge)

3. **Collectez les infos** :
   - Capture d'écran de l'erreur
   - Logs Supabase (copier/coller)
   - Console navigateur (copier/coller)
   - Quelle action a déclenché l'erreur ?

4. **Contactez le support** avec ces infos

---

## 💡 Astuces pro

### Astuce 1 : Toujours tester avec votre propre email
- Plus rapide pour déboguer
- Vous voyez exactement ce que reçoivent les utilisateurs

### Astuce 2 : Utilisez des sujets reconnaissables
```
Sujet : [TEST PHISHING] Vérification compte
```
- Plus facile à retrouver dans votre boîte
- Évite la confusion avec de vrais emails

### Astuce 3 : Gardez les logs ouverts
- Supabase logs dans un onglet
- Console navigateur (F12) dans l'app
- Vous voyez les problèmes en temps réel

### Astuce 4 : Vérifiez les spams
- Mailjet peut être bloqué par certains filtres
- Ajoutez l'expéditeur à vos contacts

---

## 📞 Support

**Logs à envoyer en cas de problème** :

1. **Backend** (Supabase) :
   ```
   Tous les logs contenant [PHISHING], [MAILJET], [TRACK]
   ```

2. **Frontend** (Console F12) :
   ```
   Tous les logs/erreurs lors de l'action qui échoue
   ```

3. **Contexte** :
   ```
   - Quelle action échoue exactement ?
   - Depuis quand le problème existe ?
   - A-t-il déjà fonctionné avant ?
   ```

---

## ✅ Validation finale

**Le module fonctionne si** :

✅ Vous recevez un email de test  
✅ L'ouverture est trackée  
✅ Le clic est tracké  
✅ La page de sensibilisation s'affiche  

**Si tout est OK** → 🎉 Le module est opérationnel !
