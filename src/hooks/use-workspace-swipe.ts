"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export interface WorkspaceDefinition {
  name: string;
  href: string;
  subtitle: string;
}

export const WORKSPACES: WorkspaceDefinition[] = [
  { name: "Home", href: "/home", subtitle: "Calendar & Overview" },
  { name: "AI", href: "/ai", subtitle: "Conversational Planning" },
  { name: "My Day", href: "/my-day", subtitle: "Execution & Timeline" },
  { name: "Growth", href: "/growth", subtitle: "Habits, Flow & Reset" },
];

export function useWorkspaceSwipe() {
  const router = useRouter();
  const pathname = usePathname();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Do NOT intercept interactive inputs, textareas, buttons, sliders, modals
      if (
        target.closest(
          "input, textarea, select, button, a, [role='slider'], [role='dialog'], .no-swipe, [data-no-swipe]"
        )
      ) {
        touchStartRef.current = null;
        return;
      }

      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      if (e.changedTouches.length !== 1) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartRef.current.x;
      const deltaY = touchEndY - touchStartRef.current.y;
      touchStartRef.current = null;

      // Threshold: at least 60px horizontal, and horizontal movement must clearly dominate vertical
      if (Math.abs(deltaX) < 60) return;
      if (Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;

      const currentIdx = WORKSPACES.findIndex(
        (w) => pathname === w.href || (w.href === "/home" && pathname === "/")
      );
      if (currentIdx === -1) return;

      if (deltaX < 0) {
        // Swiped Left -> Next workspace
        if (currentIdx < WORKSPACES.length - 1) {
          router.push(WORKSPACES[currentIdx + 1].href);
        }
      } else {
        // Swiped Right -> Previous workspace
        if (currentIdx > 0) {
          router.push(WORKSPACES[currentIdx - 1].href);
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pathname, router]);

  const activeIndex = WORKSPACES.findIndex(
    (w) => pathname === w.href || (w.href === "/home" && pathname === "/")
  );

  return {
    workspaces: WORKSPACES,
    activeIndex: activeIndex >= 0 ? activeIndex : 0,
  };
}
