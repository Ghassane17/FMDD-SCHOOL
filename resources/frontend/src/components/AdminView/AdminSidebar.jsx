import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Toolbar } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Book as BookIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { NewspaperIcon } from 'lucide-react';

const AdminSidebar = ({ drawerWidth }) => {
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Learners', icon: <PeopleIcon />, path: '/admin/learners' },
    { text: 'Formateurs', icon: <SchoolIcon />, path: '/admin/formateurs' },
    { text: 'Courses', icon: <BookIcon />, path: '/admin/courses' },
    { text: 'Nouvautés', icon: <NewspaperIcon />, path: '/admin/nouveautés' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1e293b',
          color: 'white',
        },
      }}
    >
      <Toolbar />
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#334155',
                  '&:hover': {
                    backgroundColor: '#475569',
                  },
                },
                '&:hover': {
                  backgroundColor: '#475569',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default AdminSidebar;