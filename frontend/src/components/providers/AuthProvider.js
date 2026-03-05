"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const AuthContext = createContext({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updatePassword: async () => {},
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const respData = await res.json();

    if (!res.ok) {
      throw new Error(respData.detail || "Login failed");
    }

    if (respData.session) {
      const { data, error } = await supabase.auth.setSession({
        access_token: respData.session.access_token,
        refresh_token: respData.session.refresh_token,
      });
      if (error) throw error;
      return data;
    }

    return { user: respData.user };
  };

  const signup = async (
    email,
    password,
    name,
    role,
    department,
    ktuId,
    studentCategory,
  ) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name,
        role,
        department,
        studentCategory: studentCategory || null,
        ktuId: ktuId || null,
      }),
    });

    const respData = await res.json();

    if (!res.ok) {
      throw new Error(respData.detail || "Signup failed");
    }

    if (respData.session) {
      const { data, error } = await supabase.auth.setSession({
        access_token: respData.session.access_token,
        refresh_token: respData.session.refresh_token,
      });
      if (error) throw error;
      return data;
    }

    return { user: respData.user };
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

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
