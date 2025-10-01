"use client";
import { TbRefresh } from "react-icons/tb";

interface RefreshHeaderProps {
  onRefresh: () => void | Promise<void>;
  loading: boolean;
  additionalInfo?: React.ReactNode;
  className?: string;
  zIndex?: number;
}

export default function RefreshHeader({
  onRefresh,
  loading,
  additionalInfo,
  className = "",
  zIndex = 30,
}: RefreshHeaderProps) {
  return (
    <div
      className={`sticky top-2 lg:left-2 lg:right-2 w-full bg-black/80 backdrop-blur-sm text-white px-4 py-2 flex items-center justify-between shadow-md ${className} md:rounded-lg`}
      style={{ zIndex }}
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium">Data outdated ?</span>
        {additionalInfo && (
          <span className="text-xs text-gray-400 mt-1">{additionalInfo}</span>
        )}
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-1 bg-green-400 text-black font-semibold p-2 rounded-md text-sm hover:bg-green-300 active:scale-95 transition"
      >
        <TbRefresh className={loading ? "animate-spin" : ""} />
        <span className="hidden sm:inline">Refresh</span>
      </button>
    </div>
  );
}
