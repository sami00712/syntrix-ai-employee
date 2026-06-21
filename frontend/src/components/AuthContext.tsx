'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  business_id?: number;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  token: string | null;
  isLoading: boolean;
  loginWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  sendOtp: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string, displayName?: string, password?: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const fetchUserData = async (accessToken: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        document.cookie = `token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        document.cookie = `user_role=${userData.role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        return userData;
      }
    } catch (e) {
      console.error('Failed to fetch user data', e);
    }
    return null;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);

      if (session) {
        const accessToken = session.access_token;
        const userData = await fetchUserData(accessToken);

        if (userData) {
          const isAuthPage = pathname === '/login' || pathname === '/signup';

          if (userData.role === 'owner') {
            try {
              const bizRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/business/me`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );
              if (bizRes.ok) {
                const bizData = await bizRes.json();
                if (!bizData.onboarding_completed) {
                  if (pathname !== '/onboarding') {
                    router.push('/onboarding');
                  }
                } else if (isAuthPage || pathname === '/onboarding') {
                  router.push('/dashboard');
                }
              } else if (isAuthPage) {
                router.push('/onboarding');
              }
            } catch {
              if (isAuthPage) router.push('/dashboard');
            }
          } else if (isAuthPage) {
            router.push('/dashboard');
          }
        }
      } else {
        setUser(null);
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  const loginWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const sendOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error: error?.message || null };
  };

  const verifyOtp = async (email: string, token: string, displayName?: string, password?: string) => {
    const { error, data } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) return { error: error.message };
    if (data?.user) {
      if (displayName) {
        await supabase.auth.updateUser({ data: { full_name: displayName } });
      }
      if (password) {
        await supabase.auth.updateUser({ password });
      }
    }
    return { error: null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setSupabaseUser(null);
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      session,
      token: session?.access_token || null,
      isLoading,
      loginWithPassword,
      sendOtp,
      verifyOtp,
      signInWithGoogle,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
