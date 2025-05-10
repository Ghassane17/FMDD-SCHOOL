
import React, { useState } from 'react';
import CourseHeader from '../components/LearnerCourse/CourseHeader';
import CourseSidebar from '../components/LearnerCourse/CourseSidebar';
import CourseContent from '../components/LearnerCourse/CourseContent';
import { dummyCourseData } from '../data/courseData';

/**
 * Formation Page - Course Player Component
 * Main container for the course player experience
 */
const LearnerCourse = () => {
  // State to track current module index
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  
  // State to control sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Get current module from dummy data
  const currentModule = dummyCourseData.modules[currentModuleIndex];
  
  /**
   * Toggle sidebar visibility (for mobile view)
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  /**
   * Navigate to previous module if available
   */
  const goToPreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  /**
   * Navigate to next module if available
   */
  const goToNextModule = () => {
    if (currentModuleIndex < dummyCourseData.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    }
  };

  /**
   * Set specific module as current
   */
  const selectModule = (index) => {
    setCurrentModuleIndex(index);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header */}
      <CourseHeader 
        courseTitle={dummyCourseData.title} 
        toggleSidebar={toggleSidebar} 
      />
      
      <div className="flex flex-1 relative">
        {/* Sidebar - hidden on mobile by default */}
        <CourseSidebar
          modules={dummyCourseData.modules}
          currentModuleIndex={currentModuleIndex}
          progress={dummyCourseData.progress}
          isOpen={isSidebarOpen}
          onModuleSelect={selectModule}
        />
        
        {/* Main Content Area */}
        <CourseContent
          currentModule={currentModule}
          hasPrevious={currentModuleIndex > 0}
          hasNext={currentModuleIndex < dummyCourseData.modules.length - 1}
          onPreviousClick={goToPreviousModule}
          onNextClick={goToNextModule}
        />
      </div>
    </div>
  );
};

export default LearnerCourse;
