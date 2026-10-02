"use client";

import { useState } from "react";
import { useI18n } from "@/components/ui/I18nProvider";
import { LogoutIcon } from "@/components/ui/icons";

export function LogoutButton() {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      className="btn btn--icon btn--sm"
      aria-label={t("auth.logout")}
      title={t("auth.logout")}
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void fetch("/api/auth/logout", { method: "POST" }).finally(() => {
          window.location.assign("/");
        });
      }}
    >
      <LogoutIcon size={18} />
    </button>
  );
}
