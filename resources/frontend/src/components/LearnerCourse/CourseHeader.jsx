import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from '@mui/icons-material';
import ProgressBar from './ProgressBar';

/**
 * CourseHeader Component
 * Sticky header for the course player with title and navigation
 *
 * @param {Object} props
 * @param {string} props.courseTitle - Title of the current course
 * @param {Function} props.toggleSidebar - Function to toggle sidebar on mobile
 * @param {number} props.progress - Progress of the course
 */
const CourseHeader = ({ courseTitle, toggleSidebar, progress }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Course Title - Hidden on mobile, visible on larger screens */}
            <h1 className="ml-4 text-xl font-semibold text-gray-900">{courseTitle}</h1>
          </div>
        </div>
        <div className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression</span>
            <span className="text-sm font-medium text-gray-700">{progress}%</span>
          </div>
          <ProgressBar percent={progress} />
        </div>
      </div>
    </header>
  );
};

CourseHeader.propTypes = {
  courseTitle: PropTypes.string.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  progress: PropTypes.number.isRequired,
};

export default CourseHeader;
