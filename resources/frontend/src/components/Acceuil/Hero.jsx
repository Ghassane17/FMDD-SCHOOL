import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import LOGO from '../../assets/logo.png'; // Assurez-vous que le chemin est correct
import { Link } from 'react-router-dom'; // Utilisez Link de react-router-dom pour la navigation
const mots = ["APPRENDS", "PROGRESSE", "REUSSIS"];
const dureeAffichage = 3000; // 3 secondes par mot
const dureeTransition = 500; // 0.5 seconde de transition

export default function Hero() {
  const [indexMot, setIndexMot] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndexMot((prev) => (prev + 1) % mots.length);
    }, dureeAffichage);
    return () => clearTimeout(timer);
  }, [indexMot]);

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        color: '#fff',
        textAlign: 'center',
        py: { xs: 10, md: 16 },
        minHeight: { xs: '60vh', md: '80vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background image with lazy loading */}
      <Box
        component="img"
        src={LOGO}
        alt="FMDD School Hero"
        loading="lazy"
        decoding="async"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
          filter: 'brightness(0.7)',
        }}
      />
      
      {/* Gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(15, 118, 110, 0.8), rgba(30, 64, 175, 0.9))',
          zIndex: -1,
        }}
      />

      <Container maxWidth="md">
        <Typography
          component="h1"
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', md: '4rem' },
            fontWeight: 700,
            lineHeight: 1.2,
            mb: 3,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Construire aujourd'hui<br />les solutions de demain
        </Typography>
        
        <Box
          sx={{
            height: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 6,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mots[indexMot]}
              initial={{ 
                y: 30, 
                opacity: 0,
                filter: 'blur(8px)'
              }}
              animate={{ 
                y: 0, 
                opacity: 1,
                filter: 'blur(0px)',
                transition: { 
                  duration: dureeTransition / 1000,
                  ease: [0.16, 1, 0.3, 1] // Courbe de transition personnalisée
                }
              }}
              exit={{ 
                y: -30, 
                opacity: 0,
                filter: 'blur(8px)',
                transition: {
                  duration: dureeTransition / 1000 * 0.7 // Sortie plus rapide
                }
              }}
              style={{
                position: 'absolute',
                fontSize: '1.75rem',
                fontWeight: 300,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                willChange: 'transform, opacity, filter' // Optimisation des performances
              }}
            >
              {mots[indexMot]}
            </motion.div>
          </AnimatePresence>
        </Box>
        
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Link to="/login"> 
            
          <Button
            component="a"
            href="#login"
            variant="contained"
            sx={{
              backgroundColor: '#1e40af',
              color: '#fff',
              borderRadius: 8,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              transition: 'transform 0.2s ease-in-out, background-color 0.3s',
              '&:hover': {
                backgroundColor: '#173287',
                transform: 'scale(1.05)',
              },
            }}
          >
           Se connecter
          </Button></Link> 
          
          <Button
            component="a"
            href="/register"
            variant="outlined"
            sx={{
              color: '#fff',
              borderColor: '#fff',
              borderRadius: 8,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              transition: 'transform 0.2s ease-in-out, background-color 0.3s',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: '#fff',
                transform: 'scale(1.05)',
              },
            }}
          >
            S'inscrire
          </Button>
        </Box>
      </Container>
    </Box>
  );
}