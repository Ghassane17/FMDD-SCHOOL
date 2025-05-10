import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';


const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ width: "100 %" , flexGrow: 1, pt: 8, pb: 4 }}>
        <Outlet />
      </Box>
      <Footer/>
    </Box>
  );
};

export default MainLayout;