
import React from 'react';

/**
 * ExercisesPanel Component
 * Panel for course exercises and practice activities
 */
const ExercisesPanel = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-xl font-bold mb-2">Exercices pratiques</h3>
      <p className="text-gray-700 mb-3">
        Consolidez vos apprentissages avec ces exercices pratiques conçus pour renforcer 
        les concepts clés de ce module.
      </p>
      <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition">
        Démarrer les exercices
      </button>
    </div>
  );
};

export default ExercisesPanel;
