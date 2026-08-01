"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AddTorrentForm } from "@/components/torrent/AddTorrentForm";
import { useI18n } from "@/components/ui/I18nProvider";
import { InstallBanner } from "@/components/settings/InstallBanner";
import { LanguageToggle } from "@/components/settings/LanguageToggle";
import { ListToolbar } from "@/components/torrent/ListToolbar";
import { LoadingState } from "@/components/state/LoadingState";
import { OfflineState } from "@/components/state/OfflineState";
import { AddIcon } from "@/components/ui/icons";
import { RssPanel } from "@/components/rss/RssPanel";
import { Sheet } from "@/components/ui/Sheet";
import { TabBar, type AppTab } from "@/components/shell/TabBar";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { TorrentList } from "@/components/torrent/TorrentList";
import {
  addTorrentUrl,
  deleteTorrent,
  fetchSnapshot,
  fetchTorrents,
  pauseTorrent,
  resumeTorrent,
  setTorrentCategory,
} from "@/lib/api/client";
import {
  errMessage,
} from "@/lib/api/errors";
import { filterTorrents, isPausedState, type StatusFilter } from "@/lib/ui/format";
import {
  sortTorrents,
  torrentsEqual,
  type SortDir,
  type SortKey,
  type Torrent,
} from "@/lib/core/types";

const POLL_MS_ACTIVE = 6000;
const POLL_MS_IDLE = 15000;
const COMPACT_SCROLL_Y = 56;
const PTR_THRESHOLD = 64;
const TAB_SWIPE_PX = 72;

type SnapshotData = {
  torrents: Torrent[];
  categories: string[];
};

function pruneSelected(prev: Set<string>, hashes: Iterable<string>) {
  if (prev.size === 0) return prev;
  const alive = new Set(hashes);
  const kept = [...prev].filter((hash) => alive.has(hash));
  return kept.length === prev.size ? prev : new Set(kept);
}

function torrentsNeedFastPoll(items: Torrent[]): boolean {
  return items.some(
    (t) =>
      t.dlspeed > 0 ||
      t.upspeed > 0 ||
      (!isPausedState(t.state) && t.progress < 1)
  );
}

