/*
  # Perfis Católicos - Schema Completo

  1. Nova Tabela: `profiles`
    - `id` (uuid, chave primária)
    - `user_id` (uuid, referência para auth.users)
    - `full_name` (text, nome completo)
    - `parish` (text, paróquia que serve)
    - `pastoral` (text, pastoral)
    - `baptism_date` (date, data de batismo)
    - `priest_name` (text, nome do pároco)
    - `patron_saint` (text, santo de devoção)
    - `saint_image_url` (text, URL da imagem do santo)
    - `inspiration_quote` (text, frase de inspiração)
    - `bible_passage` (text, passagem bíblica de inspiração)
    - `profile_image_url` (text, URL da foto de perfil)
    - `cover_image_url` (text, URL da capa do perfil)
    - `primary_color` (text, cor primária do perfil)
    - `secondary_color` (text, cor secundária do perfil)
    - `background_type` (text, tipo de fundo: 'gradient', 'image', 'solid')
    - `background_value` (text, valor do fundo)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela `profiles`
    - Política para usuários autenticados verem qualquer perfil
    - Política para usuários atualizarem apenas seu próprio perfil
    - Política para usuários criarem seu próprio perfil
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text DEFAULT '',
  parish text DEFAULT '',
  pastoral text DEFAULT '',
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
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

-- Criar índice para melhorar performance de queries
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);