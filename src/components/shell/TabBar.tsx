"use client";

import { useI18n } from "@/components/ui/I18nProvider";
import {
  DownloadIcon,
  EllipsisIcon,
  RssIcon,
} from "@/components/ui/icons";

export type AppTab = "downloads" | "rss";

type Props = {
  tab: AppTab;
  moreOpen: boolean;
  onTabChange: (tab: AppTab) => void;
  onMore: () => void;
};

export function TabBar({ tab, moreOpen, onTabChange, onMore }: Props) {
  const { t } = useI18n();
  const downloadsActive = tab === "downloads" && !moreOpen;
  const rssActive = tab === "rss" && !moreOpen;

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
      <button
        type="button"
        className={`app-tab-bar__item app-tab-bar__item--more${moreOpen ? " is-active" : ""}`}
        onClick={onMore}
        aria-label={t("app.tab.more")}
        aria-expanded={moreOpen}
      >
        <span className="app-tab-bar__icon" aria-hidden="true">
          <EllipsisIcon size={24} filled={moreOpen} />
        </span>
        <span className="app-tab-bar__label">{t("app.tab.more")}</span>
      </button>
    </nav>
  );
}
