import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInstructorCourses } from '../../services/api_instructor';
import { MessageCircle, Users, Clock, AlertCircle, Loader, ArrowRight, Hash, CheckCircle2 } from 'lucide-react';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function ChatMessageInstructor() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await getInstructorCourses();
            setCourses(data.courses || []);
            setError('');
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Impossible de charger les cours');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseClick = (courseId) => {
        navigate(`/instructor/chat/${courseId}`);
    };

    const formatCommentCount = (count) => {
        if (!count || count === 0) return 'Aucun commentaire';
        if (count === 1) return '1 commentaire';
        return `${count} commentaires`;
    };

    const getStatusBadge = (isPublished) => {
        if (isPublished) {
            return (
                <span className="flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Publié
                </span>
            );
        }
        return (
            <span className="flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                <Clock className="w-3 h-3 mr-1" />
                En attente
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-3xl border border-slate-200/50">
                <div className="text-center space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                            <Loader className="h-8 w-8 animate-spin text-white" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">Chargement des cours</h3>
                        <p className="text-slate-600">Récupération de vos cours et commentaires...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <MessageCircle className="h-7 w-7 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Hash className="h-4 w-4 text-blue-300" />
                                <h2 className="text-xl font-bold text-white">Gestion des Discussions</h2>
                            </div>
                            <p className="text-blue-100 text-sm">
                                Consultez et répondez aux questions de vos apprenants
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-white/80 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{courses.length}</span>
                        <span className="text-xs text-white/60">cours</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                {error && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl text-red-700 text-sm flex items-center gap-3 shadow-sm backdrop-blur-sm">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                            <p className="font-medium">Erreur de connexion</p>
                            <p className="text-red-600/80">{error}</p>
                        </div>
                    </div>
                )}

                {courses.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="space-y-6">
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                                    <MessageCircle className="h-12 w-12 text-slate-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-800">Aucun cours trouvé</h3>
                                <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                                    Vous n'avez pas encore de cours avec des discussions. Créez un cours pour commencer à interagir avec vos apprenants.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div 
                                key={course.id} 
                                onClick={() => handleCourseClick(course.id)}
                                className="group relative bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer hover:scale-105 hover:border-blue-300/50"
                            >
                                {/* Course Image */}
                                <div className="relative h-40 mb-4 rounded-xl overflow-hidden">
                                    <img 
                                        src={backendUrl + course.course_thumbnail} 
                                        alt={course.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    <div className="absolute top-3 right-3">
                                        {getStatusBadge(course.is_published)}
                                    </div>
                                </div>

                                {/* Course Info */}
                                <div className="space-y-3">
                                    <h3 className="font-bold text-lg text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                                        {course.title}
                                    </h3>
                                    
                                    <p className="text-slate-600 text-sm line-clamp-2">
                                        {course.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center text-slate-600 text-sm">
                                                <Users className="h-4 w-4 mr-1 text-blue-500" />
                                                <span>{course.students || 0} apprenants</span>
                                            </div>
                                            <div className="flex items-center text-slate-600 text-sm">
                                                <MessageCircle className="h-4 w-4 mr-1 text-green-500" />
                                                <span>{formatCommentCount(course.comment_count || 0)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Effect Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


