/**
 * Contenus d'aide pour tous les champs des formulaires RGPD
 */

// Aides pour les pages de registres (titres)
export const registreHelp = {
  traitements: {
    title: "Qu'est-ce qu'un Traitement de données ?",
    description: "Un traitement de données personnelles est toute opération effectuée sur des données personnelles : collecte, enregistrement, organisation, conservation, modification, consultation, transmission, effacement... Le Registre des Traitements est le document central de votre conformité RGPD.",
    examples: [
      "Gestion de la paie des employés (collecte, stockage des données RH)",
      "Envoi de newsletters marketing (collecte emails, prospection)",
      "Gestion des commandes clients (nom, adresse, paiement)",
      "Système de vidéosurveillance (captation d'images)",
      "Application mobile avec géolocalisation",
      "Base de données prospects (CRM)"
    ],
    tips: [
      "📋 Obligation légale : Toute entreprise doit tenir un Registre des Traitements (Art. 30 RGPD)",
      "🎯 Un traitement = une finalité précise et déterminée",
      "⚖️ Chaque traitement doit avoir une base juridique valide (consentement, contrat, obligation légale...)",
      "🔍 La CNIL peut demander ce registre lors d'un contrôle",
      "📝 Documentez tous vos traitements, même les plus simples",
      "🔄 Mettez à jour ce registre régulièrement (au moins 1 fois par an)"
    ]
  },
  droits: {
    title: "Qu'est-ce que l'Exercice des Droits ?",
    description: "Le RGPD accorde 6 droits fondamentaux aux personnes concernées. Toute personne peut vous demander d'exercer ces droits sur ses données personnelles. Vous devez tracer et répondre à ces demandes dans un délai de 1 mois maximum.",
    examples: [
      "Droit d'accès : 'Quelles données avez-vous sur moi ?'",
      "Droit de rectification : 'Mon adresse est erronée, corrigez-la'",
      "Droit à l'effacement : 'Supprimez toutes mes données'",
      "Droit à la portabilité : 'Envoyez-moi mes données au format CSV'",
      "Droit d'opposition : 'Je ne veux plus recevoir vos emails marketing'",
      "Droit à la limitation : 'Gelez mes données le temps du litige'"
    ],
    tips: [
      "⏱️ Délai légal : 1 mois pour répondre (prolongeable de 2 mois si complexe)",
      "✉️ Accusez réception de chaque demande",
      "🆔 Vérifiez l'identité du demandeur (protection contre usurpation)",
      "📝 Documentez toutes les demandes et vos réponses (traçabilité)",
      "💰 Les réponses sont gratuites (sauf abus manifeste)",
      "🚫 Le droit à l'effacement n'est pas absolu (obligations légales, contentieux...)",
      "⚠️ Non-respect = Sanction jusqu'à 20M€ ou 4% du CA mondial"
    ]
  },
  violations: {
    title: "Qu'est-ce qu'une Violation de données ?",
    description: "Une violation de données (ou 'data breach') est un incident de sécurité entraînant la destruction, perte, altération, divulgation ou accès non autorisé à des données personnelles. Vous devez documenter TOUTES les violations, même mineures, et notifier la CNIL dans les 72h si risque pour les personnes.",
    examples: [
      "🔓 Piratage : Accès non autorisé à votre base de données clients",
      "📧 Erreur humaine : Email envoyé en copie visible au lieu de copie cachée",
      "💻 Vol : Ordinateur portable ou clé USB volé contenant des données",
      "🔥 Ransomware : Chiffrement de vos serveurs par un logiciel malveillant",
      "🗑️ Perte : Destruction accidentelle de données sans sauvegarde",
      "📱 Fuite : API non sécurisée exposant des données publiquement",
      "📄 Divulgation : Document confidentiel envoyé au mauvais destinataire"
    ],
    tips: [
      "⚠️ Obligation critique : Notification CNIL dans les 72 heures si risque pour les personnes",
      "📊 Documentez TOUTES les violations, même sans notification CNIL",
      "🔍 La CNIL peut demander le registre des violations lors d'un contrôle",
      "📢 Si risque élevé : notification directe aux personnes concernées obligatoire",
      "💰 Non-notification = Amende jusqu'à 10M€ ou 2% du CA mondial",
      "🛡️ Mettez en place un processus de détection et réaction aux incidents",
      "📝 Évaluez la gravité selon : nature des données, nombre de personnes, possibilité d'exploitation",
      "🔒 Après l'incident : renforcez la sécurité pour éviter la récidive"
    ]
  }
};

