# 🧪 Tester l'application en local

Si vous voulez tester l'application sur votre ordinateur avant de la déployer.

---

## Prérequis

### Installer Node.js

**Windows** :
1. Allez sur https://nodejs.org
2. Téléchargez la version **LTS** (recommandée)
3. Installez en suivant l'assistant
4. Redémarrez votre ordinateur

**Mac** :
1. Installez Homebrew : https://brew.sh
2. Dans le Terminal : `brew install node`

**Linux** :
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Vérifier l'installation

Ouvrez un terminal (ou PowerShell sur Windows) :

```bash
node --version
npm --version
```

Vous devez voir les numéros de version (ex: `v20.10.0` et `10.2.3`).

---

## Installation du projet

### 1. Ouvrir le terminal dans le dossier du projet

**Windows** :
- Ouvrez le dossier du projet dans l'Explorateur
- Maintenez **Shift** + **Clic droit** dans le dossier
- Sélectionnez **"Ouvrir dans Windows Terminal"** ou **"Ouvrir PowerShell ici"**

**Mac** :
- Ouvrez Terminal
- Tapez `cd ` (avec un espace)
- Glissez-déposez le dossier du projet
- Appuyez sur Entrée

**Linux** :
- Clic droit dans le dossier → **"Open in Terminal"**

---

### 2. Installer les dépendances

Dans le terminal, tapez :

```bash
npm install
```

⏱️ **Temps d'installation** : 1-3 minutes

Vous verrez beaucoup de texte défiler. C'est normal !

---

### 3. Lancer l'application

```bash
npm run dev
```

Vous devriez voir :

```
VITE v5.1.4  ready in 324 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

---

### 4. Ouvrir l'application

1. Ouvrez votre navigateur (Chrome, Firefox, Edge...)
2. Allez sur : **http://localhost:5173**
3. 🎉 Votre application est accessible !

---

## Utilisation

### Arrêter l'application

Dans le terminal, appuyez sur **Ctrl + C** (Windows/Linux) ou **Cmd + C** (Mac)

### Relancer l'application

```bash
npm run dev
```

### Build de production (pour tester)

```bash
npm run build
npm run preview
```

L'app sera sur : **http://localhost:4173**

---

## Problèmes courants

### ❌ `npm: command not found`

**Solution** : Node.js n'est pas installé ou pas dans le PATH.
- Réinstallez Node.js
- Redémarrez votre ordinateur

---

### ❌ `Cannot find module 'vite'`

**Solution** : Les dépendances ne sont pas installées.

```bash
npm install
```

---

### ❌ Port 5173 déjà utilisé

**Solution** : Une autre app utilise ce port.

```bash
# Arrêtez l'autre app, ou changez le port
npm run dev -- --port 3000
```

L'app sera sur http://localhost:3000

---

### ❌ Erreur de connexion au backend

**Solution** : Vérifiez que :
1. Vous avez une connexion internet
2. L'URL Supabase dans `/utils/supabase/info.tsx` est correcte
3. Les Edge Functions Supabase sont déployées et actives

---

### ❌ Page blanche

**Solution** :
1. Ouvrez la Console du navigateur (F12)
2. Regardez l'onglet **Console** pour les erreurs
3. Partagez-moi l'erreur si vous ne savez pas la résoudre

---

## Avantages du test en local

✅ **Rapidité** : Changements visibles instantanément  
✅ **Debug** : Plus facile de voir les erreurs  
✅ **Offline** : Fonctionne sans internet (sauf appels API)  
✅ **Sécurité** : Tester avant de déployer  

---

## Après avoir testé

Une fois que tout fonctionne en local, vous êtes prêt à déployer !

👉 Consultez [DEPLOIEMENT_RAPIDE.md](./DEPLOIEMENT_RAPIDE.md)

---

## 💡 Astuce

Si vous développez régulièrement, installez **VS Code** (éditeur de code gratuit) :
- https://code.visualstudio.com
- Ouvrez le dossier du projet dans VS Code
- Terminal intégré + coloration syntaxique = plus facile !
