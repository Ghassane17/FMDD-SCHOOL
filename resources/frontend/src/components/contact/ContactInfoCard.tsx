import { Mail, MapPin, Phone, Clock } from "lucide-react"
import React from "react"

/**
 * Contact information data
 */
const info = [
  {
    icon: MapPin,
    label: "Adresse",
    value: "Hassan II, Casablanca, Maroc",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "contact@fmdd.org",
    href: "mailto:contact@fmdd.org",
  },
  {
    icon: Phone,
    label: "Téléphone",
    value: "+212 5XX-XXXXXX",
    href: "tel:+2125XXXXXXX",
  },
  {
    icon: Clock,
    label: "Horaires",
    value: "Lun.–Ven. 9h–17h",
  },
]

/**
 * ContactInfoCard Component
 */
const ContactInfoCard = () => (
  <div className="bg-white rounded-xl shadow-lg border border-teal-100 overflow-hidden">
    {/* Header */}
    <div className="bg-gradient-to-r from-blue-50 to-teal-50 px-6 py-4 border-b border-teal-100">
      <h3 className="text-blue-900 font-bold text-xl flex items-center gap-2">
        <MapPin className="w-6 h-6 text-teal-600" />
        Coordonnées
      </h3>
    </div>

    {/* Content */}
    <div className="px-6 py-6">
      <ul className="space-y-5">
        {info.map((item, index) => (
          <li
            key={item.label}
            className="flex items-start gap-4 group hover:bg-blue-50 p-3 rounded-lg transition-colors duration-200"
          >
            {/* Icon Container */}
            <div className="bg-teal-100 rounded-full p-3 flex items-center justify-center group-hover:bg-teal-200 transition-colors duration-200 flex-shrink-0">
              <item.icon className="w-5 h-5 text-teal-700" />
            </div>

            {/* Contact Information Content */}
            <div className="flex-1 min-w-0">
              {/* Label/Title */}
              <div className="text-sm font-semibold text-blue-900 mb-1">{item.label}</div>

              {/* Value - Either as link or plain text */}
              {item.href ? (
                <a
                  href={item.href}
                  className="text-sm text-teal-700 hover:text-teal-800 hover:underline transition-colors duration-200 break-words"
                >
                  {item.value}
                </a>
              ) : (
                <div className="text-sm text-gray-700">{item.value}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>

    {/* Footer with additional info */}
    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
      <p className="text-xs text-gray-600 text-center">
        Nous répondons généralement sous 24h pendant les jours ouvrables
      </p>
    </div>
  </div>
)

export default ContactInfoCard
