import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { getInstructorDashboard } from '../services/api_instructor';
import Header from '../components/Learner/Header';

const InstructorLayout = () => {
    const [currentInstructor, setCurrentInstructor] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInstructorData = async () => {
            try {
                const response = await getInstructorDashboard();
                console.log('Instructor dashboard response:', response);
                setCurrentInstructor(response.user);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching instructor data:', err);
                setError('Please log in as an instructor.');
                setLoading(false);
                setTimeout(() => navigate('/login'), 2000);
            }
        };
    
        console.log('Current instructor:', currentInstructor);

        fetchInstructorData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('instructorStats');
        navigate('/login');
    };

    if (loading) return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-500">
            <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-semibold text-white">FMDD SCHOOL</h2>
                <p className="mt-2 text-white/80">Chargement de votre tableau de bord...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center text-red-500 bg-gradient-to-r from-indigo-600 to-blue-500">
            {error}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Use the same Header component as the home page */}
            <Header
                school="FMDD SCHOOL"
                isAuthenticated={true}
                user={currentInstructor}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 min-h-[70vh]">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default InstructorLayout;
