import { Button, Container, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Typography variant="h1" sx={{ mb: 2, color: 'black' }}>
          404 - Page Not Found
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, color: 'red' }}>
          The page you're looking for doesn't exist.
        </Typography>
        <Button component={Link} to="/" variant="contained" size="large">
          Return to Home
        </Button>
      </Container>
    </Box>
  );
}