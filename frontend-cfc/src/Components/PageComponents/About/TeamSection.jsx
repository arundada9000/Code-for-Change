import React, { useState } from "react";
import { ALUMNI } from "../../../Data/teamData";
import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import useFetch from "../../../Hooks/useFetch";
import TeamMemberModal from "../../UI/Modal/TeamMemberModal";

const TeamMemberCard = ({ member, type, onSelect }) => {
  const accentColor =
    type === "alumni" ? "#0076B4" : type === "advisor" ? "#0076B4" : "#0076B4";
  const socialIcons = {
    linkedin: <FaLinkedinIn />,
    facebook: <FaFacebookF />,
    instagram: <FaInstagram />,
    github: <FaGithub />,
    youtube: <FaYoutube />,
    twitter: <FaTwitter />,
  };

  const availableSocials = Object.entries(member.socialLinks || {}).filter(
    ([_, url]) => url,
  );

  return (
    <div onClick={() => onSelect?.(member)} className="group relative">
      <div
        className="relative overflow-hidden cursor-pointer rounded-3xl aspect-4/5 mb-6 transition-all duration-500 group-hover:-translate-y-2 border-b-4"
        style={{
          backgroundColor: `${accentColor}05`,
          borderColor: accentColor,
          boxShadow: `0 15px 35px -15px ${accentColor}20`,
        }}
       >
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div
          className="absolute inset-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6"
          style={{
            background: `linear-gradient(to top, ${accentColor}55, transparent)`,
          }}
        >
          <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
            {availableSocials.map(([platform, url], idx) => (
              <a
                key={platform}
                href={url.startsWith("http") ? url : `https://${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md flex items-center justify-center text-primary 
              md:opacity-0 md:-translate-x-12 md:group-hover:opacity-100 md:group-hover:translate-x-0 transition-all duration-500 hover:bg-primary hover:text-white shadow-lg"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {socialIcons[platform] || <FiExternalLink />}
              </a>
            ))}
          </div>
          {member.quote && (
            <p className="text-white text-sm italic font-black leading-relaxed mb-4">
              "{member.quote}"
            </p>
          )}
        </div>
      </div>
      <div className="space-y-1.5 px-2">
        <h4 className="text-xl font-black text-primary tracking-tight group-hover:text-primary transition-colors">
          {member.name}
        </h4>
        <p
          className="text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
          style={{ color: accentColor }}
        >
          {member.designation || member.role}
        </p>
        {member.organization && (
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            {member.organization}
          </p>
        )}
      </div>
    </div>
  );
};

const TeamSection = () => {
  const { data: teamMembers, loading } = useFetch("/team", []);
  const [selectedMember, setSelectedMember] = useState(null);

  const coreTeam = teamMembers?.filter((m) => m.type === "Core Team") || [];
  const advisors = teamMembers?.filter((m) => m.type === "Advisor") || [];
  const boardMembers =
    teamMembers?.filter((m) => m.type === "Board Member") || [];

  if (loading && teamMembers?.length === 0) {
    return (
      <div className="py-20 text-center animate-pulse">
        <div className="h-12 w-48 bg-slate-200 mx-auto rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-15 md:space-y-32 py-10 md:pb-24">
      {/* Dynamic Team Sections */}
      {[
        { title: "Core Team", data: coreTeam, type: "core" },
        { title: "Board Members", data: boardMembers, type: "board" },
        { title: "Advisors", data: advisors, type: "advisor" },
        { title: "Alumni", data: ALUMNI, type: "alumni" },
      ].map(
        (section) =>
          section.data.length > 0 && (
            <section key={section.title} className="space-y-16">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="max-w-2xl">
                  <h2 className="text-5xl md:text-6xl font-black text-primary tracking-tighter mb-6">
                    {section.title.split(" ")[0]}{" "}
                    <span className="text-secondary">
                      {section.title.split(" ").slice(1).join(" ")}
                    </span>
                  </h2>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed">
                    {section.type === "core"
                      ? "The driving force behind Code for Change - a dedicated group of professionals working to bridge the digital gap."
                      : section.type === "advisor"
                        ? "Seasoned experts providing strategic guidance and industry insights."
                        : section.type === "board"
                          ? "Visionary leaders overseeing the organization's growth and impact."
                          : "Those who have helped shape CFC and continue to inspire us."}
                  </p>
                </div>
                <div className="hidden md:block h-0.5 flex-1 bg-slate-100 mx-12 mb-8" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {section.data.map((member, index) => (
                  <TeamMemberCard
                    key={member._id || index}
                    member={member}
                    type={section.type}
                    onSelect={setSelectedMember}
                  />
                ))}
              </div>
              <TeamMemberModal
                isOpen={!!selectedMember}
                member={selectedMember}
                links={selectedMember?.socialLinks}
                onClose={() => setSelectedMember(null)}
              />
            </section>
          ),
      )}
    </div>
  );
};

export default TeamSection;
