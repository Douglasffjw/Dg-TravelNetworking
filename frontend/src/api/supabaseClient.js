import { createClient } from '@supabase/supabase-js';

// No frontend (Vite), usamos import.meta.env e a chave ANON (pública)
// Jamais use process.env ou a chave de serviço (service_role) aqui, pois vazaria para o navegador.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("ERRO CRÍTICO: Variáveis de ambiente do Supabase não encontradas. Verifique se 'VITE_SUPABASE_URL' e 'VITE_SUPABASE_ANON_KEY' estão no seu arquivo .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);