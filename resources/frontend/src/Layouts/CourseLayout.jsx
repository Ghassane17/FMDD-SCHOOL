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

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('Current learner from localStorage:', user);
        if (!user || user.role !== 'learner') {
            setError('Please log in as a learner.');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }
        setCurrentLearner(user);

        const fetchDashboard = async () => {
            try {
                const response = await getLearnerDashboard(true); // Force refresh
                console.log('Fetched learner dashboard:', response.data);
                setDashboardData(response.data);
            } catch (err) {
                console.error('Failed to fetch dashboard:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message,
                });
                setError('Failed to load data.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [navigate]);

    if (loading) return <Box>Loading...</Box>;
    if (error) return <Box color="error.main">{error}</Box>;

    return (
        <Box sx={{ minHeight: '100vh' }}>
            <CssBaseline />
            <Header
                school= 'FMDD SCHOOL'
                userName={currentLearner?.username || 'Learner'}
                avatar={currentLearner?.avatar || 'https://via.placeholder.com/50'}
                notifications={currentLearner?.notifications || []}
            />
            <Box component="main" sx={{ 
                mt: '10px',
                minHeight: 'calc(100vh - 64px)'
            }}>
                <Outlet />
            </Box>
            <Footer />
        </Box>
    );
};

export default CourseLayout;
