import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
//import * as kv from "./kv_store.tsx";
//import { cache, TTL, CacheKeys } from "./cache.tsx";
//import { initializeArchiveBucket, archiveOldHistory, archiveAllHistory, getArchivedHistory, listArchivedYears, getArchiveStats } from "./archiver.tsx";
import { setupClientAdminRoutes } from "./client-admin.tsx";
import { setupPhishingRoutes } from "./phishing.tsx";
import { initializeDefaultTemplates } from "./phishing-templates-init.tsx";

const app = new Hono();

// Create Supabase clients
const getServiceClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const getAnonClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
);

// Initialize archive bucket on startup
//initializeArchiveBucket();

// Initialize default phishing templates
initializeDefaultTemplates();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Setup Client Admin routes
setupClientAdminRoutes(app);

// Setup Phishing routes
setupPhishingRoutes(app, getServiceClient);

// Helper to verify admin access
async function verifyAdmin(accessToken: string | undefined): Promise<{ isAdmin: boolean; userId: string | null; error?: string }> {
  if (!accessToken) {
    return { isAdmin: false, userId: null, error: 'No token provided' };
  }

  const supabase = getServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return { isAdmin: false, userId: null, error: 'Invalid token' };
  }

  // Check if user is admin
  const admins = await kv.get('admins') || [];
  const isAdmin = admins.includes(user.email);

  return { isAdmin, userId: user.id };
}

// Helper to verify user access
async function verifyUser(accessToken: string | undefined): Promise<{ isValid: boolean; userId: string | null; email: string | null }> {
  if (!accessToken) {
    return { isValid: false, userId: null, email: null };
  }

  const supabase = getServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return { isValid: false, userId: null, email: null };
  }

  return { isValid: true, userId: user.id, email: user.email };
}

// Health check endpoint
app.get("/make-server-abb8d15d/health", (c) => {
  return c.json({ status: "ok" });
});

// Check if initial setup is needed
app.get("/make-server-abb8d15d/check-setup", async (c) => {
  try {
    const admins = await kv.get('admins');
    return c.json({ isSetup: admins && admins.length > 0 });
  } catch (error) {
    console.error('Error checking setup:', error);
    return c.json({ isSetup: false });
  }
});

// MIGRATION: Fix existing users without role field
app.post("/make-server-abb8d15d/admin/migrate-user-roles", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    console.log('Starting user role migration...');
    
    // Get all users
    const allUsers = await kv.getByPrefix('user:');
    console.log(`Found ${allUsers.length} users to check`);
    
    let updatedCount = 0;
    let emailKeysCreated = 0;
    
    for (const user of allUsers) {
      let needsUpdate = false;
      
      // Check and fix role
      if (!user.role) {
        // Set role to 'client_admin' by default for existing users
        // (since all users created by admin should be client admins)
        user.role = 'client_admin';
        needsUpdate = true;
        console.log(`Setting role for user ${user.email}: client_admin`);
      }
      
      // Ensure permissions exist
      if (!user.permissions) {
        user.permissions = {
          registre: true,
          droits: true,
          violations: true,
          users: true, // client_admin can manage users
        };
        needsUpdate = true;
      } else if (!user.permissions.users) {
        user.permissions.users = true;
        needsUpdate = true;
      }
      
      // Check and create user_email mapping if missing
      if (user.email) {
        const emailMapping = await kv.get(`user_email:${user.email}`);
        if (!emailMapping) {
          await kv.set(`user_email:${user.email}`, user.id);
          console.log(`Created email mapping for ${user.email} -> ${user.id}`);
          emailKeysCreated++;
        }
      }
      
      // Save updated user if needed
      if (needsUpdate) {
        await kv.set(`user:${user.id}`, user);
        console.log(`Updated user ${user.email} with role: ${user.role}`);
        updatedCount++;
      }
    }
    
    console.log(`Migration complete. Updated ${updatedCount} users, created ${emailKeysCreated} email mappings.`);
    
    return c.json({ 
      success: true, 
      message: `Updated ${updatedCount} users and created ${emailKeysCreated} email mappings`,
      totalUsers: allUsers.length,
      updatedUsers: updatedCount,
      emailKeysCreated
    });
  } catch (error) {
    console.error('Error during user role migration:', error);
    return c.json({ error: 'Failed to migrate user roles' }, 500);
  }
});

// DEBUG: Get user data by email
app.get("/make-server-abb8d15d/debug/user/:email", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const email = c.req.param('email');
    const userId = await kv.get(`user_email:${email}`);
    
    if (!userId) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const userData = await kv.get(`user:${userId}`);
    
    // Also get all entities to compare
    const allEntities = await kv.getByPrefix('legal_entity:');
    const userClientEntities = allEntities.filter((e: any) => e.clientCode === userData.clientCode);
    
    // Get client data
    const clientData = await kv.get(`client:${userData.clientId}`);
    
    return c.json({ 
      success: true, 
      userData,
      clientData,
      allEntities: allEntities.map(e => ({ id: e.id, name: e.name, clientCode: e.clientCode, clientId: e.clientId })),
      matchingEntities: userClientEntities.map(e => ({ id: e.id, name: e.name, clientCode: e.clientCode }))
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.json({ error: 'Failed to fetch user data' }, 500);
  }
});

