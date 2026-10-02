"use client";

import { useEffect, useRef, useState } from "react";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { ServiceWorkerRegister } from "@/components/boot/ServiceWorkerRegister";
import { QbDashboard } from "@/components/shell/QbDashboard";
import { LoadingState } from "@/components/state/LoadingState";
import { I18nProvider } from "@/components/ui/I18nProvider";
import { setUnauthorizedHandler } from "@/lib/api/client";

type AuthStatus = "loading" | "in" | "oidc" | "password" | "setup";

function AuthGate() {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const modeRef = useRef<"oidc" | "password" | "setup">("oidc");

  useEffect(() => {
    let cancelled = false;
    setUnauthorizedHandler(() => {
      if (!cancelled) {
        setStatus(modeRef.current === "password" ? "password" : "oidc");
      }
    });

    void fetch("/api/auth/session", { cache: "no-store" })
      .then(
        (res) =>
          res.json() as Promise<{
            mode?: "oidc" | "password" | "setup";
            user?: unknown;
          }>
      )
      .then((data) => {
        if (cancelled) return;
        if (data.mode === "password" || data.mode === "setup") {
          modeRef.current = data.mode;
        } else {
          modeRef.current = "oidc";
        }
        if (data.user) setStatus("in");
        else if (data.mode === "password") setStatus("password");
        else if (data.mode === "setup") setStatus("setup");
        else setStatus("oidc");
      })
      .catch(() => {
        if (!cancelled) setStatus("oidc");
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
  if (status === "password") {
    return <LoginScreen mode="password" onSuccess={() => setStatus("in")} />;
  }
  if (status === "oidc") return <LoginScreen mode="oidc" />;
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
