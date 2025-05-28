import React from 'react';

/**
 * ExercisesPanel Component
 * Panel for course exercises and practice activities
 *
 * @param {Object} props
 * @param {Array} props.modules - Array of course modules to find quiz module
 * @param {Function} props.onModuleSelect - Function to navigate to a specific module
 * @param {number} props.currentModuleIndex - Current module index
 */
const ExercisesPanel = ({ modules = [], onModuleSelect, currentModuleIndex }) => {

    /**
     * Find the first quiz module in the course
     * @returns {Object|null} Quiz module object or null if not found
     */
    const findQuizModule = () => {
        return modules.find(module => module.type === 'quiz');
    };

    /**
     * Handle starting exercises - navigate to quiz module
     */
    const handleStartExercises = () => {
        const quizModule = findQuizModule();

        if (quizModule) {
            // Find the index of the quiz module
            const quizIndex = modules.findIndex(module => module.id === quizModule.id);

            if (quizIndex !== -1 && onModuleSelect) {
                onModuleSelect(quizIndex);
            }
        } else {
            // If no quiz module found, show an alert or toast
            alert('Aucun quiz disponible pour ce cours.');
        }
    };

    const quizModule = findQuizModule();
    const hasQuiz = quizModule !== null;

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 className="text-xl font-bold mb-2">Exercices pratiques</h3>
            <p className="text-gray-700 mb-3">
                Consolidez vos apprentissages avec ces exercices pratiques conçus pour renforcer
                les concepts clés de ce module.
            </p>

            {hasQuiz ? (
                <button
                    onClick={handleStartExercises}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition"
                >
                    Démarrer les exercices
                </button>
            ) : (
                <button
                    disabled
                    className="bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed"
                >
                    Aucun exercice disponible
                </button>
            )}

            {hasQuiz && quizModule && (
                <p className="text-sm text-gray-600 mt-2">
                    Quiz disponible: {quizModule.title}
                </p>
            )}
        </div>
    );
};

export default ExercisesPanel;
