
import React, { useState } from 'react';
import ContentRenderer from './ContentRenderer';
import ExercisesPanel from './ExercisesPanel';
import ResourcesPanel from './ResourcesPanel';
import NotesPanel from './NotesPanel';
import ProgressBar from './ProgressBar';

/**
 * CourseContent Component
 * Main content area showing the current module's content
 * 
 * @param {Object} props
 * @param {Object} props.currentModule - Current module data
 * @param {boolean} props.hasPrevious - Whether there's a previous module
 * @param {boolean} props.hasNext - Whether there's a next module
 * @param {Function} props.onPreviousClick - Handler for previous module button
 * @param {Function} props.onNextClick - Handler for next module button
 */
const CourseContent = ({ 
  currentModule, 
  hasPrevious, 
  hasNext, 
  onPreviousClick, 
  onNextClick 
}) => {
  // State for storing user notes
  const [notes, setNotes] = useState('');
  
  /**
   * Save notes to local state (could be extended to save to backend)
   */
  const handleSaveNotes = (newNotes) => {
    setNotes(newNotes);
    // Here you would typically make an API call to save notes
    console.log('Saving notes:', newNotes);
  };

  return (
    <main className="flex-1 bg-gray-50 p-2 lg:p-4 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Module Progress */}
        <div className="mb-3">
          <span className="text-sm text-gray-600 mb-1 block">Progression du module</span>
          <ProgressBar percent={currentModule.status === 'completed' ? 100 : currentModule.status === 'in-progress' ? 50 : 0} />
        </div>
        
        {/* Module Content Card */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-2xl font-bold mb-2">{currentModule.title}</h2>
          <p className="text-gray-700 mb-3">{currentModule.description}</p>
          
          {/* Content Renderer - handles different content types */}
          <ContentRenderer 
            contentType={currentModule.contentType} 
            contentUrl={currentModule.contentUrl}
            quizQuestions={currentModule.quizQuestions}
          />
          
          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between mt-4 gap-2">
            <button
              onClick={onPreviousClick}
              disabled={!hasPrevious}
              className={`px-4 py-2 border rounded-md flex items-center justify-center ${
                hasPrevious 
                  ? 'hover:bg-gray-50 text-gray-800' 
                  : 'opacity-50 cursor-not-allowed text-gray-400'
              }`}
            >
              ← Module précédent
            </button>
            
            <button
              onClick={onNextClick}
              disabled={!hasNext}
              className={`px-4 py-2 rounded-md flex items-center justify-center ${
                hasNext 
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Module suivant →
            </button>
          </div>
        </div>
        
        {/* Exercises Panel */}
        <ExercisesPanel />
        
        {/* Resources and Notes - Side by side on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <NotesPanel 
            notes={notes}
            onSaveNotes={handleSaveNotes}
          />
          
          <ResourcesPanel 
            resources={currentModule.resources} 
          />
        </div>
      </div>
    </main>
  );
};

export default CourseContent;
