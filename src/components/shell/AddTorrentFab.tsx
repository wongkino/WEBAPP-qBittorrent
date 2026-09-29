"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AddIcon } from "@/components/ui/icons";
import { useI18n } from "@/components/ui/I18nProvider";
import {
  readFabPosition,
  writeFabPosition,
  type FabFraction,
} from "@/lib/ui/fab-position";

const DRAG_PX = 10;
const PAD = 12;

type Box = { minX: number; minY: number; maxX: number; maxY: number };
type Point = { x: number; y: number };
type Insets = { top: number; right: number; bottom: number; left: number };

const ZERO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

function readSafeInsets(): Insets {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)";
  document.body.appendChild(probe);
  const style = getComputedStyle(probe);
  const insets = {
    top: parseFloat(style.paddingTop) || 0,
    right: parseFloat(style.paddingRight) || 0,
    bottom: parseFloat(style.paddingBottom) || 0,
    left: parseFloat(style.paddingLeft) || 0,
  };
  probe.remove();
  return insets;
}

function dragBox(el: HTMLElement, insets: Insets): Box {
  const width = el.offsetWidth || 56;
  const height = el.offsetHeight || 56;
  const tab = document.querySelector(".app-tab-bar");
  const limitBottom = tab
    ? tab.getBoundingClientRect().top
    : window.innerHeight - Math.max(PAD, insets.bottom);
  const minX = Math.max(PAD, insets.left);
  const minY = Math.max(PAD, insets.top);
  return {
    minX,
    minY,
    maxX: Math.max(minX, window.innerWidth - width - Math.max(PAD, insets.right)),
    maxY: Math.max(minY, limitBottom - height - PAD),
  };
}

function clampPoint(x: number, y: number, box: Box): Point {
  return {
    x: Math.min(box.maxX, Math.max(box.minX, x)),
    y: Math.min(box.maxY, Math.max(box.minY, y)),
  };
}

function toFraction(point: Point, box: Box): FabFraction {
  const spanX = box.maxX - box.minX;
  const spanY = box.maxY - box.minY;
  return {
    x: spanX > 0 ? (point.x - box.minX) / spanX : 1,
    y: spanY > 0 ? (point.y - box.minY) / spanY : 1,
  };
}

function fromFraction(fraction: FabFraction, box: Box): Point {
  return {
    x: box.minX + fraction.x * (box.maxX - box.minX),
    y: box.minY + fraction.y * (box.maxY - box.minY),
  };
}

export function AddTorrentFab({ onOpen }: { onOpen: () => void }) {
  const { t } = useI18n();
  const ref = useRef<HTMLButtonElement>(null);
  const fraction = useRef<FabFraction | null>(null);
  const pointRef = useRef<Point | null>(null);
  const insets = useRef<Insets>(ZERO_INSETS);
  const drag = useRef<{
    id: number;
    sx: number;
    sy: number;
    ox: number;
    oy: number;
    box: Box;
  } | null>(null);
  const moved = useRef(false);
  const [point, setPoint] = useState<Point | null>(null);
  const [dragging, setDragging] = useState(false);

  const applyFraction = useCallback((next: FabFraction | null) => {
    const el = ref.current;
    if (!el || !next) return;
    const placed = fromFraction(next, dragBox(el, insets.current));
    pointRef.current = placed;
    setPoint(placed);
  }, []);

  useLayoutEffect(() => {
    insets.current = readSafeInsets();
    const stored = readFabPosition();
    fraction.current = stored;
    applyFraction(stored);
    const onResize = () => {
      insets.current = readSafeInsets();
      applyFraction(fraction.current);
    };
    window.addEventListener("resize", onResize);
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      viewport?.removeEventListener("resize", onResize);
    };
  }, [applyFraction]);

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    drag.current = {
      id: event.pointerId,
      sx: event.clientX,
      sy: event.clientY,
      ox: rect.left,
      oy: rect.top,
      box: dragBox(el, insets.current),
    };
    moved.current = false;
    try {
      el.setPointerCapture(event.pointerId);
    } catch {
      /* 指標已結束時略過 */
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || event.pointerId !== current.id) return;
    const dx = event.clientX - current.sx;
    const dy = event.clientY - current.sy;
    if (!moved.current && dx * dx + dy * dy < DRAG_PX * DRAG_PX) return;
    moved.current = true;
    const next = clampPoint(
      current.ox + dx,
      current.oy + dy,
      current.box
    );
    pointRef.current = next;
    setDragging(true);
    setPoint(next);
  }

  function finishDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || event.pointerId !== current.id) return;
    drag.current = null;
    setDragging(false);
    if (!moved.current || !pointRef.current || !ref.current) return;
    const next = toFraction(
      pointRef.current,
      dragBox(ref.current, insets.current)
    );
    fraction.current = next;
    writeFabPosition(next);
  }

  return (
    <button
      ref={ref}
      type="button"
      className={`fab${point ? " fab--placed" : ""}${
        dragging ? " fab--dragging" : ""
      }`}
      style={point ? { left: point.x, top: point.y } : undefined}
      aria-label={t("add.fab")}
      title={t("add.fab")}
      draggable={false}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onLostPointerCapture={finishDrag}
      onContextMenu={(event) => event.preventDefault()}
      onClick={() => {
        if (moved.current) {
          moved.current = false;
          return;
        }
        onOpen();
      }}
    >
      <AddIcon size={24} />
    </button>
  );
}
