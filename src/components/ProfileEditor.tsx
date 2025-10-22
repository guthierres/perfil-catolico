import React, { useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Save, Palette } from 'lucide-react';

const gradientPresets = [
  { name: 'Céu Divino', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Pôr do Sol', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Mar Celestial', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Aurora', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Primavera', value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
  { name: 'Dourado', value: 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)' },
];

interface ProfileEditorProps {
  onSave: () => void;
}

export function ProfileEditor({ onSave }: ProfileEditorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: '',
    parish: '',
    pastoral: '',
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
    background_value: gradientPresets[0].value,
  });

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
            Editar Perfil Católico
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pastoral
                </label>
                <input
                  type="text"
                  value={profile.pastoral}
                  onChange={(e) => setProfile({ ...profile, pastoral: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  placeholder="Pastoral que serve"
                />
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL da Imagem do Santo
              </label>
              <input
                type="url"
                value={profile.saint_image_url}
                onChange={(e) => setProfile({ ...profile, saint_image_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                placeholder="https://exemplo.com/imagem-santo.jpg"
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL da Foto de Perfil
              </label>
              <input
                type="url"
                value={profile.profile_image_url}
                onChange={(e) => setProfile({ ...profile, profile_image_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                placeholder="https://exemplo.com/foto-perfil.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL da Imagem de Capa
              </label>
              <input
                type="url"
                value={profile.cover_image_url}
                onChange={(e) => setProfile({ ...profile, cover_image_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                placeholder="https://exemplo.com/capa.jpg"
              />
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-amber-700" />
                <h3 className="text-lg font-semibold text-gray-800">Personalização Visual</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
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

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tema de Fundo (Gradiente)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {gradientPresets.map((gradient) => (
                    <button
                      key={gradient.name}
                      type="button"
                      onClick={() => setProfile({
                        ...profile,
                        background_type: 'gradient',
                        background_value: gradient.value
                      })}
                      className={`h-16 rounded-xl transition-all ${
                        profile.background_value === gradient.value
                          ? 'ring-4 ring-amber-500 scale-105'
                          : 'hover:scale-105'
                      }`}
                      style={{ background: gradient.value }}
                    >
                      <span className="text-white text-xs font-semibold drop-shadow-lg">
                        {gradient.name}
                      </span>
                    </button>
                  ))}
                </div>
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
              disabled={loading}
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