export const traitementHelp = {
  nom: {
    title: "Nom du traitement",
    description: "Donnez un nom clair et explicite qui identifie facilement l'activité de traitement des données personnelles.",
    examples: [
      "Gestion du recrutement",
      "Suivi des candidatures",
      "Gestion de la paie",
      "Marketing et prospection commerciale",
      "Gestion des clients et facturation",
      "Contrôle d'accès des employés"
    ],
    tips: [
      "Utilisez un nom court mais descriptif",
      "Évitez les acronymes incompréhensibles",
      "Le nom doit permettre d'identifier immédiatement l'activité"
    ]
  },
  finalite: {
    title: "Finalité du traitement",
    description: "Décrivez précisément l'objectif et la raison d'être du traitement. La finalité doit être déterminée, explicite et légitime (principe fondamental du RGPD).",
    examples: [
      "Gérer le processus de recrutement depuis la réception des candidatures jusqu'à l'embauche",
      "Assurer le paiement des salaires et la gestion administrative du personnel",
      "Gérer la relation commerciale avec les clients (commandes, livraisons, facturation, SAV)",
      "Réaliser des campagnes de prospection commerciale par email auprès de prospects",
      "Assurer la sécurité des locaux et des personnes par contrôle des accès"
    ],
    tips: [
      "Soyez précis : évitez les formulations vagues comme 'améliorer nos services'",
      "Une finalité = un objectif clairement identifié",
      "Ne mélangez pas plusieurs finalités différentes dans un même traitement"
    ]
  },
  baseJuridique: {
    title: "Base juridique",
    description: "La base juridique est le fondement légal qui vous autorise à traiter les données personnelles. Chaque traitement DOIT avoir une base juridique valide selon l'article 6 du RGPD.",
    examples: [
      "Consentement → Newsletter marketing (opt-in obligatoire)",
      "Contrat → Gestion des commandes clients, livraison",
      "Obligation légale → Comptabilité, paie, déclarations fiscales",
      "Intérêt légitime → Prospection B2B, prévention de la fraude",
      "Mission d'intérêt public → Administration publique",
      "Sauvegarde des intérêts vitaux → Urgences médicales"
    ],
    tips: [
      "Le consentement doit être libre, spécifique, éclairé et univoque",
      "Le contrat s'applique uniquement si le traitement est NÉCESSAIRE à l'exécution",
      "L'intérêt légitime nécessite un test de proportionnalité (intérêt vs droits de la personne)"
    ]
  },
  personnesConcernees: {
    title: "Personnes concernées",
    description: "Identifiez les catégories de personnes dont vous traitez les données personnelles.",
    examples: [
      "Candidats à l'embauche",
      "Salariés actuels et anciens",
      "Clients et prospects",
      "Fournisseurs et sous-traitants",
      "Visiteurs du site web",
      "Patients",
      "Élèves et parents d'élèves",
      "Utilisateurs de l'application mobile"
    ],
    tips: [
      "Listez toutes les catégories concernées",
      "Utilisez des termes clairs et compréhensibles",
      "Distinguez les différentes catégories si leurs données sont traitées différemment"
    ]
  },
  categoriesDonnees: {
    title: "Catégories de données",
    description: "Listez les types de données personnelles collectées et traitées. Soyez exhaustif mais évitez le superflu (principe de minimisation).",
    examples: [
      "Identité : nom, prénom, date de naissance, photo",
      "Coordonnées : adresse postale, email, téléphone",
      "Vie professionnelle : CV, diplômes, expériences, salaire",
      "Données économiques : numéro de compte bancaire, historique d'achats",
      "Connexion : adresse IP, logs, cookies",
      "Localisation : GPS, adresse",
      "Données sensibles (art. 9) : santé, origine, opinions politiques (nécessitent des garanties renforcées)"
    ],
    tips: [
      "Ne collectez que les données strictement nécessaires à la finalité",
      "Les données sensibles (article 9 RGPD) nécessitent un consentement explicite ou une exception légale",
      "Documentez pourquoi chaque donnée est nécessaire"
    ]
  },
  destinataires: {
    title: "Destinataires des données",
    description: "Indiquez toutes les personnes, services ou organismes qui accèdent aux données ou à qui elles sont transmises.",
    examples: [
      "Service RH interne",
      "Service marketing et commercial",
      "Prestataire d'hébergement (ex: AWS, OVH)",
      "Outil de CRM (ex: Salesforce, HubSpot)",
      "Expert-comptable externe",
      "Organismes sociaux (URSSAF, caisse de retraite)",
      "Autorités judiciaires (sur demande légale)",
      "Partenaires commerciaux"
    ],
    tips: [
      "Distinguez les destinataires internes (services de votre entreprise) et externes",
      "Mentionnez les sous-traitants (ils doivent avoir un contrat conforme RGPD)",
      "Si transfert hors UE, vérifiez les garanties (clause contractuelle type, etc.)"
    ]
  },
  transfertHorsUE: {
    title: "Transfert hors Union Européenne",
    description: "Si vous transférez des données vers un pays hors UE/EEE, vous devez identifier le pays et les garanties mises en place (exigence RGPD Chapitre V).",
    examples: [
      "États-Unis : Clauses Contractuelles Types (CCT) + mesures complémentaires",
      "Royaume-Uni : Décision d'adéquation",
      "Suisse : Décision d'adéquation",
      "Inde : CCT obligatoires",
      "Canada : Selon la province, CCT ou adéquation partielle"
    ],
    tips: [
      "Vérifiez si le pays bénéficie d'une décision d'adéquation de la Commission européenne",
      "Sinon, utilisez les Clauses Contractuelles Types (CCT/SCC)",
      "Après Schrems II, ajoutez une évaluation des risques et mesures complémentaires",
      "Les transferts vers les USA nécessitent une attention particulière depuis l'invalidation du Privacy Shield"
    ]
  },
  dureeConservation: {
    title: "Durée de conservation",
    description: "Précisez combien de temps vous conservez les données. Cette durée doit être justifiée et proportionnée à la finalité (principe de limitation de la conservation).",
    examples: [
      "Candidatures non retenues : 2 ans maximum",
      "Dossiers salariés : 5 ans après le départ (sauf bulletins de paie : 50 ans)",
      "Données clients : 3 ans après dernier contact (prospection B2C)",
      "Factures : 10 ans (obligation légale comptable)",
      "Données de connexion : 1 an maximum (obligation légale)",
      "Cookies analytics : 13 mois maximum"
    ],
    tips: [
      "Consultez les durées légales obligatoires (comptabilité, paie, etc.)",
      "Recommandation CNIL : 3 ans pour la prospection commerciale B2C",
      "Mettez en place un processus de suppression/archivage automatique",
      "Distinguez conservation active, archivage intermédiaire et archivage définitif"
    ]
  },
  mesuresSecurite: {
    title: "Mesures de sécurité",
    description: "Décrivez les mesures techniques et organisationnelles mises en place pour protéger les données contre les accès non autorisés, pertes ou destructions.",
    examples: [
      "Chiffrement des données au repos (AES-256)",
      "Chiffrement des communications (HTTPS/TLS)",
      "Authentification forte (2FA/MFA)",
      "Contrôle des accès (principe du moindre privilège)",
      "Sauvegarde quotidienne des données",
      "Journalisation et monitoring",
      "Pseudonymisation des données",
      "Formation du personnel à la sécurité",
      "Politique de mots de passe robuste",
      "Antivirus et pare-feu",
      "Tests d'intrusion réguliers"
    ],
    tips: [
      "Adaptez les mesures au niveau de risque (principe de proportionnalité)",
      "Combinez mesures techniques (chiffrement) et organisationnelles (formation)",
      "Documentez toutes vos mesures (preuve de conformité en cas de contrôle)",
      "Mettez à jour régulièrement vos mesures de sécurité"
    ]
  },
  statut: {
    title: "Statut du traitement",
    description: "Indiquez l'état de conformité du traitement.",
    examples: [
      "À jour : Le traitement est conforme et documenté",
      "Révision nécessaire : Le traitement doit être revu (changements, mise à jour)"
    ],
    tips: [
      "Révisez régulièrement vos traitements (au moins 1 fois par an)",
      "Passez en 'Révision nécessaire' en cas de modification de la finalité ou des données"
    ]
  }
};