// DEBUG: Fix user clientCode
app.post("/make-server-abb8d15d/debug/fix-user-client", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const { email, clientId } = await c.req.json();
    
    if (!email || !clientId) {
      return c.json({ error: 'Email and clientId required' }, 400);
    }
    
    const userId = await kv.get(`user_email:${email}`);
    if (!userId) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const userData = await kv.get(`user:${userId}`);
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404);
    }
    
    // Get client data
    const clientData = await kv.get(`client:${clientId}`);
    if (!clientData) {
      return c.json({ error: 'Client not found' }, 404);
    }
    
    // Update user with correct client data
    userData.clientId = clientId;
    userData.clientCode = clientData.code;
    userData.clientName = clientData.name;
    
    await kv.set(`user:${userId}`, userData);
    
    return c.json({ 
      success: true, 
      message: 'User client data updated',
      userData 
    });
  } catch (error) {
    console.error('Error fixing user client:', error);
    return c.json({ error: 'Failed to fix user client' }, 500);
  }
});

// Initialize admin (first-time setup)
app.post("/make-server-abb8d15d/init-admin", async (c) => {
  try {
    console.log('Init admin request received');
    const body = await c.req.json();
    console.log('Request body:', body);
    const { email } = body;
    
    if (!email) {
      console.error('No email provided');
      return c.json({ success: false, error: 'Email is required' }, 400);
    }
    
    console.log('Checking existing admins...');
    // Check if admins already exist
    const existingAdmins = await kv.get('admins');
    console.log('Existing admins:', existingAdmins);
    
    if (existingAdmins && existingAdmins.length > 0) {
      console.log('Admin already exists');
      return c.json({ success: false, error: 'Admin already initialized' }, 400);
    }

    console.log('Setting admin email:', email);
    await kv.set('admins', [email]);
    console.log('Admin initialized successfully');
    
    return c.json({ success: true, message: 'Admin initialized' });
  } catch (error) {
    console.error('Error initializing admin - Full error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    return c.json({ 
      success: false, 
      error: 'Failed to initialize admin', 
      details: error?.message || String(error)
    }, 500);
  }
});

// AUTH ROUTES

// Sign up (admin only - creates client users)
app.post("/make-server-abb8d15d/auth/signup", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const { email, password, name, clientId, legalEntityIds, permissions } = await c.req.json();

    const supabase = getServiceClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm since email server not configured
    });

    if (error) {
      console.error('Error creating user:', error);
      return c.json({ error: error.message }, 400);
    }

    // Get client code and name
    const clientData = await kv.get(`client:${clientId}`);
    const clientCode = clientData?.code || clientId;
    const clientName = clientData?.name || '';

    // Store user data in KV with client_admin role by default
    // Note: Client admins don't need legalEntityIds stored - they get access dynamically based on their role
    const userData = {
      id: data.user.id,
      email,
      name,
      clientId,
      clientCode,
      clientName,
      legalEntityIds: [], // Empty for client_admin - access is determined by role at runtime
      role: 'client_admin', // Users created by admin are client admins by default
      permissions: { registre: true, droits: true, violations: true, phishing: true, users: true }, // Full permissions for client admins
      mustChangePassword: true, // Force password change on first login
      temporaryPassword: password, // Store temporary password for invitation email
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${data.user.id}`, userData);
    await kv.set(`user_email:${email}`, data.user.id);

    return c.json({ success: true, user: userData });
  } catch (error) {
    console.error('Error in signup:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Sign in
app.post("/make-server-abb8d15d/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    const supabase = getAnonClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in:', error);
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Check if admin
    const admins = await kv.get('admins') || [];
    const isAdmin = admins.includes(email);

    // Get user data
    const userId = await kv.get(`user_email:${email}`);
    let userData = null;
    
    if (userId) {
      userData = await kv.get(`user:${userId}`);
    }

    return c.json({ 
      success: true, 
      accessToken: data.session.access_token,
      user: data.user,
      isAdmin,
      userData,
    });
  } catch (error) {
    console.error('Error in signin:', error);
    return c.json({ error: 'Failed to sign in' }, 500);
  }
});

// Get current session
app.get("/make-server-abb8d15d/auth/session", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, userId, email } = await verifyUser(accessToken);

    if (!isValid) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    // Check if admin
    const admins = await kv.get('admins') || [];
    const isAdmin = admins.includes(email);

    // Get user data
    let userData = null;
    if (userId) {
      const userIdFromEmail = await kv.get(`user_email:${email}`);
      if (userIdFromEmail) {
        userData = await kv.get(`user:${userIdFromEmail}`);
      }
    }

    return c.json({ 
      success: true,
      isAdmin,
      email,
      userData,
    });
  } catch (error) {
    console.error('Error getting session:', error);
    return c.json({ error: 'Failed to get session' }, 500);
  }
});

// ADMIN ROUTES - Client Management

// Get all clients
app.get("/make-server-abb8d15d/admin/clients", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const clients = await kv.getByPrefix('client:');
    
    // Get all users and legal entities to count them per client
    const allUsers = await kv.getByPrefix('user:');
    const allEntities = await kv.getByPrefix('legal_entity:');
    
    // Enrich clients with user and entity counts
    const enrichedClients = clients.map(client => {
      const userCount = allUsers.filter(user => user.clientId === client.id).length;
      const entityCount = allEntities.filter(entity => entity.clientId === client.id).length;
      
      return {
        ...client,
        userCount,
        entityCount
      };
    });
    
    return c.json({ success: true, clients: enrichedClients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return c.json({ error: 'Failed to fetch clients' }, 500);
  }
});

// Create client
app.post("/make-server-abb8d15d/admin/clients", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const { name, codeClient, logo, contactEmail, contactPhone, address } = await c.req.json();
    
    const clientId = crypto.randomUUID();
    const clientData = {
      id: clientId,
      name,
      codeClient,
      logo,
      contactEmail,
      contactPhone,
      address,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`client:${clientId}`, clientData);
    return c.json({ success: true, client: clientData });
  } catch (error) {
    console.error('Error creating client:', error);
    return c.json({ error: 'Failed to create client' }, 500);
  }
});

// Update client
app.put("/make-server-abb8d15d/admin/clients/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const clientId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingClient = await kv.get(`client:${clientId}`);
    if (!existingClient) {
      return c.json({ error: 'Client not found' }, 404);
    }

    const updatedClient = { ...existingClient, ...updates };
    await kv.set(`client:${clientId}`, updatedClient);
    
    return c.json({ success: true, client: updatedClient });
  } catch (error) {
    console.error('Error updating client:', error);
    return c.json({ error: 'Failed to update client' }, 500);
  }
});

// Delete client
app.delete("/make-server-abb8d15d/admin/clients/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const clientId = c.req.param('id');
    await kv.del(`client:${clientId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return c.json({ error: 'Failed to delete client' }, 500);
  }
});

