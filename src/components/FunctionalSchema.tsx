import React, { useState, useRef } from 'react';
import { Users, Shield, Database, Mail, Key, FileText, UserCheck, Building2, Lock, CheckCircle, ArrowRight, Server, Globe, Zap, Download, Home, FileCode } from 'lucide-react';
import logoImage from 'figma:asset/8b41da225a8555c958a767da49b2bb7bdc17e6a6.png';

interface FunctionalSchemaProps {
  onBackHome?: () => void;
}

export function FunctionalSchema({ onBackHome }: FunctionalSchemaProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Expand all sections for PDF
      const previousActiveSection = activeSection;
      setActiveSection('all');
      
      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 300));

      // Use browser's print functionality with PDF settings
      // Create a print-friendly version
      const printContent = contentRef.current;
      if (!printContent) return;

      // Add print styles
      const printStyles = document.createElement('style');
      printStyles.id = 'pdf-print-styles';
      printStyles.textContent = `
        @media print {
          body * {
            visibility: hidden;
          }
          #pdf-content, #pdf-content * {
            visibility: visible;
          }
          #pdf-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          /* Force colors */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          /* Page breaks */
          .page-break {
            page-break-before: always;
          }
          /* Remove fixed positioning */
          .fixed {
            position: relative !important;
          }
        }
      `;
      document.head.appendChild(printStyles);

      // Add ID to content for printing
      printContent.id = 'pdf-content';

      // Trigger print
      window.print();

      // Cleanup
      setTimeout(() => {
        printStyles.remove();
        printContent.removeAttribute('id');
        setActiveSection(previousActiveSection);
        setIsGeneratingPDF(false);
      }, 1000);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
      setIsGeneratingPDF(false);
    }
  };

  const generateDrawIO = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Create Draw.io XML content with properly escaped characters
    const drawioXML = `<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Octopus Data and Privacy" version="22.1.0" etag="generated" type="device">
  <diagram name="Architecture Octopus Data and Privacy" id="octopus-architecture">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="1654" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        
        <!-- Title -->
        <mxCell id="title" value="Schema Fonctionnel - Octopus Data and Privacy" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=24;fontStyle=1;fontColor=#1E3A8A;" vertex="1" parent="1">
          <mxGeometry x="284" y="20" width="600" height="40" as="geometry" />
        </mxCell>
        
        <!-- Architecture Section -->
        <mxCell id="arch-title" value="Architecture Technique (3-Tier)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#1E3A8A;" vertex="1" parent="1">
          <mxGeometry x="384" y="80" width="400" height="30" as="geometry" />
        </mxCell>
        
        <!-- Frontend -->
        <mxCell id="frontend" value="&lt;b&gt;Frontend&lt;/b&gt;&lt;br&gt;&lt;br&gt;React + TypeScript&lt;br&gt;Tailwind CSS&lt;br&gt;Supabase Client&lt;br&gt;Interface Admin/Client" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#DBEAFE;strokeColor=#3B82F6;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="80" y="130" width="220" height="140" as="geometry" />
        </mxCell>
        
        <!-- Server -->
        <mxCell id="server" value="&lt;b&gt;Server&lt;/b&gt;&lt;br&gt;&lt;br&gt;Supabase Edge Functions&lt;br&gt;Hono Web Server&lt;br&gt;API REST&lt;br&gt;Mailjet Integration" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#F3E8FF;strokeColor=#9333EA;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="380" y="130" width="220" height="140" as="geometry" />
        </mxCell>
        
        <!-- Database -->
        <mxCell id="database" value="&lt;b&gt;Database&lt;/b&gt;&lt;br&gt;&lt;br&gt;Supabase PostgreSQL&lt;br&gt;KV Store (Key-Value)&lt;br&gt;Supabase Auth&lt;br&gt;Supabase Storage" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#D1FAE5;strokeColor=#10B981;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=12;" vertex="1" parent="1">
          <mxGeometry x="680" y="130" width="220" height="140" as="geometry" />
        </mxCell>
        
        <!-- Arrows between layers -->
        <mxCell id="arrow1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;strokeColor=#3B82F6;endArrow=classic;endFill=1;" edge="1" parent="1" source="frontend" target="server">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="arrow2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;strokeColor=#9333EA;endArrow=classic;endFill=1;" edge="1" parent="1" source="server" target="database">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        
        <!-- Authentication Section -->
        <mxCell id="auth-title" value="Flux d Authentification et Securite" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#991B1B;" vertex="1" parent="1">
          <mxGeometry x="384" y="310" width="400" height="30" as="geometry" />
        </mxCell>
        
        <!-- Admin Flow -->
        <mxCell id="admin-flow" value="&lt;b&gt;Flux Administrateur&lt;/b&gt;&lt;br&gt;&lt;br&gt;1. Initialisation admin&lt;br&gt;2. Email stocke dans KV Store&lt;br&gt;3. Connexion Supabase Auth&lt;br&gt;4. Verification admin&lt;br&gt;5. Acces panneau admin" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FED7AA;strokeColor=#F97316;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="80" y="360" width="250" height="140" as="geometry" />
        </mxCell>
        
        <!-- Client Flow -->
        <mxCell id="client-flow" value="&lt;b&gt;Flux Utilisateur Client&lt;/b&gt;&lt;br&gt;&lt;br&gt;1. Admin cree le compte&lt;br&gt;2. MDP temporaire genere&lt;br&gt;3. Stockage KV Store + Supabase Auth&lt;br&gt;4. Reception 2 emails&lt;br&gt;5. Premiere connexion - Changement MDP&lt;br&gt;6. Acces portail client" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#DBEAFE;strokeColor=#3B82F6;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="380" y="360" width="250" height="140" as="geometry" />
        </mxCell>
        
        <!-- Password Security -->
        <mxCell id="password-security" value="&lt;b&gt;Exigences Mot de Passe&lt;/b&gt;&lt;br&gt;&lt;br&gt;12+ caracteres&lt;br&gt;Majuscule&lt;br&gt;Minuscule&lt;br&gt;Chiffre&lt;br&gt;Caractere special" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="680" y="360" width="220" height="140" as="geometry" />
        </mxCell>
        
        <!-- Email System Section -->
        <mxCell id="email-title" value="Systeme d Invitations (Mailjet)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#581C87;" vertex="1" parent="1">
          <mxGeometry x="384" y="540" width="400" height="30" as="geometry" />
        </mxCell>
        
        <!-- Email Process Flow -->
        <mxCell id="email-step1" value="Admin&lt;br&gt;selectionne&lt;br&gt;utilisateurs" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#DBEAFE;strokeColor=#3B82F6;strokeWidth=2;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="80" y="590" width="150" height="80" as="geometry" />
        </mxCell>
        
        <mxCell id="email-step2" value="Generation&lt;br&gt;MDP temporaire&lt;br&gt;(si besoin)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#F3E8FF;strokeColor=#9333EA;strokeWidth=2;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="290" y="590" width="150" height="80" as="geometry" />
        </mxCell>
        
        <mxCell id="email-step3" value="2 emails&lt;br&gt;envoyes via&lt;br&gt;Mailjet" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#D1FAE5;strokeColor=#10B981;strokeWidth=2;fontSize=11;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="500" y="590" width="150" height="80" as="geometry" />
        </mxCell>
        
        <!-- Arrows for email flow -->
        <mxCell id="email-arrow1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;strokeColor=#3B82F6;endArrow=classic;endFill=1;" edge="1" parent="1" source="email-step1" target="email-step2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="email-arrow2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=2;strokeColor=#9333EA;endArrow=classic;endFill=1;" edge="1" parent="1" source="email-step2" target="email-step3">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        
        <!-- Email 1: Invitation -->
        <mxCell id="email1" value="&lt;b&gt;Email 1: Invitation (Bleu)&lt;/b&gt;&lt;br&gt;&lt;br&gt;De: noreply@octopus-dp.fr&lt;br&gt;Objet: Invitation au Portail Client&lt;br&gt;&lt;br&gt;Contenu:&lt;br&gt;Presentation du portail&lt;br&gt;Fonctionnalites RGPD&lt;br&gt;Email de connexion&lt;br&gt;Lien vers l application" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#DBEAFE;strokeColor=#3B82F6;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="80" y="720" width="280" height="150" as="geometry" />
        </mxCell>
        
        <!-- Email 2: Password -->
        <mxCell id="email2" value="&lt;b&gt;Email 2: Mot de passe (Rouge)&lt;/b&gt;&lt;br&gt;&lt;br&gt;De: noreply@octopus-dp.fr&lt;br&gt;Objet: Mot de passe temporaire&lt;br&gt;&lt;br&gt;Contenu:&lt;br&gt;Mot de passe temporaire&lt;br&gt;Avertissements de securite&lt;br&gt;Instructions de changement&lt;br&gt;Exigences nouveau MDP" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="400" y="720" width="280" height="150" as="geometry" />
        </mxCell>
        
        <!-- Security Note -->
        <mxCell id="security-note" value="SECURITE: Les emails sont envoyes separement pour qu un attaquant interceptant un seul email n ait pas l acces complet au compte." style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEF3C7;strokeColor=#F59E0B;strokeWidth=2;align=left;verticalAlign=middle;spacingLeft=10;fontSize=10;fontStyle=2;" vertex="1" parent="1">
          <mxGeometry x="720" y="720" width="180" height="150" as="geometry" />
        </mxCell>
        
        <!-- Entities Section -->
        <mxCell id="entities-title" value="Gestion des Entites et Permissions" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#312E81;" vertex="1" parent="1">
          <mxGeometry x="384" y="910" width="400" height="30" as="geometry" />
        </mxCell>
        
        <!-- Clients -->
        <mxCell id="clients" value="&lt;b&gt;Clients&lt;/b&gt;&lt;br&gt;&lt;br&gt;Nom organisation&lt;br&gt;Code client unique&lt;br&gt;Logo personnalise&lt;br&gt;Coordonnees&lt;br&gt;Adresse" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#E0E7FF;strokeColor=#6366F1;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="80" y="960" width="220" height="120" as="geometry" />
        </mxCell>
        
        <!-- Legal Entities -->
        <mxCell id="legal-entities" value="&lt;b&gt;Entites Juridiques&lt;/b&gt;&lt;br&gt;&lt;br&gt;Rattachees a un client&lt;br&gt;Nom et SIREN&lt;br&gt;Logo et adresse&lt;br&gt;Contact designe&lt;br&gt;Multi-entites possible" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#EDE9FE;strokeColor=#8B5CF6;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="360" y="960" width="220" height="120" as="geometry" />
        </mxCell>
        
        <!-- Users -->
        <mxCell id="users" value="&lt;b&gt;Utilisateurs&lt;/b&gt;&lt;br&gt;&lt;br&gt;Rattaches a un client&lt;br&gt;Acces 1+ entites juridiques&lt;br&gt;Permissions granulaires&lt;br&gt;Statut d invitation&lt;br&gt;Date d activation" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#F3E8FF;strokeColor=#A855F7;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=11;" vertex="1" parent="1">
          <mxGeometry x="640" y="960" width="220" height="120" as="geometry" />
        </mxCell>
        
        <!-- RGPD Modules Section -->
        <mxCell id="modules-title" value="Modules RGPD du Portail Client" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#065F46;" vertex="1" parent="1">
          <mxGeometry x="384" y="1120" width="400" height="30" as="geometry" />
        </mxCell>
        
        <!-- Registre -->
        <mxCell id="registre" value="&lt;b&gt;Registre des Traitements&lt;/b&gt;&lt;br&gt;(Article 30 RGPD)&lt;br&gt;&lt;br&gt;Liste des traitements&lt;br&gt;Finalites et bases legales&lt;br&gt;Categories de donnees&lt;br&gt;Destinataires&lt;br&gt;Durees de conservation&lt;br&gt;Mesures de securite" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#DBEAFE;strokeColor=#3B82F6;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="80" y="1170" width="220" height="160" as="geometry" />
        </mxCell>
        
        <!-- Droits -->
        <mxCell id="droits" value="&lt;b&gt;Exercice des Droits&lt;/b&gt;&lt;br&gt;(Articles 15-22 RGPD)&lt;br&gt;&lt;br&gt;Droit d acces (Art. 15)&lt;br&gt;Droit de rectification (Art. 16)&lt;br&gt;Droit a l effacement (Art. 17)&lt;br&gt;Droit a la limitation (Art. 18)&lt;br&gt;Droit a la portabilite (Art. 20)&lt;br&gt;Droit d opposition (Art. 21)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#F3E8FF;strokeColor=#A855F7;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="360" y="1170" width="220" height="160" as="geometry" />
        </mxCell>
        
        <!-- Violations -->
        <mxCell id="violations" value="&lt;b&gt;Violations de Donnees&lt;/b&gt;&lt;br&gt;(Article 33 RGPD)&lt;br&gt;&lt;br&gt;Declaration des incidents&lt;br&gt;Nature de la violation&lt;br&gt;Donnees concernees&lt;br&gt;Mesures correctives&lt;br&gt;Notification CNIL (72h)&lt;br&gt;Communication aux personnes" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="640" y="1170" width="220" height="160" as="geometry" />
        </mxCell>
        
        <!-- Data Structure Section -->
        <mxCell id="data-title" value="Structure de Donnees (KV Store)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#047857;" vertex="1" parent="1">
          <mxGeometry x="384" y="1370" width="400" height="30" as="geometry" />
        </mxCell>
        
        <!-- KV Keys -->
        <mxCell id="kv-keys" value="&lt;b&gt;Cles Principales&lt;/b&gt;&lt;br&gt;&lt;br&gt;admins -&gt; [emails...]&lt;br&gt;client:&amp;lt;id&amp;gt; -&gt; data&lt;br&gt;legal_entity:&amp;lt;id&amp;gt; -&gt; data&lt;br&gt;user:&amp;lt;id&amp;gt; -&gt; data&lt;br&gt;user_email:&amp;lt;email&amp;gt; -&gt; userId" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#F1F5F9;strokeColor=#64748B;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=10;fontFamily=Courier New;" vertex="1" parent="1">
          <mxGeometry x="80" y="1420" width="350" height="140" as="geometry" />
        </mxCell>
        
        <!-- User Structure -->
        <mxCell id="user-structure" value="&lt;b&gt;Structure Utilisateur&lt;/b&gt;&lt;br&gt;&lt;br&gt;id: uuid&lt;br&gt;email: user@example.com&lt;br&gt;name: Nom Utilisateur&lt;br&gt;clientId: uuid&lt;br&gt;legalEntityIds: [uuid1,...]&lt;br&gt;permissions: {...}&lt;br&gt;mustChangePassword: true&lt;br&gt;temporaryPassword: ***&lt;br&gt;createdAt: ISO date" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#DBEAFE;strokeColor=#3B82F6;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=9;fontFamily=Courier New;" vertex="1" parent="1">
          <mxGeometry x="480" y="1420" width="380" height="140" as="geometry" />
        </mxCell>
        
        <!-- Configuration Section -->
        <mxCell id="config-title" value="Configuration Requise (Variables d environnement)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;fontColor=#92400E;" vertex="1" parent="1">
          <mxGeometry x="284" y="1600" width="600" height="30" as="geometry" />
        </mxCell>
        
        <!-- Supabase Config -->
        <mxCell id="supabase-config" value="&lt;b&gt;Supabase (Preconfigurees)&lt;/b&gt;&lt;br&gt;&lt;br&gt;SUPABASE_URL&lt;br&gt;SUPABASE_ANON_KEY&lt;br&gt;SUPABASE_SERVICE_ROLE_KEY&lt;br&gt;SUPABASE_DB_URL" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FEF3C7;strokeColor=#F59E0B;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=11;fontFamily=Courier New;" vertex="1" parent="1">
          <mxGeometry x="150" y="1650" width="300" height="110" as="geometry" />
        </mxCell>
        
        <!-- Mailjet Config -->
        <mxCell id="mailjet-config" value="&lt;b&gt;Mailjet (A configurer)&lt;/b&gt;&lt;br&gt;&lt;br&gt;MAILJET_API_KEY&lt;br&gt;MAILJET_SECRET_KEY&lt;br&gt;APP_URL&lt;br&gt;&lt;br&gt;Verifier noreply@octopus-dp.fr dans Mailjet" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FED7AA;strokeColor=#F97316;strokeWidth=2;align=left;verticalAlign=top;spacingLeft=10;spacingTop=10;fontSize=11;fontFamily=Courier New;" vertex="1" parent="1">
          <mxGeometry x="520" y="1650" width="350" height="110" as="geometry" />
        </mxCell>
        
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

    // Create blob and download
    const blob = new Blob([drawioXML], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Octopus_Data_Privacy_Schema_Fonctionnel_${today}.drawio`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - clickable to go back home */}
            <div className="flex items-center">
              {onBackHome ? (
                <button onClick={onBackHome} className="hover:opacity-80 transition-opacity">
                  <img src={logoImage} alt="Octopus Data & Privacy" className="h-10" />
                </button>
              ) : (
                <img src={logoImage} alt="Octopus Data & Privacy" className="h-10" />
              )}
            </div>
            
            {/* Export Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isGeneratingPDF 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span className="hidden sm:inline">Génération...</span>
                  </>
                ) : (
                  <>
                    <Download className="size-4" />
                    <span className="hidden sm:inline">Export PDF</span>
                  </>
                )}
              </button>

              <button
                onClick={generateDrawIO}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <FileCode className="size-4" />
                <span className="hidden sm:inline">Export Draw.io</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8" ref={contentRef}>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4 text-blue-900">
            Schéma Fonctionnel - Octopus Data & Privacy
          </h1>
          <p className="text-slate-600">
            Architecture complète du portail client RGPD
          </p>
        </div>

        {/* Architecture globale */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-center text-blue-900 flex items-center justify-center gap-2">
            <Server className="size-6" />
            Architecture Technique (3-Tier)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Frontend */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-300">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="size-8 text-blue-600" />
                <h3 className="text-xl text-blue-900">Frontend</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  React + TypeScript
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Tailwind CSS
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Supabase Client
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Interface Admin/Client
                </li>
              </ul>
            </div>

            {/* Server */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-300">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="size-8 text-purple-600" />
                <h3 className="text-xl text-purple-900">Server</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Supabase Edge Functions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Hono Web Server
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  API REST
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Mailjet Integration
                </li>
              </ul>
            </div>

            {/* Database */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-300">
              <div className="flex items-center gap-2 mb-4">
                <Database className="size-8 text-green-600" />
                <h3 className="text-xl text-green-900">Database</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Supabase PostgreSQL
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  KV Store (Key-Value)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Supabase Auth
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Supabase Storage
                </li>
              </ul>
            </div>
          </div>

          {/* Flow arrows */}
          <div className="flex items-center justify-center gap-4 mt-6 text-slate-600">
            <span>Frontend</span>
            <ArrowRight className="size-5" />
            <span>Server</span>
            <ArrowRight className="size-5" />
            <span>Database</span>
          </div>
        </div>

        {/* Flux d'authentification */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-center text-red-900 flex items-center justify-center gap-2">
            <Shield className="size-6" />
            Flux d'Authentification & Sécurité
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin Flow */}
            <div 
              className={`bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border-2 transition-all cursor-pointer ${
                activeSection === 'admin' ? 'border-orange-500 shadow-lg' : 'border-orange-200'
              }`}
              onClick={() => setActiveSection(activeSection === 'admin' ? null : 'admin')}
            >
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="size-6 text-orange-600" />
                <h3 className="text-lg text-orange-900">Administrateur</h3>
              </div>
              <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
                <li>Initialisation admin (première connexion)</li>
                <li>Email stocké dans KV Store</li>
                <li>Connexion avec Supabase Auth</li>
                <li>Vérification admin (email dans liste)</li>
                <li>Accès au panneau d'administration</li>
              </ol>
            </div>

            {/* Client Flow */}
            <div 
              className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 transition-all cursor-pointer ${
                activeSection === 'client' ? 'border-blue-500 shadow-lg' : 'border-blue-200'
              }`}
              onClick={() => setActiveSection(activeSection === 'client' ? null : 'client')}
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="size-6 text-blue-600" />
                <h3 className="text-lg text-blue-900">Utilisateur Client</h3>
              </div>
              <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
                <li>Admin créé le compte utilisateur</li>
                <li>Mot de passe temporaire généré</li>
                <li>Stockage dans KV Store + Supabase Auth</li>
                <li>Réception de 2 emails (invitation + MDP)</li>
                <li>Première connexion → Changement MDP obligatoire</li>
                <li>Accès au portail client (selon permissions)</li>
              </ol>
            </div>
          </div>

          {/* Password Security */}
          <div className="mt-6 bg-red-50 border-2 border-red-300 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="size-5 text-red-600" />
              <h4 className="text-red-900">Exigences de Sécurité des Mots de Passe</h4>
            </div>
            <ul className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                12+ caractères
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                Majuscule
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                Minuscule
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                Chiffre
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                Caractère spécial
              </li>
            </ul>
          </div>
        </div>

        {/* Système d'invitations */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-center text-purple-900 flex items-center justify-center gap-2">
            <Mail className="size-6" />
            Système d'Invitations (Mailjet)
          </h2>

          <div className="space-y-6">
            {/* Process Flow */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 flex-1">
                <div className="text-center mb-2">
                  <Users className="size-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-900">Admin sélectionne utilisateurs</p>
                </div>
              </div>
              
              <ArrowRight className="size-6 text-slate-400 hidden md:block" />
              
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 flex-1">
                <div className="text-center mb-2">
                  <Key className="size-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-purple-900">Génération MDP temporaire (si besoin)</p>
                </div>
              </div>
              
              <ArrowRight className="size-6 text-slate-400 hidden md:block" />
              
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 flex-1">
                <div className="text-center mb-2">
                  <Mail className="size-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-900">2 emails envoyés via Mailjet</p>
                </div>
              </div>
            </div>

            {/* Two Emails */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email 1: Invitation */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-blue-500 text-white rounded-full p-2">
                    <Mail className="size-5" />
                  </div>
                  <h3 className="text-lg text-blue-900">Email 1 : Invitation</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>📧 <strong>De :</strong> noreply@octopus-dp.fr</li>
                  <li>🎯 <strong>Objet :</strong> Invitation au Portail Client</li>
                  <li>🔵 <strong>Design :</strong> Fond bleu (🔐)</li>
                  <li>📋 <strong>Contenu :</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Présentation du portail</li>
                      <li>• Fonctionnalités RGPD</li>
                      <li>• Email de connexion</li>
                      <li>• Lien vers l'application</li>
                    </ul>
                  </li>
                </ul>
              </div>

              {/* Email 2: Password */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-red-500 text-white rounded-full p-2">
                    <Key className="size-5" />
                  </div>
                  <h3 className="text-lg text-red-900">Email 2 : Mot de passe</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>📧 <strong>De :</strong> noreply@octopus-dp.fr</li>
                  <li>🎯 <strong>Objet :</strong> Mot de passe temporaire</li>
                  <li>🔴 <strong>Design :</strong> Fond rouge (🔑)</li>
                  <li>🔐 <strong>Contenu :</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Mot de passe temporaire</li>
                      <li>• Avertissements de sécurité</li>
                      <li>• Instructions de changement</li>
                      <li>• Exigences du nouveau MDP</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-sm text-yellow-900">
                <strong>🔒 Sécurité :</strong> Les emails sont envoyés séparément pour qu'un attaquant interceptant un seul email n'ait pas l'accès complet au compte.
              </p>
            </div>
          </div>
        </div>

        {/* Gestion des entités */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-center text-indigo-900 flex items-center justify-center gap-2">
            <Building2 className="size-6" />
            Gestion des Entités & Permissions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Clients */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 border-2 border-indigo-200">
              <h3 className="text-lg text-indigo-900 mb-4 flex items-center gap-2">
                <Users className="size-5" />
                Clients
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Nom de l'organisation</li>
                <li>• Code client unique</li>
                <li>• Logo personnalisé</li>
                <li>• Coordonnées de contact</li>
                <li>• Adresse</li>
              </ul>
            </div>

            {/* Legal Entities */}
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-6 border-2 border-violet-200">
              <h3 className="text-lg text-violet-900 mb-4 flex items-center gap-2">
                <Building2 className="size-5" />
                Entités Juridiques
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Rattachées à un client</li>
                <li>• Nom et SIREN</li>
                <li>• Logo et adresse</li>
                <li>• Contact désigné</li>
                <li>• Multi-entités possible</li>
              </ul>
            </div>

            {/* Users */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200">
              <h3 className="text-lg text-purple-900 mb-4 flex items-center gap-2">
                <UserCheck className="size-5" />
                Utilisateurs
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Rattachés à un client</li>
                <li>• Accès à 1+ entités juridiques</li>
                <li>• Permissions granulaires</li>
                <li>• Statut d'invitation</li>
                <li>• Date d'activation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modules RGPD */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-center text-green-900 flex items-center justify-center gap-2">
            <FileText className="size-6" />
            Modules RGPD du Portail Client
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Registre */}
            <div 
              className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 transition-all cursor-pointer ${
                activeSection === 'registre' ? 'border-blue-500 shadow-lg' : 'border-blue-200'
              }`}
              onClick={() => setActiveSection(activeSection === 'registre' ? null : 'registre')}
            >
              <div className="mb-4">
                <div className="bg-blue-500 text-white rounded-lg p-3 w-fit mb-3">
                  <FileText className="size-6" />
                </div>
                <h3 className="text-lg text-blue-900">📋 Registre des Traitements</h3>
                <p className="text-xs text-slate-600 mt-1">Article 30 RGPD</p>
              </div>
              {activeSection === 'registre' && (
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>✓ Liste des traitements de données</li>
                  <li>✓ Finalités et bases légales</li>
                  <li>✓ Catégories de données</li>
                  <li>✓ Destinataires</li>
                  <li>✓ Durées de conservation</li>
                  <li>✓ Mesures de sécurité</li>
                </ul>
              )}
            </div>

            {/* Droits */}
            <div 
              className={`bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 transition-all cursor-pointer ${
                activeSection === 'droits' ? 'border-purple-500 shadow-lg' : 'border-purple-200'
              }`}
              onClick={() => setActiveSection(activeSection === 'droits' ? null : 'droits')}
            >
              <div className="mb-4">
                <div className="bg-purple-500 text-white rounded-lg p-3 w-fit mb-3">
                  <UserCheck className="size-6" />
                </div>
                <h3 className="text-lg text-purple-900">✋ Exercice des Droits</h3>
                <p className="text-xs text-slate-600 mt-1">Articles 15-22 RGPD</p>
              </div>
              {activeSection === 'droits' && (
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>✓ Droit d'accès (Art. 15)</li>
                  <li>✓ Droit de rectification (Art. 16)</li>
                  <li>✓ Droit à l'effacement (Art. 17)</li>
                  <li>✓ Droit à la limitation (Art. 18)</li>
                  <li>✓ Droit à la portabilité (Art. 20)</li>
                  <li>✓ Droit d'opposition (Art. 21)</li>
                </ul>
              )}
            </div>

            {/* Violations */}
            <div 
              className={`bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border-2 transition-all cursor-pointer ${
                activeSection === 'violations' ? 'border-red-500 shadow-lg' : 'border-red-200'
              }`}
              onClick={() => setActiveSection(activeSection === 'violations' ? null : 'violations')}
            >
              <div className="mb-4">
                <div className="bg-red-500 text-white rounded-lg p-3 w-fit mb-3">
                  <Shield className="size-6" />
                </div>
                <h3 className="text-lg text-red-900">⚠️ Violations de Données</h3>
                <p className="text-xs text-slate-600 mt-1">Article 33 RGPD</p>
              </div>
              {activeSection === 'violations' && (
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>✓ Déclaration des incidents</li>
                  <li>✓ Nature de la violation</li>
                  <li>✓ Données concernées</li>
                  <li>✓ Mesures correctives</li>
                  <li>✓ Notification à la CNIL (72h)</li>
                  <li>✓ Communication aux personnes</li>
                </ul>
              )}
            </div>
          </div>

          <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-sm text-green-900">
              <strong>🎯 Permissions granulaires :</strong> Chaque utilisateur peut avoir accès à certains modules uniquement (configurable par l'admin).
            </p>
          </div>
        </div>

        {/* Base de données */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-center text-emerald-900 flex items-center justify-center gap-2">
            <Database className="size-6" />
            Structure de Données (KV Store)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
                <h4 className="text-slate-900 mb-3">Clés Principales</h4>
                <div className="space-y-2 text-sm font-mono text-slate-700">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <code>admins → [emails...]</code>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <code>client:{'<id>'} → {'{'} clientData {'}'}</code>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <code>legal_entity:{'<id>'} → {'{'} entityData {'}'}</code>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <code>user:{'<id>'} → {'{'} userData {'}'}</code>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <code>user_email:{'<email>'} → userId</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="text-blue-900 mb-3">Structure utilisateur</h4>
                <div className="text-sm font-mono text-slate-700 bg-white p-3 rounded border border-blue-200">
                  <pre className="whitespace-pre-wrap">{`{
  id: "uuid",
  email: "user@example.com",
  name: "Nom Utilisateur",
  clientId: "uuid",
  legalEntityIds: ["uuid1", ...],
  permissions: {
    registre: true,
    droits: true,
    violations: false
  },
  mustChangePassword: true,
  temporaryPassword: "***",
  createdAt: "ISO date",
  invitedAt: "ISO date",
  activatedAt: "ISO date"
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration requise */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg p-8 border-2 border-amber-300">
          <h2 className="text-2xl mb-6 text-center text-amber-900 flex items-center justify-center gap-2">
            <Key className="size-6" />
            Configuration Requise (Variables d'environnement)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 border border-amber-200">
              <h3 className="text-lg text-amber-900 mb-4">🔧 Supabase (Préconfigurées)</h3>
              <ul className="space-y-2 text-sm text-slate-700 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600 flex-shrink-0" />
                  <span>SUPABASE_URL</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600 flex-shrink-0" />
                  <span>SUPABASE_ANON_KEY</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600 flex-shrink-0" />
                  <span>SUPABASE_SERVICE_ROLE_KEY</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600 flex-shrink-0" />
                  <span>SUPABASE_DB_URL</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 border border-orange-200">
              <h3 className="text-lg text-orange-900 mb-4">📧 Configuration à Ajouter</h3>
              <ul className="space-y-2 text-sm text-slate-700 font-mono">
                <li className="flex items-center gap-2">
                  <Key className="size-4 text-orange-600 flex-shrink-0" />
                  <span>MAILJET_API_KEY</span>
                </li>
                <li className="flex items-center gap-2">
                  <Key className="size-4 text-orange-600 flex-shrink-0" />
                  <span>MAILJET_SECRET_KEY</span>
                </li>
                <li className="flex items-center gap-2">
                  <Key className="size-4 text-orange-600 flex-shrink-0" />
                  <span>APP_URL</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-amber-100 rounded-lg p-4 border border-amber-300">
            <p className="text-sm text-amber-900">
              <strong>⚠️ Important :</strong> L'adresse email d'expédition <code className="bg-white px-2 py-1 rounded">noreply@octopus-dp.fr</code> doit être vérifiée dans Mailjet avant l'envoi des emails.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-600">
          <p className="text-sm">
            📄 Documentation technique complète - Octopus Data & Privacy
          </p>
          <p className="text-xs mt-2">
            Cliquez sur les sections pour voir plus de détails
          </p>
        </div>
      </div>
    </div>
  );
}