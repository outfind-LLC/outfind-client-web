import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Avatars, company logos, and provider marks come from arbitrary HTTPS
    // hosts (Google, Telegram, models.dev, employer-supplied URLs).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
