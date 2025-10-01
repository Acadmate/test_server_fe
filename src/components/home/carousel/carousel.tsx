import React from "react";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import Image from "next/image";

type PropType = {
  slides: number[];
  options?: EmblaOptionsType;
  carouselId: number;
  direction?: "forward" | "backward";
};

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options, carouselId, direction = "forward" } = props;

  const [emblaRef] = useEmblaCarousel(options, [
    AutoScroll({
      playOnInit: true,
      stopOnInteraction: false,
      speed: 2,
      direction: direction === "backward" ? "backward" : "forward",
    }),
  ]);

  return (
    <div className="embla p-1">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container ml-[-1rem]">
          {slides.map((index) => (
            <div
              className="embla__slide flex-shrink-0 pl-4"
              key={index}
              style={{
                width: "clamp(6rem, 10vw, 10rem)",
                height: "clamp(12rem, 18vw, 18rem)",
              }}
            >
              <div className="w-full h-full bg-black rounded-xl shadow-lg">
                <div className="relative w-full h-full bg-gray-800 rounded-lg overflow-hidden">
                  <Image
                    src={`/assets/carousel/caro${carouselId}/page${index + 1}.webp`}
                    alt={`Carousel ${carouselId} slide ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;
