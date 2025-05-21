import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseHeader from '../components/LearnerCourse/CourseHeader';
import CourseSidebar from '../components/LearnerCourse/CourseSidebar';
import CourseContent from '../components/LearnerCourse/CourseContent';
import {  isAuthenticated } from '../services/api.js';

/**
 * Course Player Component
 * Displays a specific enrolled course for the learner
 */
const LearnerCourse = () => {
    const { courseId } = useParams(); // Get courseId from URL
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState(null);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            navigate('/login');
            return;
        }

        const fetchCourse = async () => {
            setLoading(true);
            try {
            return  false ;
            } catch (err) {
                console.error('Failed to fetch course:', err);
                setError('Impossible de charger le cours. Veuillez vérifier votre inscription ou réessayer.');
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId, navigate]);

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
                <p className="text-lg">Chargement du cours...</p>
            </div>
        );
    }

    if (error || !courseData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || 'Cours non trouvé.'}</p>
                    <button
                        onClick={retryFetch}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Réessayer
                    </button>
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
