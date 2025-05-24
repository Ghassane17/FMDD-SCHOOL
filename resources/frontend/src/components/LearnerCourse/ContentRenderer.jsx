import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { FileText, Image, FileQuestion, Video } from 'lucide-react';

/**
 * ContentRenderer Component
 * Renders different types of content based on the type prop
 * 
 * @param {Object} props
 * @param {string} props.type - Type of content (text, pdf, image, video, quiz)
 * @param {string} props.textContent - Text content for text type modules
 * @param {string} props.filePath - File path for pdf, image, or video type modules
 * @param {Array} props.quizQuestions - Array of quiz questions (for quiz type)
 */
const ContentRenderer = ({ type, textContent, filePath, quizQuestions = [] }) => {
  // State for quiz functionality
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  
  // Content type icon mapping
  const contentTypeIcons = {
    text: <FileText className="w-8 h-8 text-blue-500" />,
    pdf: <FileText className="w-8 h-8 text-red-500" />,
    quiz: <FileQuestion className="w-8 h-8 text-green-500" />,
    image: <Image className="w-8 h-8 text-purple-500" />,
    video: <Video className="w-8 h-8 text-orange-500" />
  };

  // Render content based on type
  const renderContent = () => {
    switch (type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            {textContent}
          </div>
        );
      
      case 'pdf':
        return (
          <div className="w-full h-[600px]">
            <iframe
              src={filePath}
              className="w-full h-full border-0"
              title="PDF Document"
            />
          </div>
        );
      
      case 'image':
        return (
          <div className="flex justify-center">
            <img
              src={filePath}
              alt="Module content"
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        );
      
      case 'video':
        return <VideoPlayer url={filePath} />;
      
      case 'quiz':
        if (quizQuestions.length === 0) {
          return <div>No quiz questions available.</div>;
        }

        const currentQuestion = quizQuestions[currentQuestionIndex];
        
        if (showResult) {
          return (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                selectedAnswer === currentQuestion.correct_option
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                <p className="font-medium">
                  {selectedAnswer === currentQuestion.correct_option
                    ? 'Correct!'
                    : 'Incorrect. The correct answer is: ' + 
                      currentQuestion.options[currentQuestion.correct_option]}
                </p>
              </div>
              
              <button
                onClick={() => {
                  if (currentQuestionIndex < quizQuestions.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                    setSelectedAnswer(null);
                    setShowResult(false);
                  }
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {currentQuestionIndex < quizQuestions.length - 1
                  ? 'Next Question'
                  : 'Finish Quiz'}
              </button>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{currentQuestion.question}</p>
            
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedAnswer(index);
                    setShowResult(true);
                  }}
                  className={`w-full p-3 text-left rounded-lg border ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      
      default:
        return <div>Unsupported content type.</div>;
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-4">
        {contentTypeIcons[type]}
        <h3 className="text-lg font-medium capitalize">{type} Content</h3>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default ContentRenderer;
