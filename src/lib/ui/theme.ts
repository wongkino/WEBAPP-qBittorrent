import { PWA_CHROME_BOOT_SNIPPET, syncPwaChrome } from "@/lib/ui/pwa-chrome";

export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "tg-dl-theme";

/** Inline boot script — set data-theme + iOS PWA chrome before paint. */
export const THEME_BOOT_SCRIPT = `(function(){${PWA_CHROME_BOOT_SNIPPET}try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t!=="light"&&t!=="dark"){t="dark"}document.documentElement.setAttribute("data-theme",t);__qbPwaChrome(t)}catch(e){document.documentElement.setAttribute("data-theme","dark");__qbPwaChrome("dark")}})();`;

export function readStoredTheme(): AppTheme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark") return value;
  } catch {
    /* ignore */
  }
  return null;
}

export function resolveInitialTheme(): AppTheme {
  return readStoredTheme() ?? "dark";
}

export function applyTheme(theme: AppTheme) {
  document.documentElement.setAttribute("data-theme", theme);
  syncPwaChrome(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}
