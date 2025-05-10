
import React from "react";
const GoogleMapEmbed = () => (
  <div className="rounded-xl overflow-hidden shadow-sm mt-3 aspect-video min-h-[140px] bg-gray-100">
    <iframe
      title="FMDD Localisation"
      width="100%"
      height="180"
      style={{ border: 0, minHeight: 140 }}
      src="https://www.google.com/maps?q=Rabat,Maroc&output=embed"
      allowFullScreen
      loading="lazy"
      className="w-full h-full"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  </div>
);
export default GoogleMapEmbed;
