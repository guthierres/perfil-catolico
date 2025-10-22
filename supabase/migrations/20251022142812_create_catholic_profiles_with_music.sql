/*
  # Perfis Católicos - Sistema Completo com Múltiplas Pastorais e Músicas

  1. Nova Tabela: `profiles`
    - `id` (uuid, chave primária)
    - `user_id` (uuid, referência para auth.users)
    - `slug` (text, URL personalizada única)
    - `full_name` (text, nome completo)
    - `parish` (text, paróquia)
    - `pastorals` (text[], múltiplas pastorals)
    - `baptism_date` (date, data de batismo)
    - `priest_name` (text, nome do pároco)
    - `patron_saint` (text, santo de devoção)
    - `saint_image_url` (text, URL da imagem do santo)
    - `inspiration_quote` (text, frase de inspiração)
    - `bible_passage` (text, passagem bíblica)
    - `profile_image_url` (text, URL da foto de perfil)
    - `cover_image_url` (text, URL da capa)
    - `primary_color` (text, cor primária)
    - `secondary_color` (text, cor secundária)
    - `background_type` (text, 'gradient', 'custom-gradient', 'image', 'solid')
    - `background_value` (text, valor do fundo)
    - `background_overlay_opacity` (numeric, opacidade da sombra sobre imagem)
    - `music_embeds` (jsonb, array de embeds do Spotify/YouTube)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela `profiles`
    - Política para qualquer um ver perfis (públicos)
    - Política para usuários criarem seu próprio perfil
    - Política para usuários atualizarem apenas seu próprio perfil
    - Política para usuários deletarem seu próprio perfil

  3. Funcionalidades
    - Função para gerar slug único
    - Trigger para atualizar updated_at automaticamente
    - Suporte a múltiplas pastorais
    - Suporte a múltiplos embeds de música (Spotify/YouTube)
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  slug text UNIQUE,
  full_name text DEFAULT '',
  parish text DEFAULT '',
  pastorals text[] DEFAULT ARRAY[]::text[],
  baptism_date date,
  priest_name text DEFAULT '',
  patron_saint text DEFAULT '',
  saint_image_url text DEFAULT '',
  inspiration_quote text DEFAULT '',
  bible_passage text DEFAULT '',
  profile_image_url text DEFAULT '',
  cover_image_url text DEFAULT '',
  primary_color text DEFAULT '#8B4513',
  secondary_color text DEFAULT '#D4AF37',
  background_type text DEFAULT 'gradient',
  background_value text DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  background_overlay_opacity numeric DEFAULT 0.3,
  music_embeds jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_slug_idx ON profiles(slug);
CREATE INDEX IF NOT EXISTS profiles_pastorals_idx ON profiles USING GIN(pastorals);
CREATE INDEX IF NOT EXISTS profiles_music_embeds_idx ON profiles USING GIN(music_embeds);

-- Função para gerar slug único
CREATE OR REPLACE FUNCTION generate_unique_slug(base_slug text, user_id_param uuid)
RETURNS text AS $$
DECLARE
  final_slug text;
  counter integer := 0;
BEGIN
  final_slug := base_slug;
  
  WHILE EXISTS (
    SELECT 1 FROM profiles 
    WHERE slug = final_slug 
    AND user_id != user_id_param
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();