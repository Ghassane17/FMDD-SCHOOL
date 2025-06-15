import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, AlertTriangle, ArrowLeft, Settings2, Edit2, Users, Clock, Star, Tag } from 'lucide-react';
import { getCourseById, deleteCourse } from '../../services/api_instructor';

const backend_url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const ManageCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourseById(courseId);
        setCourse(data.course);
        setStudents(data.students);
      } catch (err) {
        setError('Erreur lors du chargement du cours');
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleDelete = async () => {
    try {
      await deleteCourse(courseId);
      setShowDeleteConfirm(false);
      localStorage.removeItem('instructorStats');
      navigate('/instructor');
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression du cours');
      setShowDeleteConfirm(false);
      console.error('Error deleting course:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 p-4 rounded-lg">
          Cours non trouvé
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/instructor/dashboard/courses')}
              className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200 cursor-pointer group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Retour aux cours</span>
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/instructor/update-course/${courseId}`)}
                className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
              >
                <Edit2 className="w-5 h-5 mr-2" />
                Modifier
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Supprimer
              </button>
            </div>
          </div>

          {/* Course Content */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative h-72">
              <img
                src={backend_url + course.course_thumbnail || '/placeholder-course.jpg'}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-6 right-6">
                <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                <div className="flex items-center space-x-4">
                  {course.is_published ? (
                    <span className="flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                      <Settings2 className="w-4 h-4 mr-1" />
                      Publié
                    </span>
                  ) : (
                    <span className="flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                      <Settings2 className="w-4 h-4 mr-1" />
                      En attente
                    </span>
                  )}
                  <span className="flex items-center text-white/90">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDuration(course.duration_min)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">{course.description}</p>
              
              {/* Course Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-indigo-50 p-6 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-indigo-600 mr-2" />
                    <h3 className="text-sm font-medium text-indigo-600">Apprenants</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{students}</p>
                </div>
                <div className="bg-amber-50 p-6 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Star className="w-5 h-5 text-amber-600 mr-2" />
                    <h3 className="text-sm font-medium text-amber-600">Note moyenne</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{course.rating || 0}/5</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 text-emerald-600 mr-2" />
                    <h3 className="text-sm font-medium text-emerald-600">Durée</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{formatDuration(course.duration_min)}</p>
                </div>
              </div>

              {/* Course Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Détails du cours</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Niveau</h3>
                    <p className="text-gray-800 font-medium">{course.level || 'Non spécifié'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Catégorie</h3>
                    <p className="text-gray-800 font-medium">{course.category || 'Non spécifiée'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Statut</h3>
                    <p className="text-gray-800 font-medium">
                      {course.is_published ? 'Publié' : 'En attente de validation'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-3">Supprimer le cours</h2>
            <p className="text-gray-600 text-center mb-8">
              Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 cursor-pointer shadow-md hover:shadow-lg"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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

export default ManageCourse; 