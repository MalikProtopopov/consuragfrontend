import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",
  
  // Аватарки (avatar_image_url / user.avatar_url) приходят со стораджа бэкенда.
  // Единственные реальные хосты — прод-API и локальный dev-API; раньше тут стоял
  // hostname: "**" (любой https-домен) — сужено до реальных источников (T-26).
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.parmenid.tech",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
    ],
  },

  // Optimize build performance - skip checks during build (do them in CI/CD)
  typescript: {
    // Type checking slows down builds significantly
    // Run `npm run lint` separately in CI/CD
    ignoreBuildErrors: true,
  },
  

  // Optimize package imports to reduce bundle size and build time
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'recharts',
    ],
  },
};

export default nextConfig;
