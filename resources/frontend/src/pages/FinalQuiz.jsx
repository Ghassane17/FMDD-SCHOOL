"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button, Alert, CircularProgress, Box, Typography } from "@mui/material"
import { getExam, submitExam, isAuthenticated, startExam } from "../services/api.js"
import { Clock, CheckCircle, XCircle, AlertTriangle, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

const FinalQuiz = () => {
    const { courseId } = useParams()
    const navigate = useNavigate()
    const [exam, setExam] = useState(null)
    const [selectedAnswers, setSelectedAnswers] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [randomizedQuestions, setRandomizedQuestions] = useState([])
    const [examStatus, setExamStatus] = useState("not-started")
    const [timeRemaining, setTimeRemaining] = useState(0)
    const timerRef = useRef(null)

    // Utility function to shuffle an array
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    useEffect(() => {
        if (!isAuthenticated()) {
            console.log("User not authenticated, redirecting to login")
            navigate("/login", { state: { from: `/learner/courses/${courseId}/finalQuiz` } })
            return
        }

        const loadExam = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getExam(courseId);
                
                if (!response.data?.questions) {
                    throw new Error('Aucune question disponible pour cet examen.');
                }

                // Randomize questions and their options
                const randomizedQuestions = response.data.questions.map(question => ({
                    ...question,
                    options: shuffleArray(question.options)
                }));
                setRandomizedQuestions(shuffleArray(randomizedQuestions));
                setExam(response.data);
                
                if (response.data.tentatives >= response.data.max_tentatives) {
                    setError("Vous avez atteint le nombre maximum de tentatives pour cet examen.");
                    setExamStatus("failed");
                }
            } catch (error) {
                console.error("❌ Load Exam Error:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadExam();
    }, [courseId]);

    // Timer effect
    useEffect(() => {
        if (examStatus === "in-progress" && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current)
                        handleSubmit()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [examStatus, timeRemaining])

    const startExamHandler = async () => {
        try {
            setLoading(true);
            setError(null);
            await startExam(courseId);
            setExamStatus("in-progress");
            setTimeRemaining(exam.duration_min * 60);
            startTimer();
        } catch (error) {
            console.error("❌ Start Exam Error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAnswer = (questionId, optionId) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await submitExam(courseId, selectedAnswers);
            setSubmitted(true);
            setResults(response.data);
            if (response.data.passed) {
                setExamStatus("passed");
            } else {
                setExamStatus("failed");
            }
        } catch (error) {
            console.error("❌ Submit Exam Error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const startTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 0) {
                    clearInterval(timerRef.current);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const calculateTimeProgress = () => {
        if (!exam) return 100
        const totalSeconds = exam.duration_min * 60
        return (timeRemaining / totalSeconds) * 100
    }

    if (loading && examStatus === "not-started") {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <CircularProgress />
            </div>
        )
    }

    if (error && examStatus === "not-started") {
        return <Alert severity="error">{error}</Alert>
    }

    if (!exam || !exam.questions || exam.questions.length === 0) {
        console.log("No exam or questions:", exam)
        return <Alert severity="error">No exam questions available.</Alert>
    }

    if (examStatus === "not-started") {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
                <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">{exam.title}</h2>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate(`/learner/courses/${courseId}`)}
                            startIcon={<ArrowLeft />}
                        >
                            Retour au cours
                        </Button>
                    </div>
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Exam Information</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center">
                                <span className="font-medium mr-2">Duration:</span> {exam.duration_min} minutes
                            </li>
                            <li className="flex items-center">
                                <span className="font-medium mr-2">Questions:</span> {exam.questions.length}
                            </li>
                            <li className="flex items-center">
                                <span className="font-medium mr-2">Passing Score:</span> {exam.passing_score}%
                            </li>
                            <li className="flex items-center">
                                <span className="font-medium mr-2">Tentatives:</span> {exam.tentatives} / {exam.max_tentatives}
                            </li>
                        </ul>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p>{exam.instructions || "Answer all questions to the best of your ability. Once you start the exam, the timer will begin counting down."}</p>
                        </div>
                    </div>
                    <button
                        onClick={startExamHandler}
                        disabled={exam.tentatives >= exam.max_tentatives}
                        className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                            exam.tentatives >= exam.max_tentatives
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {exam.tentatives >= exam.max_tentatives
                            ? 'Maximum attempts reached'
                            : 'Start Exam'}
                    </button>
                </div>
            </div>
        );
    }

    if (examStatus === "in-progress") {
        const progress = (Object.keys(selectedAnswers).length / exam.questions.length) * 100;
        
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="sticky top-0 z-10 bg-white shadow-md p-4 mb-6 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                                if (window.confirm("Êtes-vous sûr de vouloir quitter l'examen ? Votre progression sera perdue.")) {
                                    navigate(`/learner/courses/${courseId}`);
                                }
                            }}
                            startIcon={<ArrowLeft />}
                        >
                            Quitter
                        </Button>
                        <h2 className="text-xl font-bold">Final Exam: {exam.title}</h2>
                    </div>
                    <div className="flex items-center">
                        <Clock className="mr-2 text-gray-600" />
                        <div className="relative">
                            <CircularProgress
                                variant="determinate"
                                value={calculateTimeProgress()}
                                size={50}
                                thickness={4}
                                className={timeRemaining < 60 ? "text-red-500" : "text-blue-500"}
                            />
                            <Box
                                sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: "absolute",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    component="div"
                                    className={`font-bold ${timeRemaining < 60 ? "text-red-600" : ""}`}
                                >
                                    {formatTime(timeRemaining)}
                                </Typography>
                            </Box>
                        </div>
                    </div>
                </div>
                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                            Questions answered: {Object.keys(selectedAnswers).length}/{exam.questions.length}
                        </span>
                        <span className="text-sm font-medium">Passing score: {exam.passing_score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
                {error && (
                    <Alert severity="error" className="mb-4" icon={<AlertTriangle className="h-5 w-5" />}>
                        {error}
                    </Alert>
                )}
                <div className="space-y-6">
                    {randomizedQuestions.map((question, index) => (
                        <div key={question.id} className="p-4 bg-white rounded-lg shadow">
                            <p className="text-lg font-semibold mb-4">
                                Question {index + 1}: {question.question_text}
                            </p>
                            <div className="space-y-2">
                                {question.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSelectAnswer(question.id, option.id)}
                                        disabled={submitted}
                                        className={`w-full text-left p-3 rounded-lg border ${
                                            selectedAnswers[question.id] === option.id
                                                ? "bg-blue-100 border-blue-500"
                                                : "bg-gray-50 border-gray-200"
                                        } ${submitted ? "cursor-not-allowed" : "hover:bg-gray-100"}`}
                                    >
                                        {option.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="sticky bottom-0 bg-white p-4 border-t shadow-lg mt-6 flex justify-between items-center">
                    <div className="text-sm">
                        <span className="font-medium">Time remaining:</span> {formatTime(timeRemaining)}
                    </div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={loading || Object.keys(selectedAnswers).length < exam.questions.length}
                        size="large"
                    >
                        Submit Exam
                    </Button>
                </div>
            </div>
        );
    }

    if (examStatus === "passed" || examStatus === "failed") {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Résultats de l'examen</h2>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate(`/learner/courses/${courseId}`)}
                            startIcon={<ArrowLeft />}
                        >
                            Retour au cours
                        </Button>
                    </div>
                    <div className={`p-6 mb-6 rounded-lg text-center ${examStatus === "passed" ? "bg-green-50" : "bg-red-50"}`}>
                        <div className="flex justify-center mb-4">
                            {examStatus === "passed" ? (
                                <CheckCircle size={64} className="text-green-500" />
                            ) : (
                                <XCircle size={64} className="text-red-500" />
                            )}
                        </div>
                        <h3 className={`text-2xl font-bold ${examStatus === "passed" ? "text-green-700" : "text-red-700"}`}>
                            {examStatus === "passed" ? "Félicitations ! Vous avez réussi" : "Examen non réussi"}
                        </h3>
                        <p className="text-lg mt-2">
                            {examStatus === "passed"
                                ? "Vous avez réussi l'examen avec succès."
                                : "Vous n'avez pas atteint le score minimum requis."}
                        </p>
                        <p className="text-xl font-semibold mt-4">
                            Votre score: {results?.percentage}%
                        </p>
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        {examStatus === "failed" && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    setExamStatus("not-started");
                                    setSelectedAnswers({});
                                    setSubmitted(false);
                                    setResults(null);
                                }}
                            >
                                Réessayer
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate(`/learner/courses/${courseId}`)}
                        >
                            Retour au cours
                        </Button>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4">Révision des questions</h3>
                        {randomizedQuestions.map((question, index) => {
                            const userAnswer = selectedAnswers[question.id];
                            const correctAnswer = question.correct_index;
                            const isCorrect = userAnswer === correctAnswer;
                            
                            return (
                                <div key={question.id} className="mb-6 p-4 border rounded-lg relative">
                                    <div className={`absolute -top-3 right-4 px-4 py-1 rounded-full flex items-center gap-2 ${
                                        isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {isCorrect ? (
                                            <>
                                                <CheckCircle size={18} />
                                                <span className="font-medium">Correct</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={18} />
                                                <span className="font-medium">Incorrect</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-start mb-2">
                                        <span className="font-semibold mr-2">{index + 1}.</span>
                                        <p className="flex-1">{question.question_text}</p>
                                    </div>
                                    <div className="ml-6 space-y-2">
                                        {question.options.map((option) => {
                                            const isSelected = userAnswer === option.id;
                                            const isCorrectAnswer = option.id === correctAnswer;
                                            
                                            return (
                                                <div 
                                                    key={option.id}
                                                    className={`p-3 rounded-lg border ${
                                                        isSelected && isCorrectAnswer ? 'bg-green-50 border-green-200' :
                                                        isSelected ? 'bg-red-50 border-red-200' :
                                                        isCorrectAnswer ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <span className="mr-2">
                                                            {isSelected && isCorrectAnswer ? (
                                                                <CheckCircle className="text-green-500" size={20} />
                                                            ) : isSelected ? (
                                                                <XCircle className="text-red-500" size={20} />
                                                            ) : isCorrectAnswer ? (
                                                                <CheckCircle className="text-green-500" size={20} />
                                                            ) : null}
                                                        </span>
                                                        <span className={`${
                                                            isSelected && isCorrectAnswer ? 'text-green-700' :
                                                            isSelected ? 'text-red-700' :
                                                            isCorrectAnswer ? 'text-green-700' : 'text-gray-700'
                                                        }`}>
                                                            {option.text}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <div className="flex justify-center gap-4">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate(`/learner/courses/${courseId}`)}
                        >
                            Retour au cours
                        </Button>
                        {error.includes("tentatives") && (
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => window.location.reload()}
                            >
                                Actualiser
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    console.log("Rendering exam:", exam)
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold mb-4">Examen Final</h1>
                    
                    {examStatus === "not-started" && (
                        <div className="space-y-4">
                            <p className="text-gray-700">
                                Tentatives utilisées: {exam?.tentatives || 0} / {exam?.max_tentatives || 3}
                            </p>
                            {exam?.questions && exam.questions.length > 0 ? (
                                <button
                                    onClick={startExamHandler}
                                    disabled={exam.tentatives >= exam.max_tentatives}
                                    className={`px-6 py-2 rounded-md text-white ${
                                        exam.tentatives >= exam.max_tentatives
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    Commencer l'examen
                                </button>
                            ) : (
                                <p className="text-red-600">Aucune question disponible pour cet examen.</p>
                            )}
                        </div>
                    )}

                    {/* Rest of your exam UI */}
                </div>
            </div>
        </div>
    )
}

export default FinalQuiz