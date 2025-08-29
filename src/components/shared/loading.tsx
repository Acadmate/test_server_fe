import React from "react";

export default function Loading() {
  return (
    <div className="flex justify-center items-center w-full h-full min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      <span className="ml-2 text-black">Loading Logs...</span>
    </div>
  );
}
