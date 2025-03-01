"use client";
import { usePathname } from "next/navigation";
import useMenu from "@/store/menustate";
import { IoMenuSharp } from "react-icons/io5";

export default function MenuMobileTrigger() {
  const { isVisible, show, hide } = useMenu();

  const pathname = usePathname();
  return (
    <div
      className={`flex flex-row items-center justify-center text-black text-2xl ${
        pathname == "/" || pathname == "/login"
          ? "hidden lg:hidden"
          : "fixed lg:hidden"
      } z-50 bottom-20 right-10 w-14 h-14 backdrop-blur-sm  rounded-t-full rounded-bl-full bg-green-400 border-4 border-black shadow-2xl shadow-black duration-300 transition-all active:scale-95 `}
      onClick={isVisible ? hide : show}
    >
      <IoMenuSharp />
    </div>
  );
}
