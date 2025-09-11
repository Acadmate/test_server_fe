"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installPWA, canInstall } =
    usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed || isInstalled || !isInstallable) {
      setShowPrompt(false);
      return;
    }

    // Show prompt after a delay when installable
    const timer = setTimeout(() => {
      if (canInstall) {
        setShowPrompt(true);
      }
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, canInstall]);

  const handleInstallClick = async () => {
    const success = await installPWA();
    if (!success) {
      localStorage.setItem("pwa-install-dismissed", "true");
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  // Don't show if already installed, not installable, or user dismissed
  if (isInstalled || !isInstallable || !showPrompt || !canInstall) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 flex items-center gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
            Install Acadmate
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Add to home screen for quick access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="bg-[#9cc95e] hover:bg-[#86af4d] text-white px-3 py-1"
          >
            <Download className="w-4 h-4 mr-1" />
            Install
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
