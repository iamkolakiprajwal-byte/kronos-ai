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
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { name: "Home", href: "/home", icon: CalendarDays },
  { name: "Plan", href: "/plan", icon: CheckSquare },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Habits", href: "/habits", icon: Sparkles },
  { name: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fdfcf9]/95 backdrop-blur-md border-t border-[#e6e3da] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg select-none"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href === "/home" && pathname === "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative min-h-[48px] min-w-[54px]",
                isActive
                  ? "text-slate-900 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-colors",
                  isActive ? "bg-amber-100 text-slate-950" : "text-slate-400"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 font-medium">
                {item.name}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-slate-900 absolute bottom-1" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
