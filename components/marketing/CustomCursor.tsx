"use client";

import { useEffect, useRef, useCallback } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const updateMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      const mouse = mouseRef.current;
      const cursor = cursorRef.current;
      if (!cursor) return;

      // Ease cursor movement
      cursorPosRef.current.x += (mouse.x - cursorPosRef.current.x) * 0.15;
      cursorPosRef.current.y += (mouse.y - cursorPosRef.current.y) * 0.15;

      cursor.style.left = `${cursorPosRef.current.x - 10}px`;
      cursor.style.top = `${cursorPosRef.current.y - 10}px`;

      rafRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", updateMouse);
    rafRef.current = requestAnimationFrame(animate);

    // Context-aware cursor morphing
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!cursor) return;

      const isInteractive =
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.closest("input") ||
        target.closest("textarea");

      if (isInteractive) {
        cursor.classList.add("hover-mode");
        cursor.classList.remove("text-mode");
      } else if (target.closest("h1, h2, h3, h4, h5, h6, p, span, li, a")) {
        cursor.classList.add("text-mode");
        cursor.classList.remove("hover-mode");
      } else {
        cursor.classList.remove("text-mode", "hover-mode");
      }
    };

    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      document.removeEventListener("mousemove", updateMouse);
      document.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="custom-cursor fixed top-0 left-0 z-[99999] pointer-events-none"
      aria-hidden="true"
    />
  );
}