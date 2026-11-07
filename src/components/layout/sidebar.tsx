"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Sparkles,
  Sun,
  TrendingUp,
  Settings,
  GraduationCap,
  Briefcase,
  Compass,
  Clock,
  X,
  ChevronRight,
  RotateCcw,
  Plus,
  LogOut,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { useAuth } from "@/context/auth-context";
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
  const router = useRouter();
  const { role, setRole, profile, resetDemoData, openQuickTask } = useDemo();
  const { signOut } = useAuth();

  return (
    <aside className="hidden md:flex md:w-20 lg:w-64 border-r border-[#e8e2d5] bg-[#fbf9f5] flex-col h-screen sticky top-0 select-none transition-all duration-200 shrink-0">
      {/* Brand Header */}
      <div className="p-4 lg:p-6 border-b border-[#e8e2d5] flex items-center justify-center lg:justify-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#201e1b] text-[#f8f6f0] flex items-center justify-center shadow-2xs shrink-0">
          <Clock className="w-4 h-4 text-[#e8decb]" />
        </div>
        <div className="hidden lg:block min-w-0">
          <span className="font-serif text-xl font-normal text-[#201e1b] tracking-tight flex items-center gap-2">
            Kronos
            <span className="text-[9px] uppercase font-sans font-semibold tracking-wider px-1.5 py-0.5 rounded-sm bg-[#f2eee6] text-[#687050] border border-[#e4ded2]">
              Planner
            </span>
          </span>
          <p className="text-[11px] text-[#8a8479] font-sans truncate">Adaptive Personal Time</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2.5 lg:px-3.5 py-4 space-y-1.5 overflow-y-auto">
        <div className="hidden lg:block text-[10px] font-semibold uppercase tracking-wider text-[#8a8479] px-3 mb-2">
          Workspaces
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
                "flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2 rounded-xl text-xs font-medium transition-all group",
                isActive
                  ? "bg-[#201e1b] text-[#f8f6f0] shadow-2xs font-semibold"
                  : "text-[#545049] hover:text-[#201e1b] hover:bg-[#f2eee6]"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors shrink-0",
                  isActive ? "text-[#e8decb]" : "text-[#8a8479] group-hover:text-[#201e1b]"
                )}
              />
              <span className="hidden lg:inline flex-1">{item.name}</span>
              {item.badge && !isActive && (
                <span className="hidden lg:inline text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#f2eee6] text-[#8a8479] font-medium">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-[#e8e2d5]">
          <Link
            href="/onboarding"
            title="Launch Onboarding Wizard"
            className="flex items-center justify-center lg:justify-start gap-2.5 px-2 lg:px-3 py-2 rounded-xl text-xs font-medium text-[#545049] hover:text-[#201e1b] hover:bg-[#f2eee6] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#b37e2a] shrink-0" />
            <span className="hidden lg:inline">Guided Onboarding</span>
          </Link>
        </div>
      </nav>

      {/* User Footer Profile & Settings */}
      <div className="p-3 lg:p-3.5 border-t border-[#e8e2d5] bg-[#f8f6f0] space-y-2">
        <Link
          href="/profile"
          className="flex items-center justify-center lg:justify-between gap-3 p-1.5 -m-1.5 rounded-xl hover:bg-[#eeeae0] transition-colors group"
          title="Profile & Settings"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover border border-[#d5cdbd] shrink-0"
            />
            <div className="hidden lg:block min-w-0">
              <p className="text-xs font-semibold text-[#201e1b] truncate group-hover:text-[#b85437]">
                {profile.name}
              </p>
              <p className="text-[11px] text-[#8a8479] truncate">{profile.headline}</p>
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-[#8a8479] group-hover:text-[#201e1b] hidden lg:block shrink-0" />
        </Link>

        <div className="hidden lg:flex items-center justify-between gap-2 pt-1 border-t border-[#e8e2d5]/60 text-[10px]">
          <Link
            href="/profile"
            className="flex items-center gap-1 text-[#8a8479] hover:text-[#201e1b] transition-colors cursor-pointer"
            title="Account Preferences"
          >
            <Settings className="w-3 h-3" />
            <span>Settings</span>
          </Link>

          <button
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            className="flex items-center gap-1 text-[#8a8479] hover:text-[#b85437] transition-colors cursor-pointer"
            title="Sign out of Kronos"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>
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
  const router = useRouter();
  const { role, setRole, profile, resetDemoData, openQuickTask } = useDemo();
  const { signOut } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-in fade-in-50 duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#201e1b]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Card */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-[#fbf9f5] border-r border-[#e8e2d5] shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#e8e2d5] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#201e1b] text-[#f8f6f0] flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4 text-[#e8decb]" />
            </div>
            <div>
              <span className="font-serif text-lg text-[#201e1b]">Kronos</span>
              <p className="text-[10px] text-[#8a8479]">Personal Planner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8a8479] hover:text-[#201e1b] hover:bg-[#f2eee6]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <Link
          href="/profile"
          onClick={onClose}
          className="p-4 bg-white border-b border-[#e8e2d5] flex items-center gap-3 hover:bg-[#f8f6f0] transition-colors"
        >
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-10 h-10 rounded-full object-cover border border-[#d5cdbd]"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#201e1b] truncate">{profile.name}</p>
            <p className="text-[11px] text-[#8a8479] truncate">{profile.institutionOrCompany}</p>
          </div>
          <Settings className="w-4 h-4 text-[#8a8479]" />
        </Link>

        {/* Quick Action: New Task */}
        <div className="p-3 border-b border-[#e8e2d5]">
          <button
            onClick={() => {
              onClose();
              openQuickTask();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#e8decb]" />
            <span>New Task</span>
          </button>
        </div>

        {/* Workspaces List in Drawer */}
        <div className="p-3 border-b border-[#e8e2d5] space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8479] px-2 block mb-1">
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
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                  isActive
                    ? "bg-[#201e1b] text-[#f8f6f0] shadow-2xs font-semibold"
                    : "text-[#545049] hover:bg-[#f2eee6]"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-[#e8decb]" : "text-[#8a8479]")} />
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
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#e8e2d5] text-xs font-medium text-[#201e1b] hover:bg-[#f8f6f0] transition-colors"
          >
            <div className="flex items-center gap-2 text-[#545049]">
              <Sparkles className="w-4 h-4 text-[#b37e2a]" />
              <span>Run Onboarding Wizard</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8a8479]" />
          </Link>

          <button
            onClick={async () => {
              onClose();
              await signOut();
              router.push("/login");
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#e8e2d5] text-xs font-medium text-[#b85437] hover:bg-[#faece7] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-[#b85437]" />
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
