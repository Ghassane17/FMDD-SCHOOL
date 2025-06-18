import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import CourseContent from '../components/LearnerCourse/CourseContent';
import { useCourseContext } from '../Layouts/LearnerCourseLayout.jsx';
import { moduleDetails, markModuleAsCompleted } from '../services/api.js';

/**
 * Simplified Course Player Component
 * Now focuses only on course content display and interaction
 * Layout structure is handled by CourseLearnerLayout
 */


const LearnerCourse = () => {
    const navigate = useNavigate();
    const {
        courseId,
        courseData,
        modules,
        currentModule,
        currentModuleIndex,
        setCurrentModule,
        setModules,
    } = useCourseContext();

    // Local state for course content
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [completedModules, setCompletedModules] = useState([]);

    // Update completed modules when course data changes
    useEffect(() => {
        if (courseData?.pivot?.completed_modules) {
            setCompletedModules(courseData.pivot.completed_modules);
        }
    }, [courseData]);

    // Toggle focus mode
    const toggleFocusMode = () => {
        setIsFocused(!isFocused);
    };

    // Handle escape key to exit focus mode
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isFocused) {
                setIsFocused(false);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isFocused]);

    // Navigate to previous module
    const goToPreviousModule = async () => {
        if (currentModuleIndex > 0) {
            const newIndex = currentModuleIndex - 1;
            setLoading(true);
            try {
                const response = await moduleDetails(parseInt(courseId, 10), modules[newIndex].id);
                setCurrentModule(response.currentModule || response.module);
                navigate(`/learner/courses/${courseId}/${modules[newIndex].id}`);
            } catch (error) {
                console.error('Failed to load previous module:', error);
                toast.error('Failed to load previous module.');
            } finally {
                setLoading(false);
            }
        }
    };

    // Navigate to next module
    const goToNextModule = async () => {
        if (currentModuleIndex < modules.length - 1) {
            const newIndex = currentModuleIndex + 1;
            setLoading(true);
            try {
                const response = await moduleDetails(parseInt(courseId, 10), modules[newIndex].id);
                setCurrentModule(response.currentModule || response.module);
                navigate(`/learner/courses/${courseId}/${modules[newIndex].id}`);
            } catch (error) {
                console.error('Failed to load next module:', error);
                toast.error('Failed to load next module.');
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle quiz completion
    const handleQuizComplete = (moduleId, score) => {
        console.log(`Quiz ${moduleId} completed with score: ${score * 100}%`);
        toast.success(`Quiz completed with ${Math.round(score * 100)}% score!`);
    };

    // Handle saving notes
    const handleSaveNotes = (noteText, rating) => {
        setNotes(noteText);
        console.log('Notes saved:', { noteText, rating });
        toast.success('Notes saved successfully!');
    };

    // Handle module completion
    const handleModuleComplete = async (moduleId) => {
        try {
            console.log('Frontend: Attempting to mark module as completed:', { courseId, moduleId });
            const response = await markModuleAsCompleted(parseInt(courseId, 10), moduleId);
            console.log('Frontend: Module completion response:', response);

            if (response.success) {
                // Refetch module details to get the latest is_completed state from backend
                const updatedData = await moduleDetails(parseInt(courseId, 10), moduleId);
                setCurrentModule(updatedData.currentModule || updatedData.module);
                setModules(updatedData.all_modules || modules);
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

    // Loading state for module transitions
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading module...</p>
                </div>
            </div>
        );
    }

    // Main course content
    return (
        <div className={`flex-1 transition-all duration-300 ${isFocused ? 'fixed inset-0 z-50 bg-white' : ''}`}>
            <div className={`relative transition-all duration-300 ${isFocused ? 'max-w-4xl mx-auto h-full overflow-auto' : ''}`}>
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
                    isFocused={isFocused}
                    onToggleFocus={toggleFocusMode}
                    completedModules={completedModules}
                />
            </div>
        </div>
    );
};

export default LearnerCourse;


