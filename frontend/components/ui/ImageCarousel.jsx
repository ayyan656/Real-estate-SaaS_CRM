import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export const ImageCarousel = ({ images = [] }) => {
  if (!images.length) return null;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
    appendDots: (dots) => (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {dots}
      </div>
    ),
    customPaging: (i) => (
      <button
        className="w-3 h-3 rounded-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 opacity-80 hover:opacity-100 transition-all"
        aria-label={`Go to image ${i + 1}`}
        type="button"
      />
    ),
  };

  const activeDotStyle = `
    .slick-dots .slick-active button {
      @apply w-4 h-4 bg-accent border-accent shadow-lg opacity-100;
    }
    .dark .slick-dots .slick-active button {
      @apply bg-accent-dark border-accent-dark;
    }
  `;

  return (
    <div className="relative group h-48 w-full">
      <style>{activeDotStyle}</style>
      <Slider {...settings}>
        {images.map((img, idx) => (
          <div key={idx} className="h-48 w-full">
            <img
              src={img.url}
              alt={`Property image ${idx + 1}`}
              className="w-full h-48 object-cover rounded-xl"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};
