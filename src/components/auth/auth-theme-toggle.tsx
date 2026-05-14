"use client";

import { useEffect } from "react";

export function AuthThemeToggle() {
  useEffect(() => {
    const stored = window.localStorage.getItem("enxx-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enabled = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("enxx-theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="liquid-chip inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-black text-slate-700 transition hover:-translate-y-0.5 dark:text-slate-100 sm:h-11 sm:w-11"
      aria-label="切换深色浅色模式"
      title="切换深色浅色模式"
    >
      ◐
    </button>
  );
}
