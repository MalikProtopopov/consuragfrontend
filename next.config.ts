import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",
  
  // Allow images from external sources if needed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Optimize build performance - skip checks during build (do them in CI/CD)
  typescript: {
    // Type checking slows down builds significantly
    // Run `npm run lint` separately in CI/CD
    ignoreBuildErrors: true,
  },
  
  eslint: {
    // ESLint slows down builds significantly
    // Run `npm run lint` separately in CI/CD
    ignoreDuringBuilds: true,
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
