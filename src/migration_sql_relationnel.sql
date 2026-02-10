-- =====================================================
-- MIGRATION OCTOPUS DATA & PRIVACY
-- Du système KV Store vers Base de données relationnelle
-- =====================================================
-- 
-- Ce script crée toutes les tables nécessaires pour
-- migrer l'application vers une architecture relationnelle
-- PostgreSQL optimisée avec indexes, contraintes et relations.
--
-- Version: 1.0
-- Date: 2024-12-04
-- =====================================================

-- =====================================================
-- 1. TABLES DE BASE (Clients et Utilisateurs)
-- =====================================================

-- Table des clients (entreprises clientes)
CREATE TABLE clients (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    siren VARCHAR(50),
    siret VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    subscription_plan VARCHAR(50),
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    max_users INTEGER DEFAULT 10,
    features JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    notes TEXT
);

-- Index pour recherche rapide
CREATE INDEX idx_clients_code ON clients(code);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_name ON clients(name);

-- =====================================================

-- Table des entités juridiques
CREATE TABLE legal_entities (
    id VARCHAR(100) PRIMARY KEY,
    client_id VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    client_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    legal_form VARCHAR(100),
    siren VARCHAR(50),
    siret VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'France',
    dpo_name VARCHAR(255),
    dpo_email VARCHAR(255),
    dpo_phone VARCHAR(50),
    representative_name VARCHAR(255),
    representative_email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

-- Index pour jointures et recherches
CREATE INDEX idx_legal_entities_client_id ON legal_entities(client_id);
CREATE INDEX idx_legal_entities_client_code ON legal_entities(client_code);
CREATE INDEX idx_legal_entities_name ON legal_entities(name);
CREATE INDEX idx_legal_entities_siren ON legal_entities(siren);

-- =====================================================

-- Table des utilisateurs
CREATE TABLE users (
    id VARCHAR(100) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'client_admin', 'client_user')),
    client_id VARCHAR(100) REFERENCES clients(id) ON DELETE CASCADE,
    client_code VARCHAR(50),
    client_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}',
    last_login TIMESTAMP,
    password_change_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

-- Index pour authentification et recherches
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_users_client_code ON users(client_code);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =====================================================

-- Table des administrateurs système
CREATE TABLE system_admins (
    email VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. TABLES RGPD (Registre, Demandes, Violations)
-- =====================================================

-- Table des traitements de données (registre RGPD)
CREATE TABLE traitements (
    id VARCHAR(100) PRIMARY KEY,
    client_id VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    client_code VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) REFERENCES legal_entities(id) ON DELETE SET NULL,
    entity_name VARCHAR(255),
    
    -- Informations générales
    name VARCHAR(255) NOT NULL,
    description TEXT,
    purpose TEXT,
    legal_basis VARCHAR(100),
    
    -- Données personnelles
    data_categories TEXT[],
    data_subjects TEXT[],
    sensitive_data BOOLEAN DEFAULT false,
    
    -- Responsables
    responsible_person VARCHAR(255),
    responsible_email VARCHAR(255),
    dpo_informed BOOLEAN DEFAULT false,
    
    -- Sécurité et conservation
    retention_period VARCHAR(100),
    security_measures TEXT,
    
    -- Transferts
    has_transfers BOOLEAN DEFAULT false,
    transfer_countries TEXT[],
    transfer_guarantees TEXT,
    
    -- Risques et PIA
    risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'medium', 'high')),
    pia_required BOOLEAN DEFAULT false,
    pia_completed BOOLEAN DEFAULT false,
    pia_date TIMESTAMP,
    
    -- Métadonnées
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'suspended')),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Index pour recherches et filtres
CREATE INDEX idx_traitements_client_id ON traitements(client_id);
CREATE INDEX idx_traitements_client_code ON traitements(client_code);
CREATE INDEX idx_traitements_entity_id ON traitements(entity_id);
CREATE INDEX idx_traitements_status ON traitements(status);
CREATE INDEX idx_traitements_risk_level ON traitements(risk_level);
CREATE INDEX idx_traitements_created_at ON traitements(created_at);

