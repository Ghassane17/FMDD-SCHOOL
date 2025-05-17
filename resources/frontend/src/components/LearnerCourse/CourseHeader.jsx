
import React from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * CourseHeader Component
 * Sticky header for the course player with title and navigation
 *
 * @param {Object} props
 * @param {string} props.courseTitle - Title of the current course
 * @param {Function} props.toggleSidebar - Function to toggle sidebar on mobile
 */
const CourseHeader = ({ courseTitle, toggleSidebar }) => {
  return (
<header className="sticky top-0 bg-white shadow-sm z-50 px-4 py-3 w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Course Title - Hidden on mobile, visible on larger screens */}
        <h1 className="text-lg font-medium hidden sm:block">{courseTitle}</h1>

        {/* Back to Dashboard Link */}
        <Link
          to="/learner"
          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
        >
          <ArrowLeft size={16} className="mr-1" />
          Retour au Tableau de Bord
        </Link>
      </div>
    </header>
  );
};

export default CourseHeader;
