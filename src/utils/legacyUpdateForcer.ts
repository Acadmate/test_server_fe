// Legacy update forcer - ensures old users get the new version
// This runs on every page load to catch legacy users

export function forceLegacyUpdate() {
  if (typeof window === 'undefined') return;

  // Check if this is a legacy user
  const storedVersion = localStorage.getItem('acadmate-version');
  const isLegacy = !storedVersion || storedVersion < '2.0.0';

  if (isLegacy) {
    console.log('🔄 Legacy user detected, forcing update...');
    
    // Clear all caches aggressively
    clearAllCaches();
    
    // Force service worker update
    forceServiceWorkerUpdate();
    
    // Set version to current
    localStorage.setItem('acadmate-version', '2.0.0');
    
    // Force reload after a short delay to ensure caches are cleared
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}

async function clearAllCaches() {
  try {
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log(`🗑️ Clearing cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    }

    // Clear service worker registrations
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => {
          console.log(`🗑️ Unregistering SW: ${registration.scope}`);
          return registration.unregister();
        })
      );
    }

    // Clear localStorage items that might interfere
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('cache') || 
        key.includes('sw') || 
        key.includes('pwa') ||
        key.includes('workbox')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      console.log(`🗑️ Removing localStorage: ${key}`);
      localStorage.removeItem(key);
    });

    console.log('✅ All caches cleared for legacy user');
  } catch (error) {
    console.error('❌ Failed to clear caches:', error);
  }
}

async function forceServiceWorkerUpdate() {
  try {
    if ('serviceWorker' in navigator) {
      // Register new service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none' // Always check for updates
      });
      
      console.log('✅ New service worker registered');
      
      // Force update
      await registration.update();
      console.log('✅ Service worker updated');
    }
  } catch (error) {
    console.error('❌ Failed to update service worker:', error);
  }
}

// Run immediately when this module loads
if (typeof window !== 'undefined') {
  // Run after a short delay to ensure the page is loaded
  setTimeout(forceLegacyUpdate, 100);
}
