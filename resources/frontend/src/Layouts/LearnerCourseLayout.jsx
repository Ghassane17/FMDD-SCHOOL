import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import CourseHeader from '../components/LearnerCourse/CourseHeader';
import CourseSidebar from '../components/LearnerCourse/CourseSidebar';
import { isAuthenticated, moduleDetails, getExam } from '../services/api.js';

// Course Context for sharing state between course components
const CourseContext = createContext();

export const useCourseContext = () => {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error('useCourseContext must be used within CourseLearnerLayout');
    }
    return context;
};

/**
 * Course Learner Layout Component
 * Provides layout structure using existing CourseHeader and CourseSidebar components
 * Handles course-level data fetching and state management
 */
const CourseLearnerLayout = () => {
    const { courseId, moduleId } = useParams();
    const navigate = useNavigate();

    // Course data state
    const [courseData, setCourseData] = useState(null);
    const [modules, setModules] = useState([]);
    const [currentModule, setCurrentModule] = useState(null);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasExam, setHasExam] = useState(false);
    const [progress, setProgress] = useState(0);

    // Calculate course progress
    const calculateProgress = () => {
        if (!modules.length) return 0;
        const completedModules = modules.filter(module => module.is_completed).length;
        return Math.round((completedModules / modules.length) * 100);
    };

    // Fetch course data
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

                // Check if exam is available
                const hasExam = moduleData.course.exam !== null;
                setHasExam(hasExam);

                // Set progress
                if (moduleData.course.progress === 0) {
                    console.log('Resetting progress for new enrollment');
                    setProgress(0);
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

    // Toggle sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Module selection handler
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

    // Context value
    const courseContextValue = {
        courseId,
        moduleId,
        courseData,
        modules,
        currentModule,
        currentModuleIndex,
        loading,
        error,
        hasExam,
        progress,
        calculateProgress,
        toggleSidebar,
        selectModule,
        setModules,
        setCurrentModule,
        setProgress,
    };

    // Loading state
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

    // Error state
    if (error || !courseData || !currentModule) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <p className="text-red-500 mb-4">{error || 'Course or module not found.'}</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
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
        <CourseContext.Provider value={courseContextValue}>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">{courseData.title}</h1>
                            <div className="text-sm text-gray-600">
                                Progress: {progress}%
                            </div>
                        </div>

                        {/* Course Header - Your existing component */}
                        <CourseHeader
                            courseTitle={courseData.title}
                            toggleSidebar={toggleSidebar}
                            progress={calculateProgress()}
                        />

                        {/* Main Layout Container */}
                        <div className="flex flex-1 overflow-hidden">
                            {/* Course Sidebar - Your existing component */}
                            <CourseSidebar
                                modules={modules}
                                currentModuleId={currentModule.id}
                                onModuleSelect={selectModule}
                                isOpen={isSidebarOpen}
                                courseId={parseInt(courseId, 10)}
                                hasExam={hasExam}
                                progress={calculateProgress()}
                            />

                            {/* Main Content Area - Where LearnerCourse content will render */}
                            <div className="flex-1 overflow-auto">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CourseContext.Provider>
    );
};

export default CourseLearnerLayout;
