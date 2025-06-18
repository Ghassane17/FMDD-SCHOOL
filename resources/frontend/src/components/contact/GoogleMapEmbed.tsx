import { MapPin } from "lucide-react"
import React from "react";

const GoogleMapEmbed = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    {/* Header */}
    <div className="bg-gradient-to-r from-blue-50 to-teal-50 px-6 py-4 border-b border-teal-100">
      <h3 className="text-blue-900 font-bold text-xl flex items-center gap-2">
        <MapPin className="w-6 h-6 text-teal-600" />
        Notre localisation
      </h3>
    </div>

    {/* Map Container */}
    <div className="relative">
      <div className="aspect-video min-h-[300px] bg-gray-100">
        <iframe
          title="FMDD Localisation"
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: 300 }}
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106376.56000943462!2d-7.669392718534674!3d33.57240323085691!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7cd4778aa113b%3A0xb06c1d84f310fd3!2sCasablanca!5e0!3m2!1sfr!2sma!4v1750240837115!5m2!1sfr!2sma"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Overlay for better visual integration */}
      <div className="absolute inset-0 pointer-events-none border-4 border-white/20 rounded-b-xl"></div>
    </div>

  </div>
)

export default GoogleMapEmbed


