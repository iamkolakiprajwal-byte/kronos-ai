import React from "react";
import Link from "next/link";
import { Clock, ArrowLeft, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Kronos AI",
  description: "Terms of Service and conditions of use for Kronos AI.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#201e1b] flex flex-col justify-between selection:bg-[#e8decb] font-sans w-full max-w-full overflow-x-hidden">
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
          className="text-xs font-medium text-[#545049] hover:text-[#201e1b] flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e4ded2] bg-white hover:bg-[#f2eee6] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-5 sm:p-8 space-y-8 my-6">
        <div className="space-y-2 border-b border-[#e8e2d5] pb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f2eee6] text-[#545049] border border-[#e4ded2] text-[11px] font-medium">
            <FileText className="w-3.5 h-3.5" />
            <span>Usage Agreement</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#201e1b] font-normal">
            Terms of Service
          </h1>
          <p className="text-xs text-[#8a8479]">
            Last updated: November 2026 • Effective immediately
          </p>
        </div>

        {/* Section 1: Acceptance */}
        <section className="space-y-3 text-xs sm:text-sm text-[#545049] leading-relaxed">
          <h2 className="font-serif text-lg text-[#201e1b] font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Kronos AI (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        {/* Section 2: Service Description */}
        <section className="space-y-3 text-xs sm:text-sm text-[#545049] leading-relaxed">
          <h2 className="font-serif text-lg text-[#201e1b] font-semibold">2. Description of the Service</h2>
          <p>
            Kronos AI provides an intelligent, adaptive personal planning and scheduling platform. Features include conversational daily planning, mathematical constraint-satisfaction scheduling, Csíkszentmihályi immersion focus timers, behavioral habit tracking, and bi-directional Google Calendar and Google Tasks synchronization.
          </p>
        </section>

        {/* Section 3: User Accounts & Responsibilities */}
        <section className="space-y-3 text-xs sm:text-sm text-[#545049] leading-relaxed">
          <h2 className="font-serif text-lg text-[#201e1b] font-semibold">3. User Accounts & Security</h2>
          <p>
            You are responsible for maintaining the confidentiality of your authentication credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access to your account.
          </p>
        </section>

        {/* Section 4: Third-Party Integrations */}
        <section className="space-y-3 text-xs sm:text-sm text-[#545049] leading-relaxed">
          <h2 className="font-serif text-lg text-[#201e1b] font-semibold">4. Google Integrations & External Services</h2>
          <p>
            When connecting your Google account for Calendar and Tasks synchronization, you grant Kronos AI permission to access Google Calendar API v3 and Google Tasks API strictly in accordance with our{" "}
            <Link href="/privacy" className="underline font-medium text-[#201e1b]">
              Privacy Policy
            </Link>{" "}
            and Google&apos;s API Services User Data Policy. You may revoke this access at any time through Kronos or your Google Account settings.
          </p>
        </section>

        {/* Section 5: Acceptable Use */}
        <section className="space-y-3 text-xs sm:text-sm text-[#545049] leading-relaxed">
          <h2 className="font-serif text-lg text-[#201e1b] font-semibold">5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Interfere with, disrupt, or overburden the infrastructure or servers of the Service.</li>
            <li>Attempt to bypass authentication, reverse engineer, or decompile any part of the platform.</li>
            <li>Use the Service for any unlawful, harassing, or fraudulent purpose.</li>
          </ul>
        </section>

        {/* Section 6: Limitation of Liability */}
        <section className="space-y-3 text-xs sm:text-sm text-[#545049] leading-relaxed">
          <h2 className="font-serif text-lg text-[#201e1b] font-semibold">6. Disclaimer of Warranties & Limitation of Liability</h2>
          <p>
            The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. While our constraint solver strictly enforces mathematical collision prevention and curfew boundaries, Kronos AI does not warrant that your schedule will be error-free or uninterrupted. You remain solely responsible for your real-world appointments and academic deadlines.
          </p>
        </section>

        {/* Section 7: Contact */}
        <section className="space-y-3 text-xs sm:text-sm text-[#545049] leading-relaxed border-t border-[#e8e2d5] pt-5">
          <h2 className="font-serif text-lg text-[#201e1b] font-semibold">7. Contact</h2>
          <p>
            For questions regarding these Terms of Service, contact:
          </p>
          <p className="font-mono text-xs bg-[#f2eee6] p-3 rounded-xl border border-[#e4ded2] text-[#201e1b] inline-block">
            Email: iamkolakiprajwal@gmail.com
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-[#8a8479] border-t border-[#e8e2d5] px-4 space-y-1">
        <p>Kronos AI • Notebook-Inspired Adaptive Personal Time Management</p>
        <div className="flex items-center justify-center gap-4 text-[11px]">
          <Link href="/privacy" className="underline hover:text-[#201e1b]">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="underline hover:text-[#201e1b]">Terms of Service</Link>
          <span>•</span>
          <Link href="/login" className="underline hover:text-[#201e1b]">Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
