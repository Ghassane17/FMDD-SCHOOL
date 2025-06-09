import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, Trash2, Edit2, FileText, 
  Image, Video, File, Link, AlertTriangle, X,
  ChevronDown, ChevronUp, Clock, Star, Tag
} from 'lucide-react';
import { getAllContentCourse } from '../../services/api_instructor';

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModule, setExpandedModule] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getAllContentCourse(courseId);
        setCourse(data.course);
        console.log("data", data);
      } catch (err) {
        setError('Error loading course data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleSave = async () => {
    // TODO: Implement save functionality
    console.log('Saving course changes...');
  };

  const handleModuleExpand = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const handleDeleteItem = (type, id) => {
    setDeleteItemType(type);
    setDeleteItemId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    // TODO: Implement delete functionality
    console.log(`Deleting ${deleteItemType} with ID: ${deleteItemId}`);
    setShowDeleteConfirm(false);
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
          Course not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(`/manage-course/${courseId}`)}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Back to Course</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'overview' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Course Overview
                </button>
                <button
                  onClick={() => setActiveTab('modules')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'modules' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Modules
                </button>
                <button
                  onClick={() => setActiveTab('exam')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'exam' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Final Exam
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'resources' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Resources
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            {/* Course Overview Tab */}
            {activeTab === 'overview' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Course Overview</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                    <input
                      type="text"
                      value={course.title}
                      onChange={(e) => setCourse({ ...course, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={course.description}
                      onChange={(e) => setCourse({ ...course, description: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                      <select
                        value={course.level}
                        onChange={(e) => setCourse({ ...course, level: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <input
                        type="text"
                        value={course.category}
                        onChange={(e) => setCourse({ ...course, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modules Tab */}
            {activeTab === 'modules' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Course Modules</h2>
                  <button
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Module
                  </button>
                </div>
                <div className="space-y-4">
                  {course.modules.map((module) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg">
                      <div
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                        onClick={() => handleModuleExpand(module.id)}
                      >
                        <div className="flex items-center">
                          {module.type === 'text' && <FileText className="w-5 h-5 text-gray-400 mr-3" />}
                          {module.type === 'image' && <Image className="w-5 h-5 text-gray-400 mr-3" />}
                          {module.type === 'video' && <Video className="w-5 h-5 text-gray-400 mr-3" />}
                          {module.type === 'pdf' && <File className="w-5 h-5 text-gray-400 mr-3" />}
                          <span className="font-medium">{module.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement edit module
                            }}
                            className="p-1 text-gray-400 hover:text-indigo-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem('module', module.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {expandedModule === module.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      {expandedModule === module.id && (
                        <div className="p-4 border-t border-gray-200">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Module Title</label>
                              <input
                                type="text"
                                value={module.title}
                                onChange={(e) => {
                                  const updatedModules = course.modules.map(m =>
                                    m.id === module.id ? { ...m, title: e.target.value } : m
                                  );
                                  setCourse({ ...course, modules: updatedModules });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                            {module.type === 'quiz' && (
                              <div className="space-y-4">
                                <h4 className="font-medium">Quiz Questions</h4>
                                {module.quiz_questions.map((question, index) => (
                                  <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="font-medium">Question {index + 1}</span>
                                      <button
                                        onClick={() => handleDeleteItem('question', question.id)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      value={question.question}
                                      onChange={(e) => {
                                        const updatedModules = course.modules.map(m =>
                                          m.id === module.id
                                            ? {
                                                ...m,
                                                quiz_questions: m.quiz_questions.map(q =>
                                                  q.id === question.id ? { ...q, question: e.target.value } : q
                                                ),
                                              }
                                            : m
                                        );
                                        setCourse({ ...course, modules: updatedModules });
                                      }}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                                    />
                                    {/* Options */}
                                    <div className="space-y-2">
                                      {question.options.map((option, optIndex) => (
                                        <div key={optIndex} className="flex items-center space-x-2">
                                          <input
                                            type="radio"
                                            checked={question.correct_option === optIndex}
                                            onChange={() => {
                                              const updatedModules = course.modules.map(m =>
                                                m.id === module.id
                                                  ? {
                                                      ...m,
                                                      quiz_questions: m.quiz_questions.map(q =>
                                                        q.id === question.id
                                                          ? { ...q, correct_option: optIndex }
                                                          : q
                                                      ),
                                                    }
                                                  : m
                                              );
                                              setCourse({ ...course, modules: updatedModules });
                                            }}
                                          />
                                          <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => {
                                              const updatedModules = course.modules.map(m =>
                                                m.id === module.id
                                                  ? {
                                                      ...m,
                                                      quiz_questions: m.quiz_questions.map(q =>
                                                        q.id === question.id
                                                          ? {
                                                              ...q,
                                                              options: q.options.map((o, i) =>
                                                                i === optIndex ? e.target.value : o
                                                              ),
                                                            }
                                                          : q
                                                      ),
                                                    }
                                                  : m
                                              );
                                              setCourse({ ...course, modules: updatedModules });
                                            }}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                                <button
                                  className="flex items-center text-indigo-600 hover:text-indigo-700"
                                  onClick={() => {
                                    // TODO: Implement add question
                                  }}
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Question
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exam Tab */}
            {activeTab === 'exam' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Final Exam</h2>
                {course.exam ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title</label>
                      <input
                        type="text"
                        value={course.exam.title}
                        onChange={(e) => setCourse({
                          ...course,
                          exam: { ...course.exam, title: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                      <textarea
                        value={course.exam.instructions}
                        onChange={(e) => setCourse({
                          ...course,
                          exam: { ...course.exam, instructions: e.target.value }
                        })}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                        <input
                          type="number"
                          value={course.exam.duration_min}
                          onChange={(e) => setCourse({
                            ...course,
                            exam: { ...course.exam, duration_min: parseInt(e.target.value) }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
                        <input
                          type="number"
                          value={course.exam.passing_score}
                          onChange={(e) => setCourse({
                            ...course,
                            exam: { ...course.exam, passing_score: parseInt(e.target.value) }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Exam Questions</h3>
                        <button
                          className="flex items-center text-indigo-600 hover:text-indigo-700"
                          onClick={() => {
                            // TODO: Implement add question
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Question
                        </button>
                      </div>
                      {course.exam.questions.map((question, index) => (
                        <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">Question {index + 1}</span>
                            <button
                              onClick={() => handleDeleteItem('exam_question', question.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={question.question_text}
                            onChange={(e) => {
                              const updatedQuestions = course.exam.questions.map(q =>
                                q.id === question.id ? { ...q, question_text: e.target.value } : q
                              );
                              setCourse({
                                ...course,
                                exam: { ...course.exam, questions: updatedQuestions }
                              });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                          />
                          {/* Options */}
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  checked={question.correct_index === optIndex}
                                  onChange={() => {
                                    const updatedQuestions = course.exam.questions.map(q =>
                                      q.id === question.id ? { ...q, correct_index: optIndex } : q
                                    );
                                    setCourse({
                                      ...course,
                                      exam: { ...course.exam, questions: updatedQuestions }
                                    });
                                  }}
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const updatedQuestions = course.exam.questions.map(q =>
                                      q.id === question.id
                                        ? {
                                            ...q,
                                            options: q.options.map((o, i) =>
                                              i === optIndex ? e.target.value : o
                                            ),
                                          }
                                        : q
                                    );
                                    setCourse({
                                      ...course,
                                      exam: { ...course.exam, questions: updatedQuestions }
                                    });
                                  }}
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No exam has been created yet</p>
                    <button
                      className="flex items-center mx-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                      onClick={() => {
                        // TODO: Implement create exam
                      }}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Exam
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Course Resources</h2>
                  <button
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    onClick={() => {
                      // TODO: Implement add resource
                    }}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Resource
                  </button>
                </div>
                <div className="space-y-4">
                  {course.resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        {resource.type === 'pdf' && <File className="w-5 h-5 text-red-500 mr-3" />}
                        {resource.type === 'video' && <Video className="w-5 h-5 text-blue-500 mr-3" />}
                        {resource.type === 'image' && <Image className="w-5 h-5 text-green-500 mr-3" />}
                        {resource.type === 'link' && <Link className="w-5 h-5 text-purple-500 mr-3" />}
                        <div>
                          <h3 className="font-medium">{resource.name}</h3>
                          <p className="text-sm text-gray-500">{resource.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            // TODO: Implement edit resource
                          }}
                          className="p-1 text-gray-400 hover:text-indigo-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem('resource', resource.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this {deleteItemType}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCourse; 