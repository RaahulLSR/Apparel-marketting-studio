
import { createClient } from '@supabase/supabase-js';

// Environment variables provided by the user/system
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wibenyzdzvpvwjpecmne.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('Supabase Anon Key is missing. Please ensure VITE_SUPABASE_ANON_KEY is set in your environment.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * DATABASE SCHEMA REFERENCE (Expected Tables):
 * 
 * users (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   email text UNIQUE NOT NULL,
 *   password text NOT NULL,
 *   role text NOT NULL CHECK (role IN ('ADMIN', 'CUSTOMER')),
 *   name text NOT NULL,
 *   created_at timestamptz DEFAULT now()
 * )
 * 
 * brands (
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
 * )
 * 
 * orders (
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
 * )
 * 
 * attachments (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
 *   name text,
 *   url text,
 *   type text, -- 'image', 'document', 'result'
 *   created_at timestamptz DEFAULT now()
 * )
 */
