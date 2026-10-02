"use client";

import { useEffect, useState } from "react";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { ServiceWorkerRegister } from "@/components/boot/ServiceWorkerRegister";
import { QbDashboard } from "@/components/shell/QbDashboard";
import { LoadingState } from "@/components/state/LoadingState";
import { I18nProvider } from "@/components/ui/I18nProvider";
import { setUnauthorizedHandler } from "@/lib/api/client";

type AuthStatus = "loading" | "in" | "out" | "setup";

function AuthGate() {
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    setUnauthorizedHandler(() => {
      if (!cancelled) setStatus("out");
    });

    void fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => res.json() as Promise<{ configured?: boolean; user?: unknown }>)
      .then((data) => {
        if (cancelled) return;
        if (!data.configured) setStatus("setup");
        else if (data.user) setStatus("in");
        else setStatus("out");
      })
      .catch(() => {
        if (!cancelled) setStatus("out");
      });

    return () => {
      cancelled = true;
      setUnauthorizedHandler(null);
    };
  }, []);

  if (status === "loading") {
    return (
      <main className="shell shell--app">
        <LoadingState />
      </main>
    );
  }
  if (status === "setup") return <LoginScreen mode="setup" />;
  if (status === "out") return <LoginScreen mode="ready" />;
  return <QbDashboard />;
}

export function WebApp() {
  return (
    <I18nProvider>
      <ServiceWorkerRegister />
      <AuthGate />
    </I18nProvider>
  );
}
