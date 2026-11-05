"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: "google" | "github" | "email" | "demo";
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseLive: boolean;
  signInWithGoogle: (customAccount?: { name: string; email: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
  signInWithGithub: () => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_STORAGE_KEY = "kronos_ai_auth_user_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSupabaseLive = isSupabaseConfigured;

  // Hydrate auth session on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        if (isSupabaseConfigured) {
          const supabase = createClient();
          if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user && isMounted) {
              const meta = session.user.user_metadata || {};
              const authUser: AuthUser = {
                id: session.user.id,
                name: meta.full_name || meta.name || session.user.email?.split("@")[0] || "User",
                email: session.user.email || "",
                avatar: meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/notionists/svg?seed=${session.user.id}&backgroundColor=e8decb`,
                provider: (session.user.app_metadata?.provider as any) || "email",
                createdAt: session.user.created_at,
              };
              setUser(authUser);
              setIsLoading(false);
              return;
            }

            // Listen for changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
              if (session?.user) {
                const meta = session.user.user_metadata || {};
                setUser({
                  id: session.user.id,
                  name: meta.full_name || meta.name || session.user.email?.split("@")[0] || "User",
                  email: session.user.email || "",
                  avatar: meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/notionists/svg?seed=${session.user.id}&backgroundColor=e8decb`,
                  provider: (session.user.app_metadata?.provider as any) || "email",
                  createdAt: session.user.created_at,
                });
              } else {
                // If logged out from Supabase, check local demo user fallback
                const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
                if (storedUser) {
                  try {
                    setUser(JSON.parse(storedUser));
                  } catch {
                    setUser(null);
                  }
                } else {
                  setUser(null);
                }
              }
            });

            return () => {
              subscription.unsubscribe();
            };
          }
        }

        // Check local storage for persistent demo/cached auth session
        const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
        if (storedUser && isMounted) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(null);
          }
        } else if (isMounted) {
          // Default initial persona (Aria Chen)
          const defaultDemoUser: AuthUser = {
            id: "user-aria-chen",
            name: "Aria Chen",
            email: "aria.chen@stanford.edu",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            provider: "demo",
          };
          setUser(defaultDemoUser);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signInWithGoogle = async (customAccount?: { name: string; email: string; avatar?: string }) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              queryParams: {
                access_type: "offline",
                prompt: "consent",
              },
            },
          });
          if (error) {
            setIsLoading(false);
            return { success: false, error: error.message };
          }
          return { success: true };
        }
      }

      // Zero-cost Demo Mode implementation: Instant seamless Google login
      const googleUser: AuthUser = {
        id: `google-${Date.now()}`,
        name: customAccount?.name || "Aria Chen",
        email: customAccount?.email || "aria.chen@stanford.edu",
        avatar:
          customAccount?.avatar ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        provider: "google",
        createdAt: new Date().toISOString(),
      };

      setUser(googleUser);
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(googleUser));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || "Failed to sign in with Google" };
    }
  };

  const signInWithGithub = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          if (error) {
            setIsLoading(false);
            return { success: false, error: error.message };
          }
          return { success: true };
        }
      }

      // Demo Mode GitHub login
      const githubUser: AuthUser = {
        id: `github-${Date.now()}`,
        name: "Marcus Reed",
        email: "marcus.reed@cloudscale.io",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        provider: "github",
        createdAt: new Date().toISOString(),
      };

      setUser(githubUser);
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(githubUser));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || "Failed to sign in with GitHub" };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            setIsLoading(false);
            return { success: false, error: error.message };
          }
          if (data.user) {
            const meta = data.user.user_metadata || {};
            const authUser: AuthUser = {
              id: data.user.id,
              name: meta.full_name || meta.name || email.split("@")[0],
              email: data.user.email || email,
              avatar: meta.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${data.user.id}&backgroundColor=e8decb`,
              provider: "email",
            };
            setUser(authUser);
            localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authUser));
          }
          setIsLoading(false);
          return { success: true };
        }
      }

      // Demo mode fallback email login
      const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const emailUser: AuthUser = {
        id: `user-${Date.now()}`,
        name: name || "Kronos User",
        email,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${email}&backgroundColor=e8decb`,
        provider: "email",
        createdAt: new Date().toISOString(),
      };

      setUser(emailUser);
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(emailUser));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || "Invalid credentials" };
    }
  };

  const signUpWithEmail = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          });
          if (error) {
            setIsLoading(false);
            return { success: false, error: error.message };
          }
          if (data.user) {
            const authUser: AuthUser = {
              id: data.user.id,
              name: fullName,
              email,
              avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${data.user.id}&backgroundColor=e8decb`,
              provider: "email",
            };
            setUser(authUser);
            localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authUser));
          }
          setIsLoading(false);
          return { success: true };
        }
      }

      // Demo mode fallback signup
      const newUser: AuthUser = {
        id: `user-${Date.now()}`,
        name: fullName || "Kronos User",
        email,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=e8decb`,
        provider: "email",
        createdAt: new Date().toISOString(),
      };

      setUser(newUser);
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(newUser));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || "Failed to create account" };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      console.warn("Sign out warning:", err);
    } finally {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isSupabaseLive,
        signInWithGoogle,
        signInWithGithub,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
