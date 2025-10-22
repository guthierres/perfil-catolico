import React from 'react';

export interface MusicEmbedData {
  type: 'spotify' | 'youtube';
  url: string;
  title: string;
}

interface MusicEmbedProps {
  embed: MusicEmbedData;
  onRemove?: () => void;
  editable?: boolean;
}

const extractSpotifyId = (url: string): string | null => {
  const patterns = [
    /spotify\.com\/track\/([a-zA-Z0-9]+)/,
    /spotify\.com\/playlist\/([a-zA-Z0-9]+)/,
    /spotify\.com\/album\/([a-zA-Z0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const extractYoutubeId = (url: string): string | null => {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getSpotifyType = (url: string): string => {
  if (url.includes('/track/')) return 'track';
  if (url.includes('/playlist/')) return 'playlist';
  if (url.includes('/album/')) return 'album';
  return 'track';
};

export const MusicEmbed: React.FC<MusicEmbedProps> = ({ embed, onRemove, editable = false }) => {
  if (embed.type === 'spotify') {
    const spotifyId = extractSpotifyId(embed.url);
    const spotifyType = getSpotifyType(embed.url);

    if (!spotifyId) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          URL do Spotify inválida
        </div>
      );
    }

    return (
      <div className="relative group">
        {editable && onRemove && (
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
            title="Remover música"
          >
            ×
          </button>
        )}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {embed.title && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700">{embed.title}</p>
            </div>
          )}
          <iframe
            src={`https://open.spotify.com/embed/${spotifyType}/${spotifyId}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="w-full"
          />
        </div>
      </div>
    );
  }

  if (embed.type === 'youtube') {
    const youtubeId = extractYoutubeId(embed.url);

    if (!youtubeId) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          URL do YouTube inválida
        </div>
      );
    }

    return (
      <div className="relative group">
        {editable && onRemove && (
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
            title="Remover vídeo"
          >
            ×
          </button>
        )}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {embed.title && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700">{embed.title}</p>
            </div>
          )}
          <div className="relative" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};
