# ✅ Checklist de déploiement

Suivez cette checklist pour vous assurer que tout est prêt pour le déploiement.

## 📋 Avant de déployer

### 1. Vérification des fichiers essentiels

- [ ] `package.json` existe
- [ ] `vite.config.ts` existe
- [ ] `tsconfig.json` existe
- [ ] `index.html` existe
- [ ] `main.tsx` existe
- [ ] `App.tsx` existe
- [ ] `/components/` existe et contient tous les composants
- [ ] `/styles/globals.css` existe
- [ ] `/utils/supabase/info.tsx` existe
- [ ] `/supabase/functions/server/` existe avec tous les fichiers

### 2. Configuration Supabase

- [ ] Votre backend Supabase fonctionne
- [ ] Les Edge Functions sont déployées
- [ ] Les variables d'environnement Supabase sont configurées :
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_DB_URL`
  - `MAILJET_API_KEY`
  - `MAILJET_SECRET_KEY`

### 3. Test en local (optionnel mais recommandé)

```bash
npm install
npm run dev
```

- [ ] L'application démarre sans erreur
- [ ] Vous pouvez vous connecter
- [ ] Les données se chargent correctement

---

## 🚀 Déploiement

### Étape 1 : GitHub

- [ ] Compte GitHub créé
- [ ] Repository créé (privé de préférence)
- [ ] Code uploadé sur GitHub

### Étape 2 : Vercel

- [ ] Compte Vercel créé
- [ ] Connecté avec GitHub
- [ ] Projet importé depuis GitHub
- [ ] Build settings configurés :
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`
- [ ] Déploiement lancé

### Étape 3 : Vérification du déploiement

- [ ] Le build s'est terminé avec succès
- [ ] L'URL Vercel fonctionne (ex: `octopus-data-privacy.vercel.app`)
- [ ] Vous pouvez vous connecter
- [ ] Les données se chargent
- [ ] Le backend Supabase répond correctement

---

## 🌐 Domaine personnalisé

### Configuration DNS

Chez votre registrar de domaine (ex: OVH, Gandi, etc.) :

- [ ] Connexion au panneau DNS
- [ ] Ajout d'un enregistrement CNAME :
  ```
  Type:   CNAME
  Nom:    app
  Valeur: cname.vercel-dns.com (ou la valeur fournie par Vercel)
  TTL:    3600 (ou auto)
  ```
- [ ] Sauvegarde de la configuration DNS

### Dans Vercel

- [ ] Aller dans Settings → Domains
- [ ] Cliquer sur "Add"
- [ ] Entrer `app.octopus-dp.fr`
- [ ] Vérification réussie
- [ ] Certificat SSL généré (automatique)

### Test final

- [ ] `https://app.octopus-dp.fr` est accessible
- [ ] Le certificat SSL est valide (cadenas vert)
- [ ] L'application fonctionne correctement
- [ ] La connexion fonctionne
- [ ] Les données se chargent

---

## 🔗 Mise à jour WordPress

Sur votre site WordPress :

- [ ] Bouton "Espace Client" créé
- [ ] URL mise à jour : `https://app.octopus-dp.fr`
- [ ] Le lien fonctionne et redirige correctement

---

## ✅ Post-déploiement

### Tests fonctionnels

- [ ] Connexion admin fonctionne
- [ ] Connexion client fonctionne
- [ ] Registre de traitements fonctionne
- [ ] Exercice des droits fonctionne
- [ ] Violations de données fonctionne
- [ ] Module phishing fonctionne
- [ ] Envoi d'emails de phishing fonctionne
- [ ] Tracking des campagnes fonctionne

### Performance

- [ ] Temps de chargement < 3 secondes
- [ ] Responsive sur mobile
- [ ] Aucune erreur dans la console navigateur

### Sécurité

- [ ] HTTPS actif (cadenas vert)
- [ ] Pas d'erreurs de certificat
- [ ] Les sessions persistent correctement

---

## 📝 Documentation

- [ ] Mettre à jour les URLs dans tous les documents `.md`
- [ ] Documenter la procédure de déploiement pour l'avenir
- [ ] Noter les accès importants (GitHub, Vercel, Supabase)

---

## 🎉 Félicitations !

Si tous les items sont cochés, votre application est en production ! 🚀

**URLs finales** :
- Frontend : https://app.octopus-dp.fr
- Backend : https://hnftylnikuxwtzxpmysf.supabase.co/functions/v1/make-server-abb8d15d/
- Admin Supabase : https://supabase.com/dashboard/project/hnftylnikuxwtzxpmysf
