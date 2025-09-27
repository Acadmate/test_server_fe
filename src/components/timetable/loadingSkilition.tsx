import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingSkeleton = () => (
  <div className="flex flex-col gap-2 w-full">
    <Skeleton className="h-8 w-40" />
    <div className="flex flex-row justify-between">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-10" />
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex flex-row justify-between gap-2">
        <Skeleton className="h-12 w-16" />
        {[...Array(6)].map((_, j) => (
          <Skeleton key={j} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    ))}
  </div>
);