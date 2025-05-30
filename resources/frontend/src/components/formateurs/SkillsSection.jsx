import React, { useState } from 'react';
import { Award, Globe, Code, Edit, Trash2, Plus } from 'lucide-react';

const SkillsSection = ({ instructorData }) => {
  const [skills, setSkills] = useState(instructorData?.skills || []);
  const [languages, setLanguages] = useState(instructorData?.languages || []);
  const [certifications, setCertifications] = useState(instructorData?.certifications || []);

  // Edit mode state
  const [editMode, setEditMode] = useState(''); // 'skill', 'language', 'certification', or ''
  const [editBuffer, setEditBuffer] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // Start editing a section
  const handleEdit = (type) => {
    setEditMode(type);
    if (type === 'skill') setEditBuffer([...skills]);
    if (type === 'language') setEditBuffer([...languages]);
    if (type === 'certification') setEditBuffer([...certifications]);
    setInputValue('');
  };
  // Cancel editing
  const handleCancel = () => {
    setEditMode('');
    setEditBuffer([]);
    setInputValue('');
  };
  // Save editing
  const handleSave = () => {
    if (editMode === 'skill') setSkills(editBuffer);
    if (editMode === 'language') setLanguages(editBuffer);
    if (editMode === 'certification') setCertifications(editBuffer);
    setEditMode('');
    setEditBuffer([]);
    setInputValue('');
  };
  // Add item
  const handleAdd = () => {
    if (!inputValue.trim()) return;
    setEditBuffer((prev) => [...prev, editMode === 'language' ? { name: inputValue } : inputValue]);
    setInputValue('');
  };
  // Delete item
  const handleDelete = (index) => {
    setEditBuffer((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
        <Code className="h-6 w-6 text-blue-600" /> Compétences
      </h2>
      {/* Skills */}
      <div className="mb-8">
        <div className="flex items-center mb-3 justify-between">
          <div className="flex items-center">
            <Code className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium">Compétences</h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.length > 0 ? (
            skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                {skill}
              </span>
            ))
          ) : (
            <p className="text-gray-500">Aucune compétence ajoutée</p>
          )}
        </div>
      </div>
      {/* Languages */}
      <div className="mb-8">
        <div className="flex items-center mb-3 justify-between">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium">Langues</h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {languages.length > 0 ? (
            languages.map((lang, index) => (
              <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                {lang.name}
              </span>
            ))
          ) : (
            <p className="text-gray-500">Aucune langue ajoutée</p>
          )}
        </div>
      </div>
      {/* Certifications */}
      <div>
        <div className="flex items-center mb-3 justify-between">
          <div className="flex items-center">
            <Award className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium">Certifications</h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {certifications.length > 0 ? (
            certifications.map((cert, index) => (
              <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center gap-1">
                {cert.name}
              </span>
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
