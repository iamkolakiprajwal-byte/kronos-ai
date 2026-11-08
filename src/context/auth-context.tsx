"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  isSupabaseConfigured,
  createClient,
  isSecretKeyMisconfigured,
} from "@/lib/supabase/client";

export function formatAuthError(rawMessage?: string): string {
  if (!rawMessage) return "Authentication failed. Please try again.";
  const lower = rawMessage.toLowerCase();
  if (
    lower.includes("secret api key") ||
    lower.includes("forbidden use of secret") ||
    lower.includes("forbidden use of secret api key in browser")
  ) {
    return "Configuration error: The Supabase secret 'service_role' key was placed in NEXT_PUBLIC_SUPABASE_ANON_KEY. Please replace it in Vercel with your public 'anon' key from Supabase Dashboard > Project Settings > API.";
  }
  return rawMessage;
}

const SECRET_KEY_MISCONFIGURED_NOTICE =
  "Configuration error: NEXT_PUBLIC_SUPABASE_ANON_KEY is set to Supabase's Secret / service_role key. In Vercel, replace this value with the public 'anon' key from Supabase Dashboard > Project Settings > API Keys.";

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
  connectGoogleCalendar: () => Promise<{ success: boolean; error?: string }>;
  signInWithGithub: () => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_STORAGE_KEY = "kronos_ai_auth_user_v1";

function setAuthCookie(id: string) {
  if (typeof document !== "undefined") {
    document.cookie = `kronos_auth_user=${encodeURIComponent(id)}; path=/; max-age=2592000; SameSite=Lax`;
  }
}

function clearAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "kronos_auth_user=; path=/; max-age=0; SameSite=Lax";
  }
}

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
              if (session.provider_token) {
                localStorage.setItem("kronos_google_provider_token", session.provider_token);
              }
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
              setAuthCookie(authUser.id);
              setIsLoading(false);
              return;
            }

            // Listen for changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
              if (session?.user) {
                if (session.provider_token) {
                  localStorage.setItem("kronos_google_provider_token", session.provider_token);
                }
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
                setAuthCookie(authUser.id);
              } else {
                // If logged out from Supabase, check local fallback
                const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
                if (storedUser) {
                  try {
                    const parsed = JSON.parse(storedUser);
                    setUser(parsed);
                    setAuthCookie(parsed.id);
                  } catch {
                    setUser(null);
                    clearAuthCookie();
                  }
                } else {
                  setUser(null);
                  clearAuthCookie();
                }
              }
            });

            return () => {
              subscription.unsubscribe();
            };
          }
        }

        // Check local storage for persistent cached auth session
        const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
        if (storedUser && isMounted) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setAuthCookie(parsed.id);
          } catch {
            setUser(null);
            clearAuthCookie();
          }
        } else if (isMounted) {
          setUser(null);
          clearAuthCookie();
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

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return {
          success: false,
          error:
            "Google Authentication requires Supabase to be configured with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables, and the Google provider enabled in your Supabase dashboard.",
        };
      }

      if (isSecretKeyMisconfigured) {
        setIsLoading(false);
        return { success: false, error: SECRET_KEY_MISCONFIGURED_NOTICE };
      }

      const supabase = createClient();
      if (!supabase) {
        setIsLoading(false);
        return { success: false, error: "Failed to initialize Supabase client." };
      }

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
        return { success: false, error: formatAuthError(error.message) };
      }

      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: formatAuthError(err.message || "Failed to initiate Google authentication") };
    }
  };

  const connectGoogleCalendar = async () => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return {
          success: false,
          error:
            "Authentication service is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.",
        };
      }

      if (isSecretKeyMisconfigured) {
        setIsLoading(false);
        return { success: false, error: SECRET_KEY_MISCONFIGURED_NOTICE };
      }

      const supabase = createClient();
      if (!supabase) {
        setIsLoading(false);
        return { success: false, error: "Failed to initialize Supabase client." };
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?source=calendar_connect`,
          scopes: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: formatAuthError(error.message) };
      }

      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: formatAuthError(err.message || "Failed to connect Google Calendar") };
    }
  };

  const signInWithGithub = async () => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return {
          success: false,
          error:
            "GitHub Authentication requires Supabase to be configured with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables, and the GitHub provider enabled in your Supabase dashboard.",
        };
      }

      if (isSecretKeyMisconfigured) {
        setIsLoading(false);
        return { success: false, error: SECRET_KEY_MISCONFIGURED_NOTICE };
      }

      const supabase = createClient();
      if (!supabase) {
        setIsLoading(false);
        return { success: false, error: "Failed to initialize Supabase client." };
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: formatAuthError(error.message) };
      }

      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: formatAuthError(err.message || "Failed to initiate GitHub authentication") };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return {
          success: false,
          error:
            "Authentication service is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.",
        };
      }

      if (isSecretKeyMisconfigured) {
        setIsLoading(false);
        return { success: false, error: SECRET_KEY_MISCONFIGURED_NOTICE };
      }

      const supabase = createClient();
      if (!supabase) {
        setIsLoading(false);
        return { success: false, error: "Failed to initialize Supabase client." };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: formatAuthError(error.message) };
      }

      if (data.user) {
        const meta = data.user.user_metadata || {};
        const authUser: AuthUser = {
          id: data.user.id,
          name: meta.full_name || meta.name || email.split("@")[0],
          email: data.user.email || email,
          avatar:
            meta.avatar_url ||
            `https://api.dicebear.com/7.x/notionists/svg?seed=${data.user.id}&backgroundColor=e8decb`,
          provider: "email",
        };
        setUser(authUser);
        setAuthCookie(authUser.id);
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authUser));
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: formatAuthError(err.message || "Invalid credentials") };
    }
  };

  const signUpWithEmail = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return {
          success: false,
          error:
            "Authentication service is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.",
        };
      }

      if (isSecretKeyMisconfigured) {
        setIsLoading(false);
        return { success: false, error: SECRET_KEY_MISCONFIGURED_NOTICE };
      }

      const supabase = createClient();
      if (!supabase) {
        setIsLoading(false);
        return { success: false, error: "Failed to initialize Supabase client." };
      }

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
        return { success: false, error: formatAuthError(error.message) };
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
        setAuthCookie(authUser.id);
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authUser));
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: formatAuthError(err.message || "Failed to create account") };
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return {
          success: false,
          error:
            "Authentication service is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.",
        };
      }

      if (isSecretKeyMisconfigured) {
        setIsLoading(false);
        return { success: false, error: SECRET_KEY_MISCONFIGURED_NOTICE };
      }

      const supabase = createClient();
      if (!supabase) {
        setIsLoading(false);
        return { success: false, error: "Failed to initialize Supabase client." };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: formatAuthError(error.message) };
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: formatAuthError(err.message || "Failed to send reset instructions") };
    }
  };

  const resetPassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return {
          success: false,
          error:
            "Authentication service is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.",
        };
      }

      if (isSecretKeyMisconfigured) {
        setIsLoading(false);
        return { success: false, error: SECRET_KEY_MISCONFIGURED_NOTICE };
      }

      const supabase = createClient();
      if (!supabase) {
        setIsLoading(false);
        return { success: false, error: "Failed to initialize Supabase client." };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: formatAuthError(error.message) };
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: formatAuthError(err.message || "Failed to update password") };
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
      clearAuthCookie();
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
        connectGoogleCalendar,
        signInWithGithub,
        signInWithEmail,
        signUpWithEmail,
        forgotPassword,
        resetPassword,
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
