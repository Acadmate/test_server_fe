"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { FaToggleOn, FaToggleOff } from "react-icons/fa6";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

export default function Toggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button>
        <FaToggleOff />
      </button>
    );
  }

  return (
    <div className="flex items-center justify-center">
      {resolvedTheme === "dark" ? (
        <Tippy
          interactive={true}
          placement={"top"}
          content={<p className="text-[10px] p-0 m-0">Dark</p>}
        >
          <span className="flex text-base gap-1 p-1 hover:bg-green-300/40 rounded-lg active:scale-90 transition-all duration-200">
            <button>
              <FaToggleOff
                className="buttons text-lg"
                onClick={() => setTheme("light")}
              />
            </button>
          </span>
        </Tippy>
      ) : (
        <Tippy
          interactive={true}
          content={<p className="text-[10px]">Light</p>}
        >
          <span className="flex text-base gap-1 p-1 hover:bg-green-300/40 rounded-lg active:scale-90 transition-all duration-200">
            <button>
              <FaToggleOn
                className="buttons text-lg"
                onClick={() => setTheme("dark")}
              />
            </button>
          </span>
        </Tippy>
      )}
    </div>
  );
}
