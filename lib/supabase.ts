
import { createClient } from '@supabase/supabase-js';

// Derived from the provided connection string host: wibenyzdzvpvwjpecmne.supabase.co
const supabaseUrl = 'https://wibenyzdzvpvwjpecmne.supabase.co';
// Using placeholder for anon key as it wasn't provided, 
// but in this environment we expect it via process.env if available
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || 'your-anon-key');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * DATABASE SCHEMA REFERENCE (Expected Tables):
 * 
 * brands (
 *   id uuid primary key default uuid_generate_v4(),
 *   customer_id text not null,
 *   name text not null,
 *   logo_url text,
 *   tagline text,
 *   description text,
 *   color_palette text[],
 *   is_primary boolean default false,
 *   reference_assets text[]
 * )
 * 
 * orders (
 *   id uuid primary key default uuid_generate_v4(),
 *   customer_id text not null,
 *   brand_id uuid references brands(id),
 *   title text not null,
 *   description text,
 *   creative_expectations text,
 *   status text default 'Pending',
 *   created_at timestamptz default now(),
 *   updated_at timestamptz default now(),
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
 *   id uuid primary key default uuid_generate_v4(),
 *   order_id uuid references orders(id),
 *   name text,
 *   url text,
 *   type text,
 *   created_at timestamptz default now()
 * )
 */
