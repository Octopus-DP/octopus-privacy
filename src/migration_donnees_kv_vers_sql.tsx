// =====================================================
// SCRIPT DE MIGRATION DES DONNÉES
// KV Store → Base de données relationnelle PostgreSQL
// =====================================================
//
// Ce script migre toutes les données existantes du KV store
// vers les nouvelles tables SQL.
//
// ATTENTION : À exécuter dans un environnement de développement/staging
// avant la production !
//
// =====================================================

import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

// Configuration Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================

function log(message: string, data?: any) {
  console.log(`[MIGRATION] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

function logError(message: string, error: any) {
  console.error(`[MIGRATION ERROR] ${message}`, error);
}

function logSuccess(message: string, count?: number) {
  console.log(`[MIGRATION SUCCESS] ${message}${count ? ` (${count} enregistrements)` : ''}`);
}

// =====================================================
// 1. MIGRATION DES CLIENTS
// =====================================================

async function migrateClients() {
  log('Starting clients migration...');
  
  try {
    const kvClients = await kv.getByPrefix('client:');
    log(`Found ${kvClients.length} clients in KV store`);
    
    for (const kvClient of kvClients) {
      const client = {
        id: kvClient.id,
        code: kvClient.code,
        name: kvClient.name,
        contact_name: kvClient.contactName || null,
        contact_email: kvClient.contactEmail || null,
        contact_phone: kvClient.contactPhone || null,
        address: kvClient.address || null,
        siren: kvClient.siren || null,
        siret: kvClient.siret || null,
        status: kvClient.status || 'active',
        subscription_plan: kvClient.subscriptionPlan || null,
        subscription_start_date: kvClient.subscriptionStartDate || null,
        subscription_end_date: kvClient.subscriptionEndDate || null,
        max_users: kvClient.maxUsers || 10,
        features: kvClient.features || {},
        created_at: kvClient.createdAt || new Date().toISOString(),
        updated_at: kvClient.updatedAt || new Date().toISOString(),
        created_by: kvClient.createdBy || null,
        notes: kvClient.notes || null,
      };
      
      const { error } = await supabase
        .from('clients')
        .upsert(client, { onConflict: 'id' });
      
      if (error) {
        logError(`Failed to migrate client ${client.id}`, error);
      }
    }
    
    logSuccess('Clients migrated', kvClients.length);
    return kvClients.length;
  } catch (error) {
    logError('Clients migration failed', error);
    throw error;
  }
}

// =====================================================
// 2. MIGRATION DES ENTITÉS JURIDIQUES
// =====================================================

async function migrateLegalEntities() {
  log('Starting legal entities migration...');
  
  try {
    const kvEntities = await kv.getByPrefix('legal_entity:');
    log(`Found ${kvEntities.length} legal entities in KV store`);
    
    for (const kvEntity of kvEntities) {
      const entity = {
        id: kvEntity.id,
        client_id: kvEntity.clientId,
        client_code: kvEntity.clientCode,
        name: kvEntity.name,
        legal_form: kvEntity.legalForm || null,
        siren: kvEntity.siren || null,
        siret: kvEntity.siret || null,
        address: kvEntity.address || null,
        city: kvEntity.city || null,
        postal_code: kvEntity.postalCode || null,
        country: kvEntity.country || 'France',
        dpo_name: kvEntity.dpoName || null,
        dpo_email: kvEntity.dpoEmail || null,
        dpo_phone: kvEntity.dpoPhone || null,
        representative_name: kvEntity.representativeName || null,
        representative_email: kvEntity.representativeEmail || null,
        is_active: kvEntity.isActive !== false,
        created_at: kvEntity.createdAt || new Date().toISOString(),
        updated_at: kvEntity.updatedAt || new Date().toISOString(),
        created_by: kvEntity.createdBy || null,
      };
      
      const { error } = await supabase
        .from('legal_entities')
        .upsert(entity, { onConflict: 'id' });
      
      if (error) {
        logError(`Failed to migrate legal entity ${entity.id}`, error);
      }
    }
    
    logSuccess('Legal entities migrated', kvEntities.length);
    return kvEntities.length;
  } catch (error) {
    logError('Legal entities migration failed', error);
    throw error;
  }
}

// =====================================================
// 3. MIGRATION DES UTILISATEURS
// =====================================================

async function migrateUsers() {
  log('Starting users migration...');
  
  try {
    const kvUsers = await kv.getByPrefix('user:');
    log(`Found ${kvUsers.length} users in KV store`);
    
    for (const kvUser of kvUsers) {
      const user = {
        id: kvUser.id,
        email: kvUser.email,
        name: kvUser.name || null,
        role: kvUser.role,
        client_id: kvUser.clientId || null,
        client_code: kvUser.clientCode || null,
        client_name: kvUser.clientName || null,
        is_active: kvUser.isActive !== false,
        permissions: kvUser.permissions || {},
        last_login: kvUser.lastLogin || null,
        password_change_required: kvUser.passwordChangeRequired || false,
        created_at: kvUser.createdAt || new Date().toISOString(),
        updated_at: kvUser.updatedAt || new Date().toISOString(),
        created_by: kvUser.createdBy || null,
      };
      
      const { error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'id' });
      
      if (error) {
        logError(`Failed to migrate user ${user.id}`, error);
      }
    }
    
    logSuccess('Users migrated', kvUsers.length);
    return kvUsers.length;
  } catch (error) {
    logError('Users migration failed', error);
    throw error;
  }
}

// =====================================================
// 4. MIGRATION DES ADMINS SYSTÈME
// =====================================================

async function migrateSystemAdmins() {
  log('Starting system admins migration...');
  
  try {
    const admins = await kv.get('admins') || [];
    log(`Found ${admins.length} system admins in KV store`);
    
    for (const email of admins) {
      const { error } = await supabase
        .from('system_admins')
        .upsert({ email, created_at: new Date().toISOString() }, { onConflict: 'email' });
      
      if (error) {
        logError(`Failed to migrate admin ${email}`, error);
      }
    }
    
    logSuccess('System admins migrated', admins.length);
    return admins.length;
  } catch (error) {
    logError('System admins migration failed', error);
    throw error;
  }
}

// =====================================================
// 5. MIGRATION DES TRAITEMENTS
// =====================================================

async function migrateTraitements() {
  log('Starting traitements migration...');
  
  try {
    const kvTraitements = await kv.getByPrefix('traitement:');
    log(`Found ${kvTraitements.length} traitements in KV store`);
    
    for (const kvTraitement of kvTraitements) {
      const traitement = {
        id: kvTraitement.id,
        client_id: kvTraitement.clientId,
        client_code: kvTraitement.clientCode,
        entity_id: kvTraitement.entityId || null,
        entity_name: kvTraitement.entityName || null,
        name: kvTraitement.name,
        description: kvTraitement.description || null,
        purpose: kvTraitement.purpose || null,
        legal_basis: kvTraitement.legalBasis || null,
        data_categories: kvTraitement.dataCategories || [],
        data_subjects: kvTraitement.dataSubjects || [],
        sensitive_data: kvTraitement.sensitiveData || false,
        responsible_person: kvTraitement.responsiblePerson || null,
        responsible_email: kvTraitement.responsibleEmail || null,
        dpo_informed: kvTraitement.dpoInformed || false,
        retention_period: kvTraitement.retentionPeriod || null,
        security_measures: kvTraitement.securityMeasures || null,
        has_transfers: kvTraitement.hasTransfers || false,
        transfer_countries: kvTraitement.transferCountries || [],
        transfer_guarantees: kvTraitement.transferGuarantees || null,
        risk_level: kvTraitement.riskLevel || 'low',
        pia_required: kvTraitement.piaRequired || false,
        pia_completed: kvTraitement.piaCompleted || false,
        pia_date: kvTraitement.piaDate || null,
        status: kvTraitement.status || 'active',
        version: kvTraitement.version || 1,
        created_at: kvTraitement.createdAt || new Date().toISOString(),
        updated_at: kvTraitement.updatedAt || new Date().toISOString(),
        created_by: kvTraitement.createdBy || null,
        updated_by: kvTraitement.updatedBy || null,
      };
      
      const { error } = await supabase
        .from('traitements')
        .upsert(traitement, { onConflict: 'id' });
      
      if (error) {
        logError(`Failed to migrate traitement ${traitement.id}`, error);
      }
    }
    
    logSuccess('Traitements migrated', kvTraitements.length);
    return kvTraitements.length;
  } catch (error) {
    logError('Traitements migration failed', error);
    throw error;
  }
}

// =====================================================
// 6. MIGRATION DES DEMANDES
// =====================================================

async function migrateDemandes() {
  log('Starting demandes migration...');
  
  try {
    const kvDemandes = await kv.getByPrefix('demande:');
    log(`Found ${kvDemandes.length} demandes in KV store`);
    
    for (const kvDemande of kvDemandes) {
      const demande = {
        id: kvDemande.id,
        client_id: kvDemande.clientId,
        client_code: kvDemande.clientCode,
        entity_id: kvDemande.entityId || null,
        entity_name: kvDemande.entityName || null,
        requester_name: kvDemande.requesterName || kvDemande.nom || 'Unknown',
        email: kvDemande.email,
        phone: kvDemande.phone || kvDemande.telephone || null,
        request_type: kvDemande.requestType || kvDemande.typeDemande || 'other',
        description: kvDemande.description || kvDemande.objet || null,
        date_received: kvDemande.dateReceived || kvDemande.dateDemande || new Date().toISOString(),
        deadline: kvDemande.deadline || kvDemande.dateEcheance || null,
        date_completed: kvDemande.dateCompleted || null,
        status: kvDemande.status || kvDemande.statut || 'pending',
        assigned_to: kvDemande.assignedTo || null,
        response: kvDemande.response || kvDemande.reponse || null,
        identity_verified: kvDemande.identityVerified || false,
        verification_method: kvDemande.verificationMethod || null,
        priority: kvDemande.priority || 'normal',
        created_at: kvDemande.createdAt || new Date().toISOString(),
        updated_at: kvDemande.updatedAt || new Date().toISOString(),
        created_by: kvDemande.createdBy || null,
        updated_by: kvDemande.updatedBy || null,
      };
      
      const { error } = await supabase
        .from('demandes')
        .upsert(demande, { onConflict: 'id' });
      
      if (error) {
        logError(`Failed to migrate demande ${demande.id}`, error);
      }
    }
    
    logSuccess('Demandes migrated', kvDemandes.length);
    return kvDemandes.length;
  } catch (error) {
    logError('Demandes migration failed', error);
    throw error;
  }
}

// =====================================================
// 7. MIGRATION DES VIOLATIONS
// =====================================================

async function migrateViolations() {
  log('Starting violations migration...');
  
  try {
    const kvViolations = await kv.getByPrefix('violation:');
    log(`Found ${kvViolations.length} violations in KV store`);
    
    for (const kvViolation of kvViolations) {
      const violation = {
        id: kvViolation.id,
        client_id: kvViolation.clientId,
        client_code: kvViolation.clientCode,
        entity_id: kvViolation.entityId || null,
        entity_name: kvViolation.entityName || null,
        title: kvViolation.title || kvViolation.titre || 'Violation sans titre',
        description: kvViolation.description || null,
        date_detected: kvViolation.dateDetected || kvViolation.dateDetection || new Date().toISOString(),
        date_occurred: kvViolation.dateOccurred || kvViolation.dateIncident || null,
        violation_type: kvViolation.violationType || kvViolation.typeViolation || null,
        severity: kvViolation.severity || kvViolation.gravite || 'medium',
        data_categories: kvViolation.dataCategories || kvViolation.donneesAffectees || [],
        number_affected: kvViolation.numberAffected || kvViolation.nombrePersonnes || null,
        sensitive_data_involved: kvViolation.sensitiveDataInvolved || kvViolation.donneesSensibles || false,
        impact_description: kvViolation.impactDescription || kvViolation.impact || null,
        consequences: kvViolation.consequences || null,
        immediate_measures: kvViolation.immediateMeasures || kvViolation.mesuresImmédiates || null,
        corrective_measures: kvViolation.correctiveMeasures || kvViolation.mesuresCorrectives || null,
        preventive_measures: kvViolation.preventiveMeasures || null,
        cnil_notified: kvViolation.cnilNotified || kvViolation.notificationCNIL || false,
        cnil_notification_date: kvViolation.cnilNotificationDate || kvViolation.dateNotificationCNIL || null,
        cnil_reference: kvViolation.cnilReference || null,
        individuals_notified: kvViolation.individualsNotified || kvViolation.notificationPersonnes || false,
        individuals_notification_date: kvViolation.individualsNotificationDate || null,
        status: kvViolation.status || kvViolation.statut || 'open',
        created_at: kvViolation.createdAt || new Date().toISOString(),
        updated_at: kvViolation.updatedAt || new Date().toISOString(),
        created_by: kvViolation.createdBy || null,
        updated_by: kvViolation.updatedBy || null,
      };
      
      const { error } = await supabase
        .from('violations')
        .upsert(violation, { onConflict: 'id' });
      
      if (error) {
        logError(`Failed to migrate violation ${violation.id}`, error);
      }
    }
    
    logSuccess('Violations migrated', kvViolations.length);
    return kvViolations.length;
  } catch (error) {
    logError('Violations migration failed', error);
    throw error;
  }
}

// =====================================================
// 8. MIGRATION DES TEMPLATES DE PHISHING
// =====================================================

async function migratePhishingTemplates() {
  log('Starting phishing templates migration...');
  
  try {
    const kvTemplates = await kv.getByPrefix('phishing_template:');
    log(`Found ${kvTemplates.length} phishing templates in KV store`);
    
    for (const kvTemplate of kvTemplates) {
      const template = {
        id: kvTemplate.id,
        client_code: kvTemplate.clientCode || null,
        name: kvTemplate.name,
        category: kvTemplate.category || 'custom',
        description: kvTemplate.description || null,
        sender_name: kvTemplate.senderName || 'Service IT',
        sender_email: kvTemplate.senderEmail || 'noreply@phishing-test.local',
        subject: kvTemplate.subject,
        html_content: kvTemplate.htmlContent,
        text_content: kvTemplate.textContent || null,
        available_variables: kvTemplate.availableVariables || ['Prénom', 'Nom', 'Nom_entreprise'],
        is_global: kvTemplate.isGlobal || false,
        is_active: kvTemplate.isActive !== false,
        created_at: kvTemplate.createdAt || new Date().toISOString(),
        updated_at: kvTemplate.updatedAt || new Date().toISOString(),
        created_by: kvTemplate.createdBy || null,
        updated_by: kvTemplate.updatedBy || null,
      };
      
      const { error } = await supabase
        .from('phishing_templates')
        .upsert(template, { onConflict: 'id' });
      
      if (error) {
        logError(`Failed to migrate phishing template ${template.id}`, error);
      }
    }
    
    logSuccess('Phishing templates migrated', kvTemplates.length);
    return kvTemplates.length;
  } catch (error) {
    logError('Phishing templates migration failed', error);
    throw error;
  }
}

// =====================================================
// 9. MIGRATION DES CAMPAGNES DE PHISHING
// =====================================================

async function migratePhishingCampaigns() {
  log('Starting phishing campaigns migration...');
  
  try {
    const kvCampaigns = await kv.getByPrefix('phishing_campaign:');
    log(`Found ${kvCampaigns.length} phishing campaigns in KV store`);
    
    for (const kvCampaign of kvCampaigns) {
      const campaign = {
        id: kvCampaign.id,
        client_id: kvCampaign.clientId,
        client_code: kvCampaign.clientCode,
        client_name: kvCampaign.clientName || null,
        name: kvCampaign.name,
        description: kvCampaign.description || null,
        objective: kvCampaign.objective || 'general_awareness',
        entity_id: kvCampaign.entityId || null,
        responsible_email: kvCampaign.responsibleEmail || null,
        template_id: kvCampaign.templateId || null,
        landing_page_id: kvCampaign.landingPageId || null,
        start_date: kvCampaign.startDate || null,
        end_date: kvCampaign.endDate || null,
        send_mode: kvCampaign.sendMode || 'immediate',
        tracking: kvCampaign.tracking || { opens: true, clicks: true, submissions: true, reports: true },
        privacy: kvCampaign.privacy || { granularity: 'individual', anonymize: false },
        auto_sensitization: kvCampaign.autoSensitization || { enabled: false },
        status: kvCampaign.status || 'draft',
        recipient_count: kvCampaign.recipientCount || 0,
        created_at: kvCampaign.createdAt || new Date().toISOString(),
        updated_at: kvCampaign.updatedAt || new Date().toISOString(),
        created_by: kvCampaign.createdBy || null,
        launched_at: kvCampaign.launchedAt || null,
        launched_by: kvCampaign.launchedBy || null,
        stopped_at: kvCampaign.stoppedAt || null,
        stopped_by: kvCampaign.stoppedBy || null,
      };
      
      const { error } = await supabase
        .from('phishing_campaigns')
        .upsert(campaign, { onConflict: 'id' });
      
      if (error) {
        logError(`Failed to migrate phishing campaign ${campaign.id}`, error);
      }
    }
    
    logSuccess('Phishing campaigns migrated', kvCampaigns.length);
    return kvCampaigns.length;
  } catch (error) {
    logError('Phishing campaigns migration failed', error);
    throw error;
  }
}

// =====================================================
// 10. MIGRATION DES DESTINATAIRES DE PHISHING
// =====================================================

async function migratePhishingRecipients() {
  log('Starting phishing recipients migration...');
  
  try {
    const kvRecipients = await kv.getByPrefix('phishing_recipient:');
    log(`Found ${kvRecipients.length} phishing recipients in KV store`);
    
    for (const kvRecipient of kvRecipients) {
      const recipient = {
        id: kvRecipient.id,
        campaign_id: kvRecipient.campaignId,
        email: kvRecipient.email,
        name: kvRecipient.name || null,
        department: kvRecipient.department || null,
        site: kvRecipient.site || null,
        opened: kvRecipient.opened || false,
        clicked: kvRecipient.clicked || false,
        submitted: kvRecipient.submitted || false,
        reported: kvRecipient.reported || false,
        opened_at: kvRecipient.openedAt || null,
        clicked_at: kvRecipient.clickedAt || null,
        submitted_at: kvRecipient.submittedAt || null,
        reported_at: kvRecipient.reportedAt || null,
        status: kvRecipient.status || 'pending',
        created_at: kvRecipient.createdAt || new Date().toISOString(),
        email_sent_at: kvRecipient.emailSentAt || null,
        email_error: kvRecipient.emailError || null,
      };
      
      const { error } = await supabase
        .from('phishing_recipients')
        .upsert(recipient, { onConflict: 'id' });
      
      if (error) {
        logError(`Failed to migrate phishing recipient ${recipient.id}`, error);
      }
    }
    
    logSuccess('Phishing recipients migrated', kvRecipients.length);
    return kvRecipients.length;
  } catch (error) {
    logError('Phishing recipients migration failed', error);
    throw error;
  }
}

// =====================================================
// FONCTION PRINCIPALE DE MIGRATION
// =====================================================

export async function runFullMigration() {
  console.log('====================================================');
  console.log('MIGRATION KV STORE → POSTGRESQL');
  console.log('====================================================');
  console.log('');
  
  const startTime = Date.now();
  const stats: Record<string, number> = {};
  
  try {
    // Ordre important : d'abord les tables sans dépendances, puis celles avec FK
    
    stats.clients = await migrateClients();
    stats.legalEntities = await migrateLegalEntities();
    stats.users = await migrateUsers();
    stats.systemAdmins = await migrateSystemAdmins();
    stats.traitements = await migrateTraitements();
    stats.demandes = await migrateDemandes();
    stats.violations = await migrateViolations();
    stats.phishingTemplates = await migratePhishingTemplates();
    stats.phishingCampaigns = await migratePhishingCampaigns();
    stats.phishingRecipients = await migratePhishingRecipients();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('');
    console.log('====================================================');
    console.log('MIGRATION COMPLETED SUCCESSFULLY');
    console.log('====================================================');
    console.log('');
    console.log('Statistics:');
    console.log(`- Clients: ${stats.clients}`);
    console.log(`- Legal Entities: ${stats.legalEntities}`);
    console.log(`- Users: ${stats.users}`);
    console.log(`- System Admins: ${stats.systemAdmins}`);
    console.log(`- Traitements: ${stats.traitements}`);
    console.log(`- Demandes: ${stats.demandes}`);
    console.log(`- Violations: ${stats.violations}`);
    console.log(`- Phishing Templates: ${stats.phishingTemplates}`);
    console.log(`- Phishing Campaigns: ${stats.phishingCampaigns}`);
    console.log(`- Phishing Recipients: ${stats.phishingRecipients}`);
    console.log('');
    console.log(`Total duration: ${duration}s`);
    console.log('');
    
    return stats;
  } catch (error) {
    logError('Migration failed', error);
    throw error;
  }
}

// Exécuter la migration si ce fichier est exécuté directement
if (import.meta.main) {
  runFullMigration()
    .then(() => {
      console.log('✅ Migration completed successfully');
      Deno.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      Deno.exit(1);
    });
}
