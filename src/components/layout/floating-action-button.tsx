"use client";

import React from "react";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useDemo } from "@/context/demo-context";
import { cn } from "@/lib/utils";

export function FloatingActionButton() {
  const pathname = usePathname();
  const { openQuickTask } = useDemo();

  // On the AI conversation page, the bottom is already occupied by the AI chat composer
  if (pathname === "/ai") {
    return null;
  }

  return (
    <aside
      aria-label="Floating Actions"
      className="fixed bottom-[78px] sm:bottom-8 right-4 sm:right-8 z-40 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
    >
      <button
        onClick={openQuickTask}
        className={cn(
          "group relative flex items-center justify-center gap-2",
          "w-12 h-12 sm:w-14 sm:h-14 rounded-full",
          "bg-[#201e1b] hover:bg-[#322e29] active:bg-[#151412] text-[#f8f6f0]",
          "border border-[#443e37] shadow-lg shadow-black/25 hover:shadow-xl hover:shadow-black/35",
          "transition-all duration-200 ease-out active:scale-95 cursor-pointer"
        )}
        title="Add New Plan Item (Google Keep style)"
        aria-label="Create new plan item"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-[#e8decb] transition-transform duration-300 group-hover:rotate-90" />

        {/* Hover pill on desktop */}
        <span className="hidden sm:group-hover:inline-block absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-[#201e1b] text-[#f8f6f0] text-xs font-medium whitespace-nowrap shadow-md border border-[#3e3933] pointer-events-none transition-all">
          New Task
        </span>
      </button>
    </aside>
  );
}
