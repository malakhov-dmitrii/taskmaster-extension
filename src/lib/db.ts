import { createClient } from '@supabase/supabase-js';
import { anonKey, supabaseUrl } from 'src/lib/config';
import type { Database } from 'src/lib/database.types';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, anonKey);
