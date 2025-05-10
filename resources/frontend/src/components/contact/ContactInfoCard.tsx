import React from "react";
import { Card, CardContent } from "../ui/card";
import { Mail, MapPin, Phone, Clock } from "lucide-react"; // Added Clock icon for hours

/**
 * Contact information data
 * Each item contains:
 * - icon: Lucide icon component (or null if no icon)
 * - label: Section title/label
 * - value: Contact information text
 * - href: Optional link (for clickable items like email)
 */
const info = [
  {
    icon: MapPin,
    label: "Adresse",
    value: "123 Avenue Mohammed V, Rabat, Maroc"
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "contact@fmdd.org",
    href: "mailto:contact@fmdd.org"
  },
  {
    icon: Phone,
    label: "Téléphone",
    value: "+212 5XX-XXXXXX",
    href: "tel:+2125XXXXXXX" // Added phone link for better UX
  },
  {
    icon: Clock, // Added proper icon instead of null
    label: "Horaires",
    value: "Lun.–Ven. 9h–17h"
  }
];

/**
 * ContactInfoCard Component
 * 
 * A styled card displaying organization contact information
 * with icons, labels, and values in a consistent format
 */
const ContactInfoCard = () => (
  <Card className="shadow-lg bg-gradient-to-br from-brand-blue/5 to-brand-teal/5 border-brand-teal/20 rounded-lg overflow-hidden">
    <CardContent className="px-6 py-6">
      {/* Card Header */}
      <h3 className="text-blue-900 font-bold mb-6 text-xl border-b border-brand-teal/20 pb-2">
        Coordonnées
      </h3>
      
      {/* Contact Information List */}
      <ul className="flex flex-col gap-5">
        {info.map((item, index) => (
          <li 
            className="flex items-start gap-4 group hover:bg-brand-blue/5 p-2 rounded-md transition-colors duration-200" 
            key={item.label}
          >
            {/* Icon Container */}
            {item.icon && (
              <span className="bg-brand-teal/20 rounded-full p-2 flex items-center justify-center group-hover:bg-brand-teal/30 transition-colors duration-200">
                <item.icon size={20} className="text-brand-blue" />
              </span>
            )}
            
            {/* Contact Information Content */}
            <div className="flex-1">
              {/* Label/Title */}
              <div className="text-sm font-medium text-brand-blue mb-1">
                {item.label}
              </div>
              
              {/* Value - Either as link or plain text */}
              {item.href ? (
                <a 
                  href={item.href} 
                  className="block text-sm text-brand-teal hover:underline hover:text-brand-blue transition-colors duration-200 break-all"
                >
                  {item.value}
                </a>
              ) : (
                <div className="text-sm text-blue-900/85">
                  {item.value}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export default ContactInfoCard;