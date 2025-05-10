import { Routes, Route } from 'react-router-dom';
import WelcomePage from '../pages/WelcomePage.jsx';
import FormationsPage from '../pages/FormationsPage.jsx';
import NotFoundPage from '../pages/404.jsx'; // Optional fallback
import MainLayout from '../Layouts/MainLayout.jsx'; // Your layout component
import Propos from '../components/Acceuil/propos.jsx'; // Your layout component
import Contact from '../pages/Contact.jsx';
/* import Login from '../pages/Login.jsx'; */  // Need the api connection before using this component

const PublicRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<WelcomePage />} />
        {/* <Route path="login" element={<Login />} /> */} {/* Uncomment when component is ready */}
        <Route path="formations" element={<FormationsPage />} />
        <Route path="a-propos" element={<Propos />} />
        <Route path="contact" element={<Contact />} /> {/* Assuming you want to use the same component */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default PublicRoutes;