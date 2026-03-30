import { createClient } from '@supabase/supabase-js';

// ⚠️  INSIRA SEUS DADOS DO SUPABASE ABAIXO:
// Obtenha em https://supabase.com/dashboard/project/_/settings/api
const SUPABASE_URL = 'SUA_SUPABASE_URL_AQUI';
const SUPABASE_SERVICE_ROLE_KEY = 'SUA_SERVICE_ROLE_KEY_AQUI';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || SUPABASE_URL === 'SUA_SUPABASE_URL_AQUI') {
  console.error('❌ Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no topo do arquivo!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Dados do usuário admin
const ADMIN_DATA = {
  email: 'guicfswork@gmail.com',
  password: 'sesau2026G2203',
  name: 'Guilherme Artur'
};

async function createAdmin() {
  try {
    console.log('🔄 Criando usuário admin...');

    // 1. Criar usuário com email confirmado
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: ADMIN_DATA.email,
      password: ADMIN_DATA.password,
      email_confirm: true,
      user_metadata: { name: ADMIN_DATA.name }
    });

    if (userError) throw userError;

    console.log('✅ Usuário criado:', userData.user?.id, ADMIN_DATA.email);

    // 2. Atualizar profile para admin
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        name: ADMIN_DATA.name, 
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.user!.id);

    if (profileError) throw profileError;

    console.log('✅ Profile atualizado para ADMIN!');
    console.log('🎉 Admin criado com sucesso!');
    console.log('\\n📱 Login: /auth');
    console.log(`Email: ${ADMIN_DATA.email}`);
    console.log(`Senha: ${ADMIN_DATA.password}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

createAdmin();

