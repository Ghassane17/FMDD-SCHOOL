import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseHeader from '../components/LearnerCourse/CourseHeader';
import CourseSidebar from '../components/LearnerCourse/CourseSidebar';
import CourseContent from '../components/LearnerCourse/CourseContent';
import { isAuthenticated, moduleDetails, getExam } from '../services/api.js';

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
    const [quizProgress, setQuizProgress] = useState({});
    const [notes, setNotes] = useState('');
    const [notesHistory, setNotesHistory] = useState([]);
    const [hasExam, setHasExam] = useState(false); // New state for exam availability

    useEffect(() => {
        if (!isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            navigate('/login', { state: { from: `/learner/courses/${courseId}${moduleId ? `/${moduleId}` : ''}` } });
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            const parsedCourseId = parseInt(courseId, 10);
            if (isNaN(parsedCourseId) || parsedCourseId <= 0) {
                console.error('Invalid course ID:', courseId);
                setError('Invalid course ID provided.');
                setLoading(false);
                return;
            }

            const parsedModuleId = moduleId ? parseInt(moduleId, 10) : null;
            if (moduleId && (isNaN(parsedModuleId) || parsedModuleId <= 0)) {
                console.error('Invalid module ID:', moduleId);
                setError('Invalid module ID provided.');
                setLoading(false);
                return;
            }

            try {
                // Fetch module details
                console.log('Fetching module details:', { courseId: parsedCourseId, moduleId: parsedModuleId });
                const moduleResponse = await moduleDetails(parsedCourseId, parsedModuleId);
                console.log('🚀 Module Details:', moduleResponse);
                
                if (!moduleResponse.course || !moduleResponse.modules.length) {
                    throw new Error('No modules available for this course');
                }

                // Log the current module data
                const currentModuleData = moduleResponse.module || moduleResponse.modules[0];
                console.log('Current Module Data:', {
                    id: currentModuleData.id,
                    title: currentModuleData.title,
                    type: currentModuleData.type,
                    file_path: currentModuleData.file_path,
                    resources: currentModuleData.resources
                });

                setCourseData(moduleResponse.course);
                setModules(moduleResponse.modules);
                setCurrentModule(currentModuleData);
                const index = moduleResponse.module
                    ? moduleResponse.modules.findIndex(m => m.id === moduleResponse.module.id)
                    : 0;
                setCurrentModuleIndex(index >= 0 ? index : 0);

                // Fetch exam availability
                try {
                    const examResponse = await getExam(parsedCourseId);
                    console.log('🚀 Exam Availability:', examResponse);
                    setHasExam(!!examResponse.data?.exam);
                } catch (examErr) {
                    console.warn('No exam found for course:', examErr.message);
                    setHasExam(false);
                }
            } catch (err) {
                console.error('❌ Fetch Error:', err);
                let errorMessage = 'Failed to load course. Please check your enrollment or try again.';
                if (err.status === 404) {
                    errorMessage = err.message.includes('module') ? 'Module not found.' : 'Course not found.';
                } else if (err.status === 400) {
                    errorMessage = 'Invalid course or module ID.';
                } else if (err.status === 403) {
                    errorMessage = 'You are not enrolled in this course.';
                } else if (err.status === 401) {
                    errorMessage = 'Authentication required.';
                } else if (err.status === 500) {
                    errorMessage = 'Server error occurred. Please try again later.';
                }
                setError(err.message || errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
            } catch (err) {
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
            } catch (err) {
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
        setQuizProgress((prev) => ({
            ...prev,
            [moduleId]: { score, completed: true },
        }));
        console.log(`Quiz ${moduleId} completed with score: ${score * 100}%`);
    };

    const handleSaveNotes = (noteText, rating) => {
        setNotes(noteText);
        setNotesHistory((prev) => [
            ...prev,
            { text: noteText, rating, timestamp: new Date().toISOString() },
        ]);
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <CourseHeader courseTitle={courseData.title} toggleSidebar={toggleSidebar} />
            <div className="flex flex-1 relative">
                <CourseSidebar
                    modules={modules}
                    currentModuleIndex={currentModuleIndex}
                    progress={courseData.progress || 0}
                    isOpen={isSidebarOpen}
                    onModuleSelect={selectModule}
                    quizProgress={quizProgress}
                    courseId={courseData.id} // Pass courseId
                    hasExam={hasExam} // Pass exam availability
                />
                <CourseContent
                    currentModule={currentModule}
                    hasPrevious={currentModuleIndex > 0}
                    hasNext={currentModuleIndex < modules.length - 1}
                    onPreviousClick={goToPreviousModule}
                    onNextClick={goToNextModule}
                    onQuizComplete={(score) => handleQuizComplete(currentModule.id, score)}
                    courseId={courseData.id}
                    onSaveNotes={handleSaveNotes}
                    notes={notes}
                />
            </div>
        </div>
    );
};

export default LearnerCourse;
