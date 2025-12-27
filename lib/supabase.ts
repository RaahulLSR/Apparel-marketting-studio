
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase configuration using environment variables or hardcoded fallbacks.
 * The Anon Key is required to initialize the client.
 */
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wibenyzdzvpvwjpecmne.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpYmVueXpkenZwdndqcGVjbW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MjM0MDcsImV4cCI6MjA4MjM5OTQwN30.Kem9JvCTt9gV2sv5L0GzccCkd5UlDpMmxONbFC26ljk';

// Export a flag to check if Supabase is properly configured.
export const isSupabaseConfigured = !!supabaseAnonKey && supabaseAnonKey !== 'MISSING_VITE_SUPABASE_ANON_KEY';

if (!isSupabaseConfigured) {
  console.error('CRITICAL: Supabase Anon Key is missing. The application will not be able to interact with the database.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * DATABASE SCHEMA REFERENCE (Run this in your Supabase SQL Editor):
 * 
 * -- 1. Create the Users table
 * CREATE TABLE public.users (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   email text UNIQUE NOT NULL,
 *   password text NOT NULL,
 *   role text NOT NULL CHECK (role IN ('ADMIN', 'CUSTOMER')),
 *   name text NOT NULL,
 *   created_at timestamptz DEFAULT now()
 * );
 * 
 * -- 2. Create the Brands table
 * CREATE TABLE public.brands (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   customer_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
 *   name text NOT NULL,
 *   logo_url text,
 *   tagline text,
 *   description text,
 *   color_palette text[],
 *   is_primary boolean DEFAULT false,
 *   reference_assets text[],
 *   created_at timestamptz DEFAULT now()
 * );
 * 
 * -- 3. Create the Orders table
 * CREATE TABLE public.orders (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   customer_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
 *   brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
 *   title text NOT NULL,
 *   description text,
 *   creative_expectations text,
 *   status text DEFAULT 'Pending',
 *   created_at timestamptz DEFAULT now(),
 *   updated_at timestamptz DEFAULT now(),
 *   colors text,
 *   sizes text,
 *   features text,
 *   target_audience text,
 *   usage text,
 *   notes text,
 *   admin_notes text
 * );
 * 
 * -- 4. Create the Attachments table
 * CREATE TABLE public.attachments (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
 *   name text,
 *   url text,
 *   type text, -- 'image', 'document', 'result'
 *   created_at timestamptz DEFAULT now()
 * );
 * 
 * -- Enable Realtime
 * alter publication supabase_realtime add table orders;
 */
