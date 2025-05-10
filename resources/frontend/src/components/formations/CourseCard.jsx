import React from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  Stack,
  Rating,
  Avatar
} from '@mui/material';
import { Link } from 'react-router-dom';
import { trainerData } from '../../data/trainerData.js';

const FormationCard = ({ course }) => {
  const levelColors = {
    débutant: 'success',
    intermédiaire: 'warning',
    avancé: 'error'
  };

  return (
    <Card sx={{ 
      maxWidth: 345, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
      }
    }}>
      <CardMedia
        component="img"
        height="160"
        image={course.image}
        alt={course.title}
        loading="lazy"
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip 
            label={course.level || 'intermédiaire'} 
            color={levelColors[(course.level || 'intermédiaire').toLowerCase()]} 
            size="small" 
          />
          <Chip 
            label={`${course.students} étudiants`} 
            variant="outlined"
            size="small"
          />
        </Stack>
        
        <Typography gutterBottom variant="h6" component="h3" sx={{ mb: 1 }}>
          {course.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating 
            value={course.rating} 
            precision={0.1} 
            readOnly 
            size="small" 
          />
          <Typography variant="body2" sx={{ ml: 1 }}>
            {course.rating} ({Math.floor(course.students * 0.8)} avis)
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 2 }}>
          <Avatar 
            src={trainerData.avatar} 
            alt={trainerData.name}
            sx={{ width: 32, height: 32 }}
          />
          <Typography variant="body2">
            Par {trainerData.name}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FormationCard;