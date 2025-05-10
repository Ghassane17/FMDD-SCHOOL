import React from 'react';
import { Box, Container, Typography, Button, Grid, Fade, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

// Theme-based colors for easy maintenance
const neonColors = {
  primary: '#00f7ff',
  secondary: '#0f766e',
  text: '#ffffff',
  glow: 'rgba(0, 247, 255, 0.3)',
};

// Keyframes for animations
const globalStyles = `
  @keyframes neonGlow {
    from {
      text-shadow: 0 0 5px ${neonColors.text}, 0 0 10px ${neonColors.glow}, 0 0 20px ${neonColors.secondary};
    }
    to {
      text-shadow: 0 0 10px ${neonColors.text}, 0 0 20px ${neonColors.primary}, 0 0 30px ${neonColors.secondary};
    }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

// Styled components
const NeonTypography = styled(Typography)(({ theme }) => ({
  color: neonColors.text,
  animation: 'neonGlow 1.5s ease-in-out infinite alternate',
}));

const NeonButton = styled(Button)(({ theme }) => ({
  color: neonColors.text,
  border: `1px solid ${neonColors.primary}`,
  borderRadius: 8,
  padding: theme.spacing(1.5, 4),
  fontSize: '1rem',
  fontWeight: 600,
  boxShadow: `0 0 5px ${neonColors.text}, 0 0 10px ${neonColors.primary}`,
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: 'rgba(0, 247, 255, 0.1)',
    boxShadow: `0 0 10px ${neonColors.text}, 0 0 20px ${neonColors.primary}`,
    transform: 'translateY(-2px)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: `linear-gradient(45deg, transparent, ${neonColors.primary}, transparent)`,
    transform: 'rotate(45deg)',
    animation: 'shine 3s infinite',
  },
  '@keyframes shine': {
    '0%': { transform: 'rotate(45deg) translateX(-100%)' },
    '100%': { transform: 'rotate(45deg) translateX(100%)' },
  },
}));

const GlowingBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(30, 64, 175, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${neonColors.primary}`,
  boxShadow: `0 0 15px ${neonColors.glow}`,
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${neonColors.primary}, transparent)`,
    animation: 'pulseGlow 3s ease-in-out infinite',
  },
}));

export default function LearnMore() {
  const theme = useTheme();

  const partners = [
    { name: 'Partenaire 1', src: 'src/assets/atijari.png' },
    { name: 'Partenaire 2', src: 'src/assets/darChabab.jpg' },
    { name: 'Partenaire 3', src: 'src/assets/orange.png' },
    { name: 'Partenaire 4', src: 'src/assets/renault.png' },
  ];

  return (
    <>
      <style>{globalStyles}</style>
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 2, md: 0 },
          background: `linear-gradient(135deg, #1e40af 0%, #0f172a 100%)`,
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: 'auto', md: '80vh' },
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 70% 30%, ${neonColors.glow}, transparent 70%)`,
            animation: 'pulseGlow 8s ease-in-out infinite',
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            {/* Left Section */}
            <Grid item xs={12} md={6}>
              <Fade in timeout={800}>
                <GlowingBox>
                  <NeonTypography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontSize: { xs: '2rem', md: '3rem' },
                      fontWeight: 700,
                      mb: 3,
                      lineHeight: 1.2,
                    }}
                  >
                    Rejoignez FMDD SCHOOL
                  </NeonTypography>
                  
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 300,
                      color: neonColors.text,
                      mb: 4,
                      opacity: 0.9,
                      lineHeight: 1.6,
                    }}
                  >
                    Participez à des projets durables et connectez-vous avec une communauté engagée pour un avenir meilleur.
                  </Typography>
                  
                  <NeonButton
                    variant="outlined"
                    href="<Hero/>"
                    aria-label="Rejoindre FMDD SCHOOL"
                  >
                    Maintenant
                  </NeonButton>
                </GlowingBox>
              </Fade>
            </Grid>

            {/* Right Section */}
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <GlowingBox sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 4 }}>
                   
                    
                    <Box
                      component="img"
                      src="src/assets/LOGO.png"
                      alt="Logo FMDD SCHOOL"
                      sx={{
                        width: { xs: '160px', md: '220px' },
                        height: 'auto',
                        filter: 'drop-shadow(0 0 12px rgba(0, 247, 255, 0.7))',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    />
                  </Box>
                  
                  <NeonTypography variant="h5" component="h3" sx={{ mb: 4 }}>
                    Nos Partenaires les plus Fidèles
                  </NeonTypography>
                  
                  <Grid container spacing={3} justifyContent="center">
                    {partners.map((partner, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Box
                          component="img"
                          src={partner.src}
                          alt={partner.name}
                          sx={{
                            width: '100%',
                            maxWidth: '110px',
                            height: 'auto',
                            filter: 'drop-shadow(0 0 8px rgba(0, 247, 255, 0.5))',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              filter: 'drop-shadow(0 0 12px rgba(0, 247, 255, 0.8))',
                              transform: 'scale(1.1)',
                            },
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </GlowingBox>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}