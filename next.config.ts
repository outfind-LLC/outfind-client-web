import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Telegram's login domain is `127.0.0.1:3000`, so the app is served from
  // `127.0.0.1` in dev. Next 16 blocks cross-origin dev resources (HMR, client
  // chunks) by default, which prevents hydration — allow both loopback hosts so
  // client components mount and buttons stay interactive. Dev-only; ignored in
  // production builds.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    // Avatars, company logos, and provider marks come from arbitrary HTTPS
    // hosts (Google, Telegram, models.dev, employer-supplied URLs).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
