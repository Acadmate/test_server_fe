"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [hasStats, setHasStats] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stats = localStorage.getItem("stats");
      setHasStats(stats === "true");
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen justify-center items-center">
      <div className="flex flex-col items-center justify-center h-[40vh] w-[85vw] md:h-[50vh] md:w-[60vw] lg:h-[65vh] lg:w-[60vw] bg-gray-500/5 rounded-lg">
        <Link
          href={hasStats ? "/attendance" : "/login"}
          className="flex flex-row justify-center items-center w-fit h-fit bg-red-300 px-5 py-3 text-2xl rounded font-semibold scale-96 active:scale-95 transition-all duration-300"
        >
          <span>Login</span>
        </Link>
      </div>
    </div>
  );
}
