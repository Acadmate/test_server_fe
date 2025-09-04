"use client";
import { useState, useEffect, ReactNode } from "react";
import SplashScreen from "./SplashScreen";

interface AppLoadingManagerProps {
  children: ReactNode;
}

export default function AppLoadingManager({ children }: AppLoadingManagerProps) {
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    try {
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
        // iOS Safari standalone mode detection
        ('standalone' in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone) ||
        document.referrer.includes('android-app://');
      
      const hasVisitedBefore = localStorage.getItem('acadmate-visited');
      
      if (!isPWA && hasVisitedBefore) {
        // Skip splash screen for regular web visits after first time
        setShowSplash(false);
        setIsAppReady(true);
      } else {
        // Show splash screen for PWA launches or first visits
        setShowSplash(true);
        // Mark as visited
        localStorage.setItem('acadmate-visited', 'true');
      }
    } catch (error) {
      console.error('Error in AppLoadingManager:', error);
      // Fallback: skip splash screen on error
      setShowSplash(false);
      setIsAppReady(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setIsAppReady(true);
  };

  // Don't render anything until we determine if we need splash screen
  if (!isAppReady && showSplash) {
    return <SplashScreen onLoadingComplete={handleSplashComplete} />;
  }

  return <>{children}</>;
} 