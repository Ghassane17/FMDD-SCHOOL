import React from "react";
import { Facebook, Linkedin, Instagram, Twitter } from "lucide-react"; // Added Twitter icon as an example

/**
 * Social media links configuration
 * Each item contains:
 * - icon: Lucide icon component
 * - label: Platform name (used for accessibility and as unique key)
 * - href: Link to social media profile
 * - color: Optional custom color for icon hover state
 */
const socials = [
  {
    icon: Facebook,
    label: "Facebook",
    href: "#",
    color: "#1877F2" // Facebook blue
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "#",
    color: "#0A66C2" // LinkedIn blue
  },
  {
    icon: Instagram,
    label: "Instagram",
    href: "#",
    color: "#E4405F" // Instagram pink/red
  },
  {
    icon: Twitter,
    label: "Twitter",
    href: "#",
    color: "#1DA1F2" // Twitter blue
  }
];

/**
 * SocialLinks Component
 * 
 * Displays a row of social media icon links with hover effects
 * 
 * @param {Object} props - Component props
 * @param {string} props.className - Optional additional CSS classes
 * @param {string} props.iconSize - Optional icon size (defaults to 22)
 * @param {boolean} props.showLabels - Optional flag to show text labels (defaults to false)
 * @returns {JSX.Element} - Rendered component
 */
const SocialLinks = ({ 
  className,
  iconSize = 22,
  showLabels = false
}) => (
  <div className={`flex items-center gap-4 ${className ?? ""}`}>
    {socials.map(({ icon: Icon, label, href, color }) => (
      <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="flex items-center gap-2 bg-brand-teal/10 hover:bg-brand-teal/20 rounded-full p-2 
                 transition-all duration-300 transform hover:scale-110 hover:shadow-md
                 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-opacity-50"
        style={{ "--hover-color": color }} // Custom property for hover effect
      >
        {/* Icon with dynamic size */}
        <Icon 
          className="text-brand-blue group-hover:text-[var(--hover-color)]" 
          size={iconSize}
          aria-hidden="true"
        />
        
        {/* Optional text label */}
        {showLabels && (
          <span className="text-sm font-medium pr-2 text-brand-blue">
            {label}
          </span>
        )}
      </a>
    ))}
  </div>
);

export default SocialLinks;
