# 🐙 Octopus Data & Privacy - Portail Client

Plateforme de gestion RGPD et conformité des données personnelles.

> 📚 **Navigation documentation** : Consultez l'[INDEX DE LA DOCUMENTATION](./DOCUMENTATION_INDEX.md) pour trouver facilement ce que vous cherchez.

> ⚠️ **Migration SQL disponible** : Une nouvelle architecture PostgreSQL relationnelle est disponible, offrant des performances 10-100x supérieures. [En savoir plus →](./MIGRATION_README.md)

## 🚀 Déploiement

**Consultez le guide complet** : [DEPLOIEMENT.md](./DEPLOIEMENT.md)

### Déploiement rapide sur Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/VOTRE-USERNAME/octopus-data-privacy)

1. Créez un repo GitHub avec ce code
2. Connectez-vous sur [Vercel](https://vercel.com)
3. Importez le repo
4. Déployez en un clic ! ✨

## 🛠️ Stack technique

- **Frontend** : React + TypeScript + Tailwind CSS
- **Backend** : Supabase Edge Functions (Hono + Deno)
- **Database** : Supabase PostgreSQL
  - Architecture actuelle : KV Store (simple)
  - Architecture recommandée : **Relationnel** (performances optimales) [Guide de migration →](./MIGRATION_README.md)
- **Email** : Mailjet
- **Hosting** : Vercel / Netlify

## 📦 Installation locale

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build
```

## 🌐 URLs

- **Production** : https://app.octopus-dp.fr
- **Backend API** : https://hnftylnikuxwtzxpmysf.supabase.co/functions/v1/make-server-abb8d15d/

## 📚 Documentation

**📖 Index complet** : [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) ← Commencez ici !

**Guides essentiels** :
- [Guide de démarrage](./GUIDE_DEMARRAGE.md)
- [Configuration Mailjet](./CONFIGURATION_MAILJET.md)
- [Module Phishing](./ACCES_MODULE_PHISHING.md)
- [Dépannage](./TROUBLESHOOTING.md)

**Migration & Optimisation** :
- [Migration vers SQL](./MIGRATION_README.md) ⭐ Recommandé
- [Guide complet migration](./GUIDE_MIGRATION_SQL.md)
- [Architecture base de données](./schema_base_donnees.md)

## 🔒 Sécurité & RGPD

- Authentification Supabase Auth
- Gestion des rôles et permissions
- Stockage sécurisé des données
- Conformité RGPD intégrée

## 📝 Licence

Propriétaire - Octopus Data & Privacy © 2024