import React from 'react';
import { Box, Container, Typography, Grid, Divider, IconButton } from '@mui/material';
import { Facebook, Twitter, LinkedIn, Instagram } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function Footer() {
  const navItems = [
    { label: 'Accueil', path: '/' },
    { label: 'Formations', path: '/formations' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <Box
      sx={{
        py: 6,
        px: 4,
        bgcolor: '#000',
        color: '#fff',
        borderTop: '1px solid #333',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              FMDD SCHOOL
            </Typography>
            <Typography sx={{ opacity: 0.7, fontSize: '0.9rem' }}>
              Formations pour un développement durable
            </Typography>
          </Grid>

          {/* Navigation */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              display: 'flex', 
              gap: 3,
              justifyContent: { xs: 'flex-start', md: 'center' },
              flexWrap: 'wrap'
            }}>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  style={{
                    color: '#fff',
                    opacity: 0.7,
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => e.target.style.opacity = 1}
                  onMouseOut={(e) => e.target.style.opacity = 0.7}
                >
                  {item.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Social & Contact */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              alignItems: 'center',
              gap: 2 
            }}>
              <Typography sx={{ opacity: 0.7, fontSize: '0.85rem', mr: 1 }}>
                contact@fmddschool.ma
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[Facebook, Twitter, LinkedIn, Instagram].map((Icon, index) => (
                  <IconButton
                    key={index}
                    size="small"
                    sx={{
                      color: '#fff',
                      opacity: 0.7,
                      '&:hover': {
                        opacity: 1,
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: '#333' }} />

        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}>
          <Typography sx={{ opacity: 0.6, fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} FMDD SCHOOL. Tous droits réservés.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link 
              to="/" 
              style={{ 
                color: '#fff', 
                opacity: 0.6, 
                textDecoration: 'none',
                fontSize: '0.8rem'
              }} 
              onMouseOver={(e) => e.target.style.opacity = 1} 
              onMouseOut={(e) => e.target.style.opacity = 0.6}
            >
              Confidentialité
            </Link>
            <Link 
              to="/" 
              style={{ 
                color: '#fff', 
                opacity: 0.6, 
                textDecoration: 'none',
                fontSize: '0.8rem'
              }} 
              onMouseOver={(e) => e.target.style.opacity = 1} 
              onMouseOut={(e) => e.target.style.opacity = 0.6}
            >
              Conditions
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}