import React from 'react';
import { motion } from 'framer-motion';
import { useLoaderData, useNavigate } from 'react-router-dom';
import CourseCard from '../components/Learner/CourseCard.jsx';

const FormationsPage = () => {
  const courses = useLoaderData();
  const navigate = useNavigate();

  const handleCardClick = (courseId) => {
    // Check if user is logged in (you can implement your own auth check)
    const isLoggedIn = localStorage.getItem('token'); // or however you check auth
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate(`/learner/courses/${courseId}`);
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                background: 'linear-gradient(45deg, #0f766e 30%, #1e40af 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Nos Formations e-Learning
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Apprenez des meilleurs experts avec nos cours interactifs et projets pratiques
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {courses && courses.length > 0 ? (
            courses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Aucune formation disponible</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Il n'y a actuellement aucune formation disponible. Veuillez réessayer plus tard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormationsPage;