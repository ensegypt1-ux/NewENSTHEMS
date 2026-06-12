import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: false,
  turbopack: {
    // Keep Next root scoped to this project (avoid parent lockfile inference).
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/sitemap-menus-:page(\\d{4})\\.xml",
        destination: "/sitemap-menus/:page",
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.easykash.net",
        pathname: "/assets/images/**",
      },
      {
        protocol: "https",
        hostname: "ensapi.ensbot.net",
      },
      {
        protocol: "https",
        hostname: "api.ensmenu.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withBundleAnalyzer(withNextIntl(nextConfig));
