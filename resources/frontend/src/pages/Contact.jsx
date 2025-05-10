
import React from "react";
import ContactForm from "../components/contact/ContactForm";
import ContactInfoCard from "../components/contact/ContactInfoCard";
import GoogleMapEmbed from "../components/contact/GoogleMapEmbed";
import SocialLinks from "../components/contact/SocialLinks";

const Contact = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-brand-teal/10 via-brand-blue/5 to-white pb-0 mb-[-3rem]">
        <div className="container mx-auto px-4 pt-12 pb-10 flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-brand-blue mb-4">Contactez‑nous</h1>
          <p className="text-base md:text-lg text-brand-blue/80 max-w-xl">
            Une question ? Une suggestion ? Nous sommes à votre écoute.
          </p>
        </div>
        {/* Decorative wave shape */}
        <svg className="absolute bottom-0 left-0 w-full" height="72" viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,48 C360,85 1080,9 1440,62 L1440,72 L0,72 Z" fill="#0D47A1" fillOpacity="0.08" />
        </svg>
      </section>
      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col gap-10 md:gap-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2">
            <ContactForm />
          </div>
          <aside className="md:col-span-1 flex flex-col gap-8">
            <ContactInfoCard />
            <GoogleMapEmbed />
            <SocialLinks className="mt-2" />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Contact;
