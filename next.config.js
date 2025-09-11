const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: false, // Let the app handle updates manually
  cacheOnFrontEndNav: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
    /build-manifest\.json$/,
  ],

  // Use version-based revision for better cache busting
  additionalManifestEntries: [
    { url: '/', revision: '2.0.0' },
    { url: '/calender', revision: '2.0.0' },
    { url: '/messmenu', revision: '2.0.0' },
    { url: '/timetable', revision: '2.0.0' },
    { url: '/attendance', revision: '2.0.0' },
    { url: '/gpacalc', revision: '2.0.0' },
    { url: '/supadocs', revision: '2.0.0' },
    { url: '/offline.html', revision: '2.0.0' }
  ],
  
  runtimeCaching: [
    // Navigation requests - use NetworkFirst for better offline experience
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400 * 7, // 7 days
        },
        networkTimeoutSeconds: 3, // Fall back to cache if network takes more than 3 seconds
        precacheFallback: {
          fallbackURL: '/offline.html',
        }
      },
    },
    
    // Page data - Next.js page data JSON files
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'page-data',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400, // 1 day
        }
      },
    },
    
    // Static assets - use StaleWhileRevalidate for better update detection
    {
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400 * 7, // 7 days - shorter cache for better updates
        },
      },
    },
    
    // Fonts
    {
      urlPattern: /\.(?:woff2?|eot|ttf|otf)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'font-resources',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 86400 * 30, // 30 days
        },
      },
    },
    
    // Images
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400 * 30, // 30 days
        },
      },
    },
    
    // API routes - use NetworkFirst with offline fallback
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 3600, // 1 hour
        },
        networkTimeoutSeconds: 5,
      },
    },
    
    // Same-origin non-API routes
    {
      urlPattern: ({ url }) => {
        const isSameOrigin = self.origin === url.origin;
        return isSameOrigin && !url.pathname.startsWith('/api/') && !url.pathname.startsWith('/_next/');
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'other-resources',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 86400 * 7, // 7 days
        },
        networkTimeoutSeconds: 3,
      },
    },
    
    // Next.js specific assets - use StaleWhileRevalidate for better updates
    {
      urlPattern: ({ url }) => {
        return url.pathname.startsWith('/_next/') && 
               !url.pathname.includes('/data/') && 
               !url.pathname.includes('.json');
      },
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 86400 * 7, // 7 days - shorter cache for better updates
        },
      },
    },
  ],
});

// Update handling is now managed by the React components

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  images: {
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd1q2pjcdrkfe73.cloudfront.net',
      },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = withPWA(nextConfig);