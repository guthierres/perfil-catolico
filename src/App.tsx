import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { ProfileDisplay } from './components/ProfileDisplay';
import { ProfileEditor } from './components/ProfileEditor';
import { LandingPage } from './components/LandingPage';
import { PublicProfile } from './components/PublicProfile';

function AppContent() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  const path = window.location.pathname;
  const isPublicProfile = path.startsWith('/p/');
  const slug = isPublicProfile ? path.replace('/p/', '') : null;

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }, []);

  if (isPublicProfile && slug) {
    return <PublicProfile slug={slug} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return <Auth />;
  }

  if (isEditing) {
    return <ProfileEditor onSave={() => setIsEditing(false)} />;
  }

  return <ProfileDisplay onEdit={() => setIsEditing(true)} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
