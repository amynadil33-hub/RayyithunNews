import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.ts";
import type { Profile } from "../lib/database.types.ts";
import type { User } from "@supabase/supabase-js";

interface AdminAuthContextProps {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isAdminAreaAllowed: boolean;
  hasRole: (...roles: Profile["role"][]) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextProps | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        await fetchProfile(data.session.user.id);
      }
      setIsLoading(false);
    };

    getSession().catch(console.error);

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    setProfile(data as Profile);
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await fetchProfile(data.user.id);
    setUser(data.user);
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    setUser(null);
  }

  const hasRole = (...roles: Profile["role"][]) => !!profile && roles.includes(profile.role);
  const isAdmin = hasRole("super_admin", "admin", "editor", "author");
  const isAdminAreaAllowed = isAdmin && profile?.is_active === true;

  return (
    <AdminAuthContext.Provider value={{ user, profile, isLoading, signIn, signOut, isAdmin, isAdminAreaAllowed, hasRole }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
