"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { isSecretKeyMisconfigured } from "@/lib/supabase/client";

// Official Google 4-Color "G" SVG Icon
function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isSecretKeyMisconfigured) {
      setErrorMessage(
        "Configuration error: NEXT_PUBLIC_SUPABASE_ANON_KEY is set to Supabase's Secret / service_role key. In Vercel, replace this value with your public 'anon' key from Supabase Dashboard > Project Settings > API Keys."
      );
    }
  }, []);

  const handleGoogleClick = async () => {
    setLoading(true);
    setErrorMessage("");
    const res = await signInWithGoogle();
    if (!res.success && res.error) {
      setErrorMessage(res.error);
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const res = await signUpWithEmail(fullName.trim(), email.trim(), password);
    setLoading(false);

    if (res.success) {
      router.push("/onboarding");
    } else {
      setErrorMessage(res.error || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#201e1b] flex flex-col justify-between selection:bg-[#e8decb] font-sans">
      {/* Top Header */}
      <header className="px-5 sm:px-8 py-3.5 border-b border-[#e8e2d5] bg-[#fbf9f5]/90 backdrop-blur-md flex items-center justify-between">
        <Link href="/login" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#201e1b] text-[#f8f6f0] flex items-center justify-center shadow-xs">
            <Clock className="w-4 h-4 text-[#e8decb]" />
          </div>
          <span className="font-serif font-medium text-base text-[#201e1b] tracking-tight">Kronos AI</span>
        </Link>
        <span className="text-[10px] uppercase font-sans font-semibold tracking-wider text-[#8a8479] bg-[#f2eee6] px-2 py-0.5 rounded-full border border-[#e4ded2]">
          New Account
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-[#fdfcf9] rounded-3xl border border-[#e8e2d5] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in-50 duration-200">
          {/* Title & Briefing */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#687050] bg-[#edf2ec] border border-[#d6e0d5] px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-[#b37e2a]" />
              <span>Get Started</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#201e1b] tracking-tight">
              Create your account
            </h1>
            <p className="text-xs text-[#545049] leading-relaxed">
              Set up your personal workspace, intelligent timetable, and flow rhythms.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-[#faece7] border border-[#f3cec3] text-xs text-[#b85437] flex items-start gap-2">
              <span className="font-bold">Notice:</span>
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={loading}
              className="w-full h-11 px-4 rounded-xl border border-[#d5cdbd] bg-white hover:bg-[#f2eee6] text-[#201e1b] text-xs font-semibold flex items-center justify-center gap-3 transition-all shadow-2xs active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-[#e8e2d5]" />
            <span className="text-[11px] uppercase tracking-wider text-[#8a8479] font-medium">
              or with email
            </span>
            <div className="flex-1 h-[1px] bg-[#e8e2d5]" />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSignup} className="space-y-3.5" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-[#545049] mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#8a8479]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full px-3.5 py-2.5 bg-white border border-[#e8e2d5] rounded-xl text-xs text-[#201e1b] placeholder:text-[#8a8479] focus:outline-hidden focus:border-[#201e1b] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#545049] mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#8a8479]" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full px-3.5 py-2.5 bg-white border border-[#e8e2d5] rounded-xl text-xs text-[#201e1b] placeholder:text-[#8a8479] focus:outline-hidden focus:border-[#201e1b] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#545049] mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#8a8479]" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-[#e8e2d5] rounded-xl text-xs text-[#201e1b] placeholder:text-[#8a8479] focus:outline-hidden focus:border-[#201e1b] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8479] hover:text-[#201e1b] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#201e1b] hover:bg-[#34302b] text-[#f8f6f0] rounded-xl text-xs font-semibold shadow-2xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Creating Account..." : "Continue to Onboarding"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#e8decb]" />
            </button>
          </form>

          {/* Footer switch to Login */}
          <div className="text-center text-xs text-[#545049] pt-2 border-t border-[#e8e2d5]">
            Already have a Kronos account?{" "}
            <Link href="/login" className="font-semibold text-[#201e1b] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-[#8a8479] border-t border-[#e8e2d5]">
        Kronos AI Personal Time Manager • Adaptive Multi-Provider Authentication
      </footer>
    </div>
  );
}
