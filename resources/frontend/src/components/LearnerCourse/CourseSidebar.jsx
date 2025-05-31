import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, School } from '@mui/icons-material';

const CourseSidebar = ({ modules, currentModuleIndex, progress, isOpen, onModuleSelect, quizProgress, courseId, hasExam }) => {
    const navigate = useNavigate();

    const handleFinalExamClick = () => {
        console.log('Navigating to Final Exam:', `/learner/courses/${courseId}/finalQuiz`);
        navigate(`/learner/courses/${courseId}/finalQuiz`);
        if (window.innerWidth < 1024) {
            // Sidebar closes on mobile (controlled by parent via isOpen)
        }
    };

    return (
        <div
            className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            } transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 z-20`}
        >
            <div className="p-4 h-full overflow-y-auto">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Course Modules</h2>
                <ul className="space-y-2">
                    {modules.map((module, index) => (
                        <li key={module.id}>
                            <button
                                onClick={() => onModuleSelect(index)}
                                className={`w-full text-left p-3 rounded-lg flex justify-between items-center ${
                                    currentModuleIndex === index
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <span className="text-sm font-medium">{module.title}</span>
                                {quizProgress[module.id]?.completed && module.type === 'quiz' && (
                                    <CheckCircle className="text-green-500" fontSize="small" />
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
                {hasExam && (
                    <div className="mt-4">
                        <button
                            onClick={handleFinalExamClick}
                            className="w-full text-left p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-indigo-100 flex items-center"
                        >
                            <School className="mr-2 text-indigo-600" fontSize="small" />
                            <span className="text-sm font-medium">Final Exam</span>
                        </button>
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
        })
    ).isRequired,
    currentModuleIndex: PropTypes.number.isRequired,
    progress: PropTypes.number,
    isOpen: PropTypes.bool.isRequired,
    onModuleSelect: PropTypes.func.isRequired,
    quizProgress: PropTypes.object,
    courseId: PropTypes.number.isRequired, // Added
    hasExam: PropTypes.bool.isRequired, // Added
};

export default CourseSidebar;
