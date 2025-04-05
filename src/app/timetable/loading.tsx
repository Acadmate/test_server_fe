"use client";

import React from "react";
import "@/components/loading.css";
export default function Loading() {
  return (
    <div className="flex flex-row items-center h-screen justify-center gap-2 lg:w-[73vw] mx-auto">
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
