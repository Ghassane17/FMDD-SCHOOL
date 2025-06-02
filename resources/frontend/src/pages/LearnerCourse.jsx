import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import CourseHeader from '../components/LearnerCourse/CourseHeader';
import CourseSidebar from '../components/LearnerCourse/CourseSidebar';
import CourseContent from '../components/LearnerCourse/CourseContent';
import { isAuthenticated, moduleDetails, getExam, markModuleAsCompleted } from '../services/api.js';

/**
 * Course Player Component
 * Displays a specific enrolled course for the learner
 */
const LearnerCourse = () => {
    const { courseId, moduleId } = useParams();
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState(null);
    const [modules, setModules] = useState([]);
    const [currentModule, setCurrentModule] = useState(null);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notes, setNotes] = useState('');
    const [hasExam, setHasExam] = useState(false);
    const [progress, setProgress] = useState(0);

    // Calculate course progress
    const calculateProgress = () => {
        if (!modules.length) return 0;
        const completedModules = modules.filter(module => module.is_completed).length;
        return Math.round((completedModules / modules.length) * 100);
    };

    useEffect(() => {
        const fetchModuleData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check authentication
                if (!isAuthenticated()) {
                    console.log('User not authenticated, redirecting to login');
                    navigate('/login', { state: { from: `/learner/courses/${courseId}/${moduleId}` } });
                    return;
                }

                console.log('Fetching module data for:', { courseId, moduleId });
                const moduleData = await moduleDetails(courseId, moduleId);
                console.log('Received module data:', moduleData);

                if (!moduleData || !moduleData.course) {
                    console.error('Invalid module data received:', moduleData);
                    throw new Error('Invalid course data received from server');
                }

                if (!moduleData.modules || !moduleData.modules.length) {
                    console.error('No modules found in course data:', moduleData);
                    throw new Error('No modules found in this course');
                }

                // Set course data
                setCourseData(moduleData.course);
                setModules(moduleData.modules);
                setCurrentModule(moduleData.currentModule);
                setCurrentModuleIndex(moduleData.modules.findIndex(m => m.id === parseInt(moduleId, 10)));
                setNotes(moduleData.notes || '');

                // Check if exam is available
                const hasExam = moduleData.course.exam !== null;
                setHasExam(hasExam);

                // Reset progress if needed
                if (moduleData.course.progress === 0) {
                    console.log('Resetting progress for new enrollment');
                    setProgress(0);
                    // Reset all module completion statuses
                    const resetModules = moduleData.modules.map(module => ({
                        ...module,
                        is_completed: false
                    }));
                    setModules(resetModules);
                } else {
                    setProgress(moduleData.course.progress);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching module data:', err);
                setError(err.message || 'Failed to load module data');
                setLoading(false);
            }
        };

        fetchModuleData();
    }, [courseId, moduleId, navigate]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const goToPreviousModule = async () => {
        if (currentModuleIndex > 0) {
            const newIndex = currentModuleIndex - 1;
            try {
                const response = await moduleDetails(parseInt(courseId, 10), modules[newIndex].id);
                setCurrentModule(response.module);
                setCurrentModuleIndex(newIndex);
                navigate(`/learner/courses/${courseId}/${modules[newIndex].id}`);
            } catch (error) {
                console.error('Failed to load previous module:', error);
                setError('Failed to load previous module.');
            }
        }
    };

    const goToNextModule = async () => {
        if (currentModuleIndex < modules.length - 1) {
            const newIndex = currentModuleIndex + 1;
            try {
                const response = await moduleDetails(parseInt(courseId, 10), modules[newIndex].id);
                setCurrentModule(response.module);
                setCurrentModuleIndex(newIndex);
                navigate(`/learner/courses/${courseId}/${modules[newIndex].id}`);
            } catch (error) {
                console.error('Failed to load next module:', error);
                setError('Failed to load next module.');
            }
        }
    };

    const selectModule = async (index) => {
        try {
            const response = await moduleDetails(parseInt(courseId, 10), modules[index].id);
            setCurrentModule(response.module);
            setCurrentModuleIndex(index);
            navigate(`/learner/courses/${courseId}/${modules[index].id}`);
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            }
        } catch (err) {
            console.error('❌ Select Module Error:', err);
            setError(err.message || 'Failed to load selected module. Please try again.');
        }
    };

    const handleQuizComplete = (moduleId, score) => {
        console.log(`Quiz ${moduleId} completed with score: ${score * 100}%`);
    };

    const handleSaveNotes = (noteText, rating) => {
        setNotes(noteText);
        console.log('Notes saved:', { noteText, rating });
    };

    const retryFetch = async () => {
        setError(null);
        setLoading(true);
        try {
            const parsedCourseId = parseInt(courseId, 10);
            const parsedModuleId = moduleId ? parseInt(moduleId, 10) : null;
            if (isNaN(parsedCourseId) || parsedCourseId <= 0) {
                throw new Error('Invalid course ID');
            }
            const moduleResponse = await moduleDetails(parsedCourseId, parsedModuleId);
            if (!moduleResponse.course || !moduleResponse.modules.length) {
                throw new Error('No modules available for this course');
            }
            setCourseData(moduleResponse.course);
            setModules(moduleResponse.modules);
            setCurrentModule(moduleResponse.module || moduleResponse.modules[0]);
            const index = moduleResponse.module
                ? moduleResponse.modules.findIndex(m => m.id === moduleResponse.module.id)
                : 0;
            setCurrentModuleIndex(index >= 0 ? index : 0);

            try {
                const examResponse = await getExam(parsedCourseId);
                setHasExam(!!examResponse.data?.exam);
            } catch (examErr) {
                console.warn('No exam found:', examErr.message);
                setHasExam(false);
            }
        } catch (err) {
            setError(err.message || 'Failed to load course.');
        } finally {
            setLoading(false);
        }
    };

    const handleModuleComplete = async (moduleId) => {
        try {
            console.log('Frontend: Attempting to mark module as completed:', { courseId, moduleId });
            const response = await markModuleAsCompleted(parseInt(courseId, 10), moduleId);
            console.log('Frontend: Module completion response:', response);
            
            if (response.success) {
                // Update the current module's completion status
                setCurrentModule(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        is_completed: true
                    };
                });
                
                // Update the module in the modules list
                setModules(prev => prev.map(module => 
                    module.id === moduleId 
                        ? { ...module, is_completed: true }
                        : module
                ));

                // Show success message
                toast.success('Module marked as completed!');
            } else {
                toast.error(response.message || 'Failed to mark module as completed');
            }
        } catch (error) {
            console.error('Frontend: Failed to mark module as completed:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Failed to mark module as completed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Loading course content...</p>
                </div>
            </div>
        );
    }

    if (error || !courseData || !currentModule) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <p className="text-red-500 mb-4">{error || 'Course or module not found.'}</p>
                    <div className="space-y-3">
                        <button
                            onClick={retryFetch}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/learner/courses')}
                            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                            Back to Courses
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">{courseData.title}</h1>
                        <div className="text-sm text-gray-600">
                            Progress: {progress}%
                        </div>
                    </div>
                    <CourseHeader 
                        courseTitle={courseData.title} 
                        toggleSidebar={toggleSidebar}
                        progress={calculateProgress()}
                    />
                    <div className="flex flex-1 overflow-hidden">
                        <CourseSidebar
                            modules={modules}
                            currentModuleId={currentModule.id}
                            onModuleSelect={selectModule}
                            isOpen={isSidebarOpen}
                            courseId={parseInt(courseId, 10)}
                            hasExam={hasExam}
                            progress={calculateProgress()}
                        />
                        <CourseContent
                            currentModule={currentModule}
                            hasPrevious={currentModuleIndex > 0}
                            hasNext={currentModuleIndex < modules.length - 1}
                            onPreviousClick={goToPreviousModule}
                            onNextClick={goToNextModule}
                            onQuizComplete={(score) => handleQuizComplete(currentModule.id, score)}
                            courseId={courseId}
                            onSaveNotes={handleSaveNotes}
                            notes={notes}
                            onModuleComplete={handleModuleComplete}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearnerCourse;
