export type FabFraction = { x: number; y: number };

const FAB_POSITION_KEY = "tg-dl-fab-pos";

function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function readFabPosition(): FabFraction | null {
  try {
    const raw = localStorage.getItem(FAB_POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { x?: unknown; y?: unknown };
    if (typeof parsed.x !== "number" || typeof parsed.y !== "number") return null;
    if (!Number.isFinite(parsed.x) || !Number.isFinite(parsed.y)) return null;
    return { x: clampUnit(parsed.x), y: clampUnit(parsed.y) };
  } catch {
    return null;
  }
}

export function writeFabPosition(position: FabFraction) {
  try {
    localStorage.setItem(
      FAB_POSITION_KEY,
      JSON.stringify({
        x: clampUnit(position.x),
        y: clampUnit(position.y),
      })
    );
  } catch {
    /* ignore */
  }
}
