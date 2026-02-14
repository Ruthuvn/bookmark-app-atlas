"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sun01Icon,
  Moon02Icon,
  ComputerIcon,
} from "@hugeicons/core-free-icons";

interface FooterProps {
  user?: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
  } | null;
}

function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const options = [
    { value: "light", icon: Sun01Icon, label: "Light theme" },
    { value: "dark", icon: Moon02Icon, label: "Dark theme" },
    { value: "system", icon: ComputerIcon, label: "System theme" },
  ];

  return (
    <div className="inline-flex border border-border overflow-hidden">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          aria-label={option.label}
          className={`px-2 py-1 transition-colors ${
            theme === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <HugeiconsIcon icon={option.icon} className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

export function Footer({ user }: FooterProps) {
  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-350 px-4 sm:px-8 py-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © 2026 DevAtlas. All rights reserved.
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
