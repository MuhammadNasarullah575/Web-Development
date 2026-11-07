import os from "os";

// Automatically detect all local network IPv4 addresses dynamically
const localIps = [];
try {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" || net.family === 4) {
        localIps.push(net.address);
        localIps.push(`${net.address}:3000`);
      }
    }
  }
} catch (e) {
  // fallback if os call fails
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: Array.from(
    new Set([
      ...localIps,
      "127.0.0.1",
      "127.0.0.1:3000",
      "localhost",
      "localhost:3000",
      "10.10.0.49",
      "10.10.0.49:3000",
      "10.10.0.46",
      "10.10.0.46:3000",
      "192.168.137.1",
      "192.168.137.1:3000",
      "192.168.100.57",
      "192.168.100.57:3000",
      "192.168.100.53",
      "192.168.100.53:3000",
      "10.207.143.117",
      "10.207.143.117:3000",
      "*.lan",
      "*.local",
    ])
  ),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
