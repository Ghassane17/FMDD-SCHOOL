
import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { FileText, Image, FileQuestion, Video } from 'lucide-react';

/**
 * ContentRenderer Component
 * Renders different types of content based on the contentType prop
 * 
 * @param {Object} props
 * @param {string} props.contentType - Type of content (video, pdf, quiz, image)
 * @param {string} props.contentUrl - URL to the content
 * @param {Array} props.quizQuestions - Array of quiz questions (for quiz content type)
 */
const ContentRenderer = ({ contentType, contentUrl, quizQuestions = [] }) => {
  // State for quiz functionality
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  
  // Content type icon mapping - using correct Lucide icons
  const contentTypeIcons = {
    video: <Video className="w-8 h-8 text-blue-500" />,
    pdf: <FileText className="w-8 h-8 text-red-500" />,
    quiz: <FileQuestion className="w-8 h-8 text-green-500" />,
    image: <Image className="w-8 h-8 text-purple-500" />
  };

  // Render content based on type
  const renderContent = () => {
    switch (contentType) {
      case 'video':
        return <VideoPlayer videoUrl={contentUrl} />;
      
      case 'pdf':
        return (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center bg-gray-100 p-6 rounded-lg mb-4">
              {contentTypeIcons.pdf}
              <span className="ml-3 text-lg font-medium">Document PDF</span>
            </div>
            <iframe 
              src={contentUrl} 
              className="w-full aspect-[4/3] rounded-lg border border-gray-200"
              title="PDF document" 
            />
            <p className="text-sm text-gray-600 mt-2">
              Si le document ne s'affiche pas correctement, 
              <a href={contentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-1">
                cliquez ici pour le télécharger
              </a>.
            </p>
          </div>
        );
      
      case 'quiz':
        if (quizQuestions.length === 0) {
          return <div className="text-center text-gray-700 p-8">Pas de questions disponibles pour ce quiz.</div>;
        }

        const currentQuestion = quizQuestions[currentQuestionIndex];
        const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;

        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-6">
              {contentTypeIcons.quiz}
              <h3 className="ml-3 text-xl font-medium">Quiz interactif</h3>
            </div>
            
            <div className="mb-4 text-sm text-gray-600">
              Question {currentQuestionIndex + 1} sur {quizQuestions.length}
            </div>

            <h4 className="text-lg font-medium mb-4">{currentQuestion.question}</h4>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    selectedAnswer === index 
                      ? showResult
                        ? index === currentQuestion.correctAnswer
                          ? 'bg-green-100 border-green-500' 
                          : 'bg-red-100 border-red-500'
                        : 'bg-blue-100 border-blue-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between">
              <button 
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(currentQuestionIndex - 1);
                    setSelectedAnswer(null);
                    setShowResult(false);
                  }
                }}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                disabled={currentQuestionIndex === 0}
              >
                Question précédente
              </button>
              
              {selectedAnswer !== null && !showResult ? (
                <button 
                  onClick={() => setShowResult(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Vérifier
                </button>
              ) : showResult ? (
                <button 
                  onClick={() => {
                    if (!isLastQuestion) {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                      setSelectedAnswer(null);
                      setShowResult(false);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={isLastQuestion}
                >
                  {isLastQuestion ? 'Quiz terminé' : 'Question suivante'}
                </button>
              ) : null}
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="flex flex-col">
            <div className="flex items-center mb-4">
              {contentTypeIcons.image}
              <span className="ml-3 text-lg font-medium">Infographie / Image</span>
            </div>
            <div className="bg-gray-100 p-2 rounded-lg">
              <img 
                src={contentUrl} 
                alt="Contenu du module" 
                className="w-full h-auto rounded-md object-contain"
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center text-gray-700 p-8">
            Type de contenu non pris en charge.
          </div>
        );
    }
  };

  return (
    <div className="content-renderer w-full">
      {renderContent()}
    </div>
  );
};

export default ContentRenderer;
