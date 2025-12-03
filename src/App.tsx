import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { InternDashboard } from './components/InternDashboard';
import { BusinessDashboard } from './components/BusinessDashboard';
import { Toaster } from './components/ui/sonner';
import { supabase } from './lib/supabase';
import { getProfile } from './lib/db';

export type UserRole = 'intern' | 'business' | null;

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  points?: number;
  level?: number;
  badges?: string[];
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setLoading(false);
      } else if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    const profile = await getProfile(userId);
    if (profile) {
      setCurrentUser({
        id: profile.id,
        email: profile.email,
        role: profile.role as UserRole,
        name: profile.name,
        points: profile.points,
        level: profile.level,
      });
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      // State will be updated by the auth state change listener
      setCurrentUser(null);
      setLoading(false);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      setCurrentUser(null);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LandingPage />
        <Toaster />
      </>
    );
  }

  if (currentUser.role === 'intern') {
    return (
      <>
        <InternDashboard user={currentUser} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  if (currentUser.role === 'business') {
    return (
      <>
        <BusinessDashboard user={currentUser} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  return null;
}