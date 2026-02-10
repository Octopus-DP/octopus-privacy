# 🔧 Guide de Dépannage - Octopus Data & Privacy

## ✅ Problème résolu : Erreur 401 Supabase

### Ce qui a été corrigé :
Les requêtes vers les Edge Functions Supabase nécessitent **toujours** le header `Authorization` avec la clé `ANON_KEY`, même pour les routes publiques.

**Modifications apportées :**
- ✅ `SetupWizard.tsx` : Ajout du header Authorization
- ✅ `App.tsx` : Ajout du header Authorization pour check-setup
- ✅ `LoginPage.tsx` : Ajout du header Authorization pour signin
- ✅ Logs détaillés ajoutés partout pour faciliter le debugging

---

## 🧪 Vérifier que tout fonctionne

### Test 1 : Vérifier que le serveur est accessible

Ouvrez votre navigateur et allez sur :
```
https://[votre-project-id].supabase.co/functions/v1/make-server-abb8d15d/health
```

**Résultat attendu :**
```json
{"status": "ok"}
```

Si vous voyez un **404** ou une erreur, votre Edge Function n'est pas déployée.

---

### Test 2 : Vérifier le check-setup

Dans la console du navigateur (F12), au chargement de l'app, vous devriez voir :
```
Checking if setup is needed...
Setup check response status: 200
Setup check data: { isSetup: false }
Setup needed, showing setup wizard
```

---

### Test 3 : Initialisation de l'admin

1. Entrez votre email dans le formulaire
2. Cliquez sur "Commencer la configuration"
3. Dans la console, vous devriez voir :

```
Initializing admin with email: votre@email.com
API URL: https://[project-id].supabase.co/functions/v1/make-server-abb8d15d
Init response status: 200
Init response data: { success: true, message: "Admin initialized" }
Admin initialized successfully, showing guide
```

---

## 🚨 Erreurs possibles et solutions

### Erreur 401 : Unauthorized

**Cause :** Le header Authorization n'est pas envoyé correctement

**Solution :** Vérifiez que `publicAnonKey` est bien importé :
```typescript
import { projectId, publicAnonKey } from '../utils/supabase/info';
```

Et que le header est présent :
```typescript
headers: {
  'Authorization': `Bearer ${publicAnonKey}`,
}
```

---

### Erreur 404 : Not Found

**Cause :** L'Edge Function n'est pas déployée ou l'URL est incorrecte

**Solution :**
1. Vérifiez que votre Edge Function est déployée dans Supabase
2. Vérifiez l'URL : `https://[project-id].supabase.co/functions/v1/make-server-abb8d15d/[route]`
3. Le nom de la fonction doit être `server` dans Supabase

---

### Erreur 500 : Internal Server Error

**Cause :** Erreur dans le code serveur

**Solution :**
1. Allez dans Supabase Dashboard > Edge Functions > Logs
2. Regardez les logs d'erreur détaillés
3. Les messages d'erreur dans les logs serveur vous diront exactement ce qui ne va pas

**Causes courantes :**
- KV Store non configuré
- Variables d'environnement manquantes (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.)
- Erreur dans le code serveur

---

### Le guide ne s'affiche pas après l'initialisation

**Cause :** La réponse du serveur n'est pas `{ success: true }`

**Solution :**
1. Regardez la console : `Init response data: ...`
2. Si `success: false`, regardez le champ `error` ou `details`
3. Corrigez le problème indiqué

---

### Impossible de créer le compte admin dans Supabase

**Solution :**
1. Assurez-vous d'utiliser **EXACTEMENT** le même email que celui configuré
2. Cochez bien **"Auto Confirm User"**
3. Le mot de passe doit faire au moins 6 caractères

---

## 📊 Vérifier les variables d'environnement

Dans la console Supabase, vérifiez que ces variables sont définies :

```
SUPABASE_URL = https://[project-id].supabase.co
SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...
SUPABASE_DB_URL = postgresql://...
```

Ces variables sont **automatiquement configurées** par Supabase.

---

## 🔍 Logs utiles

### Activer tous les logs

Tous les composants ont maintenant des `console.log` détaillés :

**Frontend (Console navigateur) :**
- État du setup
- Réponses des API
- Erreurs détaillées

**Backend (Console Supabase) :**
- Requêtes reçues
- Données traitées
- Erreurs avec stack trace

---

## ✅ Checklist de démarrage

- [ ] Le serveur Edge Function répond à `/health`
- [ ] La page de setup s'affiche au premier lancement
- [ ] L'initialisation de l'admin fonctionne (status 200)
- [ ] Le guide interactif s'affiche
- [ ] Vous pouvez créer le compte dans Supabase
- [ ] Vous pouvez vous connecter avec vos identifiants

---

## 🆘 Besoin d'aide ?

Si vous rencontrez toujours des problèmes :

1. **Partagez les logs** de la console navigateur (F12)
2. **Partagez les logs** de Supabase (Edge Functions > Logs)
3. **Indiquez l'étape** où ça bloque

**Les logs contiennent maintenant toutes les informations nécessaires pour identifier le problème ! 🔍**

---

## 🎯 Prochaines étapes après le setup

Une fois que tout fonctionne :

1. ✅ Créez votre compte admin dans Supabase
2. ✅ Connectez-vous à l'application
3. ✅ Créez votre premier client
4. ✅ Créez le premier utilisateur
5. ✅ Testez la connexion client

**Tout devrait fonctionner parfaitement maintenant ! 🚀**
