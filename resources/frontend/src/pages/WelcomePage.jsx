import React from 'react';
import Hero from '../components/Acceuil/Hero.jsx'; // Added .jsx
import Partners from '../components/Acceuil/Partners.jsx'; // Added .jsx
import PopularCourses from '../components/Acceuil/PopularCourses.jsx'; // Added .jsx
import RaisonsDeRejoindre from '../components/Acceuil/RaisonsDeRejoindre.jsx'; // Added .jsx
import TestimonialsSection from '../components/Acceuil/Temoignages.jsx'; // Added .jsx
import { Link } from 'react-router-dom';

export default function WelcomePage() {
  return (
    <div>
      <Hero />
      
      {/* Formations Link Section */}
      <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Découvrez Nos Formations
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Explorez notre catalogue complet de formations et commencez votre voyage d'apprentissage dès aujourd'hui
            </p>
            <Link
              to="/formations"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg group"
            >
              Voir Toutes les Formations
              <svg
                className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <RaisonsDeRejoindre />
      <TestimonialsSection />
    </div>
  );
}