# 📧 Configuration des Tests de Phishing avec Mailjet

## ✅ Prérequis

Avant de lancer une campagne de phishing, assurez-vous que :

1. **Les credentials Mailjet sont configurés** (déjà fait ✓)
   - `MAILJET_API_KEY`
   - `MAILJET_SECRET_KEY`

2. **Une adresse email d'expéditeur est vérifiée dans Mailjet**

---

## 🔧 Configuration de l'adresse d'expéditeur dans Mailjet

### Étape 1 : Connexion à Mailjet

1. Connectez-vous à votre compte Mailjet : https://app.mailjet.com/
2. Utilisez les mêmes credentials que ceux configurés dans les variables d'environnement

### Étape 2 : Vérifier un domaine ou une adresse email

#### Option A : Vérifier une adresse email individuelle

1. Allez dans **Account Settings** → **Sender addresses & domains**
2. Cliquez sur **Add a Sender Address**
3. Entrez l'adresse email que vous souhaitez utiliser (ex: `noreply@octopusdataprivacy.com`)
4. Mailjet enverra un email de confirmation à cette adresse
5. Cliquez sur le lien de confirmation dans l'email

#### Option B : Vérifier un domaine entier (Recommandé pour la production)

1. Allez dans **Account Settings** → **Sender addresses & domains**
2. Cliquez sur **Add a Domain**
3. Entrez votre domaine (ex: `octopusdataprivacy.com`)
4. Suivez les instructions pour ajouter les enregistrements DNS :
   - **SPF** : Ajoutez un enregistrement TXT avec la valeur fournie
   - **DKIM** : Ajoutez un enregistrement TXT avec la valeur fournie
5. Attendez la validation (peut prendre quelques minutes à quelques heures)
6. Une fois validé, vous pouvez utiliser n'importe quelle adresse de ce domaine

---

## 🎯 Utilisation dans l'application

### Configuration des adresses d'expéditeur dans les templates

Les templates de phishing par défaut utilisent des adresses comme :
- `noreply@phishing-test.local` (à remplacer)
- `livraison@courrier-express.com` (à remplacer)
- etc.

**⚠️ IMPORTANT** : Ces adresses ne fonctionneront PAS sans vérification.

### Personnaliser les adresses d'expéditeur

Lors de la création d'une campagne (Étape 3), vous pouvez modifier :
1. **Nom de l'expéditeur** : Le nom affiché (ex: "Service IT")
2. **Email de l'expéditeur** : L'adresse email vérifiée dans Mailjet

**Exemple de configuration correcte** :
```
Nom de l'expéditeur : Service Livraison
Email de l'expéditeur : noreply@votredomaine.com
```

---

## 🚀 Lancer une campagne de test

### Test avec une seule adresse

1. Créez une nouvelle campagne
2. Ajoutez votre propre adresse email comme destinataire
3. Sélectionnez un modèle
4. **Modifiez l'email de l'expéditeur** avec une adresse vérifiée dans Mailjet
5. Lancez la campagne

### Vérifier que tout fonctionne

1. **Vérifiez la réception** : L'email devrait arriver dans quelques secondes/minutes
2. **Testez le tracking** :
   - Ouvrez l'email → Le tracking d'ouverture s'active
   - Cliquez sur le lien → Vous serez redirigé vers la page pédagogique
3. **Consultez les statistiques** dans le détail de la campagne

---

## 📊 Tracking et Analytics

Le système track automatiquement :
- ✅ **Ouvertures** : Via un pixel invisible de 1x1
- ✅ **Clics** : Via des URLs de tracking uniques
- ✅ **Soumissions** : Si le destinataire saisit des données
- ✅ **Signalements** : Si le destinataire signale l'email

Toutes ces données sont visibles en temps réel dans l'interface.

---

## ⚠️ Limitations et bonnes pratiques

### Limitations techniques

1. **Rate Limiting Mailjet** : Ne pas envoyer trop d'emails simultanément
   - L'application utilise un délai de 2 secondes entre chaque email
   - Pour de gros volumes, utilisez le mode "Envois étalés"

2. **Adresses non vérifiées** : L'envoi échouera
   - Toujours vérifier l'adresse d'expéditeur dans Mailjet d'abord

### Bonnes pratiques

1. **Testez d'abord avec vous-même** avant d'envoyer aux collaborateurs
2. **Informez les collaborateurs** que des tests de phishing auront lieu
3. **Variez les scénarios** pour une meilleure évaluation
4. **Analysez les résultats** et proposez des formations ciblées
5. **Respectez le RGPD** : informez les instances représentatives

---

## 🔍 Dépannage

### L'email n'arrive pas

1. **Vérifiez l'adresse d'expéditeur** dans Mailjet
2. **Consultez les logs** du serveur pour voir les erreurs Mailjet
3. **Vérifiez le quota Mailjet** (limite d'envoi journalière)
4. **Vérifiez le spam** du destinataire

### Le tracking ne fonctionne pas

1. **Vérifiez que SUPABASE_URL** est correctement configuré
2. Les tracking pixels peuvent être bloqués par certains clients email
3. Le tracking des clics fonctionne toujours, même si les pixels sont bloqués

### Erreur "Template not found"

1. Vérifiez que les templates par défaut ont été initialisés
2. Redémarrez le serveur si nécessaire

---

## 📝 Variables disponibles dans les templates

Les templates supportent les variables suivantes :

- `{{Prénom}}` : Prénom du destinataire
- `{{Nom}}` : Nom du destinataire
- `{{Nom_entreprise}}` : Nom de l'entreprise cliente
- `{{tracking_link}}` : Lien de tracking (automatique)
- `{{random}}` : Nombre aléatoire
- `{{amount}}` : Montant aléatoire
- `{{date}}` : Date du jour
- `{{deadline}}` : Date J+2
- `{{CEO_Name}}` : Nom du dirigeant
- `{{company_domain}}` : Domaine de l'entreprise

---

## 🎓 Support

Pour toute question ou problème :
1. Consultez les logs du serveur
2. Vérifiez la documentation Mailjet : https://dev.mailjet.com/
3. Contactez le support technique d'Octopus Data & Privacy

---

**Version** : 1.0  
**Dernière mise à jour** : Décembre 2025
