# 🔍 Diagnostic du module de phishing

Ce document vous aide à diagnostiquer et résoudre les problèmes du module de phishing.

---

## ✅ Checklist de vérification

### 1️⃣ Configuration Mailjet

- [ ] Variables d'environnement configurées dans Supabase :
  - `MAILJET_API_KEY` : Votre clé API Mailjet
  - `MAILJET_SECRET_KEY` : Votre clé secrète Mailjet

**Comment vérifier ?**
1. Allez sur https://supabase.com/dashboard/project/hnftylnikuxwtzxpmysf/settings/edge-functions
2. Vérifiez que les variables `MAILJET_API_KEY` et `MAILJET_SECRET_KEY` sont définies

**Comment obtenir les clés Mailjet ?**
1. Connectez-vous sur https://app.mailjet.com
2. Allez dans **Account Settings** → **API Keys**
3. Copiez votre **API Key** et **Secret Key**

---

### 2️⃣ Edge Functions déployées

- [ ] Les Edge Functions Supabase sont déployées et actives

**Comment vérifier ?**
1. Allez sur https://supabase.com/dashboard/project/hnftylnikuxwtzxpmysf/functions
2. Vérifiez que la fonction `make-server-abb8d15d` est déployée
3. Statut doit être **Active** (vert)

**Comment redéployer ?**
Si la fonction n'est pas active, vous devez la redéployer depuis votre environnement de développement.

---

### 3️⃣ Templates de phishing créés

- [ ] Au moins un template de phishing existe

**Comment vérifier ?**
1. Connectez-vous à l'application
2. Allez dans **Phishing** → **Templates**
3. Vous devez voir au moins un template

**Si aucun template n'existe** :
Les templates par défaut sont censés être créés automatiquement au premier lancement. Vérifiez les logs.

---

### 4️⃣ Campagne de test

- [ ] Créer une campagne de test avec votre propre email

**Étapes** :
1. Créez une nouvelle campagne
2. Utilisez **votre propre adresse email** comme destinataire
3. Sélectionnez un template
4. Lancez la campagne
5. Vérifiez votre boîte de réception

---

## 🐛 Problèmes courants et solutions

### Problème 1 : Les emails ne partent pas

**Symptômes** :
- La campagne passe en statut "running"
- Mais aucun email n'est reçu

**Causes possibles** :

#### A) Credentials Mailjet manquants ou invalides

**Solution** :
1. Ouvrez la console des logs Supabase :
   https://supabase.com/dashboard/project/hnftylnikuxwtzxpmysf/logs/edge-functions
2. Filtrez par `make-server-abb8d15d`
3. Cherchez `[MAILJET]` dans les logs
4. Si vous voyez "Mailjet API credentials not configured", configurez les variables d'environnement

#### B) Sender email invalide dans le template

**Solution** :
1. Vérifiez que le template a un `senderEmail` valide
2. Format requis : `email@domaine.com`
3. Ne doit PAS contenir de variables non remplacées (`{{variable}}`)

#### C) Emails bloqués par Mailjet

**Solution** :
1. Vérifiez votre compte Mailjet : https://app.mailjet.com
2. Regardez les **Statistics** → **Messages**
3. Vérifiez si les emails sont **Blocked** ou **Bounced**
4. Si compte Mailjet non validé, validez votre domaine

---

### Problème 2 : Le tracking ne fonctionne pas (ouvertures/clics)

