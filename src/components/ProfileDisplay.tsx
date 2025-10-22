import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Cross, Church, Calendar, Sparkles, BookOpen, LogOut, Edit, Music } from 'lucide-react';
import { Profile } from '../types/profile';
import { MusicEmbed } from './MusicEmbed';

interface ProfileDisplayProps {
  onEdit: () => void;
}

export function ProfileDisplay({ onEdit }: ProfileDisplayProps) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
        <div className="text-center max-w-md">
          <Cross className="w-20 h-20 text-amber-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Crie seu Perfil Católico</h2>
          <p className="text-gray-600 mb-8">
            Preencha suas informações para criar sua carteirinha católica digital
          </p>
          <button
            onClick={onEdit}
            className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition shadow-lg"
          >
            Criar Perfil
          </button>
        </div>
      </div>
    );
  }

  const backgroundStyle =
    profile.background_type === 'gradient' || profile.background_type === 'custom-gradient'
      ? { background: profile.background_value }
      : profile.background_type === 'image'
      ? {
          backgroundImage: `url(${profile.background_value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }
      : { backgroundColor: profile.background_value };

  const overlayOpacity = profile.background_type === 'image'
    ? profile.background_overlay_opacity || 0.3
    : 0.2;

  return (
    <div className="min-h-screen" style={backgroundStyle}>
      <div
        className="min-h-screen backdrop-blur-sm"
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
      >
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={onEdit}
              className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold hover:bg-white transition shadow-lg flex items-center gap-2 text-gray-800"
            >
              <Edit className="w-5 h-5" />
              Editar
            </button>
            <button
              onClick={signOut}
              className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold hover:bg-white transition shadow-lg flex items-center gap-2 text-gray-800"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
            {profile.cover_image_url && (
              <div className="h-48 md:h-64 overflow-hidden relative">
                <img
                  src={profile.cover_image_url}
                  alt="Capa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            )}

            <div className="relative px-6 pb-8">
              {profile.profile_image_url ? (
                <div className={`${profile.cover_image_url ? '-mt-20' : 'mt-8'} mb-6 flex justify-center`}>
                  <div
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 shadow-xl"
                    style={{ borderColor: profile.primary_color }}
                  >
                    <img
                      src={profile.profile_image_url}
                      alt="Perfil"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-8"></div>
              )}

              <div className="text-center mb-8">
                <h1
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ color: profile.primary_color }}
                >
                  {profile.full_name || 'Seu Nome'}
                </h1>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Cross className="w-4 h-4" />
                  <span className="font-medium">Católico</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {profile.parish && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Church
                      className="w-6 h-6 mt-0.5 flex-shrink-0"
                      style={{ color: profile.primary_color }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Paróquia</p>
                      <p className="text-gray-800 font-medium">{profile.parish}</p>
                    </div>
                  </div>
                )}

                {profile.pastorals && profile.pastorals.length > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Sparkles
                      className="w-6 h-6 mt-0.5 flex-shrink-0"
                      style={{ color: profile.secondary_color }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 mb-2">
                        {profile.pastorals.length === 1 ? 'Pastoral' : 'Pastorais'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.pastorals.map((pastoral, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1 rounded-lg text-sm font-medium text-gray-800"
                            style={{
                              backgroundColor: `${profile.secondary_color}20`,
                              borderLeft: `3px solid ${profile.secondary_color}`
                            }}
                          >
                            {pastoral}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {profile.baptism_date && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Calendar
                      className="w-6 h-6 mt-0.5 flex-shrink-0"
                      style={{ color: profile.primary_color }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Data de Batismo</p>
                      <p className="text-gray-800 font-medium">
                        {new Date(profile.baptism_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}

                {profile.priest_name && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Cross
                      className="w-6 h-6 mt-0.5 flex-shrink-0"
                      style={{ color: profile.secondary_color }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Pároco</p>
                      <p className="text-gray-800 font-medium">{profile.priest_name}</p>
                    </div>
                  </div>
                )}
              </div>

              {(profile.patron_saint || profile.saint_image_url) && (
                <div
                  className="rounded-2xl p-6 mb-8"
                  style={{
                    background: `linear-gradient(135deg, ${profile.primary_color}15, ${profile.secondary_color}15)`,
                    borderLeft: `4px solid ${profile.primary_color}`
                  }}
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" style={{ color: profile.primary_color }} />
                    Santo de Devoção
                  </h3>
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    {profile.saint_image_url && (
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 border-2" style={{ borderColor: profile.secondary_color }}>
                        <img
                          src={profile.saint_image_url}
                          alt={profile.patron_saint}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {profile.patron_saint && (
                      <p className="text-xl font-bold text-center md:text-left" style={{ color: profile.primary_color }}>
                        {profile.patron_saint}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {profile.inspiration_quote && (
                <div
                  className="rounded-2xl p-6 mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${profile.secondary_color}15, ${profile.primary_color}15)`,
                    borderLeft: `4px solid ${profile.secondary_color}`
                  }}
                >
                  <p className="text-lg italic text-gray-700 leading-relaxed">
                    "{profile.inspiration_quote}"
                  </p>
                </div>
              )}

              {profile.bible_passage && (
                <div
                  className="rounded-2xl p-6 mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${profile.primary_color}15, ${profile.secondary_color}15)`,
                    borderLeft: `4px solid ${profile.primary_color}`
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5" style={{ color: profile.primary_color }} />
                    <h3 className="font-bold text-gray-800">Passagem Bíblica</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {profile.bible_passage}
                  </p>
                </div>
              )}

              {profile.music_embeds && profile.music_embeds.length > 0 && (
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: `linear-gradient(135deg, ${profile.secondary_color}15, ${profile.primary_color}15)`,
                    borderLeft: `4px solid ${profile.secondary_color}`
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Music className="w-5 h-5" style={{ color: profile.secondary_color }} />
                    <h3 className="font-bold text-gray-800">Músicas</h3>
                  </div>
                  <div className="space-y-4">
                    {profile.music_embeds.map((embed, index) => (
                      <MusicEmbed key={index} embed={embed} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-white text-sm font-medium drop-shadow-lg">
              Carteirinha Católica Digital
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
