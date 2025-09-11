"use client";
import EmblaCarousel from "@/components/home/carousel/carousel";
import { EmblaOptionsType } from "embla-carousel";
import Link from "next/link";

const OPTIONS: EmblaOptionsType = { loop: true };
const SLIDE_COUNT = 7;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

export default function Home() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <nav className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex items-center justify-between">
          <div className="text-white text-2xl font-bold">Acadmate</div>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/login"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="#"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Contributors
            </Link>
            <Link
              href="#about"
              className="text-gray-300 hover:text-white transition-colors"
            >
              About Us
            </Link>
          </div>
          <div className="md:hidden">
            <button className="text-white">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Desktop/Tablet Carousel Layout */}
      <div className="absolute inset-2 sm:inset-4 hidden md:flex items-right justify-center">
        <div className="embla-wrapper flex flex-col gap-2 sm:gap-4 w-full h-full">
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
          <EmblaCarousel slides={SLIDES} options={OPTIONS} carouselId={5} />
        </div>
      </div>

      {/* Mobile Carousel Layout - Positioned to avoid text overlap */}
      <div className="absolute top-20 right-2 bottom-2 left-1/2 md:hidden">
        <div className="embla-wrapper flex flex-col gap-2 w-full h-full">
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
          <EmblaCarousel slides={SLIDES} options={OPTIONS} carouselId={5} />
        </div>
      </div>

      {/* Content Container */}
      <div className="absolute left-4 sm:left-8 top-1/2 transform -translate-y-1/2 z-10 px-2 sm:px-0 md:max-w-lg">
        <div className="max-w-xs md:max-w-lg">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 md:mb-6">
            Track Your
            <br />
            Academic Journey
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Like a Pro
            </span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl mb-6 md:mb-8 leading-relaxed">
            Manage your grades, track attendance, and stay on top of your
            academic goals with our comprehensive student dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Link
              href="/login"
              className="group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-semibold text-base md:text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 text-center"
            >
              <span className="relative z-10">Checkout</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <Link
              href="#demo"
              className="px-6 md:px-8 py-3 md:py-4 border-2 border-gray-600 rounded-full text-white font-semibold text-base md:text-lg hover:border-white hover:bg-white hover:text-black transition-all duration-300 text-center"
            >
              Watch Demo
            </Link>
          </div>

          <div className="hidden mt-8 lg:flex flex-wrap gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              GPA Calculator
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              Attendance Tracker
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              Attendance Prediction
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              Analytics and Performance
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              GPA Calc
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              Time table
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              Calendar{" "}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              Notes and Ppts
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden sm:block"></div>

      {/* Enhanced mobile-friendly mask for better text visibility */}
      <div
        className="absolute inset-0 bg-black hidden md:block"
        style={{
          maskImage:
            "radial-gradient(ellipse 140% 135% at 70% 60%, transparent 20%, black 40%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 140% 135% at 70% 60%, transparent 20%, black 40%)",
          maskMode: "alpha",
        }}
      />

      {/* Mobile-specific gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent opacity-80 md:opacity-60 md:via-transparent" />
    </div>
  );
}
