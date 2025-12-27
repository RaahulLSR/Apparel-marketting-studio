
import { createClient } from '@supabase/supabase-js';

// Hardcoding credentials for direct portability and simplified deployment.
// These are maintained within the app itself to ensure immediate functionality on Vercel.
const supabaseUrl = 'https://wibenyzdzvpvwjpecmne.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpYmVueXpkenZwdndqcGVjbW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MjM0MDcsImV4cCI6MjA4MjM5OTQwN30.Kem9JvCTt9gV2sv5L0GzccCkd5UlDpMmxONbFC26ljk';

// Configuration flag for internal app checks
export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
