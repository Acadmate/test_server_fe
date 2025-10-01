const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true, // Changed from false - allows immediate updates
  cacheOnFrontEndNav: true,
  disable: process.env.NODE_ENV === "development",

  // Enable automatic cleanup of outdated caches
  cleanupOutdatedCaches: true,

  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
    /build-manifest\.json$/,
  ],

  // Remove static additionalManifestEntries - these cause stale cache issues
  // Let Workbox handle precaching automatically

  runtimeCaching: [
    // Navigation requests - use NetworkFirst for better offline experience
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        expiration: {
          maxEntries: 50, // Reduced from 100
          maxAgeSeconds: 86400 * 3, // Reduced from 7 days to 3 days
        },
        networkTimeoutSeconds: 3,
        // Remove precacheFallback - it can cause conflicts
      },
    },

    // Page data - Next.js page data JSON files
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "page-data",
        expiration: {
          maxEntries: 50, // Reduced
          maxAgeSeconds: 3600 * 12, // Reduced from 1 day to 12 hours
        },
        networkTimeoutSeconds: 2, // Added timeout
      },
    },

    // Static assets - CRITICAL FIX: Use NetworkFirst instead of StaleWhileRevalidate
    {
      urlPattern: /\.(?:js|css)$/,
      handler: "NetworkFirst", // Changed from StaleWhileRevalidate
      options: {
        cacheName: "static-resources",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400 * 1, // Reduced from 7 days to 1 day
        },
        networkTimeoutSeconds: 3, // Added timeout
      },
    },

    // Fonts - keep CacheFirst as these rarely change
    {
      urlPattern: /\.(?:woff2?|eot|ttf|otf)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "font-resources",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 86400 * 30,
        },
      },
    },

    // Images - keep CacheFirst as these rarely change
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400 * 30,
        },
      },
    },

    // API routes
    {
      urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 1800, // Reduced from 1 hour to 30 minutes
        },
        networkTimeoutSeconds: 5,
      },
    },

    // CRITICAL FIX: Next.js chunks and static files
    {
      urlPattern: ({ url }) => {
        return (
          url.pathname.startsWith("/_next/static/chunks/") ||
          url.pathname.startsWith("/_next/static/css/")
        );
      },
      handler: "NetworkFirst", // Changed from StaleWhileRevalidate
      options: {
        cacheName: "next-chunks",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 86400 * 1, // Reduced to 1 day
        },
        networkTimeoutSeconds: 3,
      },
    },

    // Other Next.js assets
    {
      urlPattern: ({ url }) => {
        return (
          url.pathname.startsWith("/_next/") &&
          !url.pathname.startsWith("/_next/static/chunks/") &&
          !url.pathname.startsWith("/_next/static/css/") &&
          !url.pathname.includes("/data/")
        );
      },
      handler: "NetworkFirst",
      options: {
        cacheName: "next-other",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400 * 1,
        },
        networkTimeoutSeconds: 3,
      },
    },

    // Same-origin non-API routes
    {
      urlPattern: ({ url }) => {
        const isSameOrigin = self.origin === url.origin;
        return (
          isSameOrigin &&
          !url.pathname.startsWith("/api/") &&
          !url.pathname.startsWith("/_next/")
        );
      },
      handler: "NetworkFirst",
      options: {
        cacheName: "other-resources",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 86400 * 1, // Reduced to 1 day
        },
        networkTimeoutSeconds: 3,
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ["tsx", "ts", "jsx", "js"],

  // Add generateBuildId for better cache invalidation
  generateBuildId: async () => {
    return (
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.GIT_COMMIT_SHA ||
      `build-${Date.now()}`
    );
  },

  // Add proper cache headers
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=86400", // 1 day cache
          },
        ],
      },
    ];
  },

  images: {
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1q2pjcdrkfe73.cloudfront.net",
      },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = withPWA(nextConfig);
