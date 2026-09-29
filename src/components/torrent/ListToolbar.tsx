"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { SortDir, SortKey } from "@/lib/core/types";
import { useI18n } from "@/components/ui/I18nProvider";
import {
  BatchDoneIcon,
  BatchOpenIcon,
  ClearIcon,
  DeleteFilesIcon,
  PauseIcon,
  RemoveIcon,
  ResumeIcon,
  SelectAllIcon,
  SortAscIcon,
  SortDescIcon,
} from "@/components/ui/icons";
import {
  STATUS_FILTERS,
  type StatusFilter,
} from "@/lib/ui/format";
import type { MessageKey } from "@/lib/ui/i18n";

const SORT_KEYS: SortKey[] = [
  "added_on",
  "name",
  "progress",
  "dlspeed",
  "upspeed",
  "size",
  "eta",
];

function sortLabelKey(key: SortKey): MessageKey {
  return `sort.${key}` as MessageKey;
}

function filterLabelKey(filter: StatusFilter): MessageKey {
  return `filter.${filter}` as MessageKey;
}

type Props = {
  sortKey: SortKey;
  sortDir: SortDir;
  statusFilter: StatusFilter;
  selectionMode: boolean;
  selectedCount: number;
  totalCount: number;
  busy: boolean;
  onSortPick: (key: SortKey) => void;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onToggleSelectionMode: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBatchPause: () => void;
  onBatchResume: () => void;
  onBatchDelete: (deleteFiles: boolean) => void;
  completedCount: number;
  onRemoveCompleted: () => void;
};

export function ListToolbar({
  sortKey,
  sortDir,
  statusFilter,
  selectionMode,
  selectedCount,
  totalCount,
  busy,
  onSortPick,
  onStatusFilterChange,
  onToggleSelectionMode,
  onSelectAll,
  onClearSelection,
  onBatchPause,
  onBatchResume,
  onBatchDelete,
  completedCount,
  onRemoveCompleted,
}: Props) {
  const { t } = useI18n();
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!sortRef.current?.contains(event.target as Node)) setSortOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSortOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sortOpen]);

  function IconAction({
    label,
    onClick,
    disabled,
    danger,
    primary,
    children,
  }: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
    primary?: boolean;
    children: ReactNode;
  }) {
    return (
      <button
        type="button"
        className={`btn btn--icon btn--sm${primary ? " btn--primary" : ""}${danger ? " btn--danger" : ""}`}
        disabled={disabled}
        aria-label={label}
        title={label}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return (
    <>
      <div className="toolbar toolbar--quiet">
        <button
          type="button"
          className="filter-chip filter-chip--active filter-chip--cycle"
          disabled={busy}
          aria-label={`${t("filter.label")} ${t(filterLabelKey(statusFilter))}`}
          onClick={() => {
            const index = STATUS_FILTERS.indexOf(statusFilter);
            const next =
              STATUS_FILTERS[(index + 1) % STATUS_FILTERS.length] ?? "all";
            onStatusFilterChange(next);
          }}
        >
          {t(filterLabelKey(statusFilter))}
        </button>
        <div className="filter-chips" role="tablist" aria-label={t("filter.label")}>
          {STATUS_FILTERS.map((filter) => {
            const active = statusFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={active}
                className={`filter-chip${active ? " filter-chip--active" : ""}`}
                disabled={busy}
                onClick={() => onStatusFilterChange(filter)}
              >
                {t(filterLabelKey(filter))}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="btn btn--sm toolbar__clear-completed"
          disabled={busy || completedCount === 0}
          onClick={() => {
            if (
              confirm(
                t("completed.confirmRemove", { count: completedCount })
              )
            ) {
              onRemoveCompleted();
            }
          }}
        >
          <RemoveIcon />
          <span>{t("completed.remove")}</span>
        </button>
        <div className="toolbar__options">
          <div className="toolbar__sort" ref={sortRef}>
            <span className="toolbar__sort-label">{t("sort.label")}</span>
            <button
              type="button"
              className="btn btn--sm toolbar__sort-trigger"
              disabled={busy}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              aria-label={`${t("sort.label")} ${t(sortLabelKey(sortKey))} ${
                sortDir === "desc" ? t("sort.desc") : t("sort.asc")
              }`}
              onClick={() => setSortOpen((prev) => !prev)}
            >
              <span>{t(sortLabelKey(sortKey))}</span>
              {sortDir === "desc" ? <SortDescIcon /> : <SortAscIcon />}
            </button>
            {sortOpen ? (
              <ul className="toolbar__sort-menu" role="listbox">
                {SORT_KEYS.map((key) => {
                  const active = key === sortKey;
                  return (
                    <li key={key} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`toolbar__sort-item${
                          active ? " toolbar__sort-item--active" : ""
                        }`}
                        onClick={() => {
                          onSortPick(key);
                          if (key !== sortKey) setSortOpen(false);
                        }}
                      >
                        <span>{t(sortLabelKey(key))}</span>
                        {active ? (
                          sortDir === "desc" ? (
                            <SortDescIcon />
                          ) : (
                            <SortAscIcon />
                          )
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
          <button
            type="button"
            className="btn btn--sm toolbar__option"
            disabled={busy}
            onClick={onToggleSelectionMode}
          >
            {selectionMode ? <BatchDoneIcon /> : <BatchOpenIcon />}
            <span>{selectionMode ? t("batch.done") : t("batch.open")}</span>
          </button>
        </div>
      </div>

      {selectionMode ? (
        <div className="toolbar toolbar--batch">
          <span className="hint">
            {t("batch.selected", {
              selected: selectedCount,
              total: totalCount,
            })}
          </span>
          <div className="toolbar__batch">
            <IconAction
              label={t("batch.selectAll")}
              disabled={busy || totalCount === 0}
              onClick={onSelectAll}
            >
              <SelectAllIcon />
            </IconAction>
            <IconAction
              label={t("batch.clear")}
              disabled={busy || selectedCount === 0}
              onClick={onClearSelection}
            >
              <ClearIcon />
            </IconAction>
            <IconAction
              label={t("batch.pause")}
              disabled={busy || selectedCount === 0}
              onClick={onBatchPause}
            >
              <PauseIcon />
            </IconAction>
            <IconAction
              label={t("batch.resume")}
              disabled={busy || selectedCount === 0}
              primary
              onClick={onBatchResume}
            >
              <ResumeIcon />
            </IconAction>
            <IconAction
              label={t("batch.remove")}
              disabled={busy || selectedCount === 0}
              onClick={() => {
                if (
                  confirm(t("batch.confirmRemove", { count: selectedCount }))
                ) {
                  onBatchDelete(false);
                }
              }}
            >
              <RemoveIcon />
            </IconAction>
            <IconAction
              label={t("batch.deleteFiles")}
              disabled={busy || selectedCount === 0}
              danger
              onClick={() => {
                if (
                  confirm(t("batch.confirmDelete", { count: selectedCount }))
                ) {
                  onBatchDelete(true);
                }
              }}
            >
              <DeleteFilesIcon />
            </IconAction>
            <IconAction
              label={t("batch.done")}
              disabled={busy}
              primary
              onClick={onToggleSelectionMode}
            >
              <BatchDoneIcon />
            </IconAction>
          </div>
        </div>
      ) : null}
    </>
  );
}
