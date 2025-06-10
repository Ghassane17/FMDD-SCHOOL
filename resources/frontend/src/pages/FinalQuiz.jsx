"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button, Alert, CircularProgress, Box, Typography } from "@mui/material"
import { getExam, submitExam, isAuthenticated } from "../services/api.js"
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

const FinalQuiz = () => {
    const { courseId } = useParams()
    const navigate = useNavigate()
    const [exam, setExam] = useState(null)
    const [selectedAnswers, setSelectedAnswers] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [randomizedOptions, setRandomizedOptions] = useState({}) // Stores randomized options for each question

    // New state variables for enhanced experience
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

        const fetchExam = async () => {
            setLoading(true)
            setError(null)

            const parsedCourseId = Number.parseInt(courseId, 10)
            if (isNaN(parsedCourseId) || parsedCourseId <= 0) {
                console.error("Invalid course ID:", courseId)
                setError("Invalid course ID.")
                setLoading(false)
                return
            }

            try {
                const response = await getExam(parsedCourseId)
                console.log("🚀 Exam Details:", JSON.stringify(response, null, 2))
                if (!response?.success || !response?.data?.exam) {
                    throw new Error(response?.message || "Failed to load exam.")
                }
                
                const examData = response.data.exam;
                if (!examData.questions || !Array.isArray(examData.questions)) {
                    throw new Error("Invalid exam data structure: questions array is missing or invalid");
                }

                // Validate and normalize questions, and initialize randomized options
                const normalizedQuestions = examData.questions.map(question => {
                    if (!question.question && !question.question_text) {
                        console.error("Invalid question structure:", question);
                        throw new Error("Question is missing text content");
                    }
                    if (!Array.isArray(question.options)) {
                        console.error("Invalid question structure:", question);
                        throw new Error("Question is missing options array");
                    }

                    return {
                        ...question,
                        question_text: question.question_text || question.question,
                    };
                });

                // Randomize options for each question on every fetch (page reload)
                const shuffledOptions = normalizedQuestions.reduce((acc, question) => {
                    acc[question.id] = shuffleArray([...question.options]);
                    return acc;
                }, {});

                setExam({ ...examData, questions: normalizedQuestions });
                setRandomizedOptions(shuffledOptions);
                setTimeRemaining(examData.duration_min * 60)
            } catch (err) {
                console.error("❌ Fetch Exam Error:", {
                    message: err.message,
                    status: err.status,
                    response: err.response?.data,
                })
                setError(err.message || "Failed to load exam.")
            } finally {
                setLoading(false)
            }
        }

        fetchExam()

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [courseId, navigate])

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

    const startExam = () => {
        setExamStatus("in-progress")
    }

    const handleSelectAnswer = (questionId, optionId) => {
        if (examStatus === "in-progress") {
            console.log("Selected answer:", { questionId, optionId })
            setSelectedAnswers({ ...selectedAnswers, [questionId]: optionId })
        }
    }

    const handleSubmit = async () => {
        console.log("Submitting answers:", selectedAnswers)

        if (timerRef.current) {
            clearInterval(timerRef.current)
        }

        if (Object.keys(selectedAnswers).length < (exam?.questions?.length || 0)) {
            if (timeRemaining > 0) {
                setError("Please answer all questions.")
                return
            }
        }

        setLoading(true)
        setError(null)

        try {
            const response = await submitExam(Number.parseInt(courseId, 10), selectedAnswers)
            console.log("🚀 Submit Exam Response:", JSON.stringify(response, null, 2))
            
            if (response.data?.questions) {
                const updatedExam = {
                    ...exam,
                    questions: exam.questions.map(q => {
                        const responseQuestion = response.data.questions[q.id];
                        return {
                            ...q,
                            correct_index: responseQuestion?.correct_index
                        };
                    })
                };
                setExam(updatedExam);
            }
            
            setResults(response.data)
            setSubmitted(true)
            setExamStatus("completed")
        } catch (err) {
            console.error("❌ Submit Exam Error:", {
                message: err.message,
                status: err.status,
                response: err.response?.data,
            })
            setError(err.message || "Failed to submit exam.")
        } finally {
            setLoading(false)
        }
    }

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
                    <h2 className="text-2xl font-bold mb-6 text-center">{exam.title}</h2>
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
                        </ul>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p>
                                {exam.instructions ||
                                    "Answer all questions to the best of your ability. Once you start the exam, the timer will begin counting down."}
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>You must complete the exam within the allotted time.</li>
                                <li>The exam will automatically submit when time expires.</li>
                                <li>You cannot pause the exam once started.</li>
                                <li>Ensure you have a stable internet connection.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <Button variant="contained" color="primary" size="large" onClick={startExam} className="px-8 py-2">
                            Start Exam
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (examStatus === "completed" && results) {
        const passedExam = results.passed
        const percentageScore = results.percentage || 0

        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center">Exam Results</h2>
                    <div className={`p-6 mb-6 rounded-lg text-center ${passedExam ? "bg-green-50" : "bg-red-50"}`}>
                        <div className="flex justify-center mb-4">
                            {passedExam ? (
                                <CheckCircle size={64} className="text-green-500" />
                            ) : (
                                <XCircle size={64} className="text-red-500" />
                            )}
                        </div>
                        <h3 className={`text-2xl font-bold ${passedExam ? "text-green-700" : "text-red-700"}`}>
                            {passedExam ? "Congratulations! You Passed" : "Exam Not Passed"}
                        </h3>
                        <p className="text-lg mt-2">
                            {passedExam
                                ? "You have successfully completed this certification exam."
                                : "You did not meet the minimum passing score for this exam."}
                        </p>
                        <p className="text-xl font-semibold mt-4">
                            Your Score: {percentageScore}%
                        </p>
                    </div>
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-4">Question Review</h3>
                        {exam.questions.map((question, index) => {
                            const userAnswer = selectedAnswers[question.id];
                            const correctAnswer = question.correct_index;
                            const isCorrect = userAnswer === correctAnswer;
                            
                            console.log(`Question ${index + 1}:`, {
                                userAnswer,
                                correctAnswer,
                                isCorrect,
                                questionId: question.id
                            });
                            
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
        )
    }

    console.log("Rendering exam:", exam)
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="sticky top-0 z-10 bg-white shadow-md p-4 mb-6 rounded-lg flex items-center justify-between">
                <h2 className="text-xl font-bold">Final Exam: {exam.title}</h2>
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
                        style={{ width: `${(Object.keys(selectedAnswers).length / exam.questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>
            {error && (
                <Alert severity="error" className="mb-4" icon={<AlertTriangle className="h-5 w-5" />}>
                    {error}
                </Alert>
            )}
            <div className="space-y-6">
                {exam.questions.map((question, index) => (
                    <div key={question.id} className="p-4 bg-white rounded-lg shadow">
                        <p className="text-lg font-semibold mb-4">
                            Question {index + 1}: {question.question_text}
                        </p>
                        <div className="space-y-2">
                            {Array.isArray(randomizedOptions[question.id]) && randomizedOptions[question.id].length > 0 ? (
                                randomizedOptions[question.id].map((option) => (
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
                                ))
                            ) : (
                                <p className="text-red-500">No options available for this question.</p>
                            )}
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
    )
}

export default FinalQuiz