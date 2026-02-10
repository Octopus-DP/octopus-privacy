// CLIENT ADMIN - User Management Routes
import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

// Create Supabase client
const getServiceClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper to verify client admin access
export async function verifyClientAdmin(accessToken: string | undefined): Promise<{ isClientAdmin: boolean; userId: string | null; email: string | null; clientCode: string | null }> {
  console.log('[verifyClientAdmin] Starting verification...');
  
  if (!accessToken) {
    console.log('[verifyClientAdmin] No access token provided');
    return { isClientAdmin: false, userId: null, email: null, clientCode: null };
  }

  const supabase = getServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    console.log('[verifyClientAdmin] Error getting user from Supabase:', error);
    return { isClientAdmin: false, userId: null, email: null, clientCode: null };
  }

  console.log('[verifyClientAdmin] Supabase user:', { id: user.id, email: user.email });

  // Get user data to check role
  const userIdFromEmail = await kv.get(`user_email:${user.email}`);
  console.log('[verifyClientAdmin] User ID from email:', userIdFromEmail);
  
  if (!userIdFromEmail) {
    console.log('[verifyClientAdmin] No user found in KV store for email:', user.email);
    return { isClientAdmin: false, userId: user.id, email: user.email, clientCode: null };
  }

  const userData = await kv.get(`user:${userIdFromEmail}`);
  console.log('[verifyClientAdmin] User data from KV:', userData);
  
  if (!userData || userData.role !== 'client_admin') {
    console.log('[verifyClientAdmin] User is not client_admin. Role:', userData?.role);
    return { isClientAdmin: false, userId: user.id, email: user.email, clientCode: null };
  }

  console.log('[verifyClientAdmin] ✅ User is client_admin with clientCode:', userData.clientCode);
  return { isClientAdmin: true, userId: user.id, email: user.email, clientCode: userData.clientCode };
}

