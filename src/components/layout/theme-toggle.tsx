"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const storageKey = "mini-erp-theme";

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(storageKey);
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const isDark = theme === "dark";

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  function updateTheme(nextTheme: "light" | "dark") {
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem(storageKey, nextTheme);
    setTheme(nextTheme);
  }

  return (
    <button
      type="button"
      className="inline-flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-slate-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      onClick={() => updateTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Acik moda gec" : "Koyu moda gec"}
      title={isDark ? "Acik moda gec" : "Koyu moda gec"}
    >
      {isDark ? <Sun className="size-[18px]" aria-hidden /> : <Moon className="size-[18px]" aria-hidden />}
    </button>
  );
}
