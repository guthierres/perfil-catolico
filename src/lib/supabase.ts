import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  parish: string;
  pastoral: string;
  baptism_date: string | null;
  priest_name: string;
  patron_saint: string;
  saint_image_url: string;
  inspiration_quote: string;
  bible_passage: string;
  profile_image_url: string;
  cover_image_url: string;
  primary_color: string;
  secondary_color: string;
  background_type: 'gradient' | 'image' | 'solid';
  background_value: string;
  created_at: string;
  updated_at: string;
}