export function QbDashboard() {
  const { t, locale } = useI18n();
  const [torrents, setTorrents] = useState<Torrent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [busyHash, setBusyHash] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("added_on");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<AppTab>("downloads");
  const [compact, setCompact] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [ptrPull, setPtrPull] = useState(0);
  const [ptrRefreshing, setPtrRefreshing] = useState(false);
  const [online, setOnline] = useState(true);
  const [tabDir, setTabDir] = useState<"left" | "right">("left");
  const refreshInflight = useRef(false);
  const ptrStartY = useRef<number | null>(null);
  const ptrPulling = useRef(false);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const torrentsRef = useRef(torrents);
  torrentsRef.current = torrents;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const scrollTop = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    scrollTop();
    const raf = requestAnimationFrame(scrollTop);
    const timer = window.setTimeout(scrollTop, 0);

    window.visualViewport?.addEventListener("resize", scrollTop);
    window.addEventListener("pageshow", scrollTop);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.visualViewport?.removeEventListener("resize", scrollTop);
      window.removeEventListener("pageshow", scrollTop);
    };
  }, []);

  useEffect(() => {
    if (booting) return;

    const scrollTop = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    scrollTop();
    const raf = requestAnimationFrame(scrollTop);
    const timer = window.setTimeout(scrollTop, 50);

    window.visualViewport?.addEventListener("resize", scrollTop);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.visualViewport?.removeEventListener("resize", scrollTop);
    };
  }, [booting]);

  useEffect(() => {
    if (booting) return;
    const onScroll = () => setCompact(window.scrollY > COMPACT_SCROLL_Y);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [booting]);

  useEffect(() => {
    const sync = () => {
      const next = navigator.onLine;
      setOnline(next);
      if (next) setListError(null);
    };
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const visibleTorrents = useMemo(
    () =>
      sortTorrents(filterTorrents(torrents, statusFilter), sortKey, sortDir),
    [torrents, statusFilter, sortKey, sortDir]
  );

  const handleError = useCallback(
    (err: unknown, fallbackKey: "app.refreshFailed" | "app.actionFailed") => {
      if (!navigator.onLine) {
        setOnline(false);
        setListError(t("pwa.offlineBanner"));
        return;
      }
      setListError(errMessage(err, t(fallbackKey)));
    },
    [t]
  );
  const handleErrorRef = useRef(handleError);
  handleErrorRef.current = handleError;

  const applySnapshot = useCallback((next: SnapshotData) => {
    setTorrents((prev) =>
      torrentsEqual(prev, next.torrents) ? prev : next.torrents
    );
    setCategories((prev) =>
      prev.length === next.categories.length &&
      prev.every((name, i) => name === next.categories[i])
        ? prev
        : next.categories
    );
    setSelected((prev) =>
      pruneSelected(
        prev,
        next.torrents.map((item) => item.hash)
      )
    );
    setListError(null);
  }, []);

  const refreshTorrents = useCallback(async () => {
    if (refreshInflight.current) return;
    refreshInflight.current = true;
    try {
      const { torrents: next } = await fetchTorrents();
      setTorrents((prev) => (torrentsEqual(prev, next) ? prev : next));
      setSelected((prev) =>
        pruneSelected(
          prev,
          next.map((item) => item.hash)
        )
      );
      setListError(null);
    } finally {
      refreshInflight.current = false;
    }
  }, []);

  const refreshAll = useCallback(
    async () => {
      if (refreshInflight.current) return;
      refreshInflight.current = true;
      try {
        applySnapshot(await fetchSnapshot());
      } finally {
        refreshInflight.current = false;
      }
    },
    [applySnapshot]
  );

  const runRefresh = useCallback(async () => {
    try {
      await refreshAll();
      setOnline(navigator.onLine);
    } catch (err) {
      handleError(err, "app.refreshFailed");
    }
  }, [handleError, refreshAll]);

  function changeTab(next: AppTab, dir?: "left" | "right") {
    setTab((prev) => (prev === next ? prev : next));
    setTabDir(dir ?? (next === "rss" ? "left" : "right"));
    setMoreOpen(false);
    window.scrollTo({ top: 0 });
    setCompact(false);
  }

  useEffect(() => {
    let cancelled = false;
    void refreshAll()
      .catch((err) => {
        if (!cancelled) handleErrorRef.current(err, "app.refreshFailed");
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshAll]);

  useEffect(() => {
    if (booting || tab !== "downloads" || addOpen || moreOpen) return;

    let id: number | null = null;

    const pollMs = () =>
      torrentsNeedFastPoll(torrentsRef.current) ? POLL_MS_ACTIVE : POLL_MS_IDLE;

    let currentMs = pollMs();

    const poll = () => {
      if (document.visibilityState === "hidden") return;
      void refreshTorrents()
        .catch((err) => handleError(err, "app.refreshFailed"))
        .finally(() => {
          const next = pollMs();
          if (next === currentMs || id === null) return;
          currentMs = next;
          window.clearInterval(id);
          id = window.setInterval(poll, currentMs);
        });
    };

    const schedule = () => {
      if (id !== null) window.clearInterval(id);
      currentMs = pollMs();
      id = window.setInterval(poll, currentMs);
    };

    const stop = () => {
      if (id === null) return;
      window.clearInterval(id);
      id = null;
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        stop();
        return;
      }
      poll();
      schedule();
    };

    if (document.visibilityState !== "hidden") schedule();

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [addOpen, booting, handleError, moreOpen, refreshTorrents, tab]);

  async function withBusy(hash: string, action: () => Promise<void>) {
    setBusyHash(hash);
    try {
      await action();
      await refreshTorrents();
    } catch (err) {
      handleError(err, "app.actionFailed");
    } finally {
      setBusyHash(null);
    }
  }

  function toggleSelect(hash: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(hash)) next.delete(hash);
      else next.add(hash);
      return next;
    });
  }

  function onPtrDown(event: ReactPointerEvent<HTMLElement>) {
    swipeStart.current = { x: event.clientX, y: event.clientY };
    if (ptrRefreshing) return;
    if (window.scrollY > 0) return;
    ptrStartY.current = event.clientY;
    ptrPulling.current = true;
  }

  function onPtrMove(event: ReactPointerEvent<HTMLElement>) {
    if (!ptrPulling.current || ptrStartY.current == null) return;
    if (window.scrollY > 0) {
      ptrPulling.current = false;
      setPtrPull(0);
      return;
    }
    setPtrPull(Math.min(Math.max(0, event.clientY - ptrStartY.current) * 0.45, 96));
  }

  async function onPtrUp(event: ReactPointerEvent<HTMLElement>) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (start && !moreOpen && !addOpen) {
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) >= TAB_SWIPE_PX && Math.abs(dx) >= Math.abs(dy) * 1.4) {
        if (dx < 0 && tab === "downloads") changeTab("rss", "left");
        else if (dx > 0 && tab === "rss") changeTab("downloads", "right");
      }
    }

    if (!ptrPulling.current) return;
    ptrPulling.current = false;
    ptrStartY.current = null;
    const shouldRefresh = ptrPull >= PTR_THRESHOLD;
    setPtrPull(0);
    if (!shouldRefresh || ptrRefreshing) return;
    setPtrRefreshing(true);
    await runRefresh();
    setPtrRefreshing(false);
  }

  function resetPointers() {
    ptrPulling.current = false;
    ptrStartY.current = null;
    swipeStart.current = null;
    setPtrPull(0);
  }

  if (booting) {
    return (
      <main className="shell shell--app">
        <header className="header">
          <h1 className="title">qBittorrent</h1>
        </header>
        <LoadingState />
      </main>
    );
  }

  const selectedHashes = [...selected];
  const ptrActive = ptrRefreshing || ptrPull > 8;
  const showOfflineEmpty = !online && torrents.length === 0;

  return (
    <>
      <main
        className="shell shell--app"
        onPointerDown={onPtrDown}
        onPointerMove={onPtrMove}
        onPointerUp={(event) => void onPtrUp(event)}
        onPointerCancel={resetPointers}
      >
        <div
          className={`nav-compact${compact ? " nav-compact--visible" : ""}`}
          aria-hidden={!compact}
        >
          <span className="nav-compact__title">qBittorrent</span>
        </div>

        <InstallBanner />

        {!online && torrents.length > 0 ? (
          <p className="offline-banner" role="status">
            {t("pwa.offlineBanner")}
          </p>
        ) : null}

        <div
          className={`ptr${ptrActive ? " ptr--active" : ""}`}
          style={{ height: ptrRefreshing ? 44 : ptrPull }}
          aria-hidden={!ptrActive}
        >
          <span className="ptr__label">
            {ptrRefreshing
              ? t("app.refreshing")
              : ptrPull >= PTR_THRESHOLD
                ? t("app.refresh")
                : t("app.pullToRefresh")}
          </span>
        </div>

        <header
          className={`header header--large${compact ? " header--faded" : ""}`}
        >
          <h1 className="title">qBittorrent</h1>
        </header>

        {listError && !showOfflineEmpty ? (
          <p className="error">{listError}</p>
        ) : null}

        {showOfflineEmpty ? (
          <OfflineState onRetry={() => void runRefresh()} />
        ) : (
          <div className={`tab-panel tab-panel--${tabDir}`} key={tab}>
            {tab === "rss" ? (
              <RssPanel
                categories={categories}
                onAdded={() => {
                  void refreshTorrents().catch(() => undefined);
                }}
              />
            ) : (
              <>
                <ListToolbar
                  sortKey={sortKey}
                  sortDir={sortDir}
                  statusFilter={statusFilter}
                  selectionMode={selectionMode}
                  selectedCount={selected.size}
                  totalCount={visibleTorrents.length}
                  busy={busyHash !== null}
                  onSortKeyChange={setSortKey}
                  onToggleSortDir={() =>
                    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                  onStatusFilterChange={setStatusFilter}
                  onToggleSelectionMode={() => {
                    setSelectionMode((prev) => !prev);
                    setSelected(new Set());
                  }}
                  onSelectAll={() =>
                    setSelected(
                      new Set(visibleTorrents.map((torrent) => torrent.hash))
                    )
                  }
                  onClearSelection={() => setSelected(new Set())}
                  onBatchPause={() =>
                    void withBusy("*", () => pauseTorrent(selectedHashes))
                  }
                  onBatchResume={() =>
                    void withBusy("*", () =>
                      resumeTorrent(selectedHashes)
                    )
                  }
                  onBatchDelete={(deleteFiles) =>
                    void withBusy("*", async () => {
                      await deleteTorrent(selectedHashes, deleteFiles);
                      setSelected(new Set());
                    })
                  }
                />
                <TorrentList
                  torrents={visibleTorrents}
                  categories={categories}
                  busyHash={busyHash}
                  selected={selected}
                  selectionMode={selectionMode}
                  filterActive={statusFilter !== "all"}
                  onToggleSelect={toggleSelect}
                  onPause={(hash) =>
                    void withBusy(hash, () => pauseTorrent(hash))
                  }
                  onResume={(hash) =>
                    void withBusy(hash, () => resumeTorrent(hash))
                  }
                  onDelete={(hash, deleteFiles) =>
                    void withBusy(hash, () =>
                      deleteTorrent(hash, deleteFiles)
                    )
                  }
                  onCategoryChange={(hash, category) =>
                    void withBusy(hash, () =>
                      setTorrentCategory(hash, category)
                    )
                  }
                />
              </>
            )}
          </div>
        )}
      </main>

      {tab === "downloads" && online ? (
        <button
          type="button"
          className="fab"
          aria-label={t("add.fab")}
          title={t("add.fab")}
          onClick={() => setAddOpen(true)}
        >
          <AddIcon size={24} />
        </button>
      ) : null}

      <TabBar
        tab={tab}
        moreOpen={moreOpen}
        onTabChange={(next) => changeTab(next)}
        onMore={() => setMoreOpen(true)}
      />

      {addOpen ? (
        <Sheet title={t("add.title")} onClose={() => setAddOpen(false)}>
          <AddTorrentForm
            categories={categories}
            onSuccess={() => setAddOpen(false)}
            onSubmit={async (urls, category) => {
              await addTorrentUrl(urls, category || undefined);
              await refreshAll();
            }}
          />
        </Sheet>
      ) : null}

      {moreOpen ? (
        <Sheet title={t("more.title")} onClose={() => setMoreOpen(false)}>
          <div className="settings-group">
            <p className="settings-group__header">{t("more.appearance")}</p>
            <div className="settings-group__card more-sheet__row">
              <ThemeToggle />
              <LanguageToggle placement="right" />
            </div>
          </div>
        </Sheet>
      ) : null}
    </>
  );
}
