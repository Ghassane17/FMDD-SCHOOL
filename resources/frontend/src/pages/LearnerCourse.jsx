import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseHeader from '../components/LearnerCourse/CourseHeader';
import CourseSidebar from '../components/LearnerCourse/CourseSidebar';
import CourseContent from '../components/LearnerCourse/CourseContent';
import { isAuthenticated, courseDetails } from '../services/api.js';

/**
 * Course Player Component
 * Displays a specific enrolled course for the learner
 */
const LearnerCourse = () => {
    const { id } = useParams(); // Get courseId from URL
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState(null);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            navigate('/login', { state: { from: `/learner/courses/${id}/learn` } });
            return;
        }

        const fetchCourse = async () => {
            setLoading(true);
            try {
                const response = await courseDetails(id);
                if (!response.course || !response.is_enrolled) {
                    throw new Error('You are not enrolled in this course');
                }
                setCourseData(response.course);
            } catch (err) {
                console.error('Failed to fetch course:', err);
                setError(err.message || 'Failed to load course. Please check your enrollment or try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id, navigate]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const goToPreviousModule = () => {
        if (currentModuleIndex > 0) {
            setCurrentModuleIndex(currentModuleIndex - 1);
        }
    };

    const goToNextModule = () => {
        if (courseData && currentModuleIndex < courseData.modules.length - 1) {
            setCurrentModuleIndex(currentModuleIndex + 1);
        }
    };

    const selectModule = (index) => {
        setCurrentModuleIndex(index);
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    const retryFetch = () => {
        setError(null);
        setLoading(true);
        fetchCourse();
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

    if (error || !courseData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <p className="text-red-500 mb-4">{error || 'Course not found.'}</p>
                    <div className="space-y-3">
                        <button
                            onClick={retryFetch}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate(`/learner/courses/${id}`)}
                            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                            Back to Course Details
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentModule = courseData.modules[currentModuleIndex];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <CourseHeader
                courseTitle={courseData.title}
                toggleSidebar={toggleSidebar}
            />
            <div className="flex flex-1 relative">
                <CourseSidebar
                    modules={courseData.modules}
                    currentModuleIndex={currentModuleIndex}
                    progress={courseData.progress}
                    isOpen={isSidebarOpen}
                    onModuleSelect={selectModule}
                />
                <CourseContent
                    currentModule={currentModule}
                    hasPrevious={currentModuleIndex > 0}
                    hasNext={currentModuleIndex < courseData.modules.length - 1}
                    onPreviousClick={goToPreviousModule}
                    onNextClick={goToNextModule}
                />
            </div>
        </div>
    );
};

export default LearnerCourse;
