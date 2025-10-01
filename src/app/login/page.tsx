// src/app/login/page.tsx
"use client";
import LoginForm from "@/components/login/form";
import { useAuthStore } from "@/store/authStore";
import { AbstergoLoader } from "@/components/shared/LoadingComponents";
import EmblaCarousel from "@/components/home/carousel/carousel";
import { EmblaOptionsType } from "embla-carousel";

const OPTIONS: EmblaOptionsType = { loop: true };
const SLIDE_COUNT = 7;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

export default function Login() {
  const { isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <AbstergoLoader />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black flex items-center justify-center p-4">
      {/* Background Carousel Container */}
      <div
        className="absolute inset-0 z-0 flex items-center"
        style={{ transform: "translateX(-25%)", opacity: 0.45 }}
      >
        <div className="embla-wrapper flex flex-col gap-4 w-[150vw] h-full">
          <EmblaCarousel slides={SLIDES} options={OPTIONS} carouselId={1} />
          <EmblaCarousel
            slides={SLIDES}
            options={OPTIONS}
            carouselId={2}
            direction="backward"
          />
          <EmblaCarousel slides={SLIDES} options={OPTIONS} carouselId={3} />
          <EmblaCarousel
            slides={SLIDES}
            options={OPTIONS}
            carouselId={4}
            direction="backward"
          />
          <EmblaCarousel
            slides={SLIDES}
            options={OPTIONS}
            carouselId={5}
            direction="forward"
          />
        </div>
      </div>

      {/* Background Circle Blur */}
      <div
        className="absolute inset-0 bg-black"
        style={{
          maskImage:
            "radial-gradient(circle at center, transparent 45%, black 85%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, transparent 45%, black 85%)",
        }}
      />

      {/* --- INCREASED size of the login container --- */}
      <div className="relative z-10 w-full max-w-lg bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg p-10">
        <div className="text-center mb-10">
          {/* --- INCREASED text size --- */}
          <h2 className="text-white text-5xl font-bold mb-3">Welcome Back</h2>
          <p className="text-gray-300 text-lg">
            Log in to continue your academic journey.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
