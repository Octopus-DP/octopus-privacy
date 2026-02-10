# 🚀 Déploiement rapide (5 minutes)

Guide ultra-simplifié pour déployer votre application.

---

## Option 1 : Déploiement automatique avec Vercel (RECOMMANDÉ)

### 1️⃣ Télécharger le code

**Depuis Figma Make** :
- Cliquez sur le menu **⋮** en haut à droite
- Cherchez **"Export"** ou **"Download"**
- Si l'option n'existe pas, contactez-moi pour une solution alternative

**OU** utilisez directement ce projet si vous êtes dans Figma Make.

---

### 2️⃣ Créer un compte GitHub (si vous n'en avez pas)

1. Allez sur https://github.com/signup
2. Créez un compte gratuit
3. Confirmez votre email

---

### 3️⃣ Uploader le code sur GitHub

**Méthode simple (interface web)** :

1. Allez sur https://github.com/new
2. Nom du repository : `octopus-data-privacy`
3. Visibilité : **Private** ✅
4. Cochez **"Add a README file"**
5. Cliquez **"Create repository"**

6. Sur la page du repo, cliquez sur **"uploading an existing file"**
7. Glissez-déposez **TOUS** les fichiers de votre projet
8. Message : "Initial commit"
9. Cliquez **"Commit changes"**

---

### 4️⃣ Déployer sur Vercel

1. Allez sur https://vercel.com/signup
2. Cliquez **"Continue with GitHub"**
3. Autorisez Vercel à accéder à vos repos

4. Une fois connecté, cliquez sur **"Add New..."** → **"Project"**
5. Vous verrez votre repo `octopus-data-privacy`
6. Cliquez sur **"Import"**

7. **Configuration** :
   - Framework Preset : **Vite**
   - Root Directory : `.` (ne rien changer)
   - Build Command : `npm run build` (ne rien changer)
   - Output Directory : `dist` (ne rien changer)

8. Cliquez sur **"Deploy"** 🚀

⏱️ **Temps de déploiement** : ~2 minutes

---

### 5️⃣ Vérifier que ça marche

Une fois le déploiement terminé :

1. Vercel vous donne une URL type : `https://octopus-data-privacy-abc123.vercel.app`
2. Cliquez dessus pour ouvrir votre application
3. Testez la connexion
4. ✅ Si ça fonctionne, passez à l'étape 6 !

---

### 6️⃣ Configurer votre domaine `app.octopus-dp.fr`

**Dans Vercel** :

1. Sur votre projet, allez dans **"Settings"** → **"Domains"**
2. Dans le champ **"Add Domain"**, tapez : `app.octopus-dp.fr`
3. Cliquez **"Add"**
4. Vercel vous montre la configuration DNS nécessaire

**Chez votre hébergeur de domaine** (OVH, Gandi, etc.) :

1. Connectez-vous à votre compte
2. Allez dans la **gestion DNS** de `octopus-dp.fr`
3. Ajoutez un nouvel enregistrement **CNAME** :
   ```
   Type:   CNAME
   Nom:    app
   Valeur: cname.vercel-dns.com
   ```
4. **Sauvegardez**

⏱️ **Propagation DNS** : 5 minutes à 24 heures (souvent < 1 heure)

---

### 7️⃣ Test final

Après quelques minutes :

1. Ouvrez `https://app.octopus-dp.fr`
2. Vérifiez le cadenas vert (SSL actif)
3. Connectez-vous
4. ✅ **Félicitations, votre app est en ligne !** 🎉

---

### 8️⃣ Mettre à jour WordPress

Sur votre site WordPress, ajoutez un bouton avec l'URL :

```
https://app.octopus-dp.fr
```

---

## Option 2 : Déploiement avec Netlify (alternative)

Si vous préférez Netlify à Vercel :

1. Créez le repo GitHub (étapes 2-3 ci-dessus)
2. Allez sur https://app.netlify.com
3. Cliquez **"Add new site"** → **"Import an existing project"**
4. Connectez GitHub
5. Sélectionnez votre repo
6. Build command : `npm run build`
7. Publish directory : `dist`
8. Cliquez **"Deploy"**

Pour le domaine :
- **Domain settings** → **"Add custom domain"**
- Entrez `app.octopus-dp.fr`
- Suivez les instructions DNS (similaires à Vercel)

---

## ❓ Besoin d'aide ?

Si vous bloquez à n'importe quelle étape :

1. Notez l'étape où vous êtes bloqué
2. Faites une capture d'écran de l'erreur
3. Contactez-moi !

---

## 🎯 Résumé

✅ Code sur GitHub → ✅ Déploiement Vercel → ✅ Domaine personnalisé → ✅ En ligne !

**Temps total** : 5-15 minutes (hors propagation DNS)
