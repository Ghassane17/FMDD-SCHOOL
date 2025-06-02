import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import CourseSidebar from '../components/LearnerCourse/CourseSidebar';
import CourseContent from '../components/LearnerCourse/CourseContent';
import { getCourseModules, markModuleAsCompleted } from '../services/api';

const CourseView = () => {
    const { courseId } = useParams();
    const [modules, setModules] = useState([]);
    const [currentModule, setCurrentModule] = useState(null);
    const [hasPrevious, setHasPrevious] = useState(false);
    const [hasNext, setHasNext] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const response = await getCourseModules(courseId);
                if (response.success) {
                    setModules(response.data.modules);
                    if (response.data.modules.length > 0) {
                        setCurrentModule(response.data.modules[0]);
                        updateNavigationState(response.data.modules[0].id);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch modules:', error);
                toast.error('Failed to load course modules');
            }
        };

        fetchModules();
    }, [courseId]);

    const updateNavigationState = (moduleId) => {
        const currentIndex = modules.findIndex(m => m.id === moduleId);
        setHasPrevious(currentIndex > 0);
        setHasNext(currentIndex < modules.length - 1);
    };

    const handleModuleSelect = (moduleId) => {
        const selectedModule = modules.find(m => m.id === moduleId);
        if (selectedModule) {
            setCurrentModule(selectedModule);
            updateNavigationState(moduleId);
        }
    };

    const handlePreviousClick = () => {
        const currentIndex = modules.findIndex(m => m.id === currentModule.id);
        if (currentIndex > 0) {
            const previousModule = modules[currentIndex - 1];
            setCurrentModule(previousModule);
            updateNavigationState(previousModule.id);
        }
    };

    const handleNextClick = () => {
        const currentIndex = modules.findIndex(m => m.id === currentModule.id);
        if (currentIndex < modules.length - 1) {
            const nextModule = modules[currentIndex + 1];
            setCurrentModule(nextModule);
            updateNavigationState(nextModule.id);
        }
    };

    const handleQuizComplete = (score) => {
        console.log('Quiz completed with score:', score);
    };

    const handleSaveNotes = (notes) => {
        setNotes(notes);
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

    return (
        <div className="flex h-screen bg-gray-100">
            <CourseSidebar
                modules={modules}
                currentModuleId={currentModule?.id}
                onModuleSelect={handleModuleSelect}
            />
            <CourseContent
                currentModule={currentModule}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onPreviousClick={handlePreviousClick}
                onNextClick={handleNextClick}
                onQuizComplete={handleQuizComplete}
                courseId={courseId}
                onSaveNotes={handleSaveNotes}
                notes={notes}
                onModuleComplete={handleModuleComplete}
            />
        </div>
    );
};

export default CourseView; 