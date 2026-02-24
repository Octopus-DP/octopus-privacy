import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://api.octopus-dp.fr';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function migrateUsers() {
  console.log('🚀 Migration des utilisateurs vers Supabase Auth...\n');

  // Récupérer tous les users de PostgreSQL
  const { data: users, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`📊 ${users.length} utilisateur(s) trouvé(s)\n`);

  for (const user of users) {
    console.log(`👤 Migration de ${user.email}...`);

    // Créer l'utilisateur dans Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'ChangeMe123!', // Mot de passe temporaire
      email_confirm: true,
      user_metadata: {
        name: user.name,
        user_id: user.id,
        client_id: user.client_id,
        client_code: user.client_code,
        role: user.role
      }
    });

    if (authError) {
      console.error(`  ❌ Erreur:`, authError.message);
    } else {
      console.log(`  ✅ Migré avec succès`);
      console.log(`  🔑 Mot de passe temporaire: ChangeMe123!\n`);
    }
  }

  console.log('✅ Migration terminée !');
}

migrateUsers();