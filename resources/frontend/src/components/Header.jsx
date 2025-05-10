import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const navItems = [
  { label: 'Accueil', path: '/' },
  { label: 'Formations', path: '/formations' },
  { label: 'À propos', path: '/a-propos' },
  { label: 'Contact', path: '/contact' },
];

const authItems = [
  { label: 'Se connecter', path: '/login', variant: 'outlined' },
  { label: 'Rejoindre', path: '/register', variant: 'contained' },
];

const MobileDrawer = ({ open, onClose, items }) => {
  return (
    <SwipeableDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
    >
      <Box sx={{ width: 250 }} role="presentation">
        <List>
          {items.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton 
                component={NavLink} 
                to={item.path}
                onClick={onClose}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </SwipeableDrawer>
  );
};

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar position="fixed" sx={{ background: 'linear-gradient(to right, #0f766e, #1e40af)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography component={NavLink} to="/" variant="h6" sx={{ color: 'white', textDecoration: 'none' }}>
            FMDD SCHOOL
          </Typography>

          {!isMobile ? (
            <>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {navItems.map((item) => (
                  <Button key={item.path} component={NavLink} to={item.path} sx={{ color: 'white' }}>
                    {item.label}
                  </Button>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {authItems.map((item) => (
                  <Button
                    key={item.path}
                    component={NavLink}
                    to={item.path}
                    variant={item.variant}
                    sx={{ color: item.variant === 'outlined' ? 'white' : undefined }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            </>
          ) : (
            <IconButton color="inherit" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <MobileDrawer 
        open={mobileOpen} 
        onClose={handleDrawerToggle} 
        items={[...navItems, ...authItems]} 
      />
    </>
  );
}