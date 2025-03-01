"use client";

import dynamic from "next/dynamic";

const Animation = dynamic(() => import("@/components/shared/animation"), {
  ssr: false,
});
export default function Messmenu() {
  return (
    <div className="mx-auto h-fit w-screen lg:w-[50vw]">
      <div>
        <Animation />
      </div>
    </div>
  );
}
