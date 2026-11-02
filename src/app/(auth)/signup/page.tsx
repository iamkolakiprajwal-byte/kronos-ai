"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Lock, Mail, User, ArrowRight, ShieldCheck } from "lucide-react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }
      }
    }

    // Redirect to onboarding to finish profile setup
    setTimeout(() => {
      setLoading(false);
      router.push("/onboarding");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 flex flex-col justify-between selection:bg-amber-200">
      <header className="px-6 py-4 border-b border-[#e6e3da] bg-white/80 backdrop-blur-md flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-100 flex items-center justify-center shadow-xs">
            <Clock className="w-4 h-4 text-amber-200" />
          </div>
          <span className="font-serif font-bold text-base text-slate-900">Kronos AI</span>
        </Link>
        <Link
          href="/login"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          Already have an account? Sign In →
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#e6e3da] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h1 className="font-serif text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-xs text-slate-500">
              Set up your personal assistant to balance classes, work, and goals.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aria Chen or Marcus Reed"
                className="w-full px-3.5 py-2.5 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu or you@company.io"
                className="w-full px-3.5 py-2.5 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>{loading ? "Creating Account..." : "Continue to Guided Setup"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </form>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              In Demo Mode, creating an account transitions straight into guided onboarding with zero external credentials required.
            </span>
          </div>

          <div className="text-center text-xs text-slate-500 pt-1">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-slate-900 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-slate-400 border-t border-[#e6e3da]">
        Kronos AI Personal Time Manager • Supabase Auth Architecture
      </footer>
    </div>
  );
}
