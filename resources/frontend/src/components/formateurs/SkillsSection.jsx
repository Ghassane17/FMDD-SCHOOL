import React from 'react';
import { Award, Globe, Code } from 'lucide-react';

const SkillsSection = ({ instructorData }) => {
  const skills = instructorData?.skills || [];
  const languages = instructorData?.languages || [];
  const certifications = instructorData?.certifications || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Compétences & Certifications</h2>
      
      {/* Skills */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <Code className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-medium">Compétences</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.length > 0 ? (
            skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="text-gray-500">Aucune compétence ajoutée</p>
          )}
        </div>
      </div>

      {/* Languages */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <Globe className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-medium">Langues</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {languages.length > 0 ? (
            languages.map((lang, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {lang.name} {lang.code && `(${lang.code})`}
              </span>
            ))
          ) : (
            <p className="text-gray-500">Aucune langue ajoutée</p>
          )}
        </div>
      </div>

      {/* Certifications */}
      <div>
        <div className="flex items-center mb-3">
          <Award className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-medium">Certifications</h3>
        </div>
        <div className="space-y-3">
          {certifications.length > 0 ? (
            certifications.map((cert, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-grow">
                  <h4 className="font-medium">{cert.name}</h4>
                  {cert.institution && (
                    <p className="text-sm text-gray-600">{cert.institution}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Aucune certification ajoutée</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;
