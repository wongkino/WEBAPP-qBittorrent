"use client";

import { EmptyState } from "@/components/state/EmptyState";
import { useI18n } from "@/components/ui/I18nProvider";
import { SpinnerIcon } from "@/components/ui/icons";

type Props = {
  label?: string;
};

export function LoadingState({ label }: Props) {
  const { t } = useI18n();
  return (
    <EmptyState
      role="status"
      icon={
        <span className="loading-spinner" aria-hidden>
          <SpinnerIcon size={22} />
        </span>
      }
      title={label ?? t("app.loading")}
      hint={t("app.loadingHint")}
    />
  );
}
