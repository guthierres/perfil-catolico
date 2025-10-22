import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Save, Palette, Link as LinkIcon, Image as ImageIcon, Plus, X, Music } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { GradientCustomizer } from './GradientCustomizer';
import { Profile, MusicEmbed } from '../types/profile';
import { MusicEmbed as MusicEmbedComponent } from './MusicEmbed';

interface ProfileEditorProps {
  onSave: () => void;
}

export function ProfileEditor({ onSave }: ProfileEditorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [profile, setProfile] = useState<Partial<Profile>>({
    slug: '',
    full_name: '',
    parish: '',
    pastorals: [],
    baptism_date: null,
    priest_name: '',
    patron_saint: '',
    saint_image_url: '',
    inspiration_quote: '',
    bible_passage: '',
    profile_image_url: '',
    cover_image_url: '',
    primary_color: '#8B4513',
    secondary_color: '#D4AF37',
    background_type: 'gradient',
    background_value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background_overlay_opacity: 0.3,
    music_embeds: [],
  });

  const [newPastoral, setNewPastoral] = useState('');
  const [newMusicUrl, setNewMusicUrl] = useState('');
  const [newMusicTitle, setNewMusicTitle] = useState('');
  const [musicType, setMusicType] = useState<'spotify' | 'youtube'>('spotify');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setSlugAvailable(true);
    }
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    setCheckingSlug(true);
    const { data } = await supabase
      .from('profiles')
      .select('slug')
      .eq('slug', slug)
      .neq('user_id', user?.id || '')
      .maybeSingle();

    setSlugAvailable(!data);
    setCheckingSlug(false);
  };

  const handleSlugChange = (value: string) => {
    const newSlug = generateSlug(value);
    setProfile({ ...profile, slug: newSlug });

    const timeoutId = setTimeout(() => {
      checkSlugAvailability(newSlug);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!profile.slug || profile.slug.length < 3) {
      setMessage('O link personalizado deve ter pelo menos 3 caracteres');
      return;
    }

    if (slugAvailable === false) {
      setMessage('Este link já está em uso. Escolha outro.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .update({ ...profile, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert([{ ...profile, user_id: user.id }]);

        if (error) throw error;
      }

      setMessage('Perfil salvo com sucesso!');
      setTimeout(() => onSave(), 1500);
    } catch (error: any) {
      setMessage('Erro ao salvar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const profileUrl = profile.slug ? `${window.location.origin}/p/${profile.slug}` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
            Editar Perfil Católico
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <LinkIcon className="w-5 h-5 text-blue-700" />
                <h3 className="text-lg font-semibold text-blue-900">Link Personalizado</h3>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={profile.slug || ''}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="seu-nome-unico"
                  required
                />

                {profile.slug && profile.slug.length >= 3 && (
                  <div className="flex items-center gap-2">
                    {checkingSlug ? (
                      <span className="text-sm text-gray-600">Verificando...</span>
                    ) : slugAvailable === true ? (
                      <span className="text-sm text-green-600 font-medium">✓ Link disponível!</span>
                    ) : slugAvailable === false ? (
                      <span className="text-sm text-red-600 font-medium">✗ Link já está em uso</span>
                    ) : null}
                  </div>
                )}

                {profileUrl && slugAvailable && (
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Seu link público:</p>
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium break-all"
                    >
                      {profileUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Paróquia
                </label>
                <input
                  type="text"
                  value={profile.parish}
                  onChange={(e) => setProfile({ ...profile, parish: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  placeholder="Nome da sua paróquia"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pastorais
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPastoral}
                      onChange={(e) => setNewPastoral(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newPastoral.trim()) {
                            setProfile({ ...profile, pastorals: [...(profile.pastorals || []), newPastoral.trim()] });
                            setNewPastoral('');
                          }
                        }
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      placeholder="Nome da pastoral"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPastoral.trim()) {
                          setProfile({ ...profile, pastorals: [...(profile.pastorals || []), newPastoral.trim()] });
                          setNewPastoral('');
                        }
                      }}
                      className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Adicionar
                    </button>
                  </div>
                  {profile.pastorals && profile.pastorals.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.pastorals.map((pastoral, index) => (
                        <div
                          key={index}
                          className="bg-amber-100 border border-amber-300 px-3 py-2 rounded-lg flex items-center gap-2"
                        >
                          <span className="text-sm text-amber-900 font-medium">{pastoral}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newPastorals = profile.pastorals?.filter((_, i) => i !== index);
                              setProfile({ ...profile, pastorals: newPastorals });
                            }}
                            className="text-amber-700 hover:text-amber-900 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data de Batismo
                </label>
                <input
                  type="date"
                  value={profile.baptism_date || ''}
                  onChange={(e) => setProfile({ ...profile, baptism_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome do Pároco
                </label>
                <input
                  type="text"
                  value={profile.priest_name}
                  onChange={(e) => setProfile({ ...profile, priest_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  placeholder="Padre..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Santo de Devoção
                </label>
                <input
                  type="text"
                  value={profile.patron_saint}
                  onChange={(e) => setProfile({ ...profile, patron_saint: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  placeholder="Nome do santo"
                />
              </div>
            </div>

            <div className="space-y-6 border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-amber-700" />
                <h3 className="text-lg font-semibold text-gray-800">Imagens</h3>
              </div>

              <ImageUpload
                label="Foto de Perfil"
                currentImage={profile.profile_image_url}
                onImageChange={(url) => setProfile({ ...profile, profile_image_url: url })}
                folder="profiles/avatars"
              />

              <ImageUpload
                label="Imagem de Capa"
                currentImage={profile.cover_image_url}
                onImageChange={(url) => setProfile({ ...profile, cover_image_url: url })}
                folder="profiles/covers"
              />

              <ImageUpload
                label="Imagem do Santo"
                currentImage={profile.saint_image_url}
                onImageChange={(url) => setProfile({ ...profile, saint_image_url: url })}
                folder="profiles/saints"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Frase de Inspiração
              </label>
              <input
                type="text"
                value={profile.inspiration_quote}
                onChange={(e) => setProfile({ ...profile, inspiration_quote: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                placeholder="Sua frase inspiradora"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Passagem Bíblica de Inspiração
              </label>
              <textarea
                value={profile.bible_passage}
                onChange={(e) => setProfile({ ...profile, bible_passage: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                placeholder="Sua passagem bíblica favorita"
              />
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-5 h-5 text-amber-700" />
                <h3 className="text-lg font-semibold text-gray-800">Músicas</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMusicType('spotify')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          musicType === 'spotify'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Spotify
                      </button>
                      <button
                        type="button"
                        onClick={() => setMusicType('youtube')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          musicType === 'youtube'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        YouTube
                      </button>
                    </div>

                    <input
                      type="text"
                      value={newMusicTitle}
                      onChange={(e) => setNewMusicTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Título da música (opcional)"
                    />

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newMusicUrl}
                        onChange={(e) => setNewMusicUrl(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder={musicType === 'spotify' ? 'URL do Spotify' : 'URL do YouTube'}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newMusicUrl.trim()) {
                            const newEmbed: MusicEmbed = {
                              type: musicType,
                              url: newMusicUrl.trim(),
                              title: newMusicTitle.trim(),
                            };
                            setProfile({ ...profile, music_embeds: [...(profile.music_embeds || []), newEmbed] });
                            setNewMusicUrl('');
                            setNewMusicTitle('');
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>

                {profile.music_embeds && profile.music_embeds.length > 0 && (
                  <div className="space-y-4">
                    {profile.music_embeds.map((embed, index) => (
                      <MusicEmbedComponent
                        key={index}
                        embed={embed}
                        editable
                        onRemove={() => {
                          const newEmbeds = profile.music_embeds?.filter((_, i) => i !== index);
                          setProfile({ ...profile, music_embeds: newEmbeds });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-amber-700" />
                <h3 className="text-lg font-semibold text-gray-800">Personalização Visual</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cor Primária
                  </label>
                  <input
                    type="color"
                    value={profile.primary_color}
                    onChange={(e) => setProfile({ ...profile, primary_color: e.target.value })}
                    className="w-full h-12 rounded-xl cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cor Secundária
                  </label>
                  <input
                    type="color"
                    value={profile.secondary_color}
                    onChange={(e) => setProfile({ ...profile, secondary_color: e.target.value })}
                    className="w-full h-12 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, background_type: 'gradient' })}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      profile.background_type === 'gradient' || profile.background_type === 'custom-gradient'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Gradiente
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, background_type: 'image' })}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      profile.background_type === 'image'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Imagem
                  </button>
                </div>

                {(profile.background_type === 'gradient' || profile.background_type === 'custom-gradient') && (
                  <GradientCustomizer
                    value={profile.background_value || ''}
                    onChange={(value) => setProfile({ ...profile, background_value: value })}
                  />
                )}

                {profile.background_type === 'image' && (
                  <div className="space-y-4">
                    <ImageUpload
                      label="Imagem de Fundo"
                      currentImage={profile.background_value}
                      onImageChange={(url) => setProfile({ ...profile, background_value: url })}
                      folder="profiles/backgrounds"
                    />

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Opacidade da Sombra: {Math.round((profile.background_overlay_opacity || 0.3) * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={profile.background_overlay_opacity || 0.3}
                        onChange={(e) => setProfile({ ...profile, background_overlay_opacity: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {message && (
              <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
                message.includes('sucesso')
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || slugAvailable === false}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
