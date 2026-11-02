"use client";

import React, { useState } from "react";
import { Sidebar, MobileDrawer } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { QuickTaskModal } from "@/components/dashboard/quick-task-modal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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
