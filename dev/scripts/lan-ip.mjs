import { networkInterfaces } from "node:os";

const hosts = new Set();
for (const nets of Object.values(networkInterfaces())) {
  for (const net of nets ?? []) {
    if (net.internal) continue;
    const family = String(net.family);
    if (family !== "IPv4" && family !== "4") continue;
    hosts.add(net.address);
  }
}

process.stdout.write([...hosts].join(","));
