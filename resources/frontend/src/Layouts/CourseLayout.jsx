import React, { useEffect, useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { getLearnerDashboard } from '../services/api.js';
import Header from '../components/Learner/Header.jsx';
import Footer from '../components/Footer.jsx';

const CourseLayout = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [currentLearner, setCurrentLearner] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Utilisation de la variable d'environnement Vite
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'learner') {
            setError('Please log in as a learner.');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }
        setCurrentLearner(user);

        const fetchDashboard = async () => {
            try {
                // Par exemple, si getLearnerDashboard accepte une URL de base
                const response = await getLearnerDashboard(apiBaseUrl, true);
                setDashboardData(response.data);
            } catch (err) {
                setError('Failed to load data.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [navigate, apiBaseUrl]);

    if (loading) return <Box>Loading...</Box>;
    if (error) return <Box color="error.main">{error}</Box>;

    return (
        <Box sx={{ minHeight: '100vh' }}>
            <CssBaseline />
            <Header
                school='FMDD SCHOOL'
                userName={currentLearner?.username || 'Learner'}
                avatar={currentLearner?.avatar || 'https://via.placeholder.com/50'}
                notifications={currentLearner?.notifications || []}
            />
            <Box component="main" sx={{ mt: '10px', minHeight: 'calc(100vh - 64px)' }}>
                <Outlet />
            </Box>
            <Footer />
        </Box>
    );
};

export default CourseLayout;
