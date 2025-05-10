import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Badge,
  Box,
  Button,
  CssBaseline,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import AdminSidebar from '../components/AdminView/AdminSidebar.jsx';
import React, { useState } from 'react';

const drawerWidth = 240;

// Mock notifications data (replace with API call in production)
const mockNotifications = [
  {
    id: 1,
    courseTitle: 'React pour débutants',
    formateur: 'Sophie Martin',
    submittedAt: '2025-05-01',
  },
  {
    id: 2,
    courseTitle: 'Data Science avec Python',
    formateur: 'Sophie Martin',
    submittedAt: '2025-04-30',
  },
];

const AdminLayout = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleNotificationsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setAnchorEl(null);
  };

  const handleAcceptCourse = (courseId) => {
    // Replace with API call to approve course
    console.log(`Accepting course with ID: ${courseId}`);
    // Example API call: axios.post(`/api/courses/${courseId}/approve`)
    handleNotificationsClose();
  };

  const handleDenyCourse = (courseId) => {
    // Replace with API call to deny course
    console.log(`Denying course with ID: ${courseId}`);
    // Example API call: axios.post(`/api/courses/${courseId}/deny`)
    handleNotificationsClose();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      {/* Top Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#1e293b',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            FMDD ADMIN
          </Typography>
          <IconButton color="inherit" onClick={handleNotificationsClick}>
            <Badge badgeContent={mockNotifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleNotificationsClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: { maxWidth: '400px', width: '100%' },
            }}
          >
            {mockNotifications.length === 0 ? (
              <MenuItem>No new notifications</MenuItem>
            ) : (
              mockNotifications.map((notification) => (
                <MenuItem
                  key={notification.id}
                  sx={{ flexDirection: 'column', alignItems: 'flex-start', p: 2 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    New Course: {notification.courseTitle}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Submitted by {notification.formateur} on {notification.submittedAt}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleAcceptCourse(notification.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => handleDenyCourse(notification.id)}
                    >
                      Deny
                    </Button>
                  </Box>
                </MenuItem>
              ))
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <AdminSidebar drawerWidth={drawerWidth} />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#f8fafc',
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Outlet /> {/* Renders DashboardPage, LearnersPage, etc. */}
      </Box>
    </Box>
  );
};

export default AdminLayout;