**Symptômes** :
- Les emails sont bien reçus
- Mais les statistiques restent à 0 (pas d'ouverture/clic enregistré)

**Causes possibles** :

#### A) URLs de tracking incorrectes

**Diagnostic** :
1. Ouvrez un email de test que vous avez reçu
2. **Clic droit** sur l'image → **Copier l'adresse de l'image**
3. Vérifiez que l'URL ressemble à :
   ```
   https://hnftylnikuxwtzxpmysf.supabase.co/functions/v1/make-server-abb8d15d/phishing/track/open/CAMP_xxxxx/RCP_xxxxx
   ```

**Si l'URL est différente** :
- Vérifiez que `SUPABASE_URL` est bien configurée
- Vérifiez les logs lors de l'envoi : cherchez `[TRACKING URLS]`

#### B) Bloqueur de pixels/images

**Diagnostic** :
1. Ouvrez l'email dans un client email web (Gmail, Outlook.com, etc.)
2. Vérifiez que les images sont bien chargées
3. Certains clients bloquent les images par défaut

**Solution** :
- Activez l'affichage des images dans votre client email
- Ou testez avec un autre client email

#### C) Endpoints de tracking non accessibles

**Diagnostic** :
1. Ouvrez cette URL dans votre navigateur (remplacez par un vrai campaignId et recipientId) :
   ```
   https://hnftylnikuxwtzxpmysf.supabase.co/functions/v1/make-server-abb8d15d/phishing/track/open/test/test
   ```
2. Vous devez voir une **image vide** (pixel transparent), pas d'erreur

**Si erreur 404 ou 500** :
- Les Edge Functions ne sont pas déployées correctement
- Vérifiez les logs Supabase

---

### Problème 3 : Erreur 401 "Missing authorization header"

**Symptômes** :
- Erreur 401 dans les logs lors du tracking

**Solution** :
⚠️ **Ce problème a normalement été corrigé** dans la version actuelle du code.

Les endpoints `/track/open` et `/track/click` sont **publics** (pas d'auth requise).

**Si vous avez encore cette erreur** :
1. Vérifiez que vous utilisez bien la dernière version du code
2. Vérifiez le fichier `/supabase/functions/server/phishing.tsx`
3. Les lignes 584-697 ne doivent PAS contenir de `verifyUser()`

---

### Problème 4 : Campagne ne se lance pas

**Symptômes** :
- Erreur lors du clic sur "Lancer"
- Ou la campagne reste en statut "draft"

**Diagnostic** :
1. Ouvrez la console du navigateur (F12)
2. Cliquez sur "Lancer la campagne"
3. Regardez les erreurs dans l'onglet **Console**

**Erreurs fréquentes** :

#### "Template not found"
- Le template sélectionné n'existe plus
- Solution : Créez/sélectionnez un autre template

#### "No recipients"
- Aucun destinataire dans la campagne
- Solution : Ajoutez au moins un destinataire

#### "Unauthorized" / "Permission denied"
- Votre utilisateur n'a pas la permission `phishing`
- Solution : Vérifiez vos permissions dans l'admin

---

## 📊 Tester le tracking manuellement

Pour vérifier que le tracking fonctionne :

### Test 1 : Tracking d'ouverture

1. Créez une campagne avec **votre email**
2. Lancez la campagne
3. Ouvrez l'email reçu
4. Attendez 10 secondes
5. Rafraîchissez la page de détail de la campagne
6. ✅ Le compteur "Ouvertures" doit passer à 1

### Test 2 : Tracking de clic

1. Dans l'email reçu, cliquez sur le lien
2. Vous devez voir la page "Ceci était un test de phishing"
3. Retournez sur la page de détail de la campagne
4. ✅ Le compteur "Clics" doit passer à 1

---

## 🔧 Logs de debug

Pour activer les logs détaillés :

### Backend (Edge Functions)

1. Allez sur https://supabase.com/dashboard/project/hnftylnikuxwtzxpmysf/logs/edge-functions
2. Filtrez par fonction : `make-server-abb8d15d`
3. Cherchez les préfixes :
   - `[PHISHING]` - Logs généraux des campagnes
   - `[MAILJET]` - Logs d'envoi d'emails
   - `[TRACKING URLS]` - Logs de génération des URLs
   - `[TRACK OPEN]` - Logs de tracking d'ouverture
   - `[TRACK CLICK]` - Logs de tracking de clic
   - `[PHISHING EMAIL]` - Logs de préparation d'emails

### Frontend (Navigateur)

1. Ouvrez l'application
2. Appuyez sur **F12** pour ouvrir la console
3. Cherchez les préfixes :
   - `[CAMPAIGN]` - Logs des campagnes
   - `[PHISHING]` - Logs du module phishing

---

## 📞 Besoin d'aide ?

Si vous ne trouvez pas la solution :

1. **Collectez les informations** :
   - Quel problème exact rencontrez-vous ?
   - Captures d'écran des erreurs
   - Logs backend (Supabase)
   - Logs frontend (Console navigateur)

2. **Vérifiez la checklist** ci-dessus

3. **Contactez le support** avec toutes ces informations

---

## ✅ Checklist finale

Une fois tout testé et fonctionnel :

- [ ] Mailjet configuré et validé
- [ ] Edge Functions déployées
- [ ] Templates créés
- [ ] Campagne de test lancée avec succès
- [ ] Email de test reçu
- [ ] Tracking d'ouverture fonctionne
- [ ] Tracking de clic fonctionne
- [ ] Page de sensibilisation s'affiche après clic

🎉 **Félicitations, le module de phishing est opérationnel !**
