const { createClient } = require('@supabase/supabase-js');

// Pega as variáveis do .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("ERRO CRÍTICO: SUPABASE_URL e SUPABASE_KEY são obrigatórios no arquivo .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;