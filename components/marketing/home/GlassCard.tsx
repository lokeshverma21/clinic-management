"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glowColor?: string;
  padding?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const paddingMap = {
  sm: "p-4",
  md: "p-6 md:p-8",
  lg: "p-8 md:p-10 lg:p-12",
};

export default function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  glowColor = "rgba(13,79,79,0.15)",
  padding = "md",
  onClick,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        hover && "hover:shadow-xl hover:shadow-shadow-blue/5",
        glow && "hover:shadow-[0_0_40px_var(--glow-color)]",
        paddingMap[padding],
        onClick && "cursor-pointer",
        className
      )}
      style={{ "--glow-color": glowColor } as React.CSSProperties}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
}