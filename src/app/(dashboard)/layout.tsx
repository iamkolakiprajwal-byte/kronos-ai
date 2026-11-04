"use client";

import React, { useState } from "react";
import { Sidebar, MobileDrawer } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { QuickTaskModal } from "@/components/dashboard/quick-task-modal";
import { useWorkspaceSwipe } from "@/hooks/use-workspace-swipe";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const { workspaces, activeIndex } = useWorkspaceSwipe();

  return (
    <div className="flex min-h-screen bg-[#faf9f6]">
      {/* Desktop / Tablet Sidebar */}
      <Sidebar />

      {/* Mobile Drawer (Slide out on phone) */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenQuickTask={() => setIsQuickTaskOpen(true)}
          onToggleMobileNav={() => setIsMobileDrawerOpen(true)}
        />

        {/* Mobile Workspace Swipe Indicator Bar */}
        <div className="md:hidden px-4 py-1.5 flex items-center justify-between border-b border-[#e6e3da]/60 bg-[#fdfcf9]/60 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">
            {workspaces[activeIndex]?.name}
            <span className="text-[10px] text-slate-400 font-normal ml-1.5">
              • {workspaces[activeIndex]?.subtitle}
            </span>
          </span>
          <div className="flex items-center gap-1.5">
            {workspaces.map((w, idx) => (
              <span
                key={w.name}
                className={`transition-all duration-300 rounded-full ${
                  idx === activeIndex
                    ? "w-4 h-1.5 bg-slate-900"
                    : "w-1.5 h-1.5 bg-[#d2cebf]"
                }`}
                title={w.name}
              />
            ))}
          </div>
        </div>

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Fixed Bottom Navigation on Mobile */}
      <BottomNav />

      {/* Quick Task Modal */}
      <QuickTaskModal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
      />
    </div>
  );
}
