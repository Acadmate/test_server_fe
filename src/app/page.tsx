"use client";
import "@/components/loading.css";
import CheckButton from "@/components/home/checkOutBtn";

export default function Home() {
  return (
    <div className="pattern-bg flex flex-col min-h-screen w-full justify-center p-4 md:p-12">
      <div className="max-w-4xl mx-auto w-fit h-fit p-6 backdrop-blur-md bg-black/40 rounded-lg border border-green-400/40 shadow-lg">
        <div className="flex flex-col">
          <div className="flex flex-row text-[40px] lg:text-[120px] font-bold leading-none text-[#66FF65] tracking-tight">
            Acadmate<span className="text-white">.in</span>
          </div>

          <div className="flex items-center">
            <div className="relative flex flex-row items-center font-bold py-2">
              <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-[#66FF65] to-green-200 tracking-tight text-lg md:text-3xl lg:text-4xl mx-1">
                #
              </span>
              <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-[#66FF65] to-green-200 tracking-tight text-lg md:text-3xl lg:text-4xl">
                Breaking
              </span>
              <span className="ml-2 relative z-10 text-white tracking-tight text-lg md:text-3xl lg:text-4xl">
                academia
              </span>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-20">
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#66FF65] to-transparent"></div>
              </div>
            </div>
          </div>

          <div className="flex flex-row text-sm md:text-base">
            From tracking performance to predicting attendance, we&apos;ve got
            it all covered. Timetable? Calendar? It&apos;s all here! Along with
            a bunch of other cool stuff.
          </div>

          <div className="pt-4">
            <CheckButton />
          </div>

          <div className="flex flex-row items-center justify-center bg-full w-full mt-4 text-bold text-xs">
            <p>
              Made by <span className="text-[#66FF65]">Lil penguinz</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
