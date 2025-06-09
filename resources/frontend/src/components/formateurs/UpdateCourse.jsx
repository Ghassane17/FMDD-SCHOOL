import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  FileText, 
  Video, 
  Image, 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  Eye, 
  EyeOff,
  ChevronUp,
  ChevronDown,
  Upload,
  Link,
  Award,
  Settings,
  Check,
  ArrowLeft,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  File as FileIcon
} from 'lucide-react';
import { getAllContentCourse } from '../../services/api_instructor';

const backend_url = import.meta.env.VITE_BACKEND_URL;

// Helper to get the correct course thumbnail URL
const getCourseThumbnailUrl = (thumbnail) => {
  if (!thumbnail) return '/placeholder-image.png'; // Use your placeholder path
  if (thumbnail.startsWith('http')) return thumbnail;
  return backend_url + thumbnail;
};

const UpdateCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingSection, setEditingSection] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewModal, setPreviewModal] = useState({ open: false, type: '', src: '' });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getAllContentCourse(courseId);
        setCourse(data.course);
        console.log('data', data);
        console.log('backend_url', backend_url);
      } catch (err) {
        setError('Error loading course data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const toggleModuleExpansion = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement save functionality
      console.log('Saving course changes...', course);
      // await updateCourse(courseId, course);
      setSaving(false);
    } catch (err) {
      setError('Error saving course changes');
      console.error('Error:', err);
      setSaving(false);
    }
  };

  const addModule = () => {
    const newModule = {
      id: Date.now(),
      title: "New Module",
      type: "text",
      text_content: "",
      file_path: null,
      order: course.modules.length + 1,
      duration: 0,
      quiz_questions: []
    };
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const deleteModule = (moduleId) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m.id !== moduleId)
    }));
  };

  const addQuestion = (moduleId) => {
    const newQuestion = {
      id: Date.now(),
      question: "New Question",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correct_option: 0
    };
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId 
          ? { ...m, quiz_questions: [...m.quiz_questions, newQuestion] }
          : m
      )
    }));
  };

  const addResource = () => {
    const newResource = {
      id: Date.now(),
      name: "New Resource",
      type: "link",
      url: ""
    };
    setCourse(prev => ({
      ...prev,
      resources: [...prev.resources, newResource]
    }));
  };

  const handleDeleteItem = (type, id) => {
    setDeleteItemType(type);
    setDeleteItemId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      // TODO: Implement delete functionality
      console.log(`Deleting ${deleteItemType} with ID: ${deleteItemId}`);
      setShowDeleteConfirm(false);
    } catch (err) {
      setError('Error deleting item');
      console.error('Error:', err);
    }
  };

  const moveModule = (index, direction) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= modules.length) return prev;
      const temp = modules[index];
      modules[index] = modules[newIndex];
      modules[newIndex] = temp;
      // Update order property if needed
      modules.forEach((m, i) => m.order = i + 1);
      return { ...prev, modules };
    });
  };

  // Quiz editing helpers
  const handleQuizQuestionChange = (moduleId, qIndex, field, value) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              quiz_questions: m.quiz_questions.map((q, i) =>
                i === qIndex ? { ...q, [field]: value } : q
              ),
            }
          : m
      ),
    }));
  };
  const handleQuizOptionChange = (moduleId, qIndex, optIndex, value) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              quiz_questions: m.quiz_questions.map((q, i) =>
                i === qIndex
                  ? {
                      ...q,
                      options: q.options.map((opt, oi) =>
                        oi === optIndex ? value : opt
                      ),
                    }
                  : q
              ),
            }
          : m
      ),
    }));
  };
  const handleQuizCorrectOption = (moduleId, qIndex, optIndex) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              quiz_questions: m.quiz_questions.map((q, i) =>
                i === qIndex ? { ...q, correct_option: optIndex } : q
              ),
            }
          : m
      ),
    }));
  };
  const handleQuizAddQuestion = (moduleId) => {
    const newQuestion = {
      id: Date.now(),
      question: 'New Question',
      options: ['Option 1', 'Option 2'],
      correct_option: 0,
    };
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? { ...m, quiz_questions: [...m.quiz_questions, newQuestion] }
          : m
      ),
    }));
  };
  const handleQuizDeleteQuestion = (moduleId, qIndex) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              quiz_questions: m.quiz_questions.filter((_, i) => i !== qIndex),
            }
          : m
      ),
    }));
  };
  const handleQuizAddOption = (moduleId, qIndex) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              quiz_questions: m.quiz_questions.map((q, i) =>
                i === qIndex
                  ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] }
                  : q
              ),
            }
          : m
      ),
    }));
  };
  const handleQuizRemoveOption = (moduleId, qIndex, optIndex) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId
          ? {
              ...m,
              quiz_questions: m.quiz_questions.map((q, i) => {
                if (i !== qIndex) return q;
                if (q.options.length <= 2) return q; // Don't allow less than 2 options
                const newOptions = q.options.filter((_, oi) => oi !== optIndex);
                let newCorrect = q.correct_option;
                if (q.correct_option === optIndex) newCorrect = 0;
                else if (q.correct_option > optIndex) newCorrect = q.correct_option - 1;
                return { ...q, options: newOptions, correct_option: newCorrect };
              }),
            }
          : m
      ),
    }));
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Save className="h-4 w-4" />
                <span>Save All Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
          <div className="relative h-64 ">
            <img 
              src={getCourseThumbnailUrl(course.course_thumbnail)}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-opacity-0 flex items-end">


              <div className="p-8 text-white bg-gradient-to-t from-gray-900 via-black/50 to-transparent rounded-lg m-4">
              {/* <div className="p-8 text-black backdrop-blur-sm bg-white/20 rounded-lg m-4"> */}

                <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{course.students_count} students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{Math.floor(course.duration_min / 60)}h {course.duration_min % 60}m</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{course.rating}/5</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {course.is_published ? (
                      <>
                        <Eye className="h-4 w-4" />
                        <span>Published</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4" />
                        <span>Draft</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'modules', label: 'Modules', icon: FileText },
                { id: 'exam', label: 'Final Exam', icon: Award },
                { id: 'resources', label: 'Resources', icon: Link },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Course Overview</h2>
                <button
                  onClick={() => setEditingSection('overview')}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>

              {editingSection === 'overview' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      defaultValue={course.title}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={4}
                      defaultValue={course.description}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <input
                        type="text"
                        defaultValue={course.category}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="english">English</option>
                        <option value="french">French</option>
                        <option value="arabic">Arabic</option>
                        <option value="spanish">Spanish</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
                    <div className="mt-1 flex items-center space-x-4">
                      <img
                        src={getCourseThumbnailUrl(course.course_thumbnail)}
                        alt="Course thumbnail"
                        className="h-32 w-48 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Recommended size: 1280x720px. Max file size: 2MB
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleSave()}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => setEditingSection(null)}
                      className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-700">{course.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{course.students_count}</div>
                      <div className="text-sm text-gray-600">Students Enrolled</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{course.modules.length}</div>
                      <div className="text-sm text-gray-600">Modules</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{Math.floor(course.duration_min / 60)}h</div>
                      <div className="text-sm text-gray-600">Total Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{course.rating}</div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mt-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Level</h4>
                      <p className="text-lg text-gray-900">{course.level}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Category</h4>
                      <p className="text-lg text-gray-900">{course.category}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Language</h4>
                      <p className="text-lg text-gray-900">{course.language}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modules Tab */}
          {activeTab === 'modules' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Course Modules</h2>
                <button
                  onClick={addModule}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Module</span>
                </button>
              </div>

              {course.modules.map((module, index) => (
                <div key={module.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {module.type === 'video' && <Video className="h-6 w-6 text-red-500" />}
                          {module.type === 'text' && <FileText className="h-6 w-6 text-blue-500" />}
                          {module.type === 'image' && <Image className="h-6 w-6 text-green-500" />}
                          {module.type === 'pdf' && <FileIcon className="h-6 w-6 text-yellow-500" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{module.title}</h3>
                          <p className="text-sm text-gray-500">Module {module.order} • {module.duration} minutes</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => moveModule(index, -1)} disabled={index === 0} className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                        <button onClick={() => moveModule(index, 1)} disabled={index === course.modules.length - 1} className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                        <button onClick={() => toggleModuleExpansion(module.id)} className="p-2 text-gray-400 hover:text-gray-600">{expandedModules[module.id] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</button>
                        <button onClick={() => setEditingSection(`module-${module.id}`)} className="p-2 text-blue-600 hover:text-blue-800"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteItem('module', module.id)} className="p-2 text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>

                  {expandedModules[module.id] && (
                    <div className="p-6 bg-gray-50">
                      {editingSection === `module-${module.id}` ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                              <input
                                type="text"
                                defaultValue={module.title}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                              <input
                                type="text"
                                value={module.type.charAt(0).toUpperCase() + module.type.slice(1)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                                disabled
                              />
                            </div>
                          </div>
                          {/* Content based on type */}
                          {module.type === 'text' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                              <textarea
                                rows={4}
                                defaultValue={module.text_content}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          )}
                          {module.type === 'video' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
                              {module.file_path && (
                                <div className="flex items-center space-x-2 mb-2">
                                  <button onClick={() => setPreviewModal({ open: true, type: 'video', src: backend_url + module.file_path })} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Preview</button>
                                  <video controls className="h-16 w-auto rounded">
                                    <source src={backend_url + module.file_path} type="video/mp4" />
                                  </video>
                                </div>
                              )}
                              <input type="file" accept="video/*" className="block w-full text-sm text-gray-500" />
                            </div>
                          )}
                          {module.type === 'image' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Image File</label>
                              {module.file_path && (
                                <div className="flex items-center space-x-2 mb-2">
                                  <button onClick={() => setPreviewModal({ open: true, type: 'image', src: backend_url + module.file_path })} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Preview</button>
                                  <img src={backend_url + module.file_path} alt="Module" className="h-16 w-auto rounded" />
                                </div>
                              )}
                              <input type="file" accept="image/*" className="block w-full text-sm text-gray-500" />
                            </div>
                          )}
                          {module.type === 'pdf' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">PDF File</label>
                              {module.file_path && (
                                <div className="flex items-center space-x-2 mb-2">
                                  <button onClick={() => setPreviewModal({ open: true, type: 'pdf', src: backend_url + module.file_path })} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Preview</button>
                                  <FileIcon className="h-8 w-8 text-yellow-500" />
                                  <span className="text-sm text-gray-700">{module.file_path.split('/').pop()}</span>
                                </div>
                              )}
                              <input type="file" accept="application/pdf" className="block w-full text-sm text-gray-500" />
                            </div>
                          )}
                          {module.type === 'quiz' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Questions</label>
                              <div className="space-y-4">
                                {module.quiz_questions.map((q, qIndex) => (
                                  <div key={q.id} className="border rounded-lg p-4 bg-white">
                                    <div className="flex items-center justify-between mb-2">
                                      <input
                                        type="text"
                                        value={q.question}
                                        onChange={e => handleQuizQuestionChange(module.id, qIndex, 'question', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                                        placeholder={`Question ${qIndex + 1}`}
                                      />
                                      <button onClick={() => handleQuizDeleteQuestion(module.id, qIndex)} className="ml-2 p-1 text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                    <div className="space-y-2">
                                      {q.options.map((opt, optIndex) => (
                                        <div key={optIndex} className="flex items-center space-x-2 mb-1">
                                          <input
                                            type="text"
                                            value={opt}
                                            onChange={e => handleQuizOptionChange(module.id, qIndex, optIndex, e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                          />
                                          <input
                                            type="radio"
                                            checked={q.correct_option === optIndex}
                                            onChange={() => handleQuizCorrectOption(module.id, qIndex, optIndex)}
                                            className="form-radio text-green-600"
                                          />
                                          <span className="text-xs text-gray-500">Correct</span>
                                          {q.options.length > 2 && (
                                            <button onClick={() => handleQuizRemoveOption(module.id, qIndex, optIndex)} className="ml-1 p-1 text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                                          )}
                                        </div>
                                      ))}
                                      <button onClick={() => handleQuizAddOption(module.id, qIndex)} className="mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"><Plus className="h-3 w-3 mr-1" />Ajouter une option</button>
                                    </div>
                                  </div>
                                ))}
                                <button onClick={() => handleQuizAddQuestion(module.id)} className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm mt-2"><Plus className="h-4 w-4" /><span>Add Question</span></button>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleSave()}
                              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Check className="h-4 w-4" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={() => setEditingSection(null)}
                              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              <X className="h-4 w-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Show content based on type */}
                          {module.type === 'text' && (
                            <p className="text-gray-700 whitespace-pre-line">{module.text_content}</p>
                          )}
                          {module.type === 'video' && module.file_path && (
                            <div className="flex items-center space-x-2">
                              <button onClick={() => setPreviewModal({ open: true, type: 'video', src: backend_url + module.file_path })} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Preview</button>
                              <video controls className="h-16 w-auto rounded">
                                <source src={backend_url + module.file_path} type="video/mp4" />
                              </video>
                            </div>
                          )}
                          {module.type === 'image' && module.file_path && (
                            <div className="flex items-center space-x-2">
                              <button onClick={() => setPreviewModal({ open: true, type: 'image', src: backend_url + module.file_path })} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Preview</button>
                              <img src={backend_url + module.file_path} alt="Module" className="h-16 w-auto rounded" />
                            </div>
                          )}
                          {module.type === 'pdf' && module.file_path && (
                            <div className="flex items-center space-x-2">
                              <button onClick={() => setPreviewModal({ open: true, type: 'pdf', src: backend_url + module.file_path })} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Preview</button>
                              <FileIcon className="h-8 w-8 text-yellow-500" />
                              <span className="text-sm text-gray-700">{module.file_path.split('/').pop()}</span>
                            </div>
                          )}
                          {module.type === 'quiz' && (
                            <div className="space-y-3">
                              {module.quiz_questions.length === 0 ? (
                                <p className="text-gray-500">No quiz questions added yet</p>
                              ) : (
                                module.quiz_questions.map((q, qIndex) => (
                                  <div key={q.id} className="bg-white p-4 rounded-lg border">
                                    <p className="font-medium text-gray-900 mb-2">Q{qIndex + 1}: {q.question}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {q.options.map((opt, optIndex) => (
                                        <div
                                          key={optIndex}
                                          className={`p-2 rounded border text-sm ${optIndex === q.correct_option ? 'bg-green-100 border-green-300 text-green-800' : 'bg-gray-50 border-gray-200'}`}
                                        >
                                          {String.fromCharCode(65 + optIndex)}. {opt}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Exam Tab */}
          {activeTab === 'exam' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Final Exam</h2>
                <button
                  onClick={() => setEditingSection('exam')}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Exam</span>
                </button>
              </div>

              {course.exam ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{course.exam.duration_min}</div>
                      <div className="text-sm text-gray-600">Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{course.exam.passing_score}%</div>
                      <div className="text-sm text-gray-600">Passing Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{course.exam.questions.length}</div>
                      <div className="text-sm text-gray-600">Questions</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Questions</h3>
                    <div className="space-y-4">
                      {course.exam.questions.map((question, index) => (
                        <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-3">Q{index + 1}: {question.question_text}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {question.options.map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className={`p-3 rounded border text-sm ${
                                      optIndex === question.correct_index
                                        ? 'bg-green-100 border-green-300 text-green-800'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <button className="ml-4 p-2 text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No final exam configured</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Create Exam
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Course Resources</h2>
                <button
                  onClick={addResource}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Resource</span>
                </button>
              </div>

              {course.resources.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No resources added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.resources.map(resource => (
                    <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {resource.type === 'link' && <Link className="h-6 w-6 text-blue-500" />}
                            {resource.type === 'pdf' && <FileText className="h-6 w-6 text-red-500" />}
                            {resource.type === 'video' && <Video className="h-6 w-6 text-purple-500" />}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{resource.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">{resource.type}</p>
                            <a href={resource.url} className="text-sm text-blue-600 hover:text-blue-800 break-all">
                              {resource.url}
                            </a>
                          </div>
                        </div>
                        <button className="flex-shrink-0 p-1 text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Course Visibility</h3>
                    <p className="text-sm text-gray-600">Make your course visible to students</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={course.is_published}
                      className="sr-only peer"
                      onChange={() => setCourse(prev => ({ ...prev, is_published: !prev.is_published }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="font-medium text-red-900 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-700 mb-4">Once you delete a course, there is no going back. Please be certain.</p>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    Delete Course
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <button onClick={() => setPreviewModal({ open: false, type: '', src: '' })} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"><X className="h-6 w-6" /></button>
            {previewModal.type === 'image' && (
              <img src={previewModal.src} alt="Preview" className="max-h-[70vh] w-auto mx-auto rounded" />
            )}
            {previewModal.type === 'video' && (
              <video controls className="max-h-[70vh] w-full mx-auto rounded">
                <source src={previewModal.src} type="video/mp4" />
              </video>
            )}
            {previewModal.type === 'pdf' && (
              <iframe src={previewModal.src} title="PDF Preview" className="w-full h-[70vh] rounded" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateCourse;