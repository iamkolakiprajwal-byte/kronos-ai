"use client";

import React, { useState } from "react";
import { Sidebar, MobileDrawer } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FloatingActionButton } from "@/components/layout/floating-action-button";
import { QuickTaskModal } from "@/components/dashboard/quick-task-modal";
import { useWorkspaceSwipe } from "@/hooks/use-workspace-swipe";
import { useDemo } from "@/context/demo-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isQuickTaskOpen, openQuickTask, closeQuickTask } = useDemo();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const { workspaces, activeIndex } = useWorkspaceSwipe();

  return (
    <div className="flex min-h-screen bg-[#f7f5f0] text-[#201e1b]">
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
          onOpenQuickTask={openQuickTask}
          onToggleMobileNav={() => setIsMobileDrawerOpen(true)}
        />

        {/* Mobile Workspace Swipe Indicator Bar */}
        <div className="md:hidden px-4 py-1.5 flex items-center justify-between border-b border-[#e8e2d5]/60 bg-[#fbf9f5]/60 text-[10px] text-[#8a8479] gap-2">
          <span className="font-medium text-[#545049] truncate min-w-0">
            {workspaces[activeIndex]?.name}
            <span className="text-[10px] text-[#8a8479] font-normal ml-1.5 hidden xs:inline">
              • {workspaces[activeIndex]?.subtitle}
            </span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {workspaces.map((w, idx) => (
              <span
                key={w.name}
                className={`transition-all duration-300 rounded-full ${
                  idx === activeIndex
                    ? "w-4 h-1.5 bg-[#201e1b]"
                    : "w-1.5 h-1.5 bg-[#d5cdbd]"
                }`}
                title={w.name}
              />
            ))}
          </div>
        </div>

        <main className="flex-1 p-3.5 sm:p-7 md:p-9 pb-28 md:pb-12 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Google Keep style Floating Action Button */}
      <FloatingActionButton />

      {/* Fixed Bottom Navigation on Mobile */}
      <BottomNav />

      {/* Quick Task Modal */}
      <QuickTaskModal
        isOpen={isQuickTaskOpen}
        onClose={closeQuickTask}
      />
    </div>
  );
}
