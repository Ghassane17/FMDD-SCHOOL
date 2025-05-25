
import React, { useState } from 'react';

import { useParams } from 'react-router-dom';
import ContentRenderer from './ContentRenderer';
import ExercisesPanel from './ExercisesPanel';
import ResourcesPanel from './ResourcesPanel';
import NotesPanel from './NotesPanel';
import ProgressBar from './ProgressBar';
import { toast } from 'sonner';

/**
 * CourseContent Component
 * Main content area showing the current module's content
 *
 * @param {Object} props
 * @param {Object} props.currentModule - Current module data with resources
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
    const { id: courseId } = useParams();
    const [notes, setNotes] = useState('');

    const handleSaveNotes = async (newNotes) => {
        try {
            setNotes(newNotes);
            // Notes saving handled in NotesPanel
        } catch (error) {
            console.error('Failed to save notes:', error);
            toast.error('Failed to save notes');
        }
    };

    // Ensure currentModule exists
    if (!currentModule) {
        return (
            <div className="flex-1 p-6">
                <div className="text-red-500">Module not found</div>
            </div>
        );
    }

    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                {/* Progress Bar */}
                <ProgressBar
                    currentModule={currentModule.order}
                    totalModules={currentModule.total_modules}
                />

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                    <h2 className="text-2xl font-bold mb-2">{currentModule.title}</h2>

                    {/* Content Renderer - handles different content types */}
                    <ContentRenderer
                        type={currentModule.type}
                        textContent={currentModule.text_content}
                        filePath={currentModule.file_path}
                        quizQuestions={currentModule.quizQuestions}
                        resources={currentModule.resources} // Pass resources for video rendering
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
                        courseId={courseId}
                    />

                    <ResourcesPanel
                        resources={currentModule.resources || []} // Use module-specific resources
                    />
                </div>
            </div>
        </main>
    );
};

export default CourseContent;
