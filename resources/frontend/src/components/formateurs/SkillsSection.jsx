
import React from 'react';
import { BookOpen } from 'lucide-react';
import { trainerData } from '../../data/trainerData';

const SkillsSection = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Compétences & Certifications</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Domaines d'expertise</h3>
        <div className="flex flex-wrap gap-2">
          {trainerData.skills.map((skill, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Langues parlées</h3>
        <div className="flex flex-wrap gap-4">
          {trainerData.languages.map((language, index) => (
            <div key={index} className="flex items-center">
              <span className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full mr-2 font-bold text-xs">
                {language.code}
              </span>
              <span>{language.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Certifications & Diplômes</h3>
        <div className="space-y-3">
          {trainerData.certifications.map((cert, index) => (
            <div key={index} className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{cert.name}</p>
                <p className="text-gray-600 text-sm">{cert.institution}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;
