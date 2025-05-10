
import React from 'react';
import Hero from '../components/Acceuil/Hero.jsx'; // Added .jsx
import Partners from '../components/Acceuil/Partners.jsx'; // Added .jsx
import PopularCourses from '../components/Acceuil/PopularCourses.jsx'; // Added .jsx
import RaisonsDeRejoindre from '../components/Acceuil/RaisonsDeRejoindre.jsx'; // Added .jsx
import TestimonialsSection from '../components/Acceuil/Temoignages.jsx'; // Added .jsx


export default function WelcomePage() {
  return (
    <div>
      <Hero />
      <PopularCourses />
      <RaisonsDeRejoindre />
      <TestimonialsSection />
      <Partners />
    </div>
  );
}