export const demandeHelp = {
  typeDemande: {
    title: "Type de demande",
    description: "Identifiez le droit RGPD que la personne souhaite exercer. Chaque citoyen européen dispose de ces droits fondamentaux.",
    examples: [
      "Accès (Art. 15) : La personne veut savoir quelles données vous détenez sur elle",
      "Rectification (Art. 16) : Corriger des données inexactes ou incomplètes",
      "Effacement/Droit à l'oubli (Art. 17) : Supprimer les données (sous conditions)",
      "Portabilité (Art. 20) : Récupérer ses données dans un format exploitable",
      "Opposition (Art. 21) : S'opposer au traitement (prospection, intérêt légitime)",
      "Limitation (Art. 18) : Geler temporairement le traitement"
    ],
    tips: [
      "Vous avez 1 mois pour répondre (prolongeable de 2 mois si complexe)",
      "Le droit d'effacement n'est pas absolu (obligations légales, contentieux...)",
      "La portabilité ne concerne que les données fournies par la personne",
      "L'opposition à la prospection commerciale doit toujours être acceptée"
    ]
  },
  nomDemandeur: {
    title: "Nom du demandeur",
    description: "Nom complet de la personne qui exerce son droit.",
    examples: [
      "Marie Dupont",
      "Jean-Pierre Martin",
      "Société ABC (pour une personne morale si applicable)"
    ],
    tips: [
      "Vérifiez l'identité du demandeur avant de répondre",
      "Demandez une pièce d'identité en cas de doute (pour éviter les usurpations)",
      "Conservez la trace de cette vérification"
    ]
  },
  emailDemandeur: {
    title: "Email du demandeur",
    description: "Adresse email de contact du demandeur pour lui répondre.",
    examples: [
      "marie.dupont@email.com",
      "contact@entreprise.fr"
    ],
    tips: [
      "Assurez-vous que c'est bien l'email de la personne concernée",
      "Utilisez un canal sécurisé pour la réponse si données sensibles"
    ]
  },
  dateReception: {
    title: "Date de réception",
    description: "Date à laquelle vous avez reçu la demande. Cette date déclenche le délai légal de 1 mois pour répondre.",
    examples: [
      "15/01/2024",
      "Date du mail reçu",
      "Date du courrier postal"
    ],
    tips: [
      "La date de réception fait partir le délai légal de 1 mois",
      "Accusez réception de la demande auprès du demandeur",
      "Si la demande est incomplète, demandez les informations manquantes (le délai repart à la réception des infos)"
    ]
  },
  description: {
    title: "Description de la demande",
    description: "Détaillez la demande de la personne concernée. Soyez précis pour faciliter le traitement.",
    examples: [
      "La personne demande l'accès à toutes les données la concernant dans notre base clients",
      "Demande de rectification de l'adresse postale et du numéro de téléphone",
      "Demande de suppression de toutes les données suite à la fin du contrat",
      "Opposition à la réception de newsletters marketing",
      "Demande de portabilité de l'historique de commandes au format CSV"
    ],
    tips: [
      "Citez les éléments exacts de la demande du requérant",
      "Si la demande est floue, contactez la personne pour clarifier",
      "Conservez le message original (email, courrier)"
    ]
  },
  statut: {
    title: "Statut de la demande",
    description: "Suivez l'avancement du traitement de la demande.",
    examples: [
      "En cours : La demande est en cours de traitement",
      "Traitée : Vous avez répondu à la demande",
      "En attente : Vous attendez des informations complémentaires du demandeur"
    ],
    tips: [
      "Passez rapidement en 'En cours' pour ne pas oublier le délai",
      "Documentez toutes les actions effectuées",
      "Conservez la trace de votre réponse pendant au moins 3 ans"
    ]
  },
  reponse: {
    title: "Réponse apportée",
    description: "Décrivez la réponse que vous avez apportée au demandeur. Cette information est essentielle pour la traçabilité.",
    examples: [
      "Envoi d'un PDF avec toutes les données personnelles détenues (accès)",
      "Correction de l'adresse postale dans notre base CRM (rectification)",
      "Suppression complète des données de la base + confirmation par email (effacement)",
      "Désabonnement de toutes les newsletters + confirmation (opposition)",
      "Transmission de l'historique des commandes au format JSON (portabilité)"
    ],
    tips: [
      "Soyez factuel et précis",
      "Si refus (justifié), expliquez clairement les motifs légaux",
      "Informez toujours la personne de son droit de réclamation auprès de la CNIL",
      "Conservez une copie de la réponse envoyée"
    ]
  }
};

