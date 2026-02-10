import * as kv from "./kv_store.tsx";

// Default phishing templates
export const DEFAULT_TEMPLATES = [
  {
    id: 'TPL_DELIVERY',
    name: 'Livraison de colis',
    category: 'delivery',
    senderName: 'Service Livraison',
    senderEmail: 'livraison@courrier-express.com',
    subject: 'Votre colis est en attente de livraison',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8b500; padding: 20px; text-align: center; }
    .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
    .button { display: inline-block; padding: 12px 30px; background: #f8b500; color: #000; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; color:#000;">📦 Courrier Express</h1>
    </div>
    <div class="content">
      <p>Bonjour {{Prénom}} {{Nom}},</p>
      <p>Nous avons tenté de livrer votre colis à votre adresse, mais personne n'était présent.</p>
      <p><strong>Numéro de suivi :</strong> CE-{{random}}</p>
      <p>Pour reprogrammer votre livraison, veuillez cliquer sur le lien ci-dessous dans les 48 heures :</p>
      <center>
        <a href="{{tracking_link}}" class="button">Reprogrammer ma livraison</a>
      </center>
      <p>Sans action de votre part, votre colis sera retourné à l'expéditeur.</p>
    </div>
    <div class="footer">
      <p>Courrier Express - Service Client</p>
    </div>
  </div>
</body>
</html>
    `,
    textContent: 'Bonjour, votre colis est en attente. Cliquez sur le lien pour reprogrammer la livraison.',
    isGlobal: true,
    clientCode: 'GLOBAL'
  },
  {
    id: 'TPL_PASSWORD',
    name: 'Mise à jour du mot de passe',
    category: 'security',
    senderName: 'Service IT',
    senderEmail: 'it-security@{{company_domain}}',
    subject: 'Action requise : Mise à jour de votre mot de passe',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; padding: 20px; text-align: center; color: white; }
    .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
    .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #dc2626; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">🔒 Sécurité IT - {{Nom_entreprise}}</h1>
    </div>
    <div class="content">
      <p>Bonjour {{Prénom}} {{Nom}},</p>
      <div class="alert">
        <strong>⚠️ Action requise dans les 24 heures</strong>
      </div>
      <p>Dans le cadre de notre nouvelle politique de sécurité, vous devez mettre à jour votre mot de passe.</p>
      <p>Votre compte sera suspendu si vous ne procédez pas à cette mise à jour avant le <strong>{{deadline}}</strong>.</p>
      <center>
        <a href="{{tracking_link}}" class="button">Mettre à jour mon mot de passe</a>
      </center>
      <p>Si vous ne procédez pas à cette mise à jour, votre accès aux systèmes de l'entreprise sera temporairement bloqué.</p>
      <p>Merci de votre compréhension.</p>
    </div>
    <div class="footer">
      <p>Service IT - {{Nom_entreprise}}</p>
      <p>Ne répondez pas à cet e-mail</p>
    </div>
  </div>
</body>
</html>
    `,
    textContent: 'Action requise : Mettez à jour votre mot de passe dans les 24 heures.',
    isGlobal: true,
    clientCode: 'GLOBAL'
  },
  {
    id: 'TPL_INVOICE',
    name: 'Facture en attente',
    category: 'finance',
    senderName: 'Service Comptabilité',
    senderEmail: 'comptabilite@factures-en-ligne.com',
    subject: 'Facture impayée - Action requise',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e40af; padding: 20px; text-align: center; color: white; }
    .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
    .invoice { background: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; padding: 12px 30px; background: #1e40af; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">📄 Factures en Ligne</h1>
    </div>
    <div class="content">
      <p>Madame, Monsieur,</p>
      <p>Nous vous informons qu'une facture reste impayée sur votre compte.</p>
      <div class="invoice">
        <p><strong>Facture N° :</strong> FE-{{random}}</p>
        <p><strong>Montant :</strong> {{amount}} €</p>
        <p><strong>Date d'échéance :</strong> {{date}}</p>
      </div>
      <p>Pour éviter des frais de retard, veuillez consulter et régler cette facture dans les plus brefs délais :</p>
      <center>
        <a href="{{tracking_link}}" class="button">Consulter ma facture</a>
      </center>
      <p>Si vous avez déjà procédé au paiement, merci de ne pas tenir compte de ce message.</p>
    </div>
    <div class="footer">
      <p>Factures en Ligne - Service Client</p>
    </div>
  </div>
</body>
</html>
    `,
    textContent: 'Facture impayée. Consultez votre facture en ligne.',
    isGlobal: true,
    clientCode: 'GLOBAL'
  },
  {
    id: 'TPL_HR_BONUS',
    name: 'Prime exceptionnelle RH',
    category: 'hr',
    senderName: 'Service RH',
    senderEmail: 'rh@{{company_domain}}',
    subject: 'Bonne nouvelle : Prime exceptionnelle 🎉',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; padding: 20px; text-align: center; color: white; }
    .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
    .highlight { background: #d1fae5; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center; }
    .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">🎉 Service RH - {{Nom_entreprise}}</h1>
    </div>
    <div class="content">
      <p>Bonjour {{Prénom}},</p>
      <p>Nous avons le plaisir de vous informer que vous faites partie des collaborateurs sélectionnés pour recevoir une <strong>prime exceptionnelle</strong> en reconnaissance de votre travail.</p>
      <div class="highlight">
        <h2 style="color:#10b981; margin:0;">Montant estimé : {{amount}} €</h2>
      </div>
      <p>Pour finaliser le versement de cette prime sur votre compte, nous avons besoin que vous confirmiez vos informations bancaires :</p>
      <center>
        <a href="{{tracking_link}}" class="button">Confirmer mes informations</a>
      </center>
      <p><em>Cette démarche doit être effectuée avant le {{deadline}} pour garantir le versement dans les délais.</em></p>
      <p>Toute l'équipe RH vous félicite !</p>
    </div>
    <div class="footer">
      <p>Service RH - {{Nom_entreprise}}</p>
    </div>
  </div>
</body>
</html>
    `,
    textContent: 'Bonne nouvelle ! Vous avez été sélectionné pour une prime exceptionnelle.',
    isGlobal: true,
    clientCode: 'GLOBAL'
  },
  {
    id: 'TPL_CEO_URGENT',
    name: 'Demande urgente de la direction',
    category: 'executive',
    senderName: '{{CEO_Name}}',
    senderEmail: 'direction@{{company_domain}}',
    subject: 'URGENT - Action immédiate requise',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #7c3aed; padding: 20px; text-align: center; color: white; }
    .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
    .urgent { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #7c3aed; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">Direction Générale - {{Nom_entreprise}}</h1>
    </div>
    <div class="content">
      <p>{{Prénom}},</p>
      <div class="urgent">
        <strong>🚨 MESSAGE URGENT</strong>
      </div>
      <p>Je suis actuellement en déplacement et j'ai besoin de votre aide immédiate pour une opération confidentielle.</p>
      <p>Je dois effectuer un virement urgent pour finaliser un contrat important, mais je n'ai pas accès à mes codes bancaires.</p>
      <p>Pouvez-vous traiter cette demande en priorité ? Tous les détails sont disponibles sur ce document sécurisé :</p>
      <center>
        <a href="{{tracking_link}}" class="button">Accéder au document</a>
      </center>
      <p>Merci de traiter cela dans l'heure. C'est confidentiel et urgent.</p>
      <p>{{CEO_Name}}<br>
      <em>Envoyé depuis mon iPhone</em></p>
    </div>
    <div class="footer">
      <p>{{Nom_entreprise}} - Confidentiel</p>
    </div>
  </div>
</body>
</html>
    `,
    textContent: 'Message urgent de la direction. Veuillez consulter le document joint.',
    isGlobal: true,
    clientCode: 'GLOBAL'
  }
];

// Initialize default templates in KV store
export async function initializeDefaultTemplates() {
  try {
    console.log('Initializing default phishing templates...');
    
    for (const template of DEFAULT_TEMPLATES) {
      const existing = await kv.get(`phishing_template:${template.id}`);
      
      if (!existing) {
        const templateData = {
          ...template,
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          updatedAt: new Date().toISOString()
        };
        
        await kv.set(`phishing_template:${template.id}`, templateData);
        console.log(`✓ Template initialized: ${template.name}`);
      } else {
        console.log(`- Template already exists: ${template.name}`);
      }
    }
    
    console.log('Default templates initialization complete!');
  } catch (error) {
    console.error('Error initializing default templates:', error);
  }
}
