import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Alert } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import NotesPanel from './NotesPanel';
import ContentRenderer from './ContentRenderer';

const QuizModule = ({ questions, onComplete }) => {
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState({});

    const handleSelectAnswer = (questionId, optionId) => {
        if (!submitted) {
            setSelectedAnswers({ ...selectedAnswers, [questionId]: optionId });
        }
    };

    const handleSubmit = () => {
        const newResults = {};
        let correctCount = 0;
        questions.forEach((question) => {
            const isCorrect = selectedAnswers[question.id] === question.correct_option;
            newResults[question.id] = isCorrect;
            if (isCorrect) correctCount++;
        });
        setResults(newResults);
        setSubmitted(true);
        if (onComplete) {
            onComplete(correctCount / questions.length);
        }
    };

    return (
        <div className="space-y-6">
            {questions.map((question) => {
                // Validate options
                const validOptions = Array.isArray(question.options) && question.options.every(
                    (opt) => opt && typeof opt === 'object' && 'id' in opt && 'text' in opt
                );

                if (!validOptions) {
                    console.warn('Invalid options format for question:', {
                        questionId: question.id,
                        options: question.options,
                    });
                }

                return (
                    <div key={question.id} className="p-4 bg-white rounded-lg shadow">
                        <p className="text-lg font-semibold mb-4">{question.question}</p>
                        <div className="space-y-2">
                            {validOptions && question.options.length ? (
                                question.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSelectAnswer(question.id, option.id)}
                                        disabled={submitted}
                                        className={`w-full text-left p-3 rounded-lg border ${
                                            selectedAnswers[question.id] === option.id
                                                ? 'bg-indigo-100 border-indigo-500'
                                                : 'bg-gray-50 border-gray-200'
                                        } ${
                                            submitted
                                                ? option.id === question.correct_option
                                                    ? 'border-green-500'
                                                    : results[question.id] === false && selectedAnswers[question.id] === option.id
                                                        ? 'border-red-500'
                                                        : ''
                                                : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        {option.text}
                                    </button>
                                ))
                            ) : (
                                <p className="text-red-500">No valid options available for this question.</p>
                            )}
                        </div>
                        {submitted && (
                            <p className={`mt-2 text-sm ${results[question.id] ? 'text-green-600' : 'text-red-600'}`}>
                                {results[question.id] ? 'Correct!' : 'Incorrect. Try again next time!'}
                            </p>
                        )}
                    </div>
                );
            })}
            {!submitted && (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={Object.keys(selectedAnswers).length < questions.length}
                    className="mt-4"
                >
                    Submit Quiz
                </Button>
            )}
            {submitted && (
                <Button
                    variant="outlined"
                    onClick={() => {
                        setSelectedAnswers({});
                        setSubmitted(false);
                        setResults({});
                    }}
                    className="mt-4"
                >
                    Retake Quiz
                </Button>
            )}
        </div>
    );
};

const CourseContent = ({ currentModule, hasPrevious, hasNext, onPreviousClick, onNextClick, onQuizComplete, courseId, onSaveNotes, notes, onModuleComplete }) => {
    if (!currentModule) {
        return (
            <div className="flex-1 p-6 bg-white">
                <Alert severity="error">No module selected.</Alert>
            </div>
        );
    }

    console.log('Module Data:', {
        file_path: currentModule.file_path,
        resources: currentModule.resources
    });

    return (
        <div className="flex-1 p-6 bg-white overflow-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{currentModule.title}</h2>
                {!currentModule.is_completed && (
                    <button
                        onClick={() => {
                            if (typeof onModuleComplete === 'function') {
                                onModuleComplete(currentModule.id);
                            } else {
                                console.error('onModuleComplete is not a function:', onModuleComplete);
                            }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Mark as Completed
                    </button>
                )}
            </div>
            
            <ContentRenderer
                type={currentModule.type}
                textContent={currentModule.text_content}
                filePath={currentModule.file_path}
                quizQuestions={currentModule.quiz_questions}
                resources={currentModule.resources}
                onQuizComplete={onQuizComplete}
            />

            <div className="mt-6 space-y-6">
                {currentModule.resources?.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resources</h3>
                        <ul className="space-y-2">
                            {currentModule.resources.map((resource) => (
                                <li key={resource.id}>
                                    <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:underline"
                                    >
                                        {resource.name} ({resource.type})
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <NotesPanel
                    courseId={courseId}
                    notes={notes}
                    onSaveNotes={onSaveNotes}
                />
            </div>
            <div className="flex justify-between mt-8">
                <Button
                    variant="outlined"
                    startIcon={<ChevronLeft />}
                    onClick={onPreviousClick}
                    disabled={!hasPrevious}
                    className="normal-case"
                >
                    Previous
                </Button>
                <Button
                    variant="contained"
                    endIcon={<ChevronRight />}
                    onClick={onNextClick}
                    disabled={!hasNext}
                    className="normal-case"
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

CourseContent.propTypes = {
    currentModule: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        type: PropTypes.oneOf(['text', 'pdf', 'image', 'video', 'quiz']),
        text_content: PropTypes.string,
        file_path: PropTypes.string,
        is_completed: PropTypes.bool,
        quiz_questions: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                question: PropTypes.string,
                options: PropTypes.arrayOf(
                    PropTypes.shape({
                        id: PropTypes.number,
                        text: PropTypes.string,
                    })
                ),
                correct_option: PropTypes.number,
            })
        ),
        resources: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                name: PropTypes.string,
                type: PropTypes.string,
                url: PropTypes.string,
            })
        ),
    }),
    hasPrevious: PropTypes.bool.isRequired,
    hasNext: PropTypes.bool.isRequired,
    onPreviousClick: PropTypes.func.isRequired,
    onNextClick: PropTypes.func.isRequired,
    onQuizComplete: PropTypes.func,
    courseId: PropTypes.number.isRequired,
    onSaveNotes: PropTypes.func.isRequired,
    notes: PropTypes.string,
    onModuleComplete: PropTypes.func.isRequired,
};

export default CourseContent;
