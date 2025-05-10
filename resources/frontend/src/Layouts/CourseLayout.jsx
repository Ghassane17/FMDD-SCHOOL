// src/Layouts/CourseLayout.jsx
import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from '../components/Learner/Header.jsx';
import Footer from '../components/Footer.jsx';
import { dashboardData } from '../data/learnerData.js';
const currentLearner = dashboardData.learners[0];
const CourseLayout = () => {
  return (

   
    <Box sx={{ minHeight: '100vh' }}>
      <CssBaseline />
      
       <Header
          school={dashboardData.school}
          userName={currentLearner.name}
         
          avatar={currentLearner.avatar}
          notifications={currentLearner.notifications}
        />
      <Box component="main" sx={{ p: 3, mt: '64px', backgroundColor: '#f5f7fa' }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default CourseLayout;
