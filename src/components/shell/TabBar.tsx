"use client";

import { useI18n } from "@/components/ui/I18nProvider";
import {
  DownloadIcon,
  RssIcon,
} from "@/components/ui/icons";

export type AppTab = "downloads" | "rss";

type Props = {
  tab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

export function TabBar({ tab, onTabChange }: Props) {
  const { t } = useI18n();
  const downloadsActive = tab === "downloads";
  const rssActive = tab === "rss";

  return (
    <nav className="app-tab-bar" aria-label={t("app.nav")}>
      <button
        type="button"
        className={`app-tab-bar__item${downloadsActive ? " is-active" : ""}`}
        onClick={() => onTabChange("downloads")}
        aria-label={t("app.tab.downloads")}
        aria-current={downloadsActive ? "page" : undefined}
      >
        <span className="app-tab-bar__icon" aria-hidden="true">
          <DownloadIcon size={24} filled={downloadsActive} />
        </span>
        <span className="app-tab-bar__label">{t("app.tab.downloads")}</span>
      </button>
      <button
        type="button"
        className={`app-tab-bar__item${rssActive ? " is-active" : ""}`}
        onClick={() => onTabChange("rss")}
        aria-label={t("app.tab.rss")}
        aria-current={rssActive ? "page" : undefined}
      >
        <span className="app-tab-bar__icon" aria-hidden="true">
          <RssIcon size={24} filled={rssActive} />
        </span>
        <span className="app-tab-bar__label">{t("app.tab.rss")}</span>
      </button>
    </nav>
  );
}
