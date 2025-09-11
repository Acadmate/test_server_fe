"use client";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import UpdateNotification from "@/components/shared/UpdateNotification";
import LegacyUpdateModal from "@/components/shared/LegacyUpdateModal";

export default function ServiceWorkerUpdate() {
  const { 
    isUpdateAvailable, 
    applyUpdate, 
    dismissUpdate, 
    needsForceUpdate 
  } = useServiceWorkerUpdate();

  // Show legacy update modal for users who need force update
  if (needsForceUpdate) {
    return (
      <LegacyUpdateModal
        onUpdateComplete={() => {
          // Force refresh the page after update completion
          window.location.reload();
        }}
      />
    );
  }

  // Show regular update notification for normal updates
  if (isUpdateAvailable) {
    return (
      <UpdateNotification
        onUpdate={applyUpdate}
        onDismiss={dismissUpdate}
      />
    );
  }

  return null;
}