export function setupClientAdminRoutes(app: Hono) {
  // Get all users for client admin
  app.get("/make-server-abb8d15d/client-admin/users", async (c) => {
    try {
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { isClientAdmin, clientCode } = await verifyClientAdmin(accessToken);
      
      if (!isClientAdmin || !clientCode) {
        return c.json({ error: 'Unauthorized - Client admin access required' }, 401);
      }

      // Get all users for this client
      const userKeys = await kv.getByPrefix(`user:`);
      const users = userKeys
        .filter((userData: any) => userData.clientCode === clientCode)
        .map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions || { registre: true, droits: true, violations: true, phishing: true },
          legalEntityIds: user.legalEntityIds || [],
          clientCode: user.clientCode,
          invitedAt: user.invitedAt,
          activatedAt: user.activatedAt,
        }));

      return c.json({ success: true, users });
    } catch (error) {
      console.error('Error fetching client users:', error);
      return c.json({ error: 'Failed to fetch users' }, 500);
    }
  });

  // Create a new user (by client admin)
  app.post("/make-server-abb8d15d/client-admin/users", async (c) => {
    try {
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { isClientAdmin, clientCode } = await verifyClientAdmin(accessToken);
      
      if (!isClientAdmin || !clientCode) {
        return c.json({ error: 'Unauthorized - Client admin access required' }, 401);
      }

      const requestBody = await c.req.json();
      console.log('Create user request body:', JSON.stringify(requestBody, null, 2));
      
      const { name, email, role, permissions, legalEntityIds } = requestBody;

      if (!name || !email || !legalEntityIds || legalEntityIds.length === 0) {
        console.error('Missing required fields:', { name: !!name, email: !!email, legalEntityIds: legalEntityIds?.length });
        return c.json({ error: 'Name, email, and at least one legal entity are required' }, 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return c.json({ error: 'Invalid email format' }, 400);
      }

      // Ensure email is lowercase
      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existingUserId = await kv.get(`user_email:${normalizedEmail}`);
      if (existingUserId) {
        return c.json({ error: 'Un utilisateur avec cet email existe déjà' }, 400);
      }

      // Get client data to get the client name
      const clientData = await kv.get(`client:${clientCode}`);
      if (!clientData) {
        return c.json({ error: 'Client not found' }, 404);
      }

      // Set default permissions for client admins
      const finalPermissions = role === 'client_admin' 
        ? { registre: true, droits: true, violations: true, users: true }
        : { ...permissions, users: false };

      // Create user in Supabase Auth
      const supabase = getServiceClient();
      
      // Generate a temporary password
      const words = ['Secure', 'Portal', 'Access', 'Client', 'Privacy', 'Data'];
      const specialChars = '!@#$%&*';
      const tempPassword = `${words[Math.floor(Math.random() * words.length)]}${words[Math.floor(Math.random() * words.length)]}${Math.floor(Math.random() * 100)}${specialChars[Math.floor(Math.random() * specialChars.length)]}`;

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name },
      });

      if (authError) {
        console.error('Error creating user in Supabase Auth:', authError);
        return c.json({ error: 'Failed to create user account' }, 500);
      }

      // Create user data
      const userData = {
        id: authUser.user.id,
        name,
        email: normalizedEmail,
        clientCode,
        clientName: clientData.name,
        role: role || 'user',
        permissions: finalPermissions,
        legalEntityIds,
        temporaryPassword: tempPassword,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
      };

      // Save to KV store
      await kv.set(`user:${authUser.user.id}`, userData);
      await kv.set(`user_email:${normalizedEmail}`, authUser.user.id);

      return c.json({ success: true, userId: authUser.user.id });
    } catch (error) {
      console.error('Error creating user:', error);
      return c.json({ error: 'Failed to create user' }, 500);
    }
  });

  // Update user permissions (by client admin)
  app.put("/make-server-abb8d15d/client-admin/users/:userId", async (c) => {
    try {
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { isClientAdmin, clientCode } = await verifyClientAdmin(accessToken);
      
      if (!isClientAdmin || !clientCode) {
        return c.json({ error: 'Unauthorized - Client admin access required' }, 401);
      }

      const userId = c.req.param('userId');
      const { role, permissions, legalEntityIds } = await c.req.json();

      const userData = await kv.get(`user:${userId}`);
      if (!userData) {
        return c.json({ error: 'User not found' }, 404);
      }

      // Verify user belongs to same client
      if (userData.clientCode !== clientCode) {
        return c.json({ error: 'Unauthorized - Cannot modify users from other clients' }, 401);
      }

      // Set permissions based on role
      const finalPermissions = role === 'client_admin' 
        ? { registre: true, droits: true, violations: true, users: true }
        : { ...permissions, users: false };

      // Update user data
      userData.role = role;
      userData.permissions = finalPermissions;
      userData.legalEntityIds = legalEntityIds;
      userData.updatedAt = new Date().toISOString();

      await kv.set(`user:${userId}`, userData);

      return c.json({ success: true });
    } catch (error) {
      console.error('Error updating user:', error);
      return c.json({ error: 'Failed to update user' }, 500);
    }
  });

  // Delete user (by client admin)
  app.delete("/make-server-abb8d15d/client-admin/users/:userId", async (c) => {
    try {
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { isClientAdmin, clientCode } = await verifyClientAdmin(accessToken);
      
      if (!isClientAdmin || !clientCode) {
        return c.json({ error: 'Unauthorized - Client admin access required' }, 401);
      }

      const userId = c.req.param('userId');

      const userData = await kv.get(`user:${userId}`);
      if (!userData) {
        return c.json({ error: 'User not found' }, 404);
      }

      // Verify user belongs to same client
      if (userData.clientCode !== clientCode) {
        return c.json({ error: 'Unauthorized - Cannot delete users from other clients' }, 401);
      }

      // Delete from Supabase Auth
      const supabase = getServiceClient();
      await supabase.auth.admin.deleteUser(userId);

      // Delete from KV store
      await kv.del(`user:${userId}`);
      await kv.del(`user_email:${userData.email}`);

      return c.json({ success: true });
    } catch (error) {
      console.error('Error deleting user:', error);
      return c.json({ error: 'Failed to delete user' }, 500);
    }
  });

  // Send invitation to a single user (by client admin)
  app.post("/make-server-abb8d15d/client-admin/send-invitation", async (c) => {
    try {
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { isClientAdmin, clientCode } = await verifyClientAdmin(accessToken);
      
      if (!isClientAdmin || !clientCode) {
        return c.json({ error: 'Unauthorized - Client admin access required' }, 401);
      }

      const { userId } = await c.req.json();

      if (!userId) {
        return c.json({ error: 'User ID is required' }, 400);
      }

      const userData = await kv.get(`user:${userId}`);
      if (!userData) {
        return c.json({ error: 'User not found' }, 404);
      }

      // Verify user belongs to same client
      if (userData.clientCode !== clientCode) {
        return c.json({ error: 'Unauthorized - Cannot send invitations to users from other clients' }, 401);
      }

      // Generate a new temporary password if needed
      let tempPassword = userData.temporaryPassword;
      
      if (!tempPassword) {
        const words = ['Secure', 'Portal', 'Access', 'Client', 'Privacy', 'Data'];
        const specialChars = '!@#$%&*';
        tempPassword = `${words[Math.floor(Math.random() * words.length)]}${words[Math.floor(Math.random() * words.length)]}${Math.floor(Math.random() * 100)}${specialChars[Math.floor(Math.random() * specialChars.length)]}`;
        
        // Update password in Supabase
        const supabase = getServiceClient();
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          password: tempPassword,
        });
        
        if (error) {
          console.error(`Failed to generate password for user ${userData.email}:`, error);
          return c.json({ error: 'Failed to generate password' }, 500);
        }
        
        userData.temporaryPassword = tempPassword;
        userData.mustChangePassword = true;
      }

      // Send invitation email via Mailjet
      const mailjetApiKey = Deno.env.get('MAILJET_API_KEY');
      const mailjetSecretKey = Deno.env.get('MAILJET_SECRET_KEY');

      if (!mailjetApiKey || !mailjetSecretKey) {
        console.error('Mailjet credentials not configured');
        return c.json({ error: 'Email service not configured' }, 500);
      }

      const emailData = {
        to: userData.email,
        name: userData.name,
        clientName: userData.clientName,
        tempPassword: tempPassword,
      };

      // Send invitation email (blue background)
      const invitationResponse = await fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${mailjetApiKey}:${mailjetSecretKey}`)}`,
        },
        body: JSON.stringify({
          Messages: [{
            From: {
              Email: 'noreply@octopus-dp.fr',
              Name: 'Octopus Data & Privacy',
            },
            To: [{
              Email: emailData.to,
              Name: emailData.name,
            }],
            Subject: '🔐 Invitation au Portail Client - Octopus Data & Privacy',
            HTMLPart: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #f0f7ff; }
                    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; background-color: white; margin: 20px; border-radius: 8px; }
                    .credentials { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
                    .button { display: inline-block; padding: 12px 30px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                    .info-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1 style="margin: 0;">🔐 Invitation au Portail Client</h1>
                      <p style="margin: 10px 0 0 0;">Octopus Data & Privacy</p>
                    </div>
                    <div class="content">
                      <p>Bonjour <strong>${emailData.name}</strong>,</p>
                      
                      <p>Vous avez été invité(e) à accéder au portail client sécurisé d'<strong>Octopus Data & Privacy</strong> pour <strong>${emailData.clientName}</strong>.</p>
                      
                      <p>Ce portail vous permet de consulter et gérer vos données RGPD :</p>
                      <ul>
                        <li>📋 <strong>Registre des traitements</strong> (Article 30 RGPD)</li>
                        <li>✋ <strong>Exercice des droits</strong> (Articles 15-22 RGPD)</li>
                        <li>⚠️ <strong>Violations de données</strong> (Article 33 RGPD)</li>
                      </ul>

                      <div class="credentials">
                        <p style="margin-top: 0;"><strong>📧 Votre identifiant :</strong></p>
                        <p style="margin: 5px 0;"><strong>Email :</strong> ${emailData.to}</p>
                      </div>

                      <div class="info-box">
                        <p style="margin: 0;"><strong>⚠️ Important :</strong> Vous recevrez un email séparé contenant votre mot de passe temporaire. Pour des raisons de sécurité, vous devrez changer votre mot de passe lors de votre première connexion.</p>
                      </div>

                      <div style="text-align: center;">
                        <a href="${Deno.env.get('APP_URL') || 'https://votre-app.com'}" class="button">
                          Accéder au portail →
                        </a>
                      </div>

                      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                        Si vous avez des questions, n'hésitez pas à contacter votre consultant RGPD Octopus Data & Privacy.
                      </p>
                    </div>
                    <div class="footer">
                      <p>© ${new Date().getFullYear()} Octopus Data & Privacy - Protection des données personnelles et conformité RGPD</p>
                      <p style="font-size: 12px; color: #9ca3af;">Cet email a été envoyé de manière automatisée, merci de ne pas y répondre.</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          }],
        }),
      });

      if (!invitationResponse.ok) {
        const errorData = await invitationResponse.text();
        console.error('Mailjet invitation email error:', errorData);
        return c.json({ error: 'Failed to send invitation email' }, 500);
      }

      // Send password email (red background)
      const passwordResponse = await fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${mailjetApiKey}:${mailjetSecretKey}`)}`,
        },
        body: JSON.stringify({
          Messages: [{
            From: {
              Email: 'noreply@octopus-dp.fr',
              Name: 'Octopus Data & Privacy',
            },
            To: [{
              Email: emailData.to,
              Name: emailData.name,
            }],
            Subject: '🔑 Mot de passe temporaire - Octopus Data & Privacy',
            HTMLPart: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #fef2f2; }
                    .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; background-color: white; margin: 20px; border-radius: 8px; }
                    .password-box { background-color: #fee2e2; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
                    .password { font-size: 24px; font-weight: bold; color: #dc2626; letter-spacing: 2px; font-family: monospace; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                    .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1 style="margin: 0;">🔑 Mot de passe temporaire</h1>
                      <p style="margin: 10px 0 0 0;">Octopus Data & Privacy</p>
                    </div>
                    <div class="content">
                      <p>Bonjour <strong>${emailData.name}</strong>,</p>
                      
                      <p>Voici votre mot de passe temporaire pour accéder au portail client :</p>

                      <div class="password-box">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Votre mot de passe temporaire :</p>
                        <p class="password">${emailData.tempPassword}</p>
                      </div>

                      <div class="warning-box">
                        <p style="margin: 0;"><strong>⚠️ Sécurité :</strong></p>
                        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                          <li>Ce mot de passe est temporaire et doit être changé lors de votre première connexion</li>
                          <li>Ne partagez jamais votre mot de passe avec qui que ce soit</li>
                          <li>Supprimez cet email après avoir changé votre mot de passe</li>
                        </ul>
                      </div>

                      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                        Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.
                      </p>
                    </div>
                    <div class="footer">
                      <p>© ${new Date().getFullYear()} Octopus Data & Privacy</p>
                      <p style="font-size: 12px; color: #9ca3af;">Email confidentiel - Ne pas transférer</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          }],
        }),
      });

      if (!passwordResponse.ok) {
        const errorData = await passwordResponse.text();
        console.error('Mailjet password email error:', errorData);
        return c.json({ error: 'Failed to send password email' }, 500);
      }

      // Update user data with invitation timestamp
      userData.invitedAt = new Date().toISOString();
      await kv.set(`user:${userId}`, userData);

      return c.json({ success: true });
    } catch (error) {
      console.error('Error sending invitation:', error);
      return c.json({ error: 'Failed to send invitation' }, 500);
    }
  });
}