import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

/**
 * initializes supabase client, connects app to database
 */

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


if (!supabaseUrl || !supabaseKey) {
  throw new Error(' Supabase environment variables are missing! Check your .env file.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, 
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabase;
