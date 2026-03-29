"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", emoji: "📊", label: "Home" },
  { href: "/log", emoji: "📝", label: "Log" },
  { href: "/history", emoji: "📋", label: "Logs" },
  { href: "/progress", emoji: "📏", label: "Measurements" },
  { href: "/settings", emoji: "⚙️", label: "Settings" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border">
      <div className="max-w-[480px] mx-auto flex">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 min-h-[60px] transition-colors ${
                isActive ? "text-accent" : "text-secondary"
              }`}
            >
              <span className="text-xl leading-none">{tab.emoji}</span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  isActive ? "text-accent" : "text-secondary"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
