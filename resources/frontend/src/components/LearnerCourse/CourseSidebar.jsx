import React from 'react';
import { FileText, Video, Image, FileQuestion, CheckCircle } from 'lucide-react';

/**
 * CourseSidebar Component
 * Displays the course modules navigation
 * 
 * @param {Object} props
 * @param {Array} props.modules - Array of course modules
 * @param {number} props.currentModuleIndex - Index of the current module
 * @param {number} props.progress - Overall course progress
 * @param {boolean} props.isOpen - Whether the sidebar is open
 * @param {Function} props.onModuleSelect - Handler for module selection
 */
const CourseSidebar = ({ 
  modules = [], 
  currentModuleIndex, 
  progress = 0,
  isOpen = false,
  onModuleSelect 
}) => {
  // Module type icon mapping
  const moduleTypeIcons = {
    text: <FileText className="w-5 h-5 text-blue-500" />,
    pdf: <FileText className="w-5 h-5 text-red-500" />,
    quiz: <FileQuestion className="w-5 h-5 text-green-500" />,
    image: <Image className="w-5 h-5 text-purple-500" />,
    video: <Video className="w-5 h-5 text-orange-500" />
  };

  // Default icon for unknown module types
  const defaultIcon = <FileText className="w-5 h-5 text-gray-500" />;

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-30
      w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="h-full flex flex-col">
        {/* Course Progress */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium mb-2">Course Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress}% Complete</p>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-lg font-medium mb-4">Course Modules</h3>
          <div className="space-y-2">
            {modules.map((module, index) => (
              <button
                key={module.id}
                onClick={() => onModuleSelect(index)}
                className={`
                  w-full text-left p-3 rounded-lg border transition-colors
                  ${currentModuleIndex === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {moduleTypeIcons[module.type] || defaultIcon}
                  <div className="flex-1">
                    <p className="font-medium">{module.title}</p>
                    <p className="text-sm text-gray-500">
                      {module.type ? module.type.charAt(0).toUpperCase() + module.type.slice(1) : 'Module'}
                      {module.duration && ` • ${module.duration} min`}
                    </p>
                  </div>
                  {module.completed && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CourseSidebar;
