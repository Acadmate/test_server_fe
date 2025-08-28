"use client";

import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
    type?: 'dashboard' | 'list' | 'form' | 'calendar' | 'table';
    showHeader?: boolean;
    showNavigation?: boolean;
}

export default function PageSkeleton({
    type = 'dashboard',
    showHeader = true,
    showNavigation = true
}: PageSkeletonProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] animate-pulse w-full">
            {/* Header Skeleton */}
            {showHeader && (
                <div className="w-full h-16 lg:h-20 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
                    <div className="h-8 w-32 bg-gray-300 dark:bg-[#2a2a2a] rounded"></div>
                    <div className="h-8 w-20 bg-gray-300 dark:bg-[#2a2a2a] rounded"></div>
                </div>
            )}

            <div className="flex">
 
                {/* Main Content Skeleton */}
                <div className={`flex-1 pt-4 ${showNavigation ? '' : ''} w-[95vw] lg:w-[72vw] mx-auto`}>
                    {type === 'dashboard' && <DashboardSkeleton />}
                    {type === 'list' && <ListSkeleton />}
                    {type === 'form' && <FormSkeleton />}
                    {type === 'calendar' && <CalendarSkeleton />}
                    {type === 'table' && <TableSkeleton />}
                </div>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6 mx-4">
            {/* Title */}
            <div className="h-8 w-48 bg-gray-300 dark:bg-[#2a2a2a] rounded"></div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="w-full bg-white dark:bg-[#1a1a1a] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="h-6 w-full bg-gray-300 dark:bg-[#2a2a2a] rounded "></div>
                    </div>
            ))}
            </div>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 gap-4">
                {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-[#1a1a1a] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="h-6 w-6 bg-gray-300 dark:bg-[#2a2a2a] rounded mb-4"></div>
                        <div className="h-4 w-3/4 bg-gray-300 dark:bg-[#2a2a2a] rounded mb-2"></div>
                        <div className="h-3 w-1/2 bg-gray-200 dark:bg-[#3a3a3a] rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ListSkeleton() {
    return (
        <div className="bg-card border rounded-xl shadow-sm p-6">
    {/* Header */}
    <div className="flex items-center space-x-3 mb-6">
      <div className="bg-green-400/10 p-2 rounded-full">
        <Users className="w-6 h-6 text-green-400 opacity-50" />
      </div>
      <Skeleton className="h-6 w-32" />
    </div>

    {/* Advisor cards (3 skeleton entries) */}
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-lg border border-border bg-muted/30"
        >
          {/* Name + Role row */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>

          {/* Email row */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>

          {/* Phone row */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  </div>
    );
}

function FormSkeleton() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="h-8 w-48 bg-gray-300 dark:bg-[#2a2a2a] rounded mb-6"></div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="mb-4">
                        <div className="h-4 w-24 bg-gray-300 dark:bg-[#2a2a2a] rounded mb-2"></div>
                        <div className="h-10 w-full bg-gray-200 dark:bg-[#3a3a3a] rounded"></div>
                    </div>
                ))}
                <div className="h-10 w-32 bg-gray-300 dark:bg-[#2a2a2a] rounded mt-6"></div>
            </div>
        </div>
    );
}

const CalendarDaySkeleton = () => {
    return (
        <div className="relative overflow-hidden flex flex-col justify-between p-5 lg:p-8 mx-2 my-2 rounded-2xl h-fit bg-gray-100 dark:bg-black">

            {/* Header row with day name and day order */}
            <div className="flex mb-2 flex-row justify-between items-center mx-1 lg:mb-2 text-lg lg:text-2xl">
                <Skeleton className="h-6 w-20 bg-gray-300 dark:bg-[#1a1a1a]" />
                <Skeleton className="h-6 w-24 bg-gray-300 dark:bg-[#1a1a1a]" />
            </div>

            {/* Main content row */}
            <div className="flex flex-row justify-between">
                {/* Date and month section */}
                <div className="flex flex-col w-[40%] justify-start">
                    <div className="text-[50px] leading-[55px] lg:text-[80px] lg:leading-[80px] font-thin">
                        <Skeleton className="h-12 w-12 lg:h-20 lg:w-20 mb-2 bg-gray-300 dark:bg-[#1a1a1a]" />
                        <Skeleton className="h-8 w-16 lg:h-12 lg:w-20 bg-gray-300 dark:bg-[#1a1a1a]" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CalendarSkeleton = ({ count = 5 }: { count?: number }) => {
    return (
        <div className="flex flex-col text-white border-box w-[95vw] mx-auto lg:w-[72vw]">
            {/* Month title skeleton */}
            <div className="mx-auto mb-4">
                <Skeleton className="h-10 w-32 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>

            {/* Calendar day skeletons */}
            {[...Array(count)].map((_, index) => (
                <CalendarDaySkeleton key={index} />
            ))}
        </div>
    );
};

function TableSkeleton() {
    return (
        <div className="relative h-[80vh] flex justify-center mx-4 w-[95vw] lg:w-[72vw]">
            <div className="flex flex-col gap-2 w-full lg:block hidden">
                <Skeleton className="h-8 w-40" />
                <div className="flex flex-row justify-between gap-2 mt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-10" />
                </div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex flex-row justify-between gap-2 mt-2">
                        <Skeleton className="h-12 w-16" />
                        {[...Array(6)].map((_, j) => (
                            <Skeleton key={j} className="h-12 w-full rounded-xl" />
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-2 w-full lg:hidden block">
                <Skeleton className="h-8 w-40" />
                <div className="flex flex-row justify-between gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-10" />
                </div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex flex-row justify-between gap-2">
                        <Skeleton className="h-24 w-16 rounded-2xl" />
                        <Skeleton className="h-24 w-full rounded-2xl" />
                    </div>
                ))}
            </div>
            <div className="lg:hidden absolute bottom-0 flex flex-row justify-between w-32 gap-2 mx-auto mt-2 rounded-full border-2 border-gray-300 dark:border-gray-700 p-1">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
                <Skeleton className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>
        </div>

    );
} 