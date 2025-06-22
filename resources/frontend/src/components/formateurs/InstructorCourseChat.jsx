import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import CourseChat from '../Course/CourseChat';

export default function InstructorCourseChat() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/instructor/chat');
    };

    return (
        <div className="max-w-full mx-auto">
            {/* Header with back button */}
            <div className="mb-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBack}
                            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 font-medium"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Retour aux cours</span>
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <MessageCircle className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Discussion du cours</h2>
                                <p className="text-slate-600 text-sm">Répondez aux questions de vos apprenants</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Chat Component */}
            <CourseChat />
        </div>
    );
} 