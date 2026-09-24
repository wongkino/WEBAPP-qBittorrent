export const INSTALL_DISMISS_KEY = "tg-dl-install-dismissed";

/** 正式環境註冊 `/sw.js`（Chrome 可安裝條件需要有 fetch handler 的 SW） */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

export function isStandaloneWebApp(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function isInstallDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(INSTALL_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissInstallBanner(): void {
  try {
    localStorage.setItem(INSTALL_DISMISS_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function shouldOfferInstall(): boolean {
  if (typeof window === "undefined") return false;
  if (isStandaloneWebApp()) return false;
  if (isInstallDismissed()) return false;
  return true;
}

export function isAppleTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
