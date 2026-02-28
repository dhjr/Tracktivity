"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const AuthContext = createContext({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password, name, role, ktuId) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          ktuId,
          isKtuVerified: role === "student" ? false : undefined,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = "/";
  };

  const updateProfile = async ({ name, ktuId }) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { name, ktuId },
    });
    if (error) throw error;
    // Update local state to reflect new name immediately
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
