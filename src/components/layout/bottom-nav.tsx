"use client";

import React, { useState, useEffect } from "react";
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
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const active = document.activeElement as HTMLElement | null;
        if (
          !active ||
          (active.tagName !== "INPUT" &&
            active.tagName !== "TEXTAREA" &&
            !active.isContentEditable)
        ) {
          setIsKeyboardOpen(false);
        }
      }, 100);
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fbf9f5]/95 backdrop-blur-md border-t border-[#e8e2d5] px-3 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-xs select-none transition-all duration-200 ease-out",
        isKeyboardOpen
          ? "translate-y-full opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100 pointer-events-auto"
      )}
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
                  ? "text-[#201e1b] font-semibold"
                  : "text-[#8a8479] hover:text-[#201e1b]"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-xl transition-all",
                  isActive
                    ? "bg-[#201e1b] text-[#f8f6f0] shadow-2xs scale-105"
                    : "text-[#8a8479] hover:bg-[#f2eee6]"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={cn(
                  "text-[10px] mt-0.5 tracking-tight font-medium",
                  isActive ? "text-[#201e1b] font-semibold" : "text-[#8a8479]"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
