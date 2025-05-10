
import React from 'react';
import { FileDown } from 'lucide-react';

/**
 * ResourcesPanel Component
 * Panel for displaying downloadable resources
 * 
 * @param {Object} props
 * @param {Array} props.resources - List of resource objects with name and url
 */
const ResourcesPanel = ({ resources = [] }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-3">Ressources additionnelles</h3>
      
      {resources.length > 0 ? (
        <ul className="space-y-3">
          {resources.map((resource, index) => (
            <li key={index}>
              <a 
                href={resource.url}
                className="flex items-center py-2 px-3 border border-gray-200 rounded hover:bg-gray-50 transition"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FileDown className="mr-2 h-5 w-5 text-gray-500" />
                <span>{resource.name}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">Aucune ressource disponible pour ce module.</p>
      )}
    </div>
  );
};

export default ResourcesPanel;
