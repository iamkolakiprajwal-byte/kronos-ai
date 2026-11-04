"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Sparkles,
  Sun,
  TrendingUp,
  User,
  Settings,
  GraduationCap,
  Briefcase,
  Compass,
  Clock,
  X,
  ChevronRight,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export const navItems: NavItem[] = [
  { name: "Home", href: "/home", icon: CalendarDays },
  { name: "AI", href: "/ai", icon: Sparkles, badge: "Assistant" },
  { name: "My Day", href: "/my-day", icon: Sun },
  { name: "Growth", href: "/growth", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role, setRole, profile } = useDemo();

  return (
    <aside className="hidden md:flex md:w-20 lg:w-64 border-r border-[#e6e3da] bg-[#fbfaf8] flex-col h-screen sticky top-0 select-none transition-all duration-200 shrink-0">
      {/* Brand Header */}
      <div className="p-4 lg:p-6 border-b border-[#e6e3da] flex items-center justify-center lg:justify-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-100 flex items-center justify-center shadow-xs shrink-0">
          <Clock className="w-5 h-5 text-amber-200" />
        </div>
        <div className="hidden lg:block min-w-0">
          <span className="font-serif font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
            Kronos AI
            <span className="text-[10px] uppercase font-sans font-semibold tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-200">
              Demo
            </span>
          </span>
          <p className="text-xs text-slate-500 font-sans truncate">Intelligent Time Planner</p>
        </div>
      </div>

      {/* Role / Persona Switcher */}
      <div className="px-3 lg:px-5 py-3 bg-amber-50/70 border-b border-amber-200/60">
        <div className="hidden lg:flex text-[11px] font-semibold uppercase tracking-wider text-amber-900/80 mb-1.5 items-center justify-between">
          <span>Active Persona</span>
          <span className="text-[10px] text-amber-700 font-normal">3 Tracks</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 p-1 bg-amber-100/60 rounded-lg border border-amber-200/60">
          <button
            onClick={() => setRole("student")}
            title="Student Track (Aria Chen)"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-1 rounded-md text-[10px] font-medium transition-all",
              role === "student"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-amber-900/70 hover:text-slate-900"
            )}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600 mb-0.5" />
            <span className="hidden lg:inline">Student</span>
          </button>
          <button
            onClick={() => setRole("professional")}
            title="Professional Track (Marcus Reed)"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-1 rounded-md text-[10px] font-medium transition-all",
              role === "professional"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-amber-900/70 hover:text-slate-900"
            )}
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-600 mb-0.5" />
            <span className="hidden lg:inline">Pro</span>
          </button>
          <button
            onClick={() => setRole("both")}
            title="Dual Track (Elena Rostova)"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-1 rounded-md text-[10px] font-medium transition-all",
              role === "both"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-amber-900/70 hover:text-slate-900"
            )}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
            <span className="hidden lg:inline">Both</span>
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2.5 lg:px-4 py-4 space-y-1 overflow-y-auto">
        <div className="hidden lg:block text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/home" && pathname === "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              className={cn(
                "flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors group",
                isActive
                  ? "bg-slate-900 text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-[#f0ede6]"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors shrink-0",
                  isActive ? "text-amber-300" : "text-slate-400 group-hover:text-slate-700"
                )}
              />
              <span className="hidden lg:inline flex-1">{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-[#e6e3da]">
          <Link
            href="/onboarding"
            title="Launch Onboarding Flow"
            className="flex items-center justify-center lg:justify-start gap-2.5 px-2 lg:px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="hidden lg:inline">Launch Onboarding</span>
          </Link>
        </div>
      </nav>

      {/* User Footer Profile & Settings */}
      <div className="p-3 lg:p-4 border-t border-[#e6e3da] bg-[#f8f6f0]">
        <Link
          href="/profile"
          className="flex items-center justify-center lg:justify-between gap-3 p-1.5 -m-1.5 rounded-xl hover:bg-[#ede9df] transition-colors group"
          title="Profile & Settings"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover border border-[#d2cebf] shrink-0"
            />
            <div className="hidden lg:block min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-amber-900">{profile.name}</p>
              <p className="text-xs text-slate-500 truncate">{profile.headline}</p>
            </div>
          </div>
          <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-700 hidden lg:block shrink-0" />
        </Link>
      </div>
    </aside>
  );
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { role, setRole, profile } = useDemo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-in fade-in-50 duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Card */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-[#fbfaf8] border-r border-[#e6e3da] shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#e6e3da] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-100 flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <span className="font-serif font-bold text-base text-slate-900">Kronos AI</span>
              <p className="text-[10px] text-slate-500">Personal Planner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <Link
          href="/profile"
          onClick={onClose}
          className="p-4 bg-white border-b border-[#e6e3da] flex items-center gap-3 hover:bg-amber-50/40 transition-colors"
        >
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-10 h-10 rounded-full object-cover border border-[#d2cebf]"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">{profile.name}</p>
            <p className="text-xs text-slate-500 truncate">{profile.institutionOrCompany}</p>
          </div>
          <Settings className="w-4 h-4 text-slate-400" />
        </Link>

        {/* Persona Switcher */}
        <div className="p-4 border-b border-[#e6e3da] bg-amber-50/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-2">
            Switch Demonstration Track:
          </span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-amber-100/70 rounded-xl border border-amber-200">
            <button
              onClick={() => {
                setRole("student");
                onClose();
              }}
              className={cn(
                "py-1.5 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-0.5 transition-all",
                role === "student" ? "bg-white text-slate-900 shadow-xs" : "text-amber-900"
              )}
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Student</span>
            </button>
            <button
              onClick={() => {
                setRole("professional");
                onClose();
              }}
              className={cn(
                "py-1.5 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-0.5 transition-all",
                role === "professional" ? "bg-white text-slate-900 shadow-xs" : "text-amber-900"
              )}
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pro</span>
            </button>
            <button
              onClick={() => {
                setRole("both");
                onClose();
              }}
              className={cn(
                "py-1.5 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-0.5 transition-all",
                role === "both" ? "bg-white text-slate-900 shadow-xs" : "text-amber-900"
              )}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Both</span>
            </button>
          </div>
        </div>

        {/* Workspaces List in Drawer */}
        <div className="p-3 border-b border-[#e6e3da] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
            Workspaces
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/home" && pathname === "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-amber-300" : "text-slate-500")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Links */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <Link
            href="/onboarding"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e6e3da] text-xs font-semibold text-slate-800 hover:bg-amber-50 transition-colors"
          >
            <div className="flex items-center gap-2 text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Run Onboarding Wizard</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
