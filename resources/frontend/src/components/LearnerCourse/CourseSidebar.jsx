
import React from 'react';
import ProgressBar from './ProgressBar';
import { CheckCircle, Clock } from 'lucide-react';

/**
 * CourseSidebar Component
 * Left sidebar showing course modules and progress
 * 
 * @param {Object} props
 * @param {Array} props.modules - List of course modules
 * @param {number} props.currentModuleIndex - Index of the current active module
 * @param {number} props.progress - Overall course progress percentage
 * @param {boolean} props.isOpen - Whether sidebar is open (for mobile)
 * @param {Function} props.onModuleSelect - Handler for module selection
 */
const CourseSidebar = ({ modules, currentModuleIndex, progress, isOpen, onModuleSelect }) => {
  /**
   * Get appropriate status badge based on module status
   */
  const renderStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            <CheckCircle size={12} className="mr-1" /> Terminé
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
            <Clock size={12} className="mr-1" /> En cours
          </span>
        );
      default:
        return null;
    }
  };
  
  // Calculate completed modules
  const completedModules = modules.filter(module => module.status === 'completed').length;

  return (
    <>
      {/* Dark overlay for mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={() => onModuleSelect(currentModuleIndex)} // Close sidebar when clicking outside
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`w-64 bg-white shadow-md z-30 overflow-y-auto transition-all duration-300 ${
          isOpen ? 'fixed inset-y-0 left-0' : 'fixed -left-64 inset-y-0 lg:left-0 lg:relative'
        }`}
      >
        <div className="p-4">
          <h2 className="font-bold text-lg mb-4">Modules du cours</h2>
          
          {/* Module list */}
          <ul className="space-y-2">
            {modules.map((module, index) => (
              <li 
                key={module.id}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  index === currentModuleIndex 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onModuleSelect(index)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{module.title}</span>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{module.duration}</span>
                    {renderStatusBadge(module.status)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          {/* Progress indicator */}
          <div className="mt-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Votre progression</span>
              <span className="text-sm text-gray-500">
                {completedModules}/{modules.length} modules
              </span>
            </div>
            <ProgressBar percent={progress} />
          </div>
        </div>
      </aside>
    </>
  );
};

export default CourseSidebar;
