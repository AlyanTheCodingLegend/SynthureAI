import { createClient } from '@supabase/supabase-js';
import { Database } from '../_types/supabase';

const supabaseURL= process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';


const supabase = createClient<Database>(supabaseURL, supabaseAnonKey)

export default supabase

