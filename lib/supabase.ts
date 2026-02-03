import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Sécurité supplémentaire pour debugger
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Erreur : Les variables d'environnement Supabase sont manquantes !");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');