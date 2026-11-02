import type { Metadata } from "next";
import "./globals.css";
import { DemoProvider } from "@/context/demo-context";

export const metadata: Metadata = {
  title: "Kronos AI — Intelligent Personal Planning & Time Management",
  description:
    "A calm, notebook-inspired AI personal planning assistant that understands your responsibilities, habits, routines, and goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#faf9f6] text-slate-900 selection:bg-amber-200">
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
