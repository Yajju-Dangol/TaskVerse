import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LandingPage } from './components/LandingPage';
import { InternDashboard } from './components/InternDashboard';
import { BusinessDashboard } from './components/BusinessDashboard';
import { ResetPassword } from './components/ResetPassword';
import { Toaster } from './components/ui/sonner';
import { supabase } from './lib/supabase';
import { getProfile } from './lib/db';
import { PageTransition } from './components/PageTransition';

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
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // ... (keep auth logic same.)
  const loadUserProfile = async (userId: string) => {
    try {
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
      } else {
        // If profile is missing, treat as logged-out for now
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      // Check for recovery parameter in URL
      const params = new URLSearchParams(window.location.search);
      const isRecovery = params.get('type') === 'recovery';

      if (isRecovery) {
        setShowPasswordReset(true);
      }

      try {
        // Check existing session so users stay logged in across refreshes.
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error('Error getting auth session:', error);
          setCurrentUser(null);
          setLoading(false);
        } else if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Unexpected error getting auth session:', err);
        if (isMounted) {
          setCurrentUser(null);
          setLoading(false);
        }
      }

      // Listen for future auth changes (login/logout)
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        console.log('Auth state change:', event);

        if (event === 'USER_UPDATED') {
          setShowPasswordReset(false);
          // Clear query params to prevent re-triggering recovery mode on reload
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);

          if (session?.user) {
            await loadUserProfile(session.user.id);
          }
        }

        if (event === 'PASSWORD_RECOVERY') {
          setShowPasswordReset(true);
        }

        if (event === 'SIGNED_OUT' || !session?.user) {
          setCurrentUser(null);
          setLoading(false);
          setShowPasswordReset(false); // Reset this just in case
          return;
        }

        if (session.user) {
          await loadUserProfile(session.user.id);
        }
      });

      subscription = data.subscription;
    };

    void init();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

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

  // Determine current view for AnimatePresence
  const getView = () => {
    if (loading) {
      return (
        <PageTransition key="loading">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </PageTransition>
      );
    }

    if (showPasswordReset) {
      return (
        <PageTransition key="password-reset">
          <LandingPage showResetPasswordDialog={true} />
        </PageTransition>
      );
    }

    if (!currentUser) {
      return (
        <PageTransition key="landing">
          <LandingPage />
        </PageTransition>
      );
    }

    if (currentUser.role === 'intern') {
      return (
        <PageTransition key="intern-dashboard">
          <InternDashboard user={currentUser} onLogout={handleLogout} />
        </PageTransition>
      );
    }

    if (currentUser.role === 'business') {
      return (
        <PageTransition key="business-dashboard">
          <BusinessDashboard user={currentUser} onLogout={handleLogout} />
        </PageTransition>
      );
    }

    return null;
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {getView()}
      </AnimatePresence>
      <Toaster />
    </>
  );
}