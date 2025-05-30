import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Bell, User } from 'lucide-react';
import { getInstructorDashboard } from '../services/api_instructor';
import { DropDownInstructor } from '../components/formateurs/dropDownInstructor';

const InstructorLayout = () => {
    const [currentInstructor, setCurrentInstructor] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInstructorData = async () => {
            try {
                const response = await getInstructorDashboard();
                console.log('Instructor dashboard response:', response);
                console.log('Instructor data:', response.instructor);
                setCurrentInstructor(response.user);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching instructor data:', err);
                setError('Please log in as an instructor.');
                setLoading(false);
                setTimeout(() => navigate('/login'), 2000);
            }
        };
    

        fetchInstructorData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
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
            {/* Header */}
            <header className="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Left side - Logo and Mobile menu button */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 rounded-md text-white hover:bg-indigo-700 focus:outline-none"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="ml-4 lg:ml-0">
                                <h1 className="text-2xl font-bold text-white tracking-tight">FMDD SCHOOL</h1>
                            </div>
                        </div>
                        {/* Right side - Profile and Notifications */}
                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <button className="p-2 rounded-full text-white hover:bg-indigo-700 relative transition-colors">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                            </button>
                            {/* Profile Dropdown */}
                            <div className="flex items-center space-x-3">
                                <DropDownInstructor currentInstructor={currentInstructor} />
                                <span className="hidden md:block text-base font-medium text-white drop-shadow">
                                    {currentInstructor?.name || 'Instructor'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
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
