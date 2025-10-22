import { useState } from 'react';
import { User, Wallet } from 'lucide-react';

interface ProfileTabsProps {
  activeTab: 'profile' | 'wallet';
  onTabChange: (tab: 'profile' | 'wallet') => void;
  primaryColor: string;
}

export function ProfileTabs({ activeTab, onTabChange, primaryColor }: ProfileTabsProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onTabChange('profile')}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition shadow-lg ${
          activeTab === 'profile'
            ? 'text-white'
            : 'bg-white/90 text-gray-700 hover:bg-white'
        }`}
        style={
          activeTab === 'profile'
            ? { backgroundColor: primaryColor }
            : {}
        }
      >
        <User className="w-5 h-5" />
        Perfil
      </button>
      <button
        onClick={() => onTabChange('wallet')}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition shadow-lg ${
          activeTab === 'wallet'
            ? 'text-white'
            : 'bg-white/90 text-gray-700 hover:bg-white'
        }`}
        style={
          activeTab === 'wallet'
            ? { backgroundColor: primaryColor }
            : {}
        }
      >
        <Wallet className="w-5 h-5" />
        Carteira
      </button>
    </div>
  );
}
