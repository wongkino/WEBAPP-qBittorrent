"use client";

import { EmptyState } from "@/components/state/EmptyState";
import { useI18n } from "@/components/ui/I18nProvider";
import { OfflineIcon } from "@/components/ui/icons";

type Props = {
  onRetry?: () => void;
};

export function OfflineState({ onRetry }: Props) {
  const { t } = useI18n();
  return (
    <EmptyState
      icon={<OfflineIcon size={28} />}
      title={t("pwa.offlineTitle")}
      hint={t("pwa.offlineHint")}
      action={
        onRetry ? (
          <button
            type="button"
            className="btn btn--primary empty__action"
            onClick={onRetry}
          >
            {t("app.refresh")}
          </button>
        ) : null
      }
    />
  );
}
