"use client";

import { useEffect, useState } from "react";
import { LanguageToggle } from "@/components/settings/LanguageToggle";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { useI18n } from "@/components/ui/I18nProvider";

type Mode = "ready" | "setup";

const ERROR_KEYS = {
  denied: "auth.errorDenied",
  failed: "auth.errorFailed",
  forbidden: "auth.errorForbidden",
  unconfigured: "auth.errorUnconfigured",
} as const;

export function LoginScreen({ mode }: { mode: Mode }) {
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("auth_error");
    if (!code) return;
    setError(code);
    const url = new URL(window.location.href);
    url.searchParams.delete("auth_error");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(null, "", next);
  }, []);

  const errorKey =
    error && error in ERROR_KEYS
      ? ERROR_KEYS[error as keyof typeof ERROR_KEYS]
      : error
        ? "auth.errorFailed"
        : null;

  return (
    <>
      <div className="header-tools">
        <ThemeToggle className="btn btn--icon btn--sm" />
        <LanguageToggle
          className="btn btn--icon btn--sm btn--lang"
          placement="end"
        />
      </div>
      <main className="login">
        <div className="login__card">
          <h1 className="title">
            <img
              src="/icon.svg"
              alt=""
              width={40}
              height={40}
              className="title__icon"
            />
            qBittorrent
          </h1>
          <p className="login__hint">
            {mode === "setup" ? t("auth.setupHint") : t("auth.loginHint")}
          </p>
          {errorKey ? (
            <p className="login__error" role="alert">
              {t(errorKey)}
            </p>
          ) : null}
          {mode === "ready" ? (
            <a className="btn btn--primary login__action" href="/api/auth/login">
              {t("auth.loginAction")}
            </a>
          ) : null}
        </div>
      </main>
    </>
  );
}