-- =====================================================

-- Table des demandes d'exercice de droits
CREATE TABLE demandes (
    id VARCHAR(100) PRIMARY KEY,
    client_id VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    client_code VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) REFERENCES legal_entities(id) ON DELETE SET NULL,
    entity_name VARCHAR(255),
    
    -- Informations du demandeur
    requester_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    
    -- Type de demande
    request_type VARCHAR(100) NOT NULL CHECK (request_type IN (
        'access', 'rectification', 'erasure', 'restriction', 
        'portability', 'opposition', 'automated_decision', 'other'
    )),
    description TEXT,
    
    -- Dates et délais
    date_received TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline TIMESTAMP,
    date_completed TIMESTAMP,
    
    -- Traitement
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'rejected', 'cancelled'
    )),
    assigned_to VARCHAR(255),
    response TEXT,
    
    -- Identité vérifiée
    identity_verified BOOLEAN DEFAULT false,
    verification_method VARCHAR(100),
    
    -- Métadonnées
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Index pour recherches et filtres
CREATE INDEX idx_demandes_client_id ON demandes(client_id);
CREATE INDEX idx_demandes_client_code ON demandes(client_code);
CREATE INDEX idx_demandes_entity_id ON demandes(entity_id);
CREATE INDEX idx_demandes_status ON demandes(status);
CREATE INDEX idx_demandes_request_type ON demandes(request_type);
CREATE INDEX idx_demandes_date_received ON demandes(date_received);
CREATE INDEX idx_demandes_deadline ON demandes(deadline);
CREATE INDEX idx_demandes_email ON demandes(email);

-- =====================================================

-- Table des violations de données
CREATE TABLE violations (
    id VARCHAR(100) PRIMARY KEY,
    client_id VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    client_code VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) REFERENCES legal_entities(id) ON DELETE SET NULL,
    entity_name VARCHAR(255),
    
    -- Informations générales
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date_detected TIMESTAMP NOT NULL,
    date_occurred TIMESTAMP,
    
    -- Type de violation
    violation_type VARCHAR(100) CHECK (violation_type IN (
        'confidentiality', 'integrity', 'availability', 'combined'
    )),
    severity VARCHAR(50) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Données concernées
    data_categories TEXT[],
    number_affected INTEGER,
    sensitive_data_involved BOOLEAN DEFAULT false,
    
    -- Impact
    impact_description TEXT,
    consequences TEXT,
    
    -- Mesures prises
    immediate_measures TEXT,
    corrective_measures TEXT,
    preventive_measures TEXT,
    
    -- Notifications
    cnil_notified BOOLEAN DEFAULT false,
    cnil_notification_date TIMESTAMP,
    cnil_reference VARCHAR(100),
    individuals_notified BOOLEAN DEFAULT false,
    individuals_notification_date TIMESTAMP,
    
    -- Statut
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN (
        'open', 'investigating', 'mitigated', 'resolved', 'closed'
    )),
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Index pour recherches et filtres
CREATE INDEX idx_violations_client_id ON violations(client_id);
CREATE INDEX idx_violations_client_code ON violations(client_code);
CREATE INDEX idx_violations_entity_id ON violations(entity_id);
CREATE INDEX idx_violations_status ON violations(status);
CREATE INDEX idx_violations_severity ON violations(severity);
CREATE INDEX idx_violations_date_detected ON violations(date_detected);
CREATE INDEX idx_violations_cnil_notified ON violations(cnil_notified);

-- =====================================================
-- 3. TABLES PHISHING
-- =====================================================

