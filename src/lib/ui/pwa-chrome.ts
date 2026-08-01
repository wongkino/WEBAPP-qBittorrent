import type { AppTheme } from "@/lib/ui/theme";

/** iOS 狀態列樣式 — 僅在 apple-mobile-web-app-capable=yes 時生效 */
export type IosStatusBarStyle = "default" | "black" | "black-translucent";

export function iosStatusBarStyle(theme: AppTheme): IosStatusBarStyle {
  // default：白底狀態列（日間）
  // black-translucent：沉浸式，內容延伸至狀態列下（夜間）
  return theme === "light" ? "default" : "black-translucent";
}

export function pwaThemeColor(theme: AppTheme): string {
  return theme === "light" ? "#f5f5f7" : "#000000";
}

/** 同步 iOS 主畫面 PWA 的 theme-color 與狀態列（切換日/夜時呼叫） */
export function syncPwaChrome(theme: AppTheme): void {
  if (typeof document === "undefined") return;

  const color = pwaThemeColor(theme);
  const statusBar = iosStatusBarStyle(theme);

  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((node) => node.setAttribute("content", color));

  const status = document.querySelector(
    'meta[name="apple-mobile-web-app-status-bar-style"]'
  );
  if (status) status.setAttribute("content", statusBar);
}

/** Boot IIFE 片段：在 ThemeBootScript 內與 data-theme 一併套用 */
export const PWA_CHROME_BOOT_SNIPPET = `
function __qbPwaChrome(t){
  var c=t==="light"?"#f5f5f7":"#000000";
  var b=t==="light"?"default":"black-translucent";
  document.querySelectorAll('meta[name="theme-color"]').forEach(function(n){n.setAttribute("content",c)});
  var s=document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if(s)s.setAttribute("content",b);
}`;
