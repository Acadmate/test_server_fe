const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
    /build-manifest\.json$/,
  ],

  // We'll adjust the precaching strategy to ensure pages are properly cached
  additionalManifestEntries: [
    { url: '/', revision: `${Date.now()}` },
    { url: '/calender', revision: `${Date.now()}` },
    { url: '/messmenu', revision: `${Date.now()}` },
    { url: '/timetable', revision: `${Date.now()}` },
    { url: '/attendance', revision: `${Date.now()}` },
    { url: '/gpacalc', revision: `${Date.now()}` },
    { url: '/supadocs', revision: `${Date.now()}` },
    { url: '/offline.html', revision: `${Date.now()}` }
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
    
    // Static assets
    {
      urlPattern: /\.(?:js|css)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400 * 30, // 30 days
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
    
    // Next.js specific assets
    {
      urlPattern: ({ url }) => {
        return url.pathname.startsWith('/_next/') && 
               !url.pathname.includes('/data/') && 
               !url.pathname.includes('.json');
      },
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 86400 * 30, // 30 days
        },
      },
    },
  ],
});

// Fix for revalidating service worker and update notifications
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Wait until service worker is ready before checking for updates
    let updateRequired = false;
    
    navigator.serviceWorker.ready.then(registration => {
      // Add update detection
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          // The service worker has been installed and is waiting to activate
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            updateRequired = true;
            // Store update state in sessionStorage
            try {
              sessionStorage.setItem('pwaUpdateAvailable', 'true');
            } catch (e) {
              console.error('Failed to store update state:', e);
            }
          }
        });
      });
      
      // Check for updates periodically (once per hour)
      setInterval(() => {
        registration.update().catch(err => {
          console.error('Service worker update failed:', err);
        });
      }, 60 * 60 * 1000);
    });
    
    // Force refresh if an update was already detected
    try {
      if (sessionStorage.getItem('pwaUpdateAvailable') === 'true') {
        sessionStorage.removeItem('pwaUpdateAvailable');
        window.location.reload();
      }
    } catch (e) {
      console.error('Failed to check session storage:', e);
    }
  });
}

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  images: {
    minimumCacheTTL: 60,
    domains: [],
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = withPWA(nextConfig);