-- Table des templates d'emails de phishing
CREATE TABLE phishing_templates (
    id VARCHAR(100) PRIMARY KEY,
    client_code VARCHAR(50),
    
    -- Informations template
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'custom',
    description TEXT,
    
    -- Contenu email
    sender_name VARCHAR(255) DEFAULT 'Service IT',
    sender_email VARCHAR(255) DEFAULT 'noreply@phishing-test.local',
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    
    -- Variables disponibles
    available_variables TEXT[] DEFAULT ARRAY['Prénom', 'Nom', 'Nom_entreprise', 'CEO_Name', 'company_domain', 'random', 'amount', 'date', 'deadline'],
    
    -- Visibilité
    is_global BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Index
CREATE INDEX idx_phishing_templates_client_code ON phishing_templates(client_code);
CREATE INDEX idx_phishing_templates_category ON phishing_templates(category);
CREATE INDEX idx_phishing_templates_is_global ON phishing_templates(is_global);

-- =====================================================

-- Table des campagnes de phishing
CREATE TABLE phishing_campaigns (
    id VARCHAR(100) PRIMARY KEY,
    client_id VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    client_code VARCHAR(50) NOT NULL,
    client_name VARCHAR(255),
    
    -- Informations campagne
    name VARCHAR(255) NOT NULL,
    description TEXT,
    objective VARCHAR(100) DEFAULT 'general_awareness',
    
    -- Configuration
    entity_id VARCHAR(100) REFERENCES legal_entities(id) ON DELETE SET NULL,
    responsible_email VARCHAR(255),
    template_id VARCHAR(100) REFERENCES phishing_templates(id) ON DELETE SET NULL,
    landing_page_id VARCHAR(100),
    
    -- Planning
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    send_mode VARCHAR(50) DEFAULT 'immediate' CHECK (send_mode IN ('immediate', 'scheduled', 'gradual')),
    
    -- Tracking et privacy
    tracking JSONB DEFAULT '{"opens": true, "clicks": true, "submissions": true, "reports": true}',
    privacy JSONB DEFAULT '{"granularity": "individual", "anonymize": false}',
    auto_sensitization JSONB DEFAULT '{"enabled": false}',
    
    -- Statut
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft', 'scheduled', 'running', 'completed', 'stopped', 'cancelled'
    )),
    
    -- Statistiques
    recipient_count INTEGER DEFAULT 0,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    launched_at TIMESTAMP,
    launched_by VARCHAR(255),
    stopped_at TIMESTAMP,
    stopped_by VARCHAR(255)
);

-- Index
CREATE INDEX idx_phishing_campaigns_client_id ON phishing_campaigns(client_id);
CREATE INDEX idx_phishing_campaigns_client_code ON phishing_campaigns(client_code);
CREATE INDEX idx_phishing_campaigns_entity_id ON phishing_campaigns(entity_id);
CREATE INDEX idx_phishing_campaigns_status ON phishing_campaigns(status);
CREATE INDEX idx_phishing_campaigns_start_date ON phishing_campaigns(start_date);
CREATE INDEX idx_phishing_campaigns_template_id ON phishing_campaigns(template_id);

-- =====================================================

-- Table des destinataires de campagnes
CREATE TABLE phishing_recipients (
    id VARCHAR(100) PRIMARY KEY,
    campaign_id VARCHAR(100) NOT NULL REFERENCES phishing_campaigns(id) ON DELETE CASCADE,
    
    -- Informations destinataire
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    department VARCHAR(100),
    site VARCHAR(100),
    
    -- Tracking
    opened BOOLEAN DEFAULT false,
    clicked BOOLEAN DEFAULT false,
    submitted BOOLEAN DEFAULT false,
    reported BOOLEAN DEFAULT false,
    
    -- Timestamps
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    submitted_at TIMESTAMP,
    reported_at TIMESTAMP,
    
    -- Statut
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'sent', 'opened', 'clicked', 'submitted', 'reported', 'failed'
    )),
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_sent_at TIMESTAMP,
    email_error TEXT
);

-- Index pour performances et jointures
CREATE INDEX idx_phishing_recipients_campaign_id ON phishing_recipients(campaign_id);
CREATE INDEX idx_phishing_recipients_email ON phishing_recipients(email);
CREATE INDEX idx_phishing_recipients_status ON phishing_recipients(status);
CREATE INDEX idx_phishing_recipients_opened ON phishing_recipients(opened);
CREATE INDEX idx_phishing_recipients_clicked ON phishing_recipients(clicked);

-- Index composite pour statistiques rapides
CREATE INDEX idx_phishing_recipients_campaign_stats ON phishing_recipients(campaign_id, opened, clicked, submitted, reported);

