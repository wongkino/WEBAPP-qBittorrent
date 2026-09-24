"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/ui/pwa";

/** 正式環境註冊 Service Worker（Chrome／Android 可安裝條件） */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    void registerServiceWorker();
  }, []);

  return null;
}
