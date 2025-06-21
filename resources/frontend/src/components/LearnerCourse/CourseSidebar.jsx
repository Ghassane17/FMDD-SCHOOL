import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, School, Lock, Chat } from '@mui/icons-material';

const CourseSidebar = ({ modules, currentModuleId, progress, isOpen, onModuleSelect, courseId, hasExam }) => {
    const navigate = useNavigate();
    
    // Exam is disabled when progress is less than 100%
    const isExamDisabled = progress < 100;

    const handleFinalExamClick = () => {
        if (isExamDisabled) {
            return; // Don't navigate if exam is disabled
        }
        console.log('Navigating to Final Exam:', `/learner/courses/${courseId}/finalQuiz`);
        navigate(`/learner/courses/${courseId}/finalQuiz`);
        if (window.innerWidth < 1024) {
            // Sidebar closes on mobile (controlled by parent via isOpen)
        }
    };

    const handleChatClick = () => {
        navigate(`/learner/courses/${courseId}/chat`);
        if (window.innerWidth < 1024) {
            // Sidebar closes on mobile (controlled by parent via isOpen)
        }
    };

    return (
        <div
            className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform z-50 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            } transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 z-20`}
        >
            <div className="p-4 h-full overflow-y-auto">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Modules</h2>
                <ul className="space-y-2">
                    {modules.map((module) => {
                        const isCompleted = !!module.is_completed;
                        return (
                            <li key={module.id}>
                                <button
                                    onClick={() => onModuleSelect(modules.findIndex(m => m.id === module.id))}
                                    className={`w-full text-left p-3 rounded-lg flex justify-between items-center ${
                                        currentModuleId === module.id
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="text-sm font-medium">{module.title}</span>
                                    {isCompleted && (
                                        <CheckCircle className="text-green-500" fontSize="small" />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>

                {/* Outils de collaboration */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="text-md font-semibold text-gray-800 mb-3">Outils de collaboration</h3>
                    <button
                        onClick={handleChatClick}
                        className="w-full text-left p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-2"
                    >
                        <Chat className="w-4 h-4" />
                        <span className="text-sm font-medium">Discussion du Cours</span>
                    </button>
                </div>

                {/* Final Exam Section */}
                {hasExam && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h3 className="text-md font-semibold text-gray-800 mb-3">Final Exam</h3>
                        <button
                            onClick={handleFinalExamClick}
                            disabled={isExamDisabled}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-2 ${
                                isExamDisabled
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                        >
                            <School className="w-4 h-4" />
                            <span className="text-sm font-medium">Take Final Exam</span>
                            {isExamDisabled && <Lock className="w-3 h-3 ml-auto" />}
                        </button>
                        {isExamDisabled && (
                            <p className="text-xs text-gray-500 mt-1">
                                Complete all modules to unlock the exam
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

CourseSidebar.propTypes = {
    modules: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            title: PropTypes.string,
            type: PropTypes.string,
            order: PropTypes.number,
            duration: PropTypes.number,
            is_completed: PropTypes.bool,
        })
    ).isRequired,
    currentModuleId: PropTypes.number.isRequired,
    progress: PropTypes.number.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onModuleSelect: PropTypes.func.isRequired,
    courseId: PropTypes.number.isRequired,
    hasExam: PropTypes.bool.isRequired,
};

export default CourseSidebar;
