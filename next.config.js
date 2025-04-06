const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: false,
    cacheOnFrontEndNav: true,
    disable: process.env.NODE_ENV === "development",
    buildExcludes: [
      /app-build-manifest\.json$/,
      /middleware-manifest\.json$/,
      /build-manifest\.json$/,
      /chunks\/.*$/,
    ],
    additionalManifestEntries: [
      { url: '/', revision: '1' },
      { url: '/calender', revision: '1' },
      { url: '/messmenu', revision: '1' },
      { url: '/timetable', revision: '1' },
      { url: '/attendance', revision: '1' },
      { url: '/gpacalc', revision: '1' },
      { url: '/supadocs', revision: '1' },
      { url: '/offline.html', revision: '1' }
    ],
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'html-pages',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 86400,
          },
          networkTimeoutSeconds: 5,
        },
      },
      {
        urlPattern: /^https?.*\/api\/.*$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 300,
          },
        },
      },
      {
        urlPattern: /\.(?:js|css)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 86400,
          },
        },
      },
      {
        urlPattern: /\.(?:woff2?|eot|ttf|otf)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'font-resources',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 604800,
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 604800,
          },
        },
      },
      {
        urlPattern: ({ url }) => {
          const isSameOrigin = self.origin === url.origin;
          return isSameOrigin && !url.pathname.startsWith('/api/');
        },
        handler: 'NetworkOnly',
        options: {
          cacheName: 'others',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 86400
          },
          precacheFallback: {
            fallbackURL: '/offline.html',
          }
        },
      },
    ],
  });
  
  const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  };
  
  module.exports = withPWA(nextConfig);