-- =====================================================
-- 4. TABLES D'HISTORIQUE ET AUDIT
-- =====================================================

-- Table d'historique pour traçabilité
CREATE TABLE history_logs (
    id BIGSERIAL PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    item_id VARCHAR(100) NOT NULL,
    client_code VARCHAR(50),
    action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'status_changed')),
    changes JSONB,
    performed_by VARCHAR(255),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(100),
    user_agent TEXT
);

-- Index pour requêtes d'historique
CREATE INDEX idx_history_logs_module ON history_logs(module);
CREATE INDEX idx_history_logs_item_id ON history_logs(item_id);
CREATE INDEX idx_history_logs_client_code ON history_logs(client_code);
CREATE INDEX idx_history_logs_performed_at ON history_logs(performed_at DESC);
CREATE INDEX idx_history_logs_performed_by ON history_logs(performed_by);

-- =====================================================

-- Table des invitations (pour onboarding utilisateurs)
CREATE TABLE invitations (
    id VARCHAR(100) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    client_id VARCHAR(100) REFERENCES clients(id) ON DELETE CASCADE,
    client_code VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    permissions JSONB DEFAULT '{}',
    invited_by VARCHAR(255),
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    accepted_at TIMESTAMP
);

-- Index
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_client_id ON invitations(client_id);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);

-- =====================================================
-- 5. VUES UTILES
-- =====================================================

-- Vue des statistiques clients
CREATE VIEW client_statistics AS
SELECT 
    c.id,
    c.code,
    c.name,
    c.status,
    COUNT(DISTINCT u.id) as user_count,
    COUNT(DISTINCT le.id) as entity_count,
    COUNT(DISTINCT t.id) as traitement_count,
    COUNT(DISTINCT d.id) as demande_count,
    COUNT(DISTINCT v.id) as violation_count,
    COUNT(DISTINCT pc.id) as campaign_count
FROM clients c
LEFT JOIN users u ON c.id = u.client_id
LEFT JOIN legal_entities le ON c.id = le.client_id
LEFT JOIN traitements t ON c.id = t.client_id
LEFT JOIN demandes d ON c.id = d.client_id
LEFT JOIN violations v ON c.id = v.client_id
LEFT JOIN phishing_campaigns pc ON c.id = pc.client_id
GROUP BY c.id, c.code, c.name, c.status;

-- =====================================================

-- Vue des statistiques de campagnes de phishing
CREATE VIEW phishing_campaign_statistics AS
SELECT 
    pc.id,
    pc.name,
    pc.client_code,
    pc.status,
    pc.recipient_count,
    COUNT(pr.id) as total_recipients,
    COUNT(CASE WHEN pr.opened THEN 1 END) as opened_count,
    COUNT(CASE WHEN pr.clicked THEN 1 END) as clicked_count,
    COUNT(CASE WHEN pr.submitted THEN 1 END) as submitted_count,
    COUNT(CASE WHEN pr.reported THEN 1 END) as reported_count,
    ROUND(100.0 * COUNT(CASE WHEN pr.opened THEN 1 END) / NULLIF(COUNT(pr.id), 0), 2) as open_rate,
    ROUND(100.0 * COUNT(CASE WHEN pr.clicked THEN 1 END) / NULLIF(COUNT(pr.id), 0), 2) as click_rate,
    ROUND(100.0 * COUNT(CASE WHEN pr.reported THEN 1 END) / NULLIF(COUNT(pr.id), 0), 2) as report_rate
FROM phishing_campaigns pc
LEFT JOIN phishing_recipients pr ON pc.id = pr.campaign_id
GROUP BY pc.id, pc.name, pc.client_code, pc.status, pc.recipient_count;

-- =====================================================

-- Vue des demandes en retard
CREATE VIEW demandes_overdue AS
SELECT 
    d.*,
    c.name as client_name,
    le.name as entity_name,
    EXTRACT(DAY FROM (CURRENT_TIMESTAMP - d.deadline)) as days_overdue
