import { useEffect } from "react";

export function useTheme(theme: "system" | "light" | "dark") {
  useEffect(() => {
    const apply = () => {
      let resolved = theme;
      if (resolved === "system") {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      document.documentElement.setAttribute("data-theme", resolved);
    };
    apply();

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);
}
