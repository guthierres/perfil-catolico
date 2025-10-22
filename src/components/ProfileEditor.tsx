import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Save, Palette, Link as LinkIcon, Image as ImageIcon, Plus, X, Music } from 'lucide-react';
// Importações de componentes que você está usando (assumidas como existentes)
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
  
  // Estado inicial do perfil
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
    music_embeds: [], // Array JSONB para músicas
  });

  const [newPastoral, setNewPastoral] = useState('');
  const [newMusicUrl, setNewMusicUrl] = useState('');
  const [newMusicTitle, setNewMusicTitle] = useState('');
  const [musicType, setMusicType] = useState<'spotify' | 'youtube'>('spotify');

  useEffect(() => {
    loadProfile();
  }, [user]); // Adicionado 'user' como dependência

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      // Ajusta o tipo de data do batismo para o formato do input
      data.baptism_date = data.baptism_date ? data.baptism_date.split('T')[0] : null; 
      setProfile(data);
      setSlugAvailable(true);
    }
  };

  // ----------------------------------------------------------------------
  // 🎯 CORREÇÃO 1: Função central de persistência (INSERT ou UPDATE)
  // ----------------------------------------------------------------------
  const saveProfile = async (dataToSave: Partial<Profile>) => {
    if (!user) return { error: { message: 'Usuário não autenticado.' } };

    const finalData = { ...dataToSave, updated_at: new Date().toISOString() };
    
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // UPDATE (Para perfis existentes)
        const { error } = await supabase
          .from('profiles')
          .update(finalData)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        // INSERT (Para novos perfis)
        const { error } = await supabase
          .from('profiles')
          .insert([{ ...finalData, user_id: user.id }]);
        if (error) throw error;
      }
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  // ----------------------------------------------------------------------
  // 🎯 CORREÇÃO 2: Função unificada de atualização de estado e salvamento
  // ----------------------------------------------------------------------
  const handleProfileUpdate = useCallback(async (newProfileState: Partial<Profile>) => {
    // 1. Atualiza o estado local imediatamente
    setProfile(newProfileState); 
    
    // 2. Salva o perfil atualizado no banco de dados
    const { error } = await saveProfile(newProfileState);

    if (error) {
        setMessage('Erro ao salvar alteração: ' + error.message);
    } else {
        // Não mostra mensagem de sucesso para cada adição/remoção, 
        // mas sim para o handleSubmit principal
        console.log('Alteração salva automaticamente.');
    }
  }, [user, profile.id]); // Adiciona dependências relevantes

  // ----------------------------------------------------------------------
  // 🎯 CORREÇÃO 3: Handlers de Listas usando a nova função
  // ----------------------------------------------------------------------

  // Lógica de Pastorais
  const handleAddPastoral = () => {
    if (newPastoral.trim()) {
      const updatedPastorals = [...(profile.pastorals || []), newPastoral.trim()];
      setProfile({ ...profile, pastorals: updatedPastorals }); // Apenas atualiza o estado aqui, salva no handleSubmit
      setNewPastoral('');
    }
  };

  const handleRemovePastoral = (index: number) => {
    const newPastorals = profile.pastorals?.filter((_, i) => i !== index);
    setProfile({ ...profile, pastorals: newPastorals }); // Apenas atualiza o estado aqui, salva no handleSubmit
  };

  // Lógica de Músicas (Onde o problema estava)
  const handleAddMusic = () => {
    if (!newMusicUrl.trim()) return;

    const newEmbed: MusicEmbed = {
      type: musicType,
      url: newMusicUrl.trim(),
      title: newMusicTitle.trim(),
    };
    
    const updatedEmbeds = [...(profile.music_embeds || []), newEmbed];
    
    // ATUALIZA ESTADO E SALVA O PERFIL COMPLETO NO DB
    handleProfileUpdate({ ...profile, music_embeds: updatedEmbeds });

    setNewMusicUrl('');
    setNewMusicTitle('');
  };

  const handleRemoveMusic = (index: number) => {
    const newEmbeds = profile.music_embeds?.filter((_, i) => i !== index);

    // ATUALIZA ESTADO E SALVA O PERFIL COMPLETO NO DB
    handleProfileUpdate({ ...profile, music_embeds: newEmbeds });
  };
  
  // ----------------------------------------------------------------------
  // Outras Funções (Manutenção do código original)
  // ----------------------------------------------------------------------
  
  const generateSlug = (text: string): string => {
    // ... (Código de geração de slug) ...
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const checkSlugAvailability = async (slug: string) => {
    // ... (Código de checagem de slug) ...
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

    // Note: O debounce de 500ms é mantido para evitar chamadas excessivas ao Supabase
    const timeoutId = setTimeout(() => {
      checkSlugAvailability(newSlug);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // ----------------------------------------------------------------------
  // 🎯 CORREÇÃO 4: handleSubmit agora usa a função saveProfile
  // ----------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!profile.slug || profile.slug.length < 3 || slugAvailable === false) {
      setMessage('Verifique o link personalizado.');
      return;
    }

    setLoading(true);
    setMessage('');

    // Usa a função de salvamento centralizada
    const { error } = await saveProfile(profile);

    if (error) {
      setMessage('Erro ao salvar perfil: ' + error.message);
    } else {
      setMessage('Perfil salvo com sucesso!');
      // Chama o callback de sucesso
      setTimeout(() => onSave(), 1500);
    }
    setLoading(false);
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
            
            {/* 1. Link Personalizado */}
            {/* ... (Markup para link personalizado) ... */}
            
            {/* 2. Informações Principais */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Nome Completo */}
              {/* ... */}
              {/* Paróquia */}
              {/* ... */}

              {/* Pastorais (Agora com handlers de estado locais) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pastorais</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPastoral}
                      onChange={(e) => setNewPastoral(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPastoral(); // Chama handler local
                        }
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      placeholder="Nome da pastoral"
                    />
                    <button
                      type="button"
                      onClick={handleAddPastoral} // Chama handler local
                      className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" /> Adicionar
                    </button>
                  </div>
                  {profile.pastorals && profile.pastorals.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.pastorals.map((pastoral, index) => (
                        <div key={index} className="bg-amber-100 border border-amber-300 px-3 py-2 rounded-lg flex items-center gap-2">
                          <span className="text-sm text-amber-900 font-medium">{pastoral}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePastoral(index)} // Chama handler local
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
              
              {/* ... (Data de Batismo, Pároco, Santo de Devoção) ... */}
            </div>

            {/* 3. Imagens e Citações */}
            {/* ... (ImageUploads e inputs de texto) ... */}

            {/* 4. Músicas e Vídeos (Onde a Persistência Imediata foi Adicionada) */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-5 h-5 text-amber-700" />
                <h3 className="text-lg font-semibold text-gray-800">Músicas</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="space-y-3">
                    {/* Botões de Tipo */}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setMusicType('spotify')} /* ... */>Spotify</button>
                      <button type="button" onClick={() => setMusicType('youtube')} /* ... */>YouTube</button>
                    </div>

                    {/* Input de Título */}
                    <input
                      type="text"
                      value={newMusicTitle}
                      onChange={(e) => setNewMusicTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Título da música (opcional)"
                    />

                    {/* Input de URL e Botão de Adicionar */}
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
                        onClick={handleAddMusic} // CHAMA O HANDLER COM SALVAMENTO
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" /> Adicionar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Exibição das Músicas com Remoção */}
                {profile.music_embeds && profile.music_embeds.length > 0 && (
                  <div className="space-y-4">
                    {profile.music_embeds.map((embed, index) => (
                      <MusicEmbedComponent
                        key={index}
                        embed={embed}
                        editable
                        onRemove={() => handleRemoveMusic(index)} // CHAMA O HANDLER COM SALVAMENTO
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 5. Personalização Visual */}
            {/* ... (Cores e background) ... */}

            {/* Mensagem e Botão Salvar */}
            {/* ... (Message div) ... */}

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
