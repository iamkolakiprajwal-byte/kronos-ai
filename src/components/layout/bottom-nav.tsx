"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Sparkles,
  Sun,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const primaryNavItems = [
  { name: "Home", href: "/home", icon: CalendarDays },
  { name: "AI", href: "/ai", icon: Sparkles },
  { name: "My Day", href: "/my-day", icon: Sun },
  { name: "Growth", href: "/growth", icon: TrendingUp },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fdfcf9]/95 backdrop-blur-md border-t border-[#e6e3da] px-3 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-lg select-none"
      aria-label="Workspace Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href === "/home" && pathname === "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative min-h-[48px] min-w-[60px]",
                isActive
                  ? "text-slate-950 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-xl transition-all",
                  isActive
                    ? "bg-slate-900 text-amber-300 shadow-xs scale-105"
                    : "text-slate-400 hover:bg-slate-100"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={cn(
                  "text-[10px] mt-0.5 tracking-tight font-medium",
                  isActive ? "text-slate-950 font-bold" : "text-slate-500"
                )}
              >
                {item.name}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-amber-500 absolute bottom-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