FROM demandes d
JOIN clients c ON d.client_id = c.id
LEFT JOIN legal_entities le ON d.entity_id = le.id
WHERE d.status IN ('pending', 'in_progress')
  AND d.deadline < CURRENT_TIMESTAMP
ORDER BY d.deadline ASC;

-- =====================================================
-- 6. FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables avec updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_entities_updated_at BEFORE UPDATE ON legal_entities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_traitements_updated_at BEFORE UPDATE ON traitements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demandes_updated_at BEFORE UPDATE ON demandes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_violations_updated_at BEFORE UPDATE ON violations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phishing_templates_updated_at BEFORE UPDATE ON phishing_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phishing_campaigns_updated_at BEFORE UPDATE ON phishing_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================

-- Fonction pour logger automatiquement les changements
CREATE OR REPLACE FUNCTION log_history()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO history_logs (module, item_id, client_code, action, changes, performed_by)
        VALUES (TG_TABLE_NAME, NEW.id, NEW.client_code, 'created', row_to_json(NEW), NEW.created_by);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO history_logs (module, item_id, client_code, action, changes, performed_by)
        VALUES (TG_TABLE_NAME, NEW.id, NEW.client_code, 'updated', 
                jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)), 
                NEW.updated_by);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO history_logs (module, item_id, client_code, action, changes, performed_by)
        VALUES (TG_TABLE_NAME, OLD.id, OLD.client_code, 'deleted', row_to_json(OLD), current_user);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Appliquer les triggers d'historique (optionnel - peut générer beaucoup de données)
-- Décommentez si vous voulez l'historique automatique :
/*
CREATE TRIGGER traitements_history_trigger AFTER INSERT OR UPDATE OR DELETE ON traitements
    FOR EACH ROW EXECUTE FUNCTION log_history();

CREATE TRIGGER demandes_history_trigger AFTER INSERT OR UPDATE OR DELETE ON demandes
    FOR EACH ROW EXECUTE FUNCTION log_history();

CREATE TRIGGER violations_history_trigger AFTER INSERT OR UPDATE OR DELETE ON violations
    FOR EACH ROW EXECUTE FUNCTION log_history();
*/

-- =====================================================
-- 7. POLITIQUES RLS (Row Level Security) - OPTIONNEL
-- =====================================================

-- Activer RLS sur les tables sensibles (à personnaliser selon vos besoins)
/*
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE traitements ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE phishing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE phishing_recipients ENABLE ROW LEVEL SECURITY;

-- Politique exemple : les utilisateurs ne voient que les données de leur client
CREATE POLICY client_isolation_policy ON traitements
    FOR ALL
    USING (client_code = current_setting('app.current_client_code', true));
*/

-- =====================================================
-- 8. COMMENTAIRES SUR LES TABLES
-- =====================================================

COMMENT ON TABLE clients IS 'Entreprises clientes de Octopus Data & Privacy';
COMMENT ON TABLE legal_entities IS 'Entités juridiques des clients (filiales, établissements)';
COMMENT ON TABLE users IS 'Utilisateurs de l\'application (admins et utilisateurs clients)';
COMMENT ON TABLE system_admins IS 'Liste des administrateurs système';
COMMENT ON TABLE traitements IS 'Registre des traitements de données personnelles (RGPD)';
COMMENT ON TABLE demandes IS 'Demandes d\'exercice de droits des personnes concernées';
COMMENT ON TABLE violations IS 'Registre des violations de données personnelles';
COMMENT ON TABLE phishing_templates IS 'Templates d\'emails pour les campagnes de phishing';
COMMENT ON TABLE phishing_campaigns IS 'Campagnes de tests de phishing';
COMMENT ON TABLE phishing_recipients IS 'Destinataires des campagnes avec tracking';
COMMENT ON TABLE history_logs IS 'Journal d\'audit des modifications';
COMMENT ON TABLE invitations IS 'Invitations en attente pour nouveaux utilisateurs';

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

-- Pour insérer des données de test :
-- INSERT INTO clients VALUES (...);
-- INSERT INTO users VALUES (...);
-- etc.

-- Pour migrer depuis le KV store, créez un script de migration séparé
-- qui lit les données du KV store et les insère dans les tables.
