import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, School, Lock } from '@mui/icons-material';

const CourseSidebar = ({ modules, currentModuleId, progress, isOpen, onModuleSelect, quizProgress, courseId, hasExam, completedModules = [] }) => {
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
                        const isCompleted = completedModules.includes(module.id);
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
                {hasExam && (
                    <div className="mt-4">
                        <button
                            onClick={handleFinalExamClick}
                            className={`w-full text-left p-3 rounded-lg flex items-center ${
                                isExamDisabled
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-50 text-gray-700 hover:bg-indigo-100'
                            }`}
                            disabled={isExamDisabled}
                        >
                            {isExamDisabled ? (
                                <Lock className="mr-2 text-gray-400" fontSize="small" />
                            ) : (
                                <School className="mr-2 text-indigo-600" fontSize="small" />
                            )}
                            <span className="text-sm font-medium">
                                {isExamDisabled ? 'Examen final (Pas disponible)' : 'Examen final'}
                            </span>
                        </button>
                        {isExamDisabled && (
                            <p className="mt-2 text-xs text-gray-500 px-3">Vous devez compléter tous les modules ({progress} %) pour accéder à l'examen final.</p>
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
    quizProgress: PropTypes.object,
    courseId: PropTypes.number.isRequired,
    hasExam: PropTypes.bool.isRequired,
    completedModules: PropTypes.arrayOf(PropTypes.number),
};

export default CourseSidebar;