export const violationHelp = {
  titre: {
    title: "Titre de la violation",
    description: "Donnez un titre court et explicite qui résume l'incident de sécurité.",
    examples: [
      "Perte de clé USB contenant des données RH",
      "Accès non autorisé à la base clients",
      "Ransomware sur le serveur de fichiers",
      "Email envoyé en copie visible (erreur humaine)",
      "Vol d'ordinateur portable",
      "Fuite de données via API non sécurisée"
    ],
    tips: [
      "Soyez factuel, pas alarmiste",
      "Le titre doit permettre d'identifier rapidement l'incident",
      "Évitez les détails techniques complexes dans le titre"
    ]
  },
  description: {
    title: "Description de la violation",
    description: "Décrivez précisément ce qui s'est passé : nature de l'incident, circonstances de découverte, données concernées, causes identifiées.",
    examples: [
      "Un collaborateur a perdu une clé USB non chiffrée contenant 150 dossiers salariés complets lors d'un déplacement professionnel. Découvert le 15/01 lors du retour au bureau.",
      "Suite à une erreur de configuration, l'API de gestion clients était accessible sans authentification pendant 48h. Un chercheur en sécurité nous a alertés. 5000 clients potentiellement concernés.",
      "Un email marketing a été envoyé à 200 destinataires en copie visible (CC) au lieu de copie cachée (CCI), exposant les adresses email."
    ],
    tips: [
      "Plus vous êtes précis, plus l'analyse sera facile",
      "Identifiez la cause racine si possible",
      "Documentez le contexte de la découverte",
      "Cette description peut être demandée par la CNIL"
    ]
  },
  dateDetection: {
    title: "Date de détection",
    description: "Date exacte à laquelle vous avez découvert la violation. Cette date déclenche le délai de 72h pour notifier la CNIL.",
    examples: [
      "15/01/2024 à 14h30",
      "Date du signalement interne",
      "Date de l'alerte du système de monitoring"
    ],
    tips: [
      "⚠️ CRITIQUE : Vous avez 72 heures à partir de cette date pour notifier la CNIL",
      "Soyez précis sur l'heure si possible",
      "Ce n'est pas la date de l'incident, mais celle de sa DÉCOUVERTE"
    ]
  },
  gravite: {
    title: "Gravité de la violation",
    description: "Évaluez le niveau de risque pour les droits et libertés des personnes concernées. Cette évaluation détermine si notification à la CNIL et aux personnes est obligatoire.",
    examples: [
      "Critique : Données de santé de 1000 patients exposées publiquement → Notification CNIL + personnes obligatoire",
      "Élevée : Coordonnées bancaires compromises → Notification CNIL obligatoire, personnes probable",
      "Moyenne : Adresses emails exposées sans autre donnée → Notification CNIL selon contexte",
      "Faible : Erreur corrigée en 5 minutes, aucune exploitation → Documenter, notification non requise"
    ],
    tips: [
      "Évaluez le risque réel, pas le risque théorique",
      "Prenez en compte : nature des données, nombre de personnes, possibilité d'exploitation",
      "En cas de doute, consultez votre DPO ou un avocat spécialisé",
      "Si risque élevé pour les personnes, notification directe obligatoire"
    ]
  },
  typeDonnees: {
    title: "Types de données concernées",
    description: "Listez précisément les catégories de données personnelles impactées par la violation.",
    examples: [
      "Nom, prénom, date de naissance",
      "Adresses email et numéros de téléphone",
      "Coordonnées bancaires (IBAN)",
      "Données de santé (pathologies, traitements)",
      "Mots de passe (hachés ou en clair)",
      "Numéros de sécurité sociale",
      "Adresses IP et logs de connexion"
    ],
    tips: [
      "Soyez exhaustif pour évaluer correctement la gravité",
      "Distinguez données ordinaires et données sensibles (art. 9 RGPD)",
      "Précisez si les données étaient chiffrées, pseudonymisées ou en clair",
      "Plus les données sont sensibles, plus le risque est élevé"
    ]
  },
  personnesImpactees: {
    title: "Nombre de personnes impactées",
    description: "Indiquez le nombre de personnes concernées par la violation. Ce critère est essentiel pour évaluer la gravité.",
    examples: [
      "1 personne (ex: envoi d'email à mauvais destinataire)",
      "50 personnes (ex: liste exposée)",
      "5 000 personnes (ex: base de données compromise)",
      "100 000+ personnes (ex: cyberattaque majeure)"
    ],
    tips: [
      "Si vous ne connaissez pas le nombre exact, donnez une estimation",
      "Plus le nombre est élevé, plus la notification CNIL est probable",
      "Documentez comment vous avez calculé ce chiffre"
    ]
  },
  mesuresPrises: {
    title: "Mesures correctives prises",
    description: "Détaillez toutes les actions mises en œuvre pour stopper la violation, limiter les dégâts et éviter qu'elle se reproduise.",
    examples: [
      "Isolation immédiate du serveur compromis",
      "Réinitialisation de tous les mots de passe",
      "Fermeture de l'API non sécurisée",
      "Chiffrement de toutes les clés USB",
      "Formation du personnel sur l'envoi d'emails",
      "Mise en place d'une authentification à deux facteurs",
      "Audit de sécurité complet par un prestataire externe",
      "Modification des processus internes"
    ],
    tips: [
      "Distinguez mesures immédiates (containment) et mesures long terme",
      "Ces informations doivent être communiquées à la CNIL",
      "Documentez qui a fait quoi et quand",
      "Montrez votre proactivité et votre sérieux"
    ]
  },
  notificationCNIL: {
    title: "Notification à la CNIL",
    description: "Indiquez si vous avez notifié la violation à la CNIL. Obligation légale dans les 72h si risque pour les personnes.",
    examples: [
      "Oui : Notifié via le site CNIL le 16/01/2024",
      "Non : Violation de gravité faible, documentation interne uniquement"
    ],
    tips: [
      "⚠️ Délai légal : 72 heures après détection",
      "Si dépassement, justifiez le retard dans la notification",
      "Notification obligatoire sauf si risque faible pour les droits des personnes",
      "Amende possible jusqu'à 10M€ ou 2% du CA en cas de non-notification"
    ]
  },
  dateNotificationCNIL: {
    title: "Date de notification CNIL",
    description: "Date à laquelle vous avez effectué la notification officielle à la CNIL.",
    examples: [
      "16/01/2024 (dans les 72h)",
      "20/01/2024 (avec justification du retard dans le formulaire CNIL)"
    ],
    tips: [
      "Conservez le récépissé de la CNIL",
      "Si notification tardive, expliquez les raisons",
      "La CNIL peut demander des informations complémentaires"
    ]
  },
  notificationPersonnes: {
    title: "Notification aux personnes concernées",
    description: "Indiquez si vous avez informé directement les personnes impactées. Obligatoire si risque ÉLEVÉ pour leurs droits et libertés.",
    examples: [
      "Oui : Email envoyé à toutes les personnes concernées le 17/01/2024",
      "Non : Risque faible, mesures de sécurité suffisantes, notification non requise"
    ],
    tips: [
      "Notification obligatoire si risque ÉLEVÉ (usurpation d'identité, discrimination, etc.)",
      "Le message doit être clair, en français, sans jargon technique",
      "Informez des mesures prises et des recommandations (ex: changer mot de passe)",
      "Exceptions : effort disproportionné, mesures de protection (chiffrement), mesures ultérieures"
    ]
  },
  statut: {
    title: "Statut de la violation",
    description: "Suivez l'état de traitement de l'incident.",
    examples: [
      "Nouvelle : Violation détectée, analyse en cours",
      "En cours : Mesures correctives en cours de déploiement",
      "Résolue : Violation traitée, mesures en place, documentation complète"
    ],
    tips: [
      "Ne passez en 'Résolue' que lorsque tout est terminé",
      "Même résolue, conservez la documentation pendant au moins 3 ans",
      "La CNIL peut demander le registre des violations lors d'un contrôle"
    ]
  }
};