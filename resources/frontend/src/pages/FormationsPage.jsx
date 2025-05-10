import React from 'react';
import { motion } from 'framer-motion';
import FormationCard from '../components/formations/CourseCard.jsx';
import { trainerData } from '../data/trainerData.js';

const FormationsPage = () => {
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
          {trainerData.courses.map((course) => (
            <motion.div
              key={course.id}
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <FormationCard course={course} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormationsPage;