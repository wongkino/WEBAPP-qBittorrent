import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

/** Non-loopback IPv4 addresses on this machine (host or container). */
function lanDevOrigins(): string[] {
  const hosts = new Set<string>();
  for (const nets of Object.values(networkInterfaces())) {
    for (const net of nets ?? []) {
      if (net.internal) continue;
      const family = String(net.family);
      if (family !== "IPv4" && family !== "4") continue;
      hosts.add(net.address);
    }
  }
  return [...hosts];
}

/** Origins allowed to load `/_next/*` + HMR in `next dev`. */
function devAllowedOrigins(): string[] {
  const hosts = new Set<string>(["127.0.0.1", "localhost", "::1"]);
  for (const ip of lanDevOrigins()) hosts.add(ip);

  const extra = process.env.DEV_ALLOWED_ORIGINS;
  if (extra) {
    for (const part of extra.split(/[,\s]+/)) {
      const host = part.trim();
      if (host) hosts.add(host);
    }
  }

  return [...hosts];
}

const nextConfig: NextConfig = {
  output: "standalone",
  // Next 16 blocks cross-origin `/_next/*` + HMR unless listed here.
  // Docker dev: pass the host LAN IP via DEV_ALLOWED_ORIGINS (see npm run dev:docker).
  allowedDevOrigins: devAllowedOrigins(),
  async headers() {
    return [
      {
        // iOS 主畫面 PWA 會快取 HTML；避免長期卡在舊版 UI
        source: "/((?!api|_next|favicon|icon|manifest).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
