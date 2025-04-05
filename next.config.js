const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
    cacheOnFrontEndNav: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true, // Required for App Router support
      },
    reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
