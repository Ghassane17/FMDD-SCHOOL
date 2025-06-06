import React, { useState, useEffect } from 'react';
import { Star, Users, Clock, CheckCircle2, AlertCircle, Clock as ClockIcon, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getInstructorDashboard } from '../../services/api_instructor';

const CourseList = ({ instructorData, backend_url }) => {
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseImage, setCourseImage] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getInstructorDashboard();
        setCourses(data.courses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

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

  const getStatusBadge = (isPublished) => {
    if (isPublished) {
      return (
        <span className="flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Publié
        </span>
      );
    }
    return (
      <span className="flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
        <Clock className="w-3 h-3 mr-1" />
        En attente
      </span>
    );
  };

  const handleCourseAction = (courseId) => {
    navigate(`/manage-course/${courseId}`);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}min`;
    }
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="h-52 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mes Cours</h2>
          <p className="text-gray-600 mt-1">Gérez vos cours et leur contenu</p>
        </div>
        <button 
          onClick={() => setShowCourseForm(true)}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
        >
          <span className="mr-2">+</span>
          Créer un cours
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-xl p-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours trouvé</h3>
            <p className="text-gray-600 mb-4">Commencez par créer votre premier cours</p>
            <button 
              onClick={() => setShowCourseForm(true)}
              className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
            >
              <span className="mr-2">+</span>
              Créer un cours
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(course => (
            <div key={course.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col h-[420px] bg-white group">
              <div className="relative h-52">
                <img 
                  onClick={() => handleCourseAction(course.id)}
                  src={backend_url + course.image || '/placeholder-course.jpg'} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer" 
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(course.is_published)}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 
                  onClick={() => handleCourseAction(course.id)}
                  className="font-bold text-lg mb-2 text-gray-800 line-clamp-1 cursor-pointer hover:text-indigo-600"
                >
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{course.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-indigo-500 mr-1" />
                      <span className="text-gray-600 text-sm">{course.students} apprenants</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-indigo-500 mr-1" />
                      <span className="text-gray-600 text-sm">{formatDuration(course.duration_min)}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-amber-500 mr-1" />
                    <span className="text-gray-600 text-sm">{course.rating || 0}/5</span>
                  </div>
                </div>
                <div className="flex justify-end items-center pt-3 border-t mt-auto">
                  <button 
                    onClick={() => handleCourseAction(course.id)}
                    className="flex items-center bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    <Settings2 className="w-4 h-4 mr-2" />
                    Gérer le cours
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCourseForm && (
        <div className="fixed inset-0 backdrop-blur-[2px] bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-xl w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Ajouter un nouveau cours</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Titre du cours</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Titre du cours"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="4"
                  placeholder="Description du cours..."
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Image du cours</label>
                <input
                  type="file"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCourseForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
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
