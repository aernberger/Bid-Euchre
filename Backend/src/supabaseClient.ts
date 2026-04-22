import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load env vars here to ensure they exist before createClient is called
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Safety check to help you debug
if (!supabaseUrl || !supabaseKey) {
  throw new Error(" Supabase environment variables are missing! Check your .env file.");
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabase;