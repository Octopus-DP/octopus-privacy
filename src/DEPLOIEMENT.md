# 🚀 Guide de déploiement - Octopus Data & Privacy

## Prérequis

- Compte GitHub (gratuit)
- Compte Vercel (gratuit)

---

## Option 1 : Déploiement via Vercel (Recommandé) ✅

### Étape 1 : Créer un repository GitHub

1. Allez sur https://github.com/new
2. Nom du repo : `octopus-data-privacy`
3. Visibilité : **Private** (recommandé)
4. Cliquez sur **"Create repository"**

### Étape 2 : Uploader le code sur GitHub

**Option A - Via l'interface web (simple)** :
1. Sur votre repo GitHub, cliquez sur **"uploading an existing file"**
2. Glissez-déposez TOUS les fichiers du projet
3. Commit : "Initial commit"
4. Cliquez sur **"Commit changes"**

**Option B - Via Git (si vous l'avez installé)** :
```bash
cd /chemin/vers/votre/projet
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/octopus-data-privacy.git
git push -u origin main
```

### Étape 3 : Déployer sur Vercel

1. Allez sur https://vercel.com/signup
2. Connectez-vous avec **GitHub**
3. Cliquez sur **"Add New..."** → **"Project"**
4. Sélectionnez le repo **`octopus-data-privacy`**
5. **Framework Preset** : Vite
6. **Root Directory** : `./` (laisser par défaut)
7. **Build Command** : `npm run build` (déjà configuré)
8. **Output Directory** : `dist` (déjà configuré)
9. Cliquez sur **"Deploy"** 🚀

⏱️ Déploiement : ~2 minutes

### Étape 4 : Configurer votre domaine personnalisé

Une fois déployé :

1. Dans votre projet Vercel, allez dans **"Settings"** → **"Domains"**
2. Cliquez sur **"Add"**
3. Entrez : `app.octopus-dp.fr`
4. Vercel vous donnera des instructions DNS à configurer

**Configuration DNS chez votre registrar** :
```
Type:   CNAME
Nom:    app
Valeur: cname.vercel-dns.com (ou l'URL fournie par Vercel)
```

5. Attendez quelques minutes pour la propagation DNS
6. ✅ Votre app sera accessible sur `https://app.octopus-dp.fr`

---

## Option 2 : Déploiement via Netlify

### Étapes similaires :

1. Créer le repo GitHub (comme ci-dessus)
2. Allez sur https://netlify.com
3. Cliquez sur **"Add new site"** → **"Import an existing project"**
4. Sélectionnez **GitHub** et votre repo
5. **Build command** : `npm run build`
6. **Publish directory** : `dist`
7. Cliquez sur **"Deploy"**

Pour le domaine personnalisé :
- **"Domain settings"** → **"Add custom domain"**
- Entrez `app.octopus-dp.fr`
- Suivez les instructions DNS

---

## Option 3 : Déploiement local (pour tester)

Si vous voulez tester en local avant de déployer :

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production (tester)
npm run build
npm run preview
```

L'app sera accessible sur `http://localhost:5173`

---

## 🎯 URL après déploiement

Une fois déployé, vous aurez :

- **Frontend** : `https://app.octopus-dp.fr` (votre domaine personnalisé)
- **Backend** : `https://hnftylnikuxwtzxpmysf.supabase.co/functions/v1/make-server-abb8d15d/` (reste sur Supabase)
- **Database** : Supabase PostgreSQL (reste sur Supabase)

---

## ⚙️ Variables d'environnement

**Aucune variable nécessaire !** Tout est déjà configuré dans `/utils/supabase/info.tsx`

---

## 🔄 Déploiement continu

Avantage de Vercel/Netlify : à chaque fois que vous modifiez le code sur GitHub, **l'app se redéploie automatiquement** ! ✨

---

## ❓ Besoin d'aide ?

Si vous avez des questions à n'importe quelle étape, demandez-moi !
