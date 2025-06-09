import React, { useState, useCallback, useRef } from 'react';
import VideoPlayer from './VideoPlayer';
import { FileText, Image, FileQuestion, Video, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Box, IconButton, CircularProgress, Tooltip } from '@mui/material';
import { toast } from 'react-hot-toast';
import { downloadResource } from '../../services/api'; // Adjust path as needed

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const FALLBACK_IMAGE = '/storage/Test.png';

/**
 * ContentRenderer Component
 * Renders different types of content based on the type prop
 *
 * @param {Object} props
 * @param {string} props.type - Type of content (text, pdf, image, video, quiz)
 * @param {string} props.textContent - Text content for text type modules
 * @param {string} props.filePath - File path for pdf, image, or video type modules (fallback)
 * @param {Array} props.quizQuestions - Array of quiz questions (for quiz type)
 * @param {Array} props.resources - Array of module-specific resources from CourseResource
 */
const ContentRenderer = ({ type, textContent, filePath, quizQuestions = [], resources = [], onQuizComplete }) => {
    // State for quiz functionality
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [answers, setAnswers] = useState({});

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

    // Initialize image source
    React.useEffect(() => {
        if (type === 'image') {
            const imageUrl = filePath || (resources.find((r) => r.type === 'image')?.url);
            if (!imageUrl) {
                setImageSrc(`${API_URL}${FALLBACK_IMAGE}`);
                setIsImageLoading(false);
                return;
            }

            // If it's already a full URL, use it as is
            if (imageUrl.startsWith('http')) {
                setImageSrc(imageUrl);
                setIsImageLoading(false);
                return;
            }

            // Fix double /storage/ prefix issue
            let cleanUrl = imageUrl;
            
            // Replace any occurrence of /storage//storage/ with just /storage/
            cleanUrl = cleanUrl.replace(/\/storage\/+\/storage\/+/g, '/storage/');
            
            // Also handle case where it might be /storage/storage/
            cleanUrl = cleanUrl.replace(/\/storage\/+storage\/+/g, '/storage/');
            
            // Set the final URL
            setImageSrc(`${API_URL}${cleanUrl}`);
            
            console.log('Image URL:', {
                original: imageUrl,
                cleaned: cleanUrl,
                final: `${API_URL}${cleanUrl}`
            });
        }
    }, [type, filePath, resources]);

    // Handle image loading
    const handleImageLoad = useCallback(() => {
        setIsImageLoading(false);
    }, []);

    const handleImageError = useCallback(() => {
        console.log('Image load error, using fallback');
        setImageSrc(`${API_URL}${FALLBACK_IMAGE}`);
        setIsImageLoading(false);
    }, []);

    // Find video resource from resources array
    const videoResource = resources.find((resource) => resource.type === 'video');

    // PDF controls
    const handleZoomIn = useCallback(() => {
        setPdfScale(prev => Math.min(prev + 0.25, 2));
    }, []);

    const handleZoomOut = useCallback(() => {
        setPdfScale(prev => Math.max(prev - 0.25, 0.5));
    }, []);

    const handleRotate = useCallback(() => {
        if (iframeRef.current) {
            const iframe = iframeRef.current;
            const currentRotation = parseInt(iframe.style.transform.replace(/[^\d-]/g, '') || '0');
            iframe.style.transform = `rotate(${currentRotation + 90}deg)`;
        }
    }, []);



    // Get authentication token
    const getAuthToken = useCallback(() => {
        return localStorage.getItem('token');
    }, []);

    // Construct authenticated URL
    const getAuthenticatedUrl = useCallback((url) => {
        if (!url) return null;
        const token = getAuthToken();

        // Clean the URL path - remove all leading slashes and storage/ prefixes
        let cleanUrl = url.replace(/^\/+/, '').replace(/^storage\/+/, '');

        // If it's already a full URL, use it as is
        if (url.startsWith('http')) {
            return `${url}${url.includes('?') ? '&' : '?'}token=${token}`;
        }

        // Otherwise construct the full URL
        const fullUrl = `${API_URL}/storage/${cleanUrl}`;
        return `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}token=${token}`;
    }, [getAuthToken]);

    // Handle quiz answer selection
    const handleAnswerSelect = (index) => {
        setSelectedAnswer(index);
        setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: index
        }));
    };

    // Handle quiz completion
    const handleQuizComplete = () => {
        const correctAnswers = Object.entries(answers).reduce((acc, [questionIndex, answerIndex]) => {
            return acc + (answerIndex === quizQuestions[questionIndex].correct_option ? 1 : 0);
        }, 0);

        const finalScore = (correctAnswers / quizQuestions.length) * 100;
        setQuizScore(finalScore);
        setQuizCompleted(true);

        // Call the onQuizComplete prop if provided
        if (onQuizComplete) {
            onQuizComplete(finalScore / 100);
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
    };

    // Render content based on type
    const renderContent = () => {
        let pdfUrl, authenticatedUrl, videoUrl, currentQuestion;

        switch (type) {
            case 'text':
                return (
                    <div className="prose max-w-none">
                        {textContent}
                    </div>
                );

            case 'pdf':
                // Clean the file path before using it
                pdfUrl = filePath ? filePath.replace(/^\/+/, '').replace(/^storage\/+/, '') :
                        (resources.find((r) => r.type === 'pdf')?.url);
                authenticatedUrl = getAuthenticatedUrl(pdfUrl);

                console.log('PDF URL:', {
                    original: pdfUrl,
                    authenticated: authenticatedUrl,
                    token: getAuthToken() ? 'present' : 'missing'
                });

                return (
                    <div className="w-full h-[600px] relative bg-gray-100 rounded-lg overflow-hidden">
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
                                <div className="absolute bottom-4 right-4 flex gap-2 bg-black/50 rounded-lg p-2">
                                    <Tooltip title="Zoom In">
                                        <IconButton
                                            onClick={handleZoomIn}
                                            size="small"
                                            sx={{ color: 'white' }}
                                        >
                                            <ZoomIn size={20} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Zoom Out">
                                        <IconButton
                                            onClick={handleZoomOut}
                                            size="small"
                                            sx={{ color: 'white' }}
                                        >
                                            <ZoomOut size={20} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Rotate">
                                        <IconButton
                                            onClick={handleRotate}
                                            size="small"
                                            sx={{ color: 'white' }}
                                        >
                                            <RotateCw size={20} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Download">
                                        <IconButton
                                            onClick={async () => {
                                                try {
                                                    const pdfResource = resources.find((r) => r.type === 'pdf');
                                                    if (pdfResource) {
                                                        await downloadResource(pdfResource.id);
                                                    } else {
                                                        toast.error('No PDF resource found for download');
                                                    }
                                                } catch (error) {
                                                    console.error('PDF download failed:', error);
                                                }
                                            }}
                                            size="small"
                                            sx={{ color: 'white' }}
                                        >
                                            <Download size={20} />
                                        </IconButton>
                                    </Tooltip>
                                </div>
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
                    <VideoPlayer url={videoUrl.replace(/^\/+/, '').replace(/^storage\//, '')} />
                ) : (
                    <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">No video available for this module.</p>
                    </div>
                );

            case 'quiz':
                if (quizQuestions.length === 0) {
                    return (
                        <div className="w-full p-4 bg-gray-100 rounded-lg text-center">
                            <p className="text-gray-500">No quiz questions available.</p>
                        </div>
                    );
                }

                if (quizCompleted) {
                    return (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
                                <div className="text-4xl font-bold text-blue-600 mb-4">
                                    {quizScore.toFixed(1)}%
                                </div>
                                <p className="text-gray-600">
                                    You got {Math.round((quizScore / 100) * quizQuestions.length)} out of {quizQuestions.length} questions correct.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {quizQuestions.map((question, index) => (
                                    <div key={index} className="p-4 bg-white rounded-lg shadow">
                                        <p className="font-medium mb-2">{question.question}</p>
                                        <div className="space-y-2">
                                            {question.options.map((option, optIndex) => (
                                                <div
                                                    key={optIndex}
                                                    className={`p-2 rounded ${
                                                        optIndex === question.correct_option
                                                            ? 'bg-green-100 text-green-800'
                                                            : answers[index] === optIndex
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-50'
                                                    }`}
                                                >
                                                    {typeof option === 'object' ? option.text : option}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={resetQuiz}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                                selectedAnswer === currentQuestion.correct_option
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                <p className="font-medium">
                                    {selectedAnswer === currentQuestion.correct_option
                                        ? 'Correct!'
                                        : `Incorrect. The correct answer is: ${
                                            typeof currentQuestion.options[currentQuestion.correct_option] === 'object'
                                                ? currentQuestion.options[currentQuestion.correct_option].text
                                                : currentQuestion.options[currentQuestion.correct_option]
                                          }`}
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
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswerSelect(index)}
                                        className={`w-full p-4 text-left rounded-lg border transition-all ${
                                            selectedAnswer === index
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                                        }`}
                                    >
                                        {typeof option === 'object' ? option.text : option}
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


