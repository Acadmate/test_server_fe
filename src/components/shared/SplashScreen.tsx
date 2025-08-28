"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface SplashScreenProps {
  onLoadingComplete?: () => void;
  minDisplayTime?: number;
}

export default function SplashScreen({ 
  onLoadingComplete, 
  minDisplayTime = 2000 
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const handleLoadingComplete = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onLoadingComplete?.();
    }, 500);
  }, [onLoadingComplete]);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Randomize progress increments for more natural feel
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    // Ensure minimum display time
    const minTimer = setTimeout(() => {
      if (loadingProgress >= 100) {
        handleLoadingComplete();
      }
    }, minDisplayTime);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(minTimer);
    };
  }, [minDisplayTime, loadingProgress, handleLoadingComplete]);

  useEffect(() => {
    if (loadingProgress >= 100) {
      const completeTimer = setTimeout(() => {
        handleLoadingComplete();
      }, 300);
      
      return () => clearTimeout(completeTimer);
    }
  }, [loadingProgress, handleLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed w-full h-screen inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F0F0F] transition-all duration-500">
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative mb-8 transform transition-all duration-1000 animate-fade-in-up">
          <div className="relative flex items-center justify-center w-full h-full">
              <Image
                src="/logo.png"
                alt="Acadmate Logo"
                width={1000}
                height={1000}
                className="w-full h-12 md:w-full max-w-64 md:h-full object-contain"
                priority
              />
            </div>
        </div>

        {/* App Name */}
        <div className="mb-8 text-center animate-fade-in-up delay-300">
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
            Your Academic Companion
          </p>
        </div>

        {/* 3 dots animation */}
        <div className="flex gap-2 items-center justify-center">
          <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce delay-200"></div>
        </div>

      </div>
      <div className="absolute bottom-8 text-xs text-gray-500 dark:text-gray-500 animate-fade-in delay-1000">
        v0.1.0 • PWA
      </div>
    </div>
  );
} 