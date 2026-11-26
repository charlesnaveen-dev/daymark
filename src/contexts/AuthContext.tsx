import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  getLocalSession,
  LocalUser,
  setLocalSession,
} from '../services/storage';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isCloudMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string; needsVerification?: boolean }>;
  signInLocalDev: (displayName?: string, email?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const sUser = data.session?.user;
        if (sUser) {
          setUser({
            id: sUser.id,
            email: sUser.email ?? '',
            displayName:
              (sUser.user_metadata?.display_name as string | undefined) ||
              sUser.email?.split('@')[0] ||
              'Creator',
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        const sUser = session?.user;
        if (sUser) {
          setUser({
            id: sUser.id,
            email: sUser.email ?? '',
            displayName:
              (sUser.user_metadata?.display_name as string | undefined) ||
              sUser.email?.split('@')[0] ||
              'Creator',
          });
        } else {
          setUser(null);
        }
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    }

    const local = getLocalSession();
    if (local) {
      setUser(local);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    }

    const localUser: LocalUser = {
      id: 'local-dev-user',
      email: email.trim() || 'local@daymark.app',
      displayName: email.split('@')[0] || 'Creator',
    };
    setLocalSession(localUser);
    setUser(localUser);
    return {};
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });
      if (error) return { error: error.message };
      if (!data.session) {
        return { needsVerification: true };
      }
      return {};
    }

    const localUser: LocalUser = {
      id: 'local-dev-user',
      email: email.trim() || 'local@daymark.app',
      displayName: displayName.trim() || 'Creator',
    };
    setLocalSession(localUser);
    setUser(localUser);
    return {};
  };

  const signInLocalDev = (displayName = 'Creator', email = 'local@daymark.app') => {
    const localUser: LocalUser = {
      id: 'local-dev-user',
      email,
      displayName,
    };
    setLocalSession(localUser);
    setUser(localUser);
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      setLocalSession(null);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isCloudMode: isSupabaseConfigured,
        signIn,
        signUp,
        signInLocalDev,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
