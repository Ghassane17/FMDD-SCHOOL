import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle } from '@mui/icons-material';

const CourseSidebar = ({ modules, currentModuleIndex, progress, isOpen, onModuleSelect, quizProgress }) => {
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
};

export default CourseSidebar;
