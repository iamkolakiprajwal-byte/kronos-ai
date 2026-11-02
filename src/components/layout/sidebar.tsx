"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  Target,
  Sparkles,
  User,
  GraduationCap,
  Briefcase,
  Compass,
  Clock,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/home", icon: CalendarDays },
  { name: "Plan", href: "/plan", icon: CheckSquare },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Habits", href: "/habits", icon: Sparkles },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role, setRole, profile } = useDemo();

  return (
    <aside className="w-64 border-r border-[#e6e3da] bg-[#fbfaf8] flex flex-col h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#e6e3da] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-100 flex items-center justify-center shadow-xs">
          <Clock className="w-5 h-5 text-amber-200" />
        </div>
        <div>
          <span className="font-serif font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
            Kronos AI
            <span className="text-[10px] uppercase font-sans font-semibold tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-200">
              Demo
            </span>
          </span>
          <p className="text-xs text-slate-500 font-sans">Intelligent Time Planner</p>
        </div>
      </div>

      {/* Role / Persona Switcher for Assignment Review */}
      <div className="px-5 py-3.5 bg-amber-50/70 border-b border-amber-200/60">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-900/80 mb-2 flex items-center justify-between">
          <span>Active Persona</span>
          <span className="text-[10px] text-amber-700 font-normal">Switch anytime</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-amber-100/60 rounded-lg border border-amber-200/60">
          <button
            onClick={() => setRole("student")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
              role === "student"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-amber-900/70 hover:text-slate-900"
            )}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>Student</span>
          </button>
          <button
            onClick={() => setRole("professional")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
              role === "professional"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-amber-900/70 hover:text-slate-900"
            )}
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pro</span>
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/home" && pathname === "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                isActive
                  ? "bg-slate-900 text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-[#f0ede6]"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-amber-300" : "text-slate-400 group-hover:text-slate-700"
                )}
              />
              <span className="flex-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-[#e6e3da] bg-[#f8f6f0]">
        <div className="flex items-center gap-3">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-9 h-9 rounded-full object-cover border border-[#d2cebf]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{profile.name}</p>
            <p className="text-xs text-slate-500 truncate">{profile.headline}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
