import React, { useEffect } from "react";
import {
  FaTimes,
  FaCheckCircle,
  FaEnvelope,
  FaGithub,
  FaLinkedinIn,
  FaInstagram,
  FaTwitter,
  FaFacebookF,
} from "react-icons/fa";
import { FiGlobe } from "react-icons/fi";

const SOCIAL_CONFIG = {
  email: { icon: <FaEnvelope />, isEmail: true },
  linkedin: { icon: <FaLinkedinIn /> },
  github: { icon: <FaGithub /> },
  twitter: { icon: <FaTwitter /> },
  instagram: { icon: <FaInstagram /> },
  facebook: { icon: <FaFacebookF /> },
  website: { icon: <FiGlobe /> },
};

export default function TeamMemberModal({ isOpen, onClose, member, links }) {
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen || !member) return null;

  // Merge possible link sources safely
  const socialLinks = links || member.socialLinks || {};

  // Get only links that actually exist
  const socialEntries = Object.entries(SOCIAL_CONFIG).filter(
    ([key]) => socialLinks?.[key],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full md:max-w-125 sm:aspect-5/6 aspect-9/14 rounded-[40px] overflow-hidden shadow-2xl bg-gray-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors cursor-pointer"
        >
          <FaTimes size={18} />
        </button>

        {/* Background Image */}
        <img
          src={member.image}
          alt={member.name}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-[60%] z-10 bg-black/20 backdrop-blur-xl [mask-image:linear-gradient(to_top,black_20%,transparent_100%)]" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 w-full px-8 pb-8 z-10 bg-white/10 text-white">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-semibold tracking-tight">
              {member.name}
            </h2>
            <FaCheckCircle className="text-white text-lg" />
          </div>

          <p className="text-white/90 text-lg capitalize leading-snug mb-4 max-w-[90%]">
            {member.role?.replace("-", " ") || "Team Member"}.
          </p>

          <p className="text-white/80 mb-6">
            {member.bio || "Focused on building meaningful impact."}
          </p>

          {/* Social Section */}
          {socialEntries.length > 0 && (
            <div className="flex gap-3 pt-2">
              {socialEntries.map(([key, config]) => {
                const value = socialLinks[key];

                return (
                  <a
                    key={key}
                    href={config.isEmail ? `mailto:${value}` : value}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-3 cursor-pointer bg-white/10 text-2xl hover:bg-white/20 rounded-full backdrop-blur-md transition-all"
                  >
                    {config.icon}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
