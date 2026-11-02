"use client";

import React, { useState } from "react";
import { Bell, Plus, Calendar, Sparkles, Check, X, ShieldCheck } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenQuickTask?: () => void;
  onToggleMobileNav?: () => void;
}

export function Header({ onOpenQuickTask }: HeaderProps) {
  const { profile, notifications, markNotificationRead } = useDemo();
  const [showNotifications, setShowNotifications] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");
  const [todayFormatted, setTodayFormatted] = useState("Monday, Nov 2, 2026");

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const formatted = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
    setTodayFormatted(formatted);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="border-b border-[#e6e3da] bg-[#fdfcf9]/80 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
      {/* Left: Greeting & Current Date */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-xl font-bold text-slate-900 tracking-tight">
            {greeting}, {profile.name.split(" ")[0]}
          </h1>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI Scheduled
          </span>
        </div>
        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{todayFormatted}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-medium">{profile.institutionOrCompany}</span>
        </p>
      </div>

      {/* Right: Actions, Notifications, & Quick Task */}
      <div className="flex items-center gap-3">
        {/* Quick Task Button */}
        {onOpenQuickTask && (
          <button
            onClick={onOpenQuickTask}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>New Task</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-lg border border-[#e6e3da] bg-white hover:bg-[#f5f3ec] text-slate-700 flex items-center justify-center relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#e6e3da] rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
              <div className="p-3.5 border-b border-[#e6e3da] bg-[#fbfaf7] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                  <p className="text-[11px] text-slate-500">Smart reminders & scheduling alerts</p>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#f0ede6]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new notifications right now.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={cn(
                        "p-3.5 text-xs cursor-pointer transition-colors hover:bg-[#fbfaf7]",
                        !n.read ? "bg-amber-50/40" : ""
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Demo Mode Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-200/80 bg-amber-50 text-[11px] font-medium text-amber-900">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Demo Mode (Mock Calendar)</span>
        </div>
      </div>
    </header>
  );
}
