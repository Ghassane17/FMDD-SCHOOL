import React from 'react';
import Slider from 'react-slick';
import { trainerData } from '../../data/trainerData.js';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Custom arrow components for the slider
const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-[-40px] top-1/2 transform -translate-y-1/2 bg-blue-800 text-white p-2 rounded-full z-10 hover:bg-blue-900"
  >
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-[-40px] top-1/2 transform -translate-y-1/2 bg-blue-800 text-white p-2 rounded-full z-10 hover:bg-blue-900"
  >
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
);

export default function PopularCourses() {
  // Slider settings
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="py-8 md:py-12 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-800 text-center mb-8">
          Nos Formations
        </h2>

        <Slider {...settings}>
          {trainerData.courses.map((course) => (
            <div key={course.id} className="px-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.level}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {course.students} étudiants • Note: {course.rating}
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