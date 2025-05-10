import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import FormationCard from './CourseCard';

const formationsData = {
  "Jeunes chercheurs d'emploi": [
    {
      image: '/images/formation-emploi.webp',
      title: 'Créer un CV efficace',
      level: 'débutant',
      description: 'Apprenez à rédiger un CV qui attire l\'attention des recruteurs'
    },
    {
      image: '/images/formation-entretien.webp',
      title: 'Réussir son entretien d\'embauche',
      level: 'intermédiaire',
      description: 'Préparez-vous aux questions fréquentes et adoptez une attitude gagnante.'
    },
    {
      image: '/images/formation-linkedin.webp',
      title: 'Utiliser LinkedIn pour trouver un emploi',
      level: 'débutant',
      description: 'Optimisez votre profil et développez votre réseau professionnel.'
    }
  ],

  "Étudiants, stagiaires, diplômés sans emploi": [
    {
      image: '/images/formation-gestion-temps.webp',
      title: 'Gestion du temps pour étudiants',
      level: 'débutant',
      description: 'Organisez vos études et projets personnels efficacement.'
    },
    {
      image: '/images/formation-projet.webp',
      title: 'Méthodologie de projet professionnel',
      level: 'intermédiaire',
      description: 'Définissez vos objectifs professionnels et planifiez votre parcours.'
    },
    {
      image: '/images/formation-soft-skills.webp',
      title: 'Développer ses soft skills',
      level: 'intermédiaire',
      description: 'Renforcez vos compétences relationnelles et votre leadership.'
    }
  ],

  "Entrepreneurs et porteurs de projets": [
    {
      image: '/images/formation-business-plan.webp',
      title: 'Réaliser un business plan',
      level: 'avancé',
      description: 'Apprenez à structurer votre projet pour convaincre investisseurs et partenaires.'
    },
    {
      image: '/images/formation-marketing.webp',
      title: 'Marketing digital pour entrepreneurs',
      level: 'intermédiaire',
      description: 'Utilisez les réseaux sociaux pour promouvoir votre activité.'
    },
    {
      image: '/images/formation-financement.webp',
      title: 'Trouver des financements',
      level: 'avancé',
      description: 'Identifiez les sources de financement adaptées à votre projet.'
    }
  ],

  "Membres d'associations et coopératives": [
    {
      image: '/images/formation-gestion-association.webp',
      title: 'Gérer une association efficacement',
      level: 'intermédiaire',
      description: 'Améliorez la gestion administrative et financière de votre structure.'
    },
    {
      image: '/images/formation-communication.webp',
      title: 'Communication associative',
      level: 'débutant',
      description: 'Apprenez à mieux faire connaître votre cause et vos actions.'
    },
    {
      image: '/images/formation-evenementiel.webp',
      title: 'Organiser des événements',
      level: 'intermédiaire',
      description: 'Maîtrisez les bases de l\'organisation d\'événements associatifs.'
    }
  ],

  "Femmes rurales ou urbaines souhaitant se former": [
    {
      image: '/images/formation-entreprenariat-feminin.webp',
      title: 'Entrepreneuriat féminin',
      level: 'débutant',
      description: 'Soutenir les femmes dans la création de leur entreprise.'
    },
    {
      image: '/images/formation-informatique.webp',
      title: 'Initiation à l\'informatique',
      level: 'débutant',
      description: 'Apprenez les bases de l\'utilisation d\'un ordinateur et d\'Internet.'
    },
    {
      image: '/images/formation-leadership-feminin.webp',
      title: 'Leadership au féminin',
      level: 'intermédiaire',
      description: 'Développez votre confiance et votre leadership.'
    }
  ],

  "Tout citoyen souhaitant monter en compétence": [
    {
      image: '/images/formation-langues.webp',
      title: 'Apprendre une nouvelle langue',
      level: 'débutant',
      description: 'Découvrez des méthodes efficaces pour apprendre rapidement.'
    },
    {
      image: '/images/formation-bureautique.webp',
      title: 'Maîtriser les outils bureautiques',
      level: 'intermédiaire',
      description: 'Formez-vous sur Word, Excel et PowerPoint.'
    },
    {
      image: '/images/formation-developpement-personnel.webp',
      title: 'Développement personnel',
      level: 'débutant',
      description: 'Améliorez votre organisation, confiance et productivité.'
    }
  ]
};


const SectionFormation = ({ publicCible }) => {
  const formations = formationsData[publicCible] || [];

  return (
    <Box component="section" sx={{ my: 6 }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ 
        fontWeight: 700,
        color: 'primary.main',
        borderBottom: '2px solid',
        borderColor: 'primary.main',
        pb: 1,
        mb: 3
      }}>
        {publicCible}
      </Typography>
      
      <Grid container spacing={4}>
        {formations.map((formation, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <FormationCard {...formation} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SectionFormation;