
import React, { useState } from 'react';
import { Star, Users } from 'lucide-react';
import { trainerData } from '../../data/trainerData';
import { useNavigate } from 'react-router-dom';

const CourseList = () => {
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseImage, setCourseImage] = useState(null);
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const courseData = {
      title: courseTitle,
      description: courseDescription,
      image: courseImage ? URL.createObjectURL(courseImage) : null
    };
    navigate('/create-course', { state: { courseData } });
    setShowCourseForm(false);
  };
  
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setCourseImage(e.target.files[0]);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Mes Cours</h2>
        <button 
          onClick={() => setShowCourseForm(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <span className="mr-2">+</span>
          Ajouter un cours
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trainerData.courses.map(course => (
          <div key={course.id} className="border rounded-lg overflow-hidden">
            <img 
              src={course.image} 
              alt={course.title} 
              className="w-full h-40 object-cover" 
            />
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{course.title}</h3>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-gray-600 text-sm">{course.students} apprenants</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-gray-600 text-sm">{course.rating}/5</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <button className="text-blue-600 hover:text-blue-800 font-medium">Modifier</button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg">
                  Voir le cours
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {showCourseForm && (
        <div className="fixed inset-0 backdrop-blur-[2px] bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full">
            <h2 className="text-xl font-bold mb-4">Ajouter un nouveau cours</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Titre du cours</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Titre du cours"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Description du cours..."
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Image du cours</label>
                <input
                  type="file"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCourseForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Suivant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;
