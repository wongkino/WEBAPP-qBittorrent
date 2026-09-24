import type { ReactNode } from "react";

type IconProps = {
  size?: number;
  filled?: boolean;
  className?: string;
};

function Icon({
  size = 18,
  className,
  children,
  filled = false,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className ? `icon ${className}` : "icon"}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function FilledIcon({
  size = 18,
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className ? `icon ${className}` : "icon"}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      fill="currentColor"
      stroke="none"
    >
      {children}
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </Icon>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" />
    </Icon>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </Icon>
  );
}

export function SortDescIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </Icon>
  );
}

export function SortAscIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </Icon>
  );
}

export function BatchOpenIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </Icon>
  );
}

export function BatchDoneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  );
}

export function PauseIcon({ filled, ...props }: IconProps) {
  if (filled) {
    return (
      <FilledIcon {...props}>
        <rect x="5" y="4" width="5" height="16" rx="1.5" />
        <rect x="14" y="4" width="5" height="16" rx="1.5" />
      </FilledIcon>
    );
  }
  return (
    <Icon {...props}>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </Icon>
  );
}

export function ResumeIcon({ filled, ...props }: IconProps) {
  if (filled) {
    return (
      <FilledIcon {...props}>
        <path d="M7 4.5v15l12-7.5-12-7.5z" />
      </FilledIcon>
    );
  }
  return (
    <Icon {...props}>
      <path d="M7 5.5v13l11-6.5-11-6.5z" />
    </Icon>
  );
}

export function RemoveIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M7 7v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
      <path d="M10 11v6M14 11v6" />
    </Icon>
  );
}

export function DeleteFilesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M7 7v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
      <path d="m10 12 4 4M14 12l-4 4" />
    </Icon>
  );
}

export function ClearIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Icon>
  );
}

export function AddIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function DownloadIcon({ filled, ...props }: IconProps) {
  if (filled) {
    return (
      <FilledIcon {...props}>
        <path d="M11 3h2v9.2l3.3-3.3 1.4 1.4L12 16.3 6.3 10.3l1.4-1.4L11 12.2V3z" />
        <path d="M4 18h16v2H4z" />
      </FilledIcon>
    );
  }
  return (
    <Icon {...props}>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 19h14" />
    </Icon>
  );
}

export function PasteIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </Icon>
  );
}

export function SelectAllIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <path d="m14 15.5 2 2 3.5-4" />
    </Icon>
  );
}

export function RssIcon({ filled, ...props }: IconProps) {
  if (filled) {
    return (
      <FilledIcon {...props}>
        <circle cx="5.5" cy="18.5" r="2.25" />
        <path d="M4 11.25a8.75 8.75 0 0 1 8.75 8.75h-2.5A6.25 6.25 0 0 0 4 13.75v-2.5z" />
        <path d="M4 4.5A15.5 15.5 0 0 1 19.5 20h-2.5A13 13 0 0 0 4 7V4.5z" />
      </FilledIcon>
    );
  }
  return (
    <Icon {...props}>
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function EllipsisIcon({ filled, ...props }: IconProps) {
  const r = filled ? 1.75 : 1.35;
  return (
    <FilledIcon {...props}>
      <circle cx="6" cy="12" r={r} />
      <circle cx="12" cy="12" r={r} />
      <circle cx="18" cy="12" r={r} />
    </FilledIcon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9 6 6 6-6 6" />
    </Icon>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m15 6-6 6 6 6" />
    </Icon>
  );
}

export function InboxIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
      <path d="M4 8 8.5 3h7L20 8" />
      <path d="M4 13h4l1.5 2h5L16 13h4" />
    </Icon>
  );
}

/** 離線空狀態 — 斜線 Wi‑Fi */
export function OfflineIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 8.82A15.94 15.94 0 0 1 12 5c3.2 0 6.15.94 8.64 2.55" />
      <path d="M5.07 12.14A10.94 10.94 0 0 1 12 10c2.1 0 4.05.58 5.72 1.6" />
      <path d="M8.53 15.39A5.97 5.97 0 0 1 12 14.5c.95 0 1.84.2 2.65.56" />
      <circle cx="12" cy="19" r="1.25" fill="currentColor" stroke="none" />
      <path d="m3 3 18 18" />
    </Icon>
  );
}

export function SpinnerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3a9 9 0 1 1-6.36 2.64" />
    </Icon>
  );
}

export type { IconProps };
