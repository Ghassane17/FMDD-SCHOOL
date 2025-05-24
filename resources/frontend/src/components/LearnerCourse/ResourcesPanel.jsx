import React from 'react';
import { FileText, Video, Image, FileQuestion } from 'lucide-react';

/**
 * ResourcesPanel Component
 * Displays course resources
 * 
 * @param {Object} props
 * @param {Array} props.resources - Array of course resources
 */
const ResourcesPanel = ({ resources = [] }) => {
  // Resource type icon mapping
  const resourceTypeIcons = {
    pdf: <FileText className="w-5 h-5 text-red-500" />,
    video: <Video className="w-5 h-5 text-blue-500" />,
    image: <Image className="w-5 h-5 text-purple-500" />,
    notebook: <FileText className="w-5 h-5 text-green-500" />,
    dataset: <FileText className="w-5 h-5 text-orange-500" />,
    tools: <FileText className="w-5 h-5 text-yellow-500" />
  };

  if (resources.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-medium mb-4">Course Resources</h3>
        <p className="text-gray-500 text-center py-4">
          No resources available for this course.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-medium mb-4">Course Resources</h3>
      
      <div className="space-y-3">
        {resources.map((resource, index) => (
          <a
            key={index}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            {resourceTypeIcons[resource.type]}
            <div>
              <p className="font-medium">{resource.name}</p>
              <p className="text-sm text-gray-500 capitalize">{resource.type}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ResourcesPanel;
