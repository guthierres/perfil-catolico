import { useState } from 'react';
import { GRADIENT_PRESETS } from '../types/profile';

interface GradientCustomizerProps {
  value: string;
  onChange: (value: string) => void;
}

export function GradientCustomizer({ value, onChange }: GradientCustomizerProps) {
  const [customColor1, setCustomColor1] = useState('#667eea');
  const [customColor2, setCustomColor2] = useState('#764ba2');
  const [angle, setAngle] = useState(135);

  const handleCustomGradient = () => {
    const gradient = `linear-gradient(${angle}deg, ${customColor1} 0%, ${customColor2} 100%)`;
    onChange(gradient);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {GRADIENT_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onChange(preset.value)}
            className={`relative h-20 rounded-lg border-2 transition-all ${
              value === preset.value
                ? 'border-blue-500 shadow-lg scale-105'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{ background: preset.value }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold bg-black bg-opacity-30 rounded-lg">
              {preset.name}
            </span>
          </button>
        ))}
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Criar Gradiente Personalizado</h4>

        <div className="space-y-3">
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Cor 1</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor1}
                  onChange={(e) => setCustomColor1(e.target.value)}
                  className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customColor1}
                  onChange={(e) => setCustomColor1(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="#667eea"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Cor 2</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor2}
                  onChange={(e) => setCustomColor2(e.target.value)}
                  className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customColor2}
                  onChange={(e) => setCustomColor2(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="#764ba2"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Ângulo: {angle}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div
            className="h-20 rounded-lg border-2 border-gray-300"
            style={{
              background: `linear-gradient(${angle}deg, ${customColor1} 0%, ${customColor2} 100%)`,
            }}
          />

          <button
            type="button"
            onClick={handleCustomGradient}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Aplicar Gradiente Personalizado
          </button>
        </div>
      </div>
    </div>
  );
}
