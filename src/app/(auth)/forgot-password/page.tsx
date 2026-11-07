"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock, Mail, ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter your account email address.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const res = await forgotPassword(email.trim());
    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setErrorMessage(res.error || "Failed to send reset link. Please verify your email.");
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
        <Link
          href="/login"
          className="text-xs font-semibold text-[#687050] hover:text-[#201e1b] transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-[#fdfcf9] rounded-3xl border border-[#e8e2d5] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in-50 duration-200">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#687050] bg-[#edf2ec] border border-[#d6e0d5] px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-[#b37e2a]" />
              <span>Account Recovery</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#201e1b] tracking-tight">
              Reset password
            </h1>
            <p className="text-xs text-[#545049] leading-relaxed">
              Enter your registered email address and we'll send you a link to reset your password.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-[#faece7] border border-[#f3cec3] text-xs text-[#b85437]">
              {errorMessage}
            </div>
          )}

          {success ? (
            <div className="p-5 rounded-2xl bg-[#edf2ec] border border-[#d6e0d5] text-xs space-y-3">
              <div className="flex items-center gap-2 text-[#536b54] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#536b54]" />
                <span>Password reset link sent!</span>
              </div>
              <p className="text-[#545049] leading-relaxed">
                We've sent an email to <strong className="text-[#201e1b]">{email}</strong> with a secure link to reset your password. Please check your inbox and spam folder.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full h-10 bg-[#201e1b] hover:bg-[#34302b] text-[#f8f6f0] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#e8e2d5] rounded-xl text-xs text-[#201e1b] placeholder:text-[#8a8479] focus:outline-hidden focus:border-[#201e1b] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#201e1b] hover:bg-[#34302b] text-[#f8f6f0] rounded-xl text-xs font-semibold shadow-2xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? "Sending link..." : "Send Reset Link"}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#e8decb]" />
              </button>
            </form>
          )}

          <div className="text-center text-xs text-[#545049] pt-2 border-t border-[#e8e2d5]">
            Remembered your credentials?{" "}
            <Link href="/login" className="font-semibold text-[#201e1b] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-[#8a8479] border-t border-[#e8e2d5]">
        Kronos AI Personal Time Manager • Secure Account Recovery
      </footer>
    </div>
  );
}
