
import React from 'react';
import { Box, Container, Typography, Grid, Divider, IconButton } from '@mui/material';
import { Facebook, Twitter, LinkedIn, Instagram } from '@mui/icons-material';
import { Link } from 'react-router-dom'; // Use react-router-dom Link for routing

export default function Footer() {
  // Navigation links matching Header routes
  const navItems = [
    { label: 'Accueil', path: '/' },
    { label: 'Formations', path: '/formations' },
    { label: 'Événements', path: '/' }, // Placeholder route
    { label: 'Blog', path: '/' }, // Placeholder route
  ];

  // Resources links (some placeholder routes, some external)
  const resourceItems = [
    { label: 'Média', path: '/media' }, // Placeholder route
    { label: 'Publications', path: '/publications' }, // Placeholder route
    { label: 'FAQ', path: '/faq' }, // Placeholder route
    { label: 'Carrières', path: '/carrieres' }, // Placeholder route
    { label: 'Partenaires', path: '/partenaires' }, // Placeholder route
  ];

  return (
    <Box
      sx={{
        py: 8,
        px: 4,
        bgcolor: '#0f172a', // Darker blue for more contrast
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: 'linear-gradient(90deg, #00f7ff, #0f766e)',
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Brand Column */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                '&::before': {
                  content: '""',
                  display: 'inline-block',
                  width: '30px',
                  height: '4px',
                  background: '#00f7ff',
                  marginRight: '12px',
                },
              }}
            >
              FMDD SCHOOL
            </Typography>
            <Typography sx={{ mb: 3, opacity: 0.8, lineHeight: 1.6 }}>
              Formations et projets innovants pour un développement durable au Maroc.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {[Facebook, Twitter, LinkedIn, Instagram].map((Icon, index) => (
                <IconButton
                  key={index}
                  sx={{
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 247, 255, 0.3)',
                      transform: 'translateY(-3px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Icon />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Links Column */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, textTransform: 'uppercase' }}>
              Navigation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path} // Use 'to' for react-router-dom Link
                  style={{
                    color: '#fff',
                    opacity: 0.8,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  sx={{
                    '&:hover': {
                      opacity: 1,
                      color: '#00f7ff',
                      pl: 1,
                    },
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Resources Column */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, textTransform: 'uppercase' }}>
              Ressources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {resourceItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path} // Use 'to' for react-router-dom Link
                  style={{
                    color: '#fff',
                    opacity: 0.8,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  sx={{
                    '&:hover': {
                      opacity: 1,
                      color: '#00f7ff',
                      pl: 1,
                    },
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Contact Column */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, textTransform: 'uppercase' }}>
              Contactez-nous
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'rgba(0, 247, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                }}>
                  ✉️
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Email</Typography>
                  <Typography>contact@fmddschool.ma</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'rgba(0, 247, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                }}>
                  📞
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Téléphone</Typography>
                  <Typography>+212 123 456 789</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'rgba(0, 247, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                }}>
                  📍
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Adresse</Typography>
                  <Typography>Casablanca Tech Park, Maroc</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6, bgcolor: 'rgba(255,255,255,0.1)' }} />

        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}>
          <Typography sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} FMDD SCHOOL. Tous droits réservés.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link to="/" style={{ color: '#fff', opacity: 0.7, textDecoration: 'none' }} onMouseOver={(e) => e.target.style.opacity = 1} onMouseOut={(e) => e.target.style.opacity = 0.7}>
              Politique de confidentialité
            </Link>
            <Link to="/" style={{ color: '#fff', opacity: 0.7, textDecoration: 'none' }} onMouseOver={(e) => e.target.style.opacity = 1} onMouseOut={(e) => e.target.style.opacity = 0.7}>
              Conditions d'utilisation
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}