// ADMIN ROUTES - User Management

// Get all users (optionally filtered by client)
app.get("/make-server-abb8d15d/admin/users", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const clientId = c.req.query('clientId');
    const allUsers = await kv.getByPrefix('user:');
    
    let users = allUsers.filter(user => user.id); // Filter out user_email entries
    
    if (clientId) {
      users = users.filter(user => user.clientId === clientId);
    }
    
    return c.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Update user permissions
app.put("/make-server-abb8d15d/admin/users/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const userId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingUser = await kv.get(`user:${userId}`);
    if (!existingUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updatedUser = { ...existingUser, ...updates };
    await kv.set(`user:${userId}`, updatedUser);
    
    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// Delete user
app.delete("/make-server-abb8d15d/admin/users/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const userId = c.req.param('id');
    const user = await kv.get(`user:${userId}`);
    
    if (user && user.email) {
      await kv.del(`user_email:${user.email}`);
    }
    
    await kv.del(`user:${userId}`);
    
    // Also delete from Supabase Auth
    const supabase = getServiceClient();
    await supabase.auth.admin.deleteUser(userId);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// ADMIN ROUTES - Legal Entity Management

// Get all legal entities
app.get("/make-server-abb8d15d/legal-entities", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const entities = await kv.getByPrefix('legal_entity:');
    
    // Enrich with client names
    const enrichedEntities = await Promise.all(
      entities.map(async (entity) => {
        const client = await kv.get(`client:${entity.clientId}`);
        return { ...entity, clientName: client?.name || 'Client inconnu' };
      })
    );
    
    return c.json({ success: true, entities: enrichedEntities });
  } catch (error) {
    console.error('Error fetching legal entities:', error);
    return c.json({ error: 'Failed to fetch legal entities' }, 500);
  }
});

// Create legal entity
app.post("/make-server-abb8d15d/legal-entities", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const { clientId, name, siren, logo, address, contactName, contactEmail, contactPhone } = await c.req.json();
    
    const entityId = crypto.randomUUID();
    const entityData = {
      id: entityId,
      clientId,
      name,
      siren,
      logo,
      address,
      contactName,
      contactEmail,
      contactPhone,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`legal_entity:${entityId}`, entityData);
    
    // Get client name for response
    const client = await kv.get(`client:${clientId}`);
    
    return c.json({ 
      success: true, 
      entity: { ...entityData, clientName: client?.name || 'Client inconnu' }
    });
  } catch (error) {
    console.error('Error creating legal entity:', error);
    return c.json({ error: 'Failed to create legal entity' }, 500);
  }
});

// Update legal entity
app.put("/make-server-abb8d15d/legal-entities/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const entityId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingEntity = await kv.get(`legal_entity:${entityId}`);
    if (!existingEntity) {
      return c.json({ error: 'Legal entity not found' }, 404);
    }

    const updatedEntity = { ...existingEntity, ...updates };
    await kv.set(`legal_entity:${entityId}`, updatedEntity);
    
    // Get client name for response
    const client = await kv.get(`client:${updatedEntity.clientId}`);
    
    return c.json({ 
      success: true, 
      entity: { ...updatedEntity, clientName: client?.name || 'Client inconnu' }
    });
  } catch (error) {
    console.error('Error updating legal entity:', error);
    return c.json({ error: 'Failed to update legal entity' }, 500);
  }
});

