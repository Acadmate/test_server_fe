"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw, Download, X } from "lucide-react";
import { getVersionInfo, forceClearCaches, updateStoredVersion } from "@/utils/versionManager";

interface LegacyUpdateModalProps {
  onUpdateComplete?: () => void;
}

export default function LegacyUpdateModal({ onUpdateComplete }: LegacyUpdateModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [versionInfo] = useState(getVersionInfo());

  useEffect(() => {
    // Check if this is a legacy user who needs to update
    if (versionInfo.needsForceUpdate) {
      setIsVisible(true);
    }
  }, [versionInfo]);

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Clear all caches and service workers
      await forceClearCaches();
      
      // Update the stored version
      updateStoredVersion();
      
      // Call the update complete callback if provided
      if (onUpdateComplete) {
        onUpdateComplete();
      }
      
      // Force reload the page to get the new version
      window.location.reload();
    } catch (error) {
      console.error('Force update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    // Don't allow dismissing for legacy users - they must update
    if (versionInfo.isLegacy) {
      return;
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 animate-in zoom-in-95 duration-300">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {versionInfo.isLegacy ? 'Critical Update Required' : 'Update Available'}
            </h3>
            
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <p>
                {versionInfo.isLegacy ? (
                  <>
                    You&apos;re using an outdated version of Acadmate that has known issues including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Sign out functionality not working properly</li>
                      <li>No automatic update mechanism</li>
                      <li>Performance and security issues</li>
                    </ul>
                  </>
                ) : (
                  'A new version of Acadmate is available with improvements and bug fixes.'
                )}
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>Current version:</strong> {versionInfo.current}<br/>
                  <strong>Required version:</strong> {versionInfo.required}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleForceUpdate}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    {versionInfo.isLegacy ? 'Force Update Now' : 'Update Now'}
                  </>
                )}
              </button>
              
              {!versionInfo.isLegacy && (
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium rounded-md transition-colors"
                >
                  Later
                </button>
              )}
            </div>
            
            {versionInfo.isLegacy && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                This update is required to continue using Acadmate. Your data will be preserved.
              </p>
            )}
          </div>
          
          {!versionInfo.isLegacy && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
