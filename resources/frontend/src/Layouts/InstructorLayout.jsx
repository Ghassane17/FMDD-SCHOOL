import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Bell, User } from 'lucide-react';
import { getInstructorDashboard } from '../services/api_instructor';

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
                setCurrentInstructor(response.instructor);
                setLoading(false);
            } catch (err) {
                setError('Please log in as an instructor.');
                setLoading(false);
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        fetchInstructorData();
    }, [navigate]);

    const handleLogout = () => {
        // Clear any remaining auth data
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center text-red-500">
            {error}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Left side - Logo and Mobile menu button */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="ml-4 lg:ml-0">
                                <h1 className="text-xl font-bold text-gray-900">FMDD SCHOOL</h1>
                            </div>
                        </div>

                        {/* Right side - Profile and Notifications */}
                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    className="flex items-center space-x-3 focus:outline-none"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                >
                                    <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                                        {currentInstructor?.user?.avatar ? (
                                            <img
                                                src={currentInstructor.user.avatar}
                                                alt="Profile"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-full w-full p-1 text-gray-500" />
                                        )}
                                    </div>
                                    <span className="hidden md:block text-sm font-medium text-gray-700">
                                        {currentInstructor?.user?.name || 'Instructor'}
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                {isMobileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                        <div className="py-1">
                                            <button
                                                onClick={() => navigate('/instructor/profile')}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                                            >
                                                <User className="h-5 w-5 mr-2" />
                                                Profile
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                                            >
                                                <LogOut className="h-5 w-5 mr-2" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Outlet />
            </main>
        </div>
    );
};

export default InstructorLayout;
