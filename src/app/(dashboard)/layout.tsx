"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { QuickTaskModal } from "@/components/dashboard/quick-task-modal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#faf9f6]">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenQuickTask={() => setIsQuickTaskOpen(true)} />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Quick Task Modal */}
      <QuickTaskModal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
      />
    </div>
  );
}
