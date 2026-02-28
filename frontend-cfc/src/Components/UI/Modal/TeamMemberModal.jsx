import React, { useEffect } from "react";
import {
  FaTimes,
  FaEnvelope,
  FaGithub,
  FaLinkedinIn,
  FaInstagram,
  FaTwitter,
  FaFacebookF,
  FaGraduationCap,
} from "react-icons/fa";
import { FiGlobe } from "react-icons/fi";

/* SOCIAL CONFIG */
const SOCIAL_CONFIG = {
  email: { icon: <FaEnvelope />, label: "Email", isEmail: true },
  linkedin: { icon: <FaLinkedinIn />, label: "LinkedIn" },
  github: { icon: <FaGithub />, label: "GitHub" },
  twitter: { icon: <FaTwitter />, label: "Twitter" },
  instagram: { icon: <FaInstagram />, label: "Instagram" },
  facebook: { icon: <FaFacebookF />, label: "Facebook" },
  website: { icon: <FiGlobe />, label: "Portfolio" },
};

export default function TeamMemberModal({ isOpen, onClose, member }) {
  /* ESC CLOSE */
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT */}
        <div className="w-full md:w-[40%] p-8 flex flex-col items-center border-b md:border-b-0 md:border-r">
          <img
            src={member.image}
            alt={member.name}
            className="w-40 h-40 rounded-2xl object-cover shadow-md"
          />

          <h2 className="mt-6 text-2xl font-bold text-gray-800 text-center">
            {member.name}
          </h2>

          <p className="mt-2 text-sm font-semibold text-gray-500 uppercase">
            {member.position || member.role}
          </p>
        </div>

        {/* RIGHT */}
        <div className="w-full md:w-[60%] p-8 flex flex-col relative">

          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes />
          </button>

          {/* EDUCATION */}
          {member.college && (
            <div className="flex items-center gap-3 text-gray-500 mb-6">
              <FaGraduationCap />
              <span className="text-sm font-semibold">
                {member.college}
              </span>
            </div>
          )}

          {/* BIO */}
          <p className="text-gray-600 leading-relaxed mb-8">
            {member.bio || "No bio available."}
          </p>

          {/* SOCIALS */}
          <div className="flex flex-wrap gap-3 mt-auto">
            {Object.entries(SOCIAL_CONFIG).map(([key, config]) => {
              const value = member[key];
              // if (!value) return null;

              return (
                <a
                  key={key}
                  href={config.isEmail ? `mailto:${value}` : value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-100"
                >
                  {config.icon}
                  {config.label}
                </a>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}