# 📤 Comment exporter le code depuis Figma Make

## Méthode 1 : Export automatique (si disponible)

1. Dans **Figma Make**, ouvrez votre projet
2. Cherchez le bouton **menu "⋮"** ou **"Settings"** en haut à droite
3. Cherchez une option **"Export"**, **"Download code"** ou **"Download project"**
4. Téléchargez le fichier ZIP
5. Extrayez le contenu dans un dossier

## Méthode 2 : Export manuel (si l'export auto n'existe pas)

Si Figma Make ne permet pas l'export direct, voici comment récupérer tous les fichiers :

### Étape 1 : Créer un dossier sur votre ordinateur

```
octopus-data-privacy/
```

### Étape 2 : Copier les fichiers de configuration

Les fichiers suivants ont déjà été créés dans ce projet Figma Make :

✅ **Fichiers de configuration** (déjà créés) :
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `index.html`
- `main.tsx`
- `vercel.json`
- `netlify.toml`
- `postcss.config.js`
- `.gitignore`

### Étape 3 : Copier tous les autres fichiers

Vous devez copier :

📁 **Dossiers** :
- `/components/` (tous les fichiers)
- `/styles/` (globals.css)
- `/utils/` (tous les fichiers)
- `/supabase/` (tous les fichiers)
- `/public/` (favicon.svg)

📄 **Fichiers racine** :
- `App.tsx`
- Tous les fichiers `.md` (documentation)

### Étape 4 : Structure finale

Votre dossier doit ressembler à ça :

```
octopus-data-privacy/
├── components/
│   ├── AdminDashboard.tsx
│   ├── ClientDashboard.tsx
│   ├── PhishingDashboard.tsx
│   ├── ui/
│   └── ...
├── styles/
│   └── globals.css
├── utils/
│   └── supabase/
│       └── info.tsx
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx
│           ├── phishing.tsx
│           └── ...
├── public/
│   └── favicon.svg
├── App.tsx
├── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json
├── .gitignore
└── README.md
```

## Méthode 3 : Utiliser l'API Figma Make (avancé)

Si Figma Make a une API, vous pourriez automatiser l'export. Mais ce n'est probablement pas nécessaire.

---

## Une fois l'export fait

Consultez [DEPLOIEMENT.md](./DEPLOIEMENT.md) pour déployer sur Vercel/Netlify ! 🚀
