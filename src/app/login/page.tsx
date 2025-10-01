"use client";
import LoginForm from "@/components/login/form";
import EmblaCarousel from "@/components/home/carousel/carousel";
import { EmblaOptionsType } from "embla-carousel";
import "@/components/loading.css";

const OPTIONS: EmblaOptionsType = { loop: true };
const SLIDE_COUNT = 7;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

export default function Login() {
  return (
    <div className="relative w-screen min-h-screen overflow-hidden bg-black flex items-center justify-center p-4">
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

      <div
        className="absolute inset-0 bg-black"
        style={{
          maskImage:
            "radial-gradient(circle at center, transparent 45%, black 85%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, transparent 45%, black 85%)",
        }}
      />

      <div className="relative z-10 w-full max-w-lg bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg py-10 px-6 md:px-10">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-white text-4xl md:text-5xl font-bold mb-3">
            Welcome Back
          </h2>
          <p className="text-gray-300 text-base md:text-lg">
            Log in to continue your academic journey.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
