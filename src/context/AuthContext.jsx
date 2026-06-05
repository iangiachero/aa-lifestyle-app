// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId, authUser = null) => {
    if (!userId) {
      setUserProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setUserProfile(data);
      return data;
    }

    if (!data && authUser?.email) {
      const { data: recovered } = await supabase
        .from('users')
        .insert({
          user_id: userId,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || '',
          plan: 'free',
        })
        .select()
        .maybeSingle();

      if (recovered) {
        setUserProfile(recovered);
        return recovered;
      }
    }

    setUserProfile(null);
    return null;
  };

  const refreshUserProfile = async () => {
    if (user?.id) return await fetchUserProfile(user.id);
    return null;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        (async () => { await fetchUserProfile(session.user.id, session.user); })();
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email, password, fullName = '') => {
    // Sign up with metadata - the trigger will create the profile automatically
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    // Wait a moment for the trigger to create the profile
    if (!error && data?.user) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchUserProfile(data.user.id);
    }

    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
  };

  const isPro = userProfile?.plan === 'pro';

  return (
    <AuthContext.Provider value={{ session, user, userProfile, loading, isPro, signIn, signUp, signOut, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}