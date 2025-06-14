import React, { useEffect, useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Learner/Header.jsx';
import Footer from '../components/Footer.jsx';

const CourseLayout = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    const checkAuth = () => {
        try {
            const userData = localStorage.getItem("user");
            const token = localStorage.getItem("token");
            console.log("Checking auth - User data:", userData);
            console.log("Checking auth - Token:", token);
            
            if (userData && token) {
                const parsedUser = JSON.parse(userData);
                console.log("Setting current user:", parsedUser);
                setCurrentUser(parsedUser);
            } else {
                console.log("No user data or token found");
                setCurrentUser(null);
            }
        } catch (error) {
            console.error("Error checking auth:", error);
            setCurrentUser(null);
        }
    };

    useEffect(() => {
        checkAuth();

        // Listen for storage changes
        const handleStorageChange = (e) => {
            if (e.key === "user" || e.key === "token") {
                console.log("Storage changed:", e.key);
                checkAuth();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setCurrentUser(null);
        navigate("/");
    };

    return (
        <Box sx={{ minHeight: '100vh' }}>
            <CssBaseline />
            <Header
                school='FMDD SCHOOL'
                isAuthenticated={!!currentUser}
                user={currentUser}
                onLogout={handleLogout}
            />
            <Box component="main" sx={{ mt: '10px', minHeight: 'calc(100vh - 64px)' }}>
                <Outlet />
            </Box>
            <Footer />
        </Box>
    );
};

export default CourseLayout;
