import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../Learner/CourseCard.jsx';

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

export default function PopularCourses({ courses }) {
  const navigate = useNavigate();

  const handleCardClick = (courseId) => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('token');
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate(`/learner/courses/${courseId}`);
  };

  // Slider settings
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(4, courses.length),
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: Math.min(3, courses.length),
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, courses.length),
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
          Formations Populaires
        </h2>

        {courses && courses.length > 0 ? (
          <Slider {...settings}>
            {courses.map((course) => (
              <div key={course.id} className="px-2">
                <CourseCard
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  image={course.course_thumbnail}
                  level={course.level}
                  students={course.students}
                  rating={course.rating}
                  instructor={course.instructor?.username}
                  onClick={() => handleCardClick(course.id)}
                />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="text-center py-8">
            <p className="text-xl text-gray-600">Pas de cours publiés pour ce moment</p>
          </div>
        )}
      </div>
    </div>
  );
}