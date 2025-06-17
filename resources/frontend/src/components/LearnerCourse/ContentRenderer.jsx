import React, { useState, useCallback, useRef, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import { FileText, Image, FileQuestion, Video, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Box, IconButton, CircularProgress, Tooltip } from '@mui/material';
import { toast } from 'react-hot-toast';
import {  markModuleAsCompleted } from '../../services/api'; // Adjust path as needed
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
const API_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * ContentRenderer Component
 * Renders different types of content based on the type prop
 *
 * @param {Object} props
 * @param {string} props.type - Type of content (text, pdf, image, video, quiz)
 * @param {string} props.textContent - Text content for text type modules
 * @param {string} props.filePath - File path for pdf, image, or video type modules (fallback)
 * @param {Array} props.quizQuestions - Array of quiz questions (for quiz type)
 * @param {Array} props.resources - Array of module-specific resources from Resource
 */
const ContentRenderer = ({ type, textContent, filePath, quizQuestions = [], resources = [], onQuizComplete, courseId, moduleId }) => {
    // State for quiz functionality
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [answers, setAnswers] = useState({});
    const [randomizedOptions, setRandomizedOptions] = useState([]);
    const [correctAnswerMap, setCorrectAnswerMap] = useState({});

    // State for media loading
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [imageSrc, setImageSrc] = useState(null);
    const imageRef = useRef(null);

    // PDF specific state
    const [pdfLoading, setPdfLoading] = useState(true);
    const [pdfError, setPdfError] = useState(null);
    const [pdfScale, setPdfScale] = useState(1);
    const iframeRef = useRef(null);

    // Quiz progress calculation
    const quizProgress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

    // Content type icon mapping
    const contentTypeIcons = {
        text: <FileText className="w-8 h-8 text-blue-500" />,
        pdf: <FileText className="w-8 h-8 text-red-500" />,
        quiz: <FileQuestion className="w-8 h-8 text-green-500" />,
        image: <Image className="w-8 h-8 text-purple-500" />,
        video: <Video className="w-8 h-8 text-orange-500" />
    };

    // Utility function to shuffle an array
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Initialize randomized options when quiz module is loaded or current question changes
    useEffect(() => {
        if (type === 'quiz' && quizQuestions.length > 0) {
            const currentQuestion = quizQuestions[currentQuestionIndex];
            
            // Create array of option indices
            const optionIndices = currentQuestion.options.map((_, index) => index);
            
            // Shuffle the indices
            const shuffledIndices = shuffleArray(optionIndices);
            
            // Create new options array with shuffled order
            const shuffledOptions = shuffledIndices.map((originalIndex) => ({
                ...currentQuestion.options[originalIndex],
                originalIndex // Store original index to track correct answer
            }));

            // Find the new index of the correct answer
            const correctAnswerNewIndex = shuffledOptions.findIndex(
                option => option.originalIndex === currentQuestion.correct_option
            );

            setRandomizedOptions(shuffledOptions);
            setCorrectAnswerMap(prev => ({
                ...prev,
                [currentQuestionIndex]: correctAnswerNewIndex
            }));
            
            setSelectedAnswer(null);
        }
    }, [type, quizQuestions, currentQuestionIndex]);

    // Initialize image source
    React.useEffect(() => {
        if (type === 'image') {
            const imageUrl = filePath || (resources.find((r) => r.type === 'image')?.url);
            if (!imageUrl) {
                setImageSrc(`${API_URL}`);
                setIsImageLoading(false);
                return;
            }

            // If it's already a full URL, use it as is
            if (imageUrl.startsWith('http')) {
                setImageSrc(imageUrl);
                setIsImageLoading(false);
                return;
            }

            // Clean the URL path
            let cleanUrl = imageUrl;
            
            // Remove any leading slashes
            cleanUrl = cleanUrl.replace(/^\/+/, '');
            
            // Ensure we have the correct storage path format
            if (!cleanUrl.startsWith('storage/')) {
                cleanUrl = `storage/${cleanUrl}`;
            }
            
            // Set the final URL
            setImageSrc(`${API_URL}/${cleanUrl}`);
            
            console.log('Image URL:', {
                original: imageUrl,
                cleaned: cleanUrl,
                final: `${API_URL}/${cleanUrl}`
            });
        }
    }, [type, filePath, resources]);

    // Handle image loading
    const handleImageLoad = useCallback(() => {
        setIsImageLoading(false);
    }, []);

    const handleImageError = useCallback(() => {
        console.log('Image load error, using fallback');
        setImageSrc(`${API_URL}`);
        setIsImageLoading(false);
    }, []);

    // Find video resource from resources array
    const videoResource = resources.find((resource) => resource.type === 'video');



    // Get authentication token
    const getAuthToken = useCallback(() => {
        return localStorage.getItem('token');
    }, []);

    // Construct authenticated URL
    const getAuthenticatedUrl = useCallback((url) => {
        if (!url) return null;
        const token = getAuthToken();
        let cleanUrl = url.replace(/^\/+/, '').replace(/^storage\/+/, '');
        if (url.startsWith('http')) {
            return `${url}${url.includes('?') ? '&' : '?'}token=${token}`;
        }
        const fullUrl = `${API_URL}/storage/${cleanUrl}`;
        return `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}token=${token}`;
    }, [getAuthToken]);

    // Handle quiz answer selection
    const handleAnswerSelect = (optionIndex) => {
        setSelectedAnswer(optionIndex);
        setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: optionIndex
        }));
    };

    // Handle quiz completion
    const handleQuizComplete = async () => {
        const correctAnswers = Object.entries(answers).reduce((acc, [questionIndex, selectedIndex]) => {
            const correctIndex = correctAnswerMap[questionIndex];
            return acc + (selectedIndex === correctIndex ? 1 : 0);
        }, 0);

        const finalScore = (correctAnswers / quizQuestions.length) * 100;
        setQuizScore(finalScore);
        setQuizCompleted(true);

        if (onQuizComplete) {
            onQuizComplete(finalScore / 100);
        }

        try {
            const response = await markModuleAsCompleted(parseInt(courseId, 10), moduleId);
            console.log("🚀 Response:", response);
            toast.success(`Quiz completed with ${Math.round(finalScore)}% score!`);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error("❌ Error marking module as completed:", error);
            toast.error("Failed to update progress. Please try again.");
        }
    };

    // Reset quiz
    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setQuizScore(0);
        setQuizCompleted(false);
        setAnswers({});
        setRandomizedOptions([]);
        setCorrectAnswerMap({});
    };

    // Render content based on type
    const renderContent = () => {
        let pdfUrl, authenticatedUrl, videoUrl, currentQuestion;

        switch (type) {
      case 'text':
  return (
    <div 
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: textContent }}
      style={{
        // Override ReactQuill's default styles
        '.ql-editor': {
          padding: '0 !important',
          border: 'none !important',
          outline: 'none !important'
        }
      }}
    />
  );

            case 'pdf':
                pdfUrl = filePath ? filePath.replace(/^\/+/, '').replace(/^storage\/+/, '') :
                        (resources.find((r) => r.type === 'pdf')?.url);
                authenticatedUrl = getAuthenticatedUrl(pdfUrl);

                console.log('PDF URL:', {
                    original: pdfUrl,
                    authenticated: authenticatedUrl,
                    token: getAuthToken() ? 'present' : 'missing'
                });

                return (
                    <div className="w-full h-[800px] relative bg-gray-100 rounded-lg overflow-hidden">
                        {pdfLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <CircularProgress />
                            </div>
                        )}

                        {pdfError ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <div className="text-center">
                                    <p className="text-red-500 mb-2">{pdfError}</p>
                                    <p className="text-sm text-gray-500">Please ensure you are logged in and have access to this resource.</p>
                                </div>
                            </div>
                        ) : pdfUrl ? (
                            <>
                                <iframe
                                    ref={iframeRef}
                                    src={authenticatedUrl}
                                    className="w-full h-full border-0"
                                    title="PDF Document"
                                    onLoad={() => setPdfLoading(false)}
                                    onError={(e) => {
                                        console.error('PDF Load Error:', {
                                            error: e,
                                            url: authenticatedUrl,
                                            status: e.target?.contentWindow?.location?.href
                                        });
                                        setPdfLoading(false);
                                        setPdfError('Failed to load PDF. Please check your authentication and try again.');
                                    }}
                                    style={{
                                        transform: `scale(${pdfScale})`,
                                        transformOrigin: 'top left',
                                        transition: 'transform 0.2s ease-in-out'
                                    }}
                                />
                               
                            </>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-gray-500">No PDF available</p>
                            </div>
                        )}
                    </div>
                );

            case 'image':
                return (
                    <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        {isImageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                            </div>
                        )}
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="Module content"
                            className={`w-full h-full object-contain ${isImageLoading ? 'hidden' : 'block'}`}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />
                    </div>
                );

            case 'video':
                videoUrl = videoResource?.url || filePath;
                console.log('Video URL before rendering:', {
                    videoResourceUrl: videoResource?.url,
                    filePath,
                    finalUrl: videoUrl
                });
                return videoUrl ? (
                    <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <VideoPlayer url={videoUrl.replace(/^\/+/, '').replace(/^storage\//, '')} />
                    </div>
                ) : (
                    <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-lg text-gray-500">No video available for this module.</p>
                    </div>
                );

            case 'quiz':
                if (quizQuestions.length === 0) {
                    return (
                        <div className="w-full p-8 bg-gray-100 rounded-lg text-center">
                            <p className="text-lg text-gray-500">No quiz questions available.</p>
                        </div>
                    );
                }

                if (quizCompleted) {
                    return (
                        <div className="space-y-8">
                            <div className="text-center">
                                <h3 className="text-3xl font-bold mb-4">Quiz Completed!</h3>
                                <div className="text-5xl font-bold text-blue-600 mb-6">
                                    {quizScore.toFixed(1)}%
                                </div>
                                <p className="text-xl text-gray-600">
                                    You got {Math.round((quizScore / 100) * quizQuestions.length)} out of {quizQuestions.length} questions correct.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {quizQuestions.map((question, index) => (
                                    <div key={question.id} className="p-6 bg-white rounded-lg shadow">
                                        <p className="text-xl font-medium mb-4">{question.question}</p>
                                        <div className="space-y-3">
                                            {randomizedOptions.map((option, optIndex) => (
                                                <div
                                                    key={option.id}
                                                    className={`p-4 rounded-lg text-lg ${
                                                        optIndex === correctAnswerMap[index]
                                                            ? 'bg-green-100 text-green-800'
                                                            : answers[index] === optIndex
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-50'
                                                    }`}
                                                >
                                                    {option.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={resetQuiz}
                                className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
                            >
                                Retake Quiz
                            </button>
                        </div>
                    );
                }

                currentQuestion = quizQuestions[currentQuestionIndex];

                if (showResult) {
                    return (
                        <div className="space-y-4">
                            <div className={`p-4 rounded-lg ${
                                selectedAnswer === correctAnswerMap[currentQuestionIndex]
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                <p className="font-medium">
                                    {selectedAnswer === correctAnswerMap[currentQuestionIndex]
                                        ? 'Correct!'
                                        : `Incorrect. The correct answer is: ${randomizedOptions[correctAnswerMap[currentQuestionIndex]].text}`}
                                </p>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                                </div>
                                <div className="w-32 h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                        style={{ width: `${quizProgress}%` }}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (currentQuestionIndex < quizQuestions.length - 1) {
                                        setCurrentQuestionIndex(currentQuestionIndex + 1);
                                        setSelectedAnswer(null);
                                        setShowResult(false);
                                    } else {
                                        handleQuizComplete();
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
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Question {currentQuestionIndex + 1} of {quizQuestions.length}
                            </div>
                            <div className="w-32 h-2 bg-gray-200 rounded-full">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                    style={{ width: `${quizProgress}%` }}
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-lg shadow">
                            <p className="text-lg font-medium mb-4">{currentQuestion.question}</p>
                            <div className="space-y-3">
                                {randomizedOptions.map((option, index) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleAnswerSelect(index)}
                                        className={`w-full p-4 text-left rounded-lg border transition-all ${
                                            selectedAnswer === index
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                                        }`}
                                    >
                                        {option.text}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowResult(true)}
                            disabled={selectedAnswer === null}
                            className={`w-full px-4 py-2 rounded ${
                                selectedAnswer === null
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            Check Answer
                        </button>
                    </div>
                );

            default:
                return (
                    <div className="w-full p-4 bg-gray-100 rounded-lg text-center">
                        <p className="text-gray-500">Unsupported content type.</p>
                    </div>
                );
        }
    };

    return (
        <div className="mt-6">
            <div className="flex items-center gap-3 mb-6">
                {contentTypeIcons[type]}
                <h3 className="text-2xl font-medium capitalize">{type} Content</h3>
            </div>
            {renderContent()}
        </div>
    );
};

export default ContentRenderer;