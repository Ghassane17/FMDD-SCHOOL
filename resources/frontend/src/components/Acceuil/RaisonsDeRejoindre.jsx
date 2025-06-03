import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Grid } from '@mui/material';
import { motion } from 'framer-motion';

const raisons = [
  "1. Formation technique par des experts",
  "2. Programme d'IA de pointe",
  "3. Apprentissage par projets pratiques",
  "4. Focus sur les technologies durables",
  "5. Programmes alignés sur l'industrie",
  "6. Frais de scolarité abordables",
  "7. Mentorat professionnel",
  "8. Certification internationale",
  "9. Contenu localisé",
  "10. Parcours d'apprentissage flexibles",
  "11. Formation entrepreneuriale",
  "12. Aide au placement professionnel",
  "13. Installations modernes",
  "14. Communauté étudiante diverse",
  "15. Partenariats industriels",
  "16. Focus sur les compétences pratiques",
  "17. Labs d'innovation",
  "18. Compétitions technologiques",
  "19. Réseautage professionnel",
  "20. Coaching personnalisé",
  "21. Focus sur la transformation digitale",
  "22. Compétences pour le futur",
  "23. Conférences d'experts",
  "24. Opportunités de recherche",
  "25. Incubation de startups",
  "26. Perspective technologique globale",
  "27. Pertinence pour le marché local",
  "28. Mises à jour continues des compétences",
  "29. Environnement collaboratif",
  "30. Accès aux dernières technologies",
  "31. Méthodes pédagogiques innovantes",
  "32. Projets réels avec entreprises",
  "33. Développement de carrière",
  "34. Alumni réseau puissant",
  "35. Équipements de pointe",
  "36. Enseignants industriels expérimentés",
  "37. Programme de bourses",
  "38. Échanges internationaux",
  "39. Préparation aux certifications",
  "40. Soft skills intégrées",
  "41. Accès à des bases de données pro",
  "42. Hackathons réguliers",
  "43. Veille technologique",
  "44. Double compétence technique",
  "45. Suivi individuel",
  "46. Espaces de coworking",
  "47. Événements tech mensuels",
  "48. Partenariats avec universités",
  "49. Accompagnement vers l'emploi",
  "50. Communauté engagée pour l'avenir"
];

export default function RaisonsDeRejoindre() {
  const [raisonActuelle, setRaisonActuelle] = useState('');
  const [index, setIndex] = useState(0);
  const [sousIndex, setSousIndex] = useState(0);
  const [effacer, setEffacer] = useState(false);

  useEffect(() => {
    const vitesses = {
      ecriture: 50, // ms entre chaque caractère
      pause: 3000, // ms avant effacement
      effacement: 30 // ms entre chaque effacement
    };

    if (effacer) {
      if (sousIndex > 0) {
        const timeout = setTimeout(() => {
          setSousIndex(sousIndex - 1);
          setRaisonActuelle(raisons[index].substring(0, sousIndex - 1));
        }, vitesses.effacement);
        return () => clearTimeout(timeout);
      } else {
        setEffacer(false);
        setIndex((index + 1) % raisons.length);
      }
    } else {
      if (sousIndex < raisons[index].length) {
        const timeout = setTimeout(() => {
          setSousIndex(sousIndex + 1);
          setRaisonActuelle(raisons[index].substring(0, sousIndex + 1));
        }, vitesses.ecriture);
        return () => clearTimeout(timeout);
      } else if (sousIndex === raisons[index].length) {
        const timeout = setTimeout(() => setEffacer(true), vitesses.pause);
        return () => clearTimeout(timeout);
      }
    }
  }, [sousIndex, index, effacer]);

  return (
    <Box
      sx={{
        py: 8,
        px: 2,
        background: 'linear-gradient(135deg, #0f766e 0%, #1e40af 100%)',
        color: '#fff',
        textAlign: 'center'
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          component="h2"
          sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 700,
            mb: 6,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -16,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 80,
              height: 4,
              background: '#00f7ff',
              borderRadius: 2
            }
          }}
        >
          Pourquoi s'abboner avec FMDD SCHOOL ?
        </Typography>

        <Box
          sx={{
            minHeight: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 6
          }}
        >
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontSize: { xs: '1.5rem', md: '2rem' },
              fontWeight: 600,
              minHeight: '3em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {raisonActuelle}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              sx={{ ml: 0.5 }}
            >
              |
            </motion.span>
          </Typography>
        </Box>

        <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
          <Grid item>
            <Button
              variant="contained"
              size="large"
              href="#inscription"
              sx={{
                bgcolor: '#00f7ff',
                color: '#0f172a',
                fontWeight: 700,
                px: 4,
                py: 2,
                '&:hover': {
                  bgcolor: '#0f766e'
                }
              }}
            >
              S'inscrire maintenant
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              size="large"
              href="#programmes"
              sx={{
                color: '#fff',
                borderColor: '#fff',
                fontWeight: 700,
                px: 4,
                py: 2,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Voir nos programmes
            </Button>
          </Grid>
        </Grid>

        <Typography
          variant="body1"
          sx={{
            fontStyle: 'italic',
            opacity: 0.9,
            maxWidth: '600px',
            mx: 'auto'
          }}
        >
          "Participez à des projets durables et connectez-vous avec une communauté engagée pour un avenir meilleur."
        </Typography>
      </Container>
    </Box>
  );
}
