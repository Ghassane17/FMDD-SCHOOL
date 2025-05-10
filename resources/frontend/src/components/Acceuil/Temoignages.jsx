import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { testimonials } from '../../data/temoignages.js';

export default function TestimonialsSection() {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000, // Auto-slide every 3 seconds
    arrows: false, // Disable navigation arrows
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          autoplay: true,
          autoplaySpeed: 3000, // Maintain auto-slide on tablet
          arrows: false,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          autoplay: false, // Disable auto-slide on mobile for better UX
          arrows: false,
        },
      },
    ],
  };

  return (
    <div className="py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-800 text-left mb-8">
          Témoignages :
        </h2>

        <Slider {...settings}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className="px-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-sm h-72 flex flex-col transform transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center mb-3">
                    <img
                      src={testimonial.imageUrl}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p
                    className="text-sm text-gray-600 italic flex-1 overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {testimonial.testimonial}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}