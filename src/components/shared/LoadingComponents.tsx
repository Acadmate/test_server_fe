import React from "react";
import PageSkeleton from "./skeleton/PageSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import "../loading.css"; // Import the CSS for AbstergoLoader

// Main loading component with customizable text
export function Loading({
  text = "Loading...",
  className = "",
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex justify-center items-center w-full h-full min-h-[200px] ${className}`}
    >
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
      <span className="ml-2 text-black dark:text-white">{text}</span>
    </div>
  );
}

// Abstergo-style loader
export function AbstergoLoader() {
  return (
    <div className="flex flex-row items-center justify-center h-screen w-screen bg-gray-50 dark:bg-[#0F0F0F]">
      <div className="ui-abstergo">
        <div className="abstergo-loader">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="ui-text">
          Bothering Academia
          <div className="ui-dot"></div>
          <div className="ui-dot"></div>
          <div className="ui-dot"></div>
        </div>
      </div>
    </div>
  );
}

// Authentication loading screen
export function AuthLoadingScreen() {
  return <AbstergoLoader />;
}

// Redirect loading screen
export function RedirectingScreen() {
  return <AbstergoLoader />;
}

// Full screen loading
export function FullScreenLoader({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-50 dark:bg-[#0F0F0F]">
      <div className="ui-abstergo">
        <div className="abstergo-loader">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="ui-text">
          {text || "Bothering Academia"}
          <div className="ui-dot"></div>
          <div className="ui-dot"></div>
          <div className="ui-dot"></div>
        </div>
      </div>
    </div>
  );
}

// Page-specific loading components
export function DashboardLoading() {
  return <PageSkeleton type="dashboard" />;
}

export function CalendarLoading() {
  return <PageSkeleton type="calendar" />;
}

export function FormLoading() {
  return <PageSkeleton type="form" />;
}

export function ListLoading() {
  return <PageSkeleton type="list" />;
}

export function TableLoading() {
  return <PageSkeleton type="table" />;
}

// Documents-specific loading
export function DocumentsLoading() {
  return (
    <div className="mx-auto h-fit w-screen lg:w-[80vw] p-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Search Skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-80" />
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects List Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <Skeleton className="h-6 w-32 mb-4" />

            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-3">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-5 flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Documents Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-9 w-24" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-5 flex-1" />
                  {i % 2 === 0 && <Skeleton className="w-12 h-4" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
