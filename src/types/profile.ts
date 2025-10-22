export interface MusicEmbed {
  type: 'spotify' | 'youtube';
  url: string;
  title: string;
}

export type CivilStatus = 'solteiro' | 'casado' | 'namorando' | 'religioso' | 'seminarista' | 'diacono' | 'padre';

export type Sacrament = 'batismo' | 'confissao' | 'eucaristia' | 'crisma' | 'matrimonio' | 'ordem' | 'uncao';

export interface Profile {
  id: string;
  user_id: string;
  slug: string | null;
  full_name: string;
  civil_status: CivilStatus | null;
  parish: string;
  pastorals: string[];
  baptism_date: string | null;
  priest_name: string;
  patron_saint: string;
  saint_image_url: string;
  inspiration_quote: string;
  quote_author: string;
  bible_passage: string;
  sacraments: Sacrament[];
  profile_image_url: string;
  cover_image_url: string;
  primary_color: string;
  secondary_color: string;
  background_type: 'gradient' | 'custom-gradient' | 'image' | 'solid';
  background_value: string;
  background_overlay_opacity: number;
  music_embeds: MusicEmbed[];
  created_at: string;
  updated_at: string;
}

export interface GradientPreset {
  name: string;
  value: string;
  colors: string[];
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    name: 'Roxo Celestial',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    colors: ['#667eea', '#764ba2'],
  },
  {
    name: 'Pôr do Sol',
    value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    colors: ['#f093fb', '#f5576c'],
  },
  {
    name: 'Oceano',
    value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    colors: ['#4facfe', '#00f2fe'],
  },
  {
    name: 'Floresta',
    value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    colors: ['#43e97b', '#38f9d7'],
  },
  {
    name: 'Dourado Real',
    value: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
    colors: ['#ffd89b', '#19547b'],
  },
  {
    name: 'Aurora',
    value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    colors: ['#a8edea', '#fed6e3'],
  },
  {
    name: 'Fogo Divino',
    value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    colors: ['#fa709a', '#fee140'],
  },
  {
    name: 'Céu Noturno',
    value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    colors: ['#30cfd0', '#330867'],
  },
  {
    name: 'Rosa Místico',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    colors: ['#ff9a9e', '#fecfef'],
  },
  {
    name: 'Terra Santa',
    value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    colors: ['#ffecd2', '#fcb69f'],
  },
];
