"use client";

import { useEffect, useState } from "react";
import { LanguageToggle } from "@/components/settings/LanguageToggle";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { useI18n } from "@/components/ui/I18nProvider";

type Mode = "oidc" | "password" | "setup";

const ERROR_KEYS = {
  denied: "auth.errorDenied",
  failed: "auth.errorFailed",
  forbidden: "auth.errorForbidden",
  unconfigured: "auth.errorUnconfigured",
} as const;

export function LoginScreen({
  mode,
  onSuccess,
}: {
  mode: Mode;
  onSuccess?: () => void;
}) {
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

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
            {mode === "setup"
              ? t("auth.setupHint")
              : mode === "password"
                ? t("auth.passwordHint")
                : t("auth.loginHint")}
          </p>
          {errorKey ? (
            <p className="login__error" role="alert">
              {t(errorKey)}
            </p>
          ) : null}
          {mode === "oidc" ? (
            <a className="btn btn--primary login__action" href="/api/auth/login">
              {t("auth.loginAction")}
            </a>
          ) : null}
          {mode === "password" ? (
            <form
              className="login__form"
              onSubmit={(event) => {
                event.preventDefault();
                if (busy) return;
                setBusy(true);
                setError(null);
                void fetch("/api/auth/password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ username, password }),
                })
                  .then((res) => {
                    if (!res.ok) {
                      setError("password");
                      setBusy(false);
                      return;
                    }
                    onSuccess?.();
                  })
                  .catch(() => {
                    setError("password");
                    setBusy(false);
                  });
              }}
            >
              <label className="login__field">
                <span>{t("auth.username")}</span>
                <input
                  className="input"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </label>
              <label className="login__field">
                <span>{t("auth.password")}</span>
                <input
                  className="input"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              {error === "password" ? (
                <p className="login__error" role="alert">
                  {t("auth.passwordFailed")}
                </p>
              ) : null}
              <button
                type="submit"
                className="btn btn--primary login__action"
                disabled={busy}
              >
                {t("auth.passwordSubmit")}
              </button>
            </form>
          ) : null}
        </div>
      </main>
    </>
  );
}