// Delete legal entity
app.delete("/make-server-abb8d15d/legal-entities/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const entityId = c.req.param('id');
    await kv.del(`legal_entity:${entityId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting legal entity:', error);
    return c.json({ error: 'Failed to delete legal entity' }, 500);
  }
});

// Get user's legal entities (for client portal)
app.get("/make-server-abb8d15d/user/legal-entities", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, userId, email } = await verifyUser(accessToken);
    
    if (!isValid) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user data to find assigned legal entities
    const userIdFromEmail = await kv.get(`user_email:${email}`);
    if (!userIdFromEmail) {
      return c.json({ error: 'User not found' }, 404);
    }

    const userData = await kv.get(`user:${userIdFromEmail}`);
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404);
    }

    console.log('Fetching legal entities for user:', { email, role: userData.role, clientCode: userData.clientCode });

    let validEntities = [];

    // If user is a client_admin, give access to ALL entities of their client
    if (userData.role === 'client_admin') {
      console.log('User is client_admin, fetching all entities for client:', userData.clientCode);
      const allEntities = await kv.getByPrefix('legal_entity:');
      console.log('All entities found:', allEntities.length);
      console.log('All entities:', JSON.stringify(allEntities.filter(e => e).map(e => ({ id: e.id, name: e.name, clientCode: e.clientCode }))));
      validEntities = allEntities.filter((entity: any) => entity && entity.clientCode === userData.clientCode);
      console.log('Found entities for client_admin:', validEntities.length);
      console.log('Filtered entities:', JSON.stringify(validEntities.filter(e => e).map(e => ({ id: e.id, name: e.name, clientCode: e.clientCode }))));
    } else {
      // For regular users, only return their assigned entities
      console.log('User is regular user, fetching assigned entities:', userData.legalEntityIds);
      const legalEntityIds = userData.legalEntityIds || [];
      
      // Fetch all assigned legal entities
      const entities = await Promise.all(
        legalEntityIds.map(async (entityId: string) => {
          const entity = await kv.get(`legal_entity:${entityId}`);
          return entity;
        })
      );

      // Filter out null values (in case an entity was deleted)
      validEntities = entities.filter(e => e !== null);
      console.log('Found assigned entities for regular user:', validEntities.length);
    }
    
    return c.json({ success: true, entities: validEntities });
  } catch (error) {
    console.error('Error fetching user legal entities:', error);
    return c.json({ error: 'Failed to fetch legal entities' }, 500);
  }
});

// PASSWORD CHANGE

// Change password (first login or user-initiated)
app.post("/make-server-abb8d15d/auth/change-password", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, userId, email } = await verifyUser(accessToken);
    
    if (!isValid) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { newPassword } = await c.req.json();

    // Validate password strength (12+ chars, uppercase, lowercase, number, special)
    if (newPassword.length < 12) {
      return c.json({ error: 'Le mot de passe doit contenir au moins 12 caractères' }, 400);
    }
    if (!/[A-Z]/.test(newPassword)) {
      return c.json({ error: 'Le mot de passe doit contenir au moins une majuscule' }, 400);
    }
    if (!/[a-z]/.test(newPassword)) {
      return c.json({ error: 'Le mot de passe doit contenir au moins une minuscule' }, 400);
    }
    if (!/[0-9]/.test(newPassword)) {
      return c.json({ error: 'Le mot de passe doit contenir au moins un chiffre' }, 400);
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return c.json({ error: 'Le mot de passe doit contenir au moins un caractère spécial' }, 400);
    }

    // Update password in Supabase
    const supabase = getServiceClient();
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      console.error('Error updating password:', error);
      return c.json({ error: 'Failed to update password' }, 500);
    }

    // Update user data - mark password as changed and set activation date
    const userIdFromEmail = await kv.get(`user_email:${email}`);
    if (userIdFromEmail) {
      const userData = await kv.get(`user:${userIdFromEmail}`);
      if (userData) {
        userData.mustChangePassword = false;
        delete userData.temporaryPassword; // Remove temporary password for security
        if (!userData.activatedAt) {
          userData.activatedAt = new Date().toISOString();
        }
        await kv.set(`user:${userIdFromEmail}`, userData);
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    return c.json({ error: 'Failed to change password' }, 500);
  }
});

// Change password for logged in user (with current password verification)
app.post("/make-server-abb8d15d/user/change-password", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, userId, email } = await verifyUser(accessToken);
    
    if (!isValid) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Mot de passe actuel et nouveau mot de passe requis' }, 400);
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return c.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, 400);
    }

    // Verify current password by attempting to sign in
    const anonClient = getAnonClient();
    const { error: signInError } = await anonClient.auth.signInWithPassword({
      email: email!,
      password: currentPassword,
    });

    if (signInError) {
      return c.json({ error: 'Mot de passe actuel incorrect' }, 401);
    }

    // Update password in Supabase
    const supabase = getServiceClient();
    const { error } = await supabase.auth.admin.updateUserById(userId!, {
      password: newPassword,
    });

    if (error) {
      console.error('Error updating password in user change password:', error);
      return c.json({ error: 'Erreur lors de la mise à jour du mot de passe' }, 500);
    }

    // Update user data if exists
    const userIdFromEmail = await kv.get(`user_email:${email}`);
    if (userIdFromEmail) {
      const userData = await kv.get(`user:${userIdFromEmail}`);
      if (userData) {
        userData.mustChangePassword = false;
        delete userData.temporaryPassword;
        await kv.set(`user:${userIdFromEmail}`, userData);
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error in user change password:', error);
    return c.json({ error: 'Erreur lors du changement de mot de passe' }, 500);
  }
});

// INVITATIONS

// Send invitations to selected users
app.post("/make-server-abb8d15d/admin/send-invitations", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const { userIds } = await c.req.json();
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return c.json({ error: 'No users selected' }, 400);
    }

    // Update users with invitation timestamp
    const updatedUsers = [];
    const emailsToSend = [];
    
    for (const userId of userIds) {
      const userData = await kv.get(`user:${userId}`);
      if (userData) {
        // Generate a new temporary password if user doesn't have one
        let tempPassword = userData.temporaryPassword;
        
        if (!tempPassword) {
          // Generate a secure temporary password: 3 words + number + special char
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
            continue; // Skip this user
          }
          
          // Store the new temporary password
          userData.temporaryPassword = tempPassword;
          userData.mustChangePassword = true;
          console.log(`Generated new temporary password for user ${userData.email}`);
        }
        
        userData.invitedAt = new Date().toISOString();
        await kv.set(`user:${userId}`, userData);
        updatedUsers.push(userData);
        
        // Prepare email data
        const client = await kv.get(`client:${userData.clientId}`);
        emailsToSend.push({
          to: userData.email,
          name: userData.name,
          clientName: client?.name || 'Votre organisation',
          temporaryPassword: tempPassword, // Include password for second email
        });
        
        // Debug log
        console.log(`User ${userData.email} - Has temporary password: ${!!tempPassword}`);
      }
    }

    // Send emails using Mailjet API
    const MAILJET_API_KEY = Deno.env.get('MAILJET_API_KEY');
    const MAILJET_SECRET_KEY = Deno.env.get('MAILJET_SECRET_KEY');
    
    if (MAILJET_API_KEY && MAILJET_SECRET_KEY) {
      try {
        // Mailjet requires Basic Auth with API_KEY:SECRET_KEY
        const authString = btoa(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`);
        
        for (const emailData of emailsToSend) {
          const emailBody = {
            Messages: [
              {
                From: {
                  Email: "noreply@octopus-dp.fr",
                  Name: "Octopus Data & Privacy"
                },
                To: [
                  {
                    Email: emailData.to,
                    Name: emailData.name
                  }
                ],
                Subject: "Invitation - Portail Client Octopus Data & Privacy",
                HTMLPart: `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="utf-8">
                      <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
                        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                        .credentials { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
                        .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
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
                            <p style="margin-top: 0;"><strong>📧 Vos identifiants :</strong></p>
                            <p style="margin: 5px 0;"><strong>Email :</strong> ${emailData.to}</p>
                            <p style="margin: 5px 0 0 0;"><strong>Mot de passe :</strong> Mot de passe temporaire fourni séparément</p>
                          </div>

                          <div class="info-box">
                            <p style="margin: 0;"><strong>⚠️ Important :</strong> Pour des raisons de sécurité, vous devrez changer votre mot de passe lors de votre première connexion.</p>
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
                TextPart: `
Bonjour ${emailData.name},

Vous avez été invité(e) à accéder au portail client sécurisé d'Octopus Data & Privacy pour ${emailData.clientName}.

Ce portail vous permet de consulter et gérer vos données RGPD :
- Registre des traitements (Article 30 RGPD)
- Exercice des droits (Articles 15-22 RGPD)  
- Violations de données (Article 33 RGPD)

Vos identifiants :
Email : ${emailData.to}
Mot de passe : Mot de passe temporaire fourni séparément

IMPORTANT : Pour des raisons de sécurité, vous devrez changer votre mot de passe lors de votre première connexion.

Accédez au portail : ${Deno.env.get('APP_URL') || 'https://votre-app.com'}

Si vous avez des questions, n'hésitez pas à contacter votre consultant RGPD Octopus Data & Privacy.

© ${new Date().getFullYear()} Octopus Data & Privacy
                `
              }
            ]
          };

          const response = await fetch('https://api.mailjet.com/v3.1/send', {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${authString}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailBody),
          });

          if (!response.ok) {
            const error = await response.text();
            console.error(`Failed to send invitation email to ${emailData.to}:`, error);
          } else {
            const result = await response.json();
            console.log(`Invitation email sent successfully to ${emailData.to}`, result);
          }
          
          // EMAIL 2: Send password in separate email for security
          if (emailData.temporaryPassword) {
            const passwordEmailBody = {
              Messages: [
                {
                  From: {
                    Email: "noreply@octopus-dp.fr",
                    Name: "Octopus Data & Privacy"
                  },
                  To: [
                    {
                      Email: emailData.to,
                      Name: emailData.name
                    }
                  ],
                  Subject: "Mot de passe temporaire - Portail Client Octopus Data & Privacy",
                  HTMLPart: `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <style>
                          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
                          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                          .password-box { background: #fef2f2; border: 2px solid #dc2626; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
                          .password { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #dc2626; letter-spacing: 2px; padding: 10px; background: white; border-radius: 4px; display: inline-block; }
                          .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
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
                            
                            <p>Voici votre <strong>mot de passe temporaire</strong> pour accéder au portail client Octopus Data & Privacy :</p>
                            
                            <div class="password-box">
                              <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Mot de passe temporaire</p>
                              <div class="password">${emailData.temporaryPassword}</div>
                            </div>

                            <div class="warning-box">
                              <p style="margin: 0;"><strong>⚠️ IMPORTANT - Sécurité :</strong></p>
                              <ul style="margin: 10px 0 0 0;">
                                <li>Ce mot de passe est <strong>temporaire</strong> et doit être changé lors de votre première connexion</li>
                                <li>Pour des raisons de sécurité, <strong>ne partagez jamais</strong> ce mot de passe</li>
                                <li>Supprimez cet email après avoir changé votre mot de passe</li>
                                <li>Ce mot de passe a été envoyé séparément de votre invitation pour plus de sécurité</li>
                              </ul>
                            </div>

                            <p style="margin-top: 30px;"><strong>Étapes à suivre :</strong></p>
                            <ol>
                              <li>Connectez-vous au portail avec votre email et ce mot de passe temporaire</li>
                              <li>Vous serez automatiquement invité à créer un nouveau mot de passe sécurisé</li>
                              <li>Votre nouveau mot de passe doit contenir :
                                <ul>
                                  <li>Au moins 12 caractères</li>
                                  <li>Une majuscule et une minuscule</li>
                                  <li>Un chiffre</li>
                                  <li>Un caractère spécial</li>
                                </ul>
                              </li>
                            </ol>

                            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                              Si vous avez des questions, n'hésitez pas à contacter votre consultant RGPD Octopus Data & Privacy.
                            </p>
                          </div>
                          <div class="footer">
                            <p>© ${new Date().getFullYear()} Octopus Data & Privacy - Protection des données personnelles et conformité RGPD</p>
                            <p style="font-size: 12px; color: #9ca3af;">Cet email contient des informations confidentielles. Si vous l'avez reçu par erreur, veuillez le supprimer immédiatement.</p>
                          </div>
                        </div>
                      </body>
                    </html>
                  `,
                  TextPart: `
Bonjour ${emailData.name},

Voici votre mot de passe temporaire pour accéder au portail client Octopus Data & Privacy :

MOT DE PASSE TEMPORAIRE : ${emailData.temporaryPassword}

⚠️ IMPORTANT - Sécurité :
- Ce mot de passe est temporaire et doit être changé lors de votre première connexion
- Pour des raisons de sécurité, ne partagez jamais ce mot de passe
- Supprimez cet email après avoir changé votre mot de passe
- Ce mot de passe a été envoyé séparément de votre invitation pour plus de sécurité

Étapes à suivre :
1. Connectez-vous au portail avec votre email et ce mot de passe temporaire
2. Vous serez automatiquement invité à créer un nouveau mot de passe sécurisé
3. Votre nouveau mot de passe doit contenir :
   - Au moins 12 caractères
   - Une majuscule et une minuscule
   - Un chiffre
   - Un caractère spécial

Si vous avez des questions, n'hésitez pas à contacter votre consultant RGPD Octopus Data & Privacy.

© ${new Date().getFullYear()} Octopus Data & Privacy
                  `
                }
              ]
            };

            const passwordResponse = await fetch('https://api.mailjet.com/v3.1/send', {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(passwordEmailBody),
            });

            if (!passwordResponse.ok) {
              const error = await passwordResponse.text();
              console.error(`Failed to send password email to ${emailData.to}:`, error);
            } else {
              const result = await passwordResponse.json();
              console.log(`Password email sent successfully to ${emailData.to}`, result);
            }
          }
        }
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        // Don't fail the entire operation if emails fail
      }
    } else {
      console.log('MAILJET_API_KEY or MAILJET_SECRET_KEY not configured - emails not sent');
      console.log(`Would send ${emailsToSend.length} invitation emails`);
    }

    return c.json({ 
      success: true, 
      message: `${updatedUsers.length} invitation(s) envoyée(s)`,
      users: updatedUsers,
      emailsSent: !!(MAILJET_API_KEY && MAILJET_SECRET_KEY)
    });
  } catch (error) {
    console.error('Error sending invitations:', error);
    return c.json({ error: 'Failed to send invitations' }, 500);
  }
});

// =============================================
// RGPD DATA MANAGEMENT ROUTES
// =============================================

// Helper function to save history entry
async function saveHistory(
  module: 'traitement' | 'demande' | 'violation',
  clientId: string,
  itemId: string,
  action: 'created' | 'updated',
  oldData: any,
  newData: any,
  userId: string,
  userName: string
) {
  const timestamp = new Date().toISOString();
  const historyKey = `${module}_history:${clientId}:${itemId}:${timestamp}`;
  
  const historyEntry = {
    action,
    timestamp,
    userId,
    userName,
    oldData,
    newData,
    changes: action === 'updated' ? calculateChanges(oldData, newData) : null
  };
  
  await kv.set(historyKey, historyEntry);
}

// Helper to calculate what changed
function calculateChanges(oldData: any, newData: any): any {
  const changes: any = {};
  
  for (const key in newData) {
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes[key] = {
        from: oldData[key],
        to: newData[key]
      };
    }
  }
  
  return changes;
}

// Helper to verify user and get client access
async function verifyUserAccess(accessToken: string | undefined): Promise<{
  isValid: boolean;
  userId: string | null;
  userName: string | null;
  clientId: string | null;
  isAdmin: boolean;
  error?: string;
}> {
  if (!accessToken) {
    return { isValid: false, userId: null, userName: null, clientId: null, isAdmin: false, error: 'No token provided' };
  }

  const supabase = getServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return { isValid: false, userId: null, userName: null, clientId: null, isAdmin: false, error: 'Invalid token' };
  }

  // Check if admin
  const admins = await kv.get('admins') || [];
  const isAdmin = admins.includes(user.email);

  if (isAdmin) {
    return { isValid: true, userId: user.id, userName: 'Admin', clientId: null, isAdmin: true };
  }

  // Get user data from KV
  const userData = await kv.get(`user:${user.id}`);
  if (!userData) {
    return { isValid: false, userId: null, userName: null, clientId: null, isAdmin: false, error: 'User data not found' };
  }

  return { 
    isValid: true, 
    userId: user.id, 
    userName: userData.name,
    clientId: userData.clientId,
    isAdmin: false
  };
}

// =============================================
// TRAITEMENTS ROUTES
// =============================================

// Get all traitements for a client
app.get("/make-server-abb8d15d/traitements", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, clientId, isAdmin, error } = await verifyUserAccess(accessToken);
    
    if (!isValid) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const targetClientId = isAdmin ? c.req.query('clientId') : clientId;
    
    if (!targetClientId) {
      return c.json({ error: 'Client ID required' }, 400);
    }

    const traitements = await kv.getByPrefix(`traitement:${targetClientId}:`);
    
    return c.json({ success: true, traitements });
  } catch (error) {
    console.error('Error fetching traitements:', error);
    return c.json({ error: 'Failed to fetch traitements' }, 500);
  }
});

// Create traitement
app.post("/make-server-abb8d15d/traitements", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, clientId, userId, userName, isAdmin, error } = await verifyUserAccess(accessToken);
    
    if (!isValid) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const targetClientId = isAdmin && body.clientId ? body.clientId : clientId;
    
    if (!targetClientId) {
      return c.json({ error: 'Client ID required' }, 400);
    }

    const traitementId = `TR-${Date.now()}`;
    const traitement = {
      id: traitementId,
      clientId: targetClientId,
      ...body,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    await kv.set(`traitement:${targetClientId}:${traitementId}`, traitement);
    await saveHistory('traitement', targetClientId, traitementId, 'created', {}, traitement, userId!, userName!);

    return c.json({ success: true, traitement });
  } catch (error) {
    console.error('Error creating traitement:', error);
    return c.json({ error: 'Failed to create traitement' }, 500);
  }
});

// Update traitement
app.put("/make-server-abb8d15d/traitements/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, clientId, userId, userName, isAdmin, error } = await verifyUserAccess(accessToken);
    
    if (!isValid) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const traitementId = c.req.param('id');
    const updates = await c.req.json();
    
    const targetClientId = isAdmin && updates.clientId ? updates.clientId : clientId;
    
    const existingTraitement = await kv.get(`traitement:${targetClientId}:${traitementId}`);
    if (!existingTraitement) {
      return c.json({ error: 'Traitement not found' }, 404);
    }

    const updatedTraitement = {
      ...existingTraitement,
      ...updates,
      id: traitementId,
      clientId: targetClientId,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    await kv.set(`traitement:${targetClientId}:${traitementId}`, updatedTraitement);
    await saveHistory('traitement', targetClientId!, traitementId, 'updated', existingTraitement, updatedTraitement, userId!, userName!);

    return c.json({ success: true, traitement: updatedTraitement });
  } catch (error) {
    console.error('Error updating traitement:', error);
    return c.json({ error: 'Failed to update traitement' }, 500);
  }
});

// Get traitement history
app.get("/make-server-abb8d15d/traitements/:id/history", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, clientId, isAdmin, error } = await verifyUserAccess(accessToken);
    
    if (!isValid) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const traitementId = c.req.param('id');
    const targetClientId = isAdmin ? c.req.query('clientId') : clientId;
    
    if (!targetClientId) {
      return c.json({ error: 'Client ID required' }, 400);
    }

    const history = await kv.getByPrefix(`traitement_history:${targetClientId}:${traitementId}:`);
    
    return c.json({ success: true, history: history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ) });
  } catch (error) {
    console.error('Error fetching traitement history:', error);
    return c.json({ error: 'Failed to fetch history' }, 500);
  }
});

// =============================================
// DEMANDES (Exercices de droits) ROUTES
// =============================================

// Get all demandes for a client
app.get("/make-server-abb8d15d/demandes", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, clientId, isAdmin, error } = await verifyUserAccess(accessToken);
    
    if (!isValid) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const targetClientId = isAdmin ? c.req.query('clientId') : clientId;
    
    if (!targetClientId) {
      return c.json({ error: 'Client ID required' }, 400);
    }

    const demandes = await kv.getByPrefix(`demande:${targetClientId}:`);
    
    return c.json({ success: true, demandes });
  } catch (error) {
    console.error('Error fetching demandes:', error);
    return c.json({ error: 'Failed to fetch demandes' }, 500);
  }
});

// Create demande
app.post("/make-server-abb8d15d/demandes", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, clientId, userId, userName, isAdmin, error } = await verifyUserAccess(accessToken);
    
    if (!isValid) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const targetClientId = isAdmin && body.clientId ? body.clientId : clientId;
    
    if (!targetClientId) {
      return c.json({ error: 'Client ID required' }, 400);
    }

    const year = new Date().getFullYear();
    const count = (await kv.getByPrefix(`demande:${targetClientId}:`)).length + 1;
    const demandeId = `ED-${year}-${String(count).padStart(3, '0')}`;
    
    const demande = {
      id: demandeId,
      clientId: targetClientId,
      ...body,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    await kv.set(`demande:${targetClientId}:${demandeId}`, demande);
    await saveHistory('demande', targetClientId, demandeId, 'created', {}, demande, userId!, userName!);

    return c.json({ success: true, demande });
  } catch (error) {
    console.error('Error creating demande:', error);
    return c.json({ error: 'Failed to create demande' }, 500);
  }
});

// Update demande
app.put("/make-server-abb8d15d/demandes/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, clientId, userId, userName, isAdmin, error } = await verifyUserAccess(accessToken);
    
    if (!isValid) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const demandeId = c.req.param('id');
    const updates = await c.req.json();
    
    const targetClientId = isAdmin && updates.clientId ? updates.clientId : clientId;
    
    const existingDemande = await kv.get(`demande:${targetClientId}:${demandeId}`);
    if (!existingDemande) {
      return c.json({ error: 'Demande not found' }, 404);
    }

    const updatedDemande = {
      ...existingDemande,
      ...updates,
      id: demandeId,
      clientId: targetClientId,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    await kv.set(`demande:${targetClientId}:${demandeId}`, updatedDemande);
    await saveHistory('demande', targetClientId!, demandeId, 'updated', existingDemande, updatedDemande, userId!, userName!);

    return c.json({ success: true, demande: updatedDemande });
  } catch (error) {
    console.error('Error updating demande:', error);
    return c.json({ error: 'Failed to update demande' }, 500);
  }
});

// Get demande history
app.get("/make-server-abb8d15d/demandes/:id/history", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, clientId, isAdmin, error } = await verifyUserAccess(accessToken);
    
    if (!isValid) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const demandeId = c.req.param('id');
    const targetClientId = isAdmin ? c.req.query('clientId') : clientId;
    
    if (!targetClientId) {
      return c.json({ error: 'Client ID required' }, 400);
    }

    const history = await kv.getByPrefix(`demande_history:${targetClientId}:${demandeId}:`);
    
    return c.json({ success: true, history: history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ) });
  } catch (error) {
    console.error('Error fetching demande history:', error);
    return c.json({ error: 'Failed to fetch history' }, 500);
  }
});

// =============================================
// VIOLATIONS ROUTES
// =============================================

// Get all violations for a client
app.get("/make-server-abb8d15d/violations", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, clientId, isAdmin, error } = await verifyUserAccess(accessToken);
    
    if (!isValid) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const targetClientId = isAdmin ? c.req.query('clientId') : clientId;
    
    if (!targetClientId) {
      return c.json({ error: 'Client ID required' }, 400);
    }

    const violations = await kv.getByPrefix(`violation:${targetClientId}:`);
    
    return c.json({ success: true, violations });
  } catch (error) {
    console.error('Error fetching violations:', error);
    return c.json({ error: 'Failed to fetch violations' }, 500);
  }
});

// Create violation
app.post("/make-server-abb8d15d/violations", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, clientId, userId, userName, isAdmin, error } = await verifyUserAccess(accessToken);
    
    if (!isValid) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const targetClientId = isAdmin && body.clientId ? body.clientId : clientId;
    
    if (!targetClientId) {
      return c.json({ error: 'Client ID required' }, 400);
    }

    const year = new Date().getFullYear();
    const count = (await kv.getByPrefix(`violation:${targetClientId}:`)).length + 1;
    const violationId = `VD-${year}-${String(count).padStart(3, '0')}`;
    
    const violation = {
      id: violationId,
      clientId: targetClientId,
      ...body,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    await kv.set(`violation:${targetClientId}:${violationId}`, violation);
    await saveHistory('violation', targetClientId, violationId, 'created', {}, violation, userId!, userName!);

    return c.json({ success: true, violation });
  } catch (error) {
    console.error('Error creating violation:', error);
    return c.json({ error: 'Failed to create violation' }, 500);
  }
});

// Update violation
app.put("/make-server-abb8d15d/violations/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, clientId, userId, userName, isAdmin, error } = await verifyUserAccess(accessToken);
    
    if (!isValid) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const violationId = c.req.param('id');
    const updates = await c.req.json();
    
    const targetClientId = isAdmin && updates.clientId ? updates.clientId : clientId;
    
    const existingViolation = await kv.get(`violation:${targetClientId}:${violationId}`);
    if (!existingViolation) {
      return c.json({ error: 'Violation not found' }, 404);
    }

    const updatedViolation = {
      ...existingViolation,
      ...updates,
      id: violationId,
      clientId: targetClientId,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    await kv.set(`violation:${targetClientId}:${violationId}`, updatedViolation);
    await saveHistory('violation', targetClientId!, violationId, 'updated', existingViolation, updatedViolation, userId!, userName!);

    return c.json({ success: true, violation: updatedViolation });
  } catch (error) {
    console.error('Error updating violation:', error);
    return c.json({ error: 'Failed to update violation' }, 500);
  }
});

// Get violation history
app.get("/make-server-abb8d15d/violations/:id/history", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isValid, clientId, isAdmin, error } = await verifyUserAccess(accessToken);
    
    if (!isValid) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const violationId = c.req.param('id');
    const targetClientId = isAdmin ? c.req.query('clientId') : clientId;
    
    if (!targetClientId) {
      return c.json({ error: 'Client ID required' }, 400);
    }

    const history = await kv.getByPrefix(`violation_history:${targetClientId}:${violationId}:`);
    
    return c.json({ success: true, history: history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ) });
  } catch (error) {
    console.error('Error fetching violation history:', error);
    return c.json({ error: 'Failed to fetch history' }, 500);
  }
});

// =============================================
// ADMIN ROUTES - Cache & Performance
// =============================================

// Get cache statistics
app.get("/make-server-abb8d15d/admin/cache/stats", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const stats = cache.getStats();
    return c.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return c.json({ error: 'Failed to fetch cache stats' }, 500);
  }
});

// Clear cache
app.post("/make-server-abb8d15d/admin/cache/clear", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    cache.clear();
    return c.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return c.json({ error: 'Failed to clear cache' }, 500);
  }
});

// =============================================
// ADMIN ROUTES - Archiving
// =============================================

// Archive old history for a specific client
app.post("/make-server-abb8d15d/admin/archive/:clientId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const clientId = c.req.param('clientId');
    
    const results = {
      traitement: await archiveOldHistory('traitement', clientId),
      demande: await archiveOldHistory('demande', clientId),
      violation: await archiveOldHistory('violation', clientId),
    };

    const totalArchived = results.traitement.archived + results.demande.archived + results.violation.archived;
    const totalErrors = results.traitement.errors + results.demande.errors + results.violation.errors;

    return c.json({ 
      success: true, 
      message: `Archived ${totalArchived} entries with ${totalErrors} errors`,
      results 
    });
  } catch (error) {
    console.error('Error archiving client history:', error);
    return c.json({ error: 'Failed to archive history' }, 500);
  }
});

// Archive all old history
app.post("/make-server-abb8d15d/admin/archive/all", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const results = await archiveAllHistory();
    return c.json({ success: true, results });
  } catch (error) {
    console.error('Error archiving all history:', error);
    return c.json({ error: 'Failed to archive history' }, 500);
  }
});

// Get archived history for an item
app.get("/make-server-abb8d15d/admin/archive/:module/:clientId/:year", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const module = c.req.param('module') as 'traitement' | 'demande' | 'violation';
    const clientId = c.req.param('clientId');
    const year = parseInt(c.req.param('year'));

    const history = await getArchivedHistory(module, clientId, year);
    return c.json({ success: true, history });
  } catch (error) {
    console.error('Error getting archived history:', error);
    return c.json({ error: 'Failed to get archived history' }, 500);
  }
});

// List available archived years
app.get("/make-server-abb8d15d/admin/archive/:module/:clientId/years", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const module = c.req.param('module') as 'traitement' | 'demande' | 'violation';
    const clientId = c.req.param('clientId');

    const years = await listArchivedYears(module, clientId);
    return c.json({ success: true, years });
  } catch (error) {
    console.error('Error listing archived years:', error);
    return c.json({ error: 'Failed to list archived years' }, 500);
  }
});

// Get archive statistics
app.get("/make-server-abb8d15d/admin/archive/stats", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await verifyAdmin(accessToken);
    
    if (!isAdmin) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const stats = await getArchiveStats();
    return c.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting archive stats:', error);
    return c.json({ error: 'Failed to get archive stats' }, 500);
  }
});

Deno.serve(app.fetch);