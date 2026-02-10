import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { sendPhishingEmailBatch } from "./mailjet-helper.tsx";

// Helper: Verify user authentication
async function verifyUser(accessToken: string | undefined, supabase: any) {
  if (!accessToken) {
    return { isValid: false };
  }
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { isValid: false };
  }
  return { isValid: true, userId: user.id, email: user.email };
}

// Helper: Get user data
async function getUserData(email: string) {
  const userId = await kv.get(`user_email:${email}`);
  if (!userId) return null;
  return await kv.get(`user:${userId}`);
}

// Helper: Check if user has phishing permission
function hasPhishingPermission(userData: any): boolean {
  // Client admins always have access
  if (userData.role === 'client_admin') return true;
  // Check specific permission
  return userData.permissions?.phishing === true;
}

// Helper: Generate unique ID
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function setupPhishingRoutes(app: Hono, getServiceClient: () => any) {
  
  // ========================================
  // CAMPAIGNS
  // ========================================

  // Get all campaigns for user's client
  app.get("/make-server-abb8d15d/phishing/campaigns", async (c) => {
    try {
      const supabase = getServiceClient();
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { isValid, email } = await verifyUser(accessToken, supabase);
      
      if (!isValid || !email) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const userData = await getUserData(email);
      if (!userData) {
        return c.json({ error: 'User not found' }, 404);
      }

      if (!hasPhishingPermission(userData)) {
        return c.json({ error: 'Permission denied - Phishing access required' }, 403);
      }

      // Get all campaigns for this client
      const allCampaigns = await kv.getByPrefix('phishing_campaign:');
      const clientCampaigns = allCampaigns.filter((c: any) => 
        c && c.clientCode === userData.clientCode
      );

      // Sort by creation date (most recent first)
      clientCampaigns.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return c.json({ 
        success: true, 
        campaigns: clientCampaigns 
      });
    } catch (error) {
      console.error('Error fetching phishing campaigns:', error);
      return c.json({ error: 'Failed to fetch campaigns' }, 500);
    }
  });

  // Get single campaign
  app.get("/make-server-abb8d15d/phishing/campaigns/:id", async (c) => {
    try {
      const supabase = getServiceClient();
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { isValid, email } = await verifyUser(accessToken, supabase);
      
      if (!isValid || !email) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const userData = await getUserData(email);
      if (!userData || !hasPhishingPermission(userData)) {
        return c.json({ error: 'Permission denied' }, 403);
      }

      const campaignId = c.req.param('id');
      const campaign = await kv.get(`phishing_campaign:${campaignId}`);
      
      if (!campaign) {
        return c.json({ error: 'Campaign not found' }, 404);
      }

      // Verify user has access to this campaign
      if (campaign.clientCode !== userData.clientCode) {
        return c.json({ error: 'Access denied' }, 403);
      }

      // Get recipients data
      const recipients = await kv.getByPrefix(`phishing_recipient:${campaignId}:`);
      
      // Calculate statistics
      const stats = {
        totalRecipients: recipients.length,
        opened: recipients.filter((r: any) => r.opened).length,
        clicked: recipients.filter((r: any) => r.clicked).length,
        submitted: recipients.filter((r: any) => r.submitted).length,
        reported: recipients.filter((r: any) => r.reported).length,
        noAction: recipients.filter((r: any) => !r.opened && !r.clicked && !r.reported).length,
      };

      return c.json({ 
        success: true, 
        campaign: {
          ...campaign,
          stats,
          recipients
        }
      });
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return c.json({ error: 'Failed to fetch campaign' }, 500);
    }
  });

  // Create campaign
  app.post("/make-server-abb8d15d/phishing/campaigns", async (c) => {
    try {
      const supabase = getServiceClient();
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { isValid, email } = await verifyUser(accessToken, supabase);
      
      if (!isValid || !email) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const userData = await getUserData(email);
      if (!userData || !hasPhishingPermission(userData)) {
        return c.json({ error: 'Permission denied' }, 403);
      }

      const body = await c.req.json();
      const {
        name,
        description,
        objective,
        entityId,
        responsibleEmail,
        templateId,
        landingPageId,
        startDate,
        endDate,
        sendMode,
        recipients,
        tracking,
        privacy,
        autoSensitization
      } = body;

      if (!name || !entityId || !templateId || !recipients || recipients.length === 0) {
        return c.json({ error: 'Missing required fields' }, 400);
      }

      const campaignId = generateId('CAMP');
      const now = new Date().toISOString();

      const campaign = {
        id: campaignId,
        name,
        description: description || '',
        objective: objective || 'general_awareness',
        clientId: userData.clientId,
        clientCode: userData.clientCode,
        clientName: userData.clientName,
        entityId,
        responsibleEmail: responsibleEmail || email,
        templateId,
        landingPageId: landingPageId || null,
        startDate: startDate || now,
        endDate: endDate || null,
        sendMode: sendMode || 'immediate',
        tracking: tracking || { opens: true, clicks: true, submissions: true, reports: true },
        privacy: privacy || { granularity: 'individual', anonymize: false },
        autoSensitization: autoSensitization || { enabled: false },
        status: 'draft',
        createdAt: now,
        createdBy: email,
        updatedAt: now,
        recipientCount: recipients.length
      };

      await kv.set(`phishing_campaign:${campaignId}`, campaign);

      // Create recipient records
      for (const recipient of recipients) {
        const recipientId = generateId('RCP');
        const recipientData = {
          id: recipientId,
          campaignId,
          email: recipient.email,
          name: recipient.name || '',
          department: recipient.department || '',
          site: recipient.site || '',
          opened: false,
          clicked: false,
          submitted: false,
          reported: false,
          openedAt: null,
          clickedAt: null,
          submittedAt: null,
          reportedAt: null,
          status: 'pending',
          createdAt: now
        };
        await kv.set(`phishing_recipient:${campaignId}:${recipientId}`, recipientData);
      }

      return c.json({ 
        success: true, 
        campaign 
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      return c.json({ error: 'Failed to create campaign' }, 500);
    }
  });

  // Update campaign
  app.put("/make-server-abb8d15d/phishing/campaigns/:id", async (c) => {
    try {
      const supabase = getServiceClient();
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { isValid, email } = await verifyUser(accessToken, supabase);
      
      if (!isValid || !email) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const userData = await getUserData(email);
      if (!userData || !hasPhishingPermission(userData)) {
        return c.json({ error: 'Permission denied' }, 403);
      }

      const campaignId = c.req.param('id');
      const campaign = await kv.get(`phishing_campaign:${campaignId}`);
      
      if (!campaign) {
        return c.json({ error: 'Campaign not found' }, 404);
      }

      if (campaign.clientCode !== userData.clientCode) {
        return c.json({ error: 'Access denied' }, 403);
      }

      // Cannot update campaign that is already running or completed
      if (campaign.status === 'running' || campaign.status === 'completed') {
        return c.json({ error: 'Cannot update running or completed campaign' }, 400);
      }

      const updates = await c.req.json();
      const updatedCampaign = {
        ...campaign,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await kv.set(`phishing_campaign:${campaignId}`, updatedCampaign);

      return c.json({ 
        success: true, 
        campaign: updatedCampaign 
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      return c.json({ error: 'Failed to update campaign' }, 500);
    }
  });

  // Launch campaign
  app.post("/make-server-abb8d15d/phishing/campaigns/:id/launch", async (c) => {
    try {
      const supabase = getServiceClient();
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { isValid, email } = await verifyUser(accessToken, supabase);
      
      if (!isValid || !email) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const userData = await getUserData(email);
      if (!userData || !hasPhishingPermission(userData)) {
        return c.json({ error: 'Permission denied' }, 403);
      }

      const campaignId = c.req.param('id');
      const campaign = await kv.get(`phishing_campaign:${campaignId}`);
      
      if (!campaign) {
        return c.json({ error: 'Campaign not found' }, 404);
      }

      if (campaign.clientCode !== userData.clientCode) {
        return c.json({ error: 'Access denied' }, 403);
      }

      if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
        return c.json({ error: 'Campaign already launched' }, 400);
      }

      // Update status
      const now = new Date();
      const startDate = new Date(campaign.startDate);
      const status = startDate > now ? 'scheduled' : 'running';

      campaign.status = status;
      campaign.launchedAt = now.toISOString();
      campaign.launchedBy = email;
      campaign.updatedAt = now.toISOString();

      await kv.set(`phishing_campaign:${campaignId}`, campaign);

      // Trigger email sending based on sendMode
      if (status === 'running' && campaign.sendMode === 'immediate') {
        console.log(`[PHISHING] Preparing to send emails for campaign ${campaignId}`);
        console.log(`[PHISHING] Campaign sendMode: ${campaign.sendMode}, status: ${status}`);
        
        // Get template
        const template = await kv.get(`phishing_template:${campaign.templateId}`);
        if (!template) {
          console.error(`[PHISHING] Template ${campaign.templateId} not found for campaign ${campaignId}`);
          return c.json({ error: 'Template not found' }, 404);
        }
        console.log(`[PHISHING] Template found: ${template.name}`);

        // Get recipients
        const recipients = await kv.getByPrefix(`phishing_recipient:${campaignId}:`);
        console.log(`[PHISHING] Found ${recipients.length} recipients for campaign ${campaignId}`);
        
        if (recipients.length === 0) {
          console.warn(`[PHISHING] No recipients found for campaign ${campaignId}`);
        } else {
          console.log(`[PHISHING] Recipients:`, recipients.map((r: any) => ({ id: r.id, email: r.email })));
        }
        
        // Get base URL from environment
        const baseUrl = Deno.env.get('SUPABASE_URL') || '';
        console.log(`[PHISHING] Base URL: ${baseUrl}`);
        
        // Check Mailjet credentials
        const hasMailjetKey = !!Deno.env.get('MAILJET_API_KEY');
        const hasMailjetSecret = !!Deno.env.get('MAILJET_SECRET_KEY');
        console.log(`[PHISHING] Mailjet credentials - API Key: ${hasMailjetKey}, Secret: ${hasMailjetSecret}`);
        
        // Send emails in background (don't wait)
        console.log(`[PHISHING] Starting email batch send...`);
        sendPhishingEmailBatch(template, campaign, recipients, baseUrl, campaignId, 2000)
          .then((result) => {
            console.log(`[PHISHING] Campaign ${campaignId}: Sent ${result.sent} emails, ${result.failed} failed`);
            if (result.errors.length > 0) {
              console.error('[PHISHING] Email sending errors:', result.errors);
            }
          })
          .catch((error) => {
            console.error(`[PHISHING] Error sending emails for campaign ${campaignId}:`, error);
          });
      } else {
        console.log(`[PHISHING] Skipping email sending - status: ${status}, sendMode: ${campaign.sendMode}`);
      }

      return c.json({ 
        success: true, 
        campaign,
        message: status === 'running' ? 'Campaign launched and emails are being sent' : 'Campaign scheduled'
      });
    } catch (error) {
      console.error('Error launching campaign:', error);
      return c.json({ error: 'Failed to launch campaign' }, 500);
    }
  });

  // Stop campaign
  app.post("/make-server-abb8d15d/phishing/campaigns/:id/stop", async (c) => {
    try {
      const supabase = getServiceClient();
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { isValid, email } = await verifyUser(accessToken, supabase);
      
      if (!isValid || !email) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const userData = await getUserData(email);
      if (!userData || !hasPhishingPermission(userData)) {
        return c.json({ error: 'Permission denied' }, 403);
      }

      const campaignId = c.req.param('id');
      const campaign = await kv.get(`phishing_campaign:${campaignId}`);
      
      if (!campaign) {
        return c.json({ error: 'Campaign not found' }, 404);
      }

      if (campaign.clientCode !== userData.clientCode) {
        return c.json({ error: 'Access denied' }, 403);
      }

      campaign.status = 'stopped';
      campaign.stoppedAt = new Date().toISOString();
      campaign.stoppedBy = email;
      campaign.updatedAt = new Date().toISOString();

      await kv.set(`phishing_campaign:${campaignId}`, campaign);

      return c.json({ 
        success: true, 
        campaign 
      });
    } catch (error) {
      console.error('Error stopping campaign:', error);
      return c.json({ error: 'Failed to stop campaign' }, 500);
    }
  });

  // Delete campaign
  app.delete("/make-server-abb8d15d/phishing/campaigns/:id", async (c) => {
    try {
      const supabase = getServiceClient();
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { isValid, email } = await verifyUser(accessToken, supabase);
      
      if (!isValid || !email) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const userData = await getUserData(email);
      if (!userData || !hasPhishingPermission(userData)) {
        return c.json({ error: 'Permission denied' }, 403);
      }

      const campaignId = c.req.param('id');
      const campaign = await kv.get(`phishing_campaign:${campaignId}`);
      
      if (!campaign) {
        return c.json({ error: 'Campaign not found' }, 404);
      }

      if (campaign.clientCode !== userData.clientCode) {
        return c.json({ error: 'Access denied' }, 403);
      }

      // Delete campaign and all recipients
      await kv.del(`phishing_campaign:${campaignId}`);
      
      const recipients = await kv.getByPrefix(`phishing_recipient:${campaignId}:`);
      for (const recipient of recipients) {
        await kv.del(`phishing_recipient:${campaignId}:${recipient.id}`);
      }

      return c.json({ success: true });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return c.json({ error: 'Failed to delete campaign' }, 500);
    }
  });

  // ========================================
  // TEMPLATES
  // ========================================

  // Get all templates
  app.get("/make-server-abb8d15d/phishing/templates", async (c) => {
    try {
      const supabase = getServiceClient();
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { isValid, email } = await verifyUser(accessToken, supabase);
      
      if (!isValid || !email) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const userData = await getUserData(email);
      if (!userData || !hasPhishingPermission(userData)) {
        return c.json({ error: 'Permission denied' }, 403);
      }

      // Get all templates (global + client-specific)
      const allTemplates = await kv.getByPrefix('phishing_template:');
      const templates = allTemplates.filter((t: any) => 
        t && (t.isGlobal || t.clientCode === userData.clientCode)
      );

      return c.json({ 
        success: true, 
        templates 
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      return c.json({ error: 'Failed to fetch templates' }, 500);
    }
  });

  // Create template
  app.post("/make-server-abb8d15d/phishing/templates", async (c) => {
    try {
      const supabase = getServiceClient();
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { isValid, email } = await verifyUser(accessToken, supabase);
      
      if (!isValid || !email) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const userData = await getUserData(email);
      if (!userData || !hasPhishingPermission(userData)) {
        return c.json({ error: 'Permission denied' }, 403);
      }

      const body = await c.req.json();
      const {
        name,
        category,
        senderName,
        senderEmail,
        subject,
        htmlContent,
        textContent,
        isGlobal
      } = body;

      if (!name || !subject || !htmlContent) {
        return c.json({ error: 'Missing required fields' }, 400);
      }

      const templateId = generateId('TPL');
      const now = new Date().toISOString();

      const template = {
        id: templateId,
        name,
        category: category || 'custom',
        senderName: senderName || 'Service IT',
        senderEmail: senderEmail || 'noreply@phishing-test.local',
        subject,
        htmlContent,
        textContent: textContent || '',
        isGlobal: isGlobal || false,
        clientCode: userData.clientCode,
        createdAt: now,
        createdBy: email,
        updatedAt: now
      };

      await kv.set(`phishing_template:${templateId}`, template);

      return c.json({ 
        success: true, 
        template 
      });
    } catch (error) {
      console.error('Error creating template:', error);
      return c.json({ error: 'Failed to create template' }, 500);
    }
  });

  // ========================================
  // TRACKING (Public endpoints for email tracking)
  // ========================================

  // Track email open
  app.get("/make-server-abb8d15d/phishing/track/open/:campaignId/:recipientId", async (c) => {
    console.log('[TRACK OPEN] ========== ENDPOINT CALLED ==========');
    console.log('[TRACK OPEN] Full URL:', c.req.url);
    console.log('[TRACK OPEN] Method:', c.req.method);
    try {
      const campaignId = c.req.param('campaignId');
      const recipientId = c.req.param('recipientId');
      console.log('[TRACK OPEN] Campaign ID:', campaignId);
      console.log('[TRACK OPEN] Recipient ID:', recipientId);

      const recipient = await kv.get(`phishing_recipient:${campaignId}:${recipientId}`);
      console.log('[TRACK OPEN] Recipient found:', !!recipient);
      
      if (recipient && !recipient.opened) {
        recipient.opened = true;
        recipient.openedAt = new Date().toISOString();
        recipient.status = 'opened';
        await kv.set(`phishing_recipient:${campaignId}:${recipientId}`, recipient);
      }

      // Return 1x1 transparent pixel
      const pixel = Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), c => c.charCodeAt(0));
      return new Response(pixel, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    } catch (error) {
      console.error('Error tracking open:', error);
      const pixel = Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), c => c.charCodeAt(0));
      return new Response(pixel, {
        headers: { 'Content-Type': 'image/gif' }
      });
    }
  });

  // Track link click
  app.get("/make-server-abb8d15d/phishing/track/click/:campaignId/:recipientId", async (c) => {
    console.log('[TRACK CLICK] ==========  ENDPOINT CALLED  ==========');
    console.log('[TRACK CLICK] Full URL:', c.req.url);
    console.log('[TRACK CLICK] Method:', c.req.method);
    console.log('[TRACK CLICK] Headers:', Object.fromEntries(c.req.raw.headers.entries()));
    try {
      const campaignId = c.req.param('campaignId');
      const recipientId = c.req.param('recipientId');
      console.log('[TRACK CLICK] Campaign ID:', campaignId);
      console.log('[TRACK CLICK] Recipient ID:', recipientId);

      const recipient = await kv.get(`phishing_recipient:${campaignId}:${recipientId}`);
      console.log('[TRACK CLICK] Recipient found:', !!recipient);
      const campaign = await kv.get(`phishing_campaign:${campaignId}`);
      
      if (recipient && !recipient.clicked) {
        recipient.clicked = true;
        recipient.clickedAt = new Date().toISOString();
        recipient.status = 'clicked';
        await kv.set(`phishing_recipient:${campaignId}:${recipientId}`, recipient);
      }

      // Redirect to landing page or show educational message
      if (campaign?.landingPageId) {
        return c.redirect(`/phishing/landing/${campaignId}/${recipientId}`);
      } else {
        // Show default educational message
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Test de Phishing</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 600px;
      margin: 100px auto;
      padding: 40px;
      text-align: center;
    }
    .warning { font-size: 80px; margin-bottom: 20px; }
    h1 { color: #f59e0b; margin-bottom: 20px; }
    p { color: #6b7280; line-height: 1.6; margin-bottom: 15px; }
    .tips { text-align: left; background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 30px; }
    .tips h2 { color: #1f2937; font-size: 18px; margin-bottom: 15px; }
    .tips ul { list-style: none; padding: 0; }
    .tips li { margin-bottom: 10px; padding-left: 25px; position: relative; }
    .tips li:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
  </style>
</head>
<body>
  <div class="warning">⚠️</div>
  <h1>Ceci était un test de phishing</h1>
  <p>Vous avez cliqué sur un lien dans un e-mail de test de phishing organisé par votre entreprise.</p>
  <p>L'objectif de ce test est d'améliorer la sécurité de tous, pas de vous sanctionner.</p>
  
  <div class="tips">
    <h2>Comment détecter un e-mail de phishing ?</h2>
    <ul>
      <li>Vérifiez l'adresse e-mail de l'expéditeur</li>
      <li>Méfiez-vous des messages urgents ou menaçants</li>
      <li>Passez votre souris sur les liens avant de cliquer</li>
      <li>En cas de doute, contactez votre service IT</li>
    </ul>
  </div>
</body>
</html>
        `;
        return c.html(html);
      }
    } catch (error) {
      console.error('Error tracking click:', error);
      return c.text('Error', 500);
    }
  });

  // Track form submission
  app.post("/make-server-abb8d15d/phishing/track/submit/:campaignId/:recipientId", async (c) => {
    try {
      const campaignId = c.req.param('campaignId');
      const recipientId = c.req.param('recipientId');

      const recipient = await kv.get(`phishing_recipient:${campaignId}:${recipientId}`);
      
      if (recipient) {
        recipient.submitted = true;
        recipient.submittedAt = new Date().toISOString();
        recipient.status = 'submitted';
        await kv.set(`phishing_recipient:${campaignId}:${recipientId}`, recipient);
      }

      return c.json({ success: true });
    } catch (error) {
      console.error('Error tracking submission:', error);
      return c.json({ error: 'Failed to track submission' }, 500);
    }
  });

  // Track report
  app.post("/make-server-abb8d15d/phishing/track/report/:campaignId/:recipientId", async (c) => {
    try {
      const campaignId = c.req.param('campaignId');
      const recipientId = c.req.param('recipientId');

      const recipient = await kv.get(`phishing_recipient:${campaignId}:${recipientId}`);
      
      if (recipient) {
        recipient.reported = true;
        recipient.reportedAt = new Date().toISOString();
        recipient.status = 'reported';
        await kv.set(`phishing_recipient:${campaignId}:${recipientId}`, recipient);
      }

      return c.json({ success: true });
    } catch (error) {
      console.error('Error tracking report:', error);
      return c.json({ error: 'Failed to track report' }, 500);
    }
  });

  // ========================================
  // ANALYTICS
  // ========================================

  // Get analytics for client
  app.get("/make-server-abb8d15d/phishing/analytics", async (c) => {
    try {
      const supabase = getServiceClient();
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { isValid, email } = await verifyUser(accessToken, supabase);
      
      if (!isValid || !email) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const userData = await getUserData(email);
      if (!userData || !hasPhishingPermission(userData)) {
        return c.json({ error: 'Permission denied' }, 403);
      }

      // Get all campaigns for this client
      const allCampaigns = await kv.getByPrefix('phishing_campaign:');
      const clientCampaigns = allCampaigns.filter((c: any) => 
        c && c.clientCode === userData.clientCode
      );

      // Calculate global statistics
      let totalRecipients = 0;
      let totalOpened = 0;
      let totalClicked = 0;
      let totalSubmitted = 0;
      let totalReported = 0;

      for (const campaign of clientCampaigns) {
        const recipients = await kv.getByPrefix(`phishing_recipient:${campaign.id}:`);
        totalRecipients += recipients.length;
        totalOpened += recipients.filter((r: any) => r.opened).length;
        totalClicked += recipients.filter((r: any) => r.clicked).length;
        totalSubmitted += recipients.filter((r: any) => r.submitted).length;
        totalReported += recipients.filter((r: any) => r.reported).length;
      }

      const analytics = {
        totalCampaigns: clientCampaigns.length,
        totalRecipients,
        rates: {
          openRate: totalRecipients > 0 ? (totalOpened / totalRecipients * 100).toFixed(1) : 0,
          clickRate: totalRecipients > 0 ? (totalClicked / totalRecipients * 100).toFixed(1) : 0,
          submitRate: totalRecipients > 0 ? (totalSubmitted / totalRecipients * 100).toFixed(1) : 0,
          reportRate: totalRecipients > 0 ? (totalReported / totalRecipients * 100).toFixed(1) : 0,
        },
        maturityScore: calculateMaturityScore(totalReported, totalClicked, totalRecipients),
        campaigns: clientCampaigns.map((c: any) => ({
          id: c.id,
          name: c.name,
          status: c.status,
          createdAt: c.createdAt,
          recipientCount: c.recipientCount
        }))
      };

      return c.json({ 
        success: true, 
        analytics 
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return c.json({ error: 'Failed to fetch analytics' }, 500);
    }
  });
}

// Helper: Calculate maturity score
function calculateMaturityScore(reported: number, clicked: number, total: number): string {
  if (total === 0) return 'N/A';
  
  const reportRate = (reported / total) * 100;
  const clickRate = (clicked / total) * 100;
  
  // Score based on report rate and inverse click rate
  const score = (reportRate * 0.7) + ((100 - clickRate) * 0.3);
  
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}