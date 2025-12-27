
import { createClient } from '@supabase/supabase-js';

/**
 * Safely get environment variables across different build tools (Vite, Webpack, etc.)
 */
const getEnvVar = (key: string): string | undefined => {
  try {
    // Vite / Modern ESM
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
    // Node / Webpack / Older build tools
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Fallback if access is blocked or throws
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://wibenyzdzvpvwjpecmne.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpYmVueXpkenZwdndqcGVjbW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MjM0MDcsImV4cCI6MjA4MjM5OTQwN30.Kem9JvCTt9gV2sv5L0GzccCkd5UlDpMmxONbFC26ljk';

// Export a flag to check if Supabase is properly configured.
export const isSupabaseConfigured = !!supabaseAnonKey && supabaseAnonKey !== 'MISSING_VITE_SUPABASE_ANON_KEY';

if (!isSupabaseConfigured) {
  console.error('CRITICAL: Supabase Anon Key is missing. The application will not be able to interact with